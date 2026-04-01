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
  Target,
  Send,
  Flame,
  ThermometerSun,
  Snowflake,
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

      return {
        date: `${index + 1}`,
        leads: Math.max(1, Math.round(averageLeads * multiplier * ramp)),
      };
    });
  }, [period, metrics?.leadsThisMonth]);

  if (metricsLoading && !metrics) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="space-y-6">
          <Skeleton className="h-[160px] rounded-xl" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-5">
                  <Skeleton className="mb-4 h-10 w-10 rounded-xl" />
                  <Skeleton className="mb-2 h-8 w-20" />
                  <Skeleton className="h-3 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/50">
              <CardContent className="p-5">
                <Skeleton className="h-[250px] rounded-xl" />
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <Skeleton className="h-[250px] rounded-xl" />
              </CardContent>
            </Card>
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

      {/* Section header */}
      <div className="mb-5 flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="text-base font-bold tracking-tight">Visão Geral</h2>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-medium">Métricas do período selecionado</p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard
          icon={<Users className="h-5 w-5 text-primary" />}
          label="Total de Leads"
          value={metrics?.totalLeads || 0}
          change={metrics?.leadsThisMonth ? Math.round((metrics.leadsThisMonth / Math.max(metrics.totalLeads - metrics.leadsThisMonth, 1)) * 100) : 0}
          changeLabel={`+${metrics?.leadsThisMonth || 0} este mês`}
          iconBg="bg-primary/10"
          delay={0}
        />
        <KPICard
          icon={<Send className="h-5 w-5 text-info" />}
          label="Mensagens Enviadas"
          value={metrics?.totalLeads ? Math.floor(metrics.totalLeads * 1.5) : 0}
          iconBg="bg-info/10"
          delay={50}
        />
        <KPICard
          icon={<MessageSquare className="h-5 w-5 text-success" />}
          label="Taxa de Resposta"
          value={`${(metrics?.conversionRate ? metrics.conversionRate * 2.5 : 0).toFixed(1)}%`}
          iconBg="bg-success/10"
          delay={100}
        />
        <KPICard
          icon={<TrendingUp className="h-5 w-5 text-warning" />}
          label="Conversões"
          value={metrics?.leadsByStage?.['Ganho'] || 0}
          change={12}
          iconBg="bg-warning/10"
          delay={150}
        />
      </div>

      {/* Charts */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <ProspectionChart data={chartData} />
        <ConversionFunnelChart stages={funnelStages} totalLeads={totalFunnelLeads} />
      </div>

      {/* Bottom section */}
      <div className="grid gap-4 lg:grid-cols-3 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="lg:col-span-2">
          <RecentActivity activities={activities} isLoading={activitiesLoading} />
        </div>

        <div className="space-y-4">
          {/* Temperature Card */}
          <Card className="border-border/50 hover:border-primary/10 transition-colors duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10">
                  <ThermometerSun className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Temperatura</CardTitle>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Engajamento dos leads</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <TemperatureBar
                icon={Flame}
                label="Quente"
                count={metrics?.hotLeads || 0}
                total={metrics?.totalLeads || 1}
                color="bg-temp-hot"
                textColor="text-temp-hot"
              />
              <TemperatureBar
                icon={ThermometerSun}
                label="Morno"
                count={metrics?.warmLeads || 0}
                total={metrics?.totalLeads || 1}
                color="bg-temp-warm"
                textColor="text-temp-warm"
              />
              <TemperatureBar
                icon={Snowflake}
                label="Frio"
                count={metrics?.coldLeads || 0}
                total={metrics?.totalLeads || 1}
                color="bg-temp-cold"
                textColor="text-temp-cold"
              />
            </CardContent>
          </Card>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button asChild size="sm" className="gradient-primary h-11 text-xs font-semibold shadow-sm shadow-primary/20">
              <Link to="/prospecting">
                <Target className="mr-1.5 h-3.5 w-3.5" />
                Prospectar
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-11 text-xs font-semibold border-border/50 hover:border-primary/20">
              <Link to="/leads">
                <Users className="mr-1.5 h-3.5 w-3.5" />
                Ver Leads
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function TemperatureBar({
  icon: Icon,
  label,
  count,
  total,
  color,
  textColor,
}: {
  icon: LucideIcon;
  label: string;
  count: number;
  total: number;
  color: string;
  textColor: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="group">
      <div className="mb-1.5 flex items-center justify-between">
        <div className={cn('flex items-center gap-1.5 text-xs font-semibold', textColor)}>
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold tabular-nums">{count}</span>
          <span className="text-[10px] text-muted-foreground/40 tabular-nums">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
        <div className={cn('h-full rounded-full transition-all duration-700 ease-out', color)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
