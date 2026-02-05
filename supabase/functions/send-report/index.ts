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

    if (!settings.daily_report_enabled) {
      return new Response(JSON.stringify({ success: true, message: "Reports disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Generating report for user: ${userId}`);

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Get yesterday's date range
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    // Get metrics
    const { data: newLeads } = await supabase
      .from("leads")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", yesterday.toISOString())
      .lte("created_at", endOfYesterday.toISOString());

    const { data: newMeetings } = await supabase
      .from("meetings")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", yesterday.toISOString())
      .lte("created_at", endOfYesterday.toISOString());

    const { data: messages } = await supabase
      .from("chat_messages")
      .select("id, lead_id")
      .in(
        "lead_id",
        (await supabase.from("leads").select("id").eq("user_id", userId)).data?.map(
          (l) => l.id
        ) || []
      )
      .gte("sent_at", yesterday.toISOString())
      .lte("sent_at", endOfYesterday.toISOString());

    const { data: allLeads } = await supabase
      .from("leads")
      .select("stage, temperature")
      .eq("user_id", userId);

    // Calculate stats
    const stats = {
      newLeads: newLeads?.length || 0,
      newMeetings: newMeetings?.length || 0,
      messagesSent: messages?.length || 0,
      totalLeads: allLeads?.length || 0,
      hotLeads: allLeads?.filter((l) => l.temperature === "quente").length || 0,
      warmLeads: allLeads?.filter((l) => l.temperature === "morno").length || 0,
      coldLeads: allLeads?.filter((l) => l.temperature === "frio").length || 0,
      wonLeads: allLeads?.filter((l) => l.stage === "Ganho").length || 0,
    };

    const conversionRate =
      stats.totalLeads > 0 ? ((stats.wonLeads / stats.totalLeads) * 100).toFixed(1) : "0";

    // Generate report using AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content: `Você é um assistente de relatórios. Crie um breve relatório diário de prospecção em português.
Use emojis para tornar visual. Seja conciso e motivador.`,
            },
            {
              role: "user",
              content: `Gere um relatório para ${profile?.full_name || "o usuário"} com estas métricas de ontem:
- Novos leads: ${stats.newLeads}
- Reuniões agendadas: ${stats.newMeetings}
- Mensagens enviadas: ${stats.messagesSent}
- Total de leads: ${stats.totalLeads}
- Leads quentes: ${stats.hotLeads}
- Leads mornos: ${stats.warmLeads}
- Leads frios: ${stats.coldLeads}
- Taxa de conversão: ${conversionRate}%

Inclua uma dica motivacional no final.`,
            },
          ],
        }),
      }
    );

    let reportText = "";
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      reportText = aiData.choices?.[0]?.message?.content || "";
    }

    // Default report if AI fails
    if (!reportText) {
      reportText = `📊 Relatório Diário - Prospecte

Olá ${profile?.full_name || ""}!

📈 Resumo de ontem:
• Novos leads: ${stats.newLeads}
• Reuniões agendadas: ${stats.newMeetings}
• Mensagens enviadas: ${stats.messagesSent}

📊 Visão geral:
• Total de leads: ${stats.totalLeads}
• 🔥 Quentes: ${stats.hotLeads}
• ☀️ Mornos: ${stats.warmLeads}
• ❄️ Frios: ${stats.coldLeads}
• Taxa de conversão: ${conversionRate}%

Continue prospectando! 🚀`;
    }

    // TODO: Send email using Resend or another service
    console.log("Report generated:", reportText);
    console.log("Would send email to:", profile?.email);

    return new Response(
      JSON.stringify({
        success: true,
        report: reportText,
        stats,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Report error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
