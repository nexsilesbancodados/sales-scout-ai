import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, data } = await req.json();
    console.log(`Scheduled prospecting action: ${action}`);

    switch (action) {
      case 'check_and_run': {
        // This is called by a cron job to check for scheduled prospecting tasks
        const now = new Date();
        const currentHour = now.getUTCHours();
        const currentDay = now.getDay(); // 0 = Sunday

        console.log(`Checking schedules for hour ${currentHour}, day ${currentDay}`);

        // Find active schedules that should run now
        const { data: schedules, error } = await supabase
          .from('scheduled_prospecting')
          .select('*')
          .eq('is_active', true)
          .contains('schedule_days', [currentDay])
          .eq('schedule_hour', currentHour);

        if (error) {
          console.error('Error fetching schedules:', error);
          throw error;
        }

        console.log(`Found ${schedules?.length || 0} schedules to run`);

        const results = [];
        for (const schedule of schedules || []) {
          // Check if already ran today
          if (schedule.last_run_at) {
            const lastRun = new Date(schedule.last_run_at);
            const today = new Date();
            if (lastRun.toDateString() === today.toDateString()) {
              console.log(`Schedule ${schedule.id} already ran today, skipping`);
              continue;
            }
          }

          console.log(`Running schedule: ${schedule.name}`);
          
          // Call the ai-prospecting function to capture leads
          // This would be implemented in a real scenario
          // For now, we just log and update the schedule
          
          const { error: updateError } = await supabase
            .from('scheduled_prospecting')
            .update({
              last_run_at: now.toISOString(),
              next_run_at: getNextRunTime(schedule.schedule_days, schedule.schedule_hour),
            })
            .eq('id', schedule.id);

          if (updateError) {
            console.error(`Error updating schedule ${schedule.id}:`, updateError);
          }

          results.push({
            schedule_id: schedule.id,
            name: schedule.name,
            status: 'triggered',
          });
        }

        return new Response(
          JSON.stringify({ success: true, results }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create': {
        // Create a new scheduled prospecting
        const authHeader = req.headers.get('Authorization');
        const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
          global: { headers: { Authorization: authHeader! } }
        });

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const scheduleData = {
          user_id: user.id,
          name: data.name,
          niches: data.niches,
          locations: data.locations,
          prospecting_type: data.prospecting_type || 'consultivo',
          schedule_days: data.schedule_days || [1, 2, 3, 4, 5],
          schedule_hour: data.schedule_hour || 9,
          max_leads_per_run: data.max_leads_per_run || 20,
          is_active: true,
          next_run_at: getNextRunTime(data.schedule_days || [1, 2, 3, 4, 5], data.schedule_hour || 9),
        };

        const { data: schedule, error } = await supabaseClient
          .from('scheduled_prospecting')
          .insert(scheduleData)
          .select()
          .single();

        if (error) {
          console.error('Error creating schedule:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, schedule }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'toggle': {
        const authHeader = req.headers.get('Authorization');
        const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
          global: { headers: { Authorization: authHeader! } }
        });

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { id, is_active } = data;
        const { error } = await supabaseClient
          .from('scheduled_prospecting')
          .update({ is_active })
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        const authHeader = req.headers.get('Authorization');
        const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
          global: { headers: { Authorization: authHeader! } }
        });

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { id } = data;
        const { error } = await supabaseClient
          .from('scheduled_prospecting')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Scheduled prospecting error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getNextRunTime(scheduleDays: number[], hour: number): string {
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getUTCHours();

  // Sort days
  const sortedDays = [...scheduleDays].sort((a, b) => a - b);
  
  // Find next scheduled day
  let nextDay = sortedDays.find(d => d > currentDay || (d === currentDay && hour > currentHour));
  
  if (nextDay === undefined) {
    // Wrap to next week
    nextDay = sortedDays[0];
  }

  // Calculate days until next run
  let daysUntil = nextDay - currentDay;
  if (daysUntil < 0 || (daysUntil === 0 && hour <= currentHour)) {
    daysUntil += 7;
  }

  const nextRun = new Date(now);
  nextRun.setDate(nextRun.getDate() + daysUntil);
  nextRun.setUTCHours(hour, 0, 0, 0);

  return nextRun.toISOString();
}
