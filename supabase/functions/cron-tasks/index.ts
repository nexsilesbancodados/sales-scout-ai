import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function is called by an external cron service (e.g., cron-job.org, Uptime Robot)
// to perform maintenance tasks
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const { task } = body;

    const results: Record<string, any> = {};

    // Task 1: Recover stale background jobs
    if (!task || task === "recover_jobs") {
      const { data: recovered } = await supabase.rpc("recover_stale_jobs");
      results.recovered_jobs = recovered || 0;
      console.log(`Recovered ${recovered || 0} stale jobs`);

      // Start any pending jobs
      const { data: pendingJobs } = await supabase
        .from("background_jobs")
        .select("id")
        .eq("status", "pending")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(5);

      if (pendingJobs && pendingJobs.length > 0) {
        // Trigger job processor for each pending job
        for (const job of pendingJobs) {
          await supabase.functions.invoke("job-processor", {
            body: { action: "resume", job_id: job.id },
          });
        }
        results.started_jobs = pendingJobs.length;
      }
    }

    // Task 2: Recalculate lead scores for active leads
    if (!task || task === "score_leads") {
      const { data: leads } = await supabase
        .from("leads")
        .select("id")
        .or("last_scored_at.is.null,last_scored_at.lt." + new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(100);

      let scored = 0;
      for (const lead of leads || []) {
        await supabase.rpc("calculate_lead_score", { p_lead_id: lead.id });
        scored++;
      }
      results.scored_leads = scored;
      console.log(`Scored ${scored} leads`);
    }

    // Task 3: Check for follow-ups due
    if (!task || task === "check_followups") {
      const now = new Date().toISOString();
      
      const { data: dueFollowups } = await supabase
        .from("leads")
        .select("id, user_id, business_name, phone")
        .lte("next_follow_up_at", now)
        .not("next_follow_up_at", "is", null)
        .limit(50);

      results.due_followups = dueFollowups?.length || 0;
      
      // Store notifications for users
      for (const lead of dueFollowups || []) {
        await supabase.from("activity_log").insert({
          user_id: lead.user_id,
          activity_type: "followup_due",
          description: `Follow-up pendente: ${lead.business_name}`,
          lead_id: lead.id,
          metadata: { phone: lead.phone },
        });
      }
    }

    // Task 4: Cleanup old completed jobs (older than 30 days)
    if (!task || task === "cleanup") {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { count } = await supabase
        .from("background_jobs")
        .delete()
        .in("status", ["completed", "failed", "cancelled"])
        .lt("completed_at", thirtyDaysAgo);
      
      results.cleaned_jobs = count || 0;
    }

    // Task 5: Send daily reports
    if (!task || task === "send_reports") {
      const now = new Date();
      const hour = now.getUTCHours();
      if (hour >= 11 && hour < 12) {
        const { data: usersWithReport } = await supabase
          .from("user_settings")
          .select("user_id")
          .eq("daily_report_enabled", true);
        for (const userSetting of usersWithReport || []) {
          await supabase.functions.invoke("send-report", {
            body: { user_id: userSetting.user_id },
          });
        }
        results.reports_sent = usersWithReport?.length || 0;
      }
    }

    console.log("Cron tasks completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cron error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
