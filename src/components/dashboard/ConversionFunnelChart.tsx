import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart3, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const stageConfig: Record<string, { color: string; label: string }> = {
  'Contato': { color: 'bg-info', label: 'Contato' },
  'Qualificado': { color: 'bg-primary', label: 'Qualificado' },
  'Proposta': { color: 'bg-chart-4', label: 'Proposta' },
  'Negociação': { color: 'bg-warning', label: 'Negociação' },
  'Ganho': { color: 'bg-success', label: 'Ganho' },
  'Perdido': { color: 'bg-destructive/60', label: 'Perdido' },
};

interface ConversionFunnelChartProps {
  stages: [string, number][];
  totalLeads: number;
}

export function ConversionFunnelChart({ stages, totalLeads }: ConversionFunnelChartProps) {
  return (
    <Card className="border-border/40">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Funil de Conversão</CardTitle>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground text-xs h-7 gap-1">
            <Link to="/funnel">Ver funil <ArrowRight className="h-3 w-3" /></Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {stages.length > 0 ? (
          <div className="space-y-4">
            {stages.map(([stage, count]) => {
              const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
              const config = stageConfig[stage] || { color: 'bg-muted-foreground', label: stage };
              return (
                <div key={stage}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", config.color)} />
                      <span className="text-xs text-muted-foreground">{config.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums">{count}</span>
                      <span className="text-[10px] text-muted-foreground/40 tabular-nums w-7 text-right">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-700", config.color)} style={{ width: `${Math.max(percentage, 2)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-3 opacity-20" />
            <p className="text-xs font-medium">Sem dados no funil</p>
            <p className="text-[10px] mt-1 text-muted-foreground/50">Capture leads para ver o funil</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
