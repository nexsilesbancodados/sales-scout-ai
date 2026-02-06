-- Fix search_path for recover_stale_jobs function
CREATE OR REPLACE FUNCTION public.recover_stale_jobs()
RETURNS INTEGER AS $$
DECLARE
  recovered_count INTEGER;
BEGIN
  UPDATE public.background_jobs
  SET 
    status = CASE 
      WHEN retry_count < max_retries THEN 'pending'
      ELSE 'failed'
    END,
    retry_count = retry_count + 1,
    error_message = CASE 
      WHEN retry_count < max_retries THEN 'Job recovered after timeout - will retry'
      ELSE 'Job failed after maximum retries'
    END,
    last_error_at = now(),
    updated_at = now()
  WHERE status = 'running'
    AND last_heartbeat_at < now() - interval '5 minutes';
  
  GET DIAGNOSTICS recovered_count = ROW_COUNT;
  RETURN recovered_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;