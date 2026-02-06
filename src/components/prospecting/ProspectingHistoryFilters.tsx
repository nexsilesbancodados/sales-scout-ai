import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ProspectingHistory } from '@/hooks/use-prospecting-history';
import { Filter, X, CalendarIcon, Download } from 'lucide-react';

export interface HistoryFilters {
  sessionType: string;
  status: string;
  niche: string;
  location: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

interface ProspectingHistoryFiltersProps {
  filters: HistoryFilters;
  onFiltersChange: (filters: HistoryFilters) => void;
  history: ProspectingHistory[];
  onExport: () => void;
}

const DEFAULT_FILTERS: HistoryFilters = {
  sessionType: 'all',
  status: 'all',
  niche: '',
  location: '',
  dateFrom: undefined,
  dateTo: undefined,
};

export function ProspectingHistoryFilters({
  filters,
  onFiltersChange,
  history,
  onExport,
}: ProspectingHistoryFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get unique values from history
  const uniqueNiches = [...new Set(history.filter(h => h.niche).map(h => h.niche!))];
  const uniqueLocations = [...new Set(history.filter(h => h.location).map(h => h.location!))];

  const activeFiltersCount = [
    filters.sessionType !== 'all',
    filters.status !== 'all',
    filters.niche !== '',
    filters.location !== '',
    filters.dateFrom !== undefined,
    filters.dateTo !== undefined,
  ].filter(Boolean).length;

  const resetFilters = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtros Avançados</h4>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>

            {/* Session Type */}
            <div className="space-y-2">
              <Label>Tipo de Sessão</Label>
              <Select
                value={filters.sessionType}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, sessionType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="capture">Captura Maps</SelectItem>
                  <SelectItem value="mass_send">Disparo em Massa</SelectItem>
                  <SelectItem value="campaign">Campanha</SelectItem>
                  <SelectItem value="import">Importação</SelectItem>
                  <SelectItem value="web_search">Busca Web</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="running">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Niche */}
            <div className="space-y-2">
              <Label>Nicho</Label>
              <Select
                value={filters.niche || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, niche: value === 'all' ? '' : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os nichos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os nichos</SelectItem>
                  {uniqueNiches.map((niche) => (
                    <SelectItem key={niche} value={niche}>
                      {niche}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Localização</Label>
              <Select
                value={filters.location || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, location: value === 'all' ? '' : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as localizações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as localizações</SelectItem>
                  {uniqueLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? (
                        format(filters.dateFrom, 'dd/MM', { locale: ptBR })
                      ) : (
                        <span className="text-muted-foreground">De</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) =>
                        onFiltersChange({ ...filters, dateFrom: date })
                      }
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? (
                        format(filters.dateTo, 'dd/MM', { locale: ptBR })
                      ) : (
                        <span className="text-muted-foreground">Até</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) =>
                        onFiltersChange({ ...filters, dateTo: date })
                      }
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
        <Download className="h-4 w-4" />
        Exportar CSV
      </Button>

      {/* Active Filter Tags */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-1">
          {filters.sessionType !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Tipo: {filters.sessionType}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, sessionType: 'all' })}
              />
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, status: 'all' })}
              />
            </Badge>
          )}
          {filters.niche && (
            <Badge variant="secondary" className="gap-1">
              Nicho: {filters.niche}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, niche: '' })}
              />
            </Badge>
          )}
          {filters.location && (
            <Badge variant="secondary" className="gap-1">
              Local: {filters.location}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, location: '' })}
              />
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="secondary" className="gap-1">
              De: {format(filters.dateFrom, 'dd/MM', { locale: ptBR })}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, dateFrom: undefined })}
              />
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary" className="gap-1">
              Até: {format(filters.dateTo, 'dd/MM', { locale: ptBR })}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, dateTo: undefined })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export { DEFAULT_FILTERS };
