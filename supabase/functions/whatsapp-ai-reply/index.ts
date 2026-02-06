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
    const { lead_id, message_content, auto_reply_enabled } = await req.json();

    if (!lead_id || !message_content) {
      return new Response(
        JSON.stringify({ error: "Missing lead_id or message_content" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get lead info
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single();

    if (leadError || !lead) {
      throw new Error("Lead not found");
    }

    // Get user settings for AI context
    const { data: settings } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", lead.user_id)
      .single();

    if (!auto_reply_enabled && !settings?.auto_prospecting_enabled) {
      return new Response(
        JSON.stringify({ success: false, reason: "Auto-reply disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get conversation history
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("lead_id", lead_id)
      .order("sent_at", { ascending: true })
      .limit(20);

    // Build conversation context
    const conversationHistory = (messages || [])
      .map((m) => `${m.sender_type === "lead" ? "Cliente" : "Você"}: ${m.content}`)
      .join("\n");

    // Build AI prompt
    const systemPrompt = `Você é ${settings?.agent_name || "um assistente de vendas"} da empresa.
${settings?.agent_persona || "Você é prestativo, profissional e amigável."}

Base de conhecimento:
${settings?.knowledge_base || "Oferecemos serviços de qualidade para empresas."}

Serviços oferecidos: ${settings?.services_offered?.join(", ") || "Serviços diversos"}

Informações do lead:
- Empresa: ${lead.business_name}
- Nicho: ${lead.niche || "Não especificado"}
- Localização: ${lead.location || "Não especificada"}
- Estágio: ${lead.stage}
${lead.pain_points ? `- Dores identificadas: ${lead.pain_points.join(", ")}` : ""}
${lead.analyzed_needs ? `- Necessidades: ${JSON.stringify(lead.analyzed_needs)}` : ""}

Estilo de comunicação: ${settings?.communication_style || "Profissional e amigável"}
Uso de emojis: ${settings?.emoji_usage || "moderado"}
Comprimento de resposta: ${settings?.response_length || "média"}

REGRAS:
1. Responda de forma natural e contextual
2. Não invente informações sobre preços ou serviços não mencionados
3. Se não souber algo, ofereça conectar com um especialista
4. Se o cliente quiser agendar, pergunte disponibilidade
5. Sempre busque avançar a conversa para uma reunião ou venda`;

    const userPrompt = `Histórico da conversa:
${conversationHistory}

Nova mensagem do cliente: ${message_content}

Responda de forma natural e apropriada:`;

    // Call Gemini AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aiResponse = await fetch(
      "https://api.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.0-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error("Failed to generate AI response");
    }

    const aiData = await aiResponse.json();
    const generatedReply = aiData.choices?.[0]?.message?.content || "";

    if (!generatedReply) {
      throw new Error("Empty AI response");
    }

    console.log(`Generated AI reply for lead ${lead_id}: ${generatedReply.slice(0, 100)}...`);

    // Determine if we should send automatically or just suggest
    const shouldAutoSend = settings?.auto_prospecting_enabled && auto_reply_enabled;

    if (shouldAutoSend && settings?.whatsapp_instance_id) {
      // Send the message via WhatsApp
      const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
      const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");

      if (EVOLUTION_API_URL && EVOLUTION_API_KEY) {
        let formattedPhone = lead.phone.replace(/\D/g, "");
        if (!formattedPhone.startsWith("55") && formattedPhone.length <= 11) {
          formattedPhone = "55" + formattedPhone;
        }

        const sendResponse = await fetch(
          `${EVOLUTION_API_URL}/message/sendText/${settings.whatsapp_instance_id}`,
          {
            method: "POST",
            headers: {
              apikey: EVOLUTION_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              number: formattedPhone,
              text: generatedReply,
            }),
          }
        );

        if (sendResponse.ok) {
          // Save the sent message
          await supabase.from("chat_messages").insert({
            lead_id,
            content: generatedReply,
            sender_type: "agent",
            status: "sent",
          });

          // Update lead's last contact
          await supabase
            .from("leads")
            .update({ last_contact_at: new Date().toISOString() })
            .eq("id", lead_id);

          return new Response(
            JSON.stringify({
              success: true,
              action: "sent",
              reply: generatedReply,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Return the suggested reply (not auto-sent)
    return new Response(
      JSON.stringify({
        success: true,
        action: "suggested",
        reply: generatedReply,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI reply error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate reply" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
