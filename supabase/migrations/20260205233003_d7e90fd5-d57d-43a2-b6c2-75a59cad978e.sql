-- Add new columns to leads table for advanced management
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1),
ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS best_contact_hour INTEGER;

-- Add new columns to user_settings for security and automation
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS daily_message_limit INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS message_interval_seconds INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS auto_start_hour INTEGER DEFAULT 9,
ADD COLUMN IF NOT EXISTS auto_end_hour INTEGER DEFAULT 18,
ADD COLUMN IF NOT EXISTS auto_prospecting_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS blacklist TEXT[] DEFAULT '{}';

-- Create message_templates table
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  niche TEXT NOT NULL,
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_templates
CREATE POLICY "Users can view their own templates"
ON public.message_templates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
ON public.message_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
ON public.message_templates FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
ON public.message_templates FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_templates_updated_at
BEFORE UPDATE ON public.message_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create prospecting_stats table for AI analytics
CREATE TABLE IF NOT EXISTS public.prospecting_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  niche TEXT NOT NULL,
  location TEXT,
  hour_of_day INTEGER,
  day_of_week INTEGER,
  messages_sent INTEGER DEFAULT 0,
  responses_received INTEGER DEFAULT 0,
  positive_responses INTEGER DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prospecting_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prospecting_stats
CREATE POLICY "Users can view their own stats"
ON public.prospecting_stats FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stats"
ON public.prospecting_stats FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
ON public.prospecting_stats FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_templates_user_niche ON public.message_templates(user_id, niche);
CREATE INDEX IF NOT EXISTS idx_stats_user_niche ON public.prospecting_stats(user_id, niche, date);
CREATE INDEX IF NOT EXISTS idx_leads_tags ON public.leads USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_leads_quality ON public.leads(user_id, quality_score DESC);