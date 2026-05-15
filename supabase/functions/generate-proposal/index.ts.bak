import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const toneMap: Record<string, string> = {
  standard: "Use a professional, clear, and straightforward tone.",
  friendly: "Use a warm, approachable, and customer-friendly tone.",
  premium: "Use a polished, confident, and high-end professional tone.",
  luxury:
    "Use an elite, refined, and white-glove service tone designed for high-end clients and premium service providers.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      clientName, clientEmail, serviceAddress, serviceType, serviceLabel,
      jobDescription, totalPrice, timeline,
      businessName, businessPhone, businessEmail,
      tone, licensedInsured, satisfactionGuarantee,
      conditionalFields,
      defaultScopeBullets,
    } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const conditionalDetails = Object.entries(conditionalFields || {})
      .filter(([, v]) => v !== "" && v !== false && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0))
      .map(([k, v]) => `- ${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join("\n");

    const systemPrompt = `You are a professional proposal writer for service businesses. Generate a concise, client-ready service proposal. Do NOT invent credentials or guarantees not provided. Keep it professional and ready to send.

${toneMap[tone] || toneMap.standard}

Structure the proposal exactly as follows:
1. Title: "Service Proposal" 
2. Prepared for: Client name and address
3. Prepared by: Business name, phone, email${licensedInsured ? " — Include 'Licensed & Insured'" : ""}
4. Scope of Work — Describe the services based on the details provided
5. Timeline / Scheduling
6. Investment — Show the total price
7. Terms — Simple, professional, non-legal terms
${satisfactionGuarantee ? "8. Satisfaction Guarantee — Include a professional satisfaction guarantee statement" : ""}
${satisfactionGuarantee ? "9" : "8"}. Next Steps — How to accept and get started`;

    const userPrompt = `Generate a proposal for:

Service Type: ${serviceLabel || serviceType}
Client: ${clientName}${clientEmail ? ` (${clientEmail})` : ""}
Address: ${serviceAddress}
Job Description: ${jobDescription}
Price: ${totalPrice}
Timeline: ${timeline}
Business: ${businessName}, ${businessPhone}, ${businessEmail}
${defaultScopeBullets && defaultScopeBullets.length > 0 ? `\nDefault Scope of Work Bullets (use as starting point, expand with job description):\n${defaultScopeBullets.map((b: string) => `- ${b}`).join("\n")}` : ""}
${conditionalDetails ? `\nAdditional Details:\n${conditionalDetails}` : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const proposal = data.choices?.[0]?.message?.content || "Failed to generate proposal.";

    return new Response(JSON.stringify({ proposal }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
