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

  const linePath = useMemo(
    () => points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' '),
    [points],
  );

  const areaPath = useMemo(() => {
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];

    return `${linePath} L ${lastPoint.x} ${BASELINE_Y} L ${firstPoint.x} ${BASELINE_Y} Z`;
  }, [linePath, points]);

  const highlightPoints = useMemo(() => {
    const middleIndex = Math.floor(points.length / 2);
    return points.filter((_, index) => index === 0 || index === middleIndex || index === points.length - 1);
  }, [points]);

  const labels = useMemo(() => {
    if (data.length <= 3) return data;
    return [data[0], data[Math.floor(data.length / 2)], data[data.length - 1]];
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">Leads Capturados</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] overflow-hidden rounded-xl border border-border/50 bg-muted/20 p-3">
          <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="dashboard-leads-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.32" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
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
                  strokeDasharray="4 6"
                  opacity="0.8"
                />
              );
            })}

            <path d={areaPath} fill="url(#dashboard-leads-area)" />
            <path
              d={linePath}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {highlightPoints.map((point) => (
              <g key={`${point.date}-${point.x}`}>
                <circle cx={point.x} cy={point.y} r="6" fill="hsl(var(--background))" opacity="0.95" />
                <circle cx={point.x} cy={point.y} r="3.5" fill="hsl(var(--primary))" />
              </g>
            ))}
          </svg>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          {labels.map((label, index) => (
            <span key={`${label.date}-${index}`}>Dia {label.date}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
