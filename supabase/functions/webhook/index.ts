import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Build comprehensive personality and behavior prompt
function buildAgentPrompt(settings: any, lead: any, conversationContext: any): string {
  const agentTypeDescriptions: Record<string, string> = {
    consultivo: "Você é um consultor que busca entender profundamente as necessidades antes de propor soluções. Faça perguntas abertas e escute ativamente.",
    agressivo: "Você é direto e focado em fechar negócios rapidamente. Crie senso de urgência, mas sem ser desrespeitoso.",
    amigavel: "Você prioriza construir relacionamento e confiança. Seja caloroso, use humor leve quando apropriado.",
    tecnico: "Você foca em detalhes técnicos e demonstra expertise profunda. Use dados e especificações.",
    empatico: "Você se coloca no lugar do cliente. Demonstre compreensão genuína das dores e desafios.",
  };

  const communicationDescriptions: Record<string, string> = {
    formal: "Use linguagem profissional e respeitosa. Evite gírias e coloquialismos.",
    casual: "Use tom descontraído e informal. Gírias leves são bem-vindas.",
    profissional: "Equilibre formalidade com acessibilidade. Seja respeitoso mas não rígido.",
    descontraido: "Seja muito informal, como se fosse um amigo. Use expressões do dia a dia.",
  };

  const emojiDescriptions: Record<string, string> = {
    nenhum: "Não use emojis em nenhuma circunstância.",
    minimo: "Use no máximo 1 emoji por mensagem, apenas no final.",
    moderado: "Use 2-3 emojis por mensagem para dar tom amigável.",
    frequente: "Use emojis frequentemente para expressividade e calor humano.",
  };

  const objectionDescriptions: Record<string, string> = {
    suave: "Quando houver objeção, valide o sentimento, aceite gentilmente e ofereça alternativas sem pressionar.",
    assertivo: "Contorne objeções com argumentos sólidos, dados e exemplos de sucesso.",
    persistente: "Não desista facilmente. Explore todas as possibilidades e mostre diferentes ângulos.",
  };

  // Get active personality traits
  const traits = (settings.personality_traits || [])
    .filter((t: any) => t.enabled)
    .map((t: any) => t.name)
    .join(", ");

  // Analyze conversation stage
  const messageCount = conversationContext.messageCount || 0;
  const lastLeadMessage = conversationContext.lastLeadMessage || "";
  const hasShownInterest = conversationContext.hasShownInterest || false;
  const mentionedPrice = conversationContext.mentionedPrice || false;
  const mentionedTime = conversationContext.mentionedTime || false;

  return `# IDENTIDADE
Você é ${settings.agent_name || "um consultor de vendas"}, um ser humano real que trabalha como consultor.
${settings.agent_persona || ""}

# PERSONALIDADE
${agentTypeDescriptions[settings.agent_type] || agentTypeDescriptions.consultivo}
${communicationDescriptions[settings.communication_style] || communicationDescriptions.profissional}
${emojiDescriptions[settings.emoji_usage] || emojiDescriptions.moderado}
${traits ? `Seus traços marcantes: ${traits}` : ""}

# TRATAMENTO DE OBJEÇÕES
${objectionDescriptions[settings.objection_handling] || objectionDescriptions.assertivo}

# INFORMAÇÕES DO LEAD
- Nome da Empresa: ${lead.business_name}
- Nicho/Segmento: ${lead.niche || "Não identificado"}
- Localização: ${lead.location || "Não identificada"}
- Avaliação: ${lead.rating ? `${lead.rating} estrelas` : "N/A"}
- Status Atual: ${lead.stage} (${lead.temperature || "morno"})
- Contatos anteriores: ${messageCount} mensagens trocadas

# SEUS SERVIÇOS
${(settings.services_offered || []).join(", ") || "Soluções personalizadas para negócios"}

# BASE DE CONHECIMENTO
${settings.knowledge_base || "Você oferece soluções que ajudam empresas a crescer e se destacar no mercado."}

# CONTEXTO DA CONVERSA
${conversationContext.summary || "Primeiro contato ou conversa inicial."}

# SEU OBJETIVO PRINCIPAL
Seu objetivo é AGENDAR UMA REUNIÃO (call, videochamada ou presencial) com o lead.
Conduza a conversa naturalmente até chegar nesse ponto. Não force, mas guie.

# REGRAS DE COMPORTAMENTO HUMANIZADO

## ENTENDIMENTO
1. Leia TUDO que o lead escreve, mesmo mensagens curtas ou confusas
2. Se não entender, peça esclarecimento de forma natural
3. Considere gírias, abreviações, erros de digitação
4. Interprete o tom emocional (frustração, interesse, pressa, etc.)

## MEMÓRIA
1. NUNCA repita informações que você já disse
2. Lembre de tudo que foi mencionado na conversa
3. Faça referência a pontos anteriores quando relevante
4. Se o lead mencionou algo pessoal/importante, lembre depois

## NATURALIDADE
1. Varie o tamanho das respostas (às vezes curtas, às vezes médias)
2. Use expressões naturais: "hmm", "olha", "então", "pois é"
3. Não seja perfeito - humanos cometem pequenas hesitações
4. Responda de forma conversacional, não como um robô
5. Use o nome da empresa do lead ocasionalmente, não em toda mensagem

## ESTRATÉGIA DE ENGAJAMENTO
1. Faça 1 pergunta por mensagem (no máximo 2)
2. Ofereça valor antes de pedir algo
3. Compartilhe insights relevantes para o nicho
4. Mostre que você entende os desafios do setor

## LIDANDO COM RESPOSTAS CURTAS
Se o lead responder com "ok", "sim", "não", "talvez", etc:
- Não desanime, continue a conversa de forma natural
- Faça uma pergunta que exija mais elaboração
- Compartilhe algo interessante para reengajar

## LIDANDO COM OBJEÇÕES
"Não tenho tempo" → "Entendo perfeitamente! E se eu te mostrar em 15 minutinhos como [benefício]?"
"Está caro" → "Compreendo sua preocupação. O que você considera justo para [resultado esperado]?"
"Já tenho fornecedor" → "Que bom! E como tem sido a experiência? [demonstre curiosidade genuína]"
"Me manda por email" → "Claro! Mas antes, me conta um pouco mais sobre [necessidade] pra eu personalizar?"
"Não tenho interesse" → "Tudo bem! Só por curiosidade, o que seria útil pra você hoje?"

## FECHAMENTO PARA REUNIÃO
Quando sentir abertura, proponha de forma natural:
- "Que tal a gente bater um papo rápido de 15 minutos? Posso te mostrar como [benefício específico]"
- "Tenho alguns horários essa semana, qual funciona melhor pra você?"
- "Prefere uma call rápida ou videochamada?"

## FERRAMENTAS DISPONÍVEIS
Quando o lead CONFIRMAR data e hora para reunião, use a função scheduleMeeting.
Só use quando houver confirmação clara como: "pode ser quarta às 14h", "amanhã 10h tá bom", etc.

# RESPOSTA
Responda de forma natural e humanizada. Lembre-se: você é uma pessoa real tendo uma conversa real.
Seja conciso quando apropriado, mais elaborado quando necessário.
Adapte-se ao estilo de comunicação do lead.`;
}

// Analyze conversation to extract context
async function analyzeConversation(messages: any[], apiKey: string | null): Promise<any> {
  const context = {
    messageCount: messages.length,
    lastLeadMessage: "",
    hasShownInterest: false,
    mentionedPrice: false,
    mentionedTime: false,
    mentionedCompetitor: false,
    isNegative: false,
    isPositive: false,
    summary: "",
  };

  if (messages.length === 0) return context;

  // Get last lead message
  const leadMessages = messages.filter(m => m.sender_type === "lead");
  if (leadMessages.length > 0) {
    context.lastLeadMessage = leadMessages[leadMessages.length - 1].content;
  }

  // Quick pattern analysis
  const allText = messages.map(m => m.content.toLowerCase()).join(" ");
  
  context.mentionedPrice = /preço|valor|cust|quanto custa|orçamento|barato|caro|investimento/i.test(allText);
  context.mentionedTime = /tempo|hora|dia|semana|quando|agora|depois|amanhã|hoje/i.test(allText);
  context.mentionedCompetitor = /outro|concorrente|já tenho|parceiro|fornecedor/i.test(allText);
  context.hasShownInterest = /interessante|gostei|quero|preciso|conte mais|como funciona|me explica/i.test(allText);
  
  // Negative signals
  const negativePatterns = /não quero|não preciso|não tenho interesse|para de|não me ligue|spam|bloquear/i;
  context.isNegative = negativePatterns.test(allText);
  
  // Positive signals
  const positivePatterns = /ótimo|perfeito|excelente|adorei|maravilha|top|show|massa|legal|bom/i;
  context.isPositive = positivePatterns.test(allText);

  // Generate summary if we have API key and enough messages
  if (apiKey && messages.length >= 3) {
    try {
      const conversationText = messages
        .slice(-10) // Last 10 messages
        .map(m => `${m.sender_type === "lead" ? "Cliente" : "Agente"}: ${m.content}`)
        .join("\n");

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [{
            role: "user",
            content: `Resuma em 2-3 frases o estado atual desta conversa de vendas. O que o cliente quer? Quais objeções teve? Está próximo de fechar?

${conversationText}

Resumo:`
          }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        context.summary = data.choices?.[0]?.message?.content || "";
      }
    } catch (e) {
      console.error("Error generating summary:", e);
    }
  }

  return context;
}

// Update lead temperature based on conversation analysis
async function updateLeadTemperature(leadId: string, context: any, supabase: any) {
  let newTemperature = "morno";
  
  if (context.isNegative) {
    newTemperature = "frio";
  } else if (context.isPositive && context.hasShownInterest) {
    newTemperature = "quente";
  } else if (context.hasShownInterest || context.mentionedPrice) {
    newTemperature = "quente";
  }

  await supabase
    .from("leads")
    .update({ 
      temperature: newTemperature,
      conversation_summary: context.summary || null,
    })
    .eq("id", leadId);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body).substring(0, 500));

    // Support multiple webhook formats from Evolution API
    let phone = body.phone || body.data?.key?.remoteJid?.replace("@s.whatsapp.net", "") || "";
    let message = body.message || body.data?.message?.conversation || body.data?.message?.extendedTextMessage?.text || "";
    const instanceId = body.instance_id || body.instance?.instanceName || "";

    // Clean phone number
    phone = phone.replace(/\D/g, "");
    
    if (!phone || !message) {
      console.log("Missing phone or message in webhook:", { phone: !!phone, message: !!message });
      return new Response(JSON.stringify({ error: "Missing phone or message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing message from ${phone}: "${message.substring(0, 100)}..."`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find lead by phone number (try with and without country code)
    let lead = null;
    const phoneVariations = [phone, phone.replace(/^55/, ""), `55${phone}`];
    
    for (const phoneVar of phoneVariations) {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .or(`phone.eq.${phoneVar},phone.ilike.%${phoneVar.slice(-9)}`)
        .limit(1)
        .single();
      
      if (data) {
        lead = data;
        break;
      }
    }

    if (!lead) {
      console.log("Lead not found for phone:", phone);
      return new Response(JSON.stringify({ status: "lead_not_found" }), {
        status: 200, // Return 200 to not retry webhook
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = lead.user_id;

    // Get user settings with personality configurations
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (settingsError || !settings) {
      console.error("User settings not found:", settingsError);
      return new Response(JSON.stringify({ error: "User settings not found" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save incoming message
    await supabase.from("chat_messages").insert({
      lead_id: lead.id,
      sender_type: "lead",
      content: message,
      status: "delivered",
    });

    // Update lead's last response time
    await supabase
      .from("leads")
      .update({ 
        last_response_at: new Date().toISOString(),
        follow_up_count: 0, // Reset follow-up count since they responded
      })
      .eq("id", lead.id);

    // Get full chat history for memory
    const { data: chatHistory } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("lead_id", lead.id)
      .order("sent_at", { ascending: true })
      .limit(50); // Get more history for better memory

    const messages = chatHistory || [];

    // Analyze conversation context
    const GEMINI_API_KEY = settings.gemini_api_key;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const AI_KEY = GEMINI_API_KEY || LOVABLE_API_KEY;

    const conversationContext = await analyzeConversation(messages, LOVABLE_API_KEY);

    // Format chat history for AI (last 20 messages for context)
    const formattedHistory = messages.slice(-20).map((msg) => ({
      role: msg.sender_type === "lead" ? "user" : "assistant",
      content: msg.content,
    }));

    // Build comprehensive agent prompt
    const systemPrompt = buildAgentPrompt(settings, lead, conversationContext);

    // Generate response using AI
    let responseMessage = "";
    let meetingScheduled = false;

    if (GEMINI_API_KEY) {
      // Use user's Gemini API
      try {
        const geminiMessages = [
          { text: systemPrompt },
          ...formattedHistory.map(m => ({ text: `${m.role === "user" ? "Cliente" : "Eu"}: ${m.content}` })),
        ];

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: geminiMessages.map(m => m.text).join("\n\n") + "\n\nMinha resposta:" }]
              }],
              generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                maxOutputTokens: 500,
              }
            }),
          }
        );

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          responseMessage = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      } catch (e) {
        console.error("Gemini error:", e);
      }
    }

    // Fallback to Lovable AI with function calling
    if (!responseMessage && LOVABLE_API_KEY) {
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
              { role: "system", content: systemPrompt },
              ...formattedHistory,
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "scheduleMeeting",
                  description: "Agenda uma reunião quando o lead CONFIRMAR explicitamente uma data e horário específicos",
                  parameters: {
                    type: "object",
                    properties: {
                      date: { type: "string", description: "Data no formato YYYY-MM-DD" },
                      time: { type: "string", description: "Horário no formato HH:MM" },
                      duration_minutes: { type: "number", description: "Duração em minutos (padrão 30)" },
                      notes: { type: "string", description: "Notas ou assunto da reunião" },
                    },
                    required: ["date", "time"],
                  },
                },
              },
            ],
            tool_choice: "auto",
            temperature: 0.9,
          }),
        }
      );

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("AI API error:", errorText);
        
        if (aiResponse.status === 429 || aiResponse.status === 402) {
          // Rate limit or payment - use fallback message
          responseMessage = "Opa! Me dá um minutinho que já te respondo 😊";
        } else {
          throw new Error("Failed to generate response");
        }
      } else {
        const aiData = await aiResponse.json();
        const choice = aiData.choices?.[0];

        // Check if AI wants to schedule a meeting
        if (choice?.message?.tool_calls) {
          for (const toolCall of choice.message.tool_calls) {
            if (toolCall.function.name === "scheduleMeeting") {
              const args = JSON.parse(toolCall.function.arguments);
              
              const scheduledAt = new Date(`${args.date}T${args.time}:00`);
              const { data: meeting, error: meetingError } = await supabase
                .from("meetings")
                .insert({
                  user_id: userId,
                  lead_id: lead.id,
                  title: `Reunião com ${lead.business_name}`,
                  description: args.notes || null,
                  scheduled_at: scheduledAt.toISOString(),
                  duration_minutes: args.duration_minutes || 30,
                  status: "scheduled",
                })
                .select()
                .single();

              if (!meetingError && meeting) {
                meetingScheduled = true;
                
                await supabase
                  .from("leads")
                  .update({ stage: "Ganho", temperature: "quente" })
                  .eq("id", lead.id);

                await supabase.from("activity_log").insert({
                  user_id: userId,
                  lead_id: lead.id,
                  activity_type: "meeting_scheduled",
                  description: `Reunião agendada: ${scheduledAt.toLocaleDateString("pt-BR")} às ${args.time}`,
                  metadata: { meeting_id: meeting.id },
                });

                // Trigger webhook
                if (settings.webhook_url) {
                  try {
                    await fetch(settings.webhook_url, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        event: "meeting_scheduled",
                        meeting,
                        lead,
                        timestamp: new Date().toISOString(),
                      }),
                    });
                  } catch (e) {
                    console.error("Webhook error:", e);
                  }
                }

                const dayFormatted = scheduledAt.toLocaleDateString("pt-BR", { weekday: 'long', day: 'numeric', month: 'long' });
                responseMessage = `Perfeito! Confirmado então pra ${dayFormatted} às ${args.time}! 🎯\n\nVou te mandar um lembrete antes. Qualquer coisa é só me chamar aqui!`;
              }
            }
          }
        }

        if (!responseMessage) {
          responseMessage = choice?.message?.content || "";
        }
      }
    }

    // Fallback if still no response
    if (!responseMessage) {
      responseMessage = "Opa! Recebi sua mensagem. Me conta mais sobre como posso te ajudar! 😊";
    }

    // Clean up response (remove markdown if present)
    responseMessage = responseMessage
      .replace(/^\*\*.*?\*\*\s*/gm, "") // Remove bold markers
      .replace(/^#+\s*/gm, "") // Remove headers
      .trim();

    // Save agent response
    await supabase.from("chat_messages").insert({
      lead_id: lead.id,
      sender_type: "agent",
      content: responseMessage,
      status: "pending",
    });

    // Update last contact
    await supabase
      .from("leads")
      .update({ last_contact_at: new Date().toISOString() })
      .eq("id", lead.id);

    // Update temperature based on conversation
    await updateLeadTemperature(lead.id, conversationContext, supabase);

    // Send response via WhatsApp
    if (settings.whatsapp_connected && settings.whatsapp_instance_id) {
      try {
        const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
        const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");

        if (EVOLUTION_API_URL && EVOLUTION_API_KEY) {
          let formattedPhone = phone;
          if (!formattedPhone.startsWith("55") && formattedPhone.length <= 11) {
            formattedPhone = "55" + formattedPhone;
          }

          // Add slight delay to seem more human (1-3 seconds)
          const delay = Math.floor(Math.random() * 2000) + 1000;
          await new Promise(resolve => setTimeout(resolve, delay));

          const sendResponse = await fetch(
            `${EVOLUTION_API_URL}/message/sendText/${settings.whatsapp_instance_id}`,
            {
              method: "POST",
              headers: {
                "apikey": EVOLUTION_API_KEY,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                number: formattedPhone,
                text: responseMessage,
              }),
            }
          );

          if (sendResponse.ok) {
            console.log(`Response sent to ${phone}`);
            
            await supabase
              .from("chat_messages")
              .update({ status: "sent" })
              .eq("lead_id", lead.id)
              .eq("content", responseMessage)
              .eq("sender_type", "agent");
          } else {
            const errorText = await sendResponse.text();
            console.error(`Failed to send to ${phone}:`, errorText);
          }
        }
      } catch (e) {
        console.error("WhatsApp send error:", e);
      }
    }

    // Log activity
    await supabase.from("activity_log").insert({
      user_id: userId,
      lead_id: lead.id,
      activity_type: "message_received",
      description: `Mensagem recebida e respondida automaticamente`,
      metadata: { 
        message_preview: message.substring(0, 100),
        response_preview: responseMessage.substring(0, 100),
        meeting_scheduled: meetingScheduled,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        response: responseMessage,
        meeting_scheduled: meetingScheduled,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
