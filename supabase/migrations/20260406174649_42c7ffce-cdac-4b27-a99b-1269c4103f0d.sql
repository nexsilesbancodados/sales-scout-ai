SELECT cron.schedule(
  'cron-tasks-every-5min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://oeztpxyprifabkvysroh.supabase.co/functions/v1/cron-tasks',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lenRweHlwcmlmYWJrdnlzcm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTIyODAsImV4cCI6MjA4NTg4ODI4MH0.rGGWHPQTpMsyFPnSBw9XkaDEdmHlcaJJo8tJtfg3IaA"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);