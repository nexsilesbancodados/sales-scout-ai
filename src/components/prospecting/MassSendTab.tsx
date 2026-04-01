import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLeads } from '@/hooks/use-leads';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useBackgroundJobs } from '@/hooks/use-background-jobs';
import { useProspectingHistory, ProspectingHistoryLead } from '@/hooks/use-prospecting-history';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lead } from '@/types/database';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Activity, RefreshCw, Users, AlertTriangle } from 'lucide-react';
import { MassSendStats } from './mass-send/MassSendStats';
import { LeadSelector } from './mass-send/LeadSelector';
import { MessageConfigurator, AVAILABLE_SERVICES } from './mass-send/MessageConfigurator';

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
  const [previewMessage, setPreviewMessage] = useState('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [sendMode, setSendMode] = useState<'template' | 'direct'>('template');
  const [selectedService, setSelectedService] = useState('auto');
  const [leadFilter, setLeadFilter] = useState('all');
  const [importedLeads, setImportedLeads] = useState<Lead[]>([]);
  const [isRemarketing, setIsRemarketing] = useState(false);
  const [selectedHistoryLeads, setSelectedHistoryLeads] = useState<ProspectingHistoryLead[]>([]);

  const historyLeadsByNiche = useMemo(() => {
    const grouped: Record<string, { leads: ProspectingHistoryLead[]; sessionId: string; location: string | null }[]> = {};
    history.forEach(session => {
      if (!session.leads_data || session.leads_data.length === 0) return;
      const niche = session.niche || 'Sem nicho';
      if (!grouped[niche]) grouped[niche] = [];
      grouped[niche].push({ leads: session.leads_data, sessionId: session.id, location: session.location });
    });
    return grouped;
  }, [history]);

  const totalHistoryLeads = useMemo(() => {
    return history.reduce((acc, session) => acc + (session.leads_data?.length || 0), 0);
  }, [history]);

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
          sessionStorage.removeItem('mass_send_leads');
          sessionStorage.removeItem('mass_send_remarketing');
          toast({
            title: remarketing === 'true' ? 'Leads para Remarketing' : 'Leads Importados',
            description: `${parsedLeads.length} leads prontos para ${remarketing === 'true' ? 'remarketing' : 'envio'}`,
          });
        } catch (e) {
          console.error('Error parsing stored leads:', e);
        }
      }
    }
  }, [searchParams, toast]);

  const hasActiveMassSend = activeJobs.some(j => j.job_type === 'mass_send');
  const allLeads = importedLeads.length > 0 ? importedLeads : leads;

  const applyLeadFilter = (leadsToFilter: typeof allLeads) => {
    switch (leadFilter) {
      case 'no_website': return leadsToFilter.filter(l => !l.website);
      case 'low_rating': return leadsToFilter.filter(l => l.rating !== null && l.rating < 4);
      case 'few_reviews': return leadsToFilter.filter(l => l.reviews_count !== null && l.reviews_count < 10);
      case 'no_social': return leadsToFilter.filter(l => !(l as any).instagram_url && !(l as any).facebook_url);
      case 'small_business': return leadsToFilter.filter(l => (l.reviews_count === null || l.reviews_count < 50) && !l.website);
      case 'premium': return leadsToFilter.filter(l => l.rating !== null && l.rating >= 4.5 && l.reviews_count !== null && l.reviews_count >= 50);
      default: return leadsToFilter;
    }
  };

  const pendingLeads = applyLeadFilter(allLeads.filter(l => !l.message_sent));
  const sentLeads = applyLeadFilter(allLeads.filter(l => l.message_sent));
  const leadsToSendCount = selectedHistoryLeads.length > 0 ? selectedHistoryLeads.length : selectedLeads.length;

  const handlePreviewMessage = async (leadId: string) => {
    const allDisplay = [...pendingLeads, ...sentLeads];
    const lead = allDisplay.find(l => l.id === leadId);
    if (!lead) return;

    const serviceToOffer = selectedService !== 'all'
      ? AVAILABLE_SERVICES.find(s => s.id === selectedService)?.label
      : null;

    setPreviewLead(leadId);
    setIsGeneratingPreview(true);

    try {
      if (sendMode === 'direct' || useAIPersonalization) {
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
              template: sendMode === 'direct' ? null : massMessage,
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
      } else {
        setPreviewMessage(
          massMessage
            .replace(/\{empresa\}/gi, lead.business_name)
            .replace(/\{nicho\}/gi, lead.niche || 'seu segmento')
            .replace(/\{cidade\}/gi, lead.location || 'sua região')
        );
      }
    } catch (error) {
      console.error('Preview error:', error);
      setPreviewMessage('Erro ao gerar prévia');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleMassSend = async () => {
    const isHistoryMode = selectedHistoryLeads.length > 0;
    const hasLeads = isHistoryMode ? selectedHistoryLeads.length > 0 : selectedLeads.length > 0;

    if (!hasLeads) {
      toast({ title: 'Selecione pelo menos um lead', variant: 'destructive' });
      return;
    }
    if (sendMode === 'template' && !massMessage.trim()) {
      toast({ title: 'Escreva uma mensagem template', variant: 'destructive' });
      return;
    }
    if (!settings?.whatsapp_connected) {
      toast({ title: 'WhatsApp não conectado', description: 'Conecte seu WhatsApp em Configurações.', variant: 'destructive' });
      return;
    }

    let selectedLeadsData: any[] = [];
    if (isHistoryMode) {
      const sessionMap = new Map<string, { niche: string | null; location: string | null }>();
      history.forEach(session => {
        session.leads_data?.forEach(lead => {
          if (selectedHistoryLeads.some(sl => sl.phone === lead.phone)) {
            sessionMap.set(lead.phone, { niche: session.niche, location: session.location });
          }
        });
      });
      selectedLeadsData = selectedHistoryLeads.map(lead => ({
        id: null, phone: lead.phone, business_name: lead.business_name,
        niche: sessionMap.get(lead.phone)?.niche || null,
        location: sessionMap.get(lead.phone)?.location || null,
        rating: null, reviews_count: null, from_history: true,
      }));
    } else {
      const allDisplay = [...pendingLeads, ...sentLeads];
      selectedLeadsData = selectedLeads.map(id => {
        const lead = allDisplay.find(l => l.id === id);
        return {
          id: lead?.id, phone: lead?.phone, business_name: lead?.business_name,
          niche: lead?.niche, location: lead?.location, rating: lead?.rating,
          reviews_count: lead?.reviews_count, website: lead?.website, has_website: !!lead?.website,
        };
      }).filter(l => l.phone);
    }

    if (selectedLeadsData.length === 0) {
      toast({ title: 'Nenhum lead válido selecionado', description: 'Os leads selecionados não possuem telefone.', variant: 'destructive' });
      return;
    }

    const isAutoMode = selectedService === 'auto';
    const serviceToOffer = (selectedService !== 'all' && selectedService !== 'auto')
      ? AVAILABLE_SERVICES.find(s => s.id === selectedService)?.label
      : null;

    createJob({
      job_type: 'mass_send',
      total_items: selectedLeadsData.length,
      priority: 7,
      payload: {
        leads: selectedLeadsData,
        message_template: sendMode === 'direct' ? null : massMessage,
        use_ai_personalization: sendMode === 'direct' ? true : useAIPersonalization,
        direct_ai_mode: sendMode === 'direct',
        is_remarketing: isRemarketing,
        auto_service_mode: isAutoMode,
        lead_filter: leadFilter,
        agent_settings: {
          agent_name: settings?.agent_name,
          agent_persona: settings?.agent_persona,
          communication_style: settings?.communication_style,
          emoji_usage: settings?.emoji_usage,
          services_offered: serviceToOffer ? [serviceToOffer] : settings?.services_offered,
          knowledge_base: settings?.knowledge_base,
          specific_service: isAutoMode ? null : serviceToOffer,
          auto_detect_service: isAutoMode,
        },
      },
    });

    setImportedLeads([]);
    setIsRemarketing(false);
    setSelectedLeads([]);
    setSelectedHistoryLeads([]);
    setMassMessage('');
    setPreviewMessage('');
    setPreviewLead(null);
  };

  const canSend = sendMode === 'direct' ? leadsToSendCount > 0 : leadsToSendCount > 0 && !!massMessage.trim();

  return (
    <div className="space-y-5">
      {/* Alerts */}
      {isRemarketing && (
        <Alert className="border-info/50 bg-info/5">
          <RefreshCw className="h-4 w-4 text-info" />
          <AlertTitle className="text-info">Modo Remarketing</AlertTitle>
          <AlertDescription className="text-info/80">
            Enviando mensagens de remarketing para {importedLeads.length} leads já contatados.
          </AlertDescription>
        </Alert>
      )}

      {importedLeads.length > 0 && !isRemarketing && (
        <Alert className="border-success/50 bg-success/5">
          <Users className="h-4 w-4 text-success" />
          <AlertTitle className="text-success">Leads Importados</AlertTitle>
          <AlertDescription className="text-success/80">
            {importedLeads.length} leads prontos para envio.
          </AlertDescription>
        </Alert>
      )}

      {hasActiveMassSend && (
        <Alert className="border-primary/50 bg-primary/5">
          <Activity className="h-4 w-4 animate-pulse text-primary" />
          <AlertDescription className="text-sm">
            Envio em massa em andamento. Acompanhe no botão "Tarefas" no topo. O envio continua em segundo plano.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <MassSendStats
        totalLeads={allLeads.length}
        pendingLeads={pendingLeads.length}
        sentLeads={sentLeads.length}
        selectedCount={leadsToSendCount}
        hasActiveJob={hasActiveMassSend}
      />

      {/* Main content */}
      <div className="grid gap-5 lg:grid-cols-2">
        <LeadSelector
          pendingLeads={pendingLeads}
          sentLeads={sentLeads}
          selectedLeads={selectedLeads}
          setSelectedLeads={setSelectedLeads}
          selectedHistoryLeads={selectedHistoryLeads}
          setSelectedHistoryLeads={setSelectedHistoryLeads}
          historyLeadsByNiche={historyLeadsByNiche}
          totalHistoryLeads={totalHistoryLeads}
          isImported={importedLeads.length > 0}
          isRemarketing={isRemarketing}
          onPreview={handlePreviewMessage}
          canPreview={sendMode === 'direct' || !!massMessage.trim()}
        />

        <MessageConfigurator
          sendMode={sendMode}
          setSendMode={setSendMode}
          massMessage={massMessage}
          setMassMessage={setMassMessage}
          useAIPersonalization={useAIPersonalization}
          setUseAIPersonalization={setUseAIPersonalization}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          leadFilter={leadFilter}
          setLeadFilter={setLeadFilter}
          previewMessage={previewMessage}
          previewLead={previewLead}
          isGeneratingPreview={isGeneratingPreview}
          leadsToSendCount={leadsToSendCount}
          hasActiveMassSend={hasActiveMassSend}
          isCreating={isCreating}
          canSend={canSend}
          onSend={handleMassSend}
          leads={leads}
          messageIntervalSeconds={settings?.message_interval_seconds}
        />
      </div>
    </div>
  );
}
