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
} from 'lucide-react';

export default function SettingsPage() {
  const { settings, isLoading, updateSettings, isUpdating } = useUserSettings();
  const { toast } = useToast();

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

  const handleToggleNotifications = (enabled: boolean) => {
    updateSettings({ email_notifications: enabled });
  };

  const handleToggleDailyReport = (enabled: boolean) => {
    updateSettings({ daily_report_enabled: enabled });
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
      description="Personalize seu agente de prospecção com IA avançada"
    >
      <Tabs defaultValue="antiblock" className="space-y-6">
        <TabsList className="flex flex-wrap w-full max-w-5xl gap-1">
          <TabsTrigger value="apikeys" className="gap-1">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">APIs</span>
          </TabsTrigger>
          <TabsTrigger value="antiblock" className="gap-1">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Anti-Bloqueio</span>
          </TabsTrigger>
          <TabsTrigger value="personality" className="gap-1">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Personalidade</span>
          </TabsTrigger>
          <TabsTrigger value="agent" className="gap-1">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Agente</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-1">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </TabsTrigger>
          <TabsTrigger value="prospecting" className="gap-1">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Prospecção</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alertas</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-1">
            <Webhook className="h-4 w-4" />
            <span className="hidden sm:inline">Integrações</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Equipe</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Relatórios</span>
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab - NEW */}
        <TabsContent value="apikeys">
          <ApiKeysSettings />
        </TabsContent>

        {/* Anti-Block Tab - NEW */}
        <TabsContent value="antiblock">
          <AntiBlockSettings />
        </TabsContent>

        {/* Personality Tab - NEW */}
        <TabsContent value="personality">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Agent Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Tipo de Agente
                </CardTitle>
                <CardDescription>
                  Escolha o estilo principal de abordagem do seu agente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderOptionCard(AGENT_TYPE_OPTIONS, agentType, (v) => setAgentType(v as AgentType), 'agent-type')}
              </CardContent>
            </Card>

            {/* Communication Style */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Estilo de Comunicação
                </CardTitle>
                <CardDescription>
                  Define o tom geral das mensagens
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderOptionCard(COMMUNICATION_STYLE_OPTIONS, communicationStyle, (v) => setCommunicationStyle(v as CommunicationStyle), 'comm-style')}
              </CardContent>
            </Card>

            {/* Personality Traits */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Traços de Personalidade
                  <Badge variant="secondary" className="ml-2">
                    {selectedTraits.length}/5 selecionados
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Selecione até 5 características que definem a personalidade do agente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {PERSONALITY_TRAITS.map((trait) => {
                    const isSelected = selectedTraits.includes(trait.id);
                    return (
                      <button
                        key={trait.id}
                        onClick={() => toggleTrait(trait.id)}
                        className={`flex flex-col p-3 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={isSelected} className="pointer-events-none" />
                          <span className="font-medium text-sm">{trait.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {trait.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Response Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  Configurações de Resposta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Tamanho das Respostas</Label>
                  {renderOptionCard(RESPONSE_LENGTH_OPTIONS, responseLength, (v) => setResponseLength(v as ResponseLength), 'resp-length')}
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium mb-3 block">Uso de Emojis</Label>
                  {renderOptionCard(EMOJI_USAGE_OPTIONS, emojiUsage, (v) => setEmojiUsage(v as EmojiUsage), 'emoji')}
                </div>
              </CardContent>
            </Card>

            {/* Sales Approach */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Abordagem de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Tratamento de Objeções</Label>
                  {renderOptionCard(OBJECTION_HANDLING_OPTIONS, objectionHandling, (v) => setObjectionHandling(v as ObjectionHandling), 'objection')}
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium mb-3 block">Estilo de Fechamento</Label>
                  {renderOptionCard(CLOSING_STYLE_OPTIONS, closingStyle, (v) => setClosingStyle(v as ClosingStyle), 'closing')}
                </div>
              </CardContent>
            </Card>

            {/* Follow-up & Greeting */}
            <Card>
              <CardHeader>
                <CardTitle>Follow-up e Saudação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Tom do Follow-up</Label>
                  {renderOptionCard(FOLLOW_UP_TONE_OPTIONS, followUpTone, (v) => setFollowUpTone(v as FollowUpTone), 'followup')}
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium mb-3 block">Estilo de Saudação</Label>
                  {renderOptionCard(GREETING_STYLE_OPTIONS, greetingStyle, (v) => setGreetingStyle(v as GreetingStyle), 'greeting')}
                </div>
              </CardContent>
            </Card>

            {/* Value Proposition */}
            <Card>
              <CardHeader>
                <CardTitle>Proposta de Valor</CardTitle>
                <CardDescription>
                  Como o agente destaca seus serviços
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderOptionCard(VALUE_PROPOSITION_OPTIONS, valuePropositionFocus, (v) => setValuePropositionFocus(v as ValuePropositionFocus), 'value')}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSavePersonality} disabled={isUpdating} size="lg">
              {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              Salvar Personalidade
            </Button>
          </div>
        </TabsContent>

        {/* Agent Tab */}
        <TabsContent value="agent">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Personalização Básica do Agente
              </CardTitle>
              <CardDescription>
                Configure nome, persona e base de conhecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Nome do Agente</Label>
                <Input
                  id="agent-name"
                  placeholder="Ex: Gustavo"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-persona">Persona do Agente</Label>
                <Textarea
                  id="agent-persona"
                  placeholder="Descreva como o agente deve se comportar..."
                  rows={4}
                  value={agentPersona}
                  onChange={(e) => setAgentPersona(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Defina o tom de voz, estilo de comunicação e objetivos do agente
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="knowledge-base">Base de Conhecimento</Label>
                <Textarea
                  id="knowledge-base"
                  placeholder="Informações sobre seus produtos, serviços, preços, diferenciais..."
                  rows={6}
                  value={knowledgeBase}
                  onChange={(e) => setKnowledgeBase(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  O agente usará essas informações para responder perguntas dos leads
                </p>
              </div>

              <div className="space-y-2">
                <Label>Serviços Oferecidos</Label>
                <div className="flex flex-wrap gap-2">
                  {settings?.services_offered?.map((service) => (
                    <Badge key={service} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveAgent} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Tab */}
        <TabsContent value="whatsapp">
          <WhatsAppConnection />
        </TabsContent>

        {/* Prospecting Tab */}
        <TabsContent value="prospecting">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Nichos Alvo
                </CardTitle>
                <CardDescription>
                  Defina os tipos de negócios que você quer prospectar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Restaurantes, Clínicas..."
                    value={newNiche}
                    onChange={(e) => setNewNiche(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNiche()}
                  />
                  <Button onClick={handleAddNiche} disabled={isUpdating}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {settings?.target_niches?.map((niche) => (
                    <Badge key={niche} variant="secondary" className="gap-1">
                      {niche}
                      <button
                        onClick={() => handleRemoveNiche(niche)}
                        className="ml-1 hover:text-destructive"
                      >
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
                  <Target className="h-5 w-5" />
                  Localizações
                </CardTitle>
                <CardDescription>
                  Defina as cidades ou regiões para prospectar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: São Paulo, Campinas..."
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
                  />
                  <Button onClick={handleAddLocation} disabled={isUpdating}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {settings?.target_locations?.map((location) => (
                    <Badge key={location} variant="secondary" className="gap-1">
                      {location}
                      <button
                        onClick={() => handleRemoveLocation(location)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="grid gap-6 lg:grid-cols-2">
            <NotificationSettings />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações por E-mail
                </CardTitle>
                <CardDescription>
                  Configure alertas por email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertas de Leads</p>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas quando leads responderem
                    </p>
                  </div>
                  <Switch
                    checked={settings?.email_notifications}
                    onCheckedChange={handleToggleNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Relatório Diário</p>
                    <p className="text-sm text-muted-foreground">
                      Receba um resumo das atividades do dia
                    </p>
                  </div>
                  <Switch
                    checked={settings?.daily_report_enabled}
                    onCheckedChange={handleToggleDailyReport}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook de Eventos
              </CardTitle>
              <CardDescription>
                Envie eventos para ferramentas externas como n8n ou Zapier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL do Webhook</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Eventos Enviados</Label>
                <div className="flex flex-wrap gap-2">
                  {settings?.webhook_events?.map((event) => (
                    <Badge key={event} variant="outline">
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveWebhook} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Salvar Webhook
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Token de API</CardTitle>
              <CardDescription>
                Use este token para acionar a prospecção via API externa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input
                  type="password"
                  value={settings?.hunter_api_token || ''}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(settings?.hunter_api_token || '');
                    toast({ title: 'Token copiado!' });
                  }}
                >
                  Copiar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use como Bearer Token em requisições para /api/hunter
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <TeamSettings />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <ReportExportSettings />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
