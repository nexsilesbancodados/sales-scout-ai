import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics';
import { useLeads } from '@/hooks/use-leads';
import { Loader2, TrendingUp, Users, Target, BarChart3 } from 'lucide-react';
import { LeadStage } from '@/types/database';

const stageColors: Record<LeadStage, string> = {
  'Contato': '#6366f1',
  'Qualificado': '#0ea5e9',
  'Proposta': '#22c55e',
  'Negociação': '#f59e0b',
  'Ganho': '#16a34a',
  'Perdido': '#ef4444',
};

export default function AnalyticsPage() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { leads, isLoading: leadsLoading } = useLeads();

  const isLoading = metricsLoading || leadsLoading;

  // Calculate funnel data
  const funnelData = metrics?.leadsByStage
    ? Object.entries(metrics.leadsByStage).map(([stage, count]) => ({
        stage: stage as LeadStage,
        count,
        percentage: metrics.totalLeads > 0 ? (count / metrics.totalLeads) * 100 : 0,
      }))
    : [];

  // Calculate conversion rates between stages
  const stageOrder: LeadStage[] = ['Contato', 'Qualificado', 'Proposta', 'Negociação', 'Ganho'];
  const conversionRates = stageOrder.slice(1).map((stage, index) => {
    const previousStage = stageOrder[index];
    const previousCount = metrics?.leadsByStage?.[previousStage] || 0;
    const currentCount = metrics?.leadsByStage?.[stage] || 0;
    const rate = previousCount > 0 ? (currentCount / previousCount) * 100 : 0;
    return {
      from: previousStage,
      to: stage,
      rate,
    };
  });

  // Leads by niche
  const nicheData = leads.reduce((acc, lead) => {
    const niche = lead.niche || 'Não definido';
    acc[niche] = (acc[niche] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topNiches = Object.entries(nicheData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <DashboardLayout
      title="Análise"
      description="Métricas e insights sobre sua prospecção"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total de Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics?.totalLeads || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Leads Ganhos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">
                  {metrics?.leadsByStage?.Ganho || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Taxa de Conversão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {(metrics?.conversionRate || 0).toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Reuniões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics?.meetingsScheduled || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Funnel Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Funil de Vendas</CardTitle>
                <CardDescription>Distribuição de leads por estágio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnelData.map((item) => (
                    <div key={item.stage}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.stage}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.count} ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: stageColors[item.stage],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Conversion Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Taxas de Conversão</CardTitle>
                <CardDescription>Conversão entre estágios do funil</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionRates.map((item) => (
                    <div key={`${item.from}-${item.to}`} className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {item.from} → {item.to}
                        </p>
                        <div className="h-2 bg-muted rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(item.rate, 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-lg font-bold w-16 text-right">
                        {item.rate.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Niches */}
            <Card>
              <CardHeader>
                <CardTitle>Top Nichos</CardTitle>
                <CardDescription>Nichos com mais leads</CardDescription>
              </CardHeader>
              <CardContent>
                {topNiches.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Sem dados suficientes
                  </p>
                ) : (
                  <div className="space-y-4">
                    {topNiches.map(([niche, count], index) => (
                      <div key={niche} className="flex items-center gap-4">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="flex-1 font-medium">{niche}</span>
                        <span className="text-muted-foreground">{count} leads</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Temperature Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Temperatura</CardTitle>
                <CardDescription>Classificação de engajamento dos leads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-temp-hot/10">
                    <div className="text-3xl font-bold text-temp-hot">
                      {metrics?.hotLeads || 0}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Quentes</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-temp-warm/10">
                    <div className="text-3xl font-bold text-temp-warm">
                      {metrics?.warmLeads || 0}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Mornos</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-temp-cold/10">
                    <div className="text-3xl font-bold text-temp-cold">
                      {metrics?.coldLeads || 0}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Frios</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
