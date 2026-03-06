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
    const { token } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ error: "Token required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: proposal, error } = await supabase
      .from("proposals")
      .select("id, client_name, service_type, total_price_formatted, status, branding, user_id")
      .eq("public_token", token)
      .single();

    if (error || !proposal) {
      return new Response(JSON.stringify({ error: "Proposal not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch branding settings for logo and colors
    let logoUrl = null;
    let primaryColor = null;
    let accentColor = null;
    if (proposal.user_id) {
      const { data: branding } = await supabase
        .from("branding_settings")
        .select("logo_url, primary_color, accent_color")
        .eq("user_id", proposal.user_id)
        .maybeSingle();
      if (branding) {
        logoUrl = branding.logo_url;
        primaryColor = branding.primary_color;
        accentColor = branding.accent_color;
      }
    }

    return new Response(JSON.stringify({
      client_name: proposal.client_name,
      service_type: proposal.service_type,
      total_price_formatted: proposal.total_price_formatted,
      status: proposal.status,
      business_name: (proposal.branding as any)?.businessName || "",
      logo_url: logoUrl,
      primary_color: primaryColor,
      accent_color: accentColor,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("get-proposal-by-token error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
