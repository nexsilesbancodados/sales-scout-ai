import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
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
  SlidersHorizontal,
  MapPin,
  Building2,
  Zap,
  StopCircle,
  Clock,
  TrendingUp,
  Sparkles,
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
  const hasActiveFilters = captureFilter !== 'all' || selectedService !== 'auto';

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const estimatedTime = totalCombinations * 8;

  return (
    <Card className="border-0 shadow-xl shadow-primary/5 bg-card overflow-hidden rounded-2xl">
      <CardContent className="p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              {isSearching && (
                <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground">Capturar Leads</h3>
              <p className="text-xs text-muted-foreground">Busque empresas por nicho e localização</p>
            </div>
            {canSearch && !isSearching && (
              <div className="ml-auto hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground/70 bg-muted/40 px-2.5 py-1 rounded-full">
                <Clock className="h-3 w-3" />
                ~{formatTime(estimatedTime)}
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="px-6 pb-6 space-y-6">
          {/* Niche + Location */}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
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
              <Label className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
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

          {/* Quantity Slider */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
            <LeadQuantitySlider
              value={leadQuantity}
              onChange={setLeadQuantity}
              disabled={isSearching}
            />
          </div>

          {/* Advanced Filters */}
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleTrigger asChild>
              <button className={cn(
                "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border",
                showFilters
                  ? "bg-muted/40 border-border/50 text-foreground"
                  : "bg-muted/20 border-border/30 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}>
                <SlidersHorizontal className="h-4 w-4" />
                Filtros Avançados
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  showFilters && "rotate-180"
                )} />
                {hasActiveFilters && (
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-4 p-5 rounded-xl border border-border/40 bg-muted/10 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Filter className="h-3.5 w-3.5" />
                    Tipo de Empresa
                  </Label>
                  <Select value={captureFilter} onValueChange={setCaptureFilter}>
                    <SelectTrigger className="h-10 rounded-lg bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CAPTURE_FILTERS.map((filter) => (
                        <SelectItem key={filter.id} value={filter.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{filter.label}</span>
                            <span className="text-xs text-muted-foreground">{filter.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" />
                    Serviço a Oferecer
                  </Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="h-10 rounded-lg bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_SERVICES.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{service.label}</span>
                            <span className="text-xs text-muted-foreground">{service.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {captureFilter !== 'all' && (
                    <Badge variant="outline" className="text-xs gap-1 bg-primary/5 border-primary/20 text-primary">
                      <Filter className="h-3 w-3" />
                      {CAPTURE_FILTERS.find(f => f.id === captureFilter)?.label}
                    </Badge>
                  )}
                  {selectedService !== 'auto' && selectedService !== 'all' && (
                    <Badge variant="outline" className="text-xs gap-1 bg-accent/50 border-accent">
                      <Briefcase className="h-3 w-3" />
                      {AVAILABLE_SERVICES.find(s => s.id === selectedService)?.label}
                    </Badge>
                  )}
                </div>
              )}

              {captureFilter === 'no_website' && selectedService === 'auto' && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/15">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-primary">Dica inteligente</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Para empresas sem site, selecione "Sites e Landing Pages" como serviço
                    </p>
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* CTA Button */}
          <Button
            onClick={isSearching ? onStop : onSearch}
            disabled={!isSearching && !canSearch}
            className={cn(
              "w-full h-12 gap-2.5 text-sm font-semibold rounded-xl transition-all duration-300",
              isSearching
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                : canSearch
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99]"
                  : "bg-muted text-muted-foreground"
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
                  ? `Selecione nicho e localização`
                  : 'Selecione nicho e localização'
                }
              </>
            )}
          </Button>

          {/* Progress */}
          {isSearching && progress.total > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 space-y-3 animate-fade-in">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-foreground truncate mr-2">{progress.phase}</span>
                <span className="text-muted-foreground tabular-nums whitespace-nowrap font-mono text-xs">
                  {progress.current}/{progress.total}
                </span>
              </div>
              <Progress value={(progress.current / progress.total) * 100} className="h-1.5" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(elapsedTime)}
                  </span>
                  {foundCount > 0 && (
                    <span className="flex items-center gap-1 text-primary font-semibold">
                      <TrendingUp className="h-3 w-3" />
                      {foundCount} encontrados
                    </span>
                  )}
                </div>
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 tabular-nums border-primary/20 text-primary">
                  {Math.round((progress.current / progress.total) * 100)}%
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
