import { useState } from 'react';
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
import { useUserSettings } from '@/hooks/use-user-settings';
import { useToast } from '@/hooks/use-toast';
import {
  Bot,
  MessageSquare,
  Target,
  Bell,
  Webhook,
  QrCode,
  Plus,
  X,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const { settings, isLoading, updateSettings, isUpdating } = useUserSettings();
  const { toast } = useToast();

  const [agentName, setAgentName] = useState('');
  const [agentPersona, setAgentPersona] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [newNiche, setNewNiche] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  // Initialize form values when settings load
  useState(() => {
    if (settings) {
      setAgentName(settings.agent_name);
      setAgentPersona(settings.agent_persona);
      setKnowledgeBase(settings.knowledge_base);
      setWebhookUrl(settings.webhook_url || '');
    }
  });

  const handleSaveAgent = () => {
    updateSettings({
      agent_name: agentName || settings?.agent_name,
      agent_persona: agentPersona || settings?.agent_persona,
      knowledge_base: knowledgeBase || settings?.knowledge_base,
    });
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

  return (
    <DashboardLayout
      title="Configurações"
      description="Personalize seu agente de prospecção"
    >
      <Tabs defaultValue="whatsapp" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="agent">Agente</TabsTrigger>
          <TabsTrigger value="prospecting">Prospecção</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        {/* WhatsApp Tab */}
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conexão WhatsApp
              </CardTitle>
              <CardDescription>
                Conecte seu WhatsApp para enviar e receber mensagens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  {settings?.whatsapp_connected ? (
                    <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                      <Check className="h-6 w-6 text-success" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {settings?.whatsapp_connected ? 'WhatsApp Conectado' : 'WhatsApp Desconectado'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {settings?.whatsapp_connected
                        ? 'Seu agente pode enviar e receber mensagens'
                        : 'Escaneie o QR Code para conectar'}
                    </p>
                  </div>
                </div>
                <Badge variant={settings?.whatsapp_connected ? 'default' : 'secondary'}>
                  {settings?.whatsapp_connected ? 'Online' : 'Offline'}
                </Badge>
              </div>

              {!settings?.whatsapp_connected && (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                  <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="h-24 w-24 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    A integração com WhatsApp será implementada em breve.
                    <br />
                    Você receberá um QR Code para escanear com seu celular.
                  </p>
                  <Button className="mt-4" disabled>
                    Gerar QR Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Tab */}
        <TabsContent value="agent">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Personalização do Agente
              </CardTitle>
              <CardDescription>
                Configure a personalidade e conhecimento do seu agente de IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Nome do Agente</Label>
                <Input
                  id="agent-name"
                  placeholder="Ex: Gustavo"
                  defaultValue={settings?.agent_name}
                  onChange={(e) => setAgentName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-persona">Persona do Agente</Label>
                <Textarea
                  id="agent-persona"
                  placeholder="Descreva como o agente deve se comportar..."
                  rows={4}
                  defaultValue={settings?.agent_persona}
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
                  defaultValue={settings?.knowledge_base}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>
                Configure como você quer ser notificado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificações por E-mail</p>
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
                  defaultValue={settings?.webhook_url || ''}
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
      </Tabs>
    </DashboardLayout>
  );
}
