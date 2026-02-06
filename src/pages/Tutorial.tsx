import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useUserSettings } from '@/hooks/use-user-settings';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Settings,
  MessageSquare,
  Target,
  Zap,
  Send,
  BarChart3,
  ArrowRight,
  Play,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Smartphone,
  Key,
  Bot,
  Users,
  ExternalLink,
  Mail,
  Search,
  Sparkles,
} from 'lucide-react';

// API Links for users to get their keys
const API_LINKS = {
  gemini: 'https://aistudio.google.com/apikey',
  serpapi: 'https://serpapi.com/manage-api-key',
  hunter: 'https://hunter.io/api_keys',
};

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  actionLink: string;
  isComplete: boolean;
  tips: string[];
}

export default function TutorialPage() {
  const { settings } = useUserSettings();
  const [expandedStep, setExpandedStep] = useState<string | null>('step-1');

  const steps: TutorialStep[] = [
    {
      id: 'step-1',
      title: 'Configurar Agente de Vendas',
      description: 'Defina o nome, personalidade e estilo de comunicação do seu agente de IA.',
      icon: <Bot className="h-5 w-5" />,
      action: 'Ir para Configurações',
      actionLink: '/settings',
      isComplete: !!(settings?.agent_name && settings?.agent_persona),
      tips: [
        'Escolha um nome que transmita confiança e profissionalismo',
        'Defina uma persona que se adapte ao seu público-alvo',
        'Configure os serviços que você oferece para mensagens mais relevantes',
      ],
    },
    {
      id: 'step-2',
      title: 'Conectar WhatsApp',
      description: 'Conecte seu WhatsApp para enviar e receber mensagens automaticamente.',
      icon: <Smartphone className="h-5 w-5" />,
      action: 'Conectar WhatsApp',
      actionLink: '/settings',
      isComplete: !!settings?.whatsapp_connected,
      tips: [
        'Use o QR Code para uma conexão mais rápida e confiável',
        'Mantenha o celular conectado à internet durante o uso',
        'O WhatsApp Business é recomendado para perfis profissionais',
      ],
    },
    {
      id: 'step-3',
      title: 'Definir Nichos e Locais Alvo',
      description: 'Escolha os nichos de mercado e localidades para prospecção.',
      icon: <Target className="h-5 w-5" />,
      action: 'Configurar Alvos',
      actionLink: '/settings',
      isComplete: !!(settings?.target_niches?.length && settings?.target_locations?.length),
      tips: [
        'Comece com 2-3 nichos que você conhece bem',
        'Foque em localidades onde você pode atender presencialmente',
        'Nichos específicos tendem a ter melhores taxas de conversão',
      ],
    },
    {
      id: 'step-4',
      title: 'Criar Templates de Mensagem',
      description: 'Crie modelos de mensagens personalizados para cada nicho.',
      icon: <MessageSquare className="h-5 w-5" />,
      action: 'Criar Templates',
      actionLink: '/prospecting?tab=templates',
      isComplete: false,
      tips: [
        'Use variáveis como {empresa} e {cidade} para personalização',
        'Mantenha mensagens curtas (máximo 3 parágrafos)',
        'Termine sempre com uma pergunta aberta',
        'Teste diferentes abordagens (A/B testing)',
      ],
    },
    {
      id: 'step-5',
      title: 'Capturar Primeiros Leads',
      description: 'Use a ferramenta de captura para encontrar leads no Google Maps.',
      icon: <Zap className="h-5 w-5" />,
      action: 'Capturar Leads',
      actionLink: '/prospecting?tab=capture',
      isComplete: false,
      tips: [
        'A busca inclui automaticamente subnichos relacionados',
        'Leads são filtrados para remover duplicatas',
        'Leads sem telefone são ignorados automaticamente',
      ],
    },
    {
      id: 'step-6',
      title: 'Analisar e Personalizar',
      description: 'Use IA para analisar leads e gerar mensagens personalizadas.',
      icon: <Lightbulb className="h-5 w-5" />,
      action: 'Analisar Leads',
      actionLink: '/prospecting?tab=capture',
      isComplete: false,
      tips: [
        'A IA identifica dores específicas de cada negócio',
        'Revise as mensagens geradas antes de enviar',
        'Ajuste o tom conforme sua preferência',
      ],
    },
    {
      id: 'step-7',
      title: 'Iniciar Disparos',
      description: 'Envie mensagens personalizadas para os leads selecionados.',
      icon: <Send className="h-5 w-5" />,
      action: 'Disparar Mensagens',
      actionLink: '/prospecting?tab=capture',
      isComplete: false,
      tips: [
        'O sistema usa intervalos aleatórios para evitar bloqueios',
        'Você pode pausar e retomar a qualquer momento',
        'Mensagens são salvas automaticamente no histórico',
      ],
    },
    {
      id: 'step-8',
      title: 'Acompanhar Conversas',
      description: 'Monitore respostas e continue as conversas com leads interessados.',
      icon: <Users className="h-5 w-5" />,
      action: 'Ver Conversas',
      actionLink: '/conversations',
      isComplete: false,
      tips: [
        'Leads que respondem sobem automaticamente de temperatura',
        'Use o funil para organizar o estágio de cada lead',
        'Agende reuniões diretamente pela plataforma',
      ],
    },
    {
      id: 'step-9',
      title: 'Analisar Resultados',
      description: 'Acompanhe métricas de performance e otimize sua estratégia.',
      icon: <BarChart3 className="h-5 w-5" />,
      action: 'Ver Análise',
      actionLink: '/analytics',
      isComplete: false,
      tips: [
        'Monitore taxas de resposta por nicho e horário',
        'Identifique quais mensagens têm melhor performance',
        'Ajuste sua estratégia com base nos dados',
      ],
    },
  ];

  const completedSteps = steps.filter((s) => s.isComplete).length;
  const progressPercent = (completedSteps / steps.length) * 100;

  return (
    <DashboardLayout
      title="Tutorial"
      description="Guia passo a passo para configurar e usar o Prospecte"
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Progress Overview */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Seu Progresso
                </CardTitle>
                <CardDescription className="mt-1">
                  {completedSteps} de {steps.length} passos concluídos
                </CardDescription>
              </div>
              <Badge variant={progressPercent === 100 ? 'default' : 'secondary'} className="text-lg px-4 py-1">
                {Math.round(progressPercent)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercent} className="h-3" />
            {progressPercent === 100 ? (
              <p className="text-sm text-primary mt-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Parabéns! Você completou todas as configurações básicas.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-3">
                Complete os passos abaixo para começar a prospectar.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Início Rápido
            </CardTitle>
            <CardDescription>
              Se você quer começar a prospectar agora, siga estes 3 passos essenciais:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Link to="/settings">
                <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-medium">1. Configurar</p>
                    <p className="text-sm text-muted-foreground">Agente + WhatsApp</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/prospecting?tab=capture">
                <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-medium">2. Capturar</p>
                    <p className="text-sm text-muted-foreground">Buscar leads</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/prospecting?tab=capture">
                <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Send className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-medium">3. Disparar</p>
                    <p className="text-sm text-muted-foreground">Enviar mensagens</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Step by Step Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Guia Completo</CardTitle>
            <CardDescription>
              Siga cada passo para configurar sua máquina de prospecção
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Accordion
              type="single"
              collapsible
              value={expandedStep || undefined}
              onValueChange={(value) => setExpandedStep(value)}
            >
              {steps.map((step, index) => (
                <AccordionItem key={step.id} value={step.id} className="border-b last:border-0">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          step.isComplete
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {step.isComplete ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{step.title}</p>
                          {step.isComplete && (
                            <Badge variant="secondary" className="text-xs">
                              Concluído
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="ml-14 space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-primary" />
                          Dicas
                        </p>
                        <ul className="space-y-1">
                          {step.tips.map((tip, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button asChild>
                        <Link to={step.actionLink}>
                          {step.icon}
                          <span className="ml-2">{step.action}</span>
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* API Keys Section */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Chaves de API Necessárias
            </CardTitle>
            <CardDescription>
              Obtenha suas chaves de API clicando nos links abaixo e configure em Configurações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Gemini API */}
              <a 
                href={API_LINKS.gemini} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md h-full group">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium flex items-center justify-center gap-1">
                        Google Gemini
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        IA para análise e personalização de mensagens
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Grátis - 60 req/min
                    </Badge>
                  </CardContent>
                </Card>
              </a>

              {/* SerpAPI */}
              <a 
                href={API_LINKS.serpapi} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md h-full group">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Search className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium flex items-center justify-center gap-1">
                        SerpAPI
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Busca de leads no Google Maps
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      100 buscas/mês grátis
                    </Badge>
                  </CardContent>
                </Card>
              </a>

              {/* Hunter.io */}
              <a 
                href={API_LINKS.hunter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md h-full group">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium flex items-center justify-center gap-1">
                        Hunter.io
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Busca de emails profissionais
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      25 buscas/mês grátis
                    </Badge>
                  </CardContent>
                </Card>
              </a>
            </div>

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                Após obter suas chaves, vá em <Link to="/settings" className="text-primary hover:underline font-medium">Configurações → API Keys</Link> para configurá-las.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              Notas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              <strong>Sobre bloqueios:</strong> O WhatsApp pode bloquear números que enviam muitas
              mensagens em pouco tempo. Recomendamos começar com volumes baixos (20-30 msgs/dia) e
              ir aumentando gradualmente.
            </p>
            <p className="text-sm">
              <strong>Boas práticas:</strong> Mensagens personalizadas têm taxas de resposta 3x
              maiores que mensagens genéricas. Use sempre a análise de IA antes de disparar.
            </p>
            <p className="text-sm">
              <strong>Horários:</strong> Os melhores horários para contato comercial são entre 9h-11h
              e 14h-17h. Evite fins de semana e feriados.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
