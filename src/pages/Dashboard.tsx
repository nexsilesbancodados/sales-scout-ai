import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics';
import { useActivityLog } from '@/hooks/use-activity-log';
import { useUserSettings } from '@/hooks/use-user-settings';
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
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { activities, isLoading: activitiesLoading } = useActivityLog(10);
  const { settings } = useUserSettings();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lead_created':
        return <Users className="h-4 w-4 text-info" />;
      case 'message_sent':
        return <MessageSquare className="h-4 w-4 text-primary" />;
      case 'meeting_scheduled':
        return <Calendar className="h-4 w-4 text-success" />;
      case 'lead_qualified':
        return <Target className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout 
      title="Dashboard"
      description="Visão geral da sua prospecção automatizada"
    >
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics?.totalLeads || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{metrics?.leadsThisMonth || 0} este mês
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reuniões Agendadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics?.meetingsScheduled || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.meetingsThisWeek || 0} esta semana
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {(metrics?.conversionRate || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Leads convertidos em vendas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
            <ThermometerSun className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Flame className="h-4 w-4 text-temp-hot" />
                  <span className="font-bold">{metrics?.hotLeads || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThermometerSun className="h-4 w-4 text-temp-warm" />
                  <span className="font-bold">{metrics?.warmLeads || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Snowflake className="h-4 w-4 text-temp-cold" />
                  <span className="font-bold">{metrics?.coldLeads || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Command Center */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Centro de Comando
            </CardTitle>
            <CardDescription>
              Inicie prospecções e gerencie seu agente de IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div>
                <p className="font-medium">Status do WhatsApp</p>
                <p className="text-sm text-muted-foreground">
                  {settings?.whatsapp_connected ? 'Conectado' : 'Desconectado'}
                </p>
              </div>
              <Badge variant={settings?.whatsapp_connected ? 'default' : 'secondary'}>
                {settings?.whatsapp_connected ? 'Online' : 'Offline'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                className="h-20 flex-col gap-2"
                disabled={!settings?.whatsapp_connected}
              >
                <Target className="h-5 w-5" />
                Iniciar Prospecção
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <MessageSquare className="h-5 w-5" />
                Ver Conversas
              </Button>
            </div>

            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Nichos Configurados</span>
                <span className="text-sm text-muted-foreground">
                  {settings?.target_niches?.length || 0}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings?.target_niches?.slice(0, 5).map((niche, i) => (
                  <Badge key={i} variant="secondary">{niche}</Badge>
                ))}
                {(settings?.target_niches?.length || 0) > 5 && (
                  <Badge variant="outline">
                    +{(settings?.target_niches?.length || 0) - 5}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Acompanhe o que está acontecendo em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhuma atividade ainda</p>
                <p className="text-sm">Inicie uma prospecção para ver atividades aqui</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-0.5 p-2 rounded-full bg-muted">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.description}</p>
                      {activity.lead && (
                        <p className="text-sm text-muted-foreground truncate">
                          {activity.lead.business_name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
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
      <Card className="mt-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <CardHeader>
          <CardTitle>Visão do Funil</CardTitle>
          <CardDescription>
            Distribuição de leads por estágio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metricsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(metrics?.leadsByStage || {}).map(([stage, count]) => (
                <div
                  key={stage}
                  className="p-4 rounded-lg border text-center"
                >
                  <div className="text-2xl font-bold mb-1">{count}</div>
                  <div className="text-sm text-muted-foreground">{stage}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
