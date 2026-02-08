-- Create table for long-term memory of conversations
CREATE TABLE public.lead_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL DEFAULT 'context', -- 'context', 'preference', 'objection', 'commitment', 'personal'
  key TEXT NOT NULL, -- e.g., 'preferred_contact_time', 'budget_mentioned', 'competitor_name'
  value TEXT NOT NULL, -- the actual memory content
  confidence NUMERIC(3,2) DEFAULT 1.0, -- 0.0 to 1.0 confidence score
  source TEXT DEFAULT 'conversation', -- 'conversation', 'manual', 'ai_analysis'
  expires_at TIMESTAMP WITH TIME ZONE, -- optional expiry for temporary memories
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lead_id, memory_type, key)
);

-- Enable RLS
ALTER TABLE public.lead_memory ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own lead memories" 
ON public.lead_memory FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create lead memories" 
ON public.lead_memory FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead memories" 
ON public.lead_memory FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead memories" 
ON public.lead_memory FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for fast lookups
CREATE INDEX idx_lead_memory_lead_id ON public.lead_memory(lead_id);
CREATE INDEX idx_lead_memory_user_lead ON public.lead_memory(user_id, lead_id);

-- Trigger to update updated_at
CREATE TRIGGER update_lead_memory_updated_at
BEFORE UPDATE ON public.lead_memory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add conversation context column to leads for quick summary
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS ai_memory_summary TEXT,
ADD COLUMN IF NOT EXISTS first_contact_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_messages_exchanged INTEGER DEFAULT 0;

-- Function to upsert memory
CREATE OR REPLACE FUNCTION public.upsert_lead_memory(
  p_user_id UUID,
  p_lead_id UUID,
  p_memory_type TEXT,
  p_key TEXT,
  p_value TEXT,
  p_confidence NUMERIC DEFAULT 1.0,
  p_source TEXT DEFAULT 'conversation'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_memory_id UUID;
BEGIN
  INSERT INTO public.lead_memory (user_id, lead_id, memory_type, key, value, confidence, source)
  VALUES (p_user_id, p_lead_id, p_memory_type, p_key, p_value, p_confidence, p_source)
  ON CONFLICT (lead_id, memory_type, key) 
  DO UPDATE SET 
    value = EXCLUDED.value,
    confidence = EXCLUDED.confidence,
    updated_at = now()
  RETURNING id INTO v_memory_id;
  
  RETURN v_memory_id;
END;
$$;