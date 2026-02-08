import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Loader2,
  MapPin,
  Building2,
  Phone,
  Star,
  Globe,
  Filter,
  Plus,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  MoreHorizontal,
  RefreshCw,
  ChevronDown,
  Bookmark,
  Users,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { MassSendProgress } from './MassSendProgress';
import { useMassSendJob, formatPhoneForWhatsApp } from '@/hooks/use-mass-send-job';

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
  qualityScore?: number;
  isDuplicate?: boolean;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'duplicate';
}

type ProcessStatus = 'idle' | 'capturing' | 'completed' | 'stopped';

const POPULAR_NICHES = [
  'Restaurantes', 'Salões de Beleza', 'Academias', 'Clínicas Médicas',
  'Clínicas Odontológicas', 'Pet Shops', 'Oficinas Mecânicas', 'Imobiliárias',
];

export function LeadFinderInterface() {
  const { settings } = useUserSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  const { createJob, isCreating, activeJob } = useMassSendJob();
  
  const [niche, setNiche] = useState('');
  const [location, setLocation] = useState('');
  const [capturedLeads, setCapturedLeads] = useState<CapturedLead[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [processStatus, setProcessStatus] = useState<ProcessStatus>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0, phase: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  
  const isStoppedRef = useRef(false);

  // Stats
  const totalResults = capturedLeads.length;
  const savedCount = capturedLeads.filter(l => l.status === 'sent').length;
  const duplicateCount = capturedLeads.filter(l => l.isDuplicate).length;
  const newCount = capturedLeads.filter(l => !l.isDuplicate && l.status === 'pending').length;

  const handleSearch = async () => {
    if (!niche.trim() || !location.trim()) {
      toast({
        title: '⚠️ Preencha os campos',
        description: 'Informe o tipo de negócio e a localização.',
        variant: 'destructive',
      });
      return;
    }

    setProcessStatus('capturing');
    isStoppedRef.current = false;
    setCapturedLeads([]);
    setSelectedLeadIds([]);

    try {
      const niches = niche.split(',').map(n => n.trim()).filter(n => n);
      const locations = location.split(',').map(l => l.trim()).filter(l => l);
      
      setProgress({ current: 0, total: niches.length * locations.length, phase: 'Buscando...' });

      const allLeads: CapturedLead[] = [];

      for (let ni = 0; ni < niches.length; ni++) {
        for (let li = 0; li < locations.length; li++) {
          if (isStoppedRef.current) break;

          const currentNiche = niches[ni];
          const currentLocation = locations[li];
          setProgress({ 
            current: ni * locations.length + li + 1, 
            total: niches.length * locations.length,
            phase: `${currentNiche} em ${currentLocation}`
          });

          const response = await supabase.functions.invoke('web-search', {
            body: {
              niche: currentNiche,
              location: currentLocation,
              maxResults: 100,
            },
          });

          if (response.data?.leads) {
            const leads = response.data.leads.map((lead: any) => ({
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              business_name: lead.business_name || lead.title,
              phone: lead.phone,
              address: lead.address,
              rating: lead.rating,
              reviews_count: lead.reviews_count,
              website: lead.website,
              niche: currentNiche,
              location: currentLocation,
              google_maps_url: lead.google_maps_url,
              status: 'pending' as const,
              qualityScore: calculateQualityScore(lead),
            })).filter((l: CapturedLead) => l.phone);

            allLeads.push(...leads);
          }
        }
      }

      // Deduplicate
      const uniqueLeads = allLeads.filter((lead, index, self) => {
        const normalizedPhone = lead.phone.replace(/\D/g, '');
        return index === self.findIndex(l => l.phone.replace(/\D/g, '') === normalizedPhone);
      });

      // Check database duplicates
      const checkedLeads = await checkDuplicatesInDatabase(uniqueLeads);
      
      // Sort by quality
      const sortedLeads = checkedLeads.sort((a, b) => {
        if (a.isDuplicate && !b.isDuplicate) return 1;
        if (!a.isDuplicate && b.isDuplicate) return -1;
        return (b.qualityScore || 0) - (a.qualityScore || 0);
      });

      setCapturedLeads(sortedLeads);

      // Auto-save new leads
      const newLeads = sortedLeads.filter(l => !l.isDuplicate);
      if (autoSave && newLeads.length > 0 && user?.id) {
        await saveLeadsToDatabase(newLeads);
      }

      setProcessStatus('completed');
      toast({
        title: '✅ Busca concluída!',
        description: `${newLeads.length} leads novos encontrados.`,
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

    createJob({
      leads: leadsToSend.map(l => ({
        id: l.id,
        business_name: l.business_name,
        phone: formatPhoneForWhatsApp(l.phone),
        niche: l.niche,
        location: l.location,
        rating: l.rating,
        reviews_count: l.reviews_count,
        status: 'pending' as const,
      })),
      directAIMode: true,
      useAIPersonalization: true,
      agentSettings: {
        agent_name: settings?.agent_name,
        agent_persona: settings?.agent_persona,
        communication_style: settings?.communication_style,
        emoji_usage: settings?.emoji_usage,
        services_offered: settings?.services_offered,
        knowledge_base: settings?.knowledge_base,
      },
      prospectingType: 'consultivo',
    });

    setSelectedLeadIds([]);
  };

  const isSearching = processStatus === 'capturing';

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Active Job Progress */}
      <MassSendProgress />

      {/* Search Bar - Inspired by reference image */}
      <div className="bg-card border rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tipo de negócio (ex: Restaurantes, Dentistas)"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                disabled={isSearching}
                className="pl-10 h-11 bg-background"
              />
            </div>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Localização (ex: São Paulo, SP)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isSearching}
                className="pl-10 h-11 bg-background"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !niche.trim() || !location.trim()}
            className="h-11 px-6 gap-2"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Buscar Leads
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Niche Suggestions */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {POPULAR_NICHES.filter(n => !niche.includes(n)).slice(0, 6).map((n) => (
            <Badge
              key={n}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => setNiche(prev => prev ? `${prev}, ${n}` : n)}
            >
              + {n}
            </Badge>
          ))}
        </div>

        {/* Progress */}
        {progress.total > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{progress.phase}</span>
              <span>{progress.current}/{progress.total}</span>
            </div>
            <Progress value={(progress.current / progress.total) * 100} className="h-2" />
          </div>
        )}
      </div>

      {/* Stats Row - Inspired by reference image */}
      {capturedLeads.length > 0 && (
        <div className="flex items-center gap-6 px-1">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">{totalResults}</span>
            <span className="text-sm text-muted-foreground">resultados</span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="font-medium">{newCount}</span>
            <span className="text-sm text-muted-foreground">novos</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{duplicateCount}</span>
            <span className="text-sm text-muted-foreground">existentes</span>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={selectAllNew}
              disabled={newCount === 0}
            >
              Selecionar Novos ({newCount})
            </Button>
            <Button
              size="sm"
              onClick={handleSendMessages}
              disabled={selectedLeadIds.length === 0 || isCreating || !!activeJob}
              className="gap-2"
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
      )}

      {/* Main Content - Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Left Panel - Leads List */}
        <div className="bg-card border rounded-xl overflow-hidden flex flex-col">
          <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedLeadIds.length > 0 
                ? `${selectedLeadIds.length} selecionados`
                : 'Leads encontrados'
              }
            </span>
            {selectedLeadIds.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedLeadIds([])}>
                Limpar seleção
              </Button>
            )}
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {capturedLeads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Busque leads para começar</p>
                  <p className="text-sm mt-1">Digite um nicho e localização acima</p>
                </div>
              ) : (
                capturedLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    isSelected={selectedLeadIds.includes(lead.id)}
                    onSelect={() => toggleLeadSelection(lead.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Info/Stats */}
        <div className="bg-card border rounded-xl overflow-hidden flex flex-col">
          <div className="p-3 border-b bg-muted/30">
            <span className="text-sm font-medium">Resumo da Busca</span>
          </div>
          
          <div className="flex-1 p-4">
            {capturedLeads.length > 0 ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <StatBox label="Total" value={totalResults} icon={Users} />
                  <StatBox label="Novos" value={newCount} icon={Plus} variant="success" />
                  <StatBox label="Já Existem" value={duplicateCount} icon={AlertCircle} variant="warning" />
                  <StatBox label="Selecionados" value={selectedLeadIds.length} icon={CheckCircle2} variant="primary" />
                </div>

                {/* Niche Breakdown */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Por Nicho</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      capturedLeads.reduce((acc, lead) => {
                        acc[lead.niche] = (acc[lead.niche] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([niche, count]) => (
                      <div key={niche} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{niche}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Breakdown */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Por Localização</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      capturedLeads.reduce((acc, lead) => {
                        acc[lead.location] = (acc[lead.location] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([loc, count]) => (
                      <div key={loc} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{loc}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quality Distribution */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Qualidade dos Leads</h4>
                  <div className="space-y-2">
                    <QualityBar label="Excelente (80+)" count={capturedLeads.filter(l => (l.qualityScore || 0) >= 80).length} total={totalResults} color="bg-green-500" />
                    <QualityBar label="Bom (60-79)" count={capturedLeads.filter(l => (l.qualityScore || 0) >= 60 && (l.qualityScore || 0) < 80).length} total={totalResults} color="bg-primary" />
                    <QualityBar label="Regular (<60)" count={capturedLeads.filter(l => (l.qualityScore || 0) < 60).length} total={totalResults} color="bg-muted-foreground" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <MapPin className="h-16 w-16 mb-4 opacity-10" />
                <p className="font-medium">Pronto para prospectar</p>
                <p className="text-sm mt-1 max-w-xs">
                  Use a barra de busca para encontrar empresas no Google Maps e capturar leads automaticamente.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Lead Card Component
function LeadCard({ 
  lead, 
  isSelected, 
  onSelect 
}: { 
  lead: CapturedLead; 
  isSelected: boolean; 
  onSelect: () => void;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-primary';
    return 'text-muted-foreground';
  };

  return (
    <div
      className={`p-3 rounded-lg border transition-all cursor-pointer ${
        lead.isDuplicate 
          ? 'border-yellow-500/30 bg-yellow-500/5 opacity-60'
          : isSelected
            ? 'border-primary bg-primary/5 shadow-sm'
            : 'hover:bg-muted/50 hover:border-muted-foreground/20'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <Checkbox 
          checked={isSelected}
          disabled={lead.isDuplicate || lead.status === 'sent'}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{lead.business_name}</span>
            {lead.qualityScore !== undefined && (
              <span className={`text-xs font-medium ${getScoreColor(lead.qualityScore)}`}>
                {lead.qualityScore}pts
              </span>
            )}
            {lead.isDuplicate && (
              <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-600">
                Já existe
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            {lead.rating && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                {lead.rating} ({lead.reviews_count || 0})
              </span>
            )}
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {lead.phone}
            </span>
          </div>

          {lead.address && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              <MapPin className="h-3 w-3 inline mr-1" />
              {lead.address}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">{lead.niche}</Badge>
            {!lead.website && (
              <Badge variant="outline" className="text-xs border-orange-500/50 text-orange-600">
                <Globe className="h-2.5 w-2.5 mr-1" />
                Sem site
              </Badge>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {lead.google_maps_url && (
              <DropdownMenuItem asChild>
                <a href={lead.google_maps_url} target="_blank" rel="noopener noreferrer">
                  <MapPin className="h-4 w-4 mr-2" />
                  Ver no Maps
                </a>
              </DropdownMenuItem>
            )}
            {lead.website && (
              <DropdownMenuItem asChild>
                <a href={lead.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visitar site
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <Bookmark className="h-4 w-4 mr-2" />
              Salvar para depois
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Stat Box Component
function StatBox({ 
  label, 
  value, 
  icon: Icon,
  variant = 'default'
}: { 
  label: string; 
  value: number; 
  icon: any;
  variant?: 'default' | 'success' | 'warning' | 'primary';
}) {
  const colors = {
    default: 'text-foreground',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    primary: 'text-primary',
  };

  return (
    <div className="p-4 rounded-lg border bg-muted/30">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${colors[variant]}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className={`text-2xl font-bold ${colors[variant]}`}>{value}</span>
    </div>
  );
}

// Quality Bar Component
function QualityBar({ 
  label, 
  count, 
  total, 
  color 
}: { 
  label: string; 
  count: number; 
  total: number; 
  color: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{count}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
