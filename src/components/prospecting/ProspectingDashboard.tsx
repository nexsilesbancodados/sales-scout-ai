import { Card, CardContent } from '@/components/ui/card';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useLeads } from '@/hooks/use-leads';
import { cn } from '@/lib/utils';
import {
  Search,
  Send,
  MessageSquare,
  TrendingUp,
  Target,
  Sparkles,
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
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      gradient: 'from-primary/5 to-primary/10',
    },
    {
      icon: Send,
      value: totalLeadsContacted,
      label: 'Contatados',
      color: 'text-info',
      bgColor: 'bg-info/10',
      gradient: 'from-info/5 to-info/10',
    },
    {
      icon: MessageSquare,
      value: totalLeadsResponded,
      label: 'Respostas',
      color: 'text-success',
      bgColor: 'bg-success/10',
      gradient: 'from-success/5 to-success/10',
    },
    {
      icon: TrendingUp,
      value: `${responseRate}%`,
      label: 'Taxa Resposta',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      gradient: 'from-warning/5 to-warning/10',
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card 
          key={stat.label} 
          className="relative overflow-hidden group cursor-default animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Gradient overlay on hover */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            stat.gradient
          )} />
          
          <CardContent className="p-5 relative">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl transition-transform duration-200 group-hover:scale-110",
                stat.bgColor
              )}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div className="space-y-0.5">
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
