import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify Bearer token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find user by hunter_api_token
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("*")
      .eq("hunter_api_token", token)
      .single();

    if (settingsError || !settings) {
      console.error("Invalid token or user not found:", settingsError);
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = settings.user_id;
    console.log(`Follow-up agent started for user: ${userId}`);

    // Follow-up cadence: 3, 7, 15 days
    const cadenceDays = [3, 7, 15];
    const now = new Date();

    // Find leads that need follow-up
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", userId)
      .in("stage", ["Contato", "Qualificado", "Proposta", "Negociação"])
      .not("temperature", "eq", "frio")
      .order("last_contact_at", { ascending: true });

    if (leadsError) {
      console.error("Error fetching leads:", leadsError);
      throw new Error("Failed to fetch leads");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const followedUpLeads = [];

    for (const lead of leads || []) {
      // Check if lead hasn't responded
      if (lead.last_response_at && new Date(lead.last_response_at) > new Date(lead.last_contact_at)) {
        continue; // Lead responded after our last message, skip
      }

      const lastContact = new Date(lead.last_contact_at || lead.created_at);
      const daysSinceContact = Math.floor(
        (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check if we should follow up based on cadence
      const shouldFollowUp = cadenceDays.includes(daysSinceContact);
      if (!shouldFollowUp) continue;

      // Check follow-up count to avoid spamming
      if (lead.follow_up_count >= 3) {
        console.log(`Lead ${lead.id} has reached max follow-ups`);
        continue;
      }

      // Get chat history for context
      const { data: chatHistory } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("lead_id", lead.id)
        .order("sent_at", { ascending: false })
        .limit(5);

      const lastMessages = (chatHistory || [])
        .reverse()
        .map((m) => `${m.sender_type === "lead" ? "Lead" : "Agente"}: ${m.content}`)
        .join("\n");

      // Generate contextual follow-up message
      const aiResponse = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `Você é ${settings.agent_name}, um consultor de vendas.
${settings.agent_persona}

Você precisa enviar uma mensagem de follow-up para um lead que não respondeu há ${daysSinceContact} dias.

INFORMAÇÕES DO LEAD:
- Empresa: ${lead.business_name}
- Nicho: ${lead.niche || "Não especificado"}
- Número de follow-ups anteriores: ${lead.follow_up_count}

ÚLTIMAS MENSAGENS:
${lastMessages}

REGRAS:
1. Seja gentil mas direto
2. Não repita a mesma abordagem - tente um ângulo diferente
3. Mencione algo novo ou um benefício específico
4. Mantenha a mensagem curta (2-3 frases)
5. Termine com uma pergunta simples

Responda APENAS com a mensagem, sem explicações.`,
              },
            ],
          }),
        }
      );

      if (!aiResponse.ok) {
        console.error("AI error for lead", lead.id);
        continue;
      }

      const aiData = await aiResponse.json();
      const followUpMessage = aiData.choices?.[0]?.message?.content || "";

      if (!followUpMessage) continue;

      // Save follow-up message
      await supabase.from("chat_messages").insert({
        lead_id: lead.id,
        sender_type: "agent",
        content: followUpMessage,
        status: "sent",
      });

      // Update lead
      await supabase
        .from("leads")
        .update({
          last_contact_at: now.toISOString(),
          follow_up_count: (lead.follow_up_count || 0) + 1,
          next_follow_up_at: new Date(
            now.getTime() + cadenceDays[Math.min(lead.follow_up_count, 2)] * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .eq("id", lead.id);

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: userId,
        lead_id: lead.id,
        activity_type: "follow_up_sent",
        description: `Follow-up #${(lead.follow_up_count || 0) + 1} enviado`,
        metadata: { days_since_contact: daysSinceContact },
      });

      followedUpLeads.push({
        id: lead.id,
        business_name: lead.business_name,
        days_since_contact: daysSinceContact,
      });

      // TODO: Send WhatsApp message
      console.log(`Would send follow-up to ${lead.phone}: ${followUpMessage}`);
    }

    console.log(`Follow-up agent completed. Sent ${followedUpLeads.length} follow-ups.`);

    return new Response(
      JSON.stringify({
        success: true,
        follow_ups_sent: followedUpLeads.length,
        leads: followedUpLeads,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Follow-up agent error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
