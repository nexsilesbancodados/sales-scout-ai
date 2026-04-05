import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, ArrowRight as ArrowRightIcon, X as XIcon } from 'lucide-react';
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
import { OpportunityRadar } from '@/components/dashboard/OpportunityRadar';
import { useLeads } from '@/hooks/use-leads';
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

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { activities, isLoading: activitiesLoading } = useActivityLog(10);
  const { settings } = useUserSettings();
  const { leads } = useLeads();
  const [period, setPeriod] = useState('30d');

  const funnelStages = useMemo(() => {
    return Object.entries(metrics?.leadsByStage || {});
  }, [metrics?.leadsByStage]);

  const totalFunnelLeads = funnelStages.reduce((acc, [, count]) => acc + count, 0);

  const chartData = useMemo(() => {
    if (!metrics?.leadsByDate) return [];
    const days = period === 'today' ? 1 : period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const now = new Date();
    const entries = Object.entries(metrics.leadsByDate);
    const cutoff = format(subDays(now, days), 'yyyy-MM-dd');
    return entries
      .filter(([date]) => date >= cutoff)
      .map(([date, leads]) => ({ date: format(new Date(date + 'T12:00:00'), 'dd/MM'), leads }));
  }, [period, metrics]);

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

  const [bannerDismissed, setBannerDismissed] = useState(() =>
    localStorage.getItem('nexaprospect-banner-dismissed-v1') === 'true'
  );

  const nextStep = useMemo(() => {
    if (!settings?.whatsapp_connected) return { icon: Wifi, title: 'Conecte seu WhatsApp', desc: 'Ative envios automáticos e o Agente SDR', path: '/settings/connections' };
    if ((metrics?.totalLeads || 0) === 0) return { icon: Target, title: 'Capture seus primeiros leads', desc: 'Busque no Google Maps, Instagram ou Facebook', path: '/prospecting' };
    if ((metrics?.hotLeads || 0) > 0) return { icon: Flame, title: `Você tem ${metrics?.hotLeads} leads quentes esperando`, desc: 'Responda agora para aumentar conversões', path: '/crm/inbox' };
    return null;
  }, [settings?.whatsapp_connected, metrics?.totalLeads, metrics?.hotLeads]);

  const showNextStep = nextStep && !bannerDismissed;

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem('nexaprospect-banner-dismissed-v1', 'true');
  };

  return (
    <DashboardLayout title="Dashboard">
      <OnboardingWizard />

      <WelcomeCard
        userName={settings?.agent_name}
        totalLeads={metrics?.totalLeads || 0}
        whatsappConnected={!!settings?.whatsapp_connected}
      />

      {/* Next Step Banner */}
      {showNextStep && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-center gap-4"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <nextStep.icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{nextStep.title}</p>
            <p className="text-xs text-muted-foreground">{nextStep.desc}</p>
          </div>
          <Button size="sm" asChild className="gradient-primary shrink-0">
            <Link to={nextStep.path}>Fazer agora <ArrowRightIcon className="h-3 w-3 ml-1" /></Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleDismissBanner} aria-label="Fechar banner">
            <XIcon className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      )}

      {/* Period filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between mb-5"
      >
        <h2 className="text-sm font-semibold text-muted-foreground">Visão Geral</h2>
        <PeriodFilter value={period} onChange={setPeriod} />
      </motion.div>

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
          value={metrics?.totalLeads ? metrics.leadsByStage?.['Contato'] || 0 : 0}
          iconBg="bg-info/8"
          delay={50}
        />
        <KPICard
          icon={<MessageSquare className="h-4 w-4 text-success" />}
          label="Taxa de Resposta"
          value={`${metrics?.conversionRate?.toFixed(1) || '0.0'}%`}
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
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <ROIMetricCard
          icon={TrendingUp}
          iconColor="text-success"
          iconBg="bg-success/8"
          label="ROI"
          value={metrics?.totalLeads && metrics?.leadsByStage?.['Ganho']
            ? `${((metrics.leadsByStage['Ganho'] / metrics.totalLeads) * 100).toFixed(1)}%`
            : '0%'}
          sub="Taxa de conversão geral"
        />
        <ROIMetricCard
          icon={Target}
          iconColor="text-primary"
          iconBg="bg-primary/8"
          label="Custo/Lead"
          value="R$ 0,00"
          sub="Prospecção gratuita"
        />
        <ROIMetricCard
          icon={Flame}
          iconColor="text-warning"
          iconBg="bg-warning/8"
          label="Pipeline"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(
            (metrics?.leadsByStage?.['Proposta'] || 0) * 500 + (metrics?.leadsByStage?.['Negociação'] || 0) * 1000
          )}
          sub="Valor estimado"
        />
        <ROIMetricCard
          icon={MessageSquare}
          iconColor="text-info"
          iconBg="bg-info/8"
          label="Engajamento"
          value={String(metrics?.hotLeads || 0)}
          sub="Leads quentes ativos"
        />
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="mb-6 grid gap-4 lg:grid-cols-2"
      >
        <ProspectionChart data={chartData} />
        <ConversionFunnelChart stages={funnelStages} totalLeads={totalFunnelLeads} />
      </motion.div>

      {/* Bottom section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="grid gap-4 lg:grid-cols-3"
      >
        <div className="lg:col-span-2 space-y-4">
          <OpportunityRadar leads={leads} />
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
              <Link to="/crm/contacts"><Users className="mr-1.5 h-3.5 w-3.5" />Ver Leads</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

/* ── Sub-components ── */

function ROIMetricCard({ icon: Icon, iconColor, iconBg, label, value, sub }: {
  icon: LucideIcon; iconColor: string; iconBg: string; label: string; value: string; sub: string;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="border-border/40 group hover:border-primary/20 transition-all duration-300 overflow-hidden relative">
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none" />
        <CardContent className="p-4 relative">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn("p-1.5 rounded-lg", iconBg)}>
              <Icon className={cn("h-3.5 w-3.5", iconColor)} />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">{label}</span>
          </div>
          <p className="text-lg font-bold tabular-nums">{value}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
        </CardContent>
      </Card>
    </motion.div>
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
      <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', color)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
        />
      </div>
    </div>
  );
}
