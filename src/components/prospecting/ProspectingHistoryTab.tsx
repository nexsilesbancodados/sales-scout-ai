import { useState } from 'react';
import { format } from 'date-fns';
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
import {
  useProspectingHistory,
  ProspectingHistory,
  ProspectingHistoryLead,
} from '@/hooks/use-prospecting-history';
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
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function ProspectingHistoryTab() {
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

      {/* History List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Prospecção
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
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum histórico</h3>
              <p className="text-muted-foreground">
                As sessões de prospecção aparecerão aqui automaticamente.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {history.map((session) => {
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
