import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { NicheAutocomplete } from './NicheAutocomplete';
import { LocationAutocomplete } from './LocationAutocomplete';
import {
  Search,
  Loader2,
  MapPin,
  Building2,
  Phone,
  Star,
  Globe,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Users,
  Sparkles,
  Zap,
  TrendingUp,
  Target,
  Filter,
  Briefcase,
  ChevronDown,
  Settings2,
} from 'lucide-react';
import { MassSendProgress } from './MassSendProgress';
import { useMassSendJob, formatPhoneForWhatsApp } from '@/hooks/use-mass-send-job';

// Available services for filtering
const AVAILABLE_SERVICES = [
  { id: 'auto', label: 'IA Automática', description: 'IA analisa e oferece o serviço ideal' },
  { id: 'all', label: 'Todos os Serviços', description: 'Usar serviços do perfil' },
  { id: 'trafego_pago', label: 'Tráfego Pago', description: 'Anúncios e campanhas' },
  { id: 'automacao', label: 'Automação', description: 'Processos e sistemas' },
  { id: 'social_media', label: 'Social Media', description: 'Redes sociais' },
  { id: 'websites', label: 'Sites e Landing Pages', description: 'Criação de sites' },
  { id: 'seo', label: 'SEO', description: 'Otimização para buscadores' },
  { id: 'design', label: 'Design Gráfico', description: 'Identidade visual' },
  { id: 'consultoria', label: 'Consultoria', description: 'Consultoria em marketing' },
];

// Lead filters for targeting
const CAPTURE_FILTERS = [
  { id: 'all', label: 'Todos', description: 'Sem filtro' },
  { id: 'no_website', label: 'Sem Site', description: 'Empresas sem website' },
  { id: 'low_rating', label: 'Avaliação Baixa', description: '< 4 estrelas' },
  { id: 'few_reviews', label: 'Poucos Reviews', description: '< 10 avaliações' },
  { id: 'small_business', label: 'Pequenos Negócios', description: 'Microempresas' },
  { id: 'premium', label: 'Premium', description: 'Alta avaliação + reviews' },
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
  google_maps_url?: string;
  photo_url?: string;
  qualityScore?: number;
  isDuplicate?: boolean;
  lead_group?: string;
  service_opportunities?: string[];
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'duplicate';
}

type ProcessStatus = 'idle' | 'capturing' | 'completed' | 'stopped';

export function LeadFinderInterface() {
  const { settings } = useUserSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  const { createJob, isCreating, activeJob } = useMassSendJob();
  
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [capturedLeads, setCapturedLeads] = useState<CapturedLead[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [processStatus, setProcessStatus] = useState<ProcessStatus>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0, phase: '' });
  const [autoSave, setAutoSave] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('auto');
  const [captureFilter, setCaptureFilter] = useState<string>('all');
  
  const isStoppedRef = useRef(false);

  // Stats
  const totalResults = capturedLeads.length;
  const savedCount = capturedLeads.filter(l => l.status === 'sent').length;
  const duplicateCount = capturedLeads.filter(l => l.isDuplicate).length;
  const newCount = capturedLeads.filter(l => !l.isDuplicate && l.status === 'pending').length;

  const handleSearch = async () => {
    if (selectedNiches.length === 0 || selectedLocations.length === 0) {
      toast({
        title: '⚠️ Preencha os campos',
        description: 'Selecione pelo menos um nicho e uma localização.',
        variant: 'destructive',
      });
      return;
    }

    setProcessStatus('capturing');
    isStoppedRef.current = false;
    setCapturedLeads([]);
    setSelectedLeadIds([]);

    try {
      setProgress({ current: 0, total: selectedNiches.length * selectedLocations.length, phase: 'Buscando...' });

      const allLeads: CapturedLead[] = [];

      for (let ni = 0; ni < selectedNiches.length; ni++) {
        for (let li = 0; li < selectedLocations.length; li++) {
          if (isStoppedRef.current) break;

          const currentNiche = selectedNiches[ni];
          const currentLocation = selectedLocations[li];
          setProgress({ 
            current: ni * selectedLocations.length + li + 1, 
            total: selectedNiches.length * selectedLocations.length,
            phase: `${currentNiche} em ${currentLocation}`
          });

          // Use only niche in query, location as separate parameter
          const searchQuery = currentNiche;
          
          const response = await supabase.functions.invoke('web-search', {
            body: {
              query: searchQuery,
              location: currentLocation,
              num_results: 0, // 0 = unlimited, fetch all available
              search_type: 'places',
              expand_search: true, // Enable expanded search with subniches
            },
          });

          if (response.data?.results) {
            const leads = response.data.results
              .filter((result: any) => result.phone)
              .map((result: any) => ({
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                business_name: result.title,
                phone: result.phone,
                address: result.snippet || result.address,
                rating: result.rating,
                reviews_count: result.reviews_count,
                website: result.website || result.link,
                niche: currentNiche,
                location: currentLocation,
                google_maps_url: result.google_maps_url || (result.link?.includes('maps.google') ? result.link : undefined),
                photo_url: result.photo_url || result.thumbnail,
                status: 'pending' as const,
                qualityScore: calculateQualityScore({ 
                  title: result.title, 
                  phone: result.phone, 
                  website: result.website || result.link,
                  address: result.snippet || result.address,
                  rating: result.rating,
                  reviews_count: result.reviews_count,
                }),
              }));

            allLeads.push(...leads);
          }
        }
      }

      const uniqueLeads = allLeads.filter((lead, index, self) => {
        const normalizedPhone = lead.phone.replace(/\D/g, '');
        return index === self.findIndex(l => l.phone.replace(/\D/g, '') === normalizedPhone);
      });

      const checkedLeads = await checkDuplicatesInDatabase(uniqueLeads);
      
      // Qualify leads by groups using AI
      setProgress({ current: 0, total: 1, phase: 'Qualificando leads com IA...' });
      const qualifiedLeads = await qualifyLeadsWithAI(checkedLeads);
      
      const sortedLeads = qualifiedLeads.sort((a, b) => {
        if (a.isDuplicate && !b.isDuplicate) return 1;
        if (!a.isDuplicate && b.isDuplicate) return -1;
        return (b.qualityScore || 0) - (a.qualityScore || 0);
      });

      setCapturedLeads(sortedLeads);

      const newLeads = sortedLeads.filter(l => !l.isDuplicate);
      if (autoSave && newLeads.length > 0 && user?.id) {
        await saveLeadsToDatabase(newLeads);
      }

      setProcessStatus('completed');
      
      // Summary by groups
      const groups = newLeads.reduce((acc, l) => {
        const g = l.lead_group || 'Outros';
        acc[g] = (acc[g] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const groupSummary = Object.entries(groups)
        .map(([g, c]) => `${c} ${g}`)
        .slice(0, 3)
        .join(', ');
      
      toast({
        title: '✅ Busca concluída!',
        description: `${newLeads.length} leads novos: ${groupSummary}`,
      });

    } catch (error: any) {
      toast({
        title: '❌ Erro na busca',
        description: error.message,
        variant: 'destructive',
      });
      setProcessStatus('idle');
    }

    setProgress({ current: 0, total: 0, phase: '' });
  };

  const calculateQualityScore = (lead: any): number => {
    let score = 50;
    if (lead.rating >= 4.5) score += 20;
    else if (lead.rating >= 4.0) score += 15;
    else if (lead.rating >= 3.5) score += 10;
    if (lead.reviews_count >= 100) score += 15;
    else if (lead.reviews_count >= 50) score += 10;
    else if (lead.reviews_count >= 20) score += 5;
    if (!lead.website) score += 10;
    if (lead.address) score += 5;
    return Math.min(100, score);
  };

  const checkDuplicatesInDatabase = async (leads: CapturedLead[]): Promise<CapturedLead[]> => {
    if (!user?.id || leads.length === 0) return leads;
    
    try {
      const { data: existingLeads } = await supabase
        .from('leads')
        .select('phone')
        .eq('user_id', user.id);

      if (!existingLeads) return leads;

      const existingPhones = new Set(existingLeads.map(l => l.phone.replace(/\D/g, '')));
      
      return leads.map(lead => ({
        ...lead,
        isDuplicate: existingPhones.has(lead.phone.replace(/\D/g, '')),
      }));
    } catch {
      return leads;
    }
  };

  const qualifyLeadsWithAI = async (leads: CapturedLead[]): Promise<CapturedLead[]> => {
    if (leads.length === 0) return leads;
    
    try {
      const response = await supabase.functions.invoke('ai-prospecting', {
        body: {
          action: 'qualify_leads_by_group',
          data: {
            leads: leads.map(l => ({
              id: l.id,
              business_name: l.business_name,
              website: l.website,
              rating: l.rating,
              reviews_count: l.reviews_count,
              niche: l.niche,
            })),
          },
        },
      });

      if (response.data?.qualified_leads) {
        const qualifiedMap = new Map(
          response.data.qualified_leads.map((q: any) => [q.id, q])
        );
        
        return leads.map(lead => {
          const qualification = qualifiedMap.get(lead.id) as any;
          if (qualification) {
            return {
              ...lead,
              lead_group: qualification.lead_group,
              service_opportunities: qualification.service_opportunities,
            };
          }
          return lead;
        });
      }
      
      return leads;
    } catch (error) {
      console.error('Error qualifying leads with AI:', error);
      
      // Fallback: basic classification without AI
      return leads.map(lead => {
        let group = 'Novo';
        const opportunities: string[] = [];
        
        if (!lead.website) {
          group = 'Sem Site';
          opportunities.push('Criação de Site');
        } else if (lead.rating && lead.rating < 3.5) {
          group = 'Avaliação Baixa';
          opportunities.push('Marketing Digital');
        } else if (lead.reviews_count && lead.reviews_count > 50 && lead.rating && lead.rating >= 4.5) {
          group = 'Premium';
          opportunities.push('Fidelização');
        } else if (lead.reviews_count && lead.reviews_count > 50) {
          group = 'Estabelecido';
          opportunities.push('Automação');
        } else if (!lead.reviews_count || lead.reviews_count < 20) {
          group = 'Pequeno Porte';
          opportunities.push('Chatbot');
        }
        
        return { ...lead, lead_group: group, service_opportunities: opportunities };
      });
    }
  };

  const saveLeadsToDatabase = async (leads: CapturedLead[]) => {
    if (!user?.id) return;

    const leadsToSave = leads.map(lead => ({
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
      photo_url: lead.photo_url || null,
      lead_group: lead.lead_group || null,
      service_opportunities: lead.service_opportunities || [],
      stage: 'Novo',
      temperature: 'frio',
      source: 'lead_finder',
      quality_score: lead.qualityScore || null,
    }));

    await supabase.from('leads').insert(leadsToSave);
  };

  const toggleLeadSelection = (id: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllNew = () => {
    const newIds = capturedLeads.filter(l => !l.isDuplicate && l.status !== 'sent').map(l => l.id);
    setSelectedLeadIds(newIds);
  };

  const handleSendMessages = () => {
    if (!settings?.whatsapp_connected) {
      toast({
        title: '⚠️ WhatsApp não conectado',
        description: 'Conecte seu WhatsApp nas configurações.',
        variant: 'destructive',
      });
      return;
    }

    const leadsToSend = capturedLeads.filter(l => 
      selectedLeadIds.includes(l.id) && !l.isDuplicate && l.status !== 'sent'
    );

    if (leadsToSend.length === 0) {
      toast({
        title: '⚠️ Nenhum lead selecionado',
        description: 'Selecione leads para enviar mensagens.',
        variant: 'destructive',
      });
      return;
    }

    // Get the specific service to offer
    const isAutoMode = selectedService === 'auto';
    const serviceToOffer = (selectedService !== 'all' && selectedService !== 'auto')
      ? AVAILABLE_SERVICES.find(s => s.id === selectedService)?.label 
      : null;

    createJob({
      leads: leadsToSend.map(l => ({
        id: l.id,
        business_name: l.business_name,
        phone: formatPhoneForWhatsApp(l.phone),
        niche: l.niche,
        location: l.location,
        rating: l.rating,
        reviews_count: l.reviews_count,
        website: l.website,
        has_website: !!l.website,
        status: 'pending' as const,
      })),
      directAIMode: true,
      useAIPersonalization: true,
      autoServiceMode: isAutoMode,
      captureFilter: captureFilter,
      agentSettings: {
        agent_name: settings?.agent_name,
        agent_persona: settings?.agent_persona,
        communication_style: settings?.communication_style,
        emoji_usage: settings?.emoji_usage,
        services_offered: serviceToOffer ? [serviceToOffer] : settings?.services_offered,
        knowledge_base: settings?.knowledge_base,
        specific_service: isAutoMode ? null : serviceToOffer,
        auto_detect_service: isAutoMode,
      },
      prospectingType: 'consultivo',
    });

    setSelectedLeadIds([]);
  };

  const isSearching = processStatus === 'capturing';

  return (
    <div className="space-y-6">
      {/* Active Job Progress */}
      <MassSendProgress />

      {/* Search Section */}
      <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Capturar Leads</h3>
              <p className="text-sm text-muted-foreground">Busque empresas por nicho e localização</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Tipo de Negócio</p>
              <NicheAutocomplete
                value={selectedNiches}
                onChange={setSelectedNiches}
                placeholder="Digite ou selecione nichos..."
                disabled={isSearching}
                maxSelections={10}
              />
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-2">Localização</p>
              <LocationAutocomplete
                value={selectedLocations}
                onChange={setSelectedLocations}
                placeholder="Cidade, estado ou CEP..."
                disabled={isSearching}
                maxSelections={10}
              />
            </div>
          </div>

          {/* Filters Section */}
          <Collapsible open={showFilters} onOpenChange={setShowFilters} className="mt-4">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Settings2 className="h-4 w-4" />
                Filtros Avançados
                <ChevronDown className={cn("h-4 w-4 transition-transform", showFilters && "rotate-180")} />
                {(captureFilter !== 'all' || selectedService !== 'auto') && (
                  <Badge variant="secondary" className="ml-2 text-xs">Ativos</Badge>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-4 p-4 rounded-lg border bg-muted/30">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Capture Filter */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Filter className="h-4 w-4" />
                    Tipo de Empresa
                  </Label>
                  <Select value={captureFilter} onValueChange={setCaptureFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CAPTURE_FILTERS.map((filter) => (
                        <SelectItem key={filter.id} value={filter.id}>
                          <div className="flex flex-col">
                            <span>{filter.label}</span>
                            <span className="text-xs text-muted-foreground">{filter.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Service Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4" />
                    Serviço a Oferecer
                  </Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue />
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
                </div>
              </div>

              {/* Active filters indicator */}
              {(captureFilter !== 'all' || selectedService !== 'auto') && (
                <div className="flex flex-wrap gap-2">
                  {captureFilter !== 'all' && (
                    <Badge variant="outline" className="text-xs">
                      <Filter className="h-3 w-3 mr-1" />
                      {CAPTURE_FILTERS.find(f => f.id === captureFilter)?.label}
                    </Badge>
                  )}
                  {selectedService !== 'auto' && selectedService !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {AVAILABLE_SERVICES.find(s => s.id === selectedService)?.label}
                    </Badge>
                  )}
                </div>
              )}

              {/* Smart suggestion */}
              {captureFilter === 'no_website' && selectedService === 'auto' && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                  <p className="font-medium text-primary">💡 Sugestão</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para empresas sem site, considere selecionar "Sites e Landing Pages" diretamente
                  </p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          <div className="mt-4">
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || selectedNiches.length === 0 || selectedLocations.length === 0}
              className="w-full h-12 gap-2 gradient-primary shadow-lg text-base font-semibold"
            >
              {isSearching ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              Buscar Leads ({selectedNiches.length} nichos × {selectedLocations.length} locais)
            </Button>
          </div>

          {/* Progress */}
          {progress.total > 0 && (
            <div className="mt-6 p-4 rounded-xl bg-background border">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">{progress.phase}</span>
                <span className="text-muted-foreground">{progress.current}/{progress.total}</span>
              </div>
              <Progress value={(progress.current / progress.total) * 100} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {capturedLeads.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          {/* Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-muted/50 border">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{totalResults}</span>
              <span className="text-sm text-muted-foreground">resultados</span>
            </div>
            
            <div className="h-6 w-px bg-border hidden sm:block" />
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="font-medium">{newCount}</span>
                <span className="text-sm text-muted-foreground">novos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="font-medium">{duplicateCount}</span>
                <span className="text-sm text-muted-foreground">existentes</span>
              </div>
            </div>
            
            <div className="ml-auto flex items-center gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={selectAllNew}
                disabled={newCount === 0}
              >
                Selecionar Novos ({newCount})
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  const newLeads = capturedLeads.filter(l => !l.isDuplicate && l.status === 'pending');
                  if (newLeads.length === 0) return;
                  await saveLeadsToDatabase(newLeads);
                  toast({
                    title: '✅ Leads salvos!',
                    description: `${newLeads.length} leads salvos no banco de dados.`,
                  });
                }}
                disabled={newCount === 0}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Salvar Leads ({newCount})
              </Button>
              <Button
                size="sm"
                onClick={handleSendMessages}
                disabled={selectedLeadIds.length === 0 || isCreating || !!activeJob}
                className="gap-2 gradient-primary"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Enviar ({selectedLeadIds.length})
              </Button>
            </div>
          </div>

          {/* Leads Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {capturedLeads.map((lead, index) => {
              const isCurrentlySending = activeJob?.status === 'running' && 
                activeJob.payload?.leads?.[activeJob.current_index || 0]?.phone === lead.phone;
              
              return (
                <Card 
                  key={lead.id}
                  className={cn(
                    "group cursor-pointer transition-all duration-200 animate-fade-in overflow-hidden",
                    selectedLeadIds.includes(lead.id) && "ring-2 ring-primary border-primary",
                    lead.isDuplicate && "opacity-60",
                    isCurrentlySending && "ring-2 ring-success border-success animate-pulse"
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                  onClick={() => !lead.isDuplicate && toggleLeadSelection(lead.id)}
                >
                  <CardContent className="p-0">
                    {/* Photo Header */}
                    <div className="relative h-24 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                      {lead.photo_url ? (
                        <img 
                          src={lead.photo_url} 
                          alt={lead.business_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                      )}
                      
                      {/* Sending indicator overlay */}
                      {isCurrentlySending && (
                        <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
                          <div className="bg-success text-success-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg">
                            <Send className="h-3 w-3 animate-bounce" />
                            Enviando agora...
                          </div>
                        </div>
                      )}
                      
                      {/* Quality score badge */}
                      {lead.qualityScore && (
                        <Badge 
                          variant={lead.qualityScore >= 70 ? "default" : "secondary"}
                          className="absolute top-2 right-2 text-xs shadow-md"
                        >
                          {lead.qualityScore}%
                        </Badge>
                      )}
                      
                      {/* Rating badge */}
                      {lead.rating && (
                        <div className="absolute top-2 left-2 bg-background/90 rounded-full px-2 py-0.5 flex items-center gap-1 text-xs shadow-md">
                          <Star className="h-3 w-3 text-warning fill-warning" />
                          <span className="font-medium">{lead.rating}</span>
                          {lead.reviews_count && (
                            <span className="text-muted-foreground">({lead.reviews_count})</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedLeadIds.includes(lead.id)}
                          disabled={lead.isDuplicate}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{lead.business_name}</h4>
                          
                          <div className="mt-2 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              <span className="truncate">{lead.phone}</span>
                            </div>
                            
                            {lead.address && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="truncate">{lead.address}</span>
                              </div>
                            )}
                            
                            {lead.website && (
                              <div className="flex items-center gap-2 text-xs">
                                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                                <a 
                                  href={lead.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline truncate"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {lead.website.replace(/^https?:\/\//, '').slice(0, 25)}
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-3">
                            <Badge variant="outline" className="text-xs">
                              {lead.niche}
                            </Badge>
                            {lead.lead_group && (
                              <Badge variant="secondary" className="text-xs">
                                {lead.lead_group}
                              </Badge>
                            )}
                            {lead.isDuplicate && (
                              <Badge variant="secondary" className="text-xs bg-warning/10 text-warning border-warning/20">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Existente
                              </Badge>
                            )}
                            {isCurrentlySending && (
                              <Badge className="text-xs bg-success text-success-foreground animate-pulse">
                                <Send className="h-3 w-3 mr-1" />
                                Enviando
                              </Badge>
                            )}
                          </div>
                          
                          {/* Service opportunities */}
                          {lead.service_opportunities && lead.service_opportunities.length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                Oportunidades:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {lead.service_opportunities.slice(0, 2).map((opp, i) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                                    {opp}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {capturedLeads.length === 0 && processStatus === 'idle' && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Nenhum lead capturado</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Digite um nicho e localização acima para começar a buscar leads potenciais para sua prospecção.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
