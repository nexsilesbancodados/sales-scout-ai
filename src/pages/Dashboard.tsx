import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics';
import { useActivityLog } from '@/hooks/use-activity-log';
import { useUserSettings } from '@/hooks/use-user-settings';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
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
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Send,
  BarChart3,
  Sparkles,
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
  lead_created: 'bg-blue-500/10 text-blue-500',
  message_sent: 'bg-primary/10 text-primary',
  meeting_scheduled: 'bg-green-500/10 text-green-500',
  lead_qualified: 'bg-amber-500/10 text-amber-500',
};

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { activities, isLoading: activitiesLoading } = useActivityLog(8);
  const { settings } = useUserSettings();

  const funnelStages = useMemo(() => {
    return Object.entries(metrics?.leadsByStage || {});
  }, [metrics?.leadsByStage]);

  const totalFunnelLeads = funnelStages.reduce((acc, [, count]) => acc + count, 0);

  // Loading skeleton
  if (metricsLoading && !metrics) {
    return (
      <DashboardLayout title="Dashboard" description="Visão geral">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Dashboard"
      description="Visão geral da sua prospecção"
    >
      <OnboardingWizard />

      {/* Hero Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8 animate-fade-in">
        {/* Total Leads */}
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs font-normal">
                +{metrics?.leadsThisMonth || 0} mês
              </Badge>
            </div>
            <p className="text-3xl font-bold tracking-tight mb-1">{metrics?.totalLeads || 0}</p>
            <p className="text-sm text-muted-foreground">Total de Leads</p>
          </CardContent>
        </Card>

        {/* Meetings */}
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-info/5 to-info/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-info/10">
                <Calendar className="h-5 w-5 text-info" />
              </div>
              <Badge variant="secondary" className="text-xs font-normal">
                {metrics?.meetingsThisWeek || 0} semana
              </Badge>
            </div>
            <p className="text-3xl font-bold tracking-tight mb-1">{metrics?.meetingsScheduled || 0}</p>
            <p className="text-sm text-muted-foreground">Reuniões</p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-success/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <Sparkles className="h-4 w-4 text-success" />
            </div>
            <p className="text-3xl font-bold tracking-tight mb-1">
              {(metrics?.conversionRate || 0).toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
          </CardContent>
        </Card>

        {/* Temperature */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Temperatura</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-temp-hot">
                <Flame className="h-4 w-4 text-temp-hot" />
                <span className="font-bold text-sm">{metrics?.hotLeads || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-temp-warm">
                <ThermometerSun className="h-4 w-4 text-temp-warm" />
                <span className="font-bold text-sm">{metrics?.warmLeads || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-temp-cold">
                <Snowflake className="h-4 w-4 text-temp-cold" />
                <span className="font-bold text-sm">{metrics?.coldLeads || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <Button 
          asChild 
          className="h-auto py-5 flex-col gap-2 gradient-primary shadow-lg hover:shadow-xl transition-all"
        >
          <Link to="/prospecting">
            <Target className="h-6 w-6" />
            <span className="font-semibold">Capturar Leads</span>
          </Link>
        </Button>
        
        <Button 
          asChild 
          variant="outline"
          className="h-auto py-5 flex-col gap-2 hover:border-primary/50 transition-all"
        >
          <Link to="/prospecting?tab=mass-send">
            <Send className="h-6 w-6" />
            <span className="font-semibold">Enviar Mensagens</span>
          </Link>
        </Button>

        <Button 
          asChild 
          variant="outline"
          className="h-auto py-5 flex-col gap-2 hover:border-primary/50 transition-all"
        >
          <Link to="/leads">
            <Users className="h-6 w-6" />
            <span className="font-semibold">Ver Leads</span>
          </Link>
        </Button>

        <Button 
          asChild 
          variant={settings?.whatsapp_connected ? "outline" : "destructive"}
          className="h-auto py-5 flex-col gap-2"
        >
          <Link to="/settings">
            <Zap className="h-6 w-6" />
            <span className="font-semibold">
              {settings?.whatsapp_connected ? 'Configurações' : 'Conectar WhatsApp'}
            </span>
          </Link>
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
        {/* Funnel Overview - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Funil de Vendas</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/funnel" className="gap-1">
                  Ver funil <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {funnelStages.length > 0 ? (
              <div className="space-y-4">
                {funnelStages.map(([stage, count], index) => {
                  const percentage = totalFunnelLeads > 0 ? (count / totalFunnelLeads) * 100 : 0;
                  const colors = [
                    'bg-blue-500',
                    'bg-cyan-500',
                    'bg-primary',
                    'bg-amber-500',
                    'bg-green-500',
                    'bg-slate-500',
                  ];
                  return (
                    <div key={stage} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{stage}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{count}</span>
                          <span className="text-xs text-muted-foreground">
                            ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-500", colors[index % colors.length])}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Sem dados no funil</p>
                <Button asChild variant="link" className="mt-2">
                  <Link to="/prospecting">Capturar leads</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Panel */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* WhatsApp Status */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  settings?.whatsapp_connected ? "bg-green-500/10" : "bg-muted"
                )}>
                  <MessageSquare className={cn(
                    "h-4 w-4",
                    settings?.whatsapp_connected ? "text-green-500" : "text-muted-foreground"
                  )} />
                </div>
                <span className="text-sm font-medium">WhatsApp</span>
              </div>
              {settings?.whatsapp_connected ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            {/* API Status */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  (settings?.serper_api_key || settings?.serpapi_api_key) ? "bg-green-500/10" : "bg-muted"
                )}>
                  <Target className={cn(
                    "h-4 w-4",
                    (settings?.serper_api_key || settings?.serpapi_api_key) ? "text-green-500" : "text-muted-foreground"
                  )} />
                </div>
                <span className="text-sm font-medium">API Busca</span>
              </div>
              {(settings?.serper_api_key || settings?.serpapi_api_key) ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            {/* Agent Status */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  (settings?.agent_name && settings?.knowledge_base) ? "bg-green-500/10" : "bg-muted"
                )}>
                  <Sparkles className={cn(
                    "h-4 w-4",
                    (settings?.agent_name && settings?.knowledge_base) ? "text-green-500" : "text-muted-foreground"
                  )} />
                </div>
                <span className="text-sm font-medium">Agente IA</span>
              </div>
              {(settings?.agent_name && settings?.knowledge_base) ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            {/* Niches */}
            <div className="p-3 rounded-xl bg-muted/50 border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Nichos Alvo</span>
                <Badge variant="secondary">{settings?.target_niches?.length || 0}</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {settings?.target_niches?.slice(0, 3).map((niche, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{niche}</Badge>
                ))}
                {(settings?.target_niches?.length || 0) > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{(settings?.target_niches?.length || 0) - 3}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="mt-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Atividades Recentes</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Sem atividades recentes</p>
              <p className="text-sm mt-1">Comece a prospectar para ver atividades aqui</p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {activities.slice(0, 6).map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors border"
                >
                  <div className={cn(
                    "p-2 rounded-lg shrink-0",
                    activityColors[activity.activity_type] || "bg-muted text-muted-foreground"
                  )}>
                    {activityIcons[activity.activity_type] || <Clock className="h-4 w-4" />}
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
    </DashboardLayout>
  );
}
