import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ProspectingHistory } from '@/hooks/use-prospecting-history';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Send,
  CheckCircle2,
  XCircle,
  Activity,
  Zap,
} from 'lucide-react';

interface ProspectingMetricsDashboardProps {
  history: ProspectingHistory[];
}

export function ProspectingMetricsDashboard({ history }: ProspectingMetricsDashboardProps) {
  // Calculate metrics
  const metrics = useMemo(() => {
    const today = new Date();
    const last7Days = subDays(today, 7);
    const last30Days = subDays(today, 30);

    // Filter history by date ranges
    const last7DaysHistory = history.filter((h) =>
      isWithinInterval(new Date(h.created_at), { start: last7Days, end: today })
    );
    const last30DaysHistory = history.filter((h) =>
      isWithinInterval(new Date(h.created_at), { start: last30Days, end: today })
    );

    // Total stats
    const totalLeads = history.reduce((acc, h) => acc + h.total_found, 0);
    const totalSent = history.reduce((acc, h) => acc + h.total_sent, 0);
    const totalErrors = history.reduce((acc, h) => acc + h.total_errors, 0);
    const totalDuplicates = history.reduce((acc, h) => acc + h.total_duplicates, 0);

    // Last 7 days stats
    const leads7Days = last7DaysHistory.reduce((acc, h) => acc + h.total_found, 0);
    const sent7Days = last7DaysHistory.reduce((acc, h) => acc + h.total_sent, 0);

    // Conversion rate
    const conversionRate = totalLeads > 0 ? ((totalSent / totalLeads) * 100).toFixed(1) : '0';
    const errorRate = totalLeads > 0 ? ((totalErrors / totalLeads) * 100).toFixed(1) : '0';

    // Daily chart data (last 7 days)
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayHistory = history.filter((h) =>
        isWithinInterval(new Date(h.created_at), {
          start: startOfDay(date),
          end: endOfDay(date),
        })
      );
      dailyData.push({
        date: format(date, 'dd/MM', { locale: ptBR }),
        leads: dayHistory.reduce((acc, h) => acc + h.total_found, 0),
        enviados: dayHistory.reduce((acc, h) => acc + h.total_sent, 0),
        erros: dayHistory.reduce((acc, h) => acc + h.total_errors, 0),
      });
    }

    // Performance by niche
    const nichePerformance: Record<string, { leads: number; sent: number; errors: number }> = {};
    history.forEach((h) => {
      const niche = h.niche || 'Outros';
      if (!nichePerformance[niche]) {
        nichePerformance[niche] = { leads: 0, sent: 0, errors: 0 };
      }
      nichePerformance[niche].leads += h.total_found;
      nichePerformance[niche].sent += h.total_sent;
      nichePerformance[niche].errors += h.total_errors;
    });

    const nicheData = Object.entries(nichePerformance)
      .map(([name, data]) => ({
        name: name.split(',')[0].trim(),
        leads: data.leads,
        enviados: data.sent,
        taxa: data.leads > 0 ? Math.round((data.sent / data.leads) * 100) : 0,
      }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 6);

    // Session type distribution
    const sessionTypeDistribution = history.reduce(
      (acc, h) => {
        acc[h.session_type] = (acc[h.session_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const pieData = Object.entries(sessionTypeDistribution).map(([type, count]) => ({
      name: getTypeLabel(type),
      value: count,
    }));

    return {
      totalLeads,
      totalSent,
      totalErrors,
      totalDuplicates,
      leads7Days,
      sent7Days,
      conversionRate,
      errorRate,
      dailyData,
      nicheData,
      pieData,
      sessions: history.length,
    };
  }, [history]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
              </div>
              <div className="p-3 rounded-full bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
            <Progress value={parseFloat(metrics.conversionRate)} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leads (7 dias)</p>
                <p className="text-2xl font-bold">{metrics.leads7Days}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Badge variant="secondary">{metrics.sent7Days} enviados</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Erro</p>
                <p className="text-2xl font-bold">{metrics.errorRate}%</p>
              </div>
              <div className="p-3 rounded-full bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
            </div>
            <Progress value={parseFloat(metrics.errorRate)} className="mt-3 h-2 [&>div]:bg-destructive" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sessões Totais</p>
                <p className="text-2xl font-bold">{metrics.sessions}</p>
              </div>
              <div className="p-3 rounded-full bg-info/10">
                <Activity className="h-5 w-5 text-info" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Badge variant="secondary">{metrics.totalDuplicates} duplicados</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Performance Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-warning" />
              Performance Diária (7 dias)
            </CardTitle>
            <CardDescription>Leads capturados e enviados por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={metrics.dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.3)"
                  name="Leads"
                />
                <Area
                  type="monotone"
                  dataKey="enviados"
                  stackId="2"
                  stroke="hsl(var(--success))"
                  fill="hsl(var(--success) / 0.3)"
                  name="Enviados"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Niche Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Performance por Nicho
            </CardTitle>
            <CardDescription>Top nichos por volume de leads</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metrics.nicheData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="leads" fill="hsl(var(--primary))" name="Leads" radius={[0, 4, 4, 0]} />
                <Bar dataKey="enviados" fill="hsl(var(--success))" name="Enviados" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Session Type Distribution */}
      {metrics.pieData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribuição por Tipo de Sessão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={metrics.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {metrics.pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    capture: 'Maps',
    mass_send: 'Disparo',
    campaign: 'Campanha',
    import: 'Importação',
    web_search: 'Web',
  };
  return labels[type] || type;
}
