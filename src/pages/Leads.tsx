import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLeads } from '@/hooks/use-leads';
import { Lead, LeadStage, LeadTemperature } from '@/types/database';
import { ImportExportLeads } from '@/components/leads/ImportExportLeads';
import { LeadDetailsModal } from '@/components/leads/LeadDetailsModal';
import { LeadsPagination } from '@/components/leads/LeadsPagination';
import { temperatureIcons, stageColors, allStages, allTemperatures } from '@/constants/lead-icons';
import {
  Search,
  Plus,
  MoreHorizontal,
  MessageSquare,
  Trash2,
  Eye,
  Loader2,
  Users,
  Filter,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<LeadStage | 'all'>('all');
  const [tempFilter, setTempFilter] = useState<LeadTemperature | 'all'>('all');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { leads, isLoading, deleteLead, deleteLeads, isDeleting } = useLeads({
    search: search || undefined,
    stage: stageFilter !== 'all' ? stageFilter : undefined,
    temperature: tempFilter !== 'all' ? tempFilter : undefined,
  });

  // Calculate paginated leads
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return leads.slice(startIndex, startIndex + pageSize);
  }, [leads, currentPage, pageSize]);

  const totalPages = Math.ceil(leads.length / pageSize);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (value: any) => void, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === paginatedLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(paginatedLeads.map(l => l.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(s => s !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedLeads.length > 0) {
      deleteLeads(selectedLeads);
      setSelectedLeads([]);
    }
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailsOpen(true);
  };

  const activeFiltersCount = (stageFilter !== 'all' ? 1 : 0) + (tempFilter !== 'all' ? 1 : 0);

  return (
    <DashboardLayout
      title="Leads"
      description="Gerencie todos os seus leads de prospecção"
      actions={
        <div className="flex items-center gap-2">
          <ImportExportLeads />
          <Button className="shadow-md">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Novo Lead</span>
          </Button>
        </div>
      }
    >
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex flex-col gap-4">
            {/* Search and Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, telefone ou nicho..."
                  className="pl-10 bg-background"
                  value={search}
                  onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <Select 
                  value={stageFilter} 
                  onValueChange={(v) => handleFilterChange(setStageFilter, v as LeadStage | 'all')}
                >
                  <SelectTrigger className="w-[140px] bg-background">
                    <SelectValue placeholder="Estágio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos estágios</SelectItem>
                    {allStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={tempFilter} 
                  onValueChange={(v) => handleFilterChange(setTempFilter, v as LeadTemperature | 'all')}
                >
                  <SelectTrigger className="w-[140px] bg-background">
                    <SelectValue placeholder="Temperatura" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas temps.</SelectItem>
                    {allTemperatures.map((temp) => (
                      <SelectItem key={temp} value={temp} className="capitalize">{temp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="h-9 px-3 flex items-center gap-1.5">
                    <Filter className="h-3 w-3" />
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedLeads.length > 0 && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-sm font-medium">
                  {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selecionado{selectedLeads.length > 1 ? 's' : ''}
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="ml-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir selecionados
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Carregando leads...</p>
              </div>
            </div>
          ) : leads.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum lead encontrado"
              description="Inicie uma prospecção ou adicione leads manualmente para começar"
              action={{
                label: "Capturar Leads",
                onClick: () => window.location.href = '/prospecting?tab=capture',
                icon: Plus,
              }}
              className="py-16"
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedLeads.length === paginatedLeads.length && paginatedLeads.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="font-semibold">Empresa</TableHead>
                      <TableHead className="font-semibold">Telefone</TableHead>
                      <TableHead className="font-semibold">Nicho</TableHead>
                      <TableHead className="font-semibold">Estágio</TableHead>
                      <TableHead className="font-semibold">Temp.</TableHead>
                      <TableHead className="font-semibold">Último Contato</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLeads.map((lead, index) => (
                      <TableRow 
                        key={lead.id} 
                        className="cursor-pointer transition-colors hover:bg-muted/50 group"
                        onClick={() => handleViewDetails(lead)}
                        style={{ animationDelay: `${index * 0.02}s` }}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedLeads.includes(lead.id)}
                            onCheckedChange={() => toggleSelect(lead.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{lead.business_name}</div>
                          {lead.location && (
                            <div className="text-xs text-muted-foreground mt-0.5">{lead.location}</div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{lead.phone}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-full font-normal">
                            {lead.niche || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${stageColors[lead.stage]} text-white shadow-sm`}>
                            {lead.stage}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {temperatureIcons[lead.temperature]}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {lead.last_contact_at
                            ? formatDistanceToNow(new Date(lead.last_contact_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })
                            : '-'}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(lead)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedLead(lead);
                                setDetailsOpen(true);
                              }}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Ver conversa
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => deleteLead(lead.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="border-t">
                <LeadsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={leads.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Lead Details Modal */}
      <LeadDetailsModal
        lead={selectedLead}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </DashboardLayout>
  );
}
