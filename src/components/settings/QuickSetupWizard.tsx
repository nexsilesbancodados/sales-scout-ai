import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AgentType, CommunicationStyle, ObjectionHandling, ClosingStyle, ResponseLength, EmojiUsage } from '@/types/database';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle2,
  Circle,
  Rocket,
  Shield,
  Bot,
  MessageSquare,
  Zap,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Settings2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

const PRESET_PROFILES = [
  {
    id: 'conservador',
    name: '🛡️ Conservador',
    description: 'Máxima segurança, menor volume',
    settings: {
      daily_message_limit: 20,
      message_interval_seconds: 120,
      warmup_enabled: true,
      warmup_day: 1,
      work_days_only: true,
      operate_all_day: false,
      auto_start_hour: 9,
      auto_end_hour: 17,
      randomize_interval: true,
      randomize_order: true,
      typing_simulation: true,
      cooldown_after_batch: true,
      batch_size: 5,
      cooldown_minutes: 20,
    },
  },
  {
    id: 'equilibrado',
    name: '⚖️ Equilibrado',
    description: 'Bom volume com segurança',
    settings: {
      daily_message_limit: 40,
      message_interval_seconds: 90,
      warmup_enabled: true,
      warmup_day: 3,
      work_days_only: true,
      operate_all_day: false,
      auto_start_hour: 8,
      auto_end_hour: 18,
      randomize_interval: true,
      randomize_order: true,
      typing_simulation: true,
      cooldown_after_batch: true,
      batch_size: 10,
      cooldown_minutes: 15,
    },
  },
  {
    id: 'agressivo',
    name: '🚀 Agressivo',
    description: 'Alto volume, mais risco',
    settings: {
      daily_message_limit: 80,
      message_interval_seconds: 60,
      warmup_enabled: false,
      warmup_day: 7,
      work_days_only: false,
      operate_all_day: false,
      auto_start_hour: 7,
      auto_end_hour: 21,
      randomize_interval: true,
      randomize_order: true,
      typing_simulation: true,
      cooldown_after_batch: true,
      batch_size: 15,
      cooldown_minutes: 10,
    },
  },
];

const AGENT_PROFILES: {
  id: string;
  name: string;
  description: string;
  settings: {
    agent_type: AgentType;
    communication_style: CommunicationStyle;
    objection_handling: ObjectionHandling;
    closing_style: ClosingStyle;
    response_length: ResponseLength;
    emoji_usage: EmojiUsage;
  };
}[] = [
  {
    id: 'consultivo',
    name: '💡 Consultor',
    description: 'Oferece valor e insights antes de vender',
    settings: {
      agent_type: 'consultivo',
      communication_style: 'formal',
      objection_handling: 'suave',
      closing_style: 'consultivo',
      response_length: 'medio',
      emoji_usage: 'moderado',
    },
  },
  {
    id: 'amigavel',
    name: '🤝 Amigável',
    description: 'Tom leve e próximo, cria conexão',
    settings: {
      agent_type: 'amigavel',
      communication_style: 'casual',
      objection_handling: 'suave',
      closing_style: 'beneficio',
      response_length: 'medio',
      emoji_usage: 'frequente',
    },
  },
  {
    id: 'direto',
    name: '🎯 Direto',
    description: 'Vai ao ponto, objetivo e claro',
    settings: {
      agent_type: 'tecnico',
      communication_style: 'profissional',
      objection_handling: 'assertivo',
      closing_style: 'direto',
      response_length: 'curto',
      emoji_usage: 'minimo',
    },
  },
];

interface QuickSetupWizardProps {
  onComplete?: () => void;
}

export function QuickSetupWizard({ onComplete }: QuickSetupWizardProps) {
  const { settings, updateSettings, isUpdating } = useUserSettings();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<string>('equilibrado');
  const [selectedAgent, setSelectedAgent] = useState<string>('consultivo');
  const [agentName, setAgentName] = useState(settings?.agent_name || '');
  const [knowledgeBase, setKnowledgeBase] = useState(settings?.knowledge_base || '');
  
  const steps: WizardStep[] = [
    {
      id: 'profile',
      title: 'Perfil de Envio',
      description: 'Escolha seu estilo de prospecção',
      icon: <Shield className="h-5 w-5" />,
      completed: !!selectedProfile,
    },
    {
      id: 'agent',
      title: 'Personalidade do Agente',
      description: 'Como a IA vai se comunicar',
      icon: <Bot className="h-5 w-5" />,
      completed: !!selectedAgent,
    },
    {
      id: 'knowledge',
      title: 'Informações do Negócio',
      description: 'O que a IA deve saber sobre você',
      icon: <MessageSquare className="h-5 w-5" />,
      completed: !!knowledgeBase.trim(),
    },
  ];

  const progress = Math.round(((currentStep + 1) / steps.length) * 100);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const profile = PRESET_PROFILES.find(p => p.id === selectedProfile);
    const agent = AGENT_PROFILES.find(a => a.id === selectedAgent);

    if (!profile || !agent) return;

    updateSettings({
      ...profile.settings,
      ...agent.settings,
      agent_name: agentName || 'Assistente',
      knowledge_base: knowledgeBase,
    });

    toast({
      title: '✅ Configuração Concluída!',
      description: 'Suas configurações foram salvas. Você pode ajustá-las a qualquer momento.',
    });

    onComplete?.();
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-6 w-6 text-primary" />
              Configuração Rápida
            </CardTitle>
            <CardDescription>
              Configure tudo em 3 passos simples
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            Passo {currentStep + 1} de {steps.length}
          </Badge>
        </div>
        
        {/* Progress bar */}
        <Progress value={progress} className="h-2 mt-4" />
        
        {/* Step indicators */}
        <div className="flex justify-between mt-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-2 text-sm",
                index === currentStep ? "text-primary font-medium" : "text-muted-foreground",
                index < currentStep && "text-green-600"
              )}
            >
              {index < currentStep ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : index === currentStep ? (
                <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                  {index + 1}
                </div>
              ) : (
                <Circle className="h-5 w-5" />
              )}
              <span className="hidden sm:inline">{step.title}</span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Profile Selection */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">
                Qual é o seu estilo de prospecção?
              </h3>
              <p className="text-muted-foreground text-sm">
                Isso define limites de envio, intervalos e configurações de segurança
              </p>
            </div>

            <div className="grid gap-4">
              {PRESET_PROFILES.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => setSelectedProfile(profile.id)}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border text-left transition-all",
                    selectedProfile === profile.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className="text-3xl">{profile.name.split(' ')[0]}</div>
                  <div className="flex-1">
                    <p className="font-semibold">{profile.name.split(' ').slice(1).join(' ')}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {profile.description}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {profile.settings.daily_message_limit} msgs/dia
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {profile.settings.message_interval_seconds}s intervalo
                      </Badge>
                      {profile.settings.warmup_enabled && (
                        <Badge variant="secondary" className="text-xs">
                          🔥 Warmup ativo
                        </Badge>
                      )}
                    </div>
                  </div>
                  {selectedProfile === profile.id && (
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Agent Personality */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">
                Como o agente deve se comunicar?
              </h3>
              <p className="text-muted-foreground text-sm">
                Define o tom e estilo das mensagens geradas pela IA
              </p>
            </div>

            <div className="grid gap-4">
              {AGENT_PROFILES.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border text-left transition-all",
                    selectedAgent === agent.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className="text-3xl">{agent.name.split(' ')[0]}</div>
                  <div className="flex-1">
                    <p className="font-semibold">{agent.name.split(' ').slice(1).join(' ')}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {agent.description}
                    </p>
                  </div>
                  {selectedAgent === agent.id && (
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <Separator />

            <div className="space-y-3">
              <Label htmlFor="agent-name">Nome do Agente (opcional)</Label>
              <Input
                id="agent-name"
                placeholder="Ex: Ana, Carlos, Assistente Virtual..."
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                O nome que aparecerá nas mensagens quando se apresentar
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Knowledge Base */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">
                Conte sobre seu negócio
              </h3>
              <p className="text-muted-foreground text-sm">
                A IA usará essas informações para personalizar as mensagens
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="knowledge">Informações sobre seus serviços</Label>
              <textarea
                id="knowledge"
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder={`Exemplo:

- Oferecemos gestão de tráfego pago para negócios locais
- Especialistas em Facebook e Instagram Ads
- Aumentamos vendas em média 40% nos primeiros 3 meses
- Trabalhamos com restaurantes, clínicas e e-commerces
- Planos a partir de R$ 997/mês
- Atendemos todo o Brasil`}
                value={knowledgeBase}
                onChange={(e) => setKnowledgeBase(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Inclua: serviços oferecidos, diferenciais, resultados, preços e público-alvo
              </p>
            </div>

            <Alert className="bg-primary/5 border-primary/20">
              <Zap className="h-4 w-4 text-primary" />
              <AlertDescription>
                <strong>Dica:</strong> Quanto mais detalhes você fornecer, mais personalizadas 
                e efetivas serão as mensagens geradas pela IA.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isUpdating} size="lg">
              {isUpdating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Rocket className="h-4 w-4 mr-2" />
              )}
              Finalizar Configuração
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
