-- Create prospecting_history table to track all prospecting sessions
CREATE TABLE public.prospecting_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'capture', -- capture, mass_send, campaign, import
  niche TEXT,
  location TEXT,
  total_found INTEGER DEFAULT 0,
  total_saved INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_errors INTEGER DEFAULT 0,
  total_duplicates INTEGER DEFAULT 0,
  total_pending INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running', -- running, completed, failed, cancelled
  error_message TEXT,
  leads_data JSONB DEFAULT '[]'::jsonb, -- Store captured leads details
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.prospecting_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own prospecting history" 
ON public.prospecting_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prospecting history" 
ON public.prospecting_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prospecting history" 
ON public.prospecting_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prospecting history" 
ON public.prospecting_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_prospecting_history_user_id ON public.prospecting_history(user_id);
CREATE INDEX idx_prospecting_history_created_at ON public.prospecting_history(created_at DESC);
CREATE INDEX idx_prospecting_history_status ON public.prospecting_history(status);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_prospecting_history_updated_at
BEFORE UPDATE ON public.prospecting_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();