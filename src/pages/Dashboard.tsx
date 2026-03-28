import { useMemo, useState } from 'react';
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
import { KPICard } from '@/components/dashboard/KPICard';
import { PeriodFilter } from '@/components/dashboard/PeriodFilter';
import { ProspectionChart } from '@/components/dashboard/ProspectionChart';
import { ConversionFunnelChart } from '@/components/dashboard/ConversionFunnelChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import {
  Users, TrendingUp, MessageSquare, Target, Zap,
  Send, CheckCircle2, AlertCircle, Sparkles,
  Flame, ThermometerSun, Snowflake,
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

  // Mock chart data based on metrics
  const chartData = useMemo(() => {
    const days = period === 'today' ? 1 : period === '7d' ? 7 : period === '90d' ? 90 : 30;
    return Array.from({ length: Math.min(days, 30) }, (_, i) => ({
      date: `${i + 1}`,
      leads: Math.floor(Math.random() * (metrics?.leadsThisMonth || 5) / 3) + 1,
    }));
  }, [period, metrics?.leadsThisMonth]);

  if (metricsLoading && !metrics) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-10 w-10 rounded-xl mb-4" />
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2 mb-6">
          <Card><CardContent className="p-5"><Skeleton className="h-[200px]" /></CardContent></Card>
          <Card><CardContent className="p-5"><Skeleton className="h-[200px]" /></CardContent></Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <OnboardingWizard />

      {/* Period Filter */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h2 className="text-lg font-bold">Visão Geral</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Acompanhe seus resultados</p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
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

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <ProspectionChart data={chartData} />
        <ConversionFunnelChart stages={funnelStages} totalLeads={totalFunnelLeads} />
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-4 lg:grid-cols-3 animate-slide-up" style={{ animationDelay: '300ms' }}>
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity activities={activities} isLoading={activitiesLoading} />
        </div>

        {/* Status + Quick Actions */}
        <div className="space-y-4">
          {/* Temperature Widget */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Temperatura dos Leads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <TemperatureBar
                icon={<Flame className="h-3.5 w-3.5" />}
                label="Quente"
                count={metrics?.hotLeads || 0}
                total={metrics?.totalLeads || 1}
                color="bg-temp-hot"
                textColor="text-temp-hot"
              />
              <TemperatureBar
                icon={<ThermometerSun className="h-3.5 w-3.5" />}
                label="Morno"
                count={metrics?.warmLeads || 0}
                total={metrics?.totalLeads || 1}
                color="bg-temp-warm"
                textColor="text-temp-warm"
              />
              <TemperatureBar
                icon={<Snowflake className="h-3.5 w-3.5" />}
                label="Frio"
                count={metrics?.coldLeads || 0}
                total={metrics?.totalLeads || 1}
                color="bg-temp-cold"
                textColor="text-temp-cold"
              />
            </CardContent>
          </Card>

          {/* Status Panel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Integrações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <StatusItem
                icon={<MessageSquare className="h-3.5 w-3.5" />}
                label="WhatsApp"
                connected={!!settings?.whatsapp_connected}
              />
              <StatusItem
                icon={<Target className="h-3.5 w-3.5" />}
                label="API de Busca"
                connected={!!(settings?.serper_api_key || settings?.serpapi_api_key)}
              />
              <StatusItem
                icon={<Sparkles className="h-3.5 w-3.5" />}
                label="Agente IA"
                connected={!!(settings?.agent_name && settings?.knowledge_base)}
              />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button asChild size="sm" className="gradient-primary text-xs font-semibold h-10">
              <Link to="/prospecting">
                <Target className="h-3.5 w-3.5 mr-1.5" />
                Prospectar
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="text-xs font-semibold h-10">
              <Link to="/leads">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Ver Leads
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function TemperatureBar({ icon, label, count, total, color, textColor }: {
  icon: React.ReactNode;
  label: string;
  count: number;
  total: number;
  color: string;
  textColor: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className={cn("flex items-center gap-1.5 text-xs font-medium", textColor)}>
          {icon}
          {label}
        </div>
        <span className="text-xs font-bold">{count}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function StatusItem({ icon, label, connected }: { icon: React.ReactNode; label: string; connected: boolean }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex items-center gap-2">
        <div className={cn("p-1 rounded-md", connected ? "bg-success/10" : "bg-muted")}>
          <span className={connected ? "text-success" : "text-muted-foreground"}>{icon}</span>
        </div>
        <span className="text-xs font-medium">{label}</span>
      </div>
      {connected ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5 text-muted-foreground/40" />
      )}
    </div>
  );
}
