import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useToast } from '@/hooks/use-toast';
import { WhatsAppConnection } from '@/components/WhatsAppConnection';
import { AntiBlockSettings } from '@/components/settings/AntiBlockSettings';
import { ApiKeysSettings } from '@/components/settings/ApiKeysSettings';
import { TeamSettings } from '@/components/settings/TeamSettings';
import { ReportExportSettings } from '@/components/settings/ReportExportSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { QuickSetupWizard } from '@/components/settings/QuickSetupWizard';
import {
  PERSONALITY_TRAITS,
  AGENT_TYPE_OPTIONS,
  COMMUNICATION_STYLE_OPTIONS,
  RESPONSE_LENGTH_OPTIONS,
  EMOJI_USAGE_OPTIONS,
  OBJECTION_HANDLING_OPTIONS,
  CLOSING_STYLE_OPTIONS,
  FOLLOW_UP_TONE_OPTIONS,
  GREETING_STYLE_OPTIONS,
  VALUE_PROPOSITION_OPTIONS,
  PersonalityTrait,
  AgentType,
  CommunicationStyle,
  ResponseLength,
  EmojiUsage,
  ObjectionHandling,
  ClosingStyle,
  FollowUpTone,
  GreetingStyle,
  ValuePropositionFocus,
} from '@/types/database';
import {
  Bot,
  MessageSquare,
  Target,
  Bell,
  Webhook,
  Plus,
  X,
  Loader2,
  Check,
  Brain,
  Sparkles,
  Settings2,
  Shield,
  Key,
  Users,
  Download,
  Zap,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Simplified tab structure
const settingsTabs = [
  { 
    id: 'quickstart', 
    icon: Sparkles, 
    label: 'Início Rápido',
    description: 'Configure tudo em 3 passos'
  },
  { 
    id: 'connections', 
    icon: Zap, 
    label: 'Conexões',
    description: 'WhatsApp e APIs'
  },
  { 
    id: 'agent', 
    icon: Bot, 
    label: 'Agente IA',
    description: 'Personalidade e comportamento'
  },
  { 
    id: 'advanced', 
    icon: Wrench, 
    label: 'Avançado',
    description: 'Equipe, relatórios e mais'
  },
];

export default function SettingsPage() {
  const { settings, isLoading, updateSettings, isUpdating } = useUserSettings();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('quickstart');

  // Basic settings
  const [agentName, setAgentName] = useState('');
  const [agentPersona, setAgentPersona] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [newNiche, setNewNiche] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  // Advanced settings
  const [agentType, setAgentType] = useState<AgentType>('consultivo');
  const [communicationStyle, setCommunicationStyle] = useState<CommunicationStyle>('formal');
  const [responseLength, setResponseLength] = useState<ResponseLength>('medio');
  const [emojiUsage, setEmojiUsage] = useState<EmojiUsage>('moderado');
  const [objectionHandling, setObjectionHandling] = useState<ObjectionHandling>('suave');
  const [closingStyle, setClosingStyle] = useState<ClosingStyle>('consultivo');
  const [followUpTone, setFollowUpTone] = useState<FollowUpTone>('amigavel');
  const [greetingStyle, setGreetingStyle] = useState<GreetingStyle>('padrao');
  const [valuePropositionFocus, setValuePropositionFocus] = useState<ValuePropositionFocus>('beneficios');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

  // Initialize form values when settings load
  useEffect(() => {
    if (settings) {
      setAgentName(settings.agent_name || '');
      setAgentPersona(settings.agent_persona || '');
      setKnowledgeBase(settings.knowledge_base || '');
      setWebhookUrl(settings.webhook_url || '');
      setAgentType(settings.agent_type || 'consultivo');
      setCommunicationStyle(settings.communication_style || 'formal');
      setResponseLength(settings.response_length || 'medio');
      setEmojiUsage(settings.emoji_usage || 'moderado');
      setObjectionHandling(settings.objection_handling || 'suave');
      setClosingStyle(settings.closing_style || 'consultivo');
      setFollowUpTone(settings.follow_up_tone || 'amigavel');
      setGreetingStyle(settings.greeting_style || 'padrao');
      setValuePropositionFocus(settings.value_proposition_focus || 'beneficios');
      
      const traits = (settings.personality_traits || []) as PersonalityTrait[];
      setSelectedTraits(traits.filter(t => t.enabled).map(t => t.id));
    }
  }, [settings]);

  const handleSaveAgent = () => {
    updateSettings({
      agent_name: agentName,
      agent_persona: agentPersona,
      knowledge_base: knowledgeBase,
    });
  };

  const handleSavePersonality = () => {
    const traits: PersonalityTrait[] = PERSONALITY_TRAITS.map(t => ({
      ...t,
      enabled: selectedTraits.includes(t.id),
    }));

    updateSettings({
      agent_type: agentType,
      personality_traits: traits,
      communication_style: communicationStyle,
      response_length: responseLength,
      emoji_usage: emojiUsage,
      objection_handling: objectionHandling,
      closing_style: closingStyle,
      follow_up_tone: followUpTone,
      greeting_style: greetingStyle,
      value_proposition_focus: valuePropositionFocus,
    });
  };

  const toggleTrait = (traitId: string) => {
    if (selectedTraits.includes(traitId)) {
      setSelectedTraits(selectedTraits.filter(t => t !== traitId));
    } else if (selectedTraits.length < 5) {
      setSelectedTraits([...selectedTraits, traitId]);
    } else {
      toast({
        title: 'Limite atingido',
        description: 'Você pode selecionar no máximo 5 traços de personalidade.',
        variant: 'destructive',
      });
    }
  };

  const handleAddNiche = () => {
    if (!newNiche.trim() || !settings) return;
    const niches = [...(settings.target_niches || []), newNiche.trim()];
    updateSettings({ target_niches: niches });
    setNewNiche('');
  };

  const handleRemoveNiche = (niche: string) => {
    if (!settings) return;
    const niches = (settings.target_niches || []).filter(n => n !== niche);
    updateSettings({ target_niches: niches });
  };

  const handleAddLocation = () => {
    if (!newLocation.trim() || !settings) return;
    const locations = [...(settings.target_locations || []), newLocation.trim()];
    updateSettings({ target_locations: locations });
    setNewLocation('');
  };

  const handleRemoveLocation = (location: string) => {
    if (!settings) return;
    const locations = (settings.target_locations || []).filter(l => l !== location);
    updateSettings({ target_locations: locations });
  };

  const handleSaveWebhook = () => {
    updateSettings({ webhook_url: webhookUrl });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Configurações">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const renderOptionCard = (
    options: { value: string; label: string; description: string }[],
    currentValue: string,
    onChange: (value: string) => void,
    name: string
  ) => (
    <RadioGroup value={currentValue} onValueChange={onChange} className="grid grid-cols-2 gap-3">
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
            currentValue === option.value ? 'border-primary bg-primary/5' : 'border-border'
          }`}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
            <span className="font-medium text-sm">{option.label}</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 ml-6">{option.description}</span>
        </label>
      ))}
    </RadioGroup>
  );

  return (
    <DashboardLayout
      title="Configurações"
      description="Configure seu agente de prospecção"
    >
      {/* Tab Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {settingsTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all duration-200",
                isActive
                  ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <TabIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{tab.label}</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">{tab.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Quick Start */}
        {activeTab === 'quickstart' && <QuickSetupWizard />}

        {/* Connections - WhatsApp & APIs */}
        {activeTab === 'connections' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* WhatsApp */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  WhatsApp
                </CardTitle>
                <CardDescription>
                  Conecte sua conta para enviar mensagens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WhatsAppConnection />
              </CardContent>
            </Card>

            {/* API Keys */}
            <div className="space-y-6">
              <ApiKeysSettings />
            </div>

            {/* Anti-Block Settings */}
            <div className="lg:col-span-2">
              <AntiBlockSettings />
            </div>
          </div>
        )}

        {/* Agent Configuration */}
        {activeTab === 'agent' && (
          <div className="space-y-6">
            {/* Agent Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Informações do Agente
                </CardTitle>
                <CardDescription>
                  Configure como a IA se apresenta e o que ela sabe sobre seu negócio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="agentName">Nome do Agente</Label>
                    <Input
                      id="agentName"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="Ex: Ana, Carlos..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agentPersona">Persona/Cargo</Label>
                    <Input
                      id="agentPersona"
                      value={agentPersona}
                      onChange={(e) => setAgentPersona(e.target.value)}
                      placeholder="Ex: Consultora de Marketing"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="knowledgeBase">Base de Conhecimento</Label>
                  <Textarea
                    id="knowledgeBase"
                    value={knowledgeBase}
                    onChange={(e) => setKnowledgeBase(e.target.value)}
                    placeholder="Descreva seus serviços, diferenciais, preços..."
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    A IA usará essas informações para personalizar as mensagens
                  </p>
                </div>
                <Button onClick={handleSaveAgent} disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                  Salvar Informações
                </Button>
              </CardContent>
            </Card>

            {/* Personality Settings - Collapsible sections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Personalidade
                </CardTitle>
                <CardDescription>
                  Defina o tom e estilo de comunicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Agent Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Tipo de Agente</Label>
                  {renderOptionCard(AGENT_TYPE_OPTIONS, agentType, (v) => setAgentType(v as AgentType), 'agent-type')}
                </div>

                <Separator />

                {/* Communication Style */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Estilo de Comunicação</Label>
                  {renderOptionCard(COMMUNICATION_STYLE_OPTIONS, communicationStyle, (v) => setCommunicationStyle(v as CommunicationStyle), 'comm-style')}
                </div>

                <Separator />

                {/* Personality Traits */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Traços de Personalidade</Label>
                    <Badge variant="secondary">{selectedTraits.length}/5</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {PERSONALITY_TRAITS.map((trait) => {
                      const isSelected = selectedTraits.includes(trait.id);
                      return (
                        <button
                          key={trait.id}
                          onClick={() => toggleTrait(trait.id)}
                          className={cn(
                            "p-2 rounded-lg border text-left transition-all text-xs",
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <span className="font-medium">{trait.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Quick Settings Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Tamanho das Respostas</Label>
                    {renderOptionCard(RESPONSE_LENGTH_OPTIONS, responseLength, (v) => setResponseLength(v as ResponseLength), 'resp-length')}
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Uso de Emojis</Label>
                    {renderOptionCard(EMOJI_USAGE_OPTIONS, emojiUsage, (v) => setEmojiUsage(v as EmojiUsage), 'emoji')}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Tratamento de Objeções</Label>
                    {renderOptionCard(OBJECTION_HANDLING_OPTIONS, objectionHandling, (v) => setObjectionHandling(v as ObjectionHandling), 'objection')}
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Estilo de Fechamento</Label>
                    {renderOptionCard(CLOSING_STYLE_OPTIONS, closingStyle, (v) => setClosingStyle(v as ClosingStyle), 'closing')}
                  </div>
                </div>

                <Button onClick={handleSavePersonality} disabled={isUpdating} className="w-full">
                  {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                  Salvar Personalidade
                </Button>
              </CardContent>
            </Card>

            {/* Target Niches & Locations */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Nichos Alvo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newNiche}
                      onChange={(e) => setNewNiche(e.target.value)}
                      placeholder="Ex: Restaurantes"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNiche()}
                    />
                    <Button onClick={handleAddNiche} size="icon" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {settings?.target_niches?.map((niche, i) => (
                      <Badge key={i} variant="secondary" className="pr-1">
                        {niche}
                        <button onClick={() => handleRemoveNiche(niche)} className="ml-2 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Localizações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Ex: São Paulo, SP"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()}
                    />
                    <Button onClick={handleAddLocation} size="icon" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {settings?.target_locations?.map((loc, i) => (
                      <Badge key={i} variant="secondary" className="pr-1">
                        {loc}
                        <button onClick={() => handleRemoveLocation(loc)} className="ml-2 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        {activeTab === 'advanced' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Team Settings */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Equipe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TeamSettings />
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationSettings />
              </CardContent>
            </Card>

            {/* Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  Relatórios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReportExportSettings />
              </CardContent>
            </Card>

            {/* Webhook */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-primary" />
                  Webhook
                </CardTitle>
                <CardDescription>
                  Receba eventos em tempo real (para n8n, Zapier, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://seu-webhook.com/endpoint"
                    className="flex-1"
                  />
                  <Button onClick={handleSaveWebhook} disabled={isUpdating}>
                    Salvar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Eventos disponíveis: lead_created, message_sent, meeting_scheduled
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
