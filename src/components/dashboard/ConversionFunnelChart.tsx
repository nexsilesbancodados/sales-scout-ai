import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart3, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const stageConfig: Record<string, { color: string; bgLight: string; label: string }> = {
  'Contato': { color: 'bg-info', bgLight: 'bg-info/10', label: 'Contato' },
  'Qualificado': { color: 'bg-primary', bgLight: 'bg-primary/10', label: 'Qualificado' },
  'Proposta': { color: 'bg-stage-proposal', bgLight: 'bg-stage-proposal/10', label: 'Proposta' },
  'Negociação': { color: 'bg-warning', bgLight: 'bg-warning/10', label: 'Negociação' },
  'Ganho': { color: 'bg-success', bgLight: 'bg-success/10', label: 'Ganho' },
  'Perdido': { color: 'bg-destructive/60', bgLight: 'bg-destructive/10', label: 'Perdido' },
};

interface ConversionFunnelChartProps {
  stages: [string, number][];
  totalLeads: number;
}

export function ConversionFunnelChart({ stages, totalLeads }: ConversionFunnelChartProps) {
  return (
    <Card className="border-border/50 hover:border-primary/10 transition-colors duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Funil de Conversão</CardTitle>
              <p className="text-[10px] text-muted-foreground mt-0.5">{totalLeads} leads no funil</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground gap-1 text-xs h-7">
            <Link to="/funnel">
              Ver funil <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {stages.length > 0 ? (
          <div className="space-y-3.5">
            {stages.map(([stage, count]) => {
              const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
              const config = stageConfig[stage] || { color: 'bg-muted-foreground', bgLight: 'bg-muted', label: stage };
              return (
                <div key={stage} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", config.color)} />
                      <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tabular-nums">{count}</span>
                      <span className="text-[10px] text-muted-foreground/40 tabular-nums w-8 text-right">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        config.color
                      )}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
              <BarChart3 className="h-5 w-5 opacity-30" />
            </div>
            <p className="text-xs font-semibold">Sem dados no funil</p>
            <p className="text-[10px] mt-1 text-muted-foreground/50">Capture leads para ver o funil</p>
            <Button asChild variant="link" className="mt-2 text-xs h-auto p-0">
              <Link to="/prospecting">Capturar leads →</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
