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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: Calculate lead quality score
    if (action === "calculate_quality_score") {
      const { lead } = data;
      
      let score = 50; // Base score

      // Rating factor (0-5 stars)
      if (lead.rating) {
        score += (lead.rating - 3) * 10; // +20 for 5 stars, -20 for 1 star
      }

      // Reviews factor
      if (lead.reviews_count) {
        if (lead.reviews_count > 100) score += 15;
        else if (lead.reviews_count > 50) score += 10;
        else if (lead.reviews_count > 20) score += 5;
      }

      // Has website (indicates more established business)
      if (lead.website) score += 10;

      // Has email (easier to follow up)
      if (lead.email) score += 5;

      // Response history
      if (lead.last_response_at) {
        score += 20; // They responded before
      }

      // Clamp score between 0 and 100
      score = Math.max(0, Math.min(100, score));

      return new Response(JSON.stringify({ score }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: Suggest template improvements
    if (action === "suggest_improvements") {
      const { template, responseRate, niche } = data;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              content: `Você é um especialista em copywriting para prospecção via WhatsApp no Brasil.
              
Analise o template fornecido e sugira melhorias específicas para aumentar a taxa de resposta.
Considere:
- Personalização e uso de variáveis
- Tom de voz apropriado para o nicho
- Call-to-action claro
- Comprimento ideal (não muito longo)
- Gatilhos mentais sutis

Responda em português brasileiro com sugestões práticas e um template melhorado.`,
            },
            {
              role: "user",
              content: `Nicho: ${niche}
Taxa de resposta atual: ${responseRate}%

Template atual:
${template}

Por favor, analise e sugira melhorias.`,
            },
          ],
        }),
      });

      if (!aiResponse.ok) {
        console.error("AI API error:", await aiResponse.text());
        throw new Error("Failed to get AI suggestions");
      }

      const aiData = await aiResponse.json();
      const suggestions = aiData.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: Get best time recommendation
    if (action === "get_best_time") {
      const { niche, stats } = data;

      // Calculate best hours from stats
      const hourlyData: Record<number, { sent: number; responses: number }> = {};
      
      for (const stat of stats) {
        if (stat.hour_of_day !== null) {
          if (!hourlyData[stat.hour_of_day]) {
            hourlyData[stat.hour_of_day] = { sent: 0, responses: 0 };
          }
          hourlyData[stat.hour_of_day].sent += stat.messages_sent;
          hourlyData[stat.hour_of_day].responses += stat.responses_received;
        }
      }

      const hourlyRates = Object.entries(hourlyData)
        .map(([hour, data]) => ({
          hour: parseInt(hour),
          rate: data.sent > 0 ? (data.responses / data.sent) * 100 : 0,
          sample: data.sent,
        }))
        .filter(h => h.sample >= 3)
        .sort((a, b) => b.rate - a.rate);

      // If we have data, use it; otherwise, use AI to suggest based on niche
      if (hourlyRates.length > 0) {
        const bestHours = hourlyRates.slice(0, 3).map(h => h.hour);
        const recommendation = `Baseado nos seus dados: melhor horário às ${bestHours[0]}h (${hourlyRates[0].rate.toFixed(1)}% de resposta)`;

        return new Response(JSON.stringify({ 
          bestHours,
          recommendation,
          source: "data"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Use AI for initial recommendation
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          tools: [
            {
              type: "function",
              function: {
                name: "recommend_hours",
                description: "Recomenda os melhores horários para prospecção",
                parameters: {
                  type: "object",
                  properties: {
                    bestHours: {
                      type: "array",
                      items: { type: "number" },
                      description: "Lista dos 3 melhores horários (0-23)",
                    },
                    explanation: {
                      type: "string",
                      description: "Explicação breve do porquê",
                    },
                  },
                  required: ["bestHours", "explanation"],
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "recommend_hours" } },
          messages: [
            {
              role: "system",
              content: "Você é um especialista em prospecção B2B no Brasil. Recomende os melhores horários para contato via WhatsApp baseado no nicho.",
            },
            {
              role: "user",
              content: `Qual o melhor horário para contatar empresas do nicho "${niche}" via WhatsApp no Brasil? Considere horários comerciais e rotina típica do nicho.`,
            },
          ],
        }),
      });

      if (!aiResponse.ok) {
        // Fallback to default hours
        return new Response(JSON.stringify({
          bestHours: [10, 14, 16],
          recommendation: "Horários sugeridos: 10h, 14h e 16h (horário comercial padrão)",
          source: "default",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      
      if (toolCall) {
        const args = JSON.parse(toolCall.function.arguments);
        return new Response(JSON.stringify({
          bestHours: args.bestHours,
          recommendation: args.explanation,
          source: "ai",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        bestHours: [10, 14, 16],
        recommendation: "Horários sugeridos: 10h, 14h e 16h",
        source: "default",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: Generate personalized message
    if (action === "generate_message") {
      const { lead, template, agentSettings } = data;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              content: `Você é ${agentSettings?.agent_name || "um consultor de vendas"}.
${agentSettings?.agent_persona || "Você ajuda empresas a crescerem com soluções digitais."}

Estilo de comunicação: ${agentSettings?.communication_style || "profissional"}
Uso de emojis: ${agentSettings?.emoji_usage || "moderado"}

Sua tarefa é personalizar a mensagem de prospecção para o lead específico, mantendo o tom e estrutura do template mas adaptando para a realidade do lead.`,
            },
            {
              role: "user",
              content: `Lead:
- Empresa: ${lead.business_name}
- Nicho: ${lead.niche || "não especificado"}
- Localização: ${lead.location || "não especificada"}
- Avaliação: ${lead.rating ? `${lead.rating} estrelas` : "não disponível"}
- Reviews: ${lead.reviews_count || 0}

Template base:
${template}

Personalize esta mensagem para este lead específico. Mantenha curta e direta.`,
            },
          ],
        }),
      });

      if (!aiResponse.ok) {
        console.error("AI API error:", await aiResponse.text());
        throw new Error("Failed to generate message");
      }

      const aiData = await aiResponse.json();
      const message = aiData.choices?.[0]?.message?.content || template;

      return new Response(JSON.stringify({ message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: Search leads (using SerpAPI placeholder - returns mock for now)
    if (action === "search_leads") {
      const { niche, location } = data;
      
      const SERPAPI_API_KEY = Deno.env.get("SERPAPI_API_KEY");
      if (!SERPAPI_API_KEY) {
        return new Response(JSON.stringify({ error: "SERPAPI not configured", leads: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const searchQuery = `${niche} em ${location}`;
        const serpResponse = await fetch(
          `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(searchQuery)}&api_key=${SERPAPI_API_KEY}&hl=pt-br`
        );

        if (!serpResponse.ok) {
          console.error("SerpAPI error:", await serpResponse.text());
          return new Response(JSON.stringify({ leads: [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const serpData = await serpResponse.json();
        const localResults = serpData.local_results || [];

        const leads = localResults.slice(0, 10).map((result: any) => ({
          business_name: result.title || "Empresa",
          phone: result.phone || null,
          address: result.address || null,
          rating: result.rating || null,
          reviews_count: result.reviews || null,
          website: result.website || null,
        }));

        return new Response(JSON.stringify({ leads }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Search error:", error);
        return new Response(JSON.stringify({ leads: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Action: Analyze lead pain points and generate personalized message
    if (action === "analyze_and_personalize") {
      const { lead, agentSettings } = data;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `Você é um especialista em análise de negócios e vendas consultivas no Brasil.

Analise o negócio fornecido e:
1. Identifique 2-4 dores/problemas comuns que esse tipo de negócio enfrenta
2. Crie uma mensagem de primeiro contato altamente personalizada que:
   - Mencione a empresa pelo nome
   - Identifique uma dor específica do nicho
   - Ofereça uma solução relevante de forma sutil
   - Termine com uma pergunta aberta

Considere:
- Nicho: ${lead.niche}
- Localização: ${lead.location}
- Avaliação: ${lead.rating ? `${lead.rating} estrelas` : "não disponível"}
- Quantidade de reviews: ${lead.reviews_count || 0}
- Tem website: ${lead.website ? "Sim" : "Não"}

Serviços oferecidos pelo vendedor: ${(agentSettings?.services_offered || []).join(", ")}
Estilo de comunicação: ${agentSettings?.communication_style || "profissional"}
Uso de emojis: ${agentSettings?.emoji_usage || "moderado"}

Responda em JSON com:
{
  "painPoints": ["dor1", "dor2", ...],
  "message": "mensagem personalizada"
}`,
            },
            {
              role: "user",
              content: `Analise e crie uma mensagem para: ${lead.business_name}`,
            },
          ],
        }),
      });

      if (!aiResponse.ok) {
        console.error("AI error:", await aiResponse.text());
        return new Response(JSON.stringify({ 
          painPoints: ["Falta de presença digital", "Dificuldade em captar clientes"],
          message: `Olá! Vi que a ${lead.business_name} atua no segmento de ${lead.niche}. Posso ajudar a aumentar sua visibilidade online?`
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "{}";

      try {
        const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, ""));
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ 
          painPoints: ["Falta de presença digital"],
          message: `Olá! Vi que a ${lead.business_name} atua no segmento de ${lead.niche}. Tenho uma solução que pode ajudar. Posso te contar mais?`
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI Prospecting error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
