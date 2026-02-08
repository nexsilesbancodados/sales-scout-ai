import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Background processing function for search_leads
async function processSearchLeadsInBackground(
  supabaseUrl: string,
  supabaseServiceKey: string,
  jobId: string,
  userId: string,
  niche: string,
  location: string,
  maxResults: number,
  serpApiKey: string,
  serperApiKey: string | null,
  preferredApi: string
) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Update job status to running
    await supabase
      .from("background_jobs")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", jobId);

    // Define subniches for each main niche to expand search coverage
    const SUBNICHES: Record<string, string[]> = {
      "Restaurantes": ["restaurante", "restaurantes", "comida", "gastronomia", "self-service", "rodízio", "buffet", "lanchonete", "cantina", "bistrô", "comida caseira", "comida japonesa", "comida italiana", "comida mexicana", "comida árabe", "comida chinesa", "churrascaria", "seafood", "frutos do mar"],
      "Salões de Beleza": ["salão de beleza", "salão", "cabeleireiro", "cabeleireira", "cabelo", "hair stylist", "manicure", "pedicure", "esmalteria", "nail designer", "alongamento de unhas", "maquiagem", "maquiador", "estética", "centro de estética", "sobrancelha", "design de sobrancelhas", "depilação", "massagem"],
      "Academias": ["academia", "fitness", "musculação", "crossfit", "pilates", "yoga", "funcional", "treino", "personal trainer", "ginástica", "spinning", "natação", "artes marciais", "luta", "boxe", "muay thai", "jiu jitsu", "karate"],
      "Clínicas Médicas": ["clínica médica", "clínica", "consultório médico", "médico", "centro médico", "policlínica", "clínica geral", "dermatologista", "cardiologista", "ortopedista", "ginecologista", "pediatra", "oftalmologista", "neurologista", "psiquiatra", "endocrinologista"],
      "Clínicas Odontológicas": ["clínica odontológica", "dentista", "odontologia", "consultório dentário", "ortodontista", "implante dentário", "clareamento dental", "prótese dentária", "endodontia", "periodontia", "odontopediatra", "cirurgião dentista"],
      "Escritórios de Advocacia": ["escritório de advocacia", "advogado", "advocacia", "advogados", "escritório jurídico", "consultoria jurídica", "advogado trabalhista", "advogado criminal", "advogado civil", "advogado família", "advogado empresarial", "advogado imobiliário"],
      "Imobiliárias": ["imobiliária", "imobiliárias", "corretor de imóveis", "corretor", "imóveis", "venda de imóveis", "aluguel de imóveis", "locação", "casas à venda", "apartamentos", "empreendimentos"],
      "Pet Shops": ["pet shop", "petshop", "loja de animais", "banho e tosa", "clínica veterinária", "veterinário", "ração", "acessórios pet", "hotel para pets", "creche para cães", "adestramento", "dog walker"],
      "Oficinas Mecânicas": ["oficina mecânica", "mecânica", "mecânico", "auto center", "autocenter", "funilaria", "pintura automotiva", "elétrica automotiva", "troca de óleo", "alinhamento", "balanceamento", "suspensão", "freios", "ar condicionado automotivo"],
      "Escolas e Cursos": ["escola", "curso", "cursos", "escola de idiomas", "inglês", "espanhol", "escola de música", "aula de música", "escola de dança", "informática", "curso técnico", "preparatório", "vestibular", "reforço escolar", "educação infantil"],
      "Lojas de Roupas": ["loja de roupas", "roupas", "moda", "boutique", "vestuário", "confecção", "loja feminina", "loja masculina", "moda feminina", "moda masculina", "moda infantil", "loja de calçados", "sapatos", "acessórios", "bolsas"],
      "Farmácias": ["farmácia", "drogaria", "farmácia de manipulação", "medicamentos", "perfumaria", "dermocosméticos"],
      "Hotéis e Pousadas": ["hotel", "pousada", "hospedagem", "motel", "resort", "hostel", "albergue", "flat", "apart hotel", "airbnb", "chalé"],
      "Estúdios de Tatuagem": ["estúdio de tatuagem", "tatuagem", "tattoo", "tatuador", "piercing", "body piercing", "micropigmentação"],
      "Barbearias": ["barbearia", "barbeiro", "barber shop", "barba", "corte masculino", "cabelo masculino"],
      "Floriculturas": ["floricultura", "flores", "florista", "arranjos florais", "buquê", "decoração floral", "plantas", "jardim", "paisagismo"],
      "Padarias": ["padaria", "panificadora", "pão", "confeitaria", "bolos", "tortas", "doces", "salgados", "café da manhã"],
      "Pizzarias": ["pizzaria", "pizza", "delivery pizza", "rodízio de pizza", "pizza artesanal"],
      "Hamburguerias": ["hamburgueria", "hambúrguer", "burger", "lanchonete", "fast food", "smash burger", "artesanal"],
      "Cafeterias": ["cafeteria", "café", "coffee shop", "expresso", "cappuccino", "latte", "brunch", "confeitaria"],
    };

    const allLeads: any[] = [];
    const seenPhones = new Set<string>();
    const seenNames = new Set<string>();

    // Get subniches for this niche, or use the niche itself
    const searchTerms = SUBNICHES[niche] || [niche.toLowerCase()];
    
    // Increased to 10 terms for better coverage
    const limitedSearchTerms = searchTerms.slice(0, 10);
    
    console.log(`[Job ${jobId}] Searching for ${niche} with ${limitedSearchTerms.length} variations in ${location} (max: ${maxResults})`);

    let processedTerms = 0;
    const totalTerms = limitedSearchTerms.length;

    for (const searchTerm of limitedSearchTerms) {
      // Stop if we have enough leads
      if (allLeads.length >= maxResults) break;

      // Search with expanded pagination (5 pages per term = 100 results per term)
      for (let start = 0; start < 100; start += 20) {
        if (allLeads.length >= maxResults) break;

        const searchQuery = `${searchTerm} em ${location}`;
        console.log(`[Job ${jobId}] Searching: "${searchQuery}" (start: ${start})`);
        
        try {
          const serpResponse = await fetch(
            `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(searchQuery)}&api_key=${serpApiKey}&hl=pt-br&start=${start}`
          );

          if (!serpResponse.ok) {
            console.error(`[Job ${jobId}] SerpAPI error:`, await serpResponse.text());
            continue;
          }

          const serpData = await serpResponse.json();
          const localResults = serpData.local_results || [];
          
          if (localResults.length === 0) break;

          console.log(`[Job ${jobId}] Found ${localResults.length} results for "${searchTerm}" at position ${start}`);

          for (const result of localResults) {
            if (!result.phone) continue;
            
            const normalizedPhone = result.phone.replace(/\D/g, "");
            if (seenPhones.has(normalizedPhone)) continue;
            
            const normalizedName = (result.title || "").toLowerCase().trim();
            if (seenNames.has(normalizedName)) continue;

            seenPhones.add(normalizedPhone);
            seenNames.add(normalizedName);

            allLeads.push({
              business_name: result.title || "Empresa",
              phone: result.phone,
              address: result.address || null,
              rating: result.rating || null,
              reviews_count: result.reviews || null,
              website: result.website || null,
              google_maps_url: result.place_id 
                ? `https://www.google.com/maps/place/?q=place_id:${result.place_id}`
                : null,
              place_id: result.place_id || null,
              type: result.type || null,
              subtype: searchTerm,
            });
          }

          // Small delay to respect rate limits
          await new Promise(r => setTimeout(r, 150));
        } catch (error) {
          console.error(`[Job ${jobId}] Search error for ${searchTerm}:`, error);
        }
      }

      processedTerms++;
      
      // Update job progress
      const progress = Math.round((processedTerms / totalTerms) * 100);
      await supabase
        .from("background_jobs")
        .update({ 
          processed_items: allLeads.length,
          current_index: processedTerms,
          last_heartbeat_at: new Date().toISOString(),
        })
        .eq("id", jobId);
    }

    console.log(`[Job ${jobId}] Total unique leads found: ${allLeads.length}`);

    // Update job as completed with results
    await supabase
      .from("background_jobs")
      .update({ 
        status: "completed",
        completed_at: new Date().toISOString(),
        processed_items: allLeads.length,
        result: { 
          leads: allLeads,
          total: allLeads.length,
          searchTermsUsed: limitedSearchTerms,
        },
      })
      .eq("id", jobId);

  } catch (error: any) {
    console.error(`[Job ${jobId}] Background processing failed:`, error);
    
    await supabase
      .from("background_jobs")
      .update({ 
        status: "failed",
        error_message: error.message || "Unknown error",
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  }
}

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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Check if this is a service role call (internal from job-processor)
    const isServiceRoleCall = authHeader.includes(supabaseServiceKey);
    
    let user: any = null;
    let supabase: any;

    if (isServiceRoleCall) {
      // Internal call from job-processor - use service role client
      supabase = createClient(supabaseUrl, supabaseServiceKey);
      // User ID should be passed in the body for internal calls
      const body = await req.clone().json();
      if (body.user_id) {
        user = { id: body.user_id };
      }
    } else {
      // Normal user call - authenticate with JWT
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      user = userData.user;
    }

    const { action, data, user_id } = await req.json();
    
    // For internal calls, use provided user_id
    const effectiveUserId = user?.id || user_id;
    
    if (!effectiveUserId) {
      return new Response(JSON.stringify({ error: "User ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Get user settings to retrieve their API keys
    const { data: userSettings } = await supabase
      .from("user_settings")
      .select("gemini_api_key, serpapi_api_key, serper_api_key, preferred_search_api")
      .eq("user_id", effectiveUserId)
      .single();

    const GEMINI_API_KEY = userSettings?.gemini_api_key;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Helper function to call AI (prefers user's Gemini, falls back to Lovable)
    async function callAI(systemPrompt: string, userPrompt: string) {
      if (GEMINI_API_KEY) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
              }]
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      }

      // Fallback to Lovable AI
      if (!LOVABLE_API_KEY) {
        throw new Error("Nenhuma API de IA configurada. Configure sua chave Gemini em Configurações > APIs.");
      }

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
        throw new Error("AI API error");
      }

      const aiData = await response.json();
      return aiData.choices?.[0]?.message?.content || "";
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

    // Action: Qualify leads by groups - AI analyzes leads and categorizes them
    if (action === "qualify_leads_by_group") {
      const { leads } = data;
      
      if (!leads || leads.length === 0) {
        return new Response(JSON.stringify({ qualified_leads: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const systemPrompt = `Você é um especialista em qualificação de leads para prospecção B2B no Brasil.

Sua tarefa é analisar uma lista de leads e para CADA um:
1. Classificar em um GRUPO baseado nas características (use exatamente estes grupos):
   - "Sem Site" - negócios sem website
   - "Avaliação Baixa" - rating abaixo de 3.5 estrelas
   - "Pequeno Porte" - poucos reviews (<20) indica menor porte
   - "Estabelecido" - muitos reviews (>50) e bom rating
   - "Premium" - rating excelente (>4.5) e muitos reviews
   - "Novo no Mercado" - poucos ou nenhum review
   
2. Identificar OPORTUNIDADES DE SERVIÇO baseado no que falta ao negócio:
   - Sem site = "Criação de Site", "Landing Page"
   - Avaliação baixa = "Gestão de Reputação", "Marketing Digital"
   - Pequeno porte = "Automação", "Chatbot", "WhatsApp Business"
   - Sem redes sociais = "Gestão de Redes Sociais"
   - Estabelecido = "Expansão Digital", "Sistema de Gestão"
   - Premium = "Fidelização", "Programa de Indicação"

Responda em JSON válido com o formato:
{
  "qualified": [
    {
      "id": "id_do_lead",
      "lead_group": "nome_do_grupo",
      "service_opportunities": ["serviço1", "serviço2"]
    }
  ]
}`;

      const userPrompt = `Analise estes ${leads.length} leads e qualifique cada um:

${leads.slice(0, 50).map((l: any, i: number) => `${i+1}. ${l.business_name}
   - ID: ${l.id}
   - Site: ${l.website ? 'Sim' : 'Não tem'}
   - Rating: ${l.rating || 'N/A'}
   - Reviews: ${l.reviews_count || 0}
   - Nicho: ${l.niche || 'N/A'}
`).join('\n')}

Retorne APENAS o JSON, sem explicações.`;

      try {
        const response = await callAI(systemPrompt, userPrompt);
        
        // Parse the JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("Invalid AI response format");
        }
        
        const result = JSON.parse(jsonMatch[0]);
        
        return new Response(JSON.stringify({ 
          qualified_leads: result.qualified || [],
          total_analyzed: leads.length,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error: any) {
        console.error("Error qualifying leads:", error);
        
        // Fallback: do basic classification without AI
        const fallbackQualified = leads.slice(0, 50).map((lead: any) => {
          let group = "Novo no Mercado";
          const opportunities: string[] = [];
          
          if (!lead.website) {
            group = "Sem Site";
            opportunities.push("Criação de Site", "Landing Page");
          } else if (lead.rating && lead.rating < 3.5) {
            group = "Avaliação Baixa";
            opportunities.push("Gestão de Reputação", "Marketing Digital");
          } else if (lead.reviews_count && lead.reviews_count > 50 && lead.rating >= 4.5) {
            group = "Premium";
            opportunities.push("Fidelização", "Expansão Digital");
          } else if (lead.reviews_count && lead.reviews_count > 50) {
            group = "Estabelecido";
            opportunities.push("Sistema de Gestão", "Automação");
          } else if (!lead.reviews_count || lead.reviews_count < 20) {
            group = "Pequeno Porte";
            opportunities.push("Chatbot", "WhatsApp Business", "Automação");
          }
          
          return {
            id: lead.id,
            lead_group: group,
            service_opportunities: opportunities,
          };
        });
        
        return new Response(JSON.stringify({ 
          qualified_leads: fallbackQualified,
          total_analyzed: leads.length,
          used_fallback: true,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Action: Suggest template improvements
    if (action === "suggest_improvements") {
      const { template, responseRate, niche } = data;

      const systemPrompt = `Você é um especialista em copywriting para prospecção via WhatsApp no Brasil.
              
Analise o template fornecido e sugira melhorias específicas para aumentar a taxa de resposta.
Considere:
- Personalização e uso de variáveis
- Tom de voz apropriado para o nicho
- Call-to-action claro
- Comprimento ideal (não muito longo)
- Gatilhos mentais sutis

Responda em português brasileiro com sugestões práticas e um template melhorado.`;

      const userPrompt = `Nicho: ${niche}
Taxa de resposta atual: ${responseRate}%

Template atual:
${template}

Por favor, analise e sugira melhorias.`;

      try {
        const suggestions = await callAI(systemPrompt, userPrompt);
        return new Response(JSON.stringify({ suggestions }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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
      const { lead, template, agentSettings, isRemarketing } = data;

      // Check if this is direct AI mode (no template)
      const isDirectMode = !template || template === null || template.trim() === '';

      // Check if a specific service was selected
      const specificService = agentSettings?.specific_service;
      const servicesText = specificService 
        ? specificService 
        : (agentSettings?.services_offered?.length ? agentSettings.services_offered.join(', ') : 'soluções digitais personalizadas');

      let systemPrompt = '';
      let userPrompt = '';

      if (isRemarketing) {
        // Remarketing mode - SHORT follow-up message
        systemPrompt = `Você é ${agentSettings?.agent_name || "um consultor"}.
${agentSettings?.agent_persona || ""}

Estilo: ${agentSettings?.communication_style || "direto"}
Emojis: ${agentSettings?.emoji_usage || "mínimo"}

CONTEXTO: Mensagem de FOLLOW-UP (lead já foi contatado antes).

REGRAS DE FORMATO:
1. MÁXIMO 2 linhas (30-50 palavras)
2. NÃO se apresente novamente
3. Use gatilhos: novidade, resultado, urgência, exclusividade
4. Seja casual e direto

EXEMPLOS:
"E aí, tudo certo? Lembrei de vocês quando fechei um case bacana com uma ${lead.niche || 'empresa'} aqui perto. Dá uma olhada depois?"

"Opa! Surgiu uma condição especial que pode fazer sentido pra vocês. Posso mandar mais detalhes?"

PROIBIDO: apresentações, listagem de serviços, parágrafos longos.`;

        userPrompt = `FOLLOW-UP para:
• ${lead.business_name} (${lead.niche || "negócio local"})
${lead.location ? `• ${lead.location}` : ''}

Crie UMA mensagem CURTA de remarketing (máx 2 frases). Apenas a mensagem.`;

      } else if (isDirectMode) {
        // Direct AI mode - generate message from scratch based on agent settings
        // Optimized for SHORT, IMPACTFUL messages that show PAIN + SOLUTION
        systemPrompt = `Você é ${agentSettings?.agent_name || "um consultor especializado"}.
${agentSettings?.agent_persona || ""}

Estilo: ${agentSettings?.communication_style || "direto"}
Emojis: ${agentSettings?.emoji_usage || "mínimo"}

${agentSettings?.knowledge_base ? `Expertise: ${agentSettings.knowledge_base}` : ''}

${specificService ? `SERVIÇO FOCO: "${specificService}"` : ''}

REGRAS OBRIGATÓRIAS DE FORMATO:
1. MÁXIMO 2-3 linhas de texto (50-80 palavras no total)
2. Estrutura: DOR → SOLUÇÃO → CTA
3. Primeira frase: identificar uma DOR específica do nicho
4. Segunda frase: apresentar a SOLUÇÃO de forma convincente
5. Terceira frase: CTA direto (pergunta ou convite)

PROIBIDO:
- Apresentações longas ("Olá, meu nome é...")
- Listagem de serviços
- Parágrafos longos
- Formalidade excessiva ("prezado", "venho por meio desta")
- Mais de 3 frases

EXEMPLOS DE FORMATO IDEAL:
"Oi! Vi que a [empresa] não tem site e hoje 70% dos clientes pesquisam online antes de ir. Posso montar uma página profissional pra vocês em 1 semana. Bora bater um papo rápido?"

"E aí! Percebi que vocês têm poucas avaliações no Google. Tenho uma estratégia que triplicou as avaliações de [nicho similar]. Quer saber como funciona?"

FOCO: Seja DIRETO, mostre que ENTENDE A DOR e ofereça SOLUÇÃO CLARA.`;

        userPrompt = `LEAD:
• Empresa: ${lead.business_name}
• Nicho: ${lead.niche || "negócio local"}
• Local: ${lead.location || ""}
${lead.rating ? `• Rating: ${lead.rating}★ (${lead.reviews_count || 0} reviews)` : '• Sem avaliações'}
${!lead.website ? '• SEM SITE' : ''}
${specificService ? `\nOFERECER: ${specificService}` : ''}

Crie UMA mensagem CURTA (máx 3 frases). Apenas a mensagem, sem explicações.`;

      } else {
        // Template mode - personalize existing template
        systemPrompt = `Você é ${agentSettings?.agent_name || "um consultor de vendas"}.
${agentSettings?.agent_persona || "Você ajuda empresas a crescerem com soluções digitais."}

Estilo de comunicação: ${agentSettings?.communication_style || "profissional"}
Uso de emojis: ${agentSettings?.emoji_usage || "moderado"}

Sua tarefa é personalizar a mensagem de prospecção para o lead específico, mantendo o tom e estrutura do template mas adaptando para a realidade do lead.`;

        userPrompt = `Lead:
- Empresa: ${lead.business_name}
- Nicho: ${lead.niche || "não especificado"}
- Localização: ${lead.location || "não especificada"}
- Avaliação: ${lead.rating ? `${lead.rating} estrelas` : "não disponível"}
- Reviews: ${lead.reviews_count || 0}

Template base:
${template}

Personalize esta mensagem para este lead específico. Mantenha curta e direta. Retorne APENAS a mensagem final.`;
      }

      try {
        const message = await callAI(systemPrompt, userPrompt);
        
        // Clean up the message - remove any markdown or extra formatting
        const cleanMessage = message
          .replace(/^["']|["']$/g, '') // Remove quotes at start/end
          .replace(/^\*\*|\*\*$/g, '') // Remove bold markdown
          .trim();

        return new Response(JSON.stringify({ message: cleanMessage }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error: any) {
        console.error("AI API error:", error);
        
        // Fallback for template mode
        if (!isDirectMode) {
          const fallbackMessage = template
            .replace(/\{empresa\}/gi, lead.business_name)
            .replace(/\{nicho\}/gi, lead.niche || 'seu segmento')
            .replace(/\{cidade\}/gi, lead.location || 'sua região');
          
          return new Response(JSON.stringify({ message: fallbackMessage }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        throw new Error("Falha ao gerar mensagem. Verifique sua chave API.");
      }
    }

    // Action: Search leads - MAXIMIZED COVERAGE
    if (action === "search_leads") {
      const { niche, location, maxResults = 500 } = data;
      
      // Determine which API to use based on user preference
      const preferredApi = userSettings?.preferred_search_api || 'serper';
      const serperApiKey = userSettings?.serper_api_key;
      const serpApiKey = userSettings?.serpapi_api_key || Deno.env.get("SERPAPI_API_KEY");
      
      // Check if at least one API is configured
      if (!serperApiKey && !serpApiKey) {
        return new Response(JSON.stringify({ 
          error: "Nenhuma API de busca configurada. Configure Serper.dev ou SerpAPI em Configurações > APIs.", 
          leads: [] 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Bairros e regiões de grandes cidades para expandir busca
      const CITY_REGIONS: Record<string, string[]> = {
        "São Paulo": ["Centro", "Paulista", "Pinheiros", "Vila Mariana", "Moema", "Itaim Bibi", "Jardins", "Brooklin", "Mooca", "Tatuapé", "Santana", "Lapa", "Perdizes", "Vila Madalena", "Bela Vista", "Consolação", "Liberdade", "Santo Amaro", "Campo Belo", "Morumbi", "Butantã", "Penha", "Vila Prudente", "Ipiranga", "Saúde", "Jabaquara"],
        "Rio de Janeiro": ["Centro", "Copacabana", "Ipanema", "Leblon", "Botafogo", "Flamengo", "Tijuca", "Barra da Tijuca", "Recreio", "Méier", "Madureira", "Jacarepaguá", "Campo Grande", "Niterói"],
        "Belo Horizonte": ["Centro", "Savassi", "Funcionários", "Lourdes", "Pampulha", "Contagem", "Betim"],
        "Curitiba": ["Centro", "Batel", "Água Verde", "Portão", "Santa Felicidade", "Cabral", "Juvevê"],
        "Porto Alegre": ["Centro", "Moinhos de Vento", "Cidade Baixa", "Menino Deus", "Petrópolis", "Mont Serrat"],
        "Salvador": ["Centro", "Barra", "Pituba", "Itaigara", "Ondina", "Rio Vermelho", "Brotas"],
        "Brasília": ["Asa Sul", "Asa Norte", "Lago Sul", "Lago Norte", "Sudoeste", "Noroeste", "Taguatinga", "Águas Claras"],
        "Fortaleza": ["Centro", "Aldeota", "Meireles", "Fátima", "Papicu", "Cocó", "Dionísio Torres"],
        "Recife": ["Centro", "Boa Viagem", "Casa Forte", "Espinheiro", "Derby", "Graças", "Aflitos"],
        "Campinas": ["Centro", "Cambuí", "Taquaral", "Barão Geraldo", "Sousas", "Nova Campinas"],
      };

      // Helper function to search with Serper.dev
      async function searchWithSerper(searchQuery: string): Promise<any[]> {
        const response = await fetch('https://google.serper.dev/places', {
          method: 'POST',
          headers: {
            'X-API-KEY': serperApiKey!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: searchQuery,
            gl: 'br',
            hl: 'pt-br',
            num: 100, // Request max results
          }),
        });

        if (!response.ok) {
          throw new Error(`Serper API error: ${response.status}`);
        }

        const data = await response.json();
        return data.places || [];
      }

      // Helper function to search with SerpAPI
      async function searchWithSerpApi(searchQuery: string, start: number): Promise<any[]> {
        const response = await fetch(
          `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(searchQuery)}&api_key=${serpApiKey}&hl=pt-br&start=${start}`
        );

        if (!response.ok) {
          throw new Error(`SerpAPI error: ${response.status}`);
        }

        const data = await response.json();
        return data.local_results || [];
      }

      const allLeads: any[] = [];
      const seenPhones = new Set<string>();
      const seenNames = new Set<string>();

      // EXTENSIVE subniches for MAXIMUM coverage - all variations and subcategories
      const SUBNICHES: Record<string, string[]> = {
        // Alimentação
        "Restaurantes": ["restaurante", "restaurantes", "comida", "gastronomia", "self-service", "rodízio", "buffet", "lanchonete", "cantina", "bistrô", "comida caseira", "comida japonesa", "sushi", "temaki", "comida italiana", "comida mexicana", "comida árabe", "comida chinesa", "churrascaria", "frutos do mar", "seafood", "comida vegana", "vegetariano", "marmita", "quentinha", "delivery comida", "food truck"],
        "Pizzarias": ["pizzaria", "pizza", "delivery pizza", "rodízio de pizza", "pizza artesanal", "pizza delivery", "pizzaria delivery", "esfiha", "esfiharia"],
        "Hamburguerias": ["hamburgueria", "hambúrguer", "burger", "lanchonete", "fast food", "smash burger", "artesanal", "hot dog", "cachorro quente", "sanduíche", "sanduicheria"],
        "Cafeterias": ["cafeteria", "café", "coffee shop", "expresso", "cappuccino", "latte", "brunch", "confeitaria", "doceria", "casa de chá", "padaria café"],
        "Padarias": ["padaria", "panificadora", "pão", "confeitaria", "bolos", "tortas", "doces", "salgados", "café da manhã", "padoca", "panificação", "padaria artesanal"],
        "Bares": ["bar", "bares", "boteco", "pub", "choperia", "cervejaria", "happy hour", "drinks", "coquetelaria", "balada", "boate", "casa noturna", "lounge"],
        "Açougues": ["açougue", "casa de carnes", "carnes", "frigorífico", "boutique de carnes", "churrasco"],
        "Sorveterias": ["sorveteria", "sorvete", "açaí", "gelato", "frozen", "milkshake", "picolé", "açaiteria"],
        
        // Beleza e Estética
        "Salões de Beleza": ["salão de beleza", "salão", "cabeleireiro", "cabeleireira", "cabelo", "hair stylist", "manicure", "pedicure", "esmalteria", "nail designer", "alongamento de unhas", "unhas em gel", "maquiagem", "maquiador", "estética", "centro de estética", "sobrancelha", "design de sobrancelhas", "depilação", "massagem", "spa", "day spa", "limpeza de pele", "peeling", "botox", "preenchimento", "harmonização facial", "escova progressiva", "coloração", "penteado"],
        "Barbearias": ["barbearia", "barbeiro", "barber shop", "barba", "corte masculino", "cabelo masculino", "barbershop", "navalha", "aparar barba"],
        "Estúdios de Tatuagem": ["estúdio de tatuagem", "tatuagem", "tattoo", "tatuador", "piercing", "body piercing", "micropigmentação", "tattoo studio", "tatuagens"],
        "Clínicas de Estética": ["clínica de estética", "estética avançada", "procedimentos estéticos", "drenagem linfática", "massagem modeladora", "criolipólise", "lipocavitação", "radiofrequência", "carboxiterapia"],
        
        // Saúde
        "Clínicas Médicas": ["clínica médica", "clínica", "consultório médico", "médico", "centro médico", "policlínica", "clínica geral", "dermatologista", "cardiologista", "ortopedista", "ginecologista", "pediatra", "oftalmologista", "neurologista", "psiquiatra", "endocrinologista", "urologista", "otorrino", "clínica popular", "pronto atendimento", "urgência", "emergência"],
        "Clínicas Odontológicas": ["clínica odontológica", "dentista", "odontologia", "consultório dentário", "ortodontista", "implante dentário", "clareamento dental", "prótese dentária", "endodontia", "periodontia", "odontopediatra", "cirurgião dentista", "odonto", "aparelho dentário", "facetas", "lentes de contato dental"],
        "Farmácias": ["farmácia", "drogaria", "farmácia de manipulação", "medicamentos", "perfumaria", "dermocosméticos", "farmácia popular", "farmácia 24h"],
        "Óticas": ["ótica", "óculos", "lentes", "lentes de contato", "armações", "optometrista", "oftalmologista"],
        "Psicólogos": ["psicólogo", "psicóloga", "psicologia", "terapia", "terapeuta", "psicanálise", "consultório psicológico", "saúde mental"],
        "Nutricionistas": ["nutricionista", "nutrição", "consultório nutricional", "dieta", "emagrecimento", "reeducação alimentar"],
        "Fisioterapia": ["fisioterapia", "fisioterapeuta", "clínica de fisioterapia", "reabilitação", "pilates clínico", "RPG", "quiropraxia", "osteopatia", "acupuntura"],
        
        // Fitness
        "Academias": ["academia", "fitness", "musculação", "crossfit", "pilates", "yoga", "funcional", "treino", "personal trainer", "ginástica", "spinning", "natação", "artes marciais", "luta", "boxe", "muay thai", "jiu jitsu", "karate", "judô", "taekwondo", "mma", "academia 24h", "smart fit", "bio ritmo", "bodytech"],
        "Estúdios de Pilates": ["pilates", "estúdio de pilates", "pilates solo", "pilates reformer", "mat pilates"],
        "Estúdios de Yoga": ["yoga", "estúdio de yoga", "meditação", "mindfulness", "hatha yoga", "vinyasa", "ashtanga"],
        "Personal Trainer": ["personal trainer", "personal", "treinador pessoal", "treino personalizado", "treino funcional", "treino ao ar livre"],
        
        // Serviços Profissionais
        "Escritórios de Advocacia": ["escritório de advocacia", "advogado", "advocacia", "advogados", "escritório jurídico", "consultoria jurídica", "advogado trabalhista", "advogado criminal", "advogado civil", "advogado família", "advogado empresarial", "advogado imobiliário", "defensoria", "assessoria jurídica"],
        "Contadores": ["contador", "contabilidade", "escritório de contabilidade", "contábil", "assessoria contábil", "abertura de empresa", "declaração de imposto", "IRPF", "MEI"],
        "Arquitetos": ["arquiteto", "arquitetura", "escritório de arquitetura", "design de interiores", "decoração", "decorador", "paisagismo", "projeto arquitetônico"],
        "Engenheiros": ["engenheiro", "engenharia", "escritório de engenharia", "projeto estrutural", "laudo técnico", "ART", "RRT"],
        "Consultórios": ["consultório", "médico", "profissional de saúde", "especialista"],
        
        // Imóveis e Construção
        "Imobiliárias": ["imobiliária", "imobiliárias", "corretor de imóveis", "corretor", "imóveis", "venda de imóveis", "aluguel de imóveis", "locação", "casas à venda", "apartamentos", "empreendimentos", "lançamentos", "imóveis comerciais", "galpão"],
        "Construtoras": ["construtora", "construção", "empreiteira", "obras", "reforma", "mestre de obras", "pedreiro", "construção civil"],
        "Lojas de Materiais de Construção": ["material de construção", "loja de construção", "ferragens", "tintas", "pisos", "revestimentos", "elétrica", "hidráulica", "cimento", "areia", "madeireira"],
        "Marcenarias": ["marcenaria", "marceneiro", "móveis planejados", "móveis sob medida", "armários", "cozinha planejada"],
        "Vidraçarias": ["vidraçaria", "vidraceiro", "vidros", "espelhos", "box", "janelas", "portas de vidro", "blindex"],
        "Serralheria": ["serralheria", "serralheiro", "portão", "grades", "ferro", "metalúrgica", "estrutura metálica"],
        
        // Pets
        "Pet Shops": ["pet shop", "petshop", "loja de animais", "banho e tosa", "clínica veterinária", "veterinário", "ração", "acessórios pet", "hotel para pets", "creche para cães", "adestramento", "dog walker", "pet", "cachorro", "gato", "animais"],
        "Clínicas Veterinárias": ["veterinário", "clínica veterinária", "hospital veterinário", "vet", "cirurgia veterinária", "castração", "vacinas pet"],
        
        // Automotivo
        "Oficinas Mecânicas": ["oficina mecânica", "mecânica", "mecânico", "auto center", "autocenter", "funilaria", "pintura automotiva", "elétrica automotiva", "troca de óleo", "alinhamento", "balanceamento", "suspensão", "freios", "ar condicionado automotivo", "injeção eletrônica", "escapamento", "retífica", "borracharia"],
        "Lava Rápido": ["lava rápido", "lava jato", "lavagem de carro", "estética automotiva", "polimento", "vitrificação", "higienização"],
        "Concessionárias": ["concessionária", "revenda de carros", "seminovos", "carros usados", "veículos", "multimarcas", "loja de carros"],
        "Autopeças": ["autopeças", "peças automotivas", "peças de carro", "acessórios automotivos", "som automotivo", "rodas", "pneus"],
        
        // Educação
        "Escolas e Cursos": ["escola", "curso", "cursos", "escola de idiomas", "inglês", "espanhol", "escola de música", "aula de música", "escola de dança", "informática", "curso técnico", "preparatório", "vestibular", "reforço escolar", "educação infantil", "creche", "berçário", "colégio", "faculdade", "centro educacional", "aulas particulares"],
        "Autoescolas": ["autoescola", "auto escola", "cfc", "habilitação", "CNH", "aula de direção", "simulador"],
        
        // Varejo
        "Lojas de Roupas": ["loja de roupas", "roupas", "moda", "boutique", "vestuário", "confecção", "loja feminina", "loja masculina", "moda feminina", "moda masculina", "moda infantil", "loja de calçados", "sapatos", "acessórios", "bolsas", "lingerie", "moda praia", "fitness wear", "plus size", "brechó"],
        "Supermercados": ["supermercado", "mercado", "mercearia", "atacado", "atacarejo", "minimercado", "empório", "hortifruti", "sacolão", "feira"],
        "Lojas de Móveis": ["loja de móveis", "móveis", "colchões", "estofados", "sofá", "cama", "eletrodomésticos", "móveis usados", "decoração"],
        "Papelarias": ["papelaria", "livraria", "material escolar", "escritório", "xerox", "gráfica rápida", "impressão"],
        "Floriculturas": ["floricultura", "flores", "florista", "arranjos florais", "buquê", "decoração floral", "plantas", "jardim", "paisagismo", "garden center"],
        "Joalherias": ["joalheria", "joias", "relógios", "semi joias", "bijuterias", "ótica joalheria", "conserto de relógios", "ourives"],
        "Óticas": ["ótica", "óculos", "lentes de contato", "armação", "óculos de sol"],
        
        // Hospedagem
        "Hotéis e Pousadas": ["hotel", "pousada", "hospedagem", "motel", "resort", "hostel", "albergue", "flat", "apart hotel", "airbnb", "chalé", "camping", "glamping"],
        
        // Tecnologia e Serviços
        "Assistência Técnica": ["assistência técnica", "conserto de celular", "manutenção de computador", "informática", "reparo", "conserto", "técnico"],
        "Gráficas": ["gráfica", "impressão", "banner", "adesivos", "cartão de visita", "panfletos", "plotagem", "comunicação visual"],
        "Fotógrafos": ["fotógrafo", "fotografia", "estúdio fotográfico", "fotos", "ensaio fotográfico", "foto e vídeo", "filmagem", "casamento", "eventos"],
        
        // Outros Serviços
        "Lavanderias": ["lavanderia", "lava e seca", "lavagem de roupa", "passadoria", "tinturaria"],
        "Despachantes": ["despachante", "documentação", "licenciamento", "transferência", "emplacamento", "detran"],
        "Chaveiros": ["chaveiro", "chaves", "fechaduras", "cópias de chave", "cofres", "carimbos"],
        "Dedetizadoras": ["dedetizadora", "dedetização", "controle de pragas", "descupinização", "desratização"],
        "Seguradoras": ["seguradora", "seguros", "corretor de seguros", "seguro auto", "seguro vida", "plano de saúde"],
        "Escritórios Virtuais": ["escritório virtual", "coworking", "sala de reunião", "endereço comercial", "espaço compartilhado"],
      };

      // Get base search terms
      let searchTerms = SUBNICHES[niche] || [];
      
      // If niche not in predefined list, use it as main term and try to find related terms
      if (searchTerms.length === 0) {
        // Check if any subniches contain this term
        const nicheNormalized = niche.toLowerCase().trim();
        for (const [category, terms] of Object.entries(SUBNICHES)) {
          if (category.toLowerCase().includes(nicheNormalized) || 
              terms.some(t => t.includes(nicheNormalized))) {
            searchTerms = [...searchTerms, ...terms];
          }
        }
        // If still empty, just use the input niche in multiple forms
        if (searchTerms.length === 0) {
          searchTerms = [nicheNormalized, `${nicheNormalized}s`, `loja de ${nicheNormalized}`, `empresa de ${nicheNormalized}`];
        }
      }
      
      // Remove duplicates
      const uniqueTerms = [...new Set(searchTerms)];
      // Use up to 30 terms for MAXIMUM coverage
      const limitedSearchTerms = uniqueTerms.slice(0, 30);

      // Determine which API to use (with fallback logic)
      let useSerper = preferredApi === 'serper' && serperApiKey;
      let useSerpApi = !useSerper && serpApiKey;
      let apiUsed = useSerper ? 'serper' : 'serpapi';

      // Get city regions if available
      const cityName = Object.keys(CITY_REGIONS).find(city => 
        location.toLowerCase().includes(city.toLowerCase())
      );
      const regions = cityName ? CITY_REGIONS[cityName] : [];

      // Build search locations: original location + specific neighborhoods for big cities
      const searchLocations: string[] = [location];
      if (regions.length > 0) {
        // Add neighborhoods/regions for more targeted search
        for (const region of regions.slice(0, 15)) {
          searchLocations.push(`${region}, ${cityName}`);
        }
      }

      console.log(`MAXIMIZED search for ${niche} in ${location}`);
      console.log(`- ${limitedSearchTerms.length} search terms`);
      console.log(`- ${searchLocations.length} location variations`);
      console.log(`- Target: ${maxResults} leads`);
      console.log(`- API: ${apiUsed}`);

      // Process each search term with location variations
      for (const searchTerm of limitedSearchTerms) {
        if (allLeads.length >= maxResults) break;

        for (const searchLocation of searchLocations) {
          if (allLeads.length >= maxResults) break;

          const searchQuery = `${searchTerm} em ${searchLocation}`;
          
          if (useSerper) {
            try {
              const results = await searchWithSerper(searchQuery);
              console.log(`[Serper] "${searchTerm}" in "${searchLocation}": ${results.length} results`);
              
              for (const result of results) {
                if (allLeads.length >= maxResults) break;
                if (!result.phoneNumber) continue;
                
                const normalizedPhone = result.phoneNumber.replace(/\D/g, "");
                if (seenPhones.has(normalizedPhone)) continue;
                
                const normalizedName = (result.title || "").toLowerCase().trim();
                if (seenNames.has(normalizedName)) continue;

                seenPhones.add(normalizedPhone);
                seenNames.add(normalizedName);

                allLeads.push({
                  business_name: result.title || "Empresa",
                  phone: result.phoneNumber,
                  address: result.address || null,
                  rating: result.rating || null,
                  reviews_count: result.ratingCount || null,
                  website: result.website || null,
                  google_maps_url: result.link || null,
                  place_id: result.placeId || null,
                  type: result.category || null,
                  subtype: searchTerm,
                });
              }
              
              await new Promise(r => setTimeout(r, 50));
            } catch (error) {
              console.error(`Serper error for ${searchTerm}:`, error);
              // Try fallback to SerpAPI
              if (serpApiKey) {
                console.log('Falling back to SerpAPI...');
                useSerper = false;
                useSerpApi = true;
                apiUsed = 'serpapi (fallback)';
              }
            }
          }
          
          if (useSerpApi) {
            // Search up to 10 pages (200 results per term) for MAXIMUM coverage
            for (let start = 0; start < 200; start += 20) {
              if (allLeads.length >= maxResults) break;

              try {
                const results = await searchWithSerpApi(searchQuery, start);
                console.log(`[SerpAPI] "${searchTerm}" in "${searchLocation}" @${start}: ${results.length} results`);
                
                if (results.length === 0) break;

                for (const result of results) {
                  if (!result.phone) continue;
                  
                  const normalizedPhone = result.phone.replace(/\D/g, "");
                  if (seenPhones.has(normalizedPhone)) continue;
                  
                  const normalizedName = (result.title || "").toLowerCase().trim();
                  if (seenNames.has(normalizedName)) continue;

                  seenPhones.add(normalizedPhone);
                  seenNames.add(normalizedName);

                  allLeads.push({
                    business_name: result.title || "Empresa",
                    phone: result.phone,
                    address: result.address || null,
                    rating: result.rating || null,
                    reviews_count: result.reviews || null,
                    website: result.website || null,
                    google_maps_url: result.place_id 
                      ? `https://www.google.com/maps/place/?q=place_id:${result.place_id}`
                      : null,
                    place_id: result.place_id || null,
                    type: result.type || null,
                    subtype: searchTerm,
                  });
                }

                // Small delay to respect rate limits
                await new Promise(r => setTimeout(r, 50));
              } catch (error) {
                console.error(`SerpAPI error for ${searchTerm}:`, error);
              }
            }
          }
        }
      }

      console.log(`Total unique leads found: ${allLeads.length} using ${apiUsed}`);

      return new Response(JSON.stringify({ 
        leads: allLeads,
        total: allLeads.length,
        searchTermsUsed: limitedSearchTerms,
        apiUsed,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: Check job status
    if (action === "check_job_status") {
      const { job_id } = data;
      
      const { data: job, error } = await supabase
        .from("background_jobs")
        .select("*")
        .eq("id", job_id)
        .single();

      if (error || !job) {
        return new Response(JSON.stringify({ error: "Job not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        job_id: job.id,
        status: job.status,
        processed_items: job.processed_items,
        total_items: job.total_items,
        result: job.result,
        error_message: job.error_message,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
          painPoints: ["Falta de presença digital", "Dificuldade em captar clientes"],
          message: `Olá! Vi que a ${lead.business_name} atua no segmento de ${lead.niche}. Posso ajudar a aumentar sua visibilidade online?`
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Action: Batch analyze multiple leads
    if (action === "batch_analyze") {
      const { leads, agentSettings, prospectingType } = data;

      const results = await Promise.all(
        leads.slice(0, 5).map(async (lead: any) => {
          try {
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
                    content: `Você é um especialista em vendas B2B no Brasil.

Crie uma mensagem de prospecção para o negócio abaixo.

Estilo: ${prospectingType?.settings?.messageStyle || "Profissional e direto"}
Tom: ${prospectingType?.settings?.tone || "moderado"}

Serviços oferecidos: ${(agentSettings?.services_offered || []).join(", ")}

Responda em JSON: {"painPoints": ["dor1"], "message": "mensagem curta"}`,
                  },
                  {
                    role: "user",
                    content: `Empresa: ${lead.business_name}, Nicho: ${lead.niche}, Rating: ${lead.rating || "N/A"}`,
                  },
                ],
              }),
            });

            if (!aiResponse.ok) {
              return {
                leadId: lead.id,
                painPoints: ["Falta de presença digital"],
                message: `Olá! Vi que a ${lead.business_name} pode crescer mais. Posso ajudar?`,
              };
            }

            const aiData = await aiResponse.json();
            const content = aiData.choices?.[0]?.message?.content || "{}";
            const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, ""));

            return {
              leadId: lead.id,
              painPoints: parsed.painPoints || ["Falta de presença digital"],
              message: parsed.message || `Olá! Posso ajudar a ${lead.business_name}?`,
            };
          } catch {
            return {
              leadId: lead.id,
              painPoints: ["Falta de presença digital"],
              message: `Olá! Vi que a ${lead.business_name} pode crescer mais. Posso ajudar?`,
            };
          }
        })
      );

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: Generate A/B test variants
    if (action === "generate_ab_variants") {
      const { baseTemplate, niche, testType } = data;

      const systemPrompt = `Você é um especialista em copywriting e testes A/B para prospecção via WhatsApp.

Crie ${testType === "opening" ? "3 variações de abertura" : testType === "cta" ? "3 variações de call-to-action" : "3 variações completas"} para o template base.

Cada variante deve:
- Manter a essência da mensagem
- Testar um elemento específico diferente
- Ser adequada ao nicho ${niche}

Responda em JSON:
{
  "variants": [
    {"name": "Variant A", "content": "...", "hypothesis": "..."},
    {"name": "Variant B", "content": "...", "hypothesis": "..."},
    {"name": "Variant C", "content": "...", "hypothesis": "..."}
  ]
}`;

      try {
        const aiText = await callAI(systemPrompt, baseTemplate);
        const parsed = JSON.parse(aiText.replace(/```json\n?|\n?```/g, ""));
        
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error: any) {
        return new Response(JSON.stringify({ 
          variants: [
            { name: "Variant A", content: baseTemplate, hypothesis: "Controle" },
          ],
          error: error.message 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Default error response
    return new Response(JSON.stringify({ error: "Unknown action: " + action }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
