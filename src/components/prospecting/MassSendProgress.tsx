import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Pause, 
  Play, 
  Square, 
  SkipForward, 
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  Phone,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { useMassSendJob, MassSendLead } from '@/hooks/use-mass-send-job';
import { cn } from '@/lib/utils';

export function MassSendProgress() {
  const {
    activeJob,
    isLoading,
    pauseJob,
    resumeJob,
    cancelJob,
    skipToNext,
    isPausing,
    isResuming,
    isCancelling,
    isSkipping,
    countdown,
    currentLead,
    getJobLeads,
    getProgress,
    formatCountdown,
    refetch,
  } = useMassSendJob();

  const [showAllLeads, setShowAllLeads] = useState(false);

  // Auto-refetch when job is running
  useEffect(() => {
    if (activeJob?.status === 'running') {
      const interval = setInterval(refetch, 2000);
      return () => clearInterval(interval);
    }
  }, [activeJob?.status, refetch]);

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!activeJob) {
    return null;
  }

  const leads = getJobLeads();
  const progress = getProgress();
  const currentIndex = activeJob.current_index || 0;
  const isRunning = activeJob.status === 'running';
  const isPaused = activeJob.status === 'paused';

  const getLeadStatusIcon = (lead: MassSendLead, index: number) => {
    if (index === currentIndex && isRunning) {
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    }
    switch (lead.status) {
      case 'sent':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'sending':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'skipped':
        return <SkipForward className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLeadStatusBadge = (lead: MassSendLead, index: number) => {
    if (index === currentIndex && isRunning) {
      return <Badge variant="outline" className="animate-pulse">Enviando...</Badge>;
    }
    switch (lead.status) {
      case 'sent':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Enviado</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'sending':
        return <Badge variant="outline" className="animate-pulse">Enviando...</Badge>;
      case 'skipped':
        return <Badge variant="secondary">Pulado</Badge>;
      default:
        return <Badge variant="outline">Aguardando</Badge>;
    }
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-primary" />
            Disparo em Andamento
            {isRunning && (
              <Badge className="animate-pulse bg-green-500">Executando</Badge>
            )}
            {isPaused && (
              <Badge variant="secondary">Pausado</Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">
              {activeJob.processed_items} / {activeJob.total_items} ({progress}%)
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="text-emerald-600">✓ {activeJob.processed_items - activeJob.failed_items} enviados</span>
            {activeJob.failed_items > 0 && (
              <span className="text-destructive">✗ {activeJob.failed_items} falharam</span>
            )}
            <span>{activeJob.total_items - activeJob.processed_items} restantes</span>
          </div>
        </div>

        {/* Current lead and countdown */}
        {currentLead && isRunning && (
          <div className="bg-background rounded-lg p-4 border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Enviando para:</span>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-mono text-lg font-bold text-primary">
                  {formatCountdown(countdown)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{currentLead.business_name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {currentLead.phone}
                </p>
              </div>
            </div>

            {/* Skip button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => skipToNext(activeJob.id)}
              disabled={isSkipping}
            >
              {isSkipping ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <SkipForward className="h-4 w-4 mr-2" />
              )}
              Adiantar Próximo Envio
            </Button>
          </div>
        )}

        {/* Control buttons */}
        <div className="flex gap-2">
          {isRunning ? (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => pauseJob(activeJob.id)}
              disabled={isPausing}
            >
              {isPausing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Pause className="h-4 w-4 mr-2" />
              )}
              Pausar
            </Button>
          ) : isPaused ? (
            <Button
              variant="default"
              className="flex-1"
              onClick={() => resumeJob(activeJob.id)}
              disabled={isResuming}
            >
              {isResuming ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Retomar
            </Button>
          ) : null}

          <Button
            variant="destructive"
            onClick={() => cancelJob(activeJob.id)}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Leads list */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setShowAllLeads(!showAllLeads)}
          >
            {showAllLeads ? 'Ocultar lista de leads' : 'Ver lista de leads'}
          </Button>

          {showAllLeads && (
            <ScrollArea className="h-[300px] border rounded-lg">
              <div className="p-2 space-y-1">
                {leads.map((lead, index) => (
                  <div
                    key={lead.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg transition-colors",
                      index === currentIndex && isRunning && "bg-primary/10 border border-primary/30",
                      lead.status === 'sent' && "bg-emerald-500/5",
                      lead.status === 'failed' && "bg-destructive/5"
                    )}
                  >
                    <span className="text-xs text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    {getLeadStatusIcon(lead, index)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lead.business_name}</p>
                      <p className="text-xs text-muted-foreground">{lead.phone}</p>
                    </div>
                    {getLeadStatusBadge(lead, index)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Info about persistence */}
        <p className="text-xs text-muted-foreground text-center">
          💡 O disparo continua mesmo se você fechar ou recarregar a página
        </p>
      </CardContent>
    </Card>
  );
}
