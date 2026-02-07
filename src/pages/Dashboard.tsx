import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { SectionHeader } from '@/components/ui/section-header';
import { EmptyState } from '@/components/ui/empty-state';
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics';
import { useActivityLog } from '@/hooks/use-activity-log';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useAuth } from '@/lib/auth';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import {
  Users,
  Calendar,
  TrendingUp,
  Flame,
  ThermometerSun,
  Snowflake,
  Rocket,
  MessageSquare,
  Target,
  Clock,
  Zap,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { activities, isLoading: activitiesLoading } = useActivityLog(10);
  const { settings } = useUserSettings();
  const [showChecklist, setShowChecklist] = useState(true);

  // Check if user needs onboarding checklist
  const isNewUser = !settings?.whatsapp_connected && 
                    !settings?.agent_name && 
                    !settings?.knowledge_base;

  const getActivityIcon = (type: string) => {
    const iconMap: Record<string, JSX.Element> = {
      lead_created: <Users className="h-4 w-4 text-info" />,
      message_sent: <MessageSquare className="h-4 w-4 text-primary" />,
      meeting_scheduled: <Calendar className="h-4 w-4 text-success" />,
      lead_qualified: <Target className="h-4 w-4 text-warning" />,
    };
    return iconMap[type] || <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <DashboardLayout 
      title="Dashboard"
      description="Visão geral da sua prospecção automatizada"
    >
      {/* Onboarding Wizard for new users */}
      <OnboardingWizard />

      {/* Onboarding Checklist */}
      {showChecklist && (
        <div className="mb-8 animate-fade-in">
          <OnboardingChecklist onDismiss={() => setShowChecklist(false)} />
        </div>
      )}
      {/* Hero Action Card */}
      <Card className="mb-8 overflow-hidden border-0 shadow-xl animate-fade-in">
        <div className="gradient-primary relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyek0yNCAyNmgydjhoLTJ6TTM0IDI2aDJ2OGgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-8 px-6 gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white">Capturar Leads Agora</h3>
                <p className="text-white/80 max-w-md">
                  Encontre novos clientes no Google Maps e dispare mensagens personalizadas
                </p>
              </div>
            </div>
            <Button asChild size="lg" variant="secondary" className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Link to="/prospecting?tab=capture">
                <Target className="h-5 w-5 mr-2" />
                Iniciar Captura
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total de Leads"
          value={metrics?.totalLeads || 0}
          subtitle={`+${metrics?.leadsThisMonth || 0} este mês`}
          icon={Users}
          iconColor="text-primary"
          loading={metricsLoading}
          className="animate-fade-in"
        />
        <StatCard
          title="Reuniões Agendadas"
          value={metrics?.meetingsScheduled || 0}
          subtitle={`${metrics?.meetingsThisWeek || 0} esta semana`}
          icon={Calendar}
          iconColor="text-info"
          loading={metricsLoading}
          className="animate-fade-in"
        />
        <StatCard
          title="Taxa de Conversão"
          value={`${(metrics?.conversionRate || 0).toFixed(1)}%`}
          subtitle="Leads convertidos em vendas"
          icon={TrendingUp}
          iconColor="text-success"
          loading={metricsLoading}
          className="animate-fade-in"
        />
        <Card className="card-hover animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-muted-foreground">Temperatura</p>
                {metricsLoading ? (
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                ) : (
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-temp-hot/10">
                      <Flame className="h-4 w-4 text-temp-hot" />
                      <span className="font-bold text-sm">{metrics?.hotLeads || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-temp-warm/10">
                      <ThermometerSun className="h-4 w-4 text-temp-warm" />
                      <span className="font-bold text-sm">{metrics?.warmLeads || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-temp-cold/10">
                      <Snowflake className="h-4 w-4 text-temp-cold" />
                      <span className="font-bold text-sm">{metrics?.coldLeads || 0}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Command Center */}
        <Card className="animate-fade-in overflow-hidden">
          <CardHeader className="pb-4">
            <SectionHeader
              title="Centro de Comando"
              description="Inicie prospecções e gerencie seu agente de IA"
              icon={Rocket}
              className="mb-0"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30 backdrop-blur-sm">
              <div>
                <p className="font-semibold">Status do WhatsApp</p>
                <p className="text-sm text-muted-foreground">
                  {settings?.whatsapp_connected ? 'Conectado e pronto' : 'Desconectado'}
                </p>
              </div>
              <Badge 
                variant={settings?.whatsapp_connected ? 'default' : 'secondary'}
                className={settings?.whatsapp_connected ? 'bg-success hover:bg-success/90' : ''}
              >
                <span className={`mr-1.5 h-2 w-2 rounded-full ${settings?.whatsapp_connected ? 'bg-success-foreground animate-pulse' : 'bg-current'}`} />
                {settings?.whatsapp_connected ? 'Online' : 'Offline'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                className="h-24 flex-col gap-3 rounded-xl shadow-md hover:shadow-lg transition-all"
                disabled={!settings?.whatsapp_connected}
              >
                <Target className="h-6 w-6" />
                <span className="font-medium">Iniciar Prospecção</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-3 rounded-xl hover:bg-muted transition-all"
                asChild
              >
                <Link to="/conversations">
                  <MessageSquare className="h-6 w-6" />
                  <span className="font-medium">Ver Conversas</span>
                </Link>
              </Button>
            </div>

            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">Nichos Configurados</span>
                <Badge variant="secondary" className="font-mono">
                  {settings?.target_niches?.length || 0}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings?.target_niches?.slice(0, 5).map((niche, i) => (
                  <Badge key={i} variant="outline" className="rounded-full">{niche}</Badge>
                ))}
                {(settings?.target_niches?.length || 0) > 5 && (
                  <Badge variant="secondary" className="rounded-full">
                    +{(settings?.target_niches?.length || 0) - 5} mais
                  </Badge>
                )}
                {(!settings?.target_niches || settings.target_niches.length === 0) && (
                  <p className="text-sm text-muted-foreground">Nenhum nicho configurado ainda</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="animate-fade-in overflow-hidden">
          <CardHeader className="pb-4">
            <SectionHeader
              title="Atividades Recentes"
              description="Acompanhe o que está acontecendo"
              icon={Activity}
              className="mb-0"
            />
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Nenhuma atividade ainda"
                description="Inicie uma prospecção para ver atividades aqui"
                className="py-8"
              />
            ) : (
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="p-2.5 rounded-full bg-muted shrink-0">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{activity.description}</p>
                      {activity.lead && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {activity.lead.business_name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1.5">
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

      {/* Funnel Overview */}
      <Card className="mt-8 animate-fade-in overflow-hidden">
        <CardHeader>
          <SectionHeader
            title="Visão do Funil"
            description="Distribuição de leads por estágio"
            className="mb-0"
          />
        </CardHeader>
        <CardContent>
          {metricsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-5 rounded-xl border bg-muted/30 animate-pulse">
                  <div className="h-8 w-12 bg-muted rounded mb-2 mx-auto" />
                  <div className="h-4 w-20 bg-muted rounded mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(metrics?.leadsByStage || {}).map(([stage, count], index) => (
                <div
                  key={stage}
                  className="p-5 rounded-xl border bg-gradient-to-br from-muted/30 to-muted/10 text-center card-interactive"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="text-3xl font-bold mb-1">{count}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stage}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
