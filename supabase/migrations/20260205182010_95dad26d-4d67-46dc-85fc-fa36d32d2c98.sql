-- ===========================================
-- PROSPECTE - Multi-tenant Sales Prospecting Platform
-- ===========================================

-- 1. PROFILES TABLE (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. USER SETTINGS TABLE
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Agent Persona
  agent_name TEXT DEFAULT 'Gustavo',
  agent_persona TEXT DEFAULT 'Você é um consultor de negócios profissional e amigável que ajuda empresas a crescer com soluções digitais.',
  -- Knowledge Base
  knowledge_base TEXT DEFAULT '',
  services_offered TEXT[] DEFAULT ARRAY['Criação de Sites', 'Chatbots', 'Design', 'Sistemas de Gestão', 'Aplicativos', 'Posicionamento Google'],
  -- A/B Test Variations
  message_variations JSONB DEFAULT '[]'::jsonb,
  -- Prospecting Settings
  target_niches TEXT[] DEFAULT ARRAY[]::text[],
  target_locations TEXT[] DEFAULT ARRAY[]::text[],
  -- WhatsApp Connection (sensitive - handle via edge functions)
  whatsapp_instance_id TEXT,
  whatsapp_connected BOOLEAN DEFAULT false,
  -- Webhook for external integrations
  webhook_url TEXT,
  webhook_events TEXT[] DEFAULT ARRAY['lead_contacted', 'meeting_scheduled'],
  -- Notifications
  email_notifications BOOLEAN DEFAULT true,
  daily_report_enabled BOOLEAN DEFAULT true,
  -- Cron security
  hunter_api_token TEXT DEFAULT encode(gen_random_bytes(32), 'hex'),
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own settings"
  ON public.user_settings FOR ALL
  USING (auth.uid() = user_id);

-- 3. LEADS TABLE
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Business Info
  business_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  website TEXT,
  address TEXT,
  -- Categorization
  niche TEXT,
  location TEXT,
  -- AI Analysis
  pain_points TEXT[],
  analyzed_needs JSONB DEFAULT '{}'::jsonb,
  -- Funnel Stage
  stage TEXT NOT NULL DEFAULT 'Contato' CHECK (stage IN ('Contato', 'Qualificado', 'Proposta', 'Negociação', 'Ganho', 'Perdido')),
  -- Temperature (Sentiment)
  temperature TEXT DEFAULT 'morno' CHECK (temperature IN ('quente', 'morno', 'frio')),
  conversation_summary TEXT,
  -- Source
  source TEXT DEFAULT 'google_maps',
  google_maps_url TEXT,
  -- Follow-up
  last_contact_at TIMESTAMP WITH TIME ZONE,
  last_response_at TIMESTAMP WITH TIME ZONE,
  follow_up_count INTEGER DEFAULT 0,
  next_follow_up_at TIMESTAMP WITH TIME ZONE,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own leads"
  ON public.leads FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_stage ON public.leads(stage);
CREATE INDEX idx_leads_temperature ON public.leads(temperature);
CREATE INDEX idx_leads_phone ON public.leads(phone);

-- 4. CHAT MESSAGES TABLE
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  -- Message
  sender_type TEXT NOT NULL CHECK (sender_type IN ('agent', 'lead', 'user')),
  content TEXT NOT NULL,
  -- WhatsApp metadata
  whatsapp_message_id TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Helper function to check lead ownership
CREATE OR REPLACE FUNCTION public.is_lead_owner(p_lead_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.leads 
    WHERE id = p_lead_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE POLICY "Users can manage chat messages of their leads"
  ON public.chat_messages FOR ALL
  USING (public.is_lead_owner(lead_id));

CREATE INDEX idx_chat_messages_lead_id ON public.chat_messages(lead_id);
CREATE INDEX idx_chat_messages_sent_at ON public.chat_messages(sent_at);

-- 5. MEETINGS TABLE
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  -- Meeting Details
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  -- Meeting Link
  meeting_link TEXT,
  -- Notes
  notes TEXT,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own meetings"
  ON public.meetings FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX idx_meetings_scheduled_at ON public.meetings(scheduled_at);

-- 6. ACTIVITY LOG TABLE
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  -- Activity
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity"
  ON public.activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
  ON public.activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- 7. UPDATE TIMESTAMP FUNCTION
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. AUTO-CREATE PROFILE AND SETTINGS ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();