import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useBackgroundJobs, BackgroundJob } from '@/hooks/use-background-jobs';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Sparkles,
  Pause,
  Play,
  X,
  Check,
  AlertCircle,
  Clock,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export function BackgroundJobsMonitor() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    jobs,
    activeJobs,
    isLoading,
    refetch,
    pauseJob,
    resumeJob,
    cancelJob,
    getJobProgress,
    getJobStatusLabel,
    getJobTypeLabel,
  } = useBackgroundJobs({ enabled: isOpen, live: isOpen });

  const getStatusIcon = (status: BackgroundJob['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-warning" />;
      case 'completed':
        return <Check className="h-4 w-4 text-success" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: BackgroundJob['status']) => {
    switch (status) {
      case 'running':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'paused':
        return 'outline';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative h-8 gap-1.5 rounded-lg border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-all"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Tarefas</span>
          {isOpen && activeJobs.length > 0 && (
            <Badge
              variant="default"
              className="absolute -top-1.5 -right-1.5 h-4 min-w-4 p-0 flex items-center justify-center text-[10px] font-bold"
            >
              {activeJobs.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Tarefas em Segundo Plano
              </SheetTitle>
              <SheetDescription>
                Acompanhe o progresso das tarefas em execução
              </SheetDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6">
          {activeJobs.length > 0 && (
            <Card className="mb-4 border-primary/20 bg-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="font-medium">
                    {activeJobs.length} tarefa{activeJobs.length > 1 ? 's' : ''} ativa{activeJobs.length > 1 ? 's' : ''}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <ScrollArea className="h-[calc(100vh-220px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma tarefa registrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <span className="font-medium text-sm">{getJobTypeLabel(job.job_type)}</span>
                        </div>
                        <Badge variant={getStatusBadgeVariant(job.status)}>
                          {getJobStatusLabel(job.status)}
                        </Badge>
                      </div>

                      {(job.status === 'running' || job.status === 'paused') && (
                        <div className="space-y-2 my-3">
                          <Progress value={getJobProgress(job)} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              {job.processed_items} de {job.total_items} processados
                            </span>
                            <span>{getJobProgress(job)}%</span>
                          </div>
                          {job.failed_items > 0 && (
                            <span className="text-xs text-destructive">
                              {job.failed_items} falha{job.failed_items > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      )}

                      {job.status === 'completed' && job.result && (
                        <div className="text-xs text-muted-foreground my-2">
                          ✓ {job.result.processed} processados
                          {job.result.failed > 0 && ` • ${job.result.failed} falhas`}
                        </div>
                      )}

                      {job.status === 'failed' && job.error_message && (
                        <p className="text-xs text-destructive my-2">{job.error_message}</p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">
                          {job.completed_at
                            ? `Concluído ${formatDistanceToNow(new Date(job.completed_at), { addSuffix: true, locale: ptBR })}`
                            : job.started_at
                              ? `Iniciado ${formatDistanceToNow(new Date(job.started_at), { addSuffix: true, locale: ptBR })}`
                              : `Criado ${formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: ptBR })}`}
                        </span>

                        <div className="flex gap-1">
                          {job.status === 'running' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => pauseJob(job.id)}
                            >
                              <Pause className="h-3 w-3" />
                            </Button>
                          )}
                          {job.status === 'paused' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => resumeJob(job.id)}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          {(job.status === 'running' || job.status === 'pending' || job.status === 'paused') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => cancelJob(job.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
