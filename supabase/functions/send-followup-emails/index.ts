import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse optional body for manual single-proposal trigger
    let manualProposalId: string | null = null;
    try {
      if (req.method === "POST") {
        const body = await req.json().catch(() => null);
        if (body && typeof body.proposalId === "string") {
          manualProposalId = body.proposalId;
        }
      }
    } catch (_e) {
      // ignore body parse errors
    }

    // Find eligible proposals
    const now = new Date().toISOString();
    let query = supabase
      .from("proposals")
      .select("id, client_name, client_email, public_token, user_id, branding, followup_sent_at, status, accepted_at, declined_at")
      .not("client_email", "is", null)
      .eq("status", "sent")
      .is("accepted_at", null)
      .is("declined_at", null);

    if (manualProposalId) {
      // Manual trigger: still requires sent + not responded + has email,
      // but bypasses schedule and the once-only rule (allows resend).
      query = query.eq("id", manualProposalId);
    } else {
      // Scheduled (cron) trigger: only un-sent, eligible, due proposals
      query = query
        .eq("followup_enabled", true)
        .is("followup_sent_at", null)
        .not("followup_scheduled_for", "is", null)
        .lte("followup_scheduled_for", now);
    }

    const { data: proposals, error: fetchErr } = await query;

    if (fetchErr) {
      console.error("Fetch error:", fetchErr);
      return new Response(JSON.stringify({ error: fetchErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!proposals || proposals.length === 0) {
      if (!manualProposalId) {
        await supabase.from("system_events").insert({
          event_type: "cron_run",
          event_source: "send-followup-emails",
          metadata: {
            processed_count: 0,
            sent_count: 0,
            skipped_count: 0,
            result: "success",
            message: "No follow-ups due",
          },
        });
      }
      return new Response(JSON.stringify({ sent: 0, processed: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get unique user IDs to fetch profiles
    const userIds = [...new Set(proposals.map((p: any) => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, business_name, business_phone")
      .in("user_id", userIds);

    const profileMap: Record<string, any> = {};
    if (profiles) {
      for (const prof of profiles) {
        profileMap[prof.user_id] = prof;
      }
    }

    // Get branding settings for business email
    const { data: brandings } = await supabase
      .from("branding_settings")
      .select("user_id")
      .in("user_id", userIds);

    let sentCount = 0;
    const baseUrl = Deno.env.get("SUPABASE_URL")!.replace("/rest/v1", "").replace("https://", "");
    // We need the frontend URL - derive from function URL or use a known pattern
    // The response URL should use the same origin as the original proposal

    for (const p of proposals) {
      try {
        const profile = profileMap[p.user_id] || {};
        const businessName = profile.business_name || p.branding?.businessName || "Our Company";
        const userName = profile.full_name || businessName;
        const businessEmail = p.branding?.businessEmail || "";

        // Single source of truth for the app's base URL
        const siteUrl = (Deno.env.get("APP_BASE_URL") || Deno.env.get("SITE_URL") || "https://jetquote.vercel.app").replace(/\/+$/, "");
        const responseUrl = `${siteUrl}/proposal/respond/${p.public_token}`;

        const subject = `Quick follow-up on your proposal from ${businessName}`;
        const contactLine = businessEmail
          ? `\nTo contact us, email ${businessEmail}`
          : "";
        const body = `Hello ${p.client_name},

Just checking in — I wanted to see if you had a chance to review the proposal.

Accept/Decline Proposal Here:
${responseUrl}
${contactLine}

If you have any questions, we'll help right away.

Thank you,
${userName}
${businessName}`;

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "JetQuote <info@jet-quote.com>",
            to: [p.client_email],
            subject,
            text: body,
          }),
        });

        if (!emailRes.ok) {
          const errData = await emailRes.json();
          console.error(`Failed to send follow-up for ${p.id}:`, errData);
          continue;
        }

        // Mark as sent
        await supabase
          .from("proposals")
          .update({
            followup_sent_at: new Date().toISOString(),
            followup_email_subject: subject,
            followup_email_body: body,
          })
          .eq("id", p.id);

        sentCount++;
        await supabase.from("system_events").insert({
          event_type: "followup_sent",
          event_source: manualProposalId ? "manual" : "cron",
          user_id: p.user_id,
          proposal_id: p.id,
          metadata: { to: p.client_email },
        });
        await supabase.from("system_events").insert({
          event_type: "email_sent",
          event_source: "followup",
          user_id: p.user_id,
          proposal_id: p.id,
          metadata: { email_type: "followup", to: p.client_email },
        });
      } catch (e) {
        console.error(`Error processing follow-up for ${p.id}:`, e);
        await supabase.from("system_events").insert({
          event_type: "error",
          event_source: "send-followup-emails",
          user_id: p.user_id,
          proposal_id: p.id,
          metadata: { context: "send_followup", message: e instanceof Error ? e.message : String(e) },
        });
      }
    }

    // Log cron run summary (only for scheduled invocations)
    if (!manualProposalId) {
      await supabase.from("system_events").insert({
        event_type: "cron_run",
        event_source: "send-followup-emails",
        metadata: {
          processed_count: proposals.length,
          sent_count: sentCount,
          skipped_count: proposals.length - sentCount,
          result: "success",
          message: `Processed ${proposals.length} due follow-ups, sent ${sentCount}`,
        },
      });
    }

    return new Response(JSON.stringify({ sent: sentCount }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("send-followup-emails error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    try {
      const sb = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await sb.from("system_events").insert({
        event_type: "error",
        event_source: "send-followup-emails",
        metadata: { context: "top_level", message: msg },
      });
      await sb.from("system_events").insert({
        event_type: "cron_run",
        event_source: "send-followup-emails",
        metadata: { result: "fail", message: msg },
      });
    } catch (_e) { /* ignore */ }
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
