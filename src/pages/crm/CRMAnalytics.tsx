import { useMemo } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeads } from '@/hooks/use-leads';
import { LeadStage } from '@/types/database';
import { allStages } from '@/constants/lead-icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';
import { DollarSign, TrendingUp, Target, Users, Loader2 } from 'lucide-react';

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function CRMAnalyticsPage() {
  const { leads, isLoading } = useLeads();

  const metrics = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const active = leads.filter(l => !['Ganho', 'Perdido'].includes(l.stage));
    const wonThisMonth = leads.filter(l => l.stage === 'Ganho' && new Date(l.updated_at) >= monthStart);
    const totalPipeline = active.reduce((s, l) => s + (l.deal_value || 0), 0);
    const wonValues = leads.filter(l => l.stage === 'Ganho').map(l => l.deal_value || 0);
    const avgTicket = wonValues.length > 0 ? wonValues.reduce((a, b) => a + b, 0) / wonValues.length : 0;
    const totalLeads = leads.filter(l => l.stage !== 'Perdido').length;
    const wonTotal = leads.filter(l => l.stage === 'Ganho').length;
    const conversionRate = totalLeads > 0 ? (wonTotal / totalLeads) * 100 : 0;

    return { totalPipeline, wonThisMonth: wonThisMonth.length, conversionRate, avgTicket };
  }, [leads]);

  const funnelData = useMemo(() =>
    allStages.map(stage => ({ name: stage, count: leads.filter(l => l.stage === stage).length })),
    [leads]
  );

  const sourceData = useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach(l => { const s = l.source || 'manual'; map.set(s, (map.get(s) || 0) + 1); });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const nicheData = useMemo(() => {
    const map = new Map<string, { total: number; won: number; value: number }>();
    leads.forEach(l => {
      const n = l.niche || 'Outros';
      const existing = map.get(n) || { total: 0, won: 0, value: 0 };
      existing.total++;
      if (l.stage === 'Ganho') existing.won++;
      existing.value += l.deal_value || 0;
      map.set(n, existing);
    });
    return Array.from(map.entries()).map(([name, d]) => ({ name, total: d.total, conversion: d.total > 0 ? Math.round((d.won / d.total) * 100) : 0, avgValue: d.total > 0 ? Math.round(d.value / d.total) : 0 })).slice(0, 8);
  }, [leads]);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  if (isLoading) return <CRMLayout title="Analytics CRM"><div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></CRMLayout>;

  return (
    <CRMLayout title="Analytics CRM">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total em Pipeline', value: fmt(metrics.totalPipeline), icon: DollarSign, color: 'text-green-500' },
          { label: 'Convertidos no Mês', value: metrics.wonThisMonth.toString(), icon: TrendingUp, color: 'text-blue-500' },
          { label: 'Taxa de Conversão', value: `${metrics.conversionRate.toFixed(1)}%`, icon: Target, color: 'text-purple-500' },
          { label: 'Ticket Médio', value: fmt(metrics.avgTicket), icon: Users, color: 'text-amber-500' },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center bg-muted ${kpi.color}`}><kpi.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Funil de Conversão</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sources */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Leads por Fonte</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Niche analysis */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm">Análise por Nicho</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={nicheData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conversion" name="Conversão %" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}
