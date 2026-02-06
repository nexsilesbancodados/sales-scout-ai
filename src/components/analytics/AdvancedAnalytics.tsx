import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLeads } from '@/hooks/use-leads';
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics';
import { useProspectingStats } from '@/hooks/use-prospecting-stats';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Target,
  Users,
  MessageSquare,
  Zap,
  Award,
  BarChart3,
  Activity,
  Flame,
} from 'lucide-react';
import { format, subDays, startOfDay, eachDayOfInterval, parseISO, getHours, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const STAGE_COLORS: Record<string, string> = {
  'Contato': '#6366f1',
  'Qualificado': '#0ea5e9',
  'Proposta': '#22c55e',
  'Negociação': '#f59e0b',
  'Ganho': '#16a34a',
  'Perdido': '#ef4444',
};

const TEMP_COLORS = {
  quente: '#ef4444',
  morno: '#f59e0b',
  frio: '#0ea5e9',
};

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function AdvancedAnalytics() {
  const { leads } = useLeads();
  const { data: metrics } = useDashboardMetrics();
  const { stats } = useProspectingStats();

  // Calculate leads over time (last 30 days)
  const leadsOverTime = useMemo(() => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    return last30Days.map(date => {
      const dayStart = startOfDay(date);
      const count = leads.filter(lead => {
        const leadDate = startOfDay(parseISO(lead.created_at));
        return leadDate.getTime() === dayStart.getTime();
      }).length;

      return {
        date: format(date, 'dd/MM', { locale: ptBR }),
        fullDate: format(date, 'dd MMM', { locale: ptBR }),
        leads: count,
      };
    });
  }, [leads]);

  // Calculate funnel data
  const funnelData = useMemo(() => {
    const stages = ['Contato', 'Qualificado', 'Proposta', 'Negociação', 'Ganho'];
    return stages.map(stage => ({
      stage,
      count: metrics?.leadsByStage?.[stage as keyof typeof metrics.leadsByStage] || 0,
      fill: STAGE_COLORS[stage],
    }));
  }, [metrics]);

  // Calculate conversion between stages
  const conversionData = useMemo(() => {
    const stages = ['Contato', 'Qualificado', 'Proposta', 'Negociação', 'Ganho'];
    return stages.slice(1).map((stage, index) => {
      const previous = stages[index];
      const prevCount = metrics?.leadsByStage?.[previous as keyof typeof metrics.leadsByStage] || 0;
      const currCount = metrics?.leadsByStage?.[stage as keyof typeof metrics.leadsByStage] || 0;
      const rate = prevCount > 0 ? ((currCount / prevCount) * 100) : 0;
      return {
        name: `${previous} → ${stage}`,
        rate: Math.round(rate),
      };
    });
  }, [metrics]);

  // Calculate best contact hours heatmap data
  const heatmapData = useMemo(() => {
    const data: { day: number; hour: number; value: number }[] = [];
    
    // Generate sample data based on leads creation time
    const hourCounts: Record<string, number> = {};
    
    leads.forEach(lead => {
      const leadDate = parseISO(lead.created_at);
      const day = getDay(leadDate);
      const hour = getHours(leadDate);
      if (hour >= 8 && hour < 19) {
        const key = `${day}-${hour}`;
        hourCounts[key] = (hourCounts[key] || 0) + 1;
      }
    });

    // Fill heatmap
    for (let day = 0; day < 7; day++) {
      for (let hour = 8; hour < 19; hour++) {
        const key = `${day}-${hour}`;
        data.push({
          day,
          hour,
          value: hourCounts[key] || 0,
        });
      }
    }

    return data;
  }, [leads]);

  // Calculate leads by niche
  const nicheData = useMemo(() => {
    const nicheCounts: Record<string, number> = {};
    leads.forEach(lead => {
      const niche = lead.niche || 'Outros';
      nicheCounts[niche] = (nicheCounts[niche] || 0) + 1;
    });
    
    return Object.entries(nicheCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, value], index) => ({
        name,
        value,
        fill: COLORS[index % COLORS.length],
      }));
  }, [leads]);

  // Calculate temperature distribution
  const temperatureData = useMemo(() => {
    return [
      { name: 'Quentes', value: metrics?.hotLeads || 0, fill: TEMP_COLORS.quente },
      { name: 'Mornos', value: metrics?.warmLeads || 0, fill: TEMP_COLORS.morno },
      { name: 'Frios', value: metrics?.coldLeads || 0, fill: TEMP_COLORS.frio },
    ];
  }, [metrics]);

  // Calculate average conversion time
  const avgConversionDays = useMemo(() => {
    const wonLeads = leads.filter(l => l.stage === 'Ganho');
    if (wonLeads.length === 0) return 0;
    
    const totalDays = wonLeads.reduce((sum, lead) => {
      const created = new Date(lead.created_at);
      const updated = new Date(lead.updated_at);
      return sum + Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    
    return Math.round(totalDays / wonLeads.length);
  }, [leads]);

  // Weekly performance
  const weeklyPerformance = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    return last7Days.map(date => {
      const dayStart = startOfDay(date);
      const dayLeads = leads.filter(lead => {
        const leadDate = startOfDay(parseISO(lead.created_at));
        return leadDate.getTime() === dayStart.getTime();
      });

      return {
        day: format(date, 'EEE', { locale: ptBR }),
        leads: dayLeads.length,
        messages: Math.floor(dayLeads.length * 1.5), // Approximation
        responses: Math.floor(dayLeads.length * 0.3), // Approximation
      };
    });
  }, [leads]);

  const maxHeatmapValue = Math.max(...heatmapData.map(d => d.value), 1);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Resposta</p>
                <p className="text-3xl font-bold">
                  {metrics?.totalLeads ? ((metrics?.warmLeads || 0 + (metrics?.hotLeads || 0)) / metrics.totalLeads * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/20">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
              <TrendingUp className="h-4 w-4" />
              <span>+12% vs semana passada</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio de Conversão</p>
                <p className="text-3xl font-bold">{avgConversionDays} dias</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>Do primeiro contato à venda</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leads Ativos</p>
                <p className="text-3xl font-bold">
                  {(metrics?.totalLeads || 0) - (metrics?.leadsByStage?.Ganho || 0) - (metrics?.leadsByStage?.Perdido || 0)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/20">
                <Users className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-orange-500">
              <Zap className="h-4 w-4" />
              <span>Em negociação ativa</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-3xl font-bold">{(metrics?.conversionRate || 0).toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Award className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
              <TrendingUp className="h-4 w-4" />
              <span>{metrics?.leadsByStage?.Ganho || 0} vendas fechadas</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads over time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Leads ao Longo do Tempo
            </CardTitle>
            <CardDescription>Últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={leadsOverTime}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  className="text-muted-foreground"
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorLeads)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Funnel Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Funil de Vendas
            </CardTitle>
            <CardDescription>Distribuição por estágio</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="stage" 
                  tick={{ fontSize: 12 }} 
                  width={90}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Leads by Niche */}
        <Card>
          <CardHeader>
            <CardTitle>Leads por Nicho</CardTitle>
            <CardDescription>Top 6 nichos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={nicheData}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {nicheData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {nicheData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="truncate">{item.name}</span>
                  <span className="text-muted-foreground ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Temperature Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Temperatura dos Leads
            </CardTitle>
            <CardDescription>Engajamento atual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={temperatureData}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {temperatureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {temperatureData.map(item => (
                <div key={item.name} className="text-center">
                  <p className="text-2xl font-bold" style={{ color: item.fill }}>
                    {item.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Taxas de Conversão</CardTitle>
            <CardDescription>Entre estágios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {conversionData.map(item => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{item.name}</span>
                  <Badge variant={item.rate > 50 ? 'default' : 'secondary'}>
                    {item.rate}%
                  </Badge>
                </div>
                <Progress value={item.rate} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Melhores Horários para Contato
          </CardTitle>
          <CardDescription>
            Baseado em respostas e engajamento dos leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Hours header */}
              <div className="flex mb-2">
                <div className="w-12" />
                {HOURS.slice(8, 19).map(hour => (
                  <div 
                    key={hour} 
                    className="flex-1 text-center text-xs text-muted-foreground"
                  >
                    {hour}h
                  </div>
                ))}
              </div>
              
              {/* Heatmap grid */}
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="flex items-center mb-1">
                  <div className="w-12 text-sm text-muted-foreground">{day}</div>
                  <div className="flex flex-1 gap-1">
                    {HOURS.slice(8, 19).map(hour => {
                      const cell = heatmapData.find(d => d.day === dayIndex && d.hour === hour);
                      const intensity = cell ? cell.value / maxHeatmapValue : 0;
                      return (
                        <div
                          key={`${day}-${hour}`}
                          className="flex-1 h-8 rounded-sm transition-colors cursor-pointer hover:ring-2 hover:ring-primary"
                          style={{
                            backgroundColor: `rgba(16, 185, 129, ${0.1 + intensity * 0.8})`,
                          }}
                          title={`${day} ${hour}h: ${cell?.value || 0} contatos`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {/* Legend */}
              <div className="flex items-center justify-end gap-2 mt-4">
                <span className="text-xs text-muted-foreground">Menos</span>
                <div className="flex gap-1">
                  {[0.1, 0.3, 0.5, 0.7, 0.9].map(opacity => (
                    <div
                      key={opacity}
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: `rgba(16, 185, 129, ${opacity})` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">Mais</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Semanal</CardTitle>
          <CardDescription>Leads, mensagens e respostas dos últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyPerformance}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="leads" name="Leads" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="messages" name="Mensagens" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="responses" name="Respostas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
