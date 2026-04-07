import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface ProspectionChartProps {
  data: { date: string; leads: number }[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-popover/95 backdrop-blur-sm px-4 py-2.5 shadow-xl text-xs">
      <p className="text-muted-foreground mb-0.5 font-medium">{label}</p>
      <p className="font-bold text-foreground text-sm">{payload[0].value} <span className="text-muted-foreground font-medium text-xs">leads</span></p>
    </div>
  );
}

export function ProspectionChart({ data }: ProspectionChartProps) {
  const totalLeads = useMemo(() => data.reduce((sum, d) => sum + d.leads, 0), [data]);

  const ticks = useMemo(() => {
    if (data.length <= 7) return data.map(d => d.date);
    const step = Math.ceil(data.length / 6);
    return data.filter((_, i) => i % step === 0).map(d => d.date);
  }, [data]);

  return (
    <Card className="border-border/50 hover:border-border/70 transition-colors duration-300 overflow-hidden">
      {/* Subtle gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
      
      <CardHeader className="pb-1 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-bold">Leads Capturados</CardTitle>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-xl font-extrabold tabular-nums text-primary">{totalLeads.toLocaleString('pt-BR')}</p>
            <span className="text-[10px] text-muted-foreground font-medium">total</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 relative">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                ticks={ticks}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.3 }} />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#leadsFill)"
                dot={false}
                activeDot={{ r: 5, stroke: 'hsl(var(--primary))', strokeWidth: 2.5, fill: 'hsl(var(--background))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
