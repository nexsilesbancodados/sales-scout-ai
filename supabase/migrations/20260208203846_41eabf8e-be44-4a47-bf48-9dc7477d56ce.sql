-- Delete existing variations for the user
DELETE FROM public.message_variations WHERE user_id = 'cf9b7383-d0d2-4617-9604-32d9e273dec8';

-- Insert 10 variations for each category
INSERT INTO public.message_variations (user_id, category, variations, is_active) VALUES
-- Saudações (10 variações)
('cf9b7383-d0d2-4617-9604-32d9e273dec8', 'saudacao', ARRAY[
  'Olá',
  'Oi',
  'Olá, tudo bem?',
  'Oi, tudo bem?',
  'Bom dia',
  'Boa tarde',
  'E aí',
  'Olá, como vai?',
  'Oi, tudo certo?',
  'Olá! Espero que esteja bem'
], true),

-- Fechamentos (10 variações)
('cf9b7383-d0d2-4617-9604-32d9e273dec8', 'fechamento', ARRAY[
  'Abraço!',
  'Forte abraço!',
  'Até mais!',
  'Aguardo seu retorno!',
  'Fico no aguardo!',
  'Qualquer coisa, estou à disposição!',
  'Conte comigo!',
  'Fico à disposição!',
  'Att.',
  'Obrigado pela atenção!'
], true),

-- Interesse (10 variações)
('cf9b7383-d0d2-4617-9604-32d9e273dec8', 'interesse', ARRAY[
  'Vi que você tem um negócio interessante',
  'Conheci seu trabalho e fiquei impressionado',
  'Encontrei sua empresa e achei muito legal',
  'Vi seu perfil e me chamou atenção',
  'Conheci seu trabalho recentemente',
  'Pesquisando na região, encontrei você',
  'Vi que você atua na área e curti muito',
  'Estava procurando profissionais como você',
  'Achei seu trabalho muito profissional',
  'Gostei muito do que vi sobre seu negócio'
], true),

-- Proposta de valor (10 variações)
('cf9b7383-d0d2-4617-9604-32d9e273dec8', 'proposta', ARRAY[
  'podemos ajudar você a atrair mais clientes',
  'temos uma solução que pode aumentar suas vendas',
  'posso mostrar como dobrar seu faturamento',
  'tenho uma proposta que pode te interessar',
  'podemos fazer sua empresa crescer',
  'tenho algo que pode transformar seu negócio',
  'podemos aumentar sua visibilidade online',
  'temos estratégias comprovadas para seu segmento',
  'posso ajudar você a conquistar novos clientes',
  'tenho uma oportunidade especial pra você'
], true),

-- Call to action (10 variações)
('cf9b7383-d0d2-4617-9604-32d9e273dec8', 'cta', ARRAY[
  'Podemos conversar 5 minutinhos?',
  'Quer que eu te explique melhor?',
  'Posso te mostrar alguns resultados?',
  'Que tal uma conversa rápida?',
  'Tem interesse em saber mais?',
  'Posso te enviar mais detalhes?',
  'Quer agendar uma call rápida?',
  'Posso te ligar amanhã?',
  'Quando podemos conversar?',
  'Quer conhecer nosso trabalho?'
], true),

-- Emojis (10 variações)
('cf9b7383-d0d2-4617-9604-32d9e273dec8', 'emoji', ARRAY[
  '😊',
  '👍',
  '🚀',
  '💪',
  '✨',
  '🎯',
  '🔥',
  '💼',
  '⭐',
  ''
], true),

-- Conectores (10 variações) - NOVA CATEGORIA
('cf9b7383-d0d2-4617-9604-32d9e273dec8', 'conector', ARRAY[
  'e pensei em você',
  'e lembrei de você',
  'e achei que poderia te ajudar',
  'e queria te fazer uma proposta',
  'e resolvi entrar em contato',
  'e decidi te mandar uma mensagem',
  'e acredito que posso te ajudar',
  'e tenho uma ideia pra você',
  'e pensei em uma parceria',
  'e gostaria de conversar contigo'
], true),

-- Urgência (10 variações) - NOVA CATEGORIA
('cf9b7383-d0d2-4617-9604-32d9e273dec8', 'urgencia', ARRAY[
  'Essa semana ainda tenho horários',
  'Tenho uma condição especial essa semana',
  'Estou com vagas limitadas',
  'Aproveita que estou com disponibilidade',
  'Só essa semana consigo esse valor',
  'Estou fechando a agenda do mês',
  'Tenho poucos horários ainda',
  'Essa promoção é por tempo limitado',
  'Aproveita enquanto tenho vaga',
  'Minha agenda está quase fechando'
], true),

-- Benefícios (10 variações) - NOVA CATEGORIA
('cf9b7383-d0d2-4617-9604-32d9e273dec8', 'beneficio', ARRAY[
  'você vai atrair mais clientes',
  'suas vendas podem dobrar',
  'você vai economizar tempo',
  'seu negócio vai crescer',
  'você vai ter mais visibilidade',
  'seus resultados vão melhorar',
  'você vai se destacar da concorrência',
  'seu faturamento pode aumentar',
  'você vai ter mais clientes qualificados',
  'sua marca vai ficar mais forte'
], true),

-- Perguntas (10 variações) - NOVA CATEGORIA
('cf9b7383-d0d2-4617-9604-32d9e273dec8', 'pergunta', ARRAY[
  'Como está seu movimento de clientes?',
  'Você está satisfeito com suas vendas?',
  'Está buscando novos clientes?',
  'Como anda a divulgação do seu negócio?',
  'Você já pensou em investir em marketing?',
  'Seu negócio está crescendo como gostaria?',
  'Está conseguindo bater suas metas?',
  'Como está a concorrência na sua região?',
  'Você tem presença nas redes sociais?',
  'Já tentou fazer anúncios online?'
], true);

-- Also update the default trigger function with all 10 categories
CREATE OR REPLACE FUNCTION public.create_default_message_variations()
RETURNS TRIGGER AS $$
BEGIN
  -- Saudações
  INSERT INTO public.message_variations (user_id, category, variations, is_active)
  VALUES (NEW.user_id, 'saudacao', ARRAY[
    'Olá', 'Oi', 'Olá, tudo bem?', 'Oi, tudo bem?', 'Bom dia',
    'Boa tarde', 'E aí', 'Olá, como vai?', 'Oi, tudo certo?', 'Olá! Espero que esteja bem'
  ], true);
  
  -- Fechamentos
  INSERT INTO public.message_variations (user_id, category, variations, is_active)
  VALUES (NEW.user_id, 'fechamento', ARRAY[
    'Abraço!', 'Forte abraço!', 'Até mais!', 'Aguardo seu retorno!', 'Fico no aguardo!',
    'Qualquer coisa, estou à disposição!', 'Conte comigo!', 'Fico à disposição!', 'Att.', 'Obrigado pela atenção!'
  ], true);
  
  -- Interesse
  INSERT INTO public.message_variations (user_id, category, variations, is_active)
  VALUES (NEW.user_id, 'interesse', ARRAY[
    'Vi que você tem um negócio interessante', 'Conheci seu trabalho e fiquei impressionado',
    'Encontrei sua empresa e achei muito legal', 'Vi seu perfil e me chamou atenção',
    'Conheci seu trabalho recentemente', 'Pesquisando na região, encontrei você',
    'Vi que você atua na área e curti muito', 'Estava procurando profissionais como você',
    'Achei seu trabalho muito profissional', 'Gostei muito do que vi sobre seu negócio'
  ], true);
  
  -- Proposta
  INSERT INTO public.message_variations (user_id, category, variations, is_active)
  VALUES (NEW.user_id, 'proposta', ARRAY[
    'podemos ajudar você a atrair mais clientes', 'temos uma solução que pode aumentar suas vendas',
    'posso mostrar como dobrar seu faturamento', 'tenho uma proposta que pode te interessar',
    'podemos fazer sua empresa crescer', 'tenho algo que pode transformar seu negócio',
    'podemos aumentar sua visibilidade online', 'temos estratégias comprovadas para seu segmento',
    'posso ajudar você a conquistar novos clientes', 'tenho uma oportunidade especial pra você'
  ], true);
  
  -- CTA
  INSERT INTO public.message_variations (user_id, category, variations, is_active)
  VALUES (NEW.user_id, 'cta', ARRAY[
    'Podemos conversar 5 minutinhos?', 'Quer que eu te explique melhor?',
    'Posso te mostrar alguns resultados?', 'Que tal uma conversa rápida?',
    'Tem interesse em saber mais?', 'Posso te enviar mais detalhes?',
    'Quer agendar uma call rápida?', 'Posso te ligar amanhã?',
    'Quando podemos conversar?', 'Quer conhecer nosso trabalho?'
  ], true);
  
  -- Emojis
  INSERT INTO public.message_variations (user_id, category, variations, is_active)
  VALUES (NEW.user_id, 'emoji', ARRAY[
    '😊', '👍', '🚀', '💪', '✨', '🎯', '🔥', '💼', '⭐', ''
  ], true);
  
  -- Conectores
  INSERT INTO public.message_variations (user_id, category, variations, is_active)
  VALUES (NEW.user_id, 'conector', ARRAY[
    'e pensei em você', 'e lembrei de você', 'e achei que poderia te ajudar',
    'e queria te fazer uma proposta', 'e resolvi entrar em contato',
    'e decidi te mandar uma mensagem', 'e acredito que posso te ajudar',
    'e tenho uma ideia pra você', 'e pensei em uma parceria', 'e gostaria de conversar contigo'
  ], true);
  
  -- Urgência
  INSERT INTO public.message_variations (user_id, category, variations, is_active)
  VALUES (NEW.user_id, 'urgencia', ARRAY[
    'Essa semana ainda tenho horários', 'Tenho uma condição especial essa semana',
    'Estou com vagas limitadas', 'Aproveita que estou com disponibilidade',
    'Só essa semana consigo esse valor', 'Estou fechando a agenda do mês',
    'Tenho poucos horários ainda', 'Essa promoção é por tempo limitado',
    'Aproveita enquanto tenho vaga', 'Minha agenda está quase fechando'
  ], true);
  
  -- Benefícios
  INSERT INTO public.message_variations (user_id, category, variations, is_active)
  VALUES (NEW.user_id, 'beneficio', ARRAY[
    'você vai atrair mais clientes', 'suas vendas podem dobrar',
    'você vai economizar tempo', 'seu negócio vai crescer',
    'você vai ter mais visibilidade', 'seus resultados vão melhorar',
    'você vai se destacar da concorrência', 'seu faturamento pode aumentar',
    'você vai ter mais clientes qualificados', 'sua marca vai ficar mais forte'
  ], true);
  
  -- Perguntas
  INSERT INTO public.message_variations (user_id, category, variations, is_active)
  VALUES (NEW.user_id, 'pergunta', ARRAY[
    'Como está seu movimento de clientes?', 'Você está satisfeito com suas vendas?',
    'Está buscando novos clientes?', 'Como anda a divulgação do seu negócio?',
    'Você já pensou em investir em marketing?', 'Seu negócio está crescendo como gostaria?',
    'Está conseguindo bater suas metas?', 'Como está a concorrência na sua região?',
    'Você tem presença nas redes sociais?', 'Já tentou fazer anúncios online?'
  ], true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;