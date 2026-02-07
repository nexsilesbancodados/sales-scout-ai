import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLeads } from '@/hooks/use-leads';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useBackgroundJobs } from '@/hooks/use-background-jobs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Send,
  Loader2,
  Sparkles,
  AlertCircle,
  Activity,
  Zap,
  MessageSquare,
  Filter,
  Briefcase,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Available services for filtering
const AVAILABLE_SERVICES = [
  { id: 'all', label: 'Todos os Serviços', description: 'Usar serviços configurados no perfil' },
  { id: 'trafego_pago', label: 'Tráfego Pago', description: 'Gestão de anúncios e campanhas pagas' },
  { id: 'automacao', label: 'Automação', description: 'Automação de processos e sistemas' },
  { id: 'social_media', label: 'Social Media', description: 'Gestão de redes sociais' },
  { id: 'websites', label: 'Sites e Landing Pages', description: 'Criação de sites e páginas' },
  { id: 'seo', label: 'SEO', description: 'Otimização para buscadores' },
  { id: 'design', label: 'Design Gráfico', description: 'Identidade visual e materiais' },
  { id: 'consultoria', label: 'Consultoria', description: 'Consultoria em marketing digital' },
];

export function MassSendTab() {
  const { leads } = useLeads();
  const { settings } = useUserSettings();
  const { toast } = useToast();
  const { createJob, activeJobs, isCreating } = useBackgroundJobs();
  
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [massMessage, setMassMessage] = useState('');
  const [useAIPersonalization, setUseAIPersonalization] = useState(true);
  const [previewLead, setPreviewLead] = useState<string | null>(null);
  const [previewMessage, setPreviewMessage] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [sendMode, setSendMode] = useState<'template' | 'direct'>('template');
  const [selectedService, setSelectedService] = useState<string>('all');

  // Check if there's an active mass_send job
  const hasActiveMassSend = activeJobs.some(j => j.job_type === 'mass_send');

  const generatePersonalizedMessage = async (lead: any, baseMessage: string): Promise<string> => {
    try {
      const response = await supabase.functions.invoke('ai-prospecting', {
        body: {
          action: 'generate_message',
          data: {
            lead: {
              business_name: lead.business_name,
              niche: lead.niche,
              location: lead.location,
              rating: lead.rating,
              reviews_count: lead.reviews_count,
            },
            template: baseMessage,
            agentSettings: {
              agent_name: settings?.agent_name,
              agent_persona: settings?.agent_persona,
              communication_style: settings?.communication_style,
              emoji_usage: settings?.emoji_usage,
            },
          },
        },
      });

      if (response.error) throw response.error;
      return response.data?.message || baseMessage;
    } catch (error) {
      console.error('Error generating personalized message:', error);
      // Fallback: replace variables manually
      return baseMessage
        .replace(/\{empresa\}/gi, lead.business_name)
        .replace(/\{nicho\}/gi, lead.niche || 'seu segmento')
        .replace(/\{cidade\}/gi, lead.location || 'sua região');
    }
  };

  const handlePreviewMessage = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    // Get the specific service to offer
    const serviceToOffer = selectedService !== 'all' 
      ? AVAILABLE_SERVICES.find(s => s.id === selectedService)?.label 
      : null;

    // For direct mode, we don't need a base message
    if (sendMode === 'direct') {
      setPreviewLead(leadId);
      setIsGeneratingPreview(true);
      try {
        const response = await supabase.functions.invoke('ai-prospecting', {
          body: {
            action: 'generate_message',
            data: {
              lead: {
                business_name: lead.business_name,
                niche: lead.niche,
                location: lead.location,
                rating: lead.rating,
                reviews_count: lead.reviews_count,
              },
              template: null, // No template - generate from scratch
              agentSettings: {
                agent_name: settings?.agent_name,
                agent_persona: settings?.agent_persona,
                communication_style: settings?.communication_style,
                emoji_usage: settings?.emoji_usage,
                services_offered: serviceToOffer ? [serviceToOffer] : settings?.services_offered,
                knowledge_base: settings?.knowledge_base,
                specific_service: serviceToOffer,
              },
            },
          },
        });
        if (response.error) throw response.error;
        setPreviewMessage(response.data?.message || 'Erro ao gerar mensagem');
      } catch (error) {
        console.error('Preview error:', error);
        setPreviewMessage('Erro ao gerar prévia da mensagem');
      } finally {
        setIsGeneratingPreview(false);
      }
      return;
    }

    // Template mode
    if (!massMessage.trim()) return;

    setPreviewLead(leadId);
    setIsGeneratingPreview(true);

    try {
      if (useAIPersonalization) {
        const personalized = await generatePersonalizedMessage(lead, massMessage);
        setPreviewMessage(personalized);
      } else {
        // Simple variable replacement
        const personalized = massMessage
          .replace(/\{empresa\}/gi, lead.business_name)
          .replace(/\{nicho\}/gi, lead.niche || 'seu segmento')
          .replace(/\{cidade\}/gi, lead.location || 'sua região');
        setPreviewMessage(personalized);
      }
    } catch (error) {
      console.error('Preview error:', error);
      setPreviewMessage(massMessage);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleMassSend = async () => {
    if (selectedLeads.length === 0) {
      toast({
        title: 'Selecione pelo menos um lead',
        variant: 'destructive',
      });
      return;
    }

    if (sendMode === 'template' && !massMessage.trim()) {
      toast({
        title: 'Escreva uma mensagem template',
        variant: 'destructive',
      });
      return;
    }

    if (!settings?.whatsapp_connected) {
      toast({
        title: 'WhatsApp não conectado',
        description: 'Conecte seu WhatsApp em Configurações.',
        variant: 'destructive',
      });
      return;
    }

    // Prepare leads data for the job
    const selectedLeadsData = selectedLeads.map(id => {
      const lead = leads.find(l => l.id === id);
      return {
        id: lead?.id,
        phone: lead?.phone,
        business_name: lead?.business_name,
        niche: lead?.niche,
        location: lead?.location,
        rating: lead?.rating,
        reviews_count: lead?.reviews_count,
      };
    }).filter(l => l.id);

    // Get the specific service to offer
    const serviceToOffer = selectedService !== 'all' 
      ? AVAILABLE_SERVICES.find(s => s.id === selectedService)?.label 
      : null;

    // Create background job for mass sending
    createJob({
      job_type: 'mass_send',
      total_items: selectedLeadsData.length,
      priority: 7, // Higher priority for user-initiated tasks
      payload: {
        leads: selectedLeadsData,
        message_template: sendMode === 'direct' ? null : massMessage,
        use_ai_personalization: sendMode === 'direct' ? true : useAIPersonalization,
        direct_ai_mode: sendMode === 'direct',
        agent_settings: {
          agent_name: settings?.agent_name,
          agent_persona: settings?.agent_persona,
          communication_style: settings?.communication_style,
          emoji_usage: settings?.emoji_usage,
          services_offered: serviceToOffer ? [serviceToOffer] : settings?.services_offered,
          knowledge_base: settings?.knowledge_base,
          specific_service: serviceToOffer,
        },
      },
    });

    // Clear selections
    setSelectedLeads([]);
    setMassMessage('');
    setPreviewMessage('');
    setPreviewLead(null);
  };

  // Group leads by niche for better organization
  const leadsByNiche = leads.reduce((acc, lead) => {
    const niche = lead.niche || 'Sem nicho';
    if (!acc[niche]) acc[niche] = [];
    acc[niche].push(lead);
    return acc;
  }, {} as Record<string, typeof leads>);

  const canSend = sendMode === 'direct' 
    ? selectedLeads.length > 0 
    : selectedLeads.length > 0 && massMessage.trim();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Active job indicator */}
      {hasActiveMassSend && (
        <div className="lg:col-span-2">
          <Alert className="border-primary/50 bg-primary/5">
            <Activity className="h-4 w-4 animate-pulse" />
            <AlertDescription>
              Há um envio em massa em andamento. Você pode acompanhar o progresso no botão "Tarefas" no topo da página.
              Você pode fechar ou recarregar a página - o envio continuará em segundo plano.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Leads</CardTitle>
          <CardDescription>Escolha os leads para enviar mensagem em massa (agrupados por nicho)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedLeads.length} leads selecionados
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedLeads.length === leads.length) {
                    setSelectedLeads([]);
                  } else {
                    setSelectedLeads(leads.map(l => l.id));
                  }
                }}
              >
                {selectedLeads.length === leads.length ? 'Desmarcar todos' : 'Selecionar todos'}
              </Button>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto space-y-4">
              {Object.entries(leadsByNiche).map(([niche, nicheLeads]) => (
                <div key={niche} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground">{niche}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => {
                        const nicheLeadIds = nicheLeads.map(l => l.id);
                        const allSelected = nicheLeadIds.every(id => selectedLeads.includes(id));
                        if (allSelected) {
                          setSelectedLeads(selectedLeads.filter(id => !nicheLeadIds.includes(id)));
                        } else {
                          setSelectedLeads([...new Set([...selectedLeads, ...nicheLeadIds])]);
                        }
                      }}
                    >
                      {nicheLeads.every(l => selectedLeads.includes(l.id)) ? 'Desmarcar' : 'Selecionar'} nicho
                    </Button>
                  </div>
                  
                  {nicheLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedLeads.includes(lead.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        if (selectedLeads.includes(lead.id)) {
                          setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                        } else {
                          setSelectedLeads([...selectedLeads, lead.id]);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selectedLeads.includes(lead.id)} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{lead.business_name}</p>
                          <p className="text-sm text-muted-foreground">{lead.phone}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {lead.location && (
                            <span className="text-xs text-muted-foreground">{lead.location}</span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewMessage(lead.id);
                            }}
                            disabled={sendMode === 'template' && !massMessage.trim()}
                          >
                            Prévia
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Configurar Mensagem
            </CardTitle>
            <CardDescription>
              Escolha como as mensagens serão geradas para cada lead
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Send Mode Tabs */}
              <Tabs value={sendMode} onValueChange={(v) => setSendMode(v as 'template' | 'direct')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="template" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Com Template
                  </TabsTrigger>
                  <TabsTrigger value="direct" className="gap-2">
                    <Zap className="h-4 w-4" />
                    IA Direta
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="template" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ai-personalization">Personalização com IA</Label>
                      <p className="text-xs text-muted-foreground">
                        Adapta tom e conteúdo para cada nicho
                      </p>
                    </div>
                    <Switch
                      id="ai-personalization"
                      checked={useAIPersonalization}
                      onCheckedChange={setUseAIPersonalization}
                    />
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Use variáveis: <code className="bg-muted px-1 rounded">{'{empresa}'}</code>, <code className="bg-muted px-1 rounded">{'{nicho}'}</code>, <code className="bg-muted px-1 rounded">{'{cidade}'}</code>
                    </AlertDescription>
                  </Alert>

                  <Textarea
                    placeholder={`Olá! Vi que a {empresa} atua no segmento de {nicho} em {cidade}. Tenho uma solução que pode ajudar vocês a crescer...`}
                    value={massMessage}
                    onChange={(e) => setMassMessage(e.target.value)}
                    rows={6}
                  />
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{massMessage.length} caracteres</span>
                    <span>{selectedLeads.length} destinatários</span>
                  </div>
                </TabsContent>

                <TabsContent value="direct" className="space-y-4 mt-4">
                  {/* Service Filter */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Serviço a Oferecer
                    </Label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_SERVICES.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex flex-col">
                              <span>{service.label}</span>
                              <span className="text-xs text-muted-foreground">{service.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedService !== 'all' && (
                      <Badge variant="secondary" className="text-xs">
                        <Filter className="h-3 w-3 mr-1" />
                        Focado em: {AVAILABLE_SERVICES.find(s => s.id === selectedService)?.label}
                      </Badge>
                    )}
                  </div>

                  <Alert className="border-primary/50 bg-primary/5">
                    <Zap className="h-4 w-4 text-primary" />
                    <AlertDescription>
                      <strong>Disparo Direto com IA</strong>
                      <br />
                      A IA gerará uma mensagem única para cada lead baseada em:
                      <ul className="list-disc list-inside mt-2 text-xs space-y-1">
                        <li>Dados do lead (nome, nicho, localização)</li>
                        <li>Persona do seu agente configurado</li>
                        <li>Serviço selecionado: <strong>{AVAILABLE_SERVICES.find(s => s.id === selectedService)?.label}</strong></li>
                        <li>Base de conhecimento</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-2">
                    <p className="font-medium">✨ Vantagens:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Mensagens 100% únicas - menor chance de bloqueio</li>
                      <li>• Não precisa escrever template</li>
                      <li>• Personalização profunda baseada no nicho</li>
                    </ul>
                  </div>

                  <div className="text-sm text-muted-foreground text-center">
                    {selectedLeads.length} leads selecionados
                  </div>
                </TabsContent>
              </Tabs>

              {previewMessage && previewLead && (
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">
                      Prévia para: {leads.find(l => l.id === previewLead)?.business_name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {leads.find(l => l.id === previewLead)?.niche || 'Sem nicho'}
                    </Badge>
                  </div>
                  {isGeneratingPreview ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando prévia com IA...
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{previewMessage}</p>
                  )}
                </div>
              )}

              <Button
                className="w-full gradient-primary"
                onClick={handleMassSend}
                disabled={isCreating || hasActiveMassSend || !canSend}
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : hasActiveMassSend ? (
                  <Activity className="h-4 w-4 mr-2 animate-pulse" />
                ) : sendMode === 'direct' ? (
                  <Zap className="h-4 w-4 mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {hasActiveMassSend 
                  ? 'Envio em andamento...'
                  : sendMode === 'direct'
                    ? `Disparar IA Direta para ${selectedLeads.length} leads`
                    : `Enviar para ${selectedLeads.length} leads${useAIPersonalization ? ' (com IA)' : ''}`
                }
              </Button>

              {settings?.message_interval_seconds && settings.message_interval_seconds > 0 && (
                <p className="text-xs text-center text-muted-foreground">
                  ⚡ Envio em segundo plano com intervalo aleatório de {Math.round(settings.message_interval_seconds * 0.5)}s a {Math.round(settings.message_interval_seconds * 1.5)}s entre mensagens.
                  <br />
                  <strong>Você pode fechar ou recarregar a página - o envio continuará automaticamente.</strong>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}