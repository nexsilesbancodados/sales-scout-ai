import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { useProspectingHistory, ProspectingHistoryLead } from '@/hooks/use-prospecting-history';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lead } from '@/types/database';
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
  RefreshCw,
  Users,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Clock,
  History,
  Database,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  const [searchParams] = useSearchParams();
  const { leads } = useLeads();
  const { settings } = useUserSettings();
  const { toast } = useToast();
  const { createJob, activeJobs, isCreating } = useBackgroundJobs();
  const { history } = useProspectingHistory();
  
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [massMessage, setMassMessage] = useState('');
  const [useAIPersonalization, setUseAIPersonalization] = useState(true);
  const [previewLead, setPreviewLead] = useState<string | null>(null);
  const [previewMessage, setPreviewMessage] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [sendMode, setSendMode] = useState<'template' | 'direct'>('template');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [importedLeads, setImportedLeads] = useState<Lead[]>([]);
  const [isRemarketing, setIsRemarketing] = useState(false);
  const [viewMode, setViewMode] = useState<'pending' | 'sent' | 'history'>('pending');
  const [expandedNiches, setExpandedNiches] = useState<Set<string>>(new Set());
  const [selectedHistoryLeads, setSelectedHistoryLeads] = useState<ProspectingHistoryLead[]>([]);

  // Extract all leads from history sessions grouped by niche
  const historyLeadsByNiche = useMemo(() => {
    const grouped: Record<string, { leads: ProspectingHistoryLead[]; sessionId: string; location: string | null }[]> = {};
    
    history.forEach(session => {
      if (!session.leads_data || session.leads_data.length === 0) return;
      
      const niche = session.niche || 'Sem nicho';
      if (!grouped[niche]) grouped[niche] = [];
      
      grouped[niche].push({
        leads: session.leads_data,
        sessionId: session.id,
        location: session.location,
      });
    });
    
    return grouped;
  }, [history]);

  // Total leads in history
  const totalHistoryLeads = useMemo(() => {
    return history.reduce((acc, session) => acc + (session.leads_data?.length || 0), 0);
  }, [history]);

  // Check for leads passed from Leads page via sessionStorage
  useEffect(() => {
    const source = searchParams.get('source');
    if (source === 'leads' || source === 'remarketing') {
      const storedLeads = sessionStorage.getItem('mass_send_leads');
      const remarketing = sessionStorage.getItem('mass_send_remarketing');
      
      if (storedLeads) {
        try {
          const parsedLeads = JSON.parse(storedLeads) as Lead[];
          setImportedLeads(parsedLeads);
          setSelectedLeads(parsedLeads.map(l => l.id));
          setIsRemarketing(remarketing === 'true');
          
          // Clear sessionStorage
          sessionStorage.removeItem('mass_send_leads');
          sessionStorage.removeItem('mass_send_remarketing');
          
          toast({
            title: isRemarketing ? 'Leads para Remarketing' : 'Leads Importados',
            description: `${parsedLeads.length} leads prontos para ${remarketing === 'true' ? 'remarketing' : 'envio'}`,
          });
        } catch (e) {
          console.error('Error parsing stored leads:', e);
        }
      }
    }
  }, [searchParams, toast]);

  // Check if there's an active mass_send job
  const hasActiveMassSend = activeJobs.some(j => j.job_type === 'mass_send');

  // Use all leads from database when no imported leads
  const allLeads = importedLeads.length > 0 ? importedLeads : leads;
  
  // Separate leads by sent status
  const pendingLeads = allLeads.filter(l => !l.message_sent);
  const sentLeads = allLeads.filter(l => l.message_sent);
  
  // Display leads based on current view mode
  const displayLeads = viewMode === 'pending' ? pendingLeads : sentLeads;

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
            isRemarketing,
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
    const lead = displayLeads.find(l => l.id === leadId);
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
              isRemarketing,
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

  // Get total leads to send based on view mode
  const leadsToSendCount = viewMode === 'history' 
    ? selectedHistoryLeads.length 
    : selectedLeads.length;

  const handleMassSend = async () => {
    const isHistoryMode = viewMode === 'history';
    const hasLeads = isHistoryMode ? selectedHistoryLeads.length > 0 : selectedLeads.length > 0;

    if (!hasLeads) {
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

    // Prepare leads data for the job - from history or from database leads
    let selectedLeadsData: any[] = [];

    if (isHistoryMode) {
      // Use leads from history - get niche/location from the parent session
      // First, collect all sessions that have selected leads
      const sessionMap = new Map<string, { niche: string | null; location: string | null }>();
      history.forEach(session => {
        session.leads_data?.forEach(lead => {
          if (selectedHistoryLeads.some(sl => sl.phone === lead.phone)) {
            sessionMap.set(lead.phone, {
              niche: session.niche,
              location: session.location,
            });
          }
        });
      });

      selectedLeadsData = selectedHistoryLeads.map(lead => ({
        id: null, // History leads don't have DB IDs yet
        phone: lead.phone,
        business_name: lead.business_name,
        niche: sessionMap.get(lead.phone)?.niche || null,
        location: sessionMap.get(lead.phone)?.location || null,
        rating: null,
        reviews_count: null,
        from_history: true,
      }));
    } else {
      // Use leads from database
      selectedLeadsData = selectedLeads.map(id => {
        const lead = displayLeads.find(l => l.id === id);
        return {
          id: lead?.id,
          phone: lead?.phone,
          business_name: lead?.business_name,
          niche: lead?.niche,
          location: lead?.location,
          rating: lead?.rating,
          reviews_count: lead?.reviews_count,
        };
      }).filter(l => l.phone);
    }

    if (selectedLeadsData.length === 0) {
      toast({
        title: 'Nenhum lead válido selecionado',
        description: 'Os leads selecionados não possuem telefone.',
        variant: 'destructive',
      });
      return;
    }

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
        is_remarketing: isRemarketing,
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

    // Clear imported leads and remarketing flag after sending
    setImportedLeads([]);
    setIsRemarketing(false);

    // Clear selections
    setSelectedLeads([]);
    setSelectedHistoryLeads([]);
    setMassMessage('');
    setPreviewMessage('');
    setPreviewLead(null);
  };

  // Group leads by niche for better organization
  const leadsByNiche = displayLeads.reduce((acc, lead) => {
    const niche = lead.niche || 'Sem nicho';
    if (!acc[niche]) acc[niche] = [];
    acc[niche].push(lead);
    return acc;
  }, {} as Record<string, typeof displayLeads>);

  // Sort niches by lead count (descending)
  const sortedNiches = Object.entries(leadsByNiche).sort((a, b) => b[1].length - a[1].length);

  const toggleNicheExpand = (niche: string) => {
    setExpandedNiches(prev => {
      const next = new Set(prev);
      if (next.has(niche)) {
        next.delete(niche);
      } else {
        next.add(niche);
      }
      return next;
    });
  };

  const canSend = sendMode === 'direct' 
    ? leadsToSendCount > 0 
    : leadsToSendCount > 0 && massMessage.trim();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Remarketing indicator */}
      {isRemarketing && (
        <div className="lg:col-span-2">
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <RefreshCw className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-700">Modo Remarketing</AlertTitle>
            <AlertDescription className="text-blue-600">
              Você está enviando mensagens de remarketing para {importedLeads.length} leads que já foram contatados anteriormente.
              A IA irá gerar mensagens de follow-up contextualizadas.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Imported leads indicator */}
      {importedLeads.length > 0 && !isRemarketing && (
        <div className="lg:col-span-2">
          <Alert className="border-green-500/50 bg-green-500/10">
            <Users className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-700">Leads Importados</AlertTitle>
            <AlertDescription className="text-green-600">
              {importedLeads.length} leads foram importados da página de Leads e estão prontos para envio.
            </AlertDescription>
          </Alert>
        </div>
      )}

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
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            {isRemarketing ? <RefreshCw className="h-5 w-5 text-primary" /> : <Send className="h-5 w-5" />}
            {isRemarketing ? 'Remarketing' : 'Selecionar Leads'}
          </CardTitle>
          <CardDescription>
            {isRemarketing 
              ? 'Leads selecionados para remarketing'
              : `${allLeads.length} leads capturados • ${pendingLeads.length} pendentes • ${sentLeads.length} enviados`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* View mode tabs */}
            {importedLeads.length === 0 && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={viewMode === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 min-w-[100px]"
                  onClick={() => {
                    setViewMode('pending');
                    setSelectedLeads([]);
                    setSelectedHistoryLeads([]);
                  }}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Pendentes ({pendingLeads.length})
                </Button>
                <Button
                  variant={viewMode === 'sent' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 min-w-[100px]"
                  onClick={() => {
                    setViewMode('sent');
                    setSelectedLeads([]);
                    setSelectedHistoryLeads([]);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Enviados ({sentLeads.length})
                </Button>
                <Button
                  variant={viewMode === 'history' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 min-w-[100px]"
                  onClick={() => {
                    setViewMode('history');
                    setSelectedLeads([]);
                    setSelectedHistoryLeads([]);
                  }}
                >
                  <History className="h-4 w-4 mr-2" />
                  Histórico ({totalHistoryLeads})
                </Button>
              </div>
            )}

            {/* History View */}
            {viewMode === 'history' ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedHistoryLeads.length} leads selecionados do histórico
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedHistoryLeads.length > 0) {
                        setSelectedHistoryLeads([]);
                      } else {
                        // Select all history leads
                        const allHistoryLeads: ProspectingHistoryLead[] = [];
                        Object.values(historyLeadsByNiche).forEach(sessions => {
                          sessions.forEach(session => {
                            allHistoryLeads.push(...session.leads);
                          });
                        });
                        setSelectedHistoryLeads(allHistoryLeads);
                      }
                    }}
                  >
                    {selectedHistoryLeads.length > 0 ? 'Desmarcar todos' : 'Selecionar todos'}
                  </Button>
                </div>

                {totalHistoryLeads === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">Nenhum lead no histórico</p>
                    <p className="text-sm mt-1">
                      Capture leads na aba Captura para popular o histórico
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {Object.entries(historyLeadsByNiche).map(([niche, sessions]) => {
                      const isExpanded = expandedNiches.has(`history-${niche}`);
                      const allNicheLeads = sessions.flatMap(s => s.leads);
                      const selectedInNiche = allNicheLeads.filter(l => 
                        selectedHistoryLeads.some(sl => sl.id === l.id)
                      ).length;
                      const allNicheSelected = selectedInNiche === allNicheLeads.length && allNicheLeads.length > 0;

                      return (
                        <div key={niche} className="border rounded-lg overflow-hidden">
                          <div 
                            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                              allNicheSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
                            }`}
                            onClick={() => toggleNicheExpand(`history-${niche}`)}
                          >
                            <Checkbox
                              checked={allNicheSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedHistoryLeads([...selectedHistoryLeads, ...allNicheLeads.filter(l => 
                                    !selectedHistoryLeads.some(sl => sl.id === l.id)
                                  )]);
                                } else {
                                  setSelectedHistoryLeads(selectedHistoryLeads.filter(sl => 
                                    !allNicheLeads.some(l => l.id === sl.id)
                                  ));
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{niche}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {allNicheLeads.length} lead{allNicheLeads.length !== 1 ? 's' : ''}
                                </Badge>
                              </div>
                              {selectedInNiche > 0 && selectedInNiche < allNicheLeads.length && (
                                <span className="text-xs text-muted-foreground">
                                  {selectedInNiche} selecionado{selectedInNiche !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>

                          {isExpanded && (
                            <div className="border-t divide-y">
                              {allNicheLeads.map((lead) => (
                                <div
                                  key={lead.id}
                                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                                    selectedHistoryLeads.some(sl => sl.id === lead.id)
                                      ? 'bg-primary/5'
                                      : 'hover:bg-muted/30'
                                  }`}
                                  onClick={() => {
                                    const isSelected = selectedHistoryLeads.some(sl => sl.id === lead.id);
                                    if (isSelected) {
                                      setSelectedHistoryLeads(selectedHistoryLeads.filter(sl => sl.id !== lead.id));
                                    } else {
                                      setSelectedHistoryLeads([...selectedHistoryLeads, lead]);
                                    }
                                  }}
                                >
                                  <div className="w-6" />
                                  <Checkbox checked={selectedHistoryLeads.some(sl => sl.id === lead.id)} />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate text-sm">{lead.business_name}</p>
                                    <p className="text-xs text-muted-foreground">{lead.phone}</p>
                                  </div>
                                  <Badge 
                                    variant={lead.status === 'sent' ? 'default' : lead.status === 'error' ? 'destructive' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {lead.status === 'pending' ? 'Pendente' : 
                                     lead.status === 'sent' ? 'Enviado' : 
                                     lead.status === 'error' ? 'Erro' : 
                                     lead.status === 'duplicate' ? 'Duplicado' : 'Salvo'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              /* Regular leads view (pending/sent) */
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedLeads.length} de {displayLeads.length} selecionados
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedLeads.length === displayLeads.length) {
                        setSelectedLeads([]);
                      } else {
                        setSelectedLeads(displayLeads.map(l => l.id));
                      }
                    }}
                  >
                    {selectedLeads.length === displayLeads.length ? 'Desmarcar todos' : 'Selecionar todos'}
                  </Button>
                </div>
                
                {displayLeads.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">
                      {viewMode === 'pending' 
                        ? 'Nenhum lead pendente para envio'
                        : 'Nenhum lead foi enviado ainda'
                      }
                    </p>
                    <p className="text-sm mt-1">
                      {viewMode === 'pending' 
                        ? 'Capture leads na aba Captura ou veja o Histórico'
                        : 'Envie mensagens para leads pendentes primeiro'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {sortedNiches.map(([niche, nicheLeads]) => {
                  const isExpanded = expandedNiches.has(niche);
                  const nicheLeadIds = nicheLeads.map(l => l.id);
                  const selectedInNiche = nicheLeadIds.filter(id => selectedLeads.includes(id)).length;
                  const allNicheSelected = selectedInNiche === nicheLeads.length;
                  
                  return (
                    <div key={niche} className="border rounded-lg overflow-hidden">
                      {/* Niche header - always visible */}
                      <div 
                        className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                          allNicheSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleNicheExpand(niche)}
                      >
                        <Checkbox
                          checked={allNicheSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLeads([...new Set([...selectedLeads, ...nicheLeadIds])]);
                            } else {
                              setSelectedLeads(selectedLeads.filter(id => !nicheLeadIds.includes(id)));
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{niche}</span>
                            <Badge variant="secondary" className="text-xs">
                              {nicheLeads.length} lead{nicheLeads.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          {selectedInNiche > 0 && selectedInNiche < nicheLeads.length && (
                            <span className="text-xs text-muted-foreground">
                              {selectedInNiche} selecionado{selectedInNiche !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      
                      {/* Expanded leads list */}
                      {isExpanded && (
                        <div className="border-t divide-y">
                          {nicheLeads.map((lead) => (
                            <div
                              key={lead.id}
                              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                                selectedLeads.includes(lead.id)
                                  ? 'bg-primary/5'
                                  : 'hover:bg-muted/30'
                              }`}
                              onClick={() => {
                                if (selectedLeads.includes(lead.id)) {
                                  setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                                } else {
                                  setSelectedLeads([...selectedLeads, lead.id]);
                                }
                              }}
                            >
                              <div className="w-6" /> {/* Indent */}
                              <Checkbox checked={selectedLeads.includes(lead.id)} />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-sm">{lead.business_name}</p>
                                <p className="text-xs text-muted-foreground">{lead.phone}</p>
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
                          ))}
                        </div>
                      )}
                    </div>
                  );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {/* Filters Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Filtros do Disparo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
                    <Briefcase className="h-3 w-3 mr-1" />
                    Focado em: {AVAILABLE_SERVICES.find(s => s.id === selectedService)?.label}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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
                    {leadsToSendCount} leads selecionados
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
                    ? `Disparar IA Direta para ${leadsToSendCount} leads`
                    : `Enviar para ${leadsToSendCount} leads${useAIPersonalization ? ' (com IA)' : ''}`
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