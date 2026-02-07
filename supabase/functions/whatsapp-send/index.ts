const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, message, instance_id } = await req.json();

    if (!phone || !message || !instance_id) {
      return new Response(
        JSON.stringify({ error: "Missing phone, message, or instance_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      throw new Error("Evolution API not configured");
    }

    // Check connection status before sending
    console.log(`Checking connection status for instance ${instance_id}`);
    const statusResponse = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instance_id}`, {
      method: "GET",
      headers: {
        "apikey": EVOLUTION_API_KEY,
      },
    });

    if (!statusResponse.ok) {
      const statusError = await statusResponse.text();
      console.error("Status check error:", statusError);
      throw new Error(`WhatsApp desconectado. Por favor, reconecte na página de Configurações.`);
    }

    const statusData = await statusResponse.json();
    console.log("Connection status:", statusData);

    // Check if instance is connected (state should be "open")
    const connectionState = statusData?.instance?.state || statusData?.state;
    if (connectionState !== "open") {
      console.error("WhatsApp not connected. Current state:", connectionState);
      throw new Error(`WhatsApp não está conectado (estado: ${connectionState || 'desconhecido'}). Reconecte em Configurações.`);
    }

    // Format phone number (remove non-digits, ensure country code)
    let formattedPhone = phone.replace(/\D/g, "");
    if (!formattedPhone.startsWith("55") && formattedPhone.length <= 11) {
      formattedPhone = "55" + formattedPhone;
    }

    console.log(`Sending message to ${formattedPhone} via instance ${instance_id}`);

    // Send message via Evolution API
    const sendResponse = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instance_id}`, {
      method: "POST",
      headers: {
        "apikey": EVOLUTION_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: message,
      }),
    });

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      console.error("Evolution send error:", errorText);
      
      // Parse error to give better user feedback
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.response?.message?.includes("Connection Closed") || 
            errorData.message?.includes("Connection Closed")) {
          throw new Error("Conexão WhatsApp perdida. Por favor, reconecte em Configurações.");
        }
      } catch (e) {
        // If parse fails, use generic message
      }
      
      throw new Error(`Falha ao enviar mensagem: ${errorText}`);
    }

    const sendData = await sendResponse.json();
    console.log("Message sent successfully:", sendData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message_id: sendData.key?.id || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send message",
        needsReconnect: error.message?.includes("reconecte") || error.message?.includes("desconectado") 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});