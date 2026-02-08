-- Add missing UPDATE and DELETE policies for activity_log for security completeness
-- Activity logs should be append-only (immutable), so we deny updates and deletes

-- Drop existing policies if any for these operations
DROP POLICY IF EXISTS "Users cannot update activity logs" ON public.activity_log;
DROP POLICY IF EXISTS "Users cannot delete activity logs" ON public.activity_log;

-- Create restrictive policies - activity logs are immutable
CREATE POLICY "Users cannot update activity logs" 
ON public.activity_log 
FOR UPDATE 
USING (false);

CREATE POLICY "Users cannot delete activity logs" 
ON public.activity_log 
FOR DELETE 
USING (false);

-- Also ensure job_logs are immutable
DROP POLICY IF EXISTS "Users cannot update job logs" ON public.job_logs;
DROP POLICY IF EXISTS "Users cannot delete job logs" ON public.job_logs;

CREATE POLICY "Users cannot update job logs" 
ON public.job_logs 
FOR UPDATE 
USING (false);

CREATE POLICY "Users cannot delete job logs" 
ON public.job_logs 
FOR DELETE 
USING (false);