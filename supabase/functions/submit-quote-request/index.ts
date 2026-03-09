import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, clientName, clientEmail, clientPhone, serviceType, propertyAddress, projectDescription } = await req.json();

    if (!username || !clientName || !clientEmail || !serviceType || !propertyAddress || !projectDescription) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to bypass RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up the user by username
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("user_id, business_name, first_name, last_name")
      .eq("username", username)
      .maybeSingle();

    if (profileErr || !profile) {
      return new Response(JSON.stringify({ error: "Business not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get branding for the user
    const { data: branding } = await supabase
      .from("branding_settings")
      .select("logo_url, primary_color, accent_color")
      .eq("user_id", profile.user_id)
      .maybeSingle();

    // Create draft proposal
    const { data: proposal, error: proposalErr } = await supabase
      .from("proposals")
      .insert({
        user_id: profile.user_id,
        client_name: clientName,
        client_email: clientEmail,
        service_type: serviceType,
        service_address: propertyAddress,
        job_description: projectDescription,
        total_price_formatted: "$0.00",
        total_price_number: 0,
        tone: "standard",
        proposal_text: "",
        status: "draft",
        branding: {
          businessName: profile.business_name,
          logoDataUrl: branding?.logo_url || null,
          primaryColor: branding?.primary_color || null,
        },
      })
      .select("id")
      .single();

    if (proposalErr) {
      console.error("Proposal creation error:", proposalErr);
      return new Response(JSON.stringify({ error: "Failed to create proposal" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save quote request
    await supabase.from("quote_requests").insert({
      user_id: profile.user_id,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone || null,
      service_type: serviceType,
      property_address: propertyAddress,
      project_description: projectDescription,
      proposal_id: proposal.id,
    });

    // Send notification email to the user
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      // Get user email from auth
      const { data: authUser } = await supabase.auth.admin.getUserById(profile.user_id);
      const userEmail = authUser?.user?.email;

      if (userEmail) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "JetQuote <info@jet-quote.com>",
            to: [userEmail],
            subject: "New Quote Request Received",
            text: `You have received a new quote request.\n\nClient: ${clientName}\nEmail: ${clientEmail}${clientPhone ? `\nPhone: ${clientPhone}` : ""}\nService: ${serviceType}\nAddress: ${propertyAddress}\n\nProject Description:\n${projectDescription}\n\nA draft proposal has been created in your JetQuote dashboard.`,
          }),
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("submit-quote-request error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
