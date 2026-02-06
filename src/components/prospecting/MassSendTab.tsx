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
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    if (!lead || !massMessage.trim()) return;

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
    if (selectedLeads.length === 0 || !massMessage.trim()) {
      toast({
        title: 'Selecione leads e escreva uma mensagem',
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

    // Create background job for mass sending
    createJob({
      job_type: 'mass_send',
      total_items: selectedLeadsData.length,
      priority: 7, // Higher priority for user-initiated tasks
      payload: {
        leads: selectedLeadsData,
        message_template: massMessage,
        use_ai_personalization: useAIPersonalization,
        agent_settings: {
          agent_name: settings?.agent_name,
          agent_persona: settings?.agent_persona,
          communication_style: settings?.communication_style,
          emoji_usage: settings?.emoji_usage,
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
                            disabled={!massMessage.trim()}
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
              Mensagem Personalizada por IA
            </CardTitle>
            <CardDescription>
              A mensagem será adaptada automaticamente para cada empresa e nicho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                      Gerando prévia...
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{previewMessage}</p>
                  )}
                </div>
              )}

              <Button
                className="w-full gradient-primary"
                onClick={handleMassSend}
                disabled={isCreating || hasActiveMassSend || selectedLeads.length === 0 || !massMessage.trim()}
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : hasActiveMassSend ? (
                  <Activity className="h-4 w-4 mr-2 animate-pulse" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {hasActiveMassSend 
                  ? 'Envio em andamento...'
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
