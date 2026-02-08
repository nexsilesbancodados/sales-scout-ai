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

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    const { action } = await req.json();

    if (action === "analyze_best_hours") {
      // Analyze response patterns by hour
      const { data: messages } = await supabase
        .from("chat_messages")
        .select(`
          id,
          created_at,
          sender_type,
          lead_id,
          leads!inner(niche, user_id)
        `)
        .eq("leads.user_id", userId)
        .eq("sender_type", "lead");

      // Group responses by hour and niche
      const hourPatterns: Record<string, Record<number, number>> = {};
      
      for (const msg of messages || []) {
        const hour = new Date(msg.created_at).getHours();
        const niche = (msg.leads as any)?.niche || "geral";
        
        if (!hourPatterns[niche]) {
          hourPatterns[niche] = {};
        }
        hourPatterns[niche][hour] = (hourPatterns[niche][hour] || 0) + 1;
      }

      // Update niche_patterns with best hours
      for (const [niche, hours] of Object.entries(hourPatterns)) {
        const sortedHours = Object.entries(hours)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([h]) => parseInt(h));

        await supabase
          .from("niche_patterns")
          .upsert({
            user_id: userId,
            niche,
            best_contact_hours: sortedHours,
            response_rate_by_hour: hours,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id,niche,location" });
      }

      return new Response(
        JSON.stringify({ success: true, patterns: hourPatterns }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "analyze_conversion_patterns") {
      // Get conversion data by niche
      const { data: leads } = await supabase
        .from("leads")
        .select("id, niche, stage, temperature, message_sent, last_response_at")
        .eq("user_id", userId);

      const nicheStats: Record<string, {
        total: number;
        contacted: number;
        responded: number;
        converted: number;
      }> = {};

      for (const lead of leads || []) {
        const niche = lead.niche || "geral";
        if (!nicheStats[niche]) {
          nicheStats[niche] = { total: 0, contacted: 0, responded: 0, converted: 0 };
        }

        nicheStats[niche].total++;
        if (lead.message_sent) nicheStats[niche].contacted++;
        if (lead.last_response_at) nicheStats[niche].responded++;
        if (lead.stage === "Ganho") nicheStats[niche].converted++;
      }

      // Update patterns with conversion data
      for (const [niche, stats] of Object.entries(nicheStats)) {
        const responseRate = stats.contacted > 0 
          ? (stats.responded / stats.contacted) * 100 
          : 0;
        const conversionRate = stats.responded > 0 
          ? (stats.converted / stats.responded) * 100 
          : 0;

        await supabase
          .from("niche_patterns")
          .upsert({
            user_id: userId,
            niche,
            total_contacts: stats.contacted,
            total_responses: stats.responded,
            total_conversions: stats.converted,
            response_rate: responseRate,
            conversion_rate: conversionRate,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id,niche,location" });
      }

      return new Response(
        JSON.stringify({ success: true, stats: nicheStats }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_insights") {
      // Get all patterns for the user
      const { data: patterns } = await supabase
        .from("niche_patterns")
        .select("*")
        .eq("user_id", userId)
        .order("response_rate", { ascending: false });

      // Get buying signals summary
      const { data: signals } = await supabase
        .from("buying_signals")
        .select("signal_type, signal_strength")
        .eq("user_id", userId);

      // Get pending escalations
      const { data: escalations } = await supabase
        .from("agent_escalations")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      // Get high probability leads
      const { data: hotLeads } = await supabase
        .from("lead_qualification")
        .select(`
          *,
          leads!inner(business_name, niche, phone)
        `)
        .eq("user_id", userId)
        .gte("close_probability", 70)
        .order("close_probability", { ascending: false })
        .limit(10);

      // Calculate insights
      const insights = {
        bestNiche: patterns?.[0],
        worstNiche: patterns?.[patterns?.length - 1],
        totalEscalations: escalations?.length || 0,
        urgentEscalations: escalations?.filter(e => e.priority === "urgent")?.length || 0,
        hotLeads: hotLeads?.length || 0,
        signalBreakdown: {} as Record<string, number>,
        recommendations: [] as string[],
      };

      // Count signals by type
      for (const signal of signals || []) {
        insights.signalBreakdown[signal.signal_type] = 
          (insights.signalBreakdown[signal.signal_type] || 0) + 1;
      }

      // Generate recommendations
      if (insights.bestNiche?.response_rate > 30) {
        insights.recommendations.push(
          `Foque no nicho "${insights.bestNiche.niche}" - taxa de resposta de ${insights.bestNiche.response_rate.toFixed(1)}%`
        );
      }
      if (insights.bestNiche?.best_contact_hours?.length) {
        insights.recommendations.push(
          `Melhores horários para ${insights.bestNiche.niche}: ${insights.bestNiche.best_contact_hours.map((h: number) => `${h}h`).join(', ')}`
        );
      }
      if (insights.urgentEscalations > 0) {
        insights.recommendations.push(
          `⚠️ Você tem ${insights.urgentEscalations} escalações urgentes pendentes!`
        );
      }
      if (insights.hotLeads > 0) {
        insights.recommendations.push(
          `🔥 ${insights.hotLeads} leads com alta probabilidade de fechamento precisam de atenção`
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          patterns,
          escalations,
          hotLeads,
          insights,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Analyze patterns error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to analyze patterns" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
