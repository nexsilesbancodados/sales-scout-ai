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
import {
  Search,
  Loader2,
  Target,
  Filter,
  Briefcase,
  ChevronDown,
  Settings2,
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
}: LeadCaptureFormProps) {
  return (
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
            onClick={onSearch}
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
  );
}
