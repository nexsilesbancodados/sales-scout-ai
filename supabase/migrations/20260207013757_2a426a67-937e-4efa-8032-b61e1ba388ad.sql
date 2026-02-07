-- Create a table to store job logs for persistence
CREATE TABLE public.job_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.background_jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  level TEXT NOT NULL DEFAULT 'info', -- 'info', 'error', 'warning', 'success'
  message TEXT NOT NULL,
  metadata JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own logs
CREATE POLICY "Users can view their own job logs"
  ON public.job_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for inserting (only service role can insert)
CREATE POLICY "Service role can insert job logs"
  ON public.job_logs
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_job_logs_user_id ON public.job_logs(user_id);
CREATE INDEX idx_job_logs_job_id ON public.job_logs(job_id);
CREATE INDEX idx_job_logs_created_at ON public.job_logs(created_at DESC);