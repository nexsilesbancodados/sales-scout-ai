-- Tabela para armazenar padrões de aprendizado por nicho
CREATE TABLE public.niche_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  niche TEXT NOT NULL,
  location TEXT,
  
  -- Padrões de horário
  best_contact_hours INTEGER[] DEFAULT '{}',
  response_rate_by_hour JSONB DEFAULT '{}',
  
  -- Padrões de mensagem
  best_opening_style TEXT,
  best_follow_up_interval_days INTEGER DEFAULT 3,
  avg_messages_to_convert INTEGER,
  
  -- Métricas de performance
  total_contacts INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Objeções comuns
  common_objections JSONB DEFAULT '[]',
  successful_responses JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, niche, location)
);

-- Tabela para qualificação BANT automática
CREATE TABLE public.lead_qualification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- BANT Fields
  budget_status TEXT CHECK (budget_status IN ('unknown', 'no_budget', 'limited', 'adequate', 'high')),
  budget_details TEXT,
  budget_confidence INTEGER DEFAULT 0,
  
  authority_status TEXT CHECK (authority_status IN ('unknown', 'influencer', 'evaluator', 'decision_maker', 'buyer')),
  authority_details TEXT,
  authority_confidence INTEGER DEFAULT 0,
  
  need_status TEXT CHECK (need_status IN ('unknown', 'no_need', 'latent', 'active', 'urgent')),
  need_details TEXT,
  need_confidence INTEGER DEFAULT 0,
  
  timeline_status TEXT CHECK (timeline_status IN ('unknown', 'no_timeline', 'long_term', 'short_term', 'immediate')),
  timeline_details TEXT,
  timeline_confidence INTEGER DEFAULT 0,
  
  -- Score geral de qualificação (0-100)
  qualification_score INTEGER DEFAULT 0,
  
  -- Predição de fechamento
  close_probability INTEGER DEFAULT 0,
  predicted_close_date DATE,
  deal_value_estimate DECIMAL(12,2),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(lead_id)
);

-- Tabela para sinais de compra detectados
CREATE TABLE public.buying_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'price_inquiry', 'timeline_mention', 'competitor_comparison',
    'feature_interest', 'urgency_expression', 'decision_maker_mention',
    'budget_disclosure', 'meeting_request', 'proposal_request', 'other'
  )),
  signal_strength INTEGER DEFAULT 50, -- 0-100
  signal_text TEXT, -- Trecho que gerou o sinal
  context TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para escalações para humano
CREATE TABLE public.agent_escalations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  escalation_reason TEXT NOT NULL CHECK (escalation_reason IN (
    'complex_objection', 'high_value_opportunity', 'complaint',
    'technical_question', 'urgent_request', 'closing_opportunity',
    'competitor_threat', 'custom_request', 'sentiment_negative'
  )),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  context TEXT, -- Resumo da situação
  recommended_action TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved', 'dismissed')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para propostas geradas
CREATE TABLE public.generated_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  service_id UUID REFERENCES public.service_intelligence(id),
  
  -- Conteúdo da proposta
  proposal_title TEXT NOT NULL,
  executive_summary TEXT,
  identified_needs JSONB DEFAULT '[]',
  proposed_solution TEXT,
  deliverables JSONB DEFAULT '[]',
  pricing_breakdown JSONB DEFAULT '{}',
  timeline TEXT,
  terms_conditions TEXT,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected')),
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  response_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para histórico de follow-ups inteligentes
CREATE TABLE public.intelligent_followups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  trigger_reason TEXT NOT NULL CHECK (trigger_reason IN (
    'no_response', 'partial_interest', 'price_objection',
    'timing_objection', 'buying_signal', 'engagement_drop',
    'scheduled', 'pattern_based'
  )),
  
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  message_template TEXT,
  message_sent TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled', 'converted')),
  sent_at TIMESTAMP WITH TIME ZONE,
  result TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.niche_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_qualification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buying_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligent_followups ENABLE ROW LEVEL SECURITY;

-- Policies para niche_patterns
CREATE POLICY "Users can view their own niche patterns" ON public.niche_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own niche patterns" ON public.niche_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own niche patterns" ON public.niche_patterns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own niche patterns" ON public.niche_patterns FOR DELETE USING (auth.uid() = user_id);

-- Policies para lead_qualification
CREATE POLICY "Users can view their own lead qualifications" ON public.lead_qualification FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own lead qualifications" ON public.lead_qualification FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lead qualifications" ON public.lead_qualification FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own lead qualifications" ON public.lead_qualification FOR DELETE USING (auth.uid() = user_id);

-- Policies para buying_signals
CREATE POLICY "Users can view their own buying signals" ON public.buying_signals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own buying signals" ON public.buying_signals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own buying signals" ON public.buying_signals FOR DELETE USING (auth.uid() = user_id);

-- Policies para agent_escalations
CREATE POLICY "Users can view their own escalations" ON public.agent_escalations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own escalations" ON public.agent_escalations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own escalations" ON public.agent_escalations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own escalations" ON public.agent_escalations FOR DELETE USING (auth.uid() = user_id);

-- Policies para generated_proposals
CREATE POLICY "Users can view their own proposals" ON public.generated_proposals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own proposals" ON public.generated_proposals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own proposals" ON public.generated_proposals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own proposals" ON public.generated_proposals FOR DELETE USING (auth.uid() = user_id);

-- Policies para intelligent_followups
CREATE POLICY "Users can view their own followups" ON public.intelligent_followups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own followups" ON public.intelligent_followups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own followups" ON public.intelligent_followups FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own followups" ON public.intelligent_followups FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_niche_patterns_updated_at
BEFORE UPDATE ON public.niche_patterns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_qualification_updated_at
BEFORE UPDATE ON public.lead_qualification FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_proposals_updated_at
BEFORE UPDATE ON public.generated_proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_niche_patterns_user_niche ON public.niche_patterns(user_id, niche);
CREATE INDEX idx_lead_qualification_lead ON public.lead_qualification(lead_id);
CREATE INDEX idx_buying_signals_lead ON public.buying_signals(lead_id);
CREATE INDEX idx_buying_signals_created ON public.buying_signals(created_at DESC);
CREATE INDEX idx_agent_escalations_user_status ON public.agent_escalations(user_id, status);
CREATE INDEX idx_agent_escalations_priority ON public.agent_escalations(priority, created_at DESC);
CREATE INDEX idx_generated_proposals_lead ON public.generated_proposals(lead_id);
CREATE INDEX idx_intelligent_followups_scheduled ON public.intelligent_followups(scheduled_at, status);
CREATE INDEX idx_intelligent_followups_lead ON public.intelligent_followups(lead_id);