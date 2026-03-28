export interface NicheConfig {
  id: string;
  label: string;
  emoji: string;
  defaultLocations: string[];
  funnelStages: string[];
  messageTemplates: {
    first_contact: string;
    followup_1: string;
    followup_2: string;
    reactivation: string;
  };
  agentPersonality: {
    name: string;
    tone: string;
    knowledge_base: string;
    services: string[];
  };
  bestHours: { start: number; end: number };
  weeklyLeadTarget: number;
  intentKeywords: {
    positive: string[];
    price: string[];
    schedule: string[];
    negative: string[];
  };
}

export const NICHE_CONFIGS: Record<string, NicheConfig> = {
  restaurantes: {
    id: 'restaurantes',
    label: 'Restaurantes e Alimentação',
    emoji: '🍽️',
    defaultLocations: ['São Paulo, SP', 'Campinas, SP', 'Guarulhos, SP'],
    funnelStages: ['Primeiro contato', 'Interesse demonstrado', 'Proposta enviada', 'Negociação', 'Cliente', 'Não converteu'],
    messageTemplates: {
      first_contact: 'Olá! Vi o {nome_empresa} no Google Maps e adorei as avaliações! 🍽️\n\nTrabalho ajudando restaurantes a aumentarem pedidos com presença digital otimizada e cardápio online.\n\nPosso mostrar como outros restaurantes da região aumentaram 40% nos pedidos? Leva só 10 minutos 😊',
      followup_1: 'Oi {nome_empresa}! 👋 Passei aqui para saber se você teve chance de ver minha mensagem anterior.\n\nSei que a rotina de restaurante é corrida! Trabalho com soluções que aumentam pedidos sem tomar seu tempo.\n\nPosso mandar um exemplo do que faço?',
      followup_2: '{nome_empresa}, última tentativa! 🚀\n\nSe não for o momento certo, sem problema. Mas tenho um estudo de caso de um restaurante similar ao de vocês que triplicou os pedidos em 3 meses.\n\nPosso compartilhar?',
      reactivation: 'Olá {nome_empresa}! Tudo bem por aí? 😊\n\nPassou um tempo desde nosso último contato. Tenho novidades que podem interessar vocês — lançamos um sistema de delivery próprio sem taxas do iFood.\n\nTem interesse em saber mais?',
    },
    agentPersonality: {
      name: 'Ana',
      tone: 'amigavel',
      knowledge_base: 'Especialista em marketing digital para restaurantes. Ofereço cardápio digital, gestão de pedidos online, presença no Google, campanhas de delivery e fidelização de clientes.',
      services: ['Cardápio digital', 'Google Meu Negócio', 'Gestão de delivery', 'Redes sociais', 'Fidelização'],
    },
    bestHours: { start: 9, end: 17 },
    weeklyLeadTarget: 50,
    intentKeywords: {
      positive: ['quero', 'interesse', 'sim', 'pode', 'vamos', 'quando', 'como funciona', 'me conta mais', 'topo', 'top', 'show', 'ótimo'],
      price: ['quanto custa', 'valor', 'preço', 'investimento', 'quanto é', 'orçamento'],
      schedule: ['agendar', 'reunião', 'call', 'conversar', 'ligar', 'videoconferência', 'quando posso'],
      negative: ['não tenho interesse', 'não quero', 'para', 'chega', 'stop', 'sair', 'bloquear', 'spam'],
    },
  },
  clinicas: {
    id: 'clinicas',
    label: 'Clínicas e Saúde',
    emoji: '🏥',
    defaultLocations: ['São Paulo, SP', 'Osasco, SP', 'Santo André, SP'],
    funnelStages: ['Primeiro contato', 'Interesse', 'Apresentação marcada', 'Proposta', 'Contrato', 'Não converteu'],
    messageTemplates: {
      first_contact: 'Olá! Vi a {nome_empresa} e percebi que vocês têm ótimas avaliações! 🏥\n\nTrabalho com clínicas ajudando a reduzir faltas de pacientes e organizar agendamentos online — algumas clínicas parceiras reduziram 60% das faltas.\n\nPosso mostrar como funciona em 10 minutos?',
      followup_1: 'Oi {nome_empresa}! 👋 Sei que a rotina da clínica é intensa.\n\nQueria saber se você teve chance de ver minha mensagem. Tenho uma solução que os médicos e recepcionistas adoram — automatiza confirmações e lembrete de consultas.\n\nPosso enviar um demo?',
      followup_2: '{nome_empresa}, última mensagem! Prometo 😊\n\nTenho um caso de uma clínica similar que economizou R$ 3.000/mês só com a redução de faltas.\n\nValeria 5 minutos da sua atenção?',
      reactivation: 'Olá {nome_empresa}! Tudo bem? 😊\n\nFazem alguns meses desde nosso contato. Lançamos uma integração nova com o WhatsApp que permite agendar consultas direto pelo aplicativo.\n\nTem interesse em conhecer?',
    },
    agentPersonality: {
      name: 'Dr. Carlos',
      tone: 'profissional',
      knowledge_base: 'Especialista em gestão digital para clínicas médicas. Ofereço agendamento online, confirmação automática de consultas, redução de faltas, marketing médico e presença digital.',
      services: ['Agendamento online', 'Confirmação automática', 'Redução de faltas', 'Marketing médico', 'Telemedicina'],
    },
    bestHours: { start: 8, end: 17 },
    weeklyLeadTarget: 30,
    intentKeywords: {
      positive: ['quero', 'interesse', 'sim', 'pode', 'vamos', 'quando', 'como funciona', 'me conta mais'],
      price: ['quanto custa', 'valor', 'preço', 'investimento', 'orçamento'],
      schedule: ['agendar', 'reunião', 'call', 'conversar', 'visita', 'apresentação'],
      negative: ['não tenho interesse', 'não quero', 'para', 'chega', 'stop', 'sair'],
    },
  },
  academias: {
    id: 'academias',
    label: 'Academias e Fitness',
    emoji: '💪',
    defaultLocations: ['São Paulo, SP', 'Guarulhos, SP', 'Mogi das Cruzes, SP'],
    funnelStages: ['Contato inicial', 'Interessado', 'Demo agendada', 'Proposta', 'Aluno', 'Não converteu'],
    messageTemplates: {
      first_contact: 'E aí {nome_empresa}! 💪\n\nVi a academia de vocês e curti o espaço! Trabalho ajudando academias a reter mais alunos e reduzir cancelamentos com apps de treino personalizados.\n\nAlgumas academias parceiras reduziram cancelamentos em 35%. Posso mostrar como?',
      followup_1: 'Oi {nome_empresa}! 👊 Sei que a rotina da academia é corrida.\n\nQueria retomar o contato — tenho uma solução de acompanhamento de evolução dos alunos que eles amam usar.\n\nPosso mandar um vídeo de como funciona?',
      followup_2: '{nome_empresa}, última tentativa! 🏋️\n\nTenho um caso de uma academia similar que aumentou 40% na retenção de alunos. Leva 5 minutos para ver.\n\nVale a pena?',
      reactivation: 'Fala {nome_empresa}! Tudo certo? 💪\n\nPassou um tempo do nosso contato. Lançamos um app de treino que os alunos usam em casa também — aumenta engajamento e retém mais.\n\nTem interesse?',
    },
    agentPersonality: {
      name: 'Rafael',
      tone: 'energetico',
      knowledge_base: 'Especialista em tecnologia para academias. Ofereço app de treino personalizado, gestão de alunos, redução de cancelamentos, acompanhamento de evolução e marketing fitness.',
      services: ['App de treino', 'Gestão de alunos', 'Redução de cancelamentos', 'Marketing fitness', 'Personal trainer digital'],
    },
    bestHours: { start: 7, end: 20 },
    weeklyLeadTarget: 40,
    intentKeywords: {
      positive: ['quero', 'interesse', 'sim', 'top', 'show', 'bora', 'vamos', 'quando'],
      price: ['quanto custa', 'valor', 'preço', 'mensalidade', 'plano'],
      schedule: ['agendar', 'reunião', 'call', 'visita', 'demo'],
      negative: ['não quero', 'para', 'chega', 'stop', 'sair', 'bloquear'],
    },
  },
  saloes: {
    id: 'saloes',
    label: 'Salões de Beleza',
    emoji: '💇',
    defaultLocations: ['São Paulo, SP', 'Santo André, SP', 'Diadema, SP'],
    funnelStages: ['Contato', 'Interesse', 'Proposta', 'Negociação', 'Cliente', 'Não converteu'],
    messageTemplates: {
      first_contact: 'Oi {nome_empresa}! 💇‍♀️\n\nEncontrei o salão de vocês e vi que tem ótimas avaliações! Trabalho ajudando salões a organizar agendas e reduzir horários vagos com agendamento online pelo WhatsApp.\n\nVocês ainda recebem marcações pelo WhatsApp manual? Tenho como automatizar isso. Posso mostrar?',
      followup_1: 'Oi {nome_empresa}! 👋 Voltei pra saber se você teve chance de ver minha mensagem.\n\nSei que a rotina do salão é corrida! Tenho uma solução de agendamento que envia lembretes automáticos e reduz 70% dos furos.\n\nPosso mandar um exemplo?',
      followup_2: '{nome_empresa}, última mensagem! 💅\n\nTenho um caso de um salão aqui da região que economizou R$ 2.000/mês só com a redução de furos na agenda.\n\nVale 5 minutinhos?',
      reactivation: 'Oi {nome_empresa}! Tudo bem? 😊\n\nFazem alguns meses do nosso contato. Lançamos uma integração nova com Instagram para agendamento direto pelo stories.\n\nTem interesse em ver?',
    },
    agentPersonality: {
      name: 'Camila',
      tone: 'amigavel',
      knowledge_base: 'Especialista em tecnologia para salões de beleza. Ofereço agendamento online, lembretes automáticos, redução de furos, gestão de clientes e marketing para beleza.',
      services: ['Agendamento online', 'Lembretes automáticos', 'Gestão de clientes', 'Marketing beauty', 'Fidelização'],
    },
    bestHours: { start: 9, end: 19 },
    weeklyLeadTarget: 40,
    intentKeywords: {
      positive: ['quero', 'interesse', 'sim', 'pode', 'adorei', 'top', 'vamos'],
      price: ['quanto custa', 'valor', 'preço', 'mensalidade'],
      schedule: ['agendar', 'reunião', 'call', 'visita', 'apresentação'],
      negative: ['não quero', 'para', 'chega', 'stop', 'sair'],
    },
  },
  advocacia: {
    id: 'advocacia',
    label: 'Escritórios de Advocacia',
    emoji: '⚖️',
    defaultLocations: ['São Paulo, SP', 'Campinas, SP', 'Ribeirão Preto, SP'],
    funnelStages: ['Primeiro contato', 'Qualificado', 'Reunião agendada', 'Proposta', 'Contrato', 'Não converteu'],
    messageTemplates: {
      first_contact: 'Olá! Vi o escritório {nome_empresa} e percebi a especialidade de vocês.\n\nTrabalho ajudando escritórios de advocacia a captar clientes qualificados pelo digital e automatizar o atendimento inicial — mantendo a ética profissional exigida pelo CFE.\n\nPosso apresentar casos de escritórios similares que triplicaram a captação?',
      followup_1: 'Olá {nome_empresa}! Retorno para saber se recebeu minha mensagem anterior.\n\nEntendo que a agenda jurídica é intensa. Tenho uma solução específica para advocacia que respeita as normas do CFE e melhora a captação de clientes.\n\nPoderia reservar 15 minutos para uma apresentação?',
      followup_2: '{nome_empresa}, última tentativa de contato.\n\nTenho um estudo de caso de um escritório com perfil similar ao de vocês que aumentou 80% na captação em 6 meses, dentro das normas éticas.\n\nAinda há interesse?',
      reactivation: 'Prezado(a) {nome_empresa},\n\nRetomo o contato após algum tempo. Lançamos uma solução de triagem inicial de clientes que economiza horas de consultas improdutivas.\n\nHá interesse em conhecer?',
    },
    agentPersonality: {
      name: 'Dra. Juliana',
      tone: 'formal',
      knowledge_base: 'Especialista em marketing digital ético para escritórios de advocacia. Respeitamos as normas do CFE. Ofereço captação de clientes qualificados, triagem automatizada, presença digital e gestão de relacionamento com clientes.',
      services: ['Captação digital ética', 'Triagem de clientes', 'Site jurídico', 'Gestão de clientes', 'Automação de atendimento'],
    },
    bestHours: { start: 9, end: 18 },
    weeklyLeadTarget: 20,
    intentKeywords: {
      positive: ['interesse', 'sim', 'pode', 'quero', 'gostaria', 'vamos', 'quando'],
      price: ['quanto custa', 'valor', 'honorários', 'investimento', 'proposta'],
      schedule: ['agendar', 'reunião', 'visita', 'apresentação', 'call'],
      negative: ['não tenho interesse', 'não quero', 'para', 'stop', 'sair'],
    },
  },
  imoveis: {
    id: 'imoveis',
    label: 'Imobiliárias',
    emoji: '🏠',
    defaultLocations: ['São Paulo, SP', 'Alphaville, SP', 'Barueri, SP'],
    funnelStages: ['Primeiro contato', 'Qualificado', 'Visita agendada', 'Proposta', 'Contrato', 'Não converteu'],
    messageTemplates: {
      first_contact: 'Olá! Vi a {nome_empresa} e fiquei impressionado com o portfólio de vocês! 🏠\n\nTrabalho ajudando imobiliárias a captar leads qualificados pelo WhatsApp e automatizar o primeiro atendimento — sem perder a personalização.\n\nPosso mostrar como imobiliárias parceiras dobram o número de visitas agendadas?',
      followup_1: 'Oi {nome_empresa}! 👋 Sei que o mercado imobiliário está movimentado.\n\nRetomo o contato — tenho uma solução que qualifica automaticamente os leads antes de chegarem aos corretores, economizando tempo.\n\nVale uma conversa rápida?',
      followup_2: '{nome_empresa}, última tentativa! 🏡\n\nTenho um caso de uma imobiliária que triplicou as visitas usando automação de WhatsApp.\n\nAinda há interesse?',
      reactivation: 'Olá {nome_empresa}! Tudo bem? 😊\n\nRetomo contato com uma novidade — integração com portais como ZAP e VivaReal para captar leads automaticamente.\n\nTem interesse?',
    },
    agentPersonality: {
      name: 'Ricardo',
      tone: 'consultivo',
      knowledge_base: 'Especialista em marketing digital imobiliário. Ofereço captação de leads qualificados, automação de atendimento, integração com portais imobiliários e gestão de relacionamento com compradores e locatários.',
      services: ['Captação de leads', 'Qualificação automática', 'Integração com portais', 'Marketing imobiliário', 'CRM para corretores'],
    },
    bestHours: { start: 9, end: 18 },
    weeklyLeadTarget: 60,
    intentKeywords: {
      positive: ['quero', 'interesse', 'sim', 'pode', 'vamos', 'quando', 'visitar', 'ver o imóvel'],
      price: ['quanto custa', 'valor', 'preço', 'comissão', 'investimento'],
      schedule: ['agendar', 'visita', 'reunião', 'ver o imóvel', 'quando posso'],
      negative: ['não quero', 'não tenho interesse', 'para', 'stop', 'sair'],
    },
  },
  contabilidade: {
    id: 'contabilidade',
    label: 'Escritórios de Contabilidade',
    emoji: '📊',
    defaultLocations: ['São Paulo, SP', 'Santo André, SP', 'São Bernardo do Campo, SP'],
    funnelStages: ['Contato', 'Qualificado', 'Proposta', 'Negociação', 'Cliente', 'Não converteu'],
    messageTemplates: {
      first_contact: 'Olá! Vi o escritório {nome_empresa} e percebi a especialização de vocês.\n\nTrabalho ajudando contadores a captar empresas que precisam trocar de contador ou abrir CNPJ — automaticamente, sem esforço comercial.\n\nPosso mostrar como escritórios parceiros captam 10 novos clientes por mês no piloto automático?',
      followup_1: 'Oi {nome_empresa}! 👋 Sei que a temporada fiscal é intensa.\n\nRetorno pra saber se você viu minha mensagem. Tenho uma solução de captação que funciona nos horários que você está ocupado — totalmente automatizado.\n\nVale 10 minutos?',
      followup_2: '{nome_empresa}, última mensagem! 📊\n\nEm época de IR e obrigações acessórias, sei que é difícil pensar em comercial. Por isso criei uma solução que trabalha enquanto você não pode.\n\nAinda há interesse?',
      reactivation: 'Olá {nome_empresa}! Tudo bem? 😊\n\nRetomo contato com uma novidade — ferramenta de captura de MEIs que precisam regularizar situação fiscal.\n\nTem interesse em ver?',
    },
    agentPersonality: {
      name: 'Marcos',
      tone: 'profissional',
      knowledge_base: 'Especialista em marketing para escritórios contábeis. Ofereço captação de clientes pessoa jurídica, automação de atendimento inicial, abertura de CNPJ como isca de lead, e gestão de relacionamento com clientes contábeis.',
      services: ['Captação de clientes PJ', 'Abertura de CNPJ', 'Automação de atendimento', 'Marketing contábil', 'Gestão de clientes'],
    },
    bestHours: { start: 8, end: 17 },
    weeklyLeadTarget: 30,
    intentKeywords: {
      positive: ['quero', 'interesse', 'sim', 'pode', 'vamos', 'quando', 'gostaria'],
      price: ['quanto custa', 'valor', 'mensalidade', 'honorários', 'proposta'],
      schedule: ['agendar', 'reunião', 'call', 'apresentação', 'visita'],
      negative: ['não quero', 'não tenho interesse', 'para', 'stop', 'sair'],
    },
  },
  ecommerce: {
    id: 'ecommerce',
    label: 'E-commerce e Lojas Online',
    emoji: '🛒',
    defaultLocations: ['São Paulo, SP', 'Barueri, SP', 'Cotia, SP'],
    funnelStages: ['Contato', 'Qualificado', 'Demo', 'Proposta', 'Cliente', 'Não converteu'],
    messageTemplates: {
      first_contact: 'Olá! Vi a loja {nome_empresa} e curti muito o que vocês fazem! 🛒\n\nTrabalho ajudando lojas online a recuperar carrinhos abandonados e aumentar recompra via WhatsApp — sem precisar de dev.\n\nAlguns clientes recuperam até 30% dos carrinhos abandonados. Posso mostrar como?',
      followup_1: 'Oi {nome_empresa}! 👋 Retorno para saber se você teve chance de ver minha mensagem.\n\nTenho uma solução de recuperação de carrinho por WhatsApp que funciona com qualquer plataforma — Shopify, Nuvemshop, WooCommerce.\n\nVale uma conversa?',
      followup_2: '{nome_empresa}, última tentativa! 🚀\n\nTenho um caso de uma loja similar que recuperou R$ 15.000/mês em carrinhos abandonados.\n\nAinda faz sentido conversar?',
      reactivation: 'Oi {nome_empresa}! Tudo bem? 😊\n\nPassou um tempo do nosso contato. Lançamos automação de pós-venda por WhatsApp que aumenta recompra em 25%.\n\nTem interesse?',
    },
    agentPersonality: {
      name: 'Beatriz',
      tone: 'dinamico',
      knowledge_base: 'Especialista em automação para e-commerce. Ofereço recuperação de carrinho abandonado via WhatsApp, pós-venda automatizado, recompra, suporte automatizado e marketing para lojas online.',
      services: ['Recuperação de carrinho', 'Pós-venda automático', 'Recompra', 'Suporte automatizado', 'Marketing e-commerce'],
    },
    bestHours: { start: 9, end: 21 },
    weeklyLeadTarget: 50,
    intentKeywords: {
      positive: ['quero', 'interesse', 'sim', 'top', 'show', 'bora', 'vamos', 'quando'],
      price: ['quanto custa', 'valor', 'plano', 'mensalidade', 'taxa'],
      schedule: ['agendar', 'call', 'demo', 'apresentação', 'reunião'],
      negative: ['não quero', 'para', 'stop', 'sair', 'chega'],
    },
  },
};

export const NICHE_LIST = Object.values(NICHE_CONFIGS);
export const getNicheConfig = (id: string): NicheConfig | null => NICHE_CONFIGS[id] || null;
