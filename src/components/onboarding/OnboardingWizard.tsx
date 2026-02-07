import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import {
  Rocket,
  MessageSquare,
  Zap,
  Target,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Bot,
  Shield,
  Phone,
  Settings2,
  Play,
  PartyPopper,
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Prospecte! 🎉',
    description: 'Vamos configurar sua conta em 5 minutos',
    icon: <Rocket className="h-8 w-8" />,
  },
  {
    id: 'agent',
    title: 'Configure seu Agente IA',
    description: 'Defina como a IA vai se comunicar',
    icon: <Bot className="h-8 w-8" />,
  },
  {
    id: 'profile',
    title: 'Perfil de Envio',
    description: 'Escolha sua estratégia de prospecção',
    icon: <Shield className="h-8 w-8" />,
  },
  {
    id: 'whatsapp',
    title: 'Conectar WhatsApp',
    description: 'Vincule seu número para começar',
    icon: <Phone className="h-8 w-8" />,
  },
  {
    id: 'complete',
    title: 'Tudo Pronto!',
    description: 'Você está pronto para prospectar',
    icon: <PartyPopper className="h-8 w-8" />,
  },
];

const AGENT_STYLES = [
  { id: 'consultivo', name: '💡 Consultor', desc: 'Oferece valor antes de vender' },
  { id: 'amigavel', name: '🤝 Amigável', desc: 'Tom leve e próximo' },
  { id: 'direto', name: '🎯 Direto', desc: 'Objetivo e claro' },
];

const SEND_PROFILES = [
  { id: 'conservador', name: '🛡️ Conservador', desc: '20 msgs/dia, máxima segurança' },
  { id: 'equilibrado', name: '⚖️ Equilibrado', desc: '40 msgs/dia, bom volume' },
  { id: 'agressivo', name: '🚀 Agressivo', desc: '80 msgs/dia, alto volume' },
];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings, updateSettings, isUpdating } = useUserSettings();
  
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [agentName, setAgentName] = useState('');
  const [agentStyle, setAgentStyle] = useState('consultivo');
  const [sendProfile, setSendProfile] = useState('equilibrado');
  const [knowledgeBase, setKnowledgeBase] = useState('');

  // Check if user needs onboarding
  useEffect(() => {
    if (settings && !settings.knowledge_base && !settings.agent_name) {
      // New user, show onboarding
      const hasSeenOnboarding = localStorage.getItem(`onboarding_${user?.id}`);
      if (!hasSeenOnboarding) {
        setIsOpen(true);
      }
    }
  }, [settings, user?.id]);

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Save settings
    await updateSettings({
      agent_name: agentName || 'Assistente',
      agent_type: agentStyle as any,
      knowledge_base: knowledgeBase,
      // Apply preset based on sendProfile
      daily_message_limit: sendProfile === 'conservador' ? 20 : sendProfile === 'equilibrado' ? 40 : 80,
      message_interval_seconds: sendProfile === 'conservador' ? 120 : sendProfile === 'equilibrado' ? 90 : 60,
    });

    // Mark onboarding as complete
    localStorage.setItem(`onboarding_${user?.id}`, 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(`onboarding_${user?.id}`, 'true');
    setIsOpen(false);
  };

  const handleGoToWhatsApp = () => {
    localStorage.setItem(`onboarding_${user?.id}`, 'true');
    setIsOpen(false);
    navigate('/settings?tab=conexao');
  };

  const handleGoToProspecting = () => {
    localStorage.setItem(`onboarding_${user?.id}`, 'true');
    setIsOpen(false);
    navigate('/prospecting?tab=capture');
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                {currentStepData.icon}
              </div>
              <div>
                <DialogTitle>{currentStepData.title}</DialogTitle>
                <DialogDescription>{currentStepData.description}</DialogDescription>
              </div>
            </div>
            <Badge variant="secondary">
              {currentStep + 1}/{ONBOARDING_STEPS.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2 mt-4" />
        </DialogHeader>

        <div className="py-4">
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <div className="text-center space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">
                  Olá! Eu sou o Prospecte 👋
                </h3>
                <p className="text-muted-foreground">
                  Vou te ajudar a capturar leads automaticamente e iniciar conversas 
                  inteligentes via WhatsApp para agendar reuniões.
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-muted/50">
                  <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-medium">Captura Automática</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-medium">IA Conversacional</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-medium">Follow-up Inteligente</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Agent Configuration */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do seu Agente</Label>
                <Input
                  placeholder="Ex: Ana, Carlos, Assistente..."
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Como a IA vai se apresentar nas conversas
                </p>
              </div>

              <div className="space-y-2">
                <Label>Estilo de Comunicação</Label>
                <div className="grid gap-2">
                  {AGENT_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setAgentStyle(style.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                        agentStyle === style.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-2xl">{style.name.split(' ')[0]}</span>
                      <div>
                        <p className="font-medium text-sm">{style.name.split(' ').slice(1).join(' ')}</p>
                        <p className="text-xs text-muted-foreground">{style.desc}</p>
                      </div>
                      {agentStyle === style.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sobre seu Negócio (opcional)</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Ex: Oferecemos gestão de tráfego pago para negócios locais..."
                  value={knowledgeBase}
                  onChange={(e) => setKnowledgeBase(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Send Profile */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Defina o volume e velocidade de envio de mensagens
              </p>
              
              <div className="grid gap-3">
                {SEND_PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setSendProfile(profile.id)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                      sendProfile === profile.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-3xl">{profile.name.split(' ')[0]}</span>
                    <div>
                      <p className="font-medium">{profile.name.split(' ').slice(1).join(' ')}</p>
                      <p className="text-sm text-muted-foreground">{profile.desc}</p>
                    </div>
                    {sendProfile === profile.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: WhatsApp */}
          {currentStep === 3 && (
            <div className="text-center space-y-6">
              <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20">
                <Phone className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-bold mb-2">Conecte seu WhatsApp</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Para enviar mensagens, você precisa vincular seu número de WhatsApp
                </p>
                <Button onClick={handleGoToWhatsApp} className="bg-green-600 hover:bg-green-700">
                  <Phone className="h-4 w-4 mr-2" />
                  Conectar Agora
                </Button>
              </div>
              
              <Button variant="ghost" onClick={handleNext} className="text-muted-foreground">
                Configurar depois →
              </Button>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <div className="text-center space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20">
                <PartyPopper className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Parabéns! 🎊</h3>
                <p className="text-muted-foreground">
                  Sua conta está configurada. Agora é só começar a capturar leads!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Explorar Dashboard
                </Button>
                <Button onClick={handleGoToProspecting}>
                  <Play className="h-4 w-4 mr-2" />
                  Capturar Leads
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        {currentStep < 4 && currentStep !== 3 && (
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="ghost"
              onClick={currentStep === 0 ? handleSkip : handleBack}
            >
              {currentStep === 0 ? 'Pular' : <><ArrowLeft className="h-4 w-4 mr-2" /> Voltar</>}
            </Button>

            <Button onClick={currentStep === 2 ? handleComplete : handleNext} disabled={isUpdating}>
              {currentStep === 2 ? 'Salvar e Continuar' : 'Próximo'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
