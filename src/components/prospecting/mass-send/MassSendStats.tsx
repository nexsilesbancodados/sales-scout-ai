import { Badge } from '@/components/ui/badge';
import { Send, Clock, CheckCircle, Users, Zap } from 'lucide-react';

interface MassSendStatsProps {
  totalLeads: number;
  pendingLeads: number;
  sentLeads: number;
  selectedCount: number;
  hasActiveJob: boolean;
}

export function MassSendStats({ totalLeads, pendingLeads, sentLeads, selectedCount, hasActiveJob }: MassSendStatsProps) {
  const stats = [
    { label: 'Total', value: totalLeads, icon: Users, colorClass: 'text-foreground' },
    { label: 'Pendentes', value: pendingLeads, icon: Clock, colorClass: 'text-yellow-500' },
    { label: 'Enviados', value: sentLeads, icon: CheckCircle, colorClass: 'text-emerald-500' },
    { label: 'Selecionados', value: selectedCount, icon: Send, colorClass: 'text-primary' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 transition-all hover:border-border"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center justify-center h-9 w-9 rounded-lg bg-muted/60 ${stat.colorClass}`}>
              <stat.icon className="h-4.5 w-4.5" />
            </div>
            {stat.label === 'Selecionados' && hasActiveJob && (
              <Badge className="animate-pulse bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                <Zap className="h-3 w-3 mr-0.5" />
                Ativo
              </Badge>
            )}
          </div>
          <p className={`text-2xl font-bold tracking-tight ${stat.colorClass}`}>{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
