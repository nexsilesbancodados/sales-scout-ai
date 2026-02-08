-- =====================================================
-- SISTEMA ANTI-BAN WHATSAPP - TABELAS E CONFIGURAÇÕES
-- =====================================================

-- Tabela de fila de mensagens com controle anti-ban
CREATE TABLE public.whatsapp_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  original_content TEXT NOT NULL,
  processed_content TEXT, -- Conteúdo após Spintax
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'typing', 'sending', 'sent', 'failed', 'cancelled')),
  priority INTEGER DEFAULT 1,
  delay_seconds INTEGER DEFAULT 30,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  typing_started_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  simulate_typing BOOLEAN DEFAULT true,
  typing_duration_seconds INTEGER DEFAULT 3,
  batch_id UUID, -- Para agrupar mensagens do mesmo disparo
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de variações de texto (Spintax)
CREATE TABLE public.message_variations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category VARCHAR(50) NOT NULL, -- Ex: 'greeting', 'closing', 'question'
  variations TEXT[] NOT NULL, -- Ex: ['Olá', 'Oi', 'Bom dia']
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de configurações Anti-Ban por usuário
CREATE TABLE public.antiban_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  -- Delays
  min_delay_seconds INTEGER DEFAULT 30,
  max_delay_seconds INTEGER DEFAULT 90,
  -- Warm-up
  warmup_enabled BOOLEAN DEFAULT true,
  warmup_day INTEGER DEFAULT 1, -- Dia atual do aquecimento
  warmup_start_date DATE,
  warmup_daily_limit INTEGER DEFAULT 10, -- Limite inicial
  warmup_increment_percent INTEGER DEFAULT 20, -- Aumento diário
  -- Simulação de digitação
  typing_enabled BOOLEAN DEFAULT true,
  min_typing_seconds INTEGER DEFAULT 2,
  max_typing_seconds INTEGER DEFAULT 6,
  -- Pausas de descanso
  rest_pause_enabled BOOLEAN DEFAULT true,
  messages_before_rest INTEGER DEFAULT 20,
  rest_duration_minutes INTEGER DEFAULT 15,
  -- Limites gerais
  daily_limit INTEGER DEFAULT 200,
  hourly_limit INTEGER DEFAULT 30,
  -- Blacklist keywords
  blacklist_keywords TEXT[] DEFAULT ARRAY['sair', 'stop', 'pare', 'parar', 'não quero', 'remover'],
  -- Status
  chip_health VARCHAR(20) DEFAULT 'healthy' CHECK (chip_health IN ('healthy', 'warning', 'critical', 'banned')),
  last_health_check_at TIMESTAMP WITH TIME ZONE,
  messages_sent_today INTEGER DEFAULT 0,
  messages_sent_hour INTEGER DEFAULT 0,
  last_message_sent_at TIMESTAMP WITH TIME ZONE,
  last_rest_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de blacklist de números
CREATE TABLE public.whatsapp_blacklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone VARCHAR(20) NOT NULL,
  reason VARCHAR(100), -- 'opt_out', 'invalid', 'reported', 'manual'
  keyword_matched VARCHAR(100),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de logs de saúde do chip
CREATE TABLE public.chip_health_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  health_status VARCHAR(20) NOT NULL,
  messages_sent_hour INTEGER,
  messages_sent_day INTEGER,
  failed_messages_hour INTEGER,
  connection_status VARCHAR(20),
  risk_factors JSONB,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_whatsapp_queue_user_status ON public.whatsapp_queue(user_id, status);
CREATE INDEX idx_whatsapp_queue_scheduled ON public.whatsapp_queue(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_whatsapp_queue_batch ON public.whatsapp_queue(batch_id);
CREATE INDEX idx_whatsapp_blacklist_user_phone ON public.whatsapp_blacklist(user_id, phone);
CREATE INDEX idx_chip_health_user ON public.chip_health_logs(user_id, created_at DESC);
CREATE INDEX idx_message_variations_user_cat ON public.message_variations(user_id, category);

-- Enable RLS
ALTER TABLE public.whatsapp_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.antiban_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chip_health_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users manage own queue" ON public.whatsapp_queue FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own variations" ON public.message_variations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own antiban config" ON public.antiban_config FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own blacklist" ON public.whatsapp_blacklist FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own health logs" ON public.chip_health_logs FOR ALL USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_whatsapp_queue_updated_at
  BEFORE UPDATE ON public.whatsapp_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_message_variations_updated_at
  BEFORE UPDATE ON public.message_variations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_antiban_config_updated_at
  BEFORE UPDATE ON public.antiban_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para processar Spintax
CREATE OR REPLACE FUNCTION public.process_spintax(p_user_id UUID, p_content TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result TEXT := p_content;
  v_variation RECORD;
  v_random_idx INTEGER;
BEGIN
  -- Para cada categoria de variação do usuário
  FOR v_variation IN 
    SELECT category, variations 
    FROM public.message_variations 
    WHERE user_id = p_user_id AND is_active = true
  LOOP
    -- Seleciona uma variação aleatória
    v_random_idx := floor(random() * array_length(v_variation.variations, 1)) + 1;
    
    -- Substitui o placeholder pela variação
    v_result := regexp_replace(
      v_result, 
      '\{' || v_variation.category || '\}', 
      v_variation.variations[v_random_idx], 
      'gi'
    );
  END LOOP;
  
  RETURN v_result;
END;
$$;

-- Função para calcular delay atual baseado em warm-up
CREATE OR REPLACE FUNCTION public.get_current_daily_limit(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_config RECORD;
  v_days_since_start INTEGER;
  v_calculated_limit INTEGER;
BEGIN
  SELECT * INTO v_config FROM public.antiban_config WHERE user_id = p_user_id;
  
  IF NOT FOUND OR NOT v_config.warmup_enabled THEN
    RETURN COALESCE(v_config.daily_limit, 200);
  END IF;
  
  IF v_config.warmup_start_date IS NULL THEN
    RETURN v_config.warmup_daily_limit;
  END IF;
  
  v_days_since_start := CURRENT_DATE - v_config.warmup_start_date;
  
  -- Calcula limite progressivo: base * (1 + increment%)^dias
  v_calculated_limit := v_config.warmup_daily_limit * 
    power(1 + (v_config.warmup_increment_percent::NUMERIC / 100), v_days_since_start);
  
  -- Não excede o limite máximo
  RETURN LEAST(v_calculated_limit::INTEGER, v_config.daily_limit);
END;
$$;

-- Função para verificar se número está na blacklist
CREATE OR REPLACE FUNCTION public.is_phone_blacklisted(p_user_id UUID, p_phone VARCHAR)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.whatsapp_blacklist 
    WHERE user_id = p_user_id AND phone = p_phone
  );
$$;

-- Função para adicionar à blacklist automaticamente por keyword
CREATE OR REPLACE FUNCTION public.check_and_blacklist_response()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_lead RECORD;
  v_config RECORD;
  v_keyword TEXT;
BEGIN
  -- Só processa mensagens recebidas (do lead)
  IF NEW.sender_type != 'lead' THEN
    RETURN NEW;
  END IF;
  
  -- Busca dados do lead
  SELECT * INTO v_lead FROM public.leads WHERE id = NEW.lead_id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  
  -- Busca config anti-ban
  SELECT * INTO v_config FROM public.antiban_config WHERE user_id = v_lead.user_id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  
  -- Verifica keywords de opt-out
  FOREACH v_keyword IN ARRAY COALESCE(v_config.blacklist_keywords, ARRAY['sair', 'stop', 'pare'])
  LOOP
    IF lower(NEW.content) LIKE '%' || lower(v_keyword) || '%' THEN
      -- Adiciona à blacklist
      INSERT INTO public.whatsapp_blacklist (user_id, phone, reason, keyword_matched, lead_id)
      VALUES (v_lead.user_id, v_lead.phone, 'opt_out', v_keyword, v_lead.id)
      ON CONFLICT DO NOTHING;
      
      -- Remove mensagens pendentes da fila
      UPDATE public.whatsapp_queue 
      SET status = 'cancelled', error_message = 'Lead optou por sair: ' || v_keyword
      WHERE lead_id = v_lead.id AND status IN ('pending', 'scheduled');
      
      EXIT;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger para blacklist automática
CREATE TRIGGER auto_blacklist_on_response
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_blacklist_response();