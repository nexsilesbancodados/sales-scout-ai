import { useState, useMemo } from 'react';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useProspectingHistory,
  ProspectingHistory,
  ProspectingHistoryLead,
} from '@/hooks/use-prospecting-history';
import {
  ProspectingHistoryFilters,
  HistoryFilters,
  DEFAULT_FILTERS,
} from './ProspectingHistoryFilters';
import { ProspectingMetricsDashboard } from './ProspectingMetricsDashboard';
import {
  History,
  Search,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Trash2,
  ChevronDown,
  ChevronRight,
  MapPin,
  Target,
  Eye,
  Upload,
  Globe,
  Rocket,
  RefreshCw,
  Copy,
  BarChart3,
  List,
  Play,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface ProspectingHistoryTabProps {
  onReprospect?: (niches: string[], locations: string[]) => void;
}

export function ProspectingHistoryTab({ onReprospect }: ProspectingHistoryTabProps) {
  const { toast } = useToast();
  const {
    history,
    isLoading,
    deleteSession,
    clearAllHistory,
    getSessionTypeLabel,
    getStatusLabel,
    stats,
  } = useProspectingHistory();

  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [selectedSession, setSelectedSession] = useState<ProspectingHistory | null>(null);
  const [filters, setFilters] = useState<HistoryFilters>(DEFAULT_FILTERS);
  const [activeView, setActiveView] = useState<'list' | 'metrics'>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Toggle selection of a session
  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all filtered sessions
  const selectAll = () => {
    const allIds = filteredHistory.map((s) => s.id);
    setSelectedIds(new Set(allIds));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Handle reprospectar action
  const handleReprospect = () => {
    const selectedSessions = filteredHistory.filter((s) => selectedIds.has(s.id));
    const niches = [...new Set(selectedSessions.map((s) => s.niche).filter(Boolean) as string[])];
    const locations = [...new Set(selectedSessions.map((s) => s.location).filter(Boolean) as string[])];

    if (niches.length === 0 && locations.length === 0) {
      toast({
        title: 'Dados insuficientes',
        description: 'As sessões selecionadas não possuem nichos ou localizações.',
        variant: 'destructive',
      });
      return;
    }

    if (onReprospect) {
      onReprospect(niches, locations);
      toast({
        title: '✓ Dados carregados',
        description: `${niches.length} nicho(s) e ${locations.length} local(is) enviados para a aba Maps.`,
      });
      clearSelection();
    } else {
      toast({
        title: 'Nichos e Locais selecionados',
        description: `${niches.join(', ')} em ${locations.join(', ')}`,
      });
    }
  };

  // Apply filters to history
  const filteredHistory = useMemo(() => {
    return history.filter((session) => {
      // Session type filter
      if (filters.sessionType !== 'all' && session.session_type !== filters.sessionType) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && session.status !== filters.status) {
        return false;
      }

      // Niche filter
      if (filters.niche && !session.niche?.toLowerCase().includes(filters.niche.toLowerCase())) {
        return false;
      }

      // Location filter
      if (filters.location && !session.location?.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // Date filters
      const sessionDate = new Date(session.created_at);
      
      if (filters.dateFrom && sessionDate < startOfDay(filters.dateFrom)) {
        return false;
      }
      
      if (filters.dateTo && sessionDate > endOfDay(filters.dateTo)) {
        return false;
      }

      return true;
    });
  }, [history, filters]);

  const toggleExpanded = (id: string) => {
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getSessionIcon = (type: ProspectingHistory['session_type']) => {
    const icons = {
      capture: Target,
      mass_send: Send,
      campaign: Rocket,
      import: Upload,
      web_search: Globe,
    };
    return icons[type] || Search;
  };

  const getStatusBadge = (status: ProspectingHistory['status']) => {
    const variants: Record<ProspectingHistory['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle2 }> = {
      running: { variant: 'default', icon: RefreshCw },
      completed: { variant: 'secondary', icon: CheckCircle2 },
      failed: { variant: 'destructive', icon: XCircle },
      cancelled: { variant: 'outline', icon: AlertCircle },
    };
    const { variant, icon: Icon } = variants[status];
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {getStatusLabel(status)}
      </Badge>
    );
  };

  const getLeadStatusIcon = (status: ProspectingHistoryLead['status']) => {
    const icons = {
      pending: <Clock className="h-4 w-4 text-muted-foreground" />,
      sent: <CheckCircle2 className="h-4 w-4 text-success" />,
      error: <XCircle className="h-4 w-4 text-destructive" />,
      duplicate: <Copy className="h-4 w-4 text-warning" />,
      saved: <CheckCircle2 className="h-4 w-4 text-info" />,
    };
    return icons[status];
  };

  const getLeadStatusLabel = (status: ProspectingHistoryLead['status']) => {
    const labels = {
      pending: 'Pendente',
      sent: 'Enviado',
      error: 'Erro',
      duplicate: 'Duplicado',
      saved: 'Salvo',
    };
    return labels[status];
  };

  // Export to CSV
  const handleExport = () => {
    if (filteredHistory.length === 0) {
      toast({
        title: 'Nenhum dado para exportar',
        description: 'Não há sessões no histórico para exportar.',
        variant: 'destructive',
      });
      return;
    }

    // Build CSV content
    const headers = [
      'ID',
      'Tipo',
      'Nicho',
      'Localização',
      'Status',
      'Leads Encontrados',
      'Leads Salvos',
      'Leads Enviados',
      'Erros',
      'Duplicados',
      'Data Início',
      'Data Conclusão',
    ];

    const rows = filteredHistory.map((session) => [
      session.id,
      getSessionTypeLabel(session.session_type),
      session.niche || '',
      session.location || '',
      getStatusLabel(session.status),
      session.total_found,
      session.total_saved,
      session.total_sent,
      session.total_errors,
      session.total_duplicates,
      format(new Date(session.started_at), 'dd/MM/yyyy HH:mm'),
      session.completed_at ? format(new Date(session.completed_at), 'dd/MM/yyyy HH:mm') : '',
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.join(';')),
    ].join('\n');

    // Download file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historico-prospeccao-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: '✓ Exportado com sucesso',
      description: `${filteredHistory.length} sessões exportadas para CSV.`,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <History className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
                <p className="text-sm text-muted-foreground">Sessões</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-info/10">
                <Search className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalLeadsFound}</p>
                <p className="text-sm text-muted-foreground">Leads Encontrados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-success/10">
                <Send className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalLeadsSent}</p>
                <p className="text-sm text-muted-foreground">Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalErrors}</p>
                <p className="text-sm text-muted-foreground">Erros</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'list' | 'metrics')} className="w-auto">
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Métricas
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <ProspectingHistoryFilters
          filters={filters}
          onFiltersChange={setFilters}
          history={history}
          onExport={handleExport}
        />
      </div>

      {/* Metrics Dashboard */}
      {activeView === 'metrics' && (
        <ProspectingMetricsDashboard history={filteredHistory} />
      )}

      {/* History List */}
      {activeView === 'list' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Histórico de Prospecção
                    {filteredHistory.length !== history.length && (
                      <Badge variant="secondary">
                        {filteredHistory.length} de {history.length}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Todas as sessões de captura e envio de leads
                  </CardDescription>
                </div>
                {history.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpar Tudo
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Limpar todo o histórico?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Todo o histórico de prospecção será excluído permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => clearAllHistory()}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Limpar Tudo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              {/* Selection Actions Bar */}
              {filteredHistory.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectedIds.size === filteredHistory.length ? clearSelection : selectAll}
                    className="gap-2"
                  >
                    {selectedIds.size === filteredHistory.length ? (
                      <>
                        <Square className="h-4 w-4" />
                        Desmarcar Todos
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4" />
                        Selecionar Todos ({filteredHistory.length})
                      </>
                    )}
                  </Button>

                  {selectedIds.size > 0 && (
                    <>
                      <Badge variant="secondary" className="px-3 py-1">
                        {selectedIds.size} selecionado{selectedIds.size > 1 ? 's' : ''}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={handleReprospect}
                        className="gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Reprospectar Selecionados
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {history.length === 0 ? 'Nenhum histórico' : 'Nenhum resultado'}
                </h3>
                <p className="text-muted-foreground">
                  {history.length === 0
                    ? 'As sessões de prospecção aparecerão aqui automaticamente.'
                    : 'Ajuste os filtros para ver mais resultados.'}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {filteredHistory.map((session) => {
                    const Icon = getSessionIcon(session.session_type);
                    const isExpanded = expandedSessions.has(session.id);

                    return (
                      <Collapsible
                        key={session.id}
                        open={isExpanded}
                        onOpenChange={() => toggleExpanded(session.id)}
                      >
                        <div className="border rounded-lg overflow-hidden">
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                              <div className="flex items-center gap-4">
                                <Checkbox
                                  checked={selectedIds.has(session.id)}
                                  onClick={(e) => toggleSelection(session.id, e)}
                                  className="data-[state=checked]:bg-primary"
                                />
                                <div className="p-2 rounded-lg bg-muted">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {getSessionTypeLabel(session.session_type)}
                                    </span>
                                    {getStatusBadge(session.status)}
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                    {session.niche && (
                                      <span className="flex items-center gap-1">
                                        <Target className="h-3 w-3" />
                                        {session.niche}
                                      </span>
                                    )}
                                    {session.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {session.location}
                                      </span>
                                    )}
                                    <span>
                                      {format(new Date(session.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 text-sm">
                                  <span className="flex items-center gap-1 text-info">
                                    <Search className="h-3.5 w-3.5" />
                                    {session.total_found}
                                  </span>
                                  <span className="flex items-center gap-1 text-success">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {session.total_sent}
                                  </span>
                                  {session.total_errors > 0 && (
                                    <span className="flex items-center gap-1 text-destructive">
                                      <XCircle className="h-3.5 w-3.5" />
                                      {session.total_errors}
                                    </span>
                                  )}
                                  {session.total_duplicates > 0 && (
                                    <span className="flex items-center gap-1 text-warning">
                                      <Copy className="h-3.5 w-3.5" />
                                      {session.total_duplicates}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSession(session);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteSession(session.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Excluir
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="border-t bg-muted/30 p-4">
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Encontrados</p>
                                  <p className="font-medium">{session.total_found}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Salvos</p>
                                  <p className="font-medium">{session.total_saved}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Enviados</p>
                                  <p className="font-medium text-success">{session.total_sent}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Duplicados</p>
                                  <p className="font-medium text-warning">{session.total_duplicates}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Erros</p>
                                  <p className="font-medium text-destructive">{session.total_errors}</p>
                                </div>
                              </div>
                              {session.error_message && (
                                <div className="mt-4 p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                                  <strong>Erro:</strong> {session.error_message}
                                </div>
                              )}
                              {session.leads_data && session.leads_data.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-sm font-medium mb-2">
                                    Primeiros 5 leads:
                                  </p>
                                  <div className="space-y-1">
                                    {session.leads_data.slice(0, 5).map((lead, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between p-2 bg-background rounded text-sm"
                                      >
                                        <div className="flex items-center gap-2">
                                          {getLeadStatusIcon(lead.status)}
                                          <span>{lead.business_name}</span>
                                        </div>
                                        <span className="text-muted-foreground">{lead.phone}</span>
                                      </div>
                                    ))}
                                    {session.leads_data.length > 5 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full mt-2"
                                        onClick={() => setSelectedSession(session)}
                                      >
                                        Ver todos os {session.leads_data.length} leads
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* Session Details Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedSession && (
                <>
                  {(() => {
                    const Icon = getSessionIcon(selectedSession.session_type);
                    return <Icon className="h-5 w-5" />;
                  })()}
                  {getSessionTypeLabel(selectedSession?.session_type || 'capture')}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedSession && (
                <span className="flex items-center gap-3">
                  {selectedSession.niche && <span>Nicho: {selectedSession.niche}</span>}
                  {selectedSession.location && <span>• Local: {selectedSession.location}</span>}
                  <span>
                    • {format(new Date(selectedSession.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <ScrollArea className="max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSession.leads_data.map((lead, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLeadStatusIcon(lead.status)}
                          <span className="text-sm">{getLeadStatusLabel(lead.status)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{lead.business_name}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>
                        {lead.error_message && (
                          <span className="text-sm text-destructive">{lead.error_message}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
