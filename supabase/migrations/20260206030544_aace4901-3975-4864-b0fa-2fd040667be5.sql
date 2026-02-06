-- Schedule prospecting check every hour at minute 0
SELECT cron.schedule(
  'scheduled-prospecting-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://oeztpxyprifabkvysroh.supabase.co/functions/v1/scheduled-prospecting',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lenRweHlwcmlmYWJrdnlzcm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTIyODAsImV4cCI6MjA4NTg4ODI4MH0.rGGWHPQTpMsyFPnSBw9XkaDEdmHlcaJJo8tJtfg3IaA"}'::jsonb,
    body := '{"action": "check_and_run"}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule follow-up check every 30 minutes
SELECT cron.schedule(
  'follow-up-check',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://oeztpxyprifabkvysroh.supabase.co/functions/v1/follow-up',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lenRweHlwcmlmYWJrdnlzcm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTIyODAsImV4cCI6MjA4NTg4ODI4MH0.rGGWHPQTpMsyFPnSBw9XkaDEdmHlcaJJo8tJtfg3IaA"}'::jsonb,
    body := '{"action": "process_follow_ups"}'::jsonb
  ) AS request_id;
  $$
);