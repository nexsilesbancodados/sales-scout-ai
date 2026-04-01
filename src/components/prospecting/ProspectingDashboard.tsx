import { Card, CardContent } from '@/components/ui/card';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useLeads } from '@/hooks/use-leads';
import { cn } from '@/lib/utils';
import {
  Search,
  Send,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';

export function ProspectingDashboard() {
  const { campaigns } = useCampaigns();
  const { leads } = useLeads();

  const totalLeadsProspected = campaigns.reduce((acc, c) => acc + (c.leads_found || 0), 0);
  const totalLeadsContacted = campaigns.reduce((acc, c) => acc + (c.leads_contacted || 0), 0);
  const totalLeadsResponded = campaigns.reduce((acc, c) => acc + (c.leads_responded || 0), 0);
  const responseRate = totalLeadsContacted > 0 
    ? ((totalLeadsResponded / totalLeadsContacted) * 100).toFixed(1) 
    : '0';

  const stats = [
    {
      icon: Search,
      value: totalLeadsProspected || leads.length,
      label: 'Encontrados',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/15',
      borderColor: 'border-blue-500/20',
      glowColor: 'shadow-blue-500/10',
    },
    {
      icon: Send,
      value: totalLeadsContacted,
      label: 'Contatados',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/15',
      borderColor: 'border-emerald-500/20',
      glowColor: 'shadow-emerald-500/10',
    },
    {
      icon: MessageSquare,
      value: totalLeadsResponded,
      label: 'Respostas',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/15',
      borderColor: 'border-amber-500/20',
      glowColor: 'shadow-amber-500/10',
    },
    {
      icon: TrendingUp,
      value: `${responseRate}%`,
      label: 'Taxa Resposta',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/15',
      borderColor: 'border-purple-500/20',
      glowColor: 'shadow-purple-500/10',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card 
          key={stat.label} 
          className={cn(
            "relative overflow-hidden group cursor-default border transition-all duration-300 hover:scale-[1.02]",
            stat.borderColor,
            `hover:shadow-lg ${stat.glowColor}`
          )}
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <CardContent className="p-4 sm:p-5 relative">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={cn(
                "p-2.5 sm:p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                stat.bgColor
              )}>
                <stat.icon className={cn("h-4 w-4 sm:h-5 sm:w-5", stat.color)} />
              </div>
              <div className="min-w-0">
                <p className={cn("text-xl sm:text-2xl font-bold tracking-tight", stat.color)}>
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
