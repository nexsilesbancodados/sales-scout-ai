import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Send,
  Clock,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function LeadsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<LeadStage | 'all'>('all');
  const [tempFilter, setTempFilter] = useState<LeadTemperature | 'all'>('all');
  const [messageSentFilter, setMessageSentFilter] = useState<'all' | 'sent' | 'pending'>('all');
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
    messageSent: messageSentFilter === 'all' ? undefined : messageSentFilter === 'sent',
  });

  // Get counts for all/sent/pending (without other filters for accurate counts)
  const { leads: allLeadsForCounts } = useLeads({});
  const totalCount = allLeadsForCounts?.length || 0;
  const sentCount = useMemo(() => allLeadsForCounts?.filter(l => l.message_sent).length || 0, [allLeadsForCounts]);
  const pendingCount = useMemo(() => allLeadsForCounts?.filter(l => !l.message_sent).length || 0, [allLeadsForCounts]);

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

  const activeFiltersCount = (stageFilter !== 'all' ? 1 : 0) + (tempFilter !== 'all' ? 1 : 0) + (messageSentFilter !== 'all' ? 1 : 0);

  // Get selected leads data
  const selectedLeadsData = useMemo(() => {
    return leads.filter(l => selectedLeads.includes(l.id));
  }, [leads, selectedLeads]);

  // Check if selected leads are pending or sent
  const selectedPendingLeads = selectedLeadsData.filter(l => !l.message_sent);
  const selectedSentLeads = selectedLeadsData.filter(l => l.message_sent);

  // Handler to send messages to pending leads
  const handleSendToPending = () => {
    if (selectedPendingLeads.length === 0) return;
    
    // Store selected leads in sessionStorage and navigate to mass send
    sessionStorage.setItem('mass_send_leads', JSON.stringify(selectedPendingLeads));
    navigate('/prospecting?tab=mass-send&source=leads');
  };

  // Handler for remarketing (re-send to already contacted leads)
  const handleRemarketing = () => {
    if (selectedSentLeads.length === 0) return;
    
    // Store selected leads in sessionStorage and navigate to mass send with remarketing flag
    sessionStorage.setItem('mass_send_leads', JSON.stringify(selectedSentLeads));
    sessionStorage.setItem('mass_send_remarketing', 'true');
    navigate('/prospecting?tab=mass-send&source=remarketing');
  };

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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Leads</p>
              <p className="text-2xl font-bold">{totalCount}</p>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        
        <Card 
          className={`p-4 cursor-pointer transition-all hover:shadow-md ${
            messageSentFilter === 'pending' ? 'ring-2 ring-amber-500' : ''
          } bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20`}
          onClick={() => handleFilterChange(setMessageSentFilter, messageSentFilter === 'pending' ? 'all' : 'pending')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Aguardando Envio</p>
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            </div>
            <div className="p-3 rounded-full bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </Card>
        
        <Card 
          className={`p-4 cursor-pointer transition-all hover:shadow-md ${
            messageSentFilter === 'sent' ? 'ring-2 ring-green-500' : ''
          } bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20`}
          onClick={() => handleFilterChange(setMessageSentFilter, messageSentFilter === 'sent' ? 'all' : 'sent')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Já Contatados</p>
              <p className="text-2xl font-bold text-green-600">{sentCount}</p>
            </div>
            <div className="p-3 rounded-full bg-green-500/10">
              <Send className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

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

                <Select 
                  value={messageSentFilter} 
                  onValueChange={(v) => handleFilterChange(setMessageSentFilter, v as 'all' | 'sent' | 'pending')}
                >
                  <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="Status Envio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span>Todos</span>
                        <Badge variant="secondary" className="ml-2 text-xs">{totalCount}</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="sent">
                      <div className="flex items-center gap-2">
                        <Send className="h-3 w-3 text-green-500" />
                        <span>Enviados</span>
                        <Badge className="ml-2 bg-green-500 text-white text-xs">{sentCount}</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-amber-500" />
                        <span>Pendentes</span>
                        <Badge variant="outline" className="ml-2 text-amber-600 border-amber-300 text-xs">{pendingCount}</Badge>
                      </div>
                    </SelectItem>
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
              <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-sm font-medium">
                  {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selecionado{selectedLeads.length > 1 ? 's' : ''}
                </span>
                
                <div className="flex items-center gap-2 ml-auto">
                  {/* Send to Pending Leads */}
                  {selectedPendingLeads.length > 0 && (
                    <Button
                      size="sm"
                      onClick={handleSendToPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar ({selectedPendingLeads.length})
                    </Button>
                  )}

                  {/* Remarketing for Sent Leads */}
                  {selectedSentLeads.length > 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleRemarketing}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Remarketing ({selectedSentLeads.length})
                    </Button>
                  )}

                  {/* Delete Selected */}
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
              </div>
            )}

            {/* Quick Action Buttons for filtered views */}
            {selectedLeads.length === 0 && messageSentFilter !== 'all' && leads.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                {messageSentFilter === 'pending' && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">{leads.length} leads aguardando envio</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedLeads(paginatedLeads.map(l => l.id));
                      }}
                      variant="outline"
                      className="ml-auto"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Selecionar Todos para Enviar
                    </Button>
                  </>
                )}
                {messageSentFilter === 'sent' && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <Send className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{leads.length} leads já contatados</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedLeads(paginatedLeads.map(l => l.id));
                      }}
                      variant="outline"
                      className="ml-auto"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Selecionar Todos para Remarketing
                    </Button>
                  </>
                )}
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
                      <TableHead className="font-semibold">Status</TableHead>
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
                          {lead.message_sent ? (
                            <Badge className="bg-green-500 text-white shadow-sm">
                              <Send className="h-3 w-3 mr-1" />
                              Enviado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                              <Clock className="h-3 w-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
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
