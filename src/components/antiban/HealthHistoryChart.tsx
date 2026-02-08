import { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { ChipHealthLog } from '@/hooks/use-antiban';

interface HealthHistoryChartProps {
  data: ChipHealthLog[];
}

export function HealthHistoryChart({ data }: HealthHistoryChartProps) {
  const chartData = useMemo(() => {
    if (!data?.length) return [];

    return data
      .slice()
      .reverse()
      .map((log) => ({
        time: new Date(log.created_at).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        hour: log.messages_sent_hour,
        day: log.messages_sent_day,
        health: log.health_status === 'healthy' ? 100 : 
                log.health_status === 'warning' ? 60 : 
                log.health_status === 'critical' ? 30 : 0,
      }));
  }, [data]);

  if (!chartData.length) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
        <p className="text-sm">Sem dados de histórico ainda</p>
      </div>
    );
  }

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorHour" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10 }} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10 }} 
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Area
            type="monotone"
            dataKey="hour"
            name="Msgs/hora"
            stroke="hsl(var(--primary))"
            fill="url(#colorHour)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="health"
            name="Saúde"
            stroke="hsl(var(--chart-2))"
            fill="url(#colorHealth)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
