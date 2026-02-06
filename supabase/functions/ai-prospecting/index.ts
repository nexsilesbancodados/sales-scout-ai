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
    
    // Get user settings to retrieve their API keys
    const { data: userSettings } = await supabase
      .from("user_settings")
      .select("gemini_api_key, serpapi_api_key")
      .eq("user_id", user.id)
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

    // Action: Search leads with subniches and pagination for maximum coverage
    if (action === "search_leads") {
      const { niche, location, maxResults = 5000 } = data;
      
      // Use user's SerpAPI key if available
      const SERPAPI_API_KEY = userSettings?.serpapi_api_key || Deno.env.get("SERPAPI_API_KEY");
      if (!SERPAPI_API_KEY) {
        return new Response(JSON.stringify({ 
          error: "SerpAPI não configurada. Configure sua chave em Configurações > APIs.", 
          leads: [] 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

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
      
      // Use ALL search terms for maximum coverage (up to 20 variations)
      const limitedSearchTerms = searchTerms.slice(0, 20);
      
      console.log(`Searching for ${niche} with ${limitedSearchTerms.length} variations in ${location} (max: ${maxResults})`);

      try {
        for (const searchTerm of limitedSearchTerms) {
          // Stop if we have enough leads
          if (allLeads.length >= maxResults) break;

          // Search with extended pagination (page 0, 20, 40, ... up to 200 = 10 pages x 20 results = up to 200 per term)
          // This allows finding up to 4000 leads (20 terms x 200 leads each)
          for (let start = 0; start < 200; start += 20) {
            if (allLeads.length >= maxResults) break;

            const searchQuery = `${searchTerm} em ${location}`;
            console.log(`Searching: "${searchQuery}" (start: ${start})`);
            
            const serpResponse = await fetch(
              `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(searchQuery)}&api_key=${SERPAPI_API_KEY}&hl=pt-br&start=${start}`
            );

            if (!serpResponse.ok) {
              console.error("SerpAPI error:", await serpResponse.text());
              continue;
            }

            const serpData = await serpResponse.json();
            const localResults = serpData.local_results || [];
            
            if (localResults.length === 0) {
              // No more results for this term
              break;
            }

            console.log(`Found ${localResults.length} results for "${searchTerm}" at position ${start}`);

            for (const result of localResults) {
              // Skip if no phone
              if (!result.phone) continue;
              
              // Normalize phone for deduplication
              const normalizedPhone = result.phone.replace(/\D/g, "");
              if (seenPhones.has(normalizedPhone)) continue;
              
              // Check for duplicate business names (fuzzy)
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
            await new Promise(r => setTimeout(r, 200));
          }
        }

        console.log(`Total unique leads found: ${allLeads.length}`);

        return new Response(JSON.stringify({ 
          leads: allLeads,
          total: allLeads.length,
          searchTermsUsed: limitedSearchTerms,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Search error:", error);
        return new Response(JSON.stringify({ leads: [], error: error.message }), {
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

    // Action: Analyze website with Firecrawl and identify pain points
    if (action === "analyze_website") {
      const { url, business_name, niche } = data;
      
      const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
      if (!FIRECRAWL_API_KEY) {
        // Fallback to basic analysis without website content
        const fallbackAnalysis = await callAI(
          "Você é um especialista em análise de negócios e identificação de dores empresariais.",
          `Analise o negócio "${business_name}" do nicho "${niche || 'não especificado'}" e identifique:
1. 3-5 dores/problemas comuns que esse tipo de negócio enfrenta
2. Oportunidades de melhoria
3. Uma abordagem de prospecção personalizada

Responda em JSON:
{
  "painPoints": ["dor1", "dor2", ...],
  "opportunities": ["oportunidade1", ...],
  "approach": "sugestão de abordagem",
  "summary": "resumo em 1-2 frases"
}`
        );
        
        try {
          const parsed = JSON.parse(fallbackAnalysis.replace(/```json\n?|\n?```/g, ""));
          return new Response(JSON.stringify({ 
            success: true,
            ...parsed,
            source: "ai_inference"
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch {
          return new Response(JSON.stringify({ 
            success: true,
            painPoints: ["Falta de presença digital", "Dificuldade em captar clientes", "Processos manuais"],
            opportunities: ["Marketing digital", "Automação"],
            approach: "Abordagem consultiva focada em resultados",
            summary: `${business_name} pode se beneficiar de soluções digitais.`,
            source: "fallback"
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Use Firecrawl to scrape the website
      console.log(`Scraping website: ${url}`);
      
      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
      }

      try {
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: formattedUrl,
            formats: ['markdown'],
            onlyMainContent: true,
          }),
        });

        const scrapeData = await scrapeResponse.json();
        
        if (!scrapeResponse.ok || !scrapeData.success) {
          console.error('Firecrawl error:', scrapeData);
          // Fallback to basic analysis
          throw new Error('Firecrawl failed');
        }

        const websiteContent = scrapeData.data?.markdown || scrapeData.markdown || '';
        const metadata = scrapeData.data?.metadata || scrapeData.metadata || {};

        console.log(`Scraped ${websiteContent.length} characters from ${url}`);

        // Now analyze with AI
        const analysis = await callAI(
          `Você é um especialista em análise de negócios e prospecção B2B. Analise o conteúdo do website da empresa e identifique oportunidades de venda.`,
          `Empresa: ${business_name}
Nicho: ${niche || 'não especificado'}
Website: ${url}
Título: ${metadata.title || 'N/A'}
Descrição: ${metadata.description || 'N/A'}

Conteúdo do site (resumido):
${websiteContent.slice(0, 4000)}

Analise e responda em JSON:
{
  "painPoints": ["dor identificada 1", "dor identificada 2", ...],
  "opportunities": ["oportunidade 1", "oportunidade 2", ...],
  "currentServices": ["serviços que a empresa oferece"],
  "websiteAnalysis": {
    "hasModernDesign": true/false,
    "hasMobileVersion": true/false,
    "hasWhatsApp": true/false,
    "hasOnlineStore": true/false,
    "hasBlog": true/false,
    "socialMedia": ["instagram", "facebook", ...]
  },
  "approach": "sugestão de como abordar este lead",
  "personalizedMessage": "mensagem personalizada baseada na análise",
  "summary": "resumo executivo em 2-3 frases"
}`
        );

        try {
          const parsed = JSON.parse(analysis.replace(/```json\n?|\n?```/g, ""));
          return new Response(JSON.stringify({ 
            success: true,
            ...parsed,
            source: "firecrawl_analysis",
            websiteTitle: metadata.title,
            websiteDescription: metadata.description,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          return new Response(JSON.stringify({ 
            success: true,
            painPoints: ["Website precisa de melhorias", "Falta de presença digital forte"],
            opportunities: ["Redesign", "SEO", "Marketing digital"],
            approach: "Abordagem consultiva mostrando melhorias específicas",
            summary: `Análise do site ${url} realizada com sucesso.`,
            source: "firecrawl_partial"
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (scrapeError) {
        console.error('Scrape failed:', scrapeError);
        // Fallback to AI-only analysis
        const fallbackAnalysis = await callAI(
          "Você é um especialista em análise de negócios.",
          `Analise o negócio "${business_name}" do nicho "${niche}" e sugira dores comuns e abordagem de prospecção. Responda em JSON com: painPoints, opportunities, approach, summary`
        );
        
        try {
          const parsed = JSON.parse(fallbackAnalysis.replace(/```json\n?|\n?```/g, ""));
          return new Response(JSON.stringify({ 
            success: true,
            ...parsed,
            source: "ai_inference"
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch {
          return new Response(JSON.stringify({ 
            success: true,
            painPoints: ["Falta de presença digital"],
            opportunities: ["Marketing digital"],
            approach: "Abordagem consultiva",
            summary: `${business_name} pode se beneficiar de soluções digitais.`,
            source: "fallback"
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
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
