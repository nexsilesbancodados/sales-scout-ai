import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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

  return (
    <DashboardLayout
      title="Leads"
      description="Gerencie todos os seus leads de prospecção"
      actions={
        <div className="flex items-center gap-2">
          <ImportExportLeads />
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar leads..."
                className="pl-10"
                value={search}
                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              />
            </div>

            {/* Filters */}
            <Select 
              value={stageFilter} 
              onValueChange={(v) => handleFilterChange(setStageFilter, v as LeadStage | 'all')}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estágio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {allStages.map((stage) => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={tempFilter} 
              onValueChange={(v) => handleFilterChange(setTempFilter, v as LeadTemperature | 'all')}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Temperatura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {allTemperatures.map((temp) => (
                  <SelectItem key={temp} value={temp} className="capitalize">{temp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedLeads.length > 0 && (
            <div className="flex items-center gap-4 pt-4">
              <span className="text-sm text-muted-foreground">
                {selectedLeads.length} selecionado(s)
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhum lead encontrado</p>
              <p className="text-sm">Inicie uma prospecção ou adicione leads manualmente</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedLeads.length === paginatedLeads.length && paginatedLeads.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Nicho</TableHead>
                      <TableHead>Estágio</TableHead>
                      <TableHead>Temp.</TableHead>
                      <TableHead>Último Contato</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLeads.map((lead) => (
                      <TableRow 
                        key={lead.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewDetails(lead)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedLeads.includes(lead.id)}
                            onCheckedChange={() => toggleSelect(lead.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{lead.business_name}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{lead.niche || '-'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${stageColors[lead.stage]} text-white`}>
                            {lead.stage}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {temperatureIcons[lead.temperature]}
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
                              <Button variant="ghost" size="icon">
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
                                className="text-destructive"
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
