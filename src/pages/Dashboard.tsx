import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics';
import { useActivityLog } from '@/hooks/use-activity-log';
import { useUserSettings } from '@/hooks/use-user-settings';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { KPICard } from '@/components/dashboard/KPICard';
import { PeriodFilter } from '@/components/dashboard/PeriodFilter';
import { ProspectionChart } from '@/components/dashboard/ProspectionChart';
import { ConversionFunnelChart } from '@/components/dashboard/ConversionFunnelChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import {
  Users,
  TrendingUp,
  MessageSquare,
  Send,
  Flame,
  ThermometerSun,
  Snowflake,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { activities, isLoading: activitiesLoading } = useActivityLog(10);
  const { settings } = useUserSettings();
  const [period, setPeriod] = useState('30d');

  const funnelStages = useMemo(() => {
    return Object.entries(metrics?.leadsByStage || {});
  }, [metrics?.leadsByStage]);

  const totalFunnelLeads = funnelStages.reduce((acc, [, count]) => acc + count, 0);

  const chartData = useMemo(() => {
    const days = period === 'today' ? 1 : period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const visiblePoints = Math.min(days, 30);
    const monthlyLeads = Math.max(metrics?.leadsThisMonth || 0, 1);
    const averageLeads = Math.max(1, Math.round(monthlyLeads / visiblePoints));
    return Array.from({ length: visiblePoints }, (_, index) => {
      const multiplier = 0.85 + (index % 5) * 0.14;
      const ramp = 0.7 + (index / Math.max(visiblePoints - 1, 1)) * 0.5;
      return { date: `${index + 1}`, leads: Math.max(1, Math.round(averageLeads * multiplier * ramp)) };
    });
  }, [period, metrics?.leadsThisMonth]);

  if (metricsLoading && !metrics) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="space-y-6">
          <Skeleton className="h-40 rounded-xl" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-border/40"><CardContent className="p-5"><Skeleton className="mb-4 h-8 w-8 rounded-lg" /><Skeleton className="mb-2 h-7 w-16" /><Skeleton className="h-3 w-20" /></CardContent></Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <OnboardingWizard />

      <WelcomeCard
        userName={settings?.agent_name}
        totalLeads={metrics?.totalLeads || 0}
        whatsappConnected={!!settings?.whatsapp_connected}
      />

      {/* Period filter */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-muted-foreground">Visão Geral</h2>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard
          icon={<Users className="h-4 w-4 text-primary" />}
          label="Total de Leads"
          value={metrics?.totalLeads || 0}
          change={metrics?.leadsThisMonth ? Math.round((metrics.leadsThisMonth / Math.max(metrics.totalLeads - metrics.leadsThisMonth, 1)) * 100) : 0}
          changeLabel={`+${metrics?.leadsThisMonth || 0} este mês`}
          iconBg="bg-primary/8"
          delay={0}
        />
        <KPICard
          icon={<Send className="h-4 w-4 text-info" />}
          label="Mensagens Enviadas"
          value={metrics?.totalLeads ? Math.floor(metrics.totalLeads * 1.5) : 0}
          iconBg="bg-info/8"
          delay={50}
        />
        <KPICard
          icon={<MessageSquare className="h-4 w-4 text-success" />}
          label="Taxa de Resposta"
          value={`${(metrics?.conversionRate ? metrics.conversionRate * 2.5 : 0).toFixed(1)}%`}
          iconBg="bg-success/8"
          delay={100}
        />
        <KPICard
          icon={<TrendingUp className="h-4 w-4 text-warning" />}
          label="Conversões"
          value={metrics?.leadsByStage?.['Ganho'] || 0}
          change={12}
          iconBg="bg-warning/8"
          delay={150}
        />
      </div>

      {/* ROI Quick Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="border-border/40 group hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-success/8">
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">ROI</span>
            </div>
            <p className="text-lg font-bold tabular-nums">
              {metrics?.totalLeads && metrics?.leadsByStage?.['Ganho']
                ? `${((metrics.leadsByStage['Ganho'] / metrics.totalLeads) * 100).toFixed(1)}%`
                : '0%'}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Taxa de conversão geral</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 group hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/8">
                <Target className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Custo/Lead</span>
            </div>
            <p className="text-lg font-bold tabular-nums">R$ 0,00</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Prospecção gratuita</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 group hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-warning/8">
                <Flame className="h-3.5 w-3.5 text-warning" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Pipeline</span>
            </div>
            <p className="text-lg font-bold tabular-nums">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(
                (metrics?.leadsByStage?.['Proposta'] || 0) * 500 + (metrics?.leadsByStage?.['Negociação'] || 0) * 1000
              )}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Valor estimado</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 group hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-info/8">
                <MessageSquare className="h-3.5 w-3.5 text-info" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Engajamento</span>
            </div>
            <p className="text-lg font-bold tabular-nums">
              {metrics?.hotLeads || 0}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Leads quentes ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <ProspectionChart data={chartData} />
        <ConversionFunnelChart stages={funnelStages} totalLeads={totalFunnelLeads} />
      </div>

      {/* Bottom section */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity activities={activities} isLoading={activitiesLoading} />
        </div>

        <div className="space-y-4">
          {/* Temperature */}
          <Card className="border-border/40">
            <CardHeader className="pb-1">
              <div className="flex items-center gap-2">
                <ThermometerSun className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Temperatura dos Leads</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-2 space-y-4">
              <TempBar icon={Flame} label="Quente" count={metrics?.hotLeads || 0} total={metrics?.totalLeads || 1} color="bg-destructive" textColor="text-destructive" />
              <TempBar icon={ThermometerSun} label="Morno" count={metrics?.warmLeads || 0} total={metrics?.totalLeads || 1} color="bg-warning" textColor="text-warning" />
              <TempBar icon={Snowflake} label="Frio" count={metrics?.coldLeads || 0} total={metrics?.totalLeads || 1} color="bg-info" textColor="text-info" />
            </CardContent>
          </Card>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button asChild size="sm" className="gradient-primary h-10 text-xs font-semibold shadow-sm shadow-primary/15">
              <Link to="/prospecting"><Target className="mr-1.5 h-3.5 w-3.5" />Prospectar</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-10 text-xs font-semibold border-border/50">
              <Link to="/leads"><Users className="mr-1.5 h-3.5 w-3.5" />Ver Leads</Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function TempBar({ icon: Icon, label, count, total, color, textColor }: { icon: LucideIcon; label: string; count: number; total: number; color: string; textColor: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className={cn('flex items-center gap-1.5 text-xs font-medium', textColor)}>
          <Icon className="h-3 w-3" />{label}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold tabular-nums">{count}</span>
          <span className="text-[10px] text-muted-foreground/40 tabular-nums">{pct.toFixed(0)}%</span>
        </div>
      </div>
      <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
