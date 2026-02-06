-- Create background jobs table for persistent task processing
CREATE TABLE public.background_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('mass_send', 'campaign', 'follow_up', 'prospecting', 'import')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled')),
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  
  -- Job configuration
  payload JSONB NOT NULL DEFAULT '{}',
  
  -- Progress tracking
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  current_index INTEGER DEFAULT 0,
  
  -- Results and errors
  result JSONB,
  error_message TEXT,
  last_error_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Timing
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_heartbeat_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own jobs" ON public.background_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jobs" ON public.background_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs" ON public.background_jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs" ON public.background_jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Index for efficient job processing queries
CREATE INDEX idx_background_jobs_status ON public.background_jobs(status, scheduled_at);
CREATE INDEX idx_background_jobs_user_status ON public.background_jobs(user_id, status);
CREATE INDEX idx_background_jobs_heartbeat ON public.background_jobs(status, last_heartbeat_at) 
  WHERE status = 'running';

-- Trigger for updated_at
CREATE TRIGGER update_background_jobs_updated_at
  BEFORE UPDATE ON public.background_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to find stale jobs (no heartbeat for 5 minutes) and mark them for retry
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.recover_stale_jobs() TO authenticated;
GRANT EXECUTE ON FUNCTION public.recover_stale_jobs() TO service_role;