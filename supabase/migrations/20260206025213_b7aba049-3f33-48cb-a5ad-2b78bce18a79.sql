-- Create follow_up_sequences table for automated follow-up flows
CREATE TABLE public.follow_up_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  trigger_type TEXT NOT NULL DEFAULT 'no_response', -- 'no_response', 'new_lead', 'stage_change'
  trigger_after_days INTEGER[] DEFAULT ARRAY[1, 3, 5, 7, 14],
  message_templates JSONB DEFAULT '[]'::jsonb, -- Array of {day: number, template_id: uuid, message: text}
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scheduled_prospecting table for scheduled captures
CREATE TABLE public.scheduled_prospecting (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  niches TEXT[] NOT NULL DEFAULT '{}',
  locations TEXT[] NOT NULL DEFAULT '{}',
  prospecting_type TEXT DEFAULT 'consultivo',
  schedule_days INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5], -- 0=Sunday, 1=Monday, etc.
  schedule_hour INTEGER DEFAULT 9,
  max_leads_per_run INTEGER DEFAULT 20,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  total_leads_captured INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add enrichment columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS employee_count TEXT,
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS company_description TEXT,
ADD COLUMN IF NOT EXISTS hunter_email TEXT,
ADD COLUMN IF NOT EXISTS hunter_email_confidence INTEGER;

-- Enable RLS for follow_up_sequences
ALTER TABLE public.follow_up_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sequences"
ON public.follow_up_sequences
FOR ALL
USING (auth.uid() = user_id);

-- Enable RLS for scheduled_prospecting
ALTER TABLE public.scheduled_prospecting ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own scheduled prospecting"
ON public.scheduled_prospecting
FOR ALL
USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_follow_up_sequences_updated_at
BEFORE UPDATE ON public.follow_up_sequences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_prospecting_updated_at
BEFORE UPDATE ON public.scheduled_prospecting
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();