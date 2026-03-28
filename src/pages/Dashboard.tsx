import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics';
import { useActivityLog } from '@/hooks/use-activity-log';
import { useUserSettings } from '@/hooks/use-user-settings';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import {
  Users, Calendar, TrendingUp, Flame, ThermometerSun, Snowflake,
  MessageSquare, Target, Clock, Zap, Activity, ArrowRight,
  CheckCircle2, AlertCircle, Send, BarChart3, Sparkles, ArrowUpRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const activityIcons: Record<string, React.ReactNode> = {
  lead_created: <Users className="h-4 w-4" />,
  message_sent: <MessageSquare className="h-4 w-4" />,
  meeting_scheduled: <Calendar className="h-4 w-4" />,
  lead_qualified: <Target className="h-4 w-4" />,
};

const activityColors: Record<string, string> = {
  lead_created: 'bg-info/10 text-info',
  message_sent: 'bg-primary/10 text-primary',
  meeting_scheduled: 'bg-success/10 text-success',
  lead_qualified: 'bg-warning/10 text-warning',
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: React.ReactNode;
  color: string;
  delay?: number;
}

function StatCard({ icon, label, value, subtitle, trend, color, delay = 0 }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden group card-hover animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("p-2 rounded-lg", color)}>
            {icon}
          </div>
          {trend}
        </div>
        <p className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-[13px] text-muted-foreground mt-0.5">{label}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { activities, isLoading: activitiesLoading } = useActivityLog(8);
  const { settings } = useUserSettings();

  const funnelStages = useMemo(() => {
    return Object.entries(metrics?.leadsByStage || {});
  }, [metrics?.leadsByStage]);

  const totalFunnelLeads = funnelStages.reduce((acc, [, count]) => acc + count, 0);

  if (metricsLoading && !metrics) {
    return (
      <DashboardLayout title="Dashboard" description="Visão geral">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-8 w-8 rounded-lg mb-3" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" description="Visão geral da sua prospecção">
      <OnboardingWizard />

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          icon={<Users className="h-4 w-4 text-primary" />}
          label="Total de Leads"
          value={metrics?.totalLeads || 0}
          trend={
            <Badge variant="secondary" className="text-[11px] font-medium bg-primary/10 text-primary border-0">
              +{metrics?.leadsThisMonth || 0} mês
            </Badge>
          }
          color="bg-primary/10"
          delay={0}
        />
        <StatCard
          icon={<Calendar className="h-4 w-4 text-info" />}
          label="Reuniões"
          value={metrics?.meetingsScheduled || 0}
          trend={
            <Badge variant="secondary" className="text-[11px] font-medium bg-info/10 text-info border-0">
              {metrics?.meetingsThisWeek || 0} semana
            </Badge>
          }
          color="bg-info/10"
          delay={50}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4 text-success" />}
          label="Taxa de Conversão"
          value={`${(metrics?.conversionRate || 0).toFixed(1)}%`}
          color="bg-success/10"
          delay={100}
        />
        <Card className="animate-slide-up overflow-hidden" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-5">
            <p className="text-[13px] font-medium text-muted-foreground mb-3">Temperatura dos Leads</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-temp-hot text-sm">
                <Flame className="h-3.5 w-3.5 text-temp-hot" />
                <span className="font-bold text-temp-hot">{metrics?.hotLeads || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-temp-warm text-sm">
                <ThermometerSun className="h-3.5 w-3.5 text-temp-warm" />
                <span className="font-bold text-temp-warm">{metrics?.warmLeads || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-temp-cold text-sm">
                <Snowflake className="h-3.5 w-3.5 text-temp-cold" />
                <span className="font-bold text-temp-cold">{metrics?.coldLeads || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <Button asChild className="h-auto py-4 flex-col gap-1.5 gradient-primary shadow-md hover:shadow-lg transition-all group">
          <Link to="/prospecting">
            <Target className="h-5 w-5 transition-transform group-hover:scale-110" />
            <span className="text-[13px] font-semibold">Capturar Leads</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-1.5 hover:border-primary/30 transition-all group">
          <Link to="/prospecting?tab=mass-send">
            <Send className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[13px] font-semibold">Enviar Mensagens</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-1.5 hover:border-primary/30 transition-all group">
          <Link to="/leads">
            <Users className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[13px] font-semibold">Ver Leads</span>
          </Link>
        </Button>
        <Button
          asChild
          variant={settings?.whatsapp_connected ? "outline" : "destructive"}
          className="h-auto py-4 flex-col gap-1.5"
        >
          <Link to="/settings">
            <Zap className="h-5 w-5" />
            <span className="text-[13px] font-semibold">
              {settings?.whatsapp_connected ? 'Configurações' : 'Conectar WhatsApp'}
            </span>
          </Link>
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-5 lg:grid-cols-3 animate-slide-up" style={{ animationDelay: '250ms' }}>
        {/* Funnel Overview */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base font-semibold">Funil de Vendas</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground gap-1 text-[13px]">
                <Link to="/funnel">
                  Ver funil <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {funnelStages.length > 0 ? (
              <div className="space-y-3.5">
                {funnelStages.map(([stage, count], index) => {
                  const percentage = totalFunnelLeads > 0 ? (count / totalFunnelLeads) * 100 : 0;
                  const colors = [
                    'bg-muted-foreground/60',
                    'bg-info',
                    'bg-primary',
                    'bg-warning',
                    'bg-success',
                    'bg-destructive/60',
                  ];
                  return (
                    <div key={stage}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] font-medium text-muted-foreground">{stage}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{count}</span>
                          <span className="text-[11px] text-muted-foreground/60">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", colors[index % colors.length])}
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-15" />
                <p className="text-sm font-medium">Sem dados no funil</p>
                <Button asChild variant="link" className="mt-1 text-[13px]">
                  <Link to="/prospecting">Capturar leads →</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Panel */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base font-semibold">Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <StatusItem
              icon={<MessageSquare className="h-4 w-4" />}
              label="WhatsApp"
              connected={!!settings?.whatsapp_connected}
            />
            <StatusItem
              icon={<Target className="h-4 w-4" />}
              label="API de Busca"
              connected={!!(settings?.serper_api_key || settings?.serpapi_api_key)}
            />
            <StatusItem
              icon={<Sparkles className="h-4 w-4" />}
              label="Agente IA"
              connected={!!(settings?.agent_name && settings?.knowledge_base)}
            />

            <div className="p-3 rounded-lg bg-muted/50 border border-border/50 mt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-medium">Nichos Alvo</span>
                <Badge variant="secondary" className="text-[11px] h-5">
                  {settings?.target_niches?.length || 0}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {settings?.target_niches?.slice(0, 3).map((niche, i) => (
                  <Badge key={i} variant="outline" className="text-[11px] font-normal">{niche}</Badge>
                ))}
                {(settings?.target_niches?.length || 0) > 3 && (
                  <Badge variant="secondary" className="text-[11px]">
                    +{(settings?.target_niches?.length || 0) - 3}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="mt-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base font-semibold">Atividades Recentes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-15" />
              <p className="text-sm font-medium">Sem atividades recentes</p>
              <p className="text-[13px] mt-1 text-muted-foreground/70">Comece a prospectar para ver atividades aqui</p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {activities.slice(0, 6).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
                >
                  <div className={cn(
                    "p-2 rounded-lg shrink-0",
                    activityColors[activity.activity_type] || "bg-muted text-muted-foreground"
                  )}>
                    {activityIcons[activity.activity_type] || <Clock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium leading-tight truncate">{activity.description}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function StatusItem({ icon, label, connected }: { icon: React.ReactNode; label: string; connected: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex items-center gap-2.5">
        <div className={cn(
          "p-1.5 rounded-md",
          connected ? "bg-success/10" : "bg-muted"
        )}>
          <span className={connected ? "text-success" : "text-muted-foreground"}>
            {icon}
          </span>
        </div>
        <span className="text-[13px] font-medium">{label}</span>
      </div>
      {connected ? (
        <CheckCircle2 className="h-4 w-4 text-success" />
      ) : (
        <AlertCircle className="h-4 w-4 text-muted-foreground/50" />
      )}
    </div>
  );
}
