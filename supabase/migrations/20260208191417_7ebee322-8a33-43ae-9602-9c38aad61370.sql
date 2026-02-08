-- Create service_intelligence table for storing AI knowledge per service
CREATE TABLE public.service_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  service_slug TEXT NOT NULL,
  
  -- AI Knowledge
  description TEXT,
  benefits TEXT[],
  pain_points TEXT[],
  objection_responses JSONB DEFAULT '{}',
  pricing_info TEXT,
  case_studies TEXT[],
  faq JSONB DEFAULT '[]',
  
  -- Message Templates
  opening_templates TEXT[],
  follow_up_templates TEXT[],
  closing_templates TEXT[],
  remarketing_templates TEXT[],
  
  -- Target Audience
  target_niches TEXT[],
  ideal_client_profile TEXT,
  
  -- Performance Data
  total_sent INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  total_meetings INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, service_slug)
);

-- Enable RLS
ALTER TABLE public.service_intelligence ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own service intelligence"
  ON public.service_intelligence
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own service intelligence"
  ON public.service_intelligence
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service intelligence"
  ON public.service_intelligence
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service intelligence"
  ON public.service_intelligence
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_service_intelligence_updated_at
  BEFORE UPDATE ON public.service_intelligence
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.service_intelligence IS 'AI knowledge base per service with templates and objection handling';