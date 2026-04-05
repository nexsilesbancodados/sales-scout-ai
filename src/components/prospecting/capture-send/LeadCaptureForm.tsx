import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { NicheAutocomplete } from '../NicheAutocomplete';
import { LocationAutocomplete } from '../LocationAutocomplete';
import { LeadQuantitySlider } from '../LeadQuantitySlider';
import {
  Search,
  Loader2,
  Target,
  Filter,
  Briefcase,
  ChevronDown,
  Settings2,
  MapPin,
  Building2,
  Zap,
  StopCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { ProgressInfo, AVAILABLE_SERVICES, CAPTURE_FILTERS } from './types';

interface LeadCaptureFormProps {
  selectedNiches: string[];
  setSelectedNiches: (v: string[]) => void;
  selectedLocations: string[];
  setSelectedLocations: (v: string[]) => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  selectedService: string;
  setSelectedService: (v: string) => void;
  captureFilter: string;
  setCaptureFilter: (v: string) => void;
  isSearching: boolean;
  progress: ProgressInfo;
  onSearch: () => void;
  onStop?: () => void;
  leadQuantity: number;
  setLeadQuantity: (v: number) => void;
  elapsedTime?: number;
  foundCount?: number;
}

export function LeadCaptureForm({
  selectedNiches,
  setSelectedNiches,
  selectedLocations,
  setSelectedLocations,
  showFilters,
  setShowFilters,
  selectedService,
  setSelectedService,
  captureFilter,
  setCaptureFilter,
  isSearching,
  progress,
  onSearch,
  onStop,
  leadQuantity,
  setLeadQuantity,
  elapsedTime = 0,
  foundCount = 0,
}: LeadCaptureFormProps) {
  const totalCombinations = selectedNiches.length * selectedLocations.length;
  const canSearch = selectedNiches.length > 0 && selectedLocations.length > 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const estimatedTime = totalCombinations * 8; // ~8s per combination

  return (
    <Card className="border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2.5 rounded-xl bg-primary/10 ring-2 ring-primary/20">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                {isSearching && (
                  <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card animate-pulse" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-base">Capturar Leads</h3>
                <p className="text-xs text-muted-foreground">Busque empresas por nicho e localização</p>
              </div>
            </div>
            {canSearch && !isSearching && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>~{formatTime(estimatedTime)} estimado</span>
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Building2 className="h-3.5 w-3.5" />
                Tipo de Negócio
              </Label>
              <NicheAutocomplete
                value={selectedNiches}
                onChange={setSelectedNiches}
                placeholder="Digite ou selecione nichos..."
                disabled={isSearching}
                maxSelections={10}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5" />
                Localização
              </Label>
              <LocationAutocomplete
                value={selectedLocations}
                onChange={setSelectedLocations}
                placeholder="Cidade, estado ou CEP..."
                disabled={isSearching}
                maxSelections={10}
              />
            </div>
          </div>

          {/* Lead Quantity Slider */}
          <LeadQuantitySlider
            value={leadQuantity}
            onChange={setLeadQuantity}
            disabled={isSearching}
          />

          {/* Filters */}
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2 h-10 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Filtros Avançados</span>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  showFilters && "rotate-180"
                )} />
                {(captureFilter !== 'all' || selectedService !== 'auto') && (
                  <Badge className="ml-auto bg-primary/20 text-primary border-0 text-[10px] px-1.5">
                    Ativos
                  </Badge>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-4 p-4 rounded-xl border border-border/50 bg-muted/20">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-medium">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    Tipo de Empresa
                  </Label>
                  <Select value={captureFilter} onValueChange={setCaptureFilter}>
                    <SelectTrigger className="h-10">
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
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-medium">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                    Serviço a Oferecer
                  </Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="h-10">
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

              {(captureFilter !== 'all' || selectedService !== 'auto') && (
                <div className="flex flex-wrap gap-2">
                  {captureFilter !== 'all' && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Filter className="h-3 w-3" />
                      {CAPTURE_FILTERS.find(f => f.id === captureFilter)?.label}
                    </Badge>
                  )}
                  {selectedService !== 'auto' && selectedService !== 'all' && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Briefcase className="h-3 w-3" />
                      {AVAILABLE_SERVICES.find(s => s.id === selectedService)?.label}
                    </Badge>
                  )}
                </div>
              )}

              {captureFilter === 'no_website' && selectedService === 'auto' && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                  <p className="font-medium text-primary flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    Sugestão
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para empresas sem site, considere selecionar "Sites e Landing Pages" diretamente
                  </p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Search / Stop Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={isSearching ? onStop : onSearch}
              disabled={!isSearching && !canSearch}
              className={cn(
                "flex-1 h-12 gap-2.5 text-sm font-semibold rounded-xl transition-all duration-300",
                isSearching
                  ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  : canSearch
                    ? "gradient-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01]"
                    : ""
              )}
            >
              {isSearching ? (
                <>
                  <StopCircle className="h-5 w-5" />
                  Parar Busca
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  {canSearch 
                    ? `Buscar Leads (${totalCombinations} ${totalCombinations === 1 ? 'combinação' : 'combinações'})`
                    : 'Selecione nicho e localização'
                  }
                </>
              )}
            </Button>
          </div>

          {/* Progress */}
          {isSearching && progress.total > 0 && (
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3 animate-fade-in">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium truncate mr-2">{progress.phase}</span>
                <span className="text-muted-foreground tabular-nums whitespace-nowrap">
                  {progress.current}/{progress.total}
                </span>
              </div>
              <Progress value={(progress.current / progress.total) * 100} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(elapsedTime)}
                  </span>
                  {foundCount > 0 && (
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <TrendingUp className="h-3 w-3" />
                      {foundCount} encontrados
                    </span>
                  )}
                </div>
                <span>
                  {Math.round((progress.current / progress.total) * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
