import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useToast } from '@/hooks/use-toast';
import { WhatsAppConnection } from '@/components/WhatsAppConnection';
import { AntiBlockSettings } from '@/components/settings/AntiBlockSettings';
import { ApiKeysSettings } from '@/components/settings/ApiKeysSettings';
import { MultiChipSettings } from '@/components/settings/MultiChipSettings';
import { TeamSettings } from '@/components/settings/TeamSettings';
import { ReportExportSettings } from '@/components/settings/ReportExportSettings';
import { ServiceIntelligenceManager } from '@/components/settings/ServiceIntelligenceManager';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { MeetingSettings } from '@/components/settings/MeetingSettings';
import {
  Bot,
  MessageSquare,
  Bell,
  Webhook,
  Loader2,
  Check,
  Shield,
  Users,
  Download,
  Zap,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Simplified tab structure - only 3 main tabs
const settingsTabs = [
  { 
    id: 'connections', 
    icon: Zap, 
    label: 'Conexões',
    description: 'WhatsApp, APIs e segurança'
  },
  { 
    id: 'agent', 
    icon: Bot, 
    label: 'Agente IA',
    description: 'Personalidade e comportamento'
  },
  { 
    id: 'advanced', 
    icon: Settings2, 
    label: 'Avançado',
    description: 'Equipe e integrações'
  },
];

// Simplified agent presets - replaces 10+ individual settings
const AGENT_PRESETS = [
  {
    id: 'consultor',
    name: '💡 Consultor',
    description: 'Oferece valor antes de vender, tom profissional',
    settings: { communication_style: 'formal' as const, emoji_usage: 'moderado' as const, response_length: 'medio' as const, agent_type: 'consultivo' as const }
  },
  {
    id: 'amigavel',
    name: '🤝 Amigável',
    description: 'Tom leve e próximo, mais emojis',
    settings: { communication_style: 'casual' as const, emoji_usage: 'frequente' as const, response_length: 'medio' as const, agent_type: 'amigavel' as const }
  },
  {
    id: 'direto',
    name: '🎯 Direto',
    description: 'Objetivo e claro, sem rodeios',
    settings: { communication_style: 'casual' as const, emoji_usage: 'minimo' as const, response_length: 'curto' as const, agent_type: 'agressivo' as const }
  },
  {
    id: 'especialista',
    name: '🧠 Especialista',
    description: 'Técnico e detalhista, foco em expertise',
    settings: { communication_style: 'formal' as const, emoji_usage: 'minimo' as const, response_length: 'longo' as const, agent_type: 'tecnico' as const }
  },
];

export default function SettingsPage() {
  const { settings, isLoading, updateSettings, isUpdating } = useUserSettings();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('connections');

  // Collapsible states
  const [showAdvancedAgent, setShowAdvancedAgent] = useState(false);

  // Basic settings
  const [agentName, setAgentName] = useState('');
  const [agentPersona, setAgentPersona] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('consultor');
  const [webhookUrl, setWebhookUrl] = useState('');

  // Initialize form values when settings load
  useEffect(() => {
    if (settings) {
      setAgentName(settings.agent_name || '');
      setAgentPersona(settings.agent_persona || '');
      setKnowledgeBase(settings.knowledge_base || '');
      setWebhookUrl(settings.webhook_url || '');
      
      // Detect current preset based on settings
      const currentType = settings.agent_type || 'consultivo';
      const matchingPreset = AGENT_PRESETS.find(p => p.settings.agent_type === currentType);
      setSelectedPreset(matchingPreset?.id || 'consultor');
    }
  }, [settings]);

  const handleSaveAgent = () => {
    const preset = AGENT_PRESETS.find(p => p.id === selectedPreset);
    
    updateSettings({
      agent_name: agentName,
      agent_persona: agentPersona,
      knowledge_base: knowledgeBase,
      ...(preset?.settings || {}),
    });
    
    toast({
      title: '✓ Agente atualizado',
      description: 'As configurações foram salvas.',
    });
  };

  const handleSaveWebhook = () => {
    updateSettings({ webhook_url: webhookUrl });
    toast({ title: '✓ Webhook salvo' });
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

  // Status indicators for tabs
  const isWhatsAppConnected = settings?.whatsapp_connected;
  const hasApiKeys = settings?.serper_api_key || settings?.serpapi_api_key;
  const hasAgentConfig = settings?.agent_name && settings?.knowledge_base;

  return (
    <DashboardLayout
      title="Configurações"
      description="Configure seu agente de prospecção"
    >
      {/* Tab Navigation with status indicators */}
      <div className="flex flex-wrap gap-2 mb-6">
        {settingsTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;
          
          // Status indicator
          let status: 'ok' | 'warning' | 'none' = 'none';
          if (tab.id === 'connections') {
            status = isWhatsAppConnected && hasApiKeys ? 'ok' : 'warning';
          } else if (tab.id === 'agent') {
            status = hasAgentConfig ? 'ok' : 'warning';
          }
          
          return (
            <Button
              key={tab.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={cn("gap-2 relative", isActive && "shadow-md")}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
              {status === 'ok' && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
              )}
              {status === 'warning' && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-yellow-500 border-2 border-background" />
              )}
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Connections Tab - WhatsApp, APIs & Anti-Block */}
        {activeTab === 'connections' && (
          <div className="space-y-6">
            {/* Priority: WhatsApp first */}
            <Card className={cn(!isWhatsAppConnected && "ring-2 ring-destructive/50")}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <CardTitle>WhatsApp</CardTitle>
                  </div>
              {isWhatsAppConnected ? (
                    <Badge className="bg-primary text-primary-foreground">Conectado</Badge>
                  ) : (
                    <Badge variant="destructive">Desconectado</Badge>
                  )}
                </div>
                <CardDescription>
                  {isWhatsAppConnected 
                    ? 'Seu WhatsApp está pronto para enviar mensagens'
                    : 'Conecte seu WhatsApp para começar a prospectar'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WhatsAppConnection />
              </CardContent>
            </Card>

            {/* Multi-Chip */}
            <MultiChipSettings />

            {/* API Keys - Compact */}
            <ApiKeysSettings />

            {/* Anti-Block Settings - Always visible */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">Proteção Anti-Bloqueio</CardTitle>
                    <CardDescription className="text-xs">
                      Configure limites e intervalos para evitar banimento
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AntiBlockSettings />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Agent Configuration - Simplified */}
        {activeTab === 'agent' && (
          <div className="space-y-6">
            {/* Auto Reply Toggle - PRIORITY */}
            <Card className={cn(!settings?.auto_prospecting_enabled && "ring-2 ring-yellow-500/50")}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Resposta Automática</p>
                      <p className="text-sm text-muted-foreground">
                        A IA responde automaticamente às mensagens recebidas
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings?.auto_prospecting_enabled || false}
                    onCheckedChange={(checked) => {
                      updateSettings({ auto_prospecting_enabled: checked });
                      toast({
                        title: checked ? '✓ IA ativada' : 'IA desativada',
                        description: checked 
                          ? 'A IA agora responderá automaticamente' 
                          : 'Você precisará responder manualmente',
                      });
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Seu Agente IA
                </CardTitle>
                <CardDescription>
                  Configure como a IA se apresenta e o que ela sabe sobre seu negócio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name & Persona */}
                <div className="grid gap-4 md:grid-cols-2">
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
                    <Label htmlFor="agentPersona">Cargo/Função</Label>
                    <Input
                      id="agentPersona"
                      value={agentPersona}
                      onChange={(e) => setAgentPersona(e.target.value)}
                      placeholder="Ex: Consultora de Marketing"
                    />
                  </div>
                </div>

                {/* Knowledge Base */}
                <div className="space-y-2">
                  <Label htmlFor="knowledgeBase">Sobre seu Negócio</Label>
                  <Textarea
                    id="knowledgeBase"
                    value={knowledgeBase}
                    onChange={(e) => setKnowledgeBase(e.target.value)}
                    placeholder="Descreva seus serviços, diferenciais, preços... A IA usará isso para personalizar mensagens."
                    className="min-h-[100px]"
                  />
                </div>

                <Separator />

                {/* Preset Selection - Replaces 10+ options */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Estilo de Comunicação</Label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {AGENT_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedPreset(preset.id)}
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                          selectedPreset === preset.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <span className="text-2xl">{preset.name.split(' ')[0]}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{preset.name.split(' ').slice(1).join(' ')}</p>
                          <p className="text-xs text-muted-foreground">{preset.description}</p>
                        </div>
                        {selectedPreset === preset.id && (
                          <Check className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSaveAgent} disabled={isUpdating} className="w-full">
                  {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                  Salvar Agente
                </Button>
              </CardContent>
            </Card>

            {/* Service Intelligence - AI Training */}
            <ServiceIntelligenceManager />

          </div>
        )}

        {/* Advanced Settings - Compact */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            {/* Team Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Equipe
                </CardTitle>
                <CardDescription>Gerencie membros e permissões</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamSettings />
              </CardContent>
            </Card>

            {/* Grid for smaller cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Notifications */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    Notificações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NotificationSettings />
                </CardContent>
              </Card>

              {/* Reports */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Download className="h-4 w-4 text-primary" />
                    Relatórios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ReportExportSettings />
                </CardContent>
              </Card>
            </div>

            {/* Meeting Settings */}
            <MeetingSettings />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-primary" />
                  Webhook
                </CardTitle>
                <CardDescription>
                  Receba eventos em tempo real (n8n, Zapier, Make)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
                  Eventos: lead_created, message_sent, meeting_scheduled
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
