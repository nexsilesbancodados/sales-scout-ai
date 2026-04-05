import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Activity, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2,
  Flame,
  Play,
  Settings,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAntiBan } from '@/hooks/use-antiban';
import { AntiBanConfigPanel } from './AntiBanConfigPanel';
import { SpintaxManager } from './SpintaxManager';
import { QueueMonitor } from './QueueMonitor';
import { HealthHistoryChart } from './HealthHistoryChart';
import { cn } from '@/lib/utils';

export function AntiBanDashboard() {
  const { 
    config, 
    queueStatus, 
    healthHistory,
    calculateCurrentLimit,
    startWarmup,
  } = useAntiBan();
  
  const [activeTab, setActiveTab] = useState('overview');

  const currentLimit = calculateCurrentLimit();
  const dailyProgress = config && currentLimit > 0 ? Math.min((config.messages_sent_today / currentLimit) * 100, 100) : 0;
  const hourlyProgress = config && config.hourly_limit > 0 ? Math.min((config.messages_sent_hour / config.hourly_limit) * 100, 100) : 0;

  const getHealthStyles = (health: string) => {
    switch (health) {
      case 'healthy': return { bg: 'bg-success', text: 'text-success' };
      case 'warning': return { bg: 'bg-warning', text: 'text-warning' };
      case 'critical': return { bg: 'bg-destructive', text: 'text-destructive' };
      case 'banned': return { bg: 'bg-destructive', text: 'text-destructive' };
      default: return { bg: 'bg-muted', text: 'text-muted-foreground' };
    }
  };

  const getHealthLabel = (health: string) => {
    switch (health) {
      case 'healthy': return 'Saudável';
      case 'warning': return 'Atenção';
      case 'critical': return 'Crítico';
      case 'banned': return 'Banido';
      default: return 'Desconhecido';
    }
  };

  const healthStyles = getHealthStyles(config?.chip_health || 'unknown');

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Chip Health */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saúde do Chip</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={healthStyles.bg}>
                    {getHealthLabel(config?.chip_health || 'unknown')}
                  </Badge>
                </div>
              </div>
              <Shield className={cn("h-8 w-8", healthStyles.text)} />
            </div>
          </CardContent>
        </Card>

        {/* Daily Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Hoje</p>
                <span className="text-sm font-medium">
                  {config?.messages_sent_today || 0}/{currentLimit}
                </span>
              </div>
              <Progress value={dailyProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {Math.round(100 - dailyProgress)}% disponível
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Esta hora</p>
                <span className="text-sm font-medium">
                  {config?.messages_sent_hour || 0}/{config?.hourly_limit || 30}
                </span>
              </div>
              <Progress value={hourlyProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Warmup Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aquecimento</p>
                <p className="text-2xl font-bold">
                  {config?.warmup_enabled ? `Dia ${config.warmup_day}` : 'Desativado'}
                </p>
              </div>
              {config?.warmup_enabled ? (
                <Flame className="h-8 w-8 text-warning" />
              ) : (
                <Button variant="outline" size="sm" onClick={startWarmup}>
                  <Play className="h-4 w-4 mr-1" />
                  Iniciar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Status Quick View */}
      {queueStatus && queueStatus.total > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Activity className="h-5 w-5 text-primary animate-pulse" />
                <div>
                  <p className="font-medium">Fila Ativa</p>
                  <p className="text-sm text-muted-foreground">
                    {queueStatus.pending || 0} pendentes · {queueStatus.sending || 0} enviando · {queueStatus.sent || 0} enviados
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {queueStatus.total} total
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('queue')}>
                  Ver Fila
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Fila
          </TabsTrigger>
          <TabsTrigger value="spintax" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Variações
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health History Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Histórico de Saúde
                </CardTitle>
                <CardDescription>
                  Últimas 24 horas de atividade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HealthHistoryChart data={healthHistory || []} />
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Análise de Risco
                </CardTitle>
                <CardDescription>
                  Fatores que podem causar bloqueio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RiskFactorItem 
                  label="Volume por hora" 
                  current={config?.messages_sent_hour || 0}
                  limit={config?.hourly_limit || 30}
                  thresholds={{ safe: 0.5, warning: 0.7 }}
                />
                <RiskFactorItem 
                  label="Volume diário" 
                  current={config?.messages_sent_today || 0}
                  limit={currentLimit}
                  thresholds={{ safe: 0.6, warning: 0.8 }}
                />
                <RiskFactorItem 
                  label="Intervalo entre mensagens" 
                  current={config?.min_delay_seconds || 30}
                  limit={60}
                  thresholds={{ safe: 1, warning: 0.5 }}
                  inverted
                />
                
                {config?.warmup_enabled && config?.warmup_day < 7 && (
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                    <div className="flex items-start gap-2">
                      <Flame className="h-4 w-4 text-warning mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-warning">Período de Aquecimento</p>
                        <p className="text-xs text-muted-foreground">
                          Mantenha o volume baixo por mais {7 - config.warmup_day} dias
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queue" className="mt-6">
          <QueueMonitor />
        </TabsContent>

        <TabsContent value="spintax" className="mt-6">
          <SpintaxManager />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <AntiBanConfigPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Risk Factor Component
function RiskFactorItem({ 
  label, 
  current, 
  limit, 
  thresholds,
  inverted = false,
}: { 
  label: string; 
  current: number; 
  limit: number;
  thresholds: { safe: number; warning: number };
  inverted?: boolean;
}) {
  const ratio = limit > 0 ? current / limit : 0;
  const effectiveRatio = inverted ? (1 - ratio) : ratio;
  
  let status: 'safe' | 'warning' | 'danger' = 'safe';
  if (effectiveRatio > thresholds.warning) status = 'danger';
  else if (effectiveRatio > thresholds.safe) status = 'warning';

  const colors = {
    safe: 'text-success',
    warning: 'text-warning',
    danger: 'text-destructive',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {status === 'safe' && <CheckCircle2 className={cn("h-4 w-4", colors.safe)} />}
        {status === 'warning' && <AlertTriangle className={cn("h-4 w-4", colors.warning)} />}
        {status === 'danger' && <AlertTriangle className={cn("h-4 w-4", colors.danger)} />}
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("text-sm font-medium", colors[status])}>
          {inverted ? `${current}s` : `${current}/${limit}`}
        </span>
      </div>
    </div>
  );
}
