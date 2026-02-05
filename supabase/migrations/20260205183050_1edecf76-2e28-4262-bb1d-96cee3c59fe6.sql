-- Add advanced agent configuration columns to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS agent_type TEXT DEFAULT 'consultivo' 
  CHECK (agent_type IN ('consultivo', 'agressivo', 'amigavel', 'tecnico', 'empatico')),
ADD COLUMN IF NOT EXISTS personality_traits JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS communication_style TEXT DEFAULT 'formal'
  CHECK (communication_style IN ('formal', 'casual', 'profissional', 'descontraido')),
ADD COLUMN IF NOT EXISTS response_length TEXT DEFAULT 'medio'
  CHECK (response_length IN ('curto', 'medio', 'longo')),
ADD COLUMN IF NOT EXISTS emoji_usage TEXT DEFAULT 'moderado'
  CHECK (emoji_usage IN ('nenhum', 'minimo', 'moderado', 'frequente')),
ADD COLUMN IF NOT EXISTS objection_handling TEXT DEFAULT 'suave'
  CHECK (objection_handling IN ('suave', 'assertivo', 'persistente')),
ADD COLUMN IF NOT EXISTS closing_style TEXT DEFAULT 'consultivo'
  CHECK (closing_style IN ('consultivo', 'direto', 'urgencia', 'beneficio')),
ADD COLUMN IF NOT EXISTS follow_up_tone TEXT DEFAULT 'amigavel'
  CHECK (follow_up_tone IN ('amigavel', 'profissional', 'curioso', 'preocupado')),
ADD COLUMN IF NOT EXISTS greeting_style TEXT DEFAULT 'padrao'
  CHECK (greeting_style IN ('padrao', 'personalizado', 'criativo', 'minimalista')),
ADD COLUMN IF NOT EXISTS value_proposition_focus TEXT DEFAULT 'beneficios'
  CHECK (value_proposition_focus IN ('beneficios', 'resultados', 'economia', 'exclusividade'));