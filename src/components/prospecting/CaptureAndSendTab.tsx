import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { LeadQuantitySlider } from './LeadQuantitySlider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useProspectingHistory, ProspectingHistoryLead } from '@/hooks/use-prospecting-history';
import { useMassSendJob, formatPhoneForWhatsApp } from '@/hooks/use-mass-send-job';
import { useJobLogs } from '@/hooks/use-job-logs';
import { MassSendProgress } from './MassSendProgress';
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
  Shield,
  Filter,
  ChevronDown,
  Globe,
  MessageCircle,
  ThumbsUp,
  Users,
  Zap,
  Settings2,
  Plus,
  Briefcase,
  RefreshCw,
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

interface ProspectingType {
  id: string;
  name: string;
  description: string;
  icon: string;
  settings: {
    tone: 'sutil' | 'moderado' | 'direto' | 'agressivo';
    urgency: 'baixa' | 'media' | 'alta';
    followUpIntensity: 'leve' | 'moderada' | 'intensa';
    messageStyle: string;
  };
}

const PROSPECTING_TYPES: ProspectingType[] = [
  {
    id: 'sutil',
    name: 'Prospecção Sutil',
    description: 'Abordagem suave focada em criar relacionamento antes de vender',
    icon: '🤝',
    settings: {
      tone: 'sutil',
      urgency: 'baixa',
      followUpIntensity: 'leve',
      messageStyle: 'Inicie com elogios genuínos, faça perguntas abertas, evite mencionar vendas diretamente',
    },
  },
  {
    id: 'consultivo',
    name: 'Prospecção Consultiva',
    description: 'Posiciona-se como consultor que oferece soluções para problemas específicos',
    icon: '💡',
    settings: {
      tone: 'moderado',
      urgency: 'media',
      followUpIntensity: 'moderada',
      messageStyle: 'Identifique dores do negócio, ofereça insights gratuitos, sugira uma conversa para diagnóstico',
    },
  },
  {
    id: 'direto',
    name: 'Prospecção Direta',
    description: 'Vai direto ao ponto apresentando sua proposta de valor',
    icon: '🎯',
    settings: {
      tone: 'direto',
      urgency: 'media',
      followUpIntensity: 'moderada',
      messageStyle: 'Apresente sua oferta claramente, destaque benefícios principais, inclua call-to-action direto',
    },
  },
  {
    id: 'agressiva',
    name: 'Prospecção Agressiva',
    description: 'Abordagem de alta pressão com senso de urgência e escassez',
    icon: '🔥',
    settings: {
      tone: 'agressivo',
      urgency: 'alta',
      followUpIntensity: 'intensa',
      messageStyle: 'Use gatilhos de escassez e urgência, ofereça bônus por tempo limitado, follow-up frequente',
    },
  },
  {
    id: 'educativa',
    name: 'Prospecção Educativa',
    description: 'Compartilha conteúdo de valor para estabelecer autoridade',
    icon: '📚',
    settings: {
      tone: 'sutil',
      urgency: 'baixa',
      followUpIntensity: 'leve',
      messageStyle: 'Envie dicas úteis, compartilhe cases de sucesso, eduque antes de vender',
    },
  },
  {
    id: 'social-proof',
    name: 'Prova Social',
    description: 'Foca em mostrar resultados de outros clientes do mesmo nicho',
    icon: '⭐',
    settings: {
      tone: 'moderado',
      urgency: 'media',
      followUpIntensity: 'moderada',
      messageStyle: 'Mencione clientes similares, compartilhe resultados e números, use depoimentos',
    },
  },
];

interface CaptureFilters {
  enabled: boolean;
  noWebsite: boolean;
  hasWhatsApp: boolean;
  minRating: number;
  minReviews: number;
  maxReviews: number;
  hasAddress: boolean;
  hasEmail: boolean;
}

const DEFAULT_FILTERS: CaptureFilters = {
  enabled: false,
  noWebsite: false,
  hasWhatsApp: true,
  minRating: 0,
  minReviews: 0,
  maxReviews: 10000,
  hasAddress: false,
  hasEmail: false,
};

interface CapturedLead {
  id: string;
  business_name: string;
  phone: string;
  address?: string;
  rating?: number;
  reviews_count?: number;
  website?: string;
  email?: string;
  niche: string;
  location: string;
  painPoints?: string[];
  suggestedMessage?: string;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'duplicate';
  subtype?: string;
  google_maps_url?: string;
  qualityScore?: number;
  isDuplicate?: boolean;
}

type ProcessStatus = 'idle' | 'capturing' | 'analyzing' | 'sending' | 'paused' | 'completed' | 'stopped';

interface CaptureAndSendTabProps {
  prefilledNiches?: string[];
  prefilledLocations?: string[];
  onPrefilledConsumed?: () => void;
}

export function CaptureAndSendTab({ 
  prefilledNiches = [], 
  prefilledLocations = [],
  onPrefilledConsumed 
}: CaptureAndSendTabProps) {
  const { settings } = useUserSettings();
  const { createSession, updateSession } = useProspectingHistory();
  const { activeJob, createJob, isCreating } = useMassSendJob();
  const { recentLogs: dbLogs, formatLog, getLogColorClass, refetch: refetchLogs } = useJobLogs(activeJob?.id);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedProspectingType, setSelectedProspectingType] = useState<ProspectingType>(PROSPECTING_TYPES[1]); // Default: Consultivo
  const [capturedLeads, setCapturedLeads] = useState<CapturedLead[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [processStatus, setProcessStatus] = useState<ProcessStatus>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0, phase: '' });
  const [localLogs, setLocalLogs] = useState<string[]>([]);
  const [filters, setFilters] = useState<CaptureFilters>(DEFAULT_FILTERS);
  const [maxLeadsToCapture, setMaxLeadsToCapture] = useState(300);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentHistorySessionId, setCurrentHistorySessionId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>('all');
  const [useDirectAI, setUseDirectAI] = useState(true); // Default to direct AI mode
  
  const isPausedRef = useRef(false);
  const isStoppedRef = useRef(false);

  // Handle prefilled data from history reprospectar
  useEffect(() => {
    if (prefilledNiches.length > 0 || prefilledLocations.length > 0) {
      if (prefilledNiches.length > 0) {
        setSelectedNiches(prefilledNiches);
      }
      if (prefilledLocations.length > 0) {
        setSelectedLocations(prefilledLocations);
      }
      onPrefilledConsumed?.();
      toast({
        title: '✓ Dados carregados do histórico',
        description: `${prefilledNiches.length} nicho(s) e ${prefilledLocations.length} local(is) prontos para captura.`,
      });
    }
  }, [prefilledNiches, prefilledLocations, onPrefilledConsumed, toast]);

  // Monitor background job completion to update history
  useEffect(() => {
    if (activeJob?.status === 'completed' && currentHistorySessionId) {
      // Update history session with final results from background job
      const payload = activeJob.payload as any;
      const leads = payload?.leads || [];
      const sentCount = leads.filter((l: any) => l.status === 'sent').length;
      const failedCount = leads.filter((l: any) => l.status === 'failed').length;
      
      updateSession({
        id: currentHistorySessionId,
        status: 'completed',
        total_sent: sentCount,
        total_errors: failedCount,
        completed_at: new Date().toISOString(),
      }).catch(console.error);
      
      setCurrentHistorySessionId(null);
    }
  }, [activeJob?.status, activeJob?.payload, currentHistorySessionId, updateSession]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLocalLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]);
  };

  // Filter leads based on capture filters
  const applyFilters = (lead: CapturedLead): boolean => {
    if (!filters.enabled) return true;

    // No website filter
    if (filters.noWebsite && lead.website) return false;

    // Has WhatsApp (phone starting with country code or specific patterns)
    if (filters.hasWhatsApp) {
      const phone = lead.phone?.replace(/\D/g, '') || '';
      // Brazilian WhatsApp numbers typically start with 55 and have 12-13 digits
      // Or are mobile numbers starting with 9
      const isMobile = phone.length >= 10 && (phone.startsWith('55') || /^[1-9][1-9]9/.test(phone));
      if (!isMobile) return false;
    }

    // Minimum rating filter
    if (filters.minRating > 0 && (lead.rating || 0) < filters.minRating) return false;

    // Minimum reviews filter
    if (filters.minReviews > 0 && (lead.reviews_count || 0) < filters.minReviews) return false;

    // Maximum reviews filter (to target smaller businesses)
    if (filters.maxReviews < 10000 && (lead.reviews_count || 0) > filters.maxReviews) return false;

    // Has address filter
    if (filters.hasAddress && !lead.address) return false;

    // Has email filter
    if (filters.hasEmail && !lead.email) return false;

    return true;
  };

  const getActiveFiltersCount = () => {
    if (!filters.enabled) return 0;
    let count = 0;
    if (filters.noWebsite) count++;
    if (filters.hasWhatsApp) count++;
    if (filters.minRating > 0) count++;
    if (filters.minReviews > 0) count++;
    if (filters.maxReviews < 10000) count++;
    if (filters.hasAddress) count++;
    if (filters.hasEmail) count++;
    return count;
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Advanced interval calculation with human-like randomization
  const getRandomInterval = () => {
    const baseInterval = (settings?.message_interval_seconds || 60) * 1000;
    // More variance: 50% to 200% of base interval
    const minInterval = baseInterval * 0.5;
    const maxInterval = baseInterval * 2;
    const randomInterval = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
    
    // Add "natural" micro-pauses (human typing behavior)
    const typingDelay = Math.floor(Math.random() * 3000) + 1000; // 1-4s typing simulation
    
    return randomInterval + typingDelay;
  };

  // Check if current time is within operating hours
  const isWithinOperatingHours = () => {
    // If operate_all_day is enabled, always return true
    if (settings?.operate_all_day) {
      return true;
    }
    
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const startHour = settings?.auto_start_hour ?? 9;
    const endHour = settings?.auto_end_hour ?? 18;
    
    // Check if weekend (0 = Sunday, 6 = Saturday) - only if work_days_only is enabled
    const isWeekend = day === 0 || day === 6;
    const workDaysOnly = settings?.work_days_only ?? true;
    
    if (workDaysOnly && isWeekend) {
      addLog('⚠️ Fim de semana detectado - pausando envios');
      return false;
    }
    
    // Check if within hours
    if (hour < startHour || hour >= endHour) {
      addLog(`⚠️ Fora do horário de operação (${startHour}h-${endHour}h)`);
      return false;
    }
    
    return true;
  };

  // Check daily limit
  const checkDailyLimit = (sentToday: number) => {
    const dailyLimit = settings?.daily_message_limit || 30;
    if (sentToday >= dailyLimit) {
      addLog(`🛑 Limite diário atingido (${dailyLimit} mensagens)`);
      return false;
    }
    return true;
  };

  // Shuffle array for random order (anti-pattern detection)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Calculate quality score for a lead (0-100)
  const calculateQualityScore = (lead: CapturedLead): number => {
    let score = 50; // Base score

    // Rating bonus (0-20 points)
    if (lead.rating) {
      if (lead.rating >= 4.5) score += 20;
      else if (lead.rating >= 4.0) score += 15;
      else if (lead.rating >= 3.5) score += 10;
      else if (lead.rating >= 3.0) score += 5;
    }

    // Reviews bonus (0-15 points)
    if (lead.reviews_count) {
      if (lead.reviews_count >= 100) score += 15;
      else if (lead.reviews_count >= 50) score += 12;
      else if (lead.reviews_count >= 20) score += 8;
      else if (lead.reviews_count >= 5) score += 4;
    }

    // No website = potential client (+10 points)
    if (!lead.website) score += 10;

    // Has address (+5 points)
    if (lead.address) score += 5;

    // Has email (+5 points)
    if (lead.email) score += 5;

    // WhatsApp ready phone (+5 points)
    const phone = lead.phone?.replace(/\D/g, '') || '';
    const isMobile = phone.length >= 10 && (phone.startsWith('55') || /^[1-9][1-9]9/.test(phone));
    if (isMobile) score += 5;

    return Math.min(100, Math.max(0, score));
  };

  // Check for duplicates in database
  const checkDuplicatesInDatabase = async (leads: CapturedLead[]): Promise<CapturedLead[]> => {
    if (!user?.id || leads.length === 0) return leads;

    try {
      // Get all existing phone numbers from database
      const { data: existingLeads } = await supabase
        .from('leads')
        .select('phone')
        .eq('user_id', user.id);

      if (!existingLeads || existingLeads.length === 0) return leads;

      const existingPhones = new Set(
        existingLeads.map(l => l.phone.replace(/\D/g, ''))
      );

      // Mark duplicates
      return leads.map(lead => {
        const normalizedPhone = lead.phone.replace(/\D/g, '');
        const isDuplicate = existingPhones.has(normalizedPhone);
        return {
          ...lead,
          isDuplicate,
          status: isDuplicate ? 'duplicate' as const : lead.status,
        };
      });
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return leads;
    }
  };

  // Poll for background job completion
  const pollJobCompletion = async (jobId: string): Promise<{ leads: any[]; error?: string }> => {
    const maxAttempts = 60; // 2 minutes max
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const { data, error } = await supabase.functions.invoke('ai-prospecting', {
          body: {
            action: 'check_job_status',
            data: { job_id: jobId },
          },
        });

        if (error) {
          console.error('Error checking job status:', error);
          return { leads: [], error: error.message };
        }

        const jobStatus = data?.status;
        const processed = data?.processed_items || 0;
        
        if (jobStatus === 'completed') {
          addLog(`✅ Job concluído: ${processed} leads encontrados`);
          return { leads: data?.result?.leads || [] };
        }
        
        if (jobStatus === 'failed') {
          addLog(`❌ Job falhou: ${data?.error_message}`);
          return { leads: [], error: data?.error_message || 'Job failed' };
        }

        // Still processing - wait and check again
        addLog(`⏳ Processando... (${processed} leads encontrados até agora)`);
        await sleep(2000);
        attempts++;
      } catch (err: any) {
        console.error('Poll error:', err);
        attempts++;
        await sleep(2000);
      }
    }

    return { leads: [], error: 'Job timed out' };
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

    // Create history session
    let historySessionId: string | null = null;
    try {
      const session = await createSession({
        session_type: 'capture',
        niche: selectedNiches.join(', '),
        location: selectedLocations.join(', '),
      });
      historySessionId = session?.id || null;
      setCurrentHistorySessionId(historySessionId);
    } catch (error) {
      console.error('Error creating history session:', error);
    }

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
          // Call our edge function to search with configured limit
          const response = await supabase.functions.invoke('ai-prospecting', {
            body: {
              action: 'search_leads',
              data: { niche, location, maxResults: maxLeadsToCapture },
            },
          });

          if (response.error) {
            addLog(`Erro ao buscar: ${response.error.message}`);
            continue;
          }

          const responseData = response.data || {};
          let leads: any[] = [];
          
          // Check if it's a background job
          if (responseData.job_id) {
            addLog(`🔄 Busca em segundo plano iniciada...`);
            const jobResult = await pollJobCompletion(responseData.job_id);
            
            if (jobResult.error) {
              addLog(`Erro no job: ${jobResult.error}`);
              continue;
            }
            
            leads = jobResult.leads || [];
          } else {
            // Synchronous response
            leads = responseData.leads || [];
          }
          
          const searchTermsUsed = responseData.searchTermsUsed || [];
          
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

    // Apply capture filters
    const filteredLeads = uniqueLeads.filter(applyFilters);
    const filteredCount = uniqueLeads.length - filteredLeads.length;

    // Check for duplicates in database and calculate quality scores
    addLog('🔍 Verificando duplicatas no banco de dados...');
    const leadsWithDuplicateCheck = await checkDuplicatesInDatabase(filteredLeads);
    
    // Calculate quality scores
    const leadsWithScores = leadsWithDuplicateCheck.map(lead => ({
      ...lead,
      qualityScore: calculateQualityScore(lead),
    }));

    // Sort by quality score (highest first), duplicates last
    const sortedLeads = leadsWithScores.sort((a, b) => {
      if (a.isDuplicate && !b.isDuplicate) return 1;
      if (!a.isDuplicate && b.isDuplicate) return -1;
      return (b.qualityScore || 0) - (a.qualityScore || 0);
    });

    const duplicateCount = sortedLeads.filter(l => l.isDuplicate).length;
    const newLeads = sortedLeads.filter(l => !l.isDuplicate);
    const newLeadsCount = newLeads.length;
    
    setCapturedLeads(sortedLeads);
    
    if (filters.enabled && filteredCount > 0) {
      addLog(`🔍 Filtros aplicados: ${filteredCount} leads removidos, ${sortedLeads.length} passaram nos filtros`);
    }
    
    if (duplicateCount > 0) {
      addLog(`⚠️ ${duplicateCount} leads já existem no banco (marcados como duplicados)`);
    }

    // Save new leads to database immediately so they appear in MassSendTab
    let savedCount = 0;
    if (newLeadsCount > 0 && user?.id) {
      addLog(`💾 Salvando ${newLeadsCount} leads novos no banco de dados...`);
      
      try {
        const leadsToSave = newLeads.map(lead => ({
          user_id: user.id,
          business_name: lead.business_name,
          phone: lead.phone,
          address: lead.address || null,
          niche: lead.niche,
          location: lead.location,
          rating: lead.rating || null,
          reviews_count: lead.reviews_count || null,
          website: lead.website || null,
          google_maps_url: lead.google_maps_url || null,
          stage: 'Novo',
          temperature: 'frio',
          source: 'prospecting_capture',
          quality_score: lead.qualityScore || null,
        }));

        const { data: savedLeads, error: saveError } = await supabase
          .from('leads')
          .insert(leadsToSave)
          .select();

        if (saveError) {
          console.error('Error saving leads:', saveError);
          addLog(`❌ Erro ao salvar leads: ${saveError.message}`);
        } else {
          savedCount = savedLeads?.length || 0;
          addLog(`✅ ${savedCount} leads salvos no banco de dados`);
        }
      } catch (error: any) {
        console.error('Error saving leads:', error);
        addLog(`❌ Erro ao salvar leads: ${error.message}`);
      }
    }
    
    addLog(`✅ Captura concluída: ${newLeadsCount} leads novos + ${duplicateCount} duplicados`);
    addLog(`📊 Scores de qualidade calculados (média: ${Math.round(sortedLeads.reduce((sum, l) => sum + (l.qualityScore || 0), 0) / sortedLeads.length || 0)})`);
    
    if (savedCount > 0) {
      addLog(`💡 Leads disponíveis na aba "Disparo" para envio em massa`);
    }
    
    setProcessStatus('idle');
    setProgress({ current: 0, total: 0, phase: '' });

    // Update history session with final data
    if (historySessionId) {
      try {
        const leadsForHistory: ProspectingHistoryLead[] = sortedLeads.map(l => ({
          id: l.id,
          business_name: l.business_name,
          phone: l.phone,
          status: l.isDuplicate ? 'duplicate' : 'pending',
        }));

        await updateSession({
          id: historySessionId,
          status: 'completed',
          total_found: sortedLeads.length,
          total_saved: savedCount,
          total_duplicates: duplicateCount,
          total_pending: savedCount,
          leads_data: leadsForHistory,
          completed_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error updating history session:', error);
      }
    }
    
    // Final summary toast with more details
    const filterInfo = filters.enabled && filteredCount > 0 
      ? ` (${filteredCount} removidos por filtros)`
      : '';
    const duplicateInfo = duplicateCount > 0 
      ? `, ${duplicateCount} já existentes`
      : '';
    
    toast({
      title: newLeadsCount > 0 ? '✅ Captura concluída!' : duplicateCount > 0 ? '⚠️ Apenas duplicados encontrados' : '⚠️ Nenhum lead encontrado',
      description: newLeadsCount > 0 
        ? `${savedCount} leads salvos no banco! Disponíveis na aba "Disparo".${duplicateInfo}${filterInfo}`
        : duplicateCount > 0 
          ? 'Todos os leads encontrados já existem no seu banco de dados.'
          : 'Tente outras combinações de nichos e locais ou ajuste os filtros.',
      variant: newLeadsCount > 0 ? 'default' : 'destructive',
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
    addLog(`Analisando ${leadsToAnalyze.length} leads com abordagem "${selectedProspectingType.name}"...`);

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
        addLog(`${selectedProspectingType.icon} Gerando mensagem ${selectedProspectingType.name.toLowerCase()} para ${lead.business_name}...`);

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
                services_offered: selectedService !== 'all' 
                  ? [AVAILABLE_SERVICES.find(s => s.id === selectedService)?.label]
                  : settings?.services_offered,
                communication_style: settings?.communication_style,
                emoji_usage: settings?.emoji_usage,
                specific_service: selectedService !== 'all' 
                  ? AVAILABLE_SERVICES.find(s => s.id === selectedService)?.label 
                  : null,
              },
              prospectingType: {
                id: selectedProspectingType.id,
                name: selectedProspectingType.name,
                tone: selectedProspectingType.settings.tone,
                urgency: selectedProspectingType.settings.urgency,
                messageStyle: selectedProspectingType.settings.messageStyle,
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
    // In Direct AI mode, we don't require suggestedMessage - messages will be generated on the fly
    const leadsToProcess = useDirectAI
      ? capturedLeads.filter(l => selectedLeadIds.includes(l.id) && l.status === 'pending' && !l.isDuplicate)
      : capturedLeads.filter(l => selectedLeadIds.includes(l.id) && l.suggestedMessage && l.status === 'pending');

    if (leadsToProcess.length === 0) {
      toast({
        title: 'Nenhum lead para enviar',
        description: useDirectAI 
          ? 'Selecione pelo menos um lead para enviar.'
          : 'Analise os leads primeiro para gerar mensagens personalizadas.',
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

    // Check if there's already an active job
    if (activeJob && ['pending', 'running', 'paused'].includes(activeJob.status)) {
      toast({
        title: 'Disparo em andamento',
        description: 'Aguarde o disparo atual terminar ou cancele-o antes de iniciar outro.',
        variant: 'destructive',
      });
      return;
    }

    // Check if within operating hours (only if operate_all_day is disabled)
    if (!isWithinOperatingHours()) {
      const workDaysText = settings?.work_days_only ? ' em dias úteis' : '';
      toast({
        title: '⚠️ Fora do horário de operação',
        description: `Envios permitidos entre ${settings?.auto_start_hour ?? 9}h e ${settings?.auto_end_hour ?? 18}h${workDaysText}. Ative "Operação 24h" nas configurações para ignorar.`,
        variant: 'destructive',
      });
      return;
    }

    // Get the specific service to offer
    const serviceToOffer = selectedService !== 'all' 
      ? AVAILABLE_SERVICES.find(s => s.id === selectedService)?.label 
      : null;

    addLog(`🚀 Criando disparo em segundo plano para ${leadsToProcess.length} leads...`);
    addLog(`💡 O disparo continuará mesmo se você fechar a página.`);

    // Create a background job for persistent sending
    try {
      // Format leads for the job with all necessary data
      const formattedLeads = leadsToProcess.map(lead => ({
        id: lead.id,
        business_name: lead.business_name,
        phone: formatPhoneForWhatsApp(lead.phone),
        niche: lead.niche,
        location: lead.location,
        rating: lead.rating,
        reviews_count: lead.reviews_count,
        suggestedMessage: lead.suggestedMessage,
        status: 'pending' as const,
      }));

      // Create job using the hook (which handles persistence)
      createJob({
        leads: formattedLeads,
        messageTemplate: leadsToProcess[0]?.suggestedMessage,
        useAIPersonalization: !useDirectAI && !!leadsToProcess[0]?.suggestedMessage,
        directAIMode: useDirectAI,
        agentSettings: {
          agent_name: settings?.agent_name,
          agent_persona: settings?.agent_persona,
          communication_style: settings?.communication_style,
          emoji_usage: settings?.emoji_usage,
          services_offered: serviceToOffer ? [serviceToOffer] : settings?.services_offered,
          knowledge_base: settings?.knowledge_base,
          message_interval_seconds: settings?.message_interval_seconds,
          specific_service: serviceToOffer,
        },
        prospectingType: selectedProspectingType.id,
        serviceToOffer: serviceToOffer || undefined,
      });

      // Update local state to reflect that leads are being processed
      setCapturedLeads(prev => prev.map(l => 
        selectedLeadIds.includes(l.id) && l.status === 'pending' && !l.isDuplicate
          ? { ...l, status: 'sending' as const }
          : l
      ));

      // Clear selection
      setSelectedLeadIds([]);
      setProcessStatus('idle');
      
    } catch (error: any) {
      addLog(`❌ Erro ao criar disparo: ${error.message}`);
      toast({
        title: 'Erro ao iniciar disparo',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Legacy local sending function (kept for reference but not used)
  const startSendingLocal = async () => {
    const leadsToProcess = useDirectAI
      ? capturedLeads.filter(l => selectedLeadIds.includes(l.id) && l.status === 'pending' && !l.isDuplicate)
      : capturedLeads.filter(l => selectedLeadIds.includes(l.id) && l.suggestedMessage && l.status === 'pending');
    
    const dailyLimit = settings?.daily_message_limit || 30;

    setProcessStatus('sending');
    isPausedRef.current = false;
    isStoppedRef.current = false;

    // Shuffle leads for random order (anti-pattern detection)
    const leadsToSend = shuffleArray(leadsToProcess);
    
    addLog(`🚀 Iniciando disparo local para ${leadsToSend.length} leads...`);
    addLog(`📊 Limite diário: ${dailyLimit} | Intervalo base: ${settings?.message_interval_seconds || 60}s`);

    // Get the specific service to offer
    const serviceToOffer = selectedService !== 'all' 
      ? AVAILABLE_SERVICES.find(s => s.id === selectedService)?.label 
      : null;

    let sentToday = 0;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;
    const batchSize = 10;
    let batchCount = 0;

    for (let i = 0; i < leadsToSend.length; i++) {
      // Check daily limit
      if (!checkDailyLimit(sentToday)) {
        toast({
          title: '🛑 Limite diário atingido',
          description: `Você atingiu o limite de ${dailyLimit} mensagens por dia.`,
        });
        setProcessStatus('stopped');
        return;
      }

      // Check operating hours periodically
      if (i > 0 && i % 5 === 0 && !isWithinOperatingHours()) {
        toast({
          title: '⏰ Fora do horário de operação',
          description: 'O disparo será pausado até o próximo horário permitido.',
        });
        setProcessStatus('paused');
        return;
      }

      if (isStoppedRef.current) {
        addLog('🛑 Disparo interrompido pelo usuário');
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
        phase: `📤 Enviando para: ${lead.business_name}` 
      });

      // Update lead status to sending
      setCapturedLeads(prev => prev.map(l => 
        l.id === lead.id ? { ...l, status: 'sending' as const } : l
      ));

      try {
        let messageToSend = lead.suggestedMessage || '';

        // In Direct AI mode, generate message on the fly if not already generated
        if (useDirectAI && !lead.suggestedMessage) {
          addLog(`🤖 Gerando mensagem com IA para ${lead.business_name}...`);
          
          const aiResponse = await supabase.functions.invoke('ai-prospecting', {
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

          if (aiResponse.error) {
            throw new Error(`Erro ao gerar mensagem: ${aiResponse.error.message}`);
          }
          
          messageToSend = aiResponse.data?.message || '';
          
          if (!messageToSend) {
            throw new Error('IA não conseguiu gerar mensagem');
          }
        }

        // Simulate typing delay (human behavior)
        const typingDelay = Math.floor(Math.random() * 2000) + 1000;
        addLog(`⌨️ Simulando digitação para ${lead.business_name}... (${(typingDelay / 1000).toFixed(1)}s)`);
        await sleep(typingDelay);

        addLog(`📤 Enviando mensagem para ${lead.business_name}...`);

        const response = await supabase.functions.invoke('whatsapp-send', {
          body: {
            phone: lead.phone,
            message: messageToSend,
            instance_id: settings?.whatsapp_instance_id,
          },
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        // Update existing lead in database (already saved during capture) or find it by phone
        const { data: existingLead } = await supabase
          .from('leads')
          .select('id')
          .eq('user_id', user?.id)
          .eq('phone', lead.phone.replace(/\D/g, ''))
          .maybeSingle();

        if (existingLead) {
          // Update existing lead
          await supabase
            .from('leads')
            .update({
              stage: 'Contato',
              temperature: 'morno',
              last_contact_at: new Date().toISOString(),
              pain_points: lead.painPoints,
            })
            .eq('id', existingLead.id);

          // Save message to chat history
          await supabase.from('chat_messages').insert({
            lead_id: existingLead.id,
            sender_type: 'agent',
            content: messageToSend,
            status: 'sent',
          });
        } else {
          // Lead not found, save it now
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
              content: messageToSend,
              status: 'sent',
            });
          }
        }

        setCapturedLeads(prev => prev.map(l => 
          l.id === lead.id ? { ...l, status: 'sent' as const, suggestedMessage: messageToSend } : l
        ));
        addLog(`✅ Mensagem enviada para ${lead.business_name}`);
        
        sentToday++;
        consecutiveErrors = 0; // Reset error counter on success
        batchCount++;

      } catch (error: any) {
        setCapturedLeads(prev => prev.map(l => 
          l.id === lead.id ? { ...l, status: 'failed' as const } : l
        ));
        addLog(`❌ Erro ao enviar para ${lead.business_name}: ${error.message}`);
        
        consecutiveErrors++;
        
        // Auto-pause on consecutive errors (safety measure)
        if (consecutiveErrors >= maxConsecutiveErrors) {
          addLog(`⚠️ ${maxConsecutiveErrors} erros consecutivos detectados - pausando por segurança...`);
          toast({
            title: '⚠️ Erros consecutivos detectados',
            description: 'O sistema pausou automaticamente para evitar problemas. Verifique sua conexão.',
            variant: 'destructive',
          });
          
          // Wait 5 minutes before continuing
          addLog('⏳ Aguardando 5 minutos antes de continuar...');
          await sleep(5 * 60 * 1000);
          consecutiveErrors = 0;
        }
      }

      // Random delay between messages (human-like)
      if (i < leadsToSend.length - 1) {
        // Batch cooldown: longer pause after every batchSize messages
        if (batchCount >= batchSize) {
          const cooldownMinutes = Math.floor(Math.random() * 10) + 10; // 10-20 min cooldown
          addLog(`☕ Pausa de cooldown: ${cooldownMinutes} minutos após ${batchSize} mensagens...`);
          await sleep(cooldownMinutes * 60 * 1000);
          batchCount = 0;
        } else {
          const interval = getRandomInterval();
          const minutes = Math.floor(interval / 60000);
          const seconds = Math.round((interval % 60000) / 1000);
          addLog(`⏳ Aguardando ${minutes}m ${seconds}s antes da próxima mensagem...`);
          await sleep(interval);
        }
      }
    }

    const sentCount = capturedLeads.filter(l => l.status === 'sent').length;
    const failedCount = capturedLeads.filter(l => l.status === 'failed').length;
    
    addLog(`🎉 Disparo concluído! ${sentCount} enviadas, ${failedCount} falharam.`);
    setProcessStatus('completed');
    setProgress({ current: 0, total: 0, phase: '' });

    // Update history session with send results
    if (currentHistorySessionId) {
      try {
        const leadsForHistory: ProspectingHistoryLead[] = capturedLeads.map(l => ({
          id: l.id,
          business_name: l.business_name,
          phone: l.phone,
          status: l.status === 'sent' ? 'sent' : l.status === 'failed' ? 'error' : l.isDuplicate ? 'duplicate' : 'pending',
          error_message: l.status === 'failed' ? 'Falha no envio' : undefined,
        }));

        await updateSession({
          id: currentHistorySessionId,
          status: 'completed',
          total_sent: sentCount,
          total_errors: failedCount,
          total_pending: capturedLeads.filter(l => l.status === 'pending').length,
          leads_data: leadsForHistory,
          completed_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error updating history session:', error);
      }
    }
    
    toast({
      title: '🎉 Disparo concluído!',
      description: `${sentCount} mensagens enviadas com sucesso, ${failedCount} falharam.`,
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
    // Get only selectable leads (not sent, not duplicates)
    const selectableLeads = capturedLeads.filter(l => l.status !== 'sent' && !l.isDuplicate);
    const allSelectableIds = selectableLeads.map(l => l.id);
    
    // Check if all selectable leads are already selected
    const allSelected = allSelectableIds.every(id => selectedLeadIds.includes(id));
    
    if (allSelected) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(allSelectableIds);
    }
  };

  const selectAllNewLeads = () => {
    // Select only new leads (not duplicates, not sent)
    const newLeads = capturedLeads.filter(l => !l.isDuplicate && l.status !== 'sent');
    setSelectedLeadIds(newLeads.map(l => l.id));
  };

  const getStatusIcon = (status: CapturedLead['status']) => {
    switch (status) {
      case 'sending':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'sent':
        return <CheckCircle2 className="h-4 w-4 text-primary" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'duplicate':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Get quality score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excelente', variant: 'default' as const };
    if (score >= 60) return { label: 'Bom', variant: 'secondary' as const };
    if (score >= 40) return { label: 'Regular', variant: 'outline' as const };
    return { label: 'Baixo', variant: 'outline' as const };
  };

  const isProcessing = ['capturing', 'analyzing', 'sending'].includes(processStatus);

  // Calculate safety status for display
  const getSafetyStatus = () => {
    const dailyLimit = settings?.daily_message_limit || 30;
    const interval = settings?.message_interval_seconds || 60;
    
    if (dailyLimit <= 30 && interval >= 60) {
      return { level: 'safe', label: '✓ Seguro', color: 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400' };
    } else if (dailyLimit <= 50 && interval >= 45) {
      return { level: 'moderate', label: '⚠ Moderado', color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400' };
    } else {
      return { level: 'risky', label: '🚨 Arriscado', color: 'bg-destructive/10 border-destructive/30 text-destructive' };
    }
  };

  const safetyStatus = getSafetyStatus();

  return (
    <div className="space-y-4">
      {/* Active Background Job Progress */}
      <MassSendProgress />

      {/* Safety Status Banner */}
      <div className={`p-3 rounded-lg border flex items-center justify-between ${safetyStatus.color}`}>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <span className="font-medium">Status Anti-Bloqueio: {safetyStatus.label}</span>
        </div>
        <div className="text-sm">
          {settings?.daily_message_limit || 30} msgs/dia • {settings?.message_interval_seconds || 60}s intervalo • 
          {settings?.auto_start_hour || 9}h-{settings?.auto_end_hour || 18}h
        </div>
      </div>

      {/* Prospecting Type Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Tipo de Prospecção
          </CardTitle>
          <CardDescription>
            Escolha a abordagem que será usada na geração das mensagens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROSPECTING_TYPES.map((type) => (
              <div
                key={type.id}
                onClick={() => !isProcessing && setSelectedProspectingType(type)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedProspectingType.id === type.id
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/30'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{type.icon}</span>
                  <span className="font-medium">{type.name}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {type.description}
                </p>
                {selectedProspectingType.id === type.id && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {type.settings.tone}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        urgência: {type.settings.urgency}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Nichos
            </CardTitle>
            <CardDescription>Selecione ou digite nichos personalizados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Custom input */}
            <div className="flex gap-2">
              <Input
                placeholder="Digite um nicho personalizado..."
                disabled={isProcessing}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value && !selectedNiches.includes(value)) {
                      setSelectedNiches(prev => [...prev, value]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={(e) => {
                  const input = (e.currentTarget.previousSibling as HTMLInputElement);
                  const value = input.value.trim();
                  if (value && !selectedNiches.includes(value)) {
                    setSelectedNiches(prev => [...prev, value]);
                    input.value = '';
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected niches */}
            {selectedNiches.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-muted/50">
                {selectedNiches.map((niche) => (
                  <Badge
                    key={niche}
                    variant="default"
                    className="cursor-pointer gap-1"
                    onClick={() => {
                      if (!isProcessing) {
                        setSelectedNiches(prev => prev.filter(n => n !== niche));
                      }
                    }}
                  >
                    {niche}
                    <XCircle className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}

            {/* Suggestions */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span className="text-muted-foreground text-xs">Sugestões populares</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-wrap gap-1 mt-2">
                  {NICHES.filter(n => !selectedNiches.includes(n)).map((niche) => (
                    <Badge
                      key={niche}
                      variant="outline"
                      className="cursor-pointer text-xs"
                      onClick={() => {
                        if (!isProcessing) {
                          setSelectedNiches(prev => [...prev, niche]);
                        }
                      }}
                    >
                      + {niche}
                    </Badge>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Locais
            </CardTitle>
            <CardDescription>Selecione ou digite locais personalizados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Custom input */}
            <div className="flex gap-2">
              <Input
                placeholder="Digite uma cidade ou região..."
                disabled={isProcessing}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value && !selectedLocations.includes(value)) {
                      setSelectedLocations(prev => [...prev, value]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={(e) => {
                  const input = (e.currentTarget.previousSibling as HTMLInputElement);
                  const value = input.value.trim();
                  if (value && !selectedLocations.includes(value)) {
                    setSelectedLocations(prev => [...prev, value]);
                    input.value = '';
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected locations */}
            {selectedLocations.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-muted/50">
                {selectedLocations.map((location) => (
                  <Badge
                    key={location}
                    variant="default"
                    className="cursor-pointer gap-1"
                    onClick={() => {
                      if (!isProcessing) {
                        setSelectedLocations(prev => prev.filter(l => l !== location));
                      }
                    }}
                  >
                    {location}
                    <XCircle className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}

            {/* Suggestions */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span className="text-muted-foreground text-xs">Cidades populares</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-wrap gap-1 mt-2">
                  {LOCATIONS.filter(l => !selectedLocations.includes(l)).map((location) => (
                    <Badge
                      key={location}
                      variant="outline"
                      className="cursor-pointer text-xs"
                      onClick={() => {
                        if (!isProcessing) {
                          setSelectedLocations(prev => [...prev, location]);
                        }
                      }}
                    >
                      + {location}
                    </Badge>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>

      {/* Capture Filters */}
      <Card>
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros de Captura
                  {getActiveFiltersCount() > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {getActiveFiltersCount()} ativos
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="filters-enabled" className="text-sm text-muted-foreground">
                      {filters.enabled ? 'Ativado' : 'Desativado'}
                    </Label>
                    <Switch
                      id="filters-enabled"
                      checked={filters.enabled}
                      onCheckedChange={(checked) => {
                        setFilters(prev => ({ ...prev, enabled: checked }));
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
              <CardDescription>
                {filters.enabled 
                  ? 'Filtre os leads capturados para focar em empresas com maior potencial'
                  : 'Clique para configurar filtros avançados de captura'
                }
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0">
              {/* Service Filter - Always visible */}
              <div className="mb-6 p-4 rounded-lg border bg-muted/30">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <Label className="font-medium">Serviço a Oferecer</Label>
                  </div>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="bg-background">
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
                    <Badge variant="default" className="text-xs">
                      <Briefcase className="h-3 w-3 mr-1" />
                      Focado em: {AVAILABLE_SERVICES.find(s => s.id === selectedService)?.label}
                    </Badge>
                  )}
                  <p className="text-xs text-muted-foreground">
                    A IA focará as mensagens neste serviço específico durante a prospecção
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Website Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium">Website</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="no-website"
                      checked={filters.noWebsite}
                      onCheckedChange={(checked) => 
                        setFilters(prev => ({ ...prev, noWebsite: !!checked }))
                      }
                      disabled={!filters.enabled}
                    />
                    <Label 
                      htmlFor="no-website" 
                      className={`text-sm ${!filters.enabled ? 'text-muted-foreground' : ''}`}
                    >
                      Apenas empresas SEM site
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Empresas sem site têm mais chances de precisar dos seus serviços
                  </p>
                </div>

                {/* WhatsApp Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium">WhatsApp</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has-whatsapp"
                      checked={filters.hasWhatsApp}
                      onCheckedChange={(checked) => 
                        setFilters(prev => ({ ...prev, hasWhatsApp: !!checked }))
                      }
                      disabled={!filters.enabled}
                    />
                    <Label 
                      htmlFor="has-whatsapp" 
                      className={`text-sm ${!filters.enabled ? 'text-muted-foreground' : ''}`}
                    >
                      Apenas números de celular (WhatsApp)
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Filtra números fixos, mantendo apenas celulares válidos para WhatsApp
                  </p>
                </div>

                {/* Address Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium">Endereço</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has-address"
                      checked={filters.hasAddress}
                      onCheckedChange={(checked) => 
                        setFilters(prev => ({ ...prev, hasAddress: !!checked }))
                      }
                      disabled={!filters.enabled}
                    />
                    <Label 
                      htmlFor="has-address" 
                      className={`text-sm ${!filters.enabled ? 'text-muted-foreground' : ''}`}
                    >
                      Apenas com endereço completo
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Empresas com endereço são mais estabelecidas e confiáveis
                  </p>
                </div>

                {/* Rating Filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-medium">Avaliação Mínima</Label>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {filters.minRating > 0 ? `${filters.minRating}+ ⭐` : 'Qualquer'}
                    </Badge>
                  </div>
                  <Slider
                    value={[filters.minRating]}
                    onValueChange={([value]) => 
                      setFilters(prev => ({ ...prev, minRating: value }))
                    }
                    max={5}
                    step={0.5}
                    disabled={!filters.enabled}
                    className="py-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Empresas bem avaliadas costumam ser mais profissionais
                  </p>
                </div>

                {/* Min Reviews Filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-medium">Mínimo de Avaliações</Label>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {filters.minReviews > 0 ? `${filters.minReviews}+` : 'Qualquer'}
                    </Badge>
                  </div>
                  <Slider
                    value={[filters.minReviews]}
                    onValueChange={([value]) => 
                      setFilters(prev => ({ ...prev, minReviews: value }))
                    }
                    max={100}
                    step={5}
                    disabled={!filters.enabled}
                    className="py-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mais avaliações = empresa mais estabelecida
                  </p>
                </div>

                {/* Max Reviews Filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-medium">Máximo de Avaliações</Label>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {filters.maxReviews < 10000 ? `até ${filters.maxReviews}` : 'Ilimitado'}
                    </Badge>
                  </div>
                  <Slider
                    value={[filters.maxReviews]}
                    onValueChange={([value]) => 
                      setFilters(prev => ({ ...prev, maxReviews: value }))
                    }
                    min={10}
                    max={10000}
                    step={10}
                    disabled={!filters.enabled}
                    className="py-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Empresas menores são mais receptivas a novos fornecedores
                  </p>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="mt-6 pt-4 border-t">
                <Label className="text-sm font-medium mb-3 block">Presets Rápidos</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({
                      enabled: true,
                      noWebsite: true,
                      hasWhatsApp: true,
                      minRating: 0,
                      minReviews: 0,
                      maxReviews: 10000,
                      hasAddress: false,
                      hasEmail: false,
                    })}
                    disabled={isProcessing}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Empresas sem Site
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({
                      enabled: true,
                      noWebsite: false,
                      hasWhatsApp: true,
                      minRating: 4,
                      minReviews: 10,
                      maxReviews: 10000,
                      hasAddress: false,
                      hasEmail: false,
                    })}
                    disabled={isProcessing}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Bem Avaliadas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({
                      enabled: true,
                      noWebsite: false,
                      hasWhatsApp: true,
                      minRating: 0,
                      minReviews: 0,
                      maxReviews: 50,
                      hasAddress: false,
                      hasEmail: false,
                    })}
                    disabled={isProcessing}
                  >
                    <Building2 className="h-3 w-3 mr-1" />
                    Negócios Pequenos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({
                      enabled: true,
                      noWebsite: true,
                      hasWhatsApp: true,
                      minRating: 3.5,
                      minReviews: 5,
                      maxReviews: 100,
                      hasAddress: true,
                      hasEmail: false,
                    })}
                    disabled={isProcessing}
                  >
                    <Settings2 className="h-3 w-3 mr-1" />
                    Leads Premium
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    disabled={isProcessing}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Lead Quantity Slider */}
      <LeadQuantitySlider
        value={maxLeadsToCapture}
        onChange={setMaxLeadsToCapture}
        disabled={isProcessing}
      />

      {/* Actions */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          {/* Direct AI Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <Zap className={`h-5 w-5 ${useDirectAI ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <Label htmlFor="direct-ai-mode" className="font-medium">Modo IA Direta</Label>
                <p className="text-xs text-muted-foreground">
                  {useDirectAI 
                    ? 'Dispara direto gerando mensagens únicas com IA'
                    : 'Requer análise prévia para gerar mensagens'
                  }
                </p>
              </div>
            </div>
            <Switch
              id="direct-ai-mode"
              checked={useDirectAI}
              onCheckedChange={setUseDirectAI}
              disabled={isProcessing}
            />
          </div>

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
              Capturar {maxLeadsToCapture} Leads
            </Button>

            {!useDirectAI && (
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
            )}

            {/* Main send button - now uses background jobs for persistence */}
            <Button
              onClick={() => {
                if (!settings?.whatsapp_connected) {
                  toast({
                    title: '⚠️ WhatsApp não conectado',
                    description: 'Conecte seu WhatsApp nas configurações primeiro.',
                    variant: 'destructive',
                  });
                  return;
                }

                if (!isWithinOperatingHours()) {
                  const workDaysText = settings?.work_days_only ? ' em dias úteis' : '';
                  toast({
                    title: '⚠️ Fora do horário de operação',
                    description: `Envios permitidos entre ${settings?.auto_start_hour ?? 9}h e ${settings?.auto_end_hour ?? 18}h${workDaysText}. Ative "Operação 24h" nas configurações para ignorar.`,
                    variant: 'destructive',
                  });
                  return;
                }

                const leadsToProcess = capturedLeads.filter(l => 
                  selectedLeadIds.includes(l.id) && 
                  l.status !== 'sent' && 
                  !l.isDuplicate
                );

                if (leadsToProcess.length === 0) {
                  toast({
                    title: '⚠️ Nenhum lead válido',
                    description: 'Selecione leads que ainda não foram enviados.',
                    variant: 'destructive',
                  });
                  return;
                }

                // Get the specific service to offer
                const serviceToOffer = selectedService !== 'all' 
                  ? AVAILABLE_SERVICES.find(s => s.id === selectedService)?.label 
                  : undefined;

                // Create background job for persistent sending
                createJob({
                  leads: leadsToProcess.map(l => ({
                    id: l.id,
                    business_name: l.business_name,
                    phone: formatPhoneForWhatsApp(l.phone), // Format phone number
                    niche: l.niche,
                    location: l.location,
                    rating: l.rating,
                    reviews_count: l.reviews_count,
                    suggestedMessage: l.suggestedMessage,
                    status: 'pending' as const,
                  })),
                  directAIMode: useDirectAI,
                  useAIPersonalization: true,
                  agentSettings: {
                    agent_name: settings?.agent_name,
                    agent_persona: settings?.agent_persona,
                    communication_style: settings?.communication_style,
                    emoji_usage: settings?.emoji_usage,
                    services_offered: serviceToOffer ? [serviceToOffer] : settings?.services_offered,
                    knowledge_base: settings?.knowledge_base,
                  },
                  prospectingType: selectedProspectingType.id,
                  serviceToOffer,
                });

                // Clear selection after starting
                setSelectedLeadIds([]);
                addLog(`🚀 Disparo em segundo plano iniciado para ${leadsToProcess.length} leads`);
              }}
              disabled={isProcessing || isCreating || selectedLeadIds.length === 0 || !!activeJob}
              className="gradient-primary"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : useDirectAI ? (
                <Zap className="h-4 w-4 mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {activeJob ? 'Disparo em andamento...' : 
                useDirectAI ? `Disparar IA Direta (${selectedLeadIds.length})` : `Iniciar Disparo (${selectedLeadIds.length})`}
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
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base">
                Leads Capturados ({capturedLeads.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={selectAllNewLeads}
                  disabled={capturedLeads.filter(l => !l.isDuplicate && l.status !== 'sent').length === 0}
                >
                  Selecionar Novos ({capturedLeads.filter(l => !l.isDuplicate && l.status !== 'sent').length})
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={selectAllLeads}
                >
                  {selectedLeadIds.length > 0 ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </Button>
              </div>
            </div>
            <CardDescription>
              {selectedLeadIds.length} selecionados • 
              {capturedLeads.filter(l => l.status === 'sent').length} enviados •
              {capturedLeads.filter(l => l.status === 'failed').length} falharam •
              {capturedLeads.filter(l => l.isDuplicate).length} duplicados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {capturedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      lead.isDuplicate 
                        ? 'border-yellow-500/50 bg-yellow-500/5 opacity-70'
                        : selectedLeadIds.includes(lead.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedLeadIds.includes(lead.id)}
                        onCheckedChange={() => toggleLeadSelection(lead.id)}
                        disabled={lead.status === 'sent' || lead.isDuplicate}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{lead.business_name}</p>
                          {getStatusIcon(lead.status)}
                          {lead.qualityScore !== undefined && (
                            <Badge 
                              variant={getScoreBadge(lead.qualityScore).variant}
                              className={`text-xs ${getScoreColor(lead.qualityScore)}`}
                            >
                              {lead.qualityScore}pts
                            </Badge>
                          )}
                          {lead.isDuplicate && (
                            <Badge variant="outline" className="text-xs border-warning/50 text-warning">
                              Já existe
                            </Badge>
                          )}
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
                          {lead.reviews_count && lead.reviews_count > 0 && (
                            <span className="text-xs">({lead.reviews_count} avaliações)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs">{lead.niche}</Badge>
                          {lead.subtype && lead.subtype !== lead.niche && (
                            <Badge variant="outline" className="text-xs bg-accent/20">{lead.subtype}</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">{lead.location}</Badge>
                          {!lead.website && (
                            <Badge variant="outline" className="text-xs border-warning/50 text-warning">
                              <Globe className="h-2.5 w-2.5 mr-1" />
                              Sem site
                            </Badge>
                          )}
                          {lead.website && (
                            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                              <Globe className="h-2.5 w-2.5" />
                              Site
                            </a>
                          )}
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Log do Processo
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => refetchLogs()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] bg-muted/50 rounded-lg p-3">
            <div className="space-y-1 font-mono text-xs">
              {/* Show DB logs first (persisted), then local logs */}
              {dbLogs.length === 0 && localLogs.length === 0 ? (
                <p className="text-muted-foreground">Aguardando ações...</p>
              ) : (
                <>
                  {/* Database logs (persisted) */}
                  {dbLogs.map((log) => (
                    <p key={log.id} className={getLogColorClass(log)}>
                      {formatLog(log)}
                    </p>
                  ))}
                  {/* Local logs (capture phase etc) */}
                  {localLogs.map((log, idx) => (
                    <p key={`local-${idx}`} className={
                      log.includes('✓') ? 'text-emerald-600 dark:text-emerald-400' :
                      log.includes('✗') || log.includes('Erro') ? 'text-destructive' :
                      log.includes('Aguardando') ? 'text-muted-foreground' :
                      'text-foreground'
                    }>
                      {log}
                    </p>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
