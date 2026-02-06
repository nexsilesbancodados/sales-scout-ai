import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Send,
  Loader2,
  Pause,
  Play,
  Square,
  MapPin,
  Building2,
  Phone,
  Star,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

const NICHES = [
  'Restaurantes',
  'Salões de Beleza',
  'Academias',
  'Clínicas Médicas',
  'Clínicas Odontológicas',
  'Escritórios de Advocacia',
  'Imobiliárias',
  'Pet Shops',
  'Oficinas Mecânicas',
  'Escolas e Cursos',
  'Lojas de Roupas',
  'Farmácias',
  'Hotéis e Pousadas',
  'Estúdios de Tatuagem',
  'Barbearias',
  'Floriculturas',
  'Padarias',
  'Pizzarias',
  'Hamburguerias',
  'Cafeterias',
];

const LOCATIONS = [
  'São Paulo, SP',
  'Rio de Janeiro, RJ',
  'Belo Horizonte, MG',
  'Curitiba, PR',
  'Porto Alegre, RS',
  'Salvador, BA',
  'Fortaleza, CE',
  'Recife, PE',
  'Brasília, DF',
  'Goiânia, GO',
  'Manaus, AM',
  'Campinas, SP',
  'Florianópolis, SC',
  'Vitória, ES',
  'Natal, RN',
];

interface CapturedLead {
  id: string;
  business_name: string;
  phone: string;
  address?: string;
  rating?: number;
  reviews_count?: number;
  website?: string;
  niche: string;
  location: string;
  painPoints?: string[];
  suggestedMessage?: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  subtype?: string; // Subnicho usado na busca
  google_maps_url?: string;
}

type ProcessStatus = 'idle' | 'capturing' | 'analyzing' | 'sending' | 'paused' | 'completed' | 'stopped';

export function CaptureAndSendTab() {
  const { settings } = useUserSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [capturedLeads, setCapturedLeads] = useState<CapturedLead[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [processStatus, setProcessStatus] = useState<ProcessStatus>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0, phase: '' });
  const [logs, setLogs] = useState<string[]>([]);
  
  const isPausedRef = useRef(false);
  const isStoppedRef = useRef(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getRandomInterval = () => {
    const baseInterval = (settings?.message_interval_seconds || 60) * 1000;
    const minInterval = baseInterval * 0.5;
    const maxInterval = baseInterval * 1.5;
    return Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
  };

  const handleCapture = async () => {
    if (selectedNiches.length === 0 || selectedLocations.length === 0) {
      toast({
        title: 'Selecione nichos e locais',
        description: 'Você precisa selecionar pelo menos um nicho e um local.',
        variant: 'destructive',
      });
      return;
    }

    setProcessStatus('capturing');
    setCapturedLeads([]);
    setSelectedLeadIds([]);
    isStoppedRef.current = false;
    isPausedRef.current = false;

    const totalSearches = selectedNiches.length * selectedLocations.length;
    let currentSearch = 0;
    const allLeads: CapturedLead[] = [];

    addLog(`Iniciando captura: ${selectedNiches.length} nichos × ${selectedLocations.length} locais = ${totalSearches} buscas`);

    for (const niche of selectedNiches) {
      for (const location of selectedLocations) {
        if (isStoppedRef.current) {
          addLog('Captura interrompida pelo usuário');
          setProcessStatus('stopped');
          return;
        }

        while (isPausedRef.current) {
          await sleep(500);
        }

        currentSearch++;
        setProgress({ current: currentSearch, total: totalSearches, phase: `Buscando: ${niche} em ${location}` });
        addLog(`Buscando "${niche}" em "${location}"...`);

        try {
          // Use SerpAPI to search for businesses
          const searchQuery = `${niche} em ${location}`;
          const SERPAPI_KEY = import.meta.env.VITE_SERPAPI_API_KEY;
          
          // Call our edge function to search
          const response = await supabase.functions.invoke('ai-prospecting', {
            body: {
              action: 'search_leads',
              data: { niche, location, query: searchQuery },
            },
          });

          if (response.error) {
            addLog(`Erro ao buscar: ${response.error.message}`);
            continue;
          }

          const leads = response.data?.leads || [];
          const searchTermsUsed = response.data?.searchTermsUsed || [];
          
          addLog(`🎯 Encontrados ${leads.length} leads únicos em ${location}`);
          if (searchTermsUsed.length > 0) {
            addLog(`   → Buscou variações: ${searchTermsUsed.slice(0, 3).join(', ')}${searchTermsUsed.length > 3 ? '...' : ''}`);
          }

          // Toast notification for each batch of leads found
          if (leads.length > 0) {
            toast({
              title: `🎯 ${leads.length} leads encontrados!`,
              description: `${niche} em ${location} (incluindo subnichos)`,
            });
          }

          for (const lead of leads) {
            if (lead.phone) {
              // Check if phone already exists in our list
              const normalizedPhone = lead.phone.replace(/\D/g, '');
              const exists = allLeads.some(l => l.phone.replace(/\D/g, '') === normalizedPhone);
              if (exists) continue;

              allLeads.push({
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                business_name: lead.business_name || lead.title || 'Empresa',
                phone: lead.phone,
                address: lead.address,
                rating: lead.rating,
                reviews_count: lead.reviews_count || lead.reviews,
                website: lead.website,
                niche,
                location,
                subtype: lead.subtype || niche,
                google_maps_url: lead.google_maps_url,
                status: 'pending',
              });
            }
          }

          setCapturedLeads([...allLeads]);
        } catch (error: any) {
          addLog(`Erro: ${error.message}`);
        }

        // Small delay between searches
        await sleep(500);
      }
    }

    // Remove duplicates by phone (final pass)
    const uniqueLeads = allLeads.filter((lead, index, self) => {
      const normalizedPhone = lead.phone.replace(/\D/g, '');
      return index === self.findIndex(l => l.phone.replace(/\D/g, '') === normalizedPhone);
    });

    setCapturedLeads(uniqueLeads);
    addLog(`✅ Captura concluída: ${uniqueLeads.length} leads únicos encontrados`);
    setProcessStatus('idle');
    setProgress({ current: 0, total: 0, phase: '' });
    
    // Final summary toast with more details
    toast({
      title: uniqueLeads.length > 0 ? '✅ Captura concluída!' : '⚠️ Nenhum lead encontrado',
      description: uniqueLeads.length > 0 
        ? `${uniqueLeads.length} leads únicos capturados de ${selectedNiches.length} nichos × ${selectedLocations.length} locais.`
        : 'Tente outras combinações de nichos e locais.',
      variant: uniqueLeads.length > 0 ? 'default' : 'destructive',
    });
  };

  const analyzeAndGenerateMessages = async () => {
    if (selectedLeadIds.length === 0) {
      toast({
        title: 'Selecione leads',
        description: 'Você precisa selecionar pelo menos um lead.',
        variant: 'destructive',
      });
      return;
    }

    setProcessStatus('analyzing');
    isPausedRef.current = false;
    isStoppedRef.current = false;

    const leadsToAnalyze = capturedLeads.filter(l => selectedLeadIds.includes(l.id));
    addLog(`Analisando ${leadsToAnalyze.length} leads e gerando mensagens personalizadas...`);

    for (let i = 0; i < leadsToAnalyze.length; i++) {
      if (isStoppedRef.current) {
        addLog('Análise interrompida');
        setProcessStatus('stopped');
        return;
      }

      while (isPausedRef.current) {
        await sleep(500);
      }

      const lead = leadsToAnalyze[i];
      setProgress({ 
        current: i + 1, 
        total: leadsToAnalyze.length, 
        phase: `Analisando: ${lead.business_name}` 
      });

      try {
        addLog(`Analisando dores de ${lead.business_name} (${lead.niche})...`);

        const response = await supabase.functions.invoke('ai-prospecting', {
          body: {
            action: 'analyze_and_personalize',
            data: {
              lead: {
                business_name: lead.business_name,
                niche: lead.niche,
                location: lead.location,
                rating: lead.rating,
                reviews_count: lead.reviews_count,
                website: lead.website,
              },
              agentSettings: {
                agent_name: settings?.agent_name,
                agent_persona: settings?.agent_persona,
                services_offered: settings?.services_offered,
                communication_style: settings?.communication_style,
                emoji_usage: settings?.emoji_usage,
              },
            },
          },
        });

        if (!response.error && response.data) {
          setCapturedLeads(prev => prev.map(l => 
            l.id === lead.id 
              ? { 
                  ...l, 
                  painPoints: response.data.painPoints || [],
                  suggestedMessage: response.data.message || '',
                }
              : l
          ));
          addLog(`✓ Mensagem gerada para ${lead.business_name}`);
        }
      } catch (error: any) {
        addLog(`Erro ao analisar ${lead.business_name}: ${error.message}`);
      }

      // Small delay between AI calls
      await sleep(500);
    }

    addLog('Análise concluída! Revise as mensagens e inicie o disparo.');
    setProcessStatus('idle');
    setProgress({ current: 0, total: 0, phase: '' });
    
    toast({
      title: '🧠 Análise concluída!',
      description: `${leadsToAnalyze.length} mensagens personalizadas geradas. Revise e inicie o disparo.`,
    });
  };

  const startSending = async () => {
    const leadsToSend = capturedLeads.filter(
      l => selectedLeadIds.includes(l.id) && l.suggestedMessage && l.status === 'pending'
    );

    if (leadsToSend.length === 0) {
      toast({
        title: 'Nenhum lead para enviar',
        description: 'Analise os leads primeiro para gerar mensagens personalizadas.',
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

    setProcessStatus('sending');
    isPausedRef.current = false;
    isStoppedRef.current = false;

    addLog(`Iniciando disparo para ${leadsToSend.length} leads...`);

    for (let i = 0; i < leadsToSend.length; i++) {
      if (isStoppedRef.current) {
        addLog('Disparo interrompido pelo usuário');
        setProcessStatus('stopped');
        return;
      }

      while (isPausedRef.current) {
        setProcessStatus('paused');
        await sleep(500);
      }
      
      if (processStatus === 'paused') {
        setProcessStatus('sending');
      }

      const lead = leadsToSend[i];
      setProgress({ 
        current: i + 1, 
        total: leadsToSend.length, 
        phase: `Enviando para: ${lead.business_name}` 
      });

      // Update lead status to sending
      setCapturedLeads(prev => prev.map(l => 
        l.id === lead.id ? { ...l, status: 'sending' as const } : l
      ));

      try {
        addLog(`Enviando mensagem para ${lead.business_name}...`);

        const response = await supabase.functions.invoke('whatsapp-send', {
          body: {
            phone: lead.phone,
            message: lead.suggestedMessage,
            instance_id: settings?.whatsapp_instance_id,
          },
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        // Save lead to database
        const { data: savedLead } = await supabase.from('leads').insert([{
          user_id: user?.id,
          business_name: lead.business_name,
          phone: lead.phone,
          address: lead.address,
          niche: lead.niche,
          location: lead.location,
          rating: lead.rating,
          reviews_count: lead.reviews_count,
          website: lead.website,
          stage: 'Contato',
          temperature: 'morno',
          source: 'prospecting_capture',
          last_contact_at: new Date().toISOString(),
          pain_points: lead.painPoints,
        }]).select().single();

        if (savedLead) {
          // Save message to chat history
          await supabase.from('chat_messages').insert({
            lead_id: savedLead.id,
            sender_type: 'agent',
            content: lead.suggestedMessage,
            status: 'sent',
          });
        }

        setCapturedLeads(prev => prev.map(l => 
          l.id === lead.id ? { ...l, status: 'sent' as const } : l
        ));
        addLog(`✓ Mensagem enviada para ${lead.business_name}`);
      } catch (error: any) {
        setCapturedLeads(prev => prev.map(l => 
          l.id === lead.id ? { ...l, status: 'failed' as const } : l
        ));
        addLog(`✗ Erro ao enviar para ${lead.business_name}: ${error.message}`);
      }

      // Random delay between messages
      if (i < leadsToSend.length - 1) {
        const interval = getRandomInterval();
        addLog(`Aguardando ${Math.round(interval / 1000)}s...`);
        await sleep(interval);
      }
    }

    const sentCount = capturedLeads.filter(l => l.status === 'sent').length;
    addLog(`Disparo concluído! ${sentCount} mensagens enviadas com sucesso.`);
    setProcessStatus('completed');
    setProgress({ current: 0, total: 0, phase: '' });
    
    toast({
      title: 'Disparo concluído!',
      description: `${sentCount} mensagens enviadas com sucesso.`,
    });
  };

  const handlePause = () => {
    isPausedRef.current = true;
    setProcessStatus('paused');
    addLog('Processo pausado');
  };

  const handleResume = () => {
    isPausedRef.current = false;
    addLog('Processo retomado');
  };

  const handleStop = () => {
    isStoppedRef.current = true;
    isPausedRef.current = false;
    addLog('Parando processo...');
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const selectAllLeads = () => {
    if (selectedLeadIds.length === capturedLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(capturedLeads.map(l => l.id));
    }
  };

  const getStatusIcon = (status: CapturedLead['status']) => {
    switch (status) {
      case 'sending':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'sent':
        return <CheckCircle2 className="h-4 w-4 text-primary" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const isProcessing = ['capturing', 'analyzing', 'sending'].includes(processStatus);

  return (
    <div className="space-y-4">
      {/* Configuration */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Nichos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {NICHES.map((niche) => (
                <Badge
                  key={niche}
                  variant={selectedNiches.includes(niche) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    if (!isProcessing) {
                      setSelectedNiches(prev =>
                        prev.includes(niche)
                          ? prev.filter(n => n !== niche)
                          : [...prev, niche]
                      );
                    }
                  }}
                >
                  {niche}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Locais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((location) => (
                <Badge
                  key={location}
                  variant={selectedLocations.includes(location) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    if (!isProcessing) {
                      setSelectedLocations(prev =>
                        prev.includes(location)
                          ? prev.filter(l => l !== location)
                          : [...prev, location]
                      );
                    }
                  }}
                >
                  {location}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleCapture}
              disabled={isProcessing || selectedNiches.length === 0 || selectedLocations.length === 0}
            >
              {processStatus === 'capturing' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Capturar Leads
            </Button>

            <Button
              onClick={analyzeAndGenerateMessages}
              disabled={isProcessing || selectedLeadIds.length === 0}
              variant="secondary"
            >
              {processStatus === 'analyzing' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Analisar e Gerar Mensagens ({selectedLeadIds.length})
            </Button>

            <Button
              onClick={startSending}
              disabled={isProcessing || selectedLeadIds.length === 0}
              className="gradient-primary"
            >
              {processStatus === 'sending' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Iniciar Disparo
            </Button>

            {isProcessing && (
              <>
                {processStatus === 'paused' ? (
                  <Button onClick={handleResume} variant="outline" size="icon">
                    <Play className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handlePause} variant="outline" size="icon">
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                <Button onClick={handleStop} variant="destructive" size="icon">
                  <Square className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Progress */}
          {progress.total > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{progress.phase}</span>
                <span className="font-medium">{progress.current}/{progress.total}</span>
              </div>
              <Progress value={(progress.current / progress.total) * 100} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leads List */}
      {capturedLeads.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Leads Capturados ({capturedLeads.length})
              </CardTitle>
              <Button variant="outline" size="sm" onClick={selectAllLeads}>
                {selectedLeadIds.length === capturedLeads.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </Button>
            </div>
            <CardDescription>
              {selectedLeadIds.length} selecionados • 
              {capturedLeads.filter(l => l.status === 'sent').length} enviados •
              {capturedLeads.filter(l => l.status === 'failed').length} falharam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {capturedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      selectedLeadIds.includes(lead.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedLeadIds.includes(lead.id)}
                        onCheckedChange={() => toggleLeadSelection(lead.id)}
                        disabled={lead.status === 'sent'}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{lead.business_name}</p>
                          {getStatusIcon(lead.status)}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{lead.phone}</span>
                          {lead.rating && (
                            <>
                              <Star className="h-3 w-3 text-primary" />
                              <span>{lead.rating}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs">{lead.niche}</Badge>
                          {lead.subtype && lead.subtype !== lead.niche && (
                            <Badge variant="outline" className="text-xs bg-accent/20">{lead.subtype}</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">{lead.location}</Badge>
                          {lead.google_maps_url && (
                            <a href={lead.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                              Ver no Maps
                            </a>
                          )}
                        </div>
                        
                        {lead.painPoints && lead.painPoints.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Dores identificadas:</p>
                            <div className="flex flex-wrap gap-1">
                              {lead.painPoints.map((pain, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-accent text-accent-foreground">
                                  {pain}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {lead.suggestedMessage && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Mensagem personalizada:</p>
                            <p className="whitespace-pre-wrap">{lead.suggestedMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Logs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Log do Processo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] bg-muted/50 rounded-lg p-3">
            <div className="space-y-1 font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">Aguardando ações...</p>
              ) : (
                logs.map((log, idx) => (
                  <p key={idx} className={
                    log.includes('✓') ? 'text-emerald-600 dark:text-emerald-400' :
                    log.includes('✗') || log.includes('Erro') ? 'text-destructive' :
                    log.includes('Aguardando') ? 'text-muted-foreground' :
                    'text-foreground'
                  }>
                    {log}
                  </p>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
