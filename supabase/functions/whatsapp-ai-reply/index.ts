import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tool definitions for Function Calling
const AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "scheduleMeeting",
      description: "Agendar uma reunião/call com o cliente. Use quando o cliente aceitar ou pedir para agendar.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Título da reunião (ex: 'Apresentação Tráfego Pago')",
          },
          date: {
            type: "string",
            description: "Data sugerida no formato YYYY-MM-DD",
          },
          time: {
            type: "string",
            description: "Horário sugerido no formato HH:MM",
          },
          duration: {
            type: "number",
            description: "Duração em minutos (padrão: 30)",
          },
          notes: {
            type: "string",
            description: "Notas sobre o que será discutido",
          },
        },
        required: ["title", "date", "time"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "updateLeadStage",
      description: "Atualizar o estágio do lead no funil quando houver progresso claro na negociação",
      parameters: {
        type: "object",
        properties: {
          new_stage: {
            type: "string",
            enum: ["Contato", "Qualificado", "Proposta", "Negociação", "Ganho", "Perdido"],
            description: "Novo estágio do lead",
          },
          reason: {
            type: "string",
            description: "Motivo da mudança de estágio",
          },
        },
        required: ["new_stage", "reason"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "updateLeadTemperature",
      description: "Atualizar a temperatura do lead baseado no interesse demonstrado",
      parameters: {
        type: "object",
        properties: {
          temperature: {
            type: "string",
            enum: ["quente", "morno", "frio"],
            description: "Nova temperatura do lead",
          },
          analysis: {
            type: "string",
            description: "Análise do sentimento/interesse do cliente",
          },
        },
        required: ["temperature", "analysis"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "identifyPainPoints",
      description: "Identificar e registrar as dores/necessidades do cliente mencionadas na conversa",
      parameters: {
        type: "object",
        properties: {
          pain_points: {
            type: "array",
            items: { type: "string" },
            description: "Lista de dores/problemas identificados",
          },
          service_opportunities: {
            type: "array",
            items: { type: "string" },
            description: "Serviços que podem resolver essas dores",
          },
        },
        required: ["pain_points"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "suggestService",
      description: "Recomendar o serviço mais adequado baseado nas necessidades identificadas do cliente",
      parameters: {
        type: "object",
        properties: {
          service_name: {
            type: "string",
            description: "Nome do serviço recomendado",
          },
          match_reason: {
            type: "string",
            description: "Por que este serviço é o mais adequado",
          },
          key_benefits: {
            type: "array",
            items: { type: "string" },
            description: "Principais benefícios para destacar",
          },
        },
        required: ["service_name", "match_reason"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "handleObjection",
      description: "Quando o cliente levantar uma objeção, usar esta função para registrar e responder adequadamente",
      parameters: {
        type: "object",
        properties: {
          objection_type: {
            type: "string",
            enum: ["price", "timing", "need", "trust", "competition", "other"],
            description: "Tipo de objeção",
          },
          objection_text: {
            type: "string",
            description: "A objeção exata do cliente",
          },
          recommended_response: {
            type: "string",
            description: "Resposta sugerida para contornar",
          },
        },
        required: ["objection_type", "objection_text"],
      },
    },
  },
];

// Function to execute tools
async function executeToolCall(
  supabase: any,
  toolName: string,
  args: any,
  leadId: string,
  userId: string
): Promise<string> {
  console.log(`Executing tool: ${toolName}`, args);

  switch (toolName) {
    case "scheduleMeeting": {
      const scheduledAt = new Date(`${args.date}T${args.time}:00`);
      
      const { data: meeting, error } = await supabase
        .from("meetings")
        .insert({
          user_id: userId,
          lead_id: leadId,
          title: args.title,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: args.duration || 30,
          notes: args.notes || null,
          status: "scheduled",
        })
        .select()
        .single();

      if (error) {
        console.error("Error scheduling meeting:", error);
        return `Erro ao agendar: ${error.message}`;
      }

      // Update lead stage to Proposta if not already further
      await supabase
        .from("leads")
        .update({
          stage: "Proposta",
          next_follow_up_at: scheduledAt.toISOString(),
        })
        .eq("id", leadId);

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: userId,
        lead_id: leadId,
        activity_type: "meeting_scheduled",
        description: `Reunião "${args.title}" agendada para ${args.date} às ${args.time}`,
        metadata: { meeting_id: meeting.id },
      });

      return `Reunião agendada com sucesso para ${args.date} às ${args.time}. ID: ${meeting.id}`;
    }

    case "updateLeadStage": {
      await supabase
        .from("leads")
        .update({ stage: args.new_stage })
        .eq("id", leadId);

      await supabase.from("activity_log").insert({
        user_id: userId,
        lead_id: leadId,
        activity_type: "stage_change",
        description: `Estágio alterado para ${args.new_stage}: ${args.reason}`,
      });

      return `Lead movido para estágio: ${args.new_stage}`;
    }

    case "updateLeadTemperature": {
      await supabase
        .from("leads")
        .update({
          temperature: args.temperature,
          conversation_summary: args.analysis,
        })
        .eq("id", leadId);

      return `Temperatura atualizada para: ${args.temperature}`;
    }

    case "identifyPainPoints": {
      const { data: lead } = await supabase
        .from("leads")
        .select("pain_points, service_opportunities")
        .eq("id", leadId)
        .single();

      const existingPains = lead?.pain_points || [];
      const existingOpps = lead?.service_opportunities || [];

      await supabase
        .from("leads")
        .update({
          pain_points: [...new Set([...existingPains, ...args.pain_points])],
          service_opportunities: args.service_opportunities
            ? [...new Set([...existingOpps, ...args.service_opportunities])]
            : existingOpps,
        })
        .eq("id", leadId);

      return `Dores identificadas: ${args.pain_points.join(", ")}`;
    }

    case "suggestService": {
      await supabase.from("activity_log").insert({
        user_id: userId,
        lead_id: leadId,
        activity_type: "service_suggested",
        description: `Serviço sugerido: ${args.service_name} - ${args.match_reason}`,
        metadata: { benefits: args.key_benefits },
      });

      return `Serviço recomendado: ${args.service_name}. ${args.match_reason}`;
    }

    case "handleObjection": {
      await supabase.from("activity_log").insert({
        user_id: userId,
        lead_id: leadId,
        activity_type: "objection_handled",
        description: `Objeção (${args.objection_type}): "${args.objection_text}"`,
        metadata: { response: args.recommended_response },
      });

      return `Objeção registrada e resposta preparada`;
    }

    default:
      return `Tool ${toolName} não implementada`;
  }
}

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

    // Get conversation history (last 50 messages for better context)
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("lead_id", lead_id)
      .order("sent_at", { ascending: true })
      .limit(50);

    // Get service intelligence for all services
    const { data: serviceIntelligence } = await supabase
      .from("service_intelligence")
      .select("*")
      .eq("user_id", lead.user_id);

    // Build comprehensive service knowledge
    const servicesKnowledge = (serviceIntelligence || []).map(s => `
### ${s.service_name}
${s.description || ''}
- Benefícios: ${s.benefits?.join(', ') || 'N/A'}
- Dores que resolve: ${s.pain_points?.join(', ') || 'N/A'}
- Preço: ${s.pricing_info || 'Sob consulta'}
- Nichos alvo: ${s.target_niches?.join(', ') || 'Diversos'}
${s.case_studies?.length ? `- Cases: ${s.case_studies.join('; ')}` : ''}
${s.objection_responses ? `- Objeções comuns: ${JSON.stringify(s.objection_responses)}` : ''}
`).join('\n');

    // Get message templates
    const { data: templates } = await supabase
      .from("message_templates")
      .select("name, content, niche, response_rate")
      .eq("user_id", lead.user_id)
      .order("response_rate", { ascending: false })
      .limit(5);

    // Build conversation context with roles
    const conversationHistory = (messages || []).map((m) => ({
      role: m.sender_type === "lead" ? "user" : "assistant",
      content: m.content,
    }));

    // Calculate conversation metrics
    const leadMessages = (messages || []).filter(m => m.sender_type === "lead").length;
    const agentMessages = (messages || []).filter(m => m.sender_type !== "lead").length;
    const conversationEngagement = leadMessages > 0 ? (leadMessages / Math.max(agentMessages, 1)) : 0;

    // Build super intelligent system prompt
    const systemPrompt = `# IDENTIDADE
Você é ${settings?.agent_name || "um especialista em vendas consultivas"}.
${settings?.agent_persona || "Você é um consultor experiente que entende profundamente as necessidades dos clientes e oferece soluções personalizadas."}

# COMUNICAÇÃO
- Estilo: ${settings?.communication_style || "Consultivo e profissional"}
- Emojis: ${settings?.emoji_usage || "Moderado (1-2 por mensagem)"}
- Tamanho: ${settings?.response_length || "Curto e direto (máx 3 frases)"}
- Tom: Natural, como uma conversa entre profissionais

# BASE DE CONHECIMENTO COMPLETA
${settings?.knowledge_base || ""}

# SERVIÇOS E EXPERTISE
${servicesKnowledge || settings?.services_offered?.join(', ') || 'Serviços de marketing digital'}

# TEMPLATES DE ALTA CONVERSÃO
${templates?.map(t => `- ${t.name} (${t.response_rate?.toFixed(0) || 0}% resposta): "${t.content?.slice(0, 100)}..."`).join('\n') || 'N/A'}

# CONTEXTO DO LEAD
- Empresa: ${lead.business_name}
- Telefone: ${lead.phone}
- Nicho: ${lead.niche || "Não identificado"}
- Localização: ${lead.location || "Não identificada"}
- Website: ${lead.website || "Não possui"}
- Avaliação: ${lead.rating ? `${lead.rating}★ (${lead.reviews_count || 0} reviews)` : "N/A"}
- Estágio atual: ${lead.stage}
- Temperatura: ${lead.temperature || "frio"}
- Dores identificadas: ${lead.pain_points?.join(', ') || "Ainda não identificadas"}
- Oportunidades: ${lead.service_opportunities?.join(', ') || "A identificar"}
- Resumo conversa: ${lead.conversation_summary || "Primeira interação"}
- Última resposta: ${lead.last_response_at || "N/A"}
- Engajamento: ${conversationEngagement > 1 ? "ALTO" : conversationEngagement > 0.5 ? "MÉDIO" : "BAIXO"}

# MÉTRICAS DA CONVERSA
- Total mensagens do lead: ${leadMessages}
- Total mensagens enviadas: ${agentMessages}
- Taxa de resposta: ${conversationEngagement.toFixed(2)}

# FUNÇÕES DISPONÍVEIS (USE QUANDO APROPRIADO)
Você tem acesso a ferramentas poderosas. USE-AS quando fizer sentido:

1. **scheduleMeeting**: Quando o cliente aceitar/pedir para agendar reunião
2. **updateLeadStage**: Quando houver progresso claro na negociação
3. **updateLeadTemperature**: Após analisar o interesse demonstrado
4. **identifyPainPoints**: Quando o cliente mencionar problemas/necessidades
5. **suggestService**: Para recomendar o serviço mais adequado
6. **handleObjection**: Quando o cliente levantar objeções

# REGRAS CRÍTICAS

## Análise de Intenção
Antes de responder, identifique a intenção do cliente:
- INTERESSE: Quer saber mais → Explique benefícios e agende call
- OBJEÇÃO: Tem dúvidas/resistência → Use técnicas de contorno
- NEGOCIAÇÃO: Discutindo preço/condições → Seja flexível mas firme
- FECHAMENTO: Pronto para comprar → Facilite o processo
- DESINTERESSE: Não quer → Agradeça e deixe porta aberta

## Estrutura de Resposta
1. Reconheça o que o cliente disse
2. Responda de forma direta e relevante
3. Avance a conversa (pergunta ou CTA)

## O QUE FAZER
✅ Respostas curtas e diretas (máx 3 frases)
✅ Personalizar baseado nas informações do lead
✅ Usar os serviços para resolver dores específicas
✅ Buscar sempre agendar uma reunião/call
✅ Atualizar estágio e temperatura conforme progresso
✅ Identificar e registrar dores mencionadas

## O QUE NÃO FAZER
❌ Respostas longas ou prolixas
❌ Inventar preços ou condições não definidas
❌ Ignorar objeções do cliente
❌ Parecer robótico ou genérico
❌ Forçar vendas quando não há interesse
❌ Prometer o que não pode cumprir

# OBJETIVO PRINCIPAL
Converter esta conversa em uma reunião agendada ou venda direta.
Analise a mensagem, use as ferramentas quando necessário, e responda de forma inteligente.`;

    // Add current message to history
    conversationHistory.push({
      role: "user",
      content: message_content,
    });

    // Call AI with function calling
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log(`Processing message for lead ${lead_id}: "${message_content.slice(0, 50)}..."`);

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
            ...conversationHistory,
          ],
          tools: AI_TOOLS,
          tool_choice: "auto",
          temperature: 0.7,
          max_tokens: 1000,
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error("Failed to generate AI response");
    }

    const aiData = await aiResponse.json();
    const choice = aiData.choices?.[0];
    const assistantMessage = choice?.message;

    // Process tool calls if any
    const toolResults: string[] = [];
    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log(`AI requested ${assistantMessage.tool_calls.length} tool calls`);
      
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        
        const result = await executeToolCall(
          supabase,
          toolName,
          toolArgs,
          lead_id,
          lead.user_id
        );
        
        toolResults.push(result);
        console.log(`Tool ${toolName} result: ${result}`);
      }

      // If we had tool calls, make another AI call to get the final response
      const followUpMessages = [
        ...conversationHistory,
        assistantMessage,
        ...assistantMessage.tool_calls.map((tc: any, i: number) => ({
          role: "tool",
          tool_call_id: tc.id,
          content: toolResults[i],
        })),
      ];

      const followUpResponse = await fetch(
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
              ...followUpMessages,
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        }
      );

      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json();
        const finalContent = followUpData.choices?.[0]?.message?.content;
        if (finalContent) {
          assistantMessage.content = finalContent;
        }
      }
    }

    const generatedReply = assistantMessage?.content || "";

    if (!generatedReply) {
      throw new Error("Empty AI response");
    }

    console.log(`Generated intelligent reply: ${generatedReply.slice(0, 100)}...`);
    if (toolResults.length > 0) {
      console.log(`Tools executed: ${toolResults.join(' | ')}`);
    }

    // Update lead's last response timestamp
    await supabase
      .from("leads")
      .update({ last_response_at: new Date().toISOString() })
      .eq("id", lead_id);

    // Determine if we should send automatically
    const shouldAutoSend = settings?.auto_prospecting_enabled && auto_reply_enabled;

    if (shouldAutoSend && settings?.whatsapp_instance_id) {
      const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
      const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");

      if (EVOLUTION_API_URL && EVOLUTION_API_KEY) {
        let formattedPhone = lead.phone.replace(/\D/g, "");
        if (!formattedPhone.startsWith("55") && formattedPhone.length <= 11) {
          formattedPhone = "55" + formattedPhone;
        }

        // Add human-like delay (1-3 seconds)
        const delay = Math.floor(Math.random() * 2000) + 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

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
              tools_executed: toolResults,
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
        tools_executed: toolResults,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("AI reply error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate reply" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
