import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Intelligent follow-up message templates based on context
const FOLLOW_UP_STRATEGIES = {
  // Day 1-2: Quick check-in
  early: [
    "Oi {empresa}! Vi que você ficou atolado(a), né? 😅 Sem pressa! Qualquer dúvida, tô por aqui!",
    "E aí, {empresa}! Conseguiu dar uma olhada no que conversamos? Posso te ajudar com alguma coisa?",
    "Opa! Passando rapidinho pra ver se surgiu alguma dúvida. Tô à disposição! 🙋",
  ],
  // Day 3-5: Value reminder
  mid: [
    "Oi {empresa}! Lembrei de você porque vi um case parecido com o seu. Empresas do segmento de {nicho} têm conseguido resultados incríveis. Bora conversar?",
    "{empresa}, tava pensando aqui... muita gente do seu setor enfrenta {dor_comum}. A gente pode resolver isso junto! Que tal um papo rápido?",
    "Ei {empresa}! Passando pra lembrar que tenho alguns horários essa semana. 15 minutinhos podem fazer diferença pro seu negócio! 🚀",
  ],
  // Day 7+: Last attempt
  late: [
    "{empresa}, última tentativa! 😊 Se não for o momento, tudo bem. Mas se quiser bater um papo sobre {beneficio}, me chama!",
    "Oi {empresa}! Sei que a rotina é corrida. Se mudar de ideia sobre {solucao}, estarei por aqui. Sucesso! 💪",
    "{empresa}, não quero ser chato(a), prometo! Só queria saber se posso ajudar de alguma forma. Qualquer coisa, é só chamar!",
  ],
  // Re-engagement after long silence
  reengagement: [
    "Oi {empresa}! Faz um tempinho que a gente conversou. Como estão as coisas por aí? Surgiu alguma novidade?",
    "{empresa}! Passando pra dar um oi e ver se posso ajudar com algo. Tivemos novidades que podem te interessar!",
    "E aí, {empresa}! Lembrei de você hoje. Como está o negócio? Bora tomar um café virtual? ☕",
  ],
};

// Common pain points by niche
const NICHE_PAIN_POINTS: Record<string, string> = {
  "Restaurantes": "dificuldade em atrair clientes nos dias de semana",
  "Salões de Beleza": "desafio de fidelizar clientes e preencher horários vagos",
  "Academias": "problema com retenção de alunos depois dos primeiros meses",
  "Clínicas Médicas": "agenda cheia de buracos e no-shows",
  "Imobiliárias": "leads frios que não respondem",
  "Pet Shops": "concorrência dos grandes marketplaces",
  "Escritórios de Advocacia": "dificuldade em captar clientes qualificados",
  "default": "desafio de crescer no mercado atual",
};

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function personalizeMessage(template: string, lead: any, settings: any): string {
  const niche = lead.niche || "seu segmento";
  const painPoint = NICHE_PAIN_POINTS[niche] || NICHE_PAIN_POINTS.default;
  
  return template
    .replace(/{empresa}/g, lead.business_name)
    .replace(/{nicho}/g, niche)
    .replace(/{dor_comum}/g, painPoint)
    .replace(/{beneficio}/g, "crescer seu negócio")
    .replace(/{solucao}/g, (settings.services_offered || ["nossas soluções"])[0]);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
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
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = settings.user_id;
    console.log(`Follow-up agent started for user: ${userId}`);

    const now = new Date();
    const results = {
      checked: 0,
      sent: 0,
      skipped: 0,
      errors: 0,
      leads: [] as any[],
    };

    // Find leads that need follow-up
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", userId)
      .in("stage", ["Contato", "Qualificado", "Proposta", "Negociação"])
      .order("last_contact_at", { ascending: true });

    if (leadsError) throw new Error("Failed to fetch leads");

    // Check if WhatsApp is connected
    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
    const canSendWhatsApp = settings.whatsapp_connected && 
                            settings.whatsapp_instance_id && 
                            EVOLUTION_API_URL && 
                            EVOLUTION_API_KEY;

    // Get AI key for intelligent messages
    const DEEPSEEK_API_KEY = settings.deepseek_api_key || Deno.env.get("DEEPSEEK_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const AI_KEY = DEEPSEEK_API_KEY || LOVABLE_API_KEY;

    for (const lead of leads || []) {
      results.checked++;

      // Skip if lead responded after our last message
      if (lead.last_response_at) {
        const lastResponse = new Date(lead.last_response_at);
        const lastContact = new Date(lead.last_contact_at || lead.created_at);
        if (lastResponse > lastContact) {
          results.skipped++;
          continue; // Lead responded, skip
        }
      }

      // Calculate days since last contact
      const lastContact = new Date(lead.last_contact_at || lead.created_at);
      const daysSinceContact = Math.floor(
        (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Skip if too recent (less than 1 day)
      if (daysSinceContact < 1) {
        results.skipped++;
        continue;
      }

      // Skip if max follow-ups reached
      const followUpCount = lead.follow_up_count || 0;
      if (followUpCount >= 5) {
        console.log(`Lead ${lead.id} reached max follow-ups, marking as cold`);
        await supabase
          .from("leads")
          .update({ temperature: "frio" })
          .eq("id", lead.id);
        results.skipped++;
        continue;
      }

      // Determine follow-up strategy based on days and count
      let strategy: keyof typeof FOLLOW_UP_STRATEGIES;
      if (daysSinceContact <= 2) {
        strategy = "early";
      } else if (daysSinceContact <= 5) {
        strategy = "mid";
      } else if (daysSinceContact <= 14) {
        strategy = "late";
      } else {
        strategy = "reengagement";
      }

      // Check if we should follow up based on cadence
      const followUpDays = [1, 3, 5, 7, 14];
      if (!followUpDays.some(d => daysSinceContact >= d && daysSinceContact < d + 1)) {
        // Not in a follow-up window
        if (daysSinceContact < 14) {
          results.skipped++;
          continue;
        }
      }

      // Get chat history for context
      const { data: chatHistory } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("lead_id", lead.id)
        .order("sent_at", { ascending: false })
        .limit(5);

      let followUpMessage = "";

      // Try to generate intelligent message with AI
      if (AI_KEY && chatHistory && chatHistory.length > 0) {
        try {
          const lastMessages = chatHistory
            .reverse()
            .map(m => `${m.sender_type === "lead" ? "Cliente" : "Eu"}: ${m.content}`)
            .join("\n");

          const prompt = `Você é ${settings.agent_name || "um consultor de vendas"}.
${settings.agent_persona || ""}

O cliente ${lead.business_name} (${lead.niche || "negócio"}) não responde há ${daysSinceContact} dias.
Já foram feitos ${followUpCount} follow-ups anteriores.

Últimas mensagens:
${lastMessages}

Crie uma mensagem de follow-up CURTA (2-3 frases) que:
1. Seja natural e não pareça automática
2. NÃO repita abordagens anteriores
3. Traga algo novo ou diferente
4. Termine com uma pergunta simples
5. Use ${settings.emoji_usage === "frequente" ? "alguns emojis" : settings.emoji_usage === "moderado" ? "1-2 emojis" : "sem emojis"}

Responda APENAS com a mensagem.`;

          if (LOVABLE_API_KEY) {
            const aiResponse = await fetch(
              "https://ai.gateway.lovable.dev/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${LOVABLE_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                   model: "google/gemini-2.5-flash",
                  messages: [{ role: "user", content: prompt }],
                  temperature: 0.9,
                }),
              }
            );

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              followUpMessage = aiData.choices?.[0]?.message?.content || "";
            }
          }
        } catch (e) {
          console.error("AI follow-up error:", e);
        }
      }

      // Fallback to template if AI failed
      if (!followUpMessage) {
        const templates = FOLLOW_UP_STRATEGIES[strategy];
        followUpMessage = personalizeMessage(getRandomItem(templates), lead, settings);
      }

      // Save follow-up message
      await supabase.from("chat_messages").insert({
        lead_id: lead.id,
        sender_type: "agent",
        content: followUpMessage,
        status: "pending",
      });

      // Send via WhatsApp if connected
      if (canSendWhatsApp) {
        try {
          let formattedPhone = lead.phone.replace(/\D/g, "");
          if (!formattedPhone.startsWith("55") && formattedPhone.length <= 11) {
            formattedPhone = "55" + formattedPhone;
          }

          // Random delay between messages (30-90 seconds)
          if (results.sent > 0) {
            const delay = Math.floor(Math.random() * 60000) + 30000;
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          const sendResponse = await fetch(
            `${EVOLUTION_API_URL}/message/sendText/${settings.whatsapp_instance_id}`,
            {
              method: "POST",
              headers: {
                "apikey": EVOLUTION_API_KEY!,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                number: formattedPhone,
                text: followUpMessage,
              }),
            }
          );

          if (sendResponse.ok) {
            console.log(`Follow-up sent to ${lead.business_name} (${lead.phone})`);
            
            await supabase
              .from("chat_messages")
              .update({ status: "sent" })
              .eq("lead_id", lead.id)
              .eq("content", followUpMessage);
          } else {
            console.error(`Failed to send to ${lead.phone}`);
            results.errors++;
          }
        } catch (e) {
          console.error("WhatsApp error:", e);
          results.errors++;
        }
      } else {
        console.log(`Would send to ${lead.phone}: ${followUpMessage.substring(0, 50)}...`);
      }

      // Update lead
      await supabase
        .from("leads")
        .update({
          last_contact_at: now.toISOString(),
          follow_up_count: followUpCount + 1,
          next_follow_up_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", lead.id);

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: userId,
        lead_id: lead.id,
        activity_type: "follow_up_sent",
        description: `Follow-up #${followUpCount + 1} (${strategy}) enviado após ${daysSinceContact} dias`,
        metadata: { days_since_contact: daysSinceContact, strategy },
      });

      results.sent++;
      results.leads.push({
        id: lead.id,
        business_name: lead.business_name,
        days_since_contact: daysSinceContact,
        follow_up_number: followUpCount + 1,
      });

      // Limit to 10 follow-ups per run to avoid rate limits
      if (results.sent >= 10) {
        console.log("Reached max follow-ups per run (10)");
        break;
      }
    }

    console.log(`Follow-up completed: ${results.sent} sent, ${results.skipped} skipped, ${results.errors} errors`);

    return new Response(JSON.stringify({
      success: true,
      ...results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Follow-up error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
