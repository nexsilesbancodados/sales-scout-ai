-- Add lead_score columns
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS score_factors JSONB DEFAULT '{}';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_scored_at TIMESTAMP WITH TIME ZONE;

-- Create index for lead scoring
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON public.leads(lead_score DESC);

-- Create function to calculate lead score
CREATE OR REPLACE FUNCTION public.calculate_lead_score(p_lead_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
  v_lead RECORD;
  v_message_count INTEGER;
  v_response_count INTEGER;
  v_factors JSONB := '{}';
BEGIN
  -- Get lead data
  SELECT * INTO v_lead FROM public.leads WHERE id = p_lead_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Factor 1: Has responded (40 points)
  SELECT COUNT(*) INTO v_response_count
  FROM public.chat_messages
  WHERE lead_id = p_lead_id AND sender_type = 'lead';
  
  IF v_response_count > 0 THEN
    v_score := v_score + 40;
    v_factors := v_factors || jsonb_build_object('responded', 40);
  END IF;

  -- Factor 2: Response ratio (up to 20 points)
  SELECT COUNT(*) INTO v_message_count
  FROM public.chat_messages
  WHERE lead_id = p_lead_id AND sender_type IN ('user', 'agent');
  
  IF v_message_count > 0 THEN
    DECLARE
      v_ratio NUMERIC := v_response_count::NUMERIC / v_message_count;
      v_ratio_score INTEGER := LEAST(20, FLOOR(v_ratio * 40));
    BEGIN
      v_score := v_score + v_ratio_score;
      v_factors := v_factors || jsonb_build_object('response_ratio', v_ratio_score);
    END;
  END IF;

  -- Factor 3: Stage progression (up to 20 points)
  CASE v_lead.stage
    WHEN 'new' THEN v_score := v_score + 0;
    WHEN 'contacted' THEN v_score := v_score + 5;
    WHEN 'qualified' THEN v_score := v_score + 10;
    WHEN 'proposal' THEN v_score := v_score + 15;
    WHEN 'negotiation' THEN v_score := v_score + 18;
    WHEN 'won' THEN v_score := v_score + 20;
    ELSE v_score := v_score + 0;
  END CASE;
  v_factors := v_factors || jsonb_build_object('stage', CASE v_lead.stage
    WHEN 'new' THEN 0
    WHEN 'contacted' THEN 5
    WHEN 'qualified' THEN 10
    WHEN 'proposal' THEN 15
    WHEN 'negotiation' THEN 18
    WHEN 'won' THEN 20
    ELSE 0
  END);

  -- Factor 4: Temperature (10 points)
  CASE v_lead.temperature
    WHEN 'quente' THEN 
      v_score := v_score + 10;
      v_factors := v_factors || jsonb_build_object('temperature', 10);
    WHEN 'morno' THEN 
      v_score := v_score + 5;
      v_factors := v_factors || jsonb_build_object('temperature', 5);
    ELSE 
      v_factors := v_factors || jsonb_build_object('temperature', 0);
  END CASE;

  -- Factor 5: Has email (5 points)
  IF v_lead.email IS NOT NULL THEN
    v_score := v_score + 5;
    v_factors := v_factors || jsonb_build_object('has_email', 5);
  END IF;

  -- Factor 6: Has website (5 points)
  IF v_lead.website IS NOT NULL THEN
    v_score := v_score + 5;
    v_factors := v_factors || jsonb_build_object('has_website', 5);
  END IF;

  -- Update lead with score
  UPDATE public.leads
  SET 
    lead_score = v_score,
    score_factors = v_factors,
    last_scored_at = now()
  WHERE id = p_lead_id;

  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.calculate_lead_score(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_lead_score(UUID) TO service_role;