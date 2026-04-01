import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface ProspectionChartProps {
  data: { date: string; leads: number }[];
}

const VIEWBOX_WIDTH = 520;
const VIEWBOX_HEIGHT = 200;
const PADDING_X = 16;
const PADDING_TOP = 14;
const BASELINE_Y = 164;

export function ProspectionChart({ data }: ProspectionChartProps) {
  const points = useMemo(() => {
    const safeData = data.length > 0 ? data : [{ date: '1', leads: 0 }];
    const maxValue = Math.max(...safeData.map((item) => item.leads), 1);
    const stepX =
      safeData.length > 1 ? (VIEWBOX_WIDTH - PADDING_X * 2) / (safeData.length - 1) : 0;

    return safeData.map((item, index) => ({
      ...item,
      x: PADDING_X + stepX * index,
      y: BASELINE_Y - (item.leads / maxValue) * (BASELINE_Y - PADDING_TOP),
    }));
  }, [data]);

  // Smooth curved path using bezier curves
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

  const labels = useMemo(() => {
    if (data.length <= 3) return data;
    return [data[0], data[Math.floor(data.length / 2)], data[data.length - 1]];
  }, [data]);

  return (
    <Card className="border-border/50 hover:border-primary/10 transition-colors duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-primary/10 p-2">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Leads Capturados</CardTitle>
              <p className="text-[10px] text-muted-foreground mt-0.5">Evolução do período</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums">{totalLeads.toLocaleString('pt-BR')}</p>
            <p className="text-[10px] text-muted-foreground">total</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] overflow-hidden rounded-xl border border-border/30 bg-gradient-to-b from-muted/10 to-muted/30 p-3">
          <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="dashboard-leads-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.08" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {Array.from({ length: 4 }).map((_, index) => {
              const y = PADDING_TOP + ((BASELINE_Y - PADDING_TOP) / 3) * index;
              return (
                <line
                  key={y}
                  x1={PADDING_X}
                  x2={VIEWBOX_WIDTH - PADDING_X}
                  y1={y}
                  y2={y}
                  stroke="hsl(var(--border))"
                  strokeDasharray="3 8"
                  opacity="0.5"
                />
              );
            })}

            <path d={areaPath} fill="url(#dashboard-leads-area)" />
            <path
              d={linePath}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />

            {/* Last point highlight */}
            {points.length > 0 && (
              <g>
                <circle
                  cx={points[points.length - 1].x}
                  cy={points[points.length - 1].y}
                  r="8"
                  fill="hsl(var(--primary))"
                  opacity="0.15"
                />
                <circle
                  cx={points[points.length - 1].x}
                  cy={points[points.length - 1].y}
                  r="4"
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground/60 font-medium">
          {labels.map((label, index) => (
            <span key={`${label.date}-${index}`}>Dia {label.date}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
