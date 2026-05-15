import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, action } = await req.json();

    if (!token || !["accept", "decline"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch proposal by token
    const { data: proposal, error: fetchErr } = await supabase
      .from("proposals")
      .select("id, status, client_name, service_type, total_price_formatted, user_id")
      .eq("public_token", token)
      .single();

    if (fetchErr || !proposal) {
      return new Response(JSON.stringify({ error: "Proposal not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prevent duplicate responses
    if (proposal.status === "accepted" || proposal.status === "declined") {
      return new Response(JSON.stringify({ error: "already_responded", status: proposal.status }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date().toISOString();
    const newStatus = action === "accept" ? "accepted" : "declined";

    const updateData: Record<string, any> = {
      status: newStatus,
      responded_at: now,
    };
    if (action === "accept") {
      updateData.accepted_at = now;
    } else {
      updateData.declined_at = now;
    }

    const { error: updateErr } = await supabase
      .from("proposals")
      .update(updateData)
      .eq("id", proposal.id);

    if (updateErr) {
      console.error("Update error:", updateErr);
      await supabase.from("system_events").insert({
        event_type: "error",
        event_source: "proposal-respond",
        proposal_id: proposal.id,
        metadata: { context: "update_proposal", message: updateErr.message },
      });
      return new Response(JSON.stringify({ error: "Failed to update proposal" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log accept/decline event
    await supabase.from("system_events").insert({
      event_type: action === "accept" ? "proposal_accepted" : "proposal_declined",
      event_source: "client_response",
      user_id: proposal.user_id,
      proposal_id: proposal.id,
      metadata: { client_name: proposal.client_name },
    });

    // Send notification email to user
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, business_name, business_phone")
        .eq("user_id", proposal.user_id)
        .single();

      const { data: branding } = await supabase
        .from("branding_settings")
        .select("*")
        .eq("user_id", proposal.user_id)
        .single();

      // Get user email from auth
      const { data: { user } } = await supabase.auth.admin.getUserById(proposal.user_id);
      const userEmail = user?.email;

      if (userEmail) {
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (RESEND_API_KEY) {
          const userName = profile?.full_name || profile?.business_name || "there";
          const statusWord = newStatus === "accepted" ? "Accepted" : "Declined";

          const subject = `Proposal ${statusWord} by ${proposal.client_name}`;
          const body = `Hello ${userName},\n\nYour client ${proposal.client_name} has ${newStatus} the proposal for ${proposal.service_type}.\n\nProposal amount: ${proposal.total_price_formatted}\n\nYou can view the updated status in your JetQuote dashboard.`;

          const notifyRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "JetQuote <info@jet-quote.com>",
              to: [userEmail],
              subject,
              text: body,
            }),
          });
          if (notifyRes.ok) {
            await supabase.from("system_events").insert({
              event_type: "email_sent",
              event_source: "proposal_response_notification",
              user_id: proposal.user_id,
              proposal_id: proposal.id,
              metadata: { email_type: "response_notification", to: userEmail },
            });
          }
        }
      }
    } catch (emailErr) {
      console.error("Email notification error:", emailErr);
      await supabase.from("system_events").insert({
        event_type: "error",
        event_source: "proposal-respond",
        proposal_id: proposal.id,
        metadata: { context: "notification_email", message: emailErr instanceof Error ? emailErr.message : String(emailErr) },
      });
    }

    return new Response(JSON.stringify({ success: true, status: newStatus }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("proposal-respond error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
