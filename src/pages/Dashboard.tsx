import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { SectionHeader } from '@/components/ui/section-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics';
import { useActivityLog } from '@/hooks/use-activity-log';
import { useUserSettings } from '@/hooks/use-user-settings';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import {
  Users,
  Calendar,
  TrendingUp,
  Flame,
  ThermometerSun,
  Snowflake,
  MessageSquare,
  Target,
  Clock,
  Zap,
  ArrowRight,
  Activity,
  Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Activity icon mapping
const activityIcons: Record<string, React.ReactNode> = {
  lead_created: <Users className="h-4 w-4 text-info" />,
  message_sent: <MessageSquare className="h-4 w-4 text-primary" />,
  meeting_scheduled: <Calendar className="h-4 w-4 text-success" />,
  lead_qualified: <Target className="h-4 w-4 text-warning" />,
};

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { activities, isLoading: activitiesLoading } = useActivityLog(8);
  const { settings } = useUserSettings();
  const [showChecklist, setShowChecklist] = useState(true);

  // Memoize expensive computations
  const funnelStages = useMemo(() => {
    return Object.entries(metrics?.leadsByStage || {});
  }, [metrics?.leadsByStage]);

  // Show skeleton while initial data loads
  if (metricsLoading && !metrics) {
    return (
      <DashboardLayout title="Dashboard" description="Visão geral da sua prospecção">
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Dashboard"
      description="Visão geral da sua prospecção"
    >
      <OnboardingWizard />

      {showChecklist && (
        <div className="mb-6 animate-fade-in">
          <OnboardingChecklist onDismiss={() => setShowChecklist(false)} />
        </div>
      )}

      {/* Quick Action - Enhanced with better animation */}
      <Card className="mb-6 overflow-hidden border-0 shadow-lg animate-slide-up card-hover">
        <div className="gradient-primary p-5 sm:p-6 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Capturar Leads
                  <Sparkles className="h-4 w-4 text-white/80" />
                </h3>
                <p className="text-white/80 text-sm">
                  Google Maps + mensagens automáticas
                </p>
              </div>
            </div>
            <Button asChild size="lg" variant="secondary" className="shadow-md w-full sm:w-auto group">
              <Link to="/prospecting?tab=capture">
                <Target className="h-5 w-5 mr-2" />
                Iniciar
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Metrics - Clean Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Leads"
          value={metrics?.totalLeads || 0}
          subtitle={`+${metrics?.leadsThisMonth || 0} este mês`}
          icon={Users}
          iconColor="text-primary"
          loading={metricsLoading}
        />
        <StatCard
          title="Reuniões"
          value={metrics?.meetingsScheduled || 0}
          subtitle={`${metrics?.meetingsThisWeek || 0} esta semana`}
          icon={Calendar}
          iconColor="text-info"
          loading={metricsLoading}
        />
        <StatCard
          title="Conversão"
          value={`${(metrics?.conversionRate || 0).toFixed(1)}%`}
          subtitle="Taxa de vendas"
          icon={TrendingUp}
          iconColor="text-success"
          loading={metricsLoading}
        />
        
        {/* Temperature Card - Simplified */}
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm font-medium text-muted-foreground mb-3">Temperatura</p>
            {metricsLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-temp-hot/10">
                  <Flame className="h-3.5 w-3.5 text-temp-hot" />
                  <span className="font-bold text-sm">{metrics?.hotLeads || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-temp-warm/10">
                  <ThermometerSun className="h-3.5 w-3.5 text-temp-warm" />
                  <span className="font-bold text-sm">{metrics?.warmLeads || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-temp-cold/10">
                  <Snowflake className="h-3.5 w-3.5 text-temp-cold" />
                  <span className="font-bold text-sm">{metrics?.coldLeads || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status & Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader
              title="Status"
              description="Estado atual do sistema"
              className="mb-0"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* WhatsApp Status */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">WhatsApp</p>
                  <p className="text-xs text-muted-foreground">
                    {settings?.whatsapp_connected ? 'Pronto para envio' : 'Não conectado'}
                  </p>
                </div>
              </div>
              <Badge 
                variant={settings?.whatsapp_connected ? 'default' : 'secondary'}
                className={settings?.whatsapp_connected ? 'bg-success hover:bg-success/90' : ''}
              >
                {settings?.whatsapp_connected ? 'Online' : 'Offline'}
              </Badge>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-2"
                asChild
              >
                <Link to="/leads">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Ver Leads</span>
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-2"
                asChild
              >
                <Link to="/conversations">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-sm">Conversas</span>
                </Link>
              </Button>
            </div>

            {/* Configured Niches */}
            <div className="p-3 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Nichos</span>
                <Badge variant="secondary" className="text-xs">
                  {settings?.target_niches?.length || 0}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {settings?.target_niches?.slice(0, 4).map((niche, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{niche}</Badge>
                ))}
                {(settings?.target_niches?.length || 0) > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{(settings?.target_niches?.length || 0) - 4}
                  </Badge>
                )}
                {(!settings?.target_niches?.length) && (
                  <p className="text-xs text-muted-foreground">Nenhum configurado</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed - Optimized */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader
              title="Atividades"
              description="Últimas ações"
              icon={Activity}
              className="mb-0"
            />
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Sem atividades"
                description="Inicie uma prospecção"
                className="py-6"
              />
            ) : (
              <div className="space-y-2">
                {activities.slice(0, 6).map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-2 rounded-full bg-muted shrink-0">
                      {activityIcons[activity.activity_type] || <Clock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
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
      </div>

      {/* Funnel Overview - Simplified */}
      {funnelStages.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <SectionHeader
              title="Funil de Vendas"
              description="Leads por estágio"
              className="mb-0"
            />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {funnelStages.map(([stage, count]) => (
                <div
                  key={stage}
                  className="p-4 rounded-lg border bg-muted/20 text-center"
                >
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">{stage}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
