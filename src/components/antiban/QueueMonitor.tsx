import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  StopCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useAntiBan } from '@/hooks/use-antiban';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export function QueueMonitor() {
  const { user } = useAuth();
  const { queueStatus, startProcessing, cancelBatch, refetchStatus } = useAntiBan();
  const [isStarting, setIsStarting] = useState(false);

  // Fetch queue items
  const { data: queueItems, isLoading, refetch: refetchItems } = useQuery({
    queryKey: ['queue-items', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('whatsapp_queue')
        .select('*, leads(business_name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching queue:', error);
        return [];
      }

      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 5000,
  });

  const handleStartProcessing = async () => {
    setIsStarting(true);
    try {
      await startProcessing();
    } finally {
      setIsStarting(false);
    }
  };

  const handleRefresh = () => {
    refetchStatus();
    refetchItems();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Agendado</Badge>;
      case 'typing':
        return <Badge className="bg-accent text-accent-foreground">Digitando...</Badge>;
      case 'sending':
        return <Badge className="bg-primary text-primary-foreground">Enviando</Badge>;
      case 'sent':
        return <Badge className="bg-success text-success-foreground">Enviado</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = (queueStatus?.pending || 0) + (queueStatus?.scheduled || 0);
  const processingCount = (queueStatus?.typing || 0) + (queueStatus?.sending || 0);
  const total = queueStatus?.total || 0;
  const sentCount = queueStatus?.sent || 0;
  const progress = total > 0 ? ((sentCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Queue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{processingCount}</p>
              <p className="text-xs text-muted-foreground">Processando</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{sentCount}</p>
              <p className="text-xs text-muted-foreground">Enviados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{queueStatus?.failed || 0}</p>
              <p className="text-xs text-muted-foreground">Falharam</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {total > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button 
          onClick={handleStartProcessing} 
          disabled={isStarting || pendingCount === 0}
          className="flex-1"
        >
          {isStarting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Processar Fila
        </Button>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Queue Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Itens na Fila
          </CardTitle>
          <CardDescription>
            Últimas 100 mensagens na fila
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : queueItems?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Fila vazia</p>
              <p className="text-sm">Adicione leads ao envio em massa para preencher a fila</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {queueItems?.map((item: any) => (
                  <div 
                    key={item.id} 
                    className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {item.leads?.business_name || item.phone}
                        </p>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {item.processed_content || item.original_content}
                      </p>
                      {item.error_message && (
                        <p className="text-xs text-destructive mt-1">
                          {item.error_message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {item.status === 'sent' && (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      )}
                      {item.status === 'failed' && (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      {(item.status === 'typing' || item.status === 'sending') && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(item.created_at).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
