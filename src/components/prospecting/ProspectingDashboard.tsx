import { Card, CardContent } from '@/components/ui/card';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useLeads } from '@/hooks/use-leads';
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
      label: 'Leads Encontrados',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Send,
      value: totalLeadsContacted,
      label: 'Leads Contatados',
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      icon: MessageSquare,
      value: totalLeadsResponded,
      label: 'Respostas',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: TrendingUp,
      value: `${responseRate}%`,
      label: 'Taxa de Resposta',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card 
          key={stat.label} 
          className="card-hover overflow-hidden"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-xl ${stat.bgColor} transition-transform duration-200 hover:scale-110`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
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
