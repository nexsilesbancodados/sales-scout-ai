import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
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
  Heart,
  Clock,
  Gauge,
} from 'lucide-react';
import { useAntiBan } from '@/hooks/use-antiban';
import { AntiBanConfigPanel } from './AntiBanConfigPanel';
import { SpintaxManager } from './SpintaxManager';
import { QueueMonitor } from './QueueMonitor';
import { HealthHistoryChart } from './HealthHistoryChart';
import { cn } from '@/lib/utils';

const healthConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Heart; ring: string }> = {
  healthy: { label: 'Saudável', color: 'text-success', bg: 'bg-success/10', icon: Heart, ring: 'ring-success/30' },
  warning: { label: 'Atenção', color: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle, ring: 'ring-warning/30' },
  critical: { label: 'Crítico', color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle, ring: 'ring-destructive/30' },
  banned: { label: 'Banido', color: 'text-destructive', bg: 'bg-destructive/10', icon: Shield, ring: 'ring-destructive/30' },
};

const defaultHealth = { label: 'Desconhecido', color: 'text-muted-foreground', bg: 'bg-muted/50', icon: Gauge, ring: 'ring-border' };

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
  const safeCurrentLimit = currentLimit > 0 ? currentLimit : 1;
  const safeHourlyLimit = config?.hourly_limit && config.hourly_limit > 0 ? config.hourly_limit : 1;
  const dailyProgress = config ? Math.min(((config.messages_sent_today || 0) / safeCurrentLimit) * 100, 100) : 0;
  const hourlyProgress = config ? Math.min(((config.messages_sent_hour || 0) / safeHourlyLimit) * 100, 100) : 0;

  const health = healthConfig[config?.chip_health || ''] || defaultHealth;
  const HealthIcon = health.icon;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Chip Health - Premium */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={cn("border-border/40 overflow-hidden relative", health.ring, "ring-1")}>
            <div className={cn("absolute inset-0 opacity-30", health.bg)} />
            <CardContent className="pt-5 pb-5 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider mb-1.5">Saúde do Chip</p>
                  <Badge className={cn("text-xs font-semibold", health.bg, health.color, "border-0")}>
                    {health.label}
                  </Badge>
                </div>
                <div className={cn("p-2.5 rounded-xl", health.bg)}>
                  <HealthIcon className={cn("h-5 w-5", health.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Card className="border-border/40">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Hoje</p>
                <span className="text-xs font-bold tabular-nums">
                  {config?.messages_sent_today || 0}<span className="text-muted-foreground/40">/{currentLimit}</span>
                </span>
              </div>
              <Progress value={dailyProgress} className="h-2 mb-1.5" />
              <p className="text-[10px] text-muted-foreground/50">
                {Math.round(100 - dailyProgress)}% disponível
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hourly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-border/40">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Esta hora</p>
                <span className="text-xs font-bold tabular-nums">
                  {config?.messages_sent_hour || 0}<span className="text-muted-foreground/40">/{config?.hourly_limit || 30}</span>
                </span>
              </div>
              <Progress 
                value={hourlyProgress} 
                className={cn("h-2", hourlyProgress > 80 && "[&>div]:bg-warning")} 
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Warmup Status */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card className="border-border/40">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider mb-1">Aquecimento</p>
                  <p className="text-xl font-bold tabular-nums">
                    {config?.warmup_enabled ? `Dia ${config.warmup_day}` : 'Off'}
                  </p>
                </div>
                {config?.warmup_enabled ? (
                  <div className="p-2.5 rounded-xl bg-warning/10">
                    <Flame className="h-5 w-5 text-warning" />
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={startWarmup} className="h-8 text-xs rounded-lg">
                    <Play className="h-3 w-3 mr-1" />
                    Iniciar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Queue Status Quick View */}
      {queueStatus && queueStatus.total > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Activity className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Fila Ativa</p>
                    <p className="text-xs text-muted-foreground">
                      {queueStatus.pending || 0} pendentes · {queueStatus.sending || 0} enviando · {queueStatus.sent || 0} enviados
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {queueStatus.total} total
                  </Badge>
                  <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg" onClick={() => setActiveTab('queue')}>
                    Ver Fila
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-muted/40 p-1 rounded-xl h-auto">
          {[
            { value: 'overview', icon: Activity, label: 'Visão Geral' },
            { value: 'queue', icon: MessageSquare, label: 'Fila' },
            { value: 'spintax', icon: Zap, label: 'Variações' },
            { value: 'settings', icon: Settings, label: 'Config' },
          ].map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 text-xs py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Health History Chart */}
            <Card className="border-border/40">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/8">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Histórico de Saúde</CardTitle>
                    <CardDescription className="text-[10px]">Últimas 24 horas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <HealthHistoryChart data={healthHistory || []} />
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card className="border-border/40">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-warning/8">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Análise de Risco</CardTitle>
                    <CardDescription className="text-[10px]">Fatores que podem causar bloqueio</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
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
                  <div className="p-3 rounded-xl bg-warning/8 border border-warning/20">
                    <div className="flex items-start gap-2.5">
                      <Flame className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-warning">Período de Aquecimento</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Mantenha o volume baixo por mais {7 - config.warmup_day} dias
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Safety score */}
                <div className="pt-2 border-t border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Score de Segurança</span>
                    <span className={cn(
                      "text-sm font-bold tabular-nums",
                      dailyProgress < 50 ? 'text-success' : dailyProgress < 80 ? 'text-warning' : 'text-destructive'
                    )}>
                      {Math.round(100 - (dailyProgress * 0.5 + hourlyProgress * 0.5))}%
                    </span>
                  </div>
                  <Progress 
                    value={100 - (dailyProgress * 0.5 + hourlyProgress * 0.5)} 
                    className="h-2" 
                  />
                </div>
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
    safe: { text: 'text-success', bg: 'bg-success/10' },
    warning: { text: 'text-warning', bg: 'bg-warning/10' },
    danger: { text: 'text-destructive', bg: 'bg-destructive/10' },
  };

  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/20">
      <div className="flex items-center gap-2.5">
        <div className={cn("p-1 rounded-md", colors[status].bg)}>
          {status === 'safe' && <CheckCircle2 className={cn("h-3.5 w-3.5", colors.safe.text)} />}
          {status === 'warning' && <AlertTriangle className={cn("h-3.5 w-3.5", colors.warning.text)} />}
          {status === 'danger' && <AlertTriangle className={cn("h-3.5 w-3.5", colors.danger.text)} />}
        </div>
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className={cn("text-xs font-bold tabular-nums", colors[status].text)}>
        {inverted ? `${current}s` : `${current}/${limit}`}
      </span>
    </div>
  );
}
