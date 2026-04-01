import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface ProspectionChartProps {
  data: { date: string; leads: number }[];
}

const VIEWBOX_WIDTH = 520;
const VIEWBOX_HEIGHT = 180;
const PADDING_X = 8;
const PADDING_TOP = 10;
const BASELINE_Y = 160;

export function ProspectionChart({ data }: ProspectionChartProps) {
  const points = useMemo(() => {
    const safeData = data.length > 0 ? data : [{ date: '1', leads: 0 }];
    const maxValue = Math.max(...safeData.map((item) => item.leads), 1);
    const stepX = safeData.length > 1 ? (VIEWBOX_WIDTH - PADDING_X * 2) / (safeData.length - 1) : 0;
    return safeData.map((item, index) => ({
      ...item,
      x: PADDING_X + stepX * index,
      y: BASELINE_Y - (item.leads / maxValue) * (BASELINE_Y - PADDING_TOP),
    }));
  }, [data]);

  const linePath = useMemo(() => {
    if (points.length < 2) return `M ${points[0]?.x || 0} ${points[0]?.y || 0}`;
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const cpx = (current.x + next.x) / 2;
      path += ` C ${cpx} ${current.y}, ${cpx} ${next.y}, ${next.x} ${next.y}`;
    }
    return path;
  }, [points]);

  const areaPath = useMemo(() => {
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    return `${linePath} L ${lastPoint.x} ${BASELINE_Y} L ${firstPoint.x} ${BASELINE_Y} Z`;
  }, [linePath, points]);

  const totalLeads = data.reduce((sum, d) => sum + d.leads, 0);

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Leads Capturados</CardTitle>
          </div>
          <p className="text-lg font-bold tabular-nums">{totalLeads.toLocaleString('pt-BR')}</p>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[180px] rounded-lg overflow-hidden">
          <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chart-area-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#chart-area-gradient)" />
            <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
            {points.length > 0 && (
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="3.5"
                fill="hsl(var(--primary))"
              />
            )}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
