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

    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Evolution API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, phoneNumber } = await req.json();
    const instanceName = `prospecte_${user.id.replace(/-/g, "_")}`;

    const supabaseService = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "create_instance") {
      console.log(`Creating instance: ${instanceName}`);
      
      // Get webhook URL for this instance
      const webhookUrl = `${supabaseUrl}/functions/v1/webhook`;
      
      const createResponse = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
        method: "POST",
        headers: {
          "apikey": EVOLUTION_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceName,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS",
          webhook: {
            url: webhookUrl,
            byEvents: false,
            base64: false,
            headers: {
              "Content-Type": "application/json",
            },
            events: [
              "MESSAGES_UPSERT",
              "CONNECTION_UPDATE",
              "QRCODE_UPDATED",
            ],
          },
          websocket: {
            enabled: false,
          },
          rabbitmq: {
            enabled: false,
          },
          sqs: {
            enabled: false,
          },
          chatwoot: {
            enabled: false,
          },
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.text();
        console.error("Evolution create error:", errorData);
        
        // If instance already exists, try to get QR code
        if (errorData.includes("already") || errorData.includes("exists") || errorData.includes("Instance already")) {
          console.log("Instance exists, fetching QR code...");
          const connectResponse = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
            method: "GET",
            headers: { "apikey": EVOLUTION_API_KEY },
          });
          
          if (connectResponse.ok) {
            const connectData = await connectResponse.json();
            
            // Update webhook for existing instance
            await fetch(`${EVOLUTION_API_URL}/webhook/set/${instanceName}`, {
              method: "POST",
              headers: {
                "apikey": EVOLUTION_API_KEY,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                url: webhookUrl,
                byEvents: false,
                base64: false,
                events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE", "QRCODE_UPDATED"],
              }),
            });
            
            return new Response(JSON.stringify(connectData), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
        
        throw new Error(`Failed to create WhatsApp instance: ${errorData}`);
      }

      const instanceData = await createResponse.json();
      console.log("Instance created successfully:", JSON.stringify(instanceData));

      await supabaseService
        .from("user_settings")
        .update({ whatsapp_instance_id: instanceName })
        .eq("user_id", user.id);

      // Extract QR code from creation response if available
      const base64 = instanceData.qrcode?.base64 || instanceData.base64;
      const pairingCode = instanceData.qrcode?.pairingCode || instanceData.pairingCode;
      
      return new Response(JSON.stringify({
        ...instanceData,
        base64,
        pairingCode,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_qrcode") {
      console.log(`Getting QR code for: ${instanceName}`);
      
      const qrResponse = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
        method: "GET",
        headers: { "apikey": EVOLUTION_API_KEY },
      });

      if (!qrResponse.ok) {
        const errorText = await qrResponse.text();
        console.error("QR code error:", errorText);
        throw new Error("Failed to get QR code");
      }

      const qrData = await qrResponse.json();
      console.log("QR Response keys:", Object.keys(qrData));
      console.log("QR Data:", JSON.stringify(qrData).substring(0, 500));
      
      // Evolution API returns QR in different formats depending on version
      // Try to extract base64 from various possible locations
      const base64 = qrData.base64 || qrData.qrcode?.base64 || qrData.code;
      const pairingCode = qrData.pairingCode || qrData.pairing_code;
      
      return new Response(JSON.stringify({
        base64,
        code: qrData.code || qrData.qrcode?.code,
        pairingCode,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_pairing_code") {
      if (!phoneNumber) {
        return new Response(
          JSON.stringify({ error: "Phone number is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Format phone number - ensure it has country code (Brazil = 55)
      let formattedPhone = phoneNumber.replace(/\D/g, "");
      if (!formattedPhone.startsWith("55")) {
        formattedPhone = "55" + formattedPhone;
      }
      console.log(`Getting pairing code for: ${instanceName}, phone: ${formattedPhone}`);
      
      // First check if instance exists
      const statusResponse = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
        method: "GET",
        headers: { "apikey": EVOLUTION_API_KEY },
      });

      if (!statusResponse.ok) {
        // Instance doesn't exist, create it first with the phone number
        console.log("Instance doesn't exist, creating with phone number...");
        const webhookUrl = `${supabaseUrl}/functions/v1/webhook`;
        const createResponse = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
          method: "POST",
          headers: {
            "apikey": EVOLUTION_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instanceName,
            number: formattedPhone,
            qrcode: false,
            integration: "WHATSAPP-BAILEYS",
            webhook: {
              url: webhookUrl,
              byEvents: false,
              base64: false,
              events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE", "QRCODE_UPDATED"],
            },
          }),
        });

        if (createResponse.ok) {
          const createData = await createResponse.json();
          console.log("Instance created with pairing code:", JSON.stringify(createData).substring(0, 500));
          
          // Check if pairing code is in creation response
          const pairingCode = createData.pairingCode || createData.pairing_code;
          if (pairingCode) {
            await supabaseService
              .from("user_settings")
              .update({ whatsapp_instance_id: instanceName })
              .eq("user_id", user.id);
            
            return new Response(JSON.stringify({
              pairingCode,
              phoneNumber: formattedPhone,
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      }

      // Instance exists, need to reconnect with phone number to get pairing code
      // First delete the existing instance and recreate with phone
      console.log("Recreating instance with phone number...");
      
      // Delete existing instance
      await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
        method: "DELETE",
        headers: { "apikey": EVOLUTION_API_KEY },
      });

      // Wait a moment for deletion
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new instance with phone number for pairing code
      const webhookUrl = `${supabaseUrl}/functions/v1/webhook`;
      const createResponse = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
        method: "POST",
        headers: {
          "apikey": EVOLUTION_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceName,
          number: formattedPhone,
          qrcode: false,
          integration: "WHATSAPP-BAILEYS",
          webhook: {
            url: webhookUrl,
            byEvents: false,
            base64: false,
            events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE", "QRCODE_UPDATED"],
          },
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error("Failed to create instance with phone:", errorText);
        throw new Error("Failed to generate pairing code");
      }

      const createData = await createResponse.json();
      console.log("Instance created response:", JSON.stringify(createData).substring(0, 500));
      
      const pairingCode = createData.pairingCode || createData.pairing_code;
      
      if (!pairingCode) {
        console.error("No pairing code in response:", createData);
        throw new Error("Pairing code not available. Try QR Code instead.");
      }
      
      // Update user settings with instance ID
      await supabaseService
        .from("user_settings")
        .update({ whatsapp_instance_id: instanceName })
        .eq("user_id", user.id);
      
      return new Response(JSON.stringify({
        pairingCode,
        phoneNumber: formattedPhone,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "check_status") {
      console.log(`Checking status for: ${instanceName}`);
      
      const statusResponse = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
        method: "GET",
        headers: { "apikey": EVOLUTION_API_KEY },
      });

      if (!statusResponse.ok) {
        return new Response(
          JSON.stringify({ connected: false, state: "disconnected" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const statusData = await statusResponse.json();
      const isConnected = statusData.instance?.state === "open";

      await supabaseService
        .from("user_settings")
        .update({ 
          whatsapp_connected: isConnected,
          whatsapp_instance_id: instanceName,
        })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ 
          connected: isConnected, 
          state: statusData.instance?.state || "unknown" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "disconnect") {
      console.log(`Disconnecting: ${instanceName}`);
      
      await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, {
        method: "DELETE",
        headers: { "apikey": EVOLUTION_API_KEY },
      });

      await supabaseService
        .from("user_settings")
        .update({ whatsapp_connected: false })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("WhatsApp connect error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
