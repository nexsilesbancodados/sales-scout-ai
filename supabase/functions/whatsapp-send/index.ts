import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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
      throw new Error(`Failed to send message: ${errorText}`);
    }

    const sendData = await sendResponse.json();
    console.log("Message sent:", sendData);

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
      JSON.stringify({ error: error.message || "Failed to send message" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
