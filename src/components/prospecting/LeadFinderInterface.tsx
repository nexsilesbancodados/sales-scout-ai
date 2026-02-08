import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';
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

          const searchQuery = `${currentNiche} em ${currentLocation}`;
          
          const response = await supabase.functions.invoke('web-search', {
            body: {
              query: searchQuery,
              location: currentLocation,
              num_results: 50,
              search_type: 'places',
            },
          });

          if (response.data?.results) {
            const leads = response.data.results
              .filter((result: any) => result.phone)
              .map((result: any) => ({
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                business_name: result.title,
                phone: result.phone,
                address: result.snippet,
                rating: undefined,
                reviews_count: undefined,
                website: result.link,
                niche: currentNiche,
                location: currentLocation,
                google_maps_url: result.link?.includes('maps.google') ? result.link : undefined,
                status: 'pending' as const,
                qualityScore: calculateQualityScore({ 
                  title: result.title, 
                  phone: result.phone, 
                  website: result.link,
                  address: result.snippet 
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
      
      const sortedLeads = checkedLeads.sort((a, b) => {
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative sm:col-span-1">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tipo de negócio (ex: Restaurantes)"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                disabled={isSearching}
                className="pl-10 h-12 bg-background border-2"
              />
            </div>
            
            <div className="relative sm:col-span-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Localização (ex: São Paulo, SP)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isSearching}
                className="pl-10 h-12 bg-background border-2"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !niche.trim() || !location.trim()}
              className="h-12 gap-2 gradient-primary shadow-lg text-base font-semibold"
            >
              {isSearching ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              Buscar Leads
            </Button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs text-muted-foreground mr-2">Sugestões:</span>
            {POPULAR_NICHES.filter(n => !niche.includes(n)).slice(0, 5).map((n) => (
              <Badge
                key={n}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors text-xs"
                onClick={() => setNiche(prev => prev ? `${prev}, ${n}` : n)}
              >
                + {n}
              </Badge>
            ))}
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
            {capturedLeads.map((lead, index) => (
              <Card 
                key={lead.id}
                className={cn(
                  "group cursor-pointer transition-all duration-200 animate-fade-in",
                  selectedLeadIds.includes(lead.id) && "ring-2 ring-primary border-primary",
                  lead.isDuplicate && "opacity-60"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => !lead.isDuplicate && toggleLeadSelection(lead.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedLeadIds.includes(lead.id)}
                      disabled={lead.isDuplicate}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm truncate">{lead.business_name}</h4>
                        {lead.qualityScore && (
                          <Badge 
                            variant={lead.qualityScore >= 70 ? "default" : "secondary"}
                            className="shrink-0 text-xs"
                          >
                            {lead.qualityScore}%
                          </Badge>
                        )}
                      </div>
                      
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
                              {lead.website.replace(/^https?:\/\//, '').slice(0, 30)}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">
                          {lead.niche}
                        </Badge>
                        {lead.isDuplicate && (
                          <Badge variant="secondary" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Existente
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
