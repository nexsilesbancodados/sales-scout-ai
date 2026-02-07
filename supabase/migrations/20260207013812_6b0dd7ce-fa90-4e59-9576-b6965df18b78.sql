-- Drop the permissive INSERT policy
DROP POLICY IF EXISTS "Service role can insert job logs" ON public.job_logs;

-- For job_logs, inserts will only happen from Edge Functions using service role key
-- which bypasses RLS entirely. No INSERT policy needed for authenticated users.