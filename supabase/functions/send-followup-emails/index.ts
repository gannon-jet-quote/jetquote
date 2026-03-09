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

    // Find eligible proposals
    const now = new Date().toISOString();
    const { data: proposals, error: fetchErr } = await supabase
      .from("proposals")
      .select("id, client_name, client_email, public_token, user_id, branding")
      .eq("status", "sent")
      .eq("followup_enabled", true)
      .is("followup_sent_at", null)
      .not("followup_scheduled_for", "is", null)
      .not("client_email", "is", null)
      .lte("followup_scheduled_for", now);

    if (fetchErr) {
      console.error("Fetch error:", fetchErr);
      return new Response(JSON.stringify({ error: fetchErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!proposals || proposals.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
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

        // Use the SITE_URL secret or fallback
        const siteUrl = Deno.env.get("SITE_URL") || "https://jet-quote.com";
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
      } catch (e) {
        console.error(`Error processing follow-up for ${p.id}:`, e);
      }
    }

    return new Response(JSON.stringify({ sent: sentCount }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("send-followup-emails error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
