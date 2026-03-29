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
    {
      label: 'Total',
      value: totalLeads,
      icon: Users,
      color: 'text-foreground',
      bg: 'bg-muted',
    },
    {
      label: 'Pendentes',
      value: pendingLeads,
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Enviados',
      value: sentLeads,
      icon: CheckCircle,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Selecionados',
      value: selectedCount,
      icon: Send,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`relative overflow-hidden rounded-xl border p-4 ${stat.bg} transition-all hover:scale-[1.02]`}
        >
          <div className="flex items-center justify-between mb-2">
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            {stat.label === 'Selecionados' && hasActiveJob && (
              <Badge className="animate-pulse bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                <Zap className="h-3 w-3 mr-0.5" />
                Ativo
              </Badge>
            )}
          </div>
          <p className={`text-2xl font-bold tracking-tight ${stat.color}`}>{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
