-- Fix: Add INSERT policy for job_logs
CREATE POLICY "Users can insert their own job logs"
ON public.job_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Fix: Add UPDATE policy for buying_signals
CREATE POLICY "Users can update their own buying signals"
ON public.buying_signals
FOR UPDATE
USING (auth.uid() = user_id);

-- Fix: Add Realtime authorization for meetings
ALTER PUBLICATION supabase_realtime DROP TABLE meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE meetings;