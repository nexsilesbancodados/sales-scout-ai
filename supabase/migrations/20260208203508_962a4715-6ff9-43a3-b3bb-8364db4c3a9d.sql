-- Update default values for antiban_config to be more comprehensive
ALTER TABLE public.antiban_config 
ALTER COLUMN min_delay_seconds SET DEFAULT 15,
ALTER COLUMN max_delay_seconds SET DEFAULT 45,
ALTER COLUMN warmup_enabled SET DEFAULT true,
ALTER COLUMN warmup_daily_limit SET DEFAULT 20,
ALTER COLUMN warmup_increment_percent SET DEFAULT 25,
ALTER COLUMN typing_enabled SET DEFAULT true,
ALTER COLUMN min_typing_seconds SET DEFAULT 2,
ALTER COLUMN max_typing_seconds SET DEFAULT 6,
ALTER COLUMN rest_pause_enabled SET DEFAULT true,
ALTER COLUMN messages_before_rest SET DEFAULT 15,
ALTER COLUMN rest_duration_minutes SET DEFAULT 5,
ALTER COLUMN daily_limit SET DEFAULT 200,
ALTER COLUMN hourly_limit SET DEFAULT 30,
ALTER COLUMN blacklist_keywords SET DEFAULT ARRAY['sair', 'stop', 'pare', 'parar', 'não quero', 'nao quero', 'remover', 'cancelar', 'bloquear'];

-- Create function to initialize default message variations for new users
CREATE OR REPLACE FUNCTION public.create_default_message_variations()
RETURNS TRIGGER AS $$
BEGIN
  -- Saudações
  INSERT INTO public.message_variations (user_id, category, variations, is_active)
  VALUES (NEW.user_id, 'saudacao', ARRAY[
    'Olá',
    'Oi',
    'Olá, tudo bem?',
    'Oi, tudo bem?',
    'Bom dia',
    'Boa tarde',
    'E aí'
  ], true);
  
  -- Fechamentos
  INSERT INTO public.message_variations (user_id, category, variations, is_active)
  VALUES (NEW.user_id, 'fechamento', ARRAY[
    'Abraço!',
    'Forte abraço!',
    'Até mais!',
    'Aguardo seu retorno!',
    'Fico no aguardo!',
    'Qualquer coisa, estou à disposição!',
    'Conte comigo!'
  ], true);
  
  -- Interesse
  INSERT INTO public.message_variations (user_id, category, variations, is_active)
  VALUES (NEW.user_id, 'interesse', ARRAY[
    'Vi que você tem um negócio interessante',
    'Conheci seu trabalho e fiquei impressionado',
    'Encontrei sua empresa e achei muito legal',
    'Vi seu perfil e me chamou atenção',
    'Conheci seu trabalho recentemente'
  ], true);
  
  -- Proposta de valor
  INSERT INTO public.message_variations (user_id, category, variations, is_active)
  VALUES (NEW.user_id, 'proposta', ARRAY[
    'podemos ajudar você a atrair mais clientes',
    'temos uma solução que pode aumentar suas vendas',
    'posso mostrar como dobrar seu faturamento',
    'tenho uma proposta que pode te interessar',
    'podemos fazer sua empresa crescer'
  ], true);
  
  -- Call to action
  INSERT INTO public.message_variations (user_id, category, variations, is_active)
  VALUES (NEW.user_id, 'cta', ARRAY[
    'Podemos conversar 5 minutinhos?',
    'Quer que eu te explique melhor?',
    'Posso te mostrar alguns resultados?',
    'Que tal uma conversa rápida?',
    'Tem interesse em saber mais?',
    'Posso te enviar mais detalhes?'
  ], true);
  
  -- Emojis
  INSERT INTO public.message_variations (user_id, category, variations, is_active)
  VALUES (NEW.user_id, 'emoji', ARRAY[
    '😊',
    '👍',
    '🚀',
    '💪',
    '✨',
    '🎯',
    ''
  ], true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create variations when antiban_config is created
DROP TRIGGER IF EXISTS create_default_variations_trigger ON public.antiban_config;
CREATE TRIGGER create_default_variations_trigger
AFTER INSERT ON public.antiban_config
FOR EACH ROW
EXECUTE FUNCTION public.create_default_message_variations();

-- Insert default variations for existing users that don't have them
INSERT INTO public.message_variations (user_id, category, variations, is_active)
SELECT ac.user_id, 'saudacao', ARRAY['Olá', 'Oi', 'Olá, tudo bem?', 'Oi, tudo bem?', 'Bom dia', 'Boa tarde', 'E aí'], true
FROM public.antiban_config ac
WHERE NOT EXISTS (SELECT 1 FROM public.message_variations mv WHERE mv.user_id = ac.user_id AND mv.category = 'saudacao');

INSERT INTO public.message_variations (user_id, category, variations, is_active)
SELECT ac.user_id, 'fechamento', ARRAY['Abraço!', 'Forte abraço!', 'Até mais!', 'Aguardo seu retorno!', 'Fico no aguardo!', 'Qualquer coisa, estou à disposição!', 'Conte comigo!'], true
FROM public.antiban_config ac
WHERE NOT EXISTS (SELECT 1 FROM public.message_variations mv WHERE mv.user_id = ac.user_id AND mv.category = 'fechamento');

INSERT INTO public.message_variations (user_id, category, variations, is_active)
SELECT ac.user_id, 'interesse', ARRAY['Vi que você tem um negócio interessante', 'Conheci seu trabalho e fiquei impressionado', 'Encontrei sua empresa e achei muito legal', 'Vi seu perfil e me chamou atenção', 'Conheci seu trabalho recentemente'], true
FROM public.antiban_config ac
WHERE NOT EXISTS (SELECT 1 FROM public.message_variations mv WHERE mv.user_id = ac.user_id AND mv.category = 'interesse');

INSERT INTO public.message_variations (user_id, category, variations, is_active)
SELECT ac.user_id, 'proposta', ARRAY['podemos ajudar você a atrair mais clientes', 'temos uma solução que pode aumentar suas vendas', 'posso mostrar como dobrar seu faturamento', 'tenho uma proposta que pode te interessar', 'podemos fazer sua empresa crescer'], true
FROM public.antiban_config ac
WHERE NOT EXISTS (SELECT 1 FROM public.message_variations mv WHERE mv.user_id = ac.user_id AND mv.category = 'proposta');

INSERT INTO public.message_variations (user_id, category, variations, is_active)
SELECT ac.user_id, 'cta', ARRAY['Podemos conversar 5 minutinhos?', 'Quer que eu te explique melhor?', 'Posso te mostrar alguns resultados?', 'Que tal uma conversa rápida?', 'Tem interesse em saber mais?', 'Posso te enviar mais detalhes?'], true
FROM public.antiban_config ac
WHERE NOT EXISTS (SELECT 1 FROM public.message_variations mv WHERE mv.user_id = ac.user_id AND mv.category = 'cta');

INSERT INTO public.message_variations (user_id, category, variations, is_active)
SELECT ac.user_id, 'emoji', ARRAY['😊', '👍', '🚀', '💪', '✨', '🎯', ''], true
FROM public.antiban_config ac
WHERE NOT EXISTS (SELECT 1 FROM public.message_variations mv WHERE mv.user_id = ac.user_id AND mv.category = 'emoji');