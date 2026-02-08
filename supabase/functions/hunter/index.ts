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
    console.log(`Hunter agent started for user: ${userId}`);

    // Parse request body to get optional niches and locations
    let requestNiches: string[] = [];
    let requestLocations: string[] = [];
    
    try {
      const body = await req.json();
      requestNiches = body.niches || [];
      requestLocations = body.locations || [];
      console.log(`Request body received - niches: ${requestNiches.length}, locations: ${requestLocations.length}`);
    } catch {
      // No body or invalid JSON - will use settings
      console.log("No request body, using user settings");
    }

    // Get target niches and locations (prefer request body, fallback to user settings)
    const niches = requestNiches.length > 0 ? requestNiches : (settings.target_niches || []);
    const locations = requestLocations.length > 0 ? requestLocations : (settings.target_locations || []);

    console.log(`Using niches: ${niches.join(', ')} | locations: ${locations.join(', ')}`);

    if (niches.length === 0 || locations.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "No niches or locations configured",
          hint: "Passe 'niches' e 'locations' no body da requisição ou configure target_niches e target_locations nas suas configurações.",
          hasNiches: niches.length > 0,
          hasLocations: locations.length > 0,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Search for businesses using SerpAPI (Google Maps search)
    // Use user's own API key if available, otherwise fall back to global
    const SERPAPI_API_KEY = settings.serpapi_api_key || Deno.env.get("SERPAPI_API_KEY");
    if (!SERPAPI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "SerpAPI não configurada. Configure sua chave em Configurações > APIs." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const searchQuery = `${niches[0]} em ${locations[0]}`;
    console.log(`Searching SerpAPI for: ${searchQuery}`);

    const serpResponse = await fetch(
      `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(searchQuery)}&api_key=${SERPAPI_API_KEY}&hl=pt-br`
    );

    if (!serpResponse.ok) {
      const errorText = await serpResponse.text();
      console.error("SerpAPI error:", errorText);
      throw new Error("Failed to search businesses with SerpAPI");
    }

    const serpData = await serpResponse.json();
    const localResults = serpData.local_results || [];

    console.log(`Found ${localResults.length} businesses from SerpAPI`);

    // Map SerpAPI results to our lead format
    const foundLeads = localResults.slice(0, 5).map((result: any) => ({
      business_name: result.title || "Empresa",
      phone: result.phone || null,
      niche: niches[0],
      location: locations[0],
      address: result.address || null,
      google_maps_url: result.place_id 
        ? `https://www.google.com/maps/place/?q=place_id:${result.place_id}`
        : result.gps_coordinates 
          ? `https://www.google.com/maps?q=${result.gps_coordinates.latitude},${result.gps_coordinates.longitude}`
          : null,
      website: result.website || null,
      rating: result.rating || null,
      reviews: result.reviews || null,
    }));

    // Filter leads that have phone numbers
    const leadsWithPhone = foundLeads.filter((lead: any) => lead.phone);
    console.log(`${leadsWithPhone.length} leads have phone numbers`);

    // Generate first message using AI (user's Gemini key or fallback to Lovable)
    const GEMINI_API_KEY = settings.gemini_api_key;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!GEMINI_API_KEY && !LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Nenhuma API de IA configurada. Configure sua chave Gemini em Configurações > APIs." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const messageVariations = settings.message_variations || [];
    let firstMessage: string;

    if (messageVariations.length > 0) {
      // Use A/B test variation
      const randomVariation =
        messageVariations[Math.floor(Math.random() * messageVariations.length)];
      firstMessage = randomVariation.template || randomVariation;
    } else {
      // Generate message with AI - prefer user's Gemini, fallback to Lovable
      let aiResponse;
      
      if (GEMINI_API_KEY) {
        // Use user's Gemini API key
        aiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Você é ${settings.agent_name}, um especialista em vendas consultivas.
${settings.agent_persona}

Seu objetivo é criar uma primeira mensagem de prospecção que:
1. Seja pessoal e não pareça automática
2. Identifique uma dor comum do nicho
3. Ofereça uma solução de forma sutil
4. Termine com uma pergunta aberta para engajar

Serviços oferecidos: ${(settings.services_offered || []).join(", ")}
Base de conhecimento: ${settings.knowledge_base || ""}

Crie uma mensagem de primeiro contato para uma empresa do nicho "${niches[0]}" localizada em "${locations[0]}".
Responda APENAS com a mensagem, sem explicações.`
                }]
              }]
            }),
          }
        );

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          firstMessage = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      }
      
      // Fallback to Lovable AI if Gemini failed or not configured
      if (!firstMessage && LOVABLE_API_KEY) {
        aiResponse = await fetch(
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
                  content: `Você é ${settings.agent_name}, um especialista em vendas consultivas.
${settings.agent_persona}

Seu objetivo é criar uma primeira mensagem de prospecção que:
1. Seja pessoal e não pareça automática
2. Identifique uma dor comum do nicho
3. Ofereça uma solução de forma sutil
4. Termine com uma pergunta aberta para engajar

Serviços oferecidos: ${(settings.services_offered || []).join(", ")}
Base de conhecimento: ${settings.knowledge_base || ""}

Responda APENAS com a mensagem, sem explicações.`,
                },
                {
                  role: "user",
                  content: `Crie uma mensagem de primeiro contato para uma empresa do nicho "${niches[0]}" localizada em "${locations[0]}".`,
                },
              ],
            }),
          }
        );

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error("AI API error:", errorText);
          throw new Error("Failed to generate message");
        }

        const aiData = await aiResponse.json();
        firstMessage = aiData.choices?.[0]?.message?.content || "";
      }
    }

    // Create leads and log messages
    const createdLeads = [];
    for (const leadData of leadsWithPhone) {
      // Check if lead already exists
      const { data: existingLead } = await supabase
        .from("leads")
        .select("id")
        .eq("user_id", userId)
        .eq("phone", leadData.phone)
        .single();

      if (existingLead) {
        console.log(`Lead already exists: ${leadData.phone}`);
        continue;
      }

      // Create lead
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .insert({
          user_id: userId,
          business_name: leadData.business_name,
          phone: leadData.phone,
          niche: leadData.niche,
          location: leadData.location,
          address: leadData.address,
          google_maps_url: leadData.google_maps_url,
          stage: "Contato",
          temperature: "morno",
          source: "google_maps",
          last_contact_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (leadError) {
        console.error("Error creating lead:", leadError);
        continue;
      }

      // Log first message
      await supabase.from("chat_messages").insert({
        lead_id: lead.id,
        sender_type: "agent",
        content: firstMessage,
        status: "sent",
      });

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: userId,
        lead_id: lead.id,
        activity_type: "lead_created",
        description: `Novo lead prospectado: ${leadData.business_name}`,
        metadata: { source: "hunter_agent" },
      });

      createdLeads.push(lead);

      // Send WhatsApp message via Evolution API
      if (settings.whatsapp_connected && settings.whatsapp_instance_id) {
        try {
          const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
          const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");

          if (EVOLUTION_API_URL && EVOLUTION_API_KEY) {
            // Format phone number
            let formattedPhone = leadData.phone.replace(/\D/g, "");
            if (!formattedPhone.startsWith("55") && formattedPhone.length <= 11) {
              formattedPhone = "55" + formattedPhone;
            }

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
                  text: firstMessage,
                }),
              }
            );

            if (sendResponse.ok) {
              console.log(`WhatsApp message sent to ${leadData.phone}`);
              
              // Update message status
              await supabase
                .from("chat_messages")
                .update({ status: "delivered" })
                .eq("lead_id", lead.id)
                .eq("sender_type", "agent");
            } else {
              console.error(`Failed to send WhatsApp to ${leadData.phone}`);
            }
          }
        } catch (whatsappError) {
          console.error("WhatsApp send error:", whatsappError);
        }
      } else {
        console.log(`WhatsApp not connected - would send to ${leadData.phone}: ${firstMessage.substring(0, 50)}...`);
      }

      // Trigger webhook if configured
      if (settings.webhook_url) {
        try {
          await fetch(settings.webhook_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "lead_contacted",
              lead,
              message: firstMessage,
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (webhookError) {
          console.error("Webhook error:", webhookError);
        }
      }
    }

    console.log(`Hunter agent completed. Created ${createdLeads.length} leads.`);

    return new Response(
      JSON.stringify({
        success: true,
        leads_created: createdLeads.length,
        leads: createdLeads,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Hunter agent error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
