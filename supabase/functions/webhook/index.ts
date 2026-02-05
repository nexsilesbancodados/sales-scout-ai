import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Build personality prompt based on settings
function buildPersonalityPrompt(settings: any): string {
  const agentTypeDescriptions: Record<string, string> = {
    consultivo: "Você é um consultor que busca entender profundamente as necessidades antes de propor soluções.",
    agressivo: "Você é direto e focado em fechar negócios rapidamente, criando senso de urgência.",
    amigavel: "Você prioriza construir relacionamento e confiança antes de falar de negócios.",
    tecnico: "Você foca em detalhes técnicos, especificações e demonstra expertise profunda.",
    empatico: "Você se coloca no lugar do cliente, demonstrando compreensão genuína das dores.",
  };

  const communicationDescriptions: Record<string, string> = {
    formal: "Use linguagem profissional e respeitosa, evitando gírias.",
    casual: "Use tom descontraído e informal, como um colega de trabalho.",
    profissional: "Equilibre formalidade com acessibilidade.",
    descontraido: "Seja muito informal, como se fosse um amigo próximo.",
  };

  const lengthDescriptions: Record<string, string> = {
    curto: "Responda em 1-2 frases objetivas.",
    medio: "Responda em 2-3 parágrafos balanceados.",
    longo: "Dê explicações detalhadas quando necessário.",
  };

  const emojiDescriptions: Record<string, string> = {
    nenhum: "Não use emojis.",
    minimo: "Use apenas um emoji no final da mensagem quando apropriado.",
    moderado: "Use alguns emojis para dar tom amigável.",
    frequente: "Use emojis frequentemente para expressividade.",
  };

  const objectionDescriptions: Record<string, string> = {
    suave: "Quando houver objeção, aceite gentilmente e ofereça alternativas.",
    assertivo: "Contorne objeções com argumentos sólidos e dados.",
    persistente: "Não desista facilmente, explore todas as possibilidades.",
  };

  const closingDescriptions: Record<string, string> = {
    consultivo: "Sugira o próximo passo quando fizer sentido naturalmente.",
    direto: "Peça a venda ou reunião diretamente.",
    urgencia: "Crie senso de urgência com prazos ou disponibilidade limitada.",
    beneficio: "Foque nos ganhos que o cliente terá antes de propor fechamento.",
  };

  const greetingDescriptions: Record<string, string> = {
    padrao: "Cumprimente de forma padrão: 'Olá, tudo bem?'",
    personalizado: "Mencione o nome da empresa ou detalhe específico.",
    criativo: "Use uma abordagem criativa e diferenciada.",
    minimalista: "Vá direto ao assunto com saudação mínima.",
  };

  const valueDescriptions: Record<string, string> = {
    beneficios: "Destaque os benefícios práticos que o cliente terá.",
    resultados: "Use números, métricas e cases de sucesso.",
    economia: "Foque em ROI, economia de tempo e redução de custos.",
    exclusividade: "Destaque diferenciais únicos e exclusivos.",
  };

  // Get active personality traits
  const traits = (settings.personality_traits || [])
    .filter((t: any) => t.enabled)
    .map((t: any) => t.name)
    .join(", ");

  return `
## TIPO DE AGENTE
${agentTypeDescriptions[settings.agent_type] || agentTypeDescriptions.consultivo}

## ESTILO DE COMUNICAÇÃO
${communicationDescriptions[settings.communication_style] || communicationDescriptions.formal}

## TAMANHO DAS RESPOSTAS
${lengthDescriptions[settings.response_length] || lengthDescriptions.medio}

## USO DE EMOJIS
${emojiDescriptions[settings.emoji_usage] || emojiDescriptions.moderado}

## TRATAMENTO DE OBJEÇÕES
${objectionDescriptions[settings.objection_handling] || objectionDescriptions.suave}

## ESTILO DE FECHAMENTO
${closingDescriptions[settings.closing_style] || closingDescriptions.consultivo}

## SAUDAÇÃO
${greetingDescriptions[settings.greeting_style] || greetingDescriptions.padrao}

## PROPOSTA DE VALOR
${valueDescriptions[settings.value_proposition_focus] || valueDescriptions.beneficios}

${traits ? `## TRAÇOS DE PERSONALIDADE ATIVOS\n${traits}` : ""}
`.trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    const { phone, message, instance_id } = body;

    if (!phone || !message) {
      return new Response(JSON.stringify({ error: "Missing phone or message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find lead by phone number
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("phone", phone)
      .single();

    if (leadError || !lead) {
      console.log("Lead not found for phone:", phone);
      return new Response(JSON.stringify({ error: "Lead not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = lead.user_id;

    // Get user settings with all personality configurations
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
      .update({ last_response_at: new Date().toISOString() })
      .eq("id", lead.id);

    // Get chat history
    const { data: chatHistory } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("lead_id", lead.id)
      .order("sent_at", { ascending: true })
      .limit(20);

    // Format chat history for AI
    const formattedHistory = (chatHistory || []).map((msg) => ({
      role: msg.sender_type === "lead" ? "user" : "assistant",
      content: msg.content,
    }));

    // Generate response using AI with advanced personality
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build dynamic personality prompt
    const personalityPrompt = buildPersonalityPrompt(settings);

    const systemPrompt = `Você é ${settings.agent_name}, um agente de vendas inteligente.

${settings.agent_persona}

${personalityPrompt}

## INFORMAÇÕES DO LEAD
- Empresa: ${lead.business_name}
- Nicho: ${lead.niche || "Não especificado"}
- Localização: ${lead.location || "Não especificada"}
- Estágio no Funil: ${lead.stage}
- Temperatura: ${lead.temperature}

## SERVIÇOS OFERECIDOS
${(settings.services_offered || []).join(", ")}

## BASE DE CONHECIMENTO
${settings.knowledge_base || "Não definida"}

## OBJETIVO PRINCIPAL
Seu objetivo é agendar uma reunião com o lead. Use sua personalidade configurada para guiar a conversa naturalmente.

Se o lead concordar com uma data e hora para reunião, use a função scheduleMeeting.

## REGRAS IMPORTANTES
1. Siga rigorosamente o estilo de personalidade configurado
2. Mantenha consistência com mensagens anteriores
3. Adapte-se às respostas do lead
4. Seja autêntico e não robótico`;

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
                description: "Agendar uma reunião com o lead quando ele concordar com data e hora",
                parameters: {
                  type: "object",
                  properties: {
                    date: {
                      type: "string",
                      description: "Data da reunião no formato YYYY-MM-DD",
                    },
                    time: {
                      type: "string",
                      description: "Hora da reunião no formato HH:MM",
                    },
                    duration_minutes: {
                      type: "number",
                      description: "Duração da reunião em minutos (padrão: 30)",
                    },
                    notes: {
                      type: "string",
                      description: "Notas ou assunto da reunião",
                    },
                  },
                  required: ["date", "time"],
                },
              },
            },
          ],
          tool_choice: "auto",
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to generate response");
    }

    const aiData = await aiResponse.json();
    const choice = aiData.choices?.[0];
    let responseMessage = "";
    let meetingScheduled = false;

    // Check if AI wants to call a function
    if (choice?.message?.tool_calls) {
      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.function.name === "scheduleMeeting") {
          const args = JSON.parse(toolCall.function.arguments);
          
          // Create meeting
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
            
            // Update lead to "Ganho" stage
            await supabase
              .from("leads")
              .update({ stage: "Ganho", temperature: "quente" })
              .eq("id", lead.id);

            // Log activity
            await supabase.from("activity_log").insert({
              user_id: userId,
              lead_id: lead.id,
              activity_type: "meeting_scheduled",
              description: `Reunião agendada para ${scheduledAt.toLocaleDateString("pt-BR")} às ${args.time}`,
              metadata: { meeting_id: meeting.id },
            });

            // Trigger webhook
            if (settings.webhook_url && settings.webhook_events?.includes("meeting_scheduled")) {
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
              } catch (webhookError) {
                console.error("Webhook error:", webhookError);
              }
            }

            responseMessage = `Perfeito! Reunião confirmada para ${scheduledAt.toLocaleDateString("pt-BR")} às ${args.time}. Vou te enviar um lembrete antes. Até lá! 🎯`;
          }
        }
      }
    }

    // If no function was called, use the text response
    if (!responseMessage) {
      responseMessage = choice?.message?.content || "Obrigado pela mensagem! Vou analisar e te retorno em breve.";
    }

    // Save agent response
    await supabase.from("chat_messages").insert({
      lead_id: lead.id,
      sender_type: "agent",
      content: responseMessage,
      status: "sent",
    });

    // Update last contact
    await supabase
      .from("leads")
      .update({ last_contact_at: new Date().toISOString() })
      .eq("id", lead.id);

    // Analyze sentiment in background
    analyzeSentiment(lead.id, supabase, LOVABLE_API_KEY);

    console.log(`Response generated for ${phone}: ${responseMessage.substring(0, 100)}...`);

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

// Background sentiment analysis
async function analyzeSentiment(leadId: string, supabase: any, apiKey: string) {
  try {
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("lead_id", leadId)
      .order("sent_at", { ascending: true });

    if (!messages || messages.length === 0) return;

    const conversation = messages
      .map((m: any) => `${m.sender_type === "lead" ? "Lead" : "Agente"}: ${m.content}`)
      .join("\n");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content: `Analise a conversa e retorne um JSON com:
- temperature: "quente" (muito interessado), "morno" (interesse moderado), ou "frio" (desinteressado/objeções)
- summary: resumo de 1-2 frases sobre o status da conversa

Responda APENAS com o JSON, sem markdown.`,
            },
            { role: "user", content: conversation },
          ],
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      
      try {
        const analysis = JSON.parse(content.replace(/```json\n?|\n?```/g, ""));
        
        await supabase
          .from("leads")
          .update({
            temperature: analysis.temperature,
            conversation_summary: analysis.summary,
          })
          .eq("id", leadId);
          
        console.log(`Sentiment analyzed for lead ${leadId}:`, analysis);
      } catch (parseError) {
        console.error("Failed to parse sentiment:", parseError);
      }
    }
  } catch (error) {
    console.error("Sentiment analysis error:", error);
  }
}
