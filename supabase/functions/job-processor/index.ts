import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BackgroundJob {
  id: string;
  user_id: string;
  job_type: string;
  status: string;
  payload: any;
  total_items: number;
  processed_items: number;
  failed_items: number;
  current_index: number;
  retry_count: number;
  max_retries: number;
}

// Process a single job item
async function processJobItem(
  supabase: any,
  job: BackgroundJob,
  index: number,
  userSettings: any
): Promise<{ success: boolean; error?: string }> {
  const { job_type, payload } = job;

  try {
    switch (job_type) {
      case "mass_send": {
        const leads = payload.leads || [];
        const lead = leads[index];
        if (!lead) return { success: true };

        // Send WhatsApp message
        const message = payload.message_template
          .replace(/{nome}/gi, lead.business_name || "")
          .replace(/{empresa}/gi, lead.business_name || "")
          .replace(/{telefone}/gi, lead.phone || "");

        const response = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/whatsapp-send`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              phone: lead.phone,
              message,
              instance_id: userSettings.whatsapp_instance_id,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          return { success: false, error };
        }

        // Save message to database
        await supabase.from("chat_messages").insert({
          lead_id: lead.id,
          content: message,
          sender_type: "user",
          status: "sent",
        });

        // Update lead's last_contact_at
        await supabase
          .from("leads")
          .update({ last_contact_at: new Date().toISOString() })
          .eq("id", lead.id);

        // Random delay between messages (anti-block)
        const minInterval = userSettings.message_interval_seconds || 30;
        const maxInterval = minInterval + 30;
        const delay = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
        await new Promise((resolve) => setTimeout(resolve, delay * 1000));

        return { success: true };
      }

      case "follow_up": {
        const leads = payload.leads || [];
        const lead = leads[index];
        if (!lead) return { success: true };

        const message = payload.message_template
          .replace(/{nome}/gi, lead.business_name || "")
          .replace(/{empresa}/gi, lead.business_name || "");

        const response = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/whatsapp-send`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              phone: lead.phone,
              message,
              instance_id: userSettings.whatsapp_instance_id,
            }),
          }
        );

        if (!response.ok) {
          return { success: false, error: await response.text() };
        }

        // Update follow-up count
        await supabase
          .from("leads")
          .update({
            follow_up_count: (lead.follow_up_count || 0) + 1,
            last_contact_at: new Date().toISOString(),
          })
          .eq("id", lead.id);

        return { success: true };
      }

      case "prospecting": {
        // Prospecting is handled by ai-prospecting function
        // This just tracks progress
        return { success: true };
      }

      default:
        return { success: true };
    }
  } catch (error) {
    console.error(`Error processing job item ${index}:`, error);
    return { success: false, error: error.message };
  }
}

// Main job processing function
async function processJob(supabase: any, job: BackgroundJob) {
  console.log(`Processing job ${job.id} (${job.job_type}) from index ${job.current_index}`);

  // Get user settings
  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", job.user_id)
    .single();

  if (!userSettings?.whatsapp_connected) {
    await supabase
      .from("background_jobs")
      .update({
        status: "failed",
        error_message: "WhatsApp não conectado",
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);
    return;
  }

  // Mark job as running
  await supabase
    .from("background_jobs")
    .update({
      status: "running",
      started_at: job.started_at || new Date().toISOString(),
      last_heartbeat_at: new Date().toISOString(),
    })
    .eq("id", job.id);

  const totalItems = job.total_items;
  let processedItems = job.processed_items;
  let failedItems = job.failed_items;
  let currentIndex = job.current_index;

  // Process items from current index
  for (let i = currentIndex; i < totalItems; i++) {
    // Update heartbeat every iteration
    await supabase
      .from("background_jobs")
      .update({
        current_index: i,
        processed_items: processedItems,
        failed_items: failedItems,
        last_heartbeat_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    // Check if job was cancelled
    const { data: currentJob } = await supabase
      .from("background_jobs")
      .select("status")
      .eq("id", job.id)
      .single();

    if (currentJob?.status === "cancelled" || currentJob?.status === "paused") {
      console.log(`Job ${job.id} was ${currentJob.status}`);
      return;
    }

    // Process item
    const result = await processJobItem(supabase, job, i, userSettings);

    if (result.success) {
      processedItems++;
    } else {
      failedItems++;
      console.error(`Item ${i} failed:`, result.error);
    }
  }

  // Mark job as completed
  await supabase
    .from("background_jobs")
    .update({
      status: "completed",
      processed_items: processedItems,
      failed_items: failedItems,
      current_index: totalItems,
      completed_at: new Date().toISOString(),
      result: {
        total: totalItems,
        processed: processedItems,
        failed: failedItems,
      },
    })
    .eq("id", job.id);

  console.log(`Job ${job.id} completed: ${processedItems}/${totalItems} processed, ${failedItems} failed`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const { action, job_id, user_id } = body;

    switch (action) {
      case "create": {
        // Create a new job
        const { job_type, payload, total_items, priority = 5 } = body;

        if (!user_id || !job_type || !payload) {
          return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: job, error } = await supabase
          .from("background_jobs")
          .insert({
            user_id,
            job_type,
            payload,
            total_items: total_items || 0,
            priority,
            status: "pending",
          })
          .select()
          .single();

        if (error) throw error;

        // Start processing in background
        EdgeRuntime.waitUntil(
          (async () => {
            await new Promise((r) => setTimeout(r, 1000)); // Small delay
            await processJob(supabase, job);
          })()
        );

        return new Response(
          JSON.stringify({ success: true, job }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "pause": {
        if (!job_id) {
          return new Response(
            JSON.stringify({ error: "job_id required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        await supabase
          .from("background_jobs")
          .update({ status: "paused" })
          .eq("id", job_id);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "resume": {
        if (!job_id) {
          return new Response(
            JSON.stringify({ error: "job_id required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: job } = await supabase
          .from("background_jobs")
          .select("*")
          .eq("id", job_id)
          .single();

        if (!job) {
          return new Response(
            JSON.stringify({ error: "Job not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Resume in background
        EdgeRuntime.waitUntil(processJob(supabase, job));

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "cancel": {
        if (!job_id) {
          return new Response(
            JSON.stringify({ error: "job_id required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        await supabase
          .from("background_jobs")
          .update({ status: "cancelled", completed_at: new Date().toISOString() })
          .eq("id", job_id);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "recover": {
        // Recover stale jobs - called by cron
        const { data: recoveredCount } = await supabase.rpc("recover_stale_jobs");

        // Find pending jobs and start them
        const { data: pendingJobs } = await supabase
          .from("background_jobs")
          .select("*")
          .eq("status", "pending")
          .order("priority", { ascending: false })
          .order("created_at", { ascending: true })
          .limit(5);

        for (const job of pendingJobs || []) {
          EdgeRuntime.waitUntil(processJob(supabase, job));
        }

        return new Response(
          JSON.stringify({
            success: true,
            recovered: recoveredCount,
            started: pendingJobs?.length || 0,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "status": {
        // Get job status
        const { data: jobs } = await supabase
          .from("background_jobs")
          .select("*")
          .eq("user_id", user_id)
          .order("created_at", { ascending: false })
          .limit(20);

        return new Response(
          JSON.stringify({ jobs }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Job processor error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Handle shutdown gracefully
addEventListener("beforeunload", (ev) => {
  console.log("Job processor shutting down:", ev.detail?.reason);
});
