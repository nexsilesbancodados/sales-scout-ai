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

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalLeadsProspected || leads.length}</p>
              <p className="text-sm text-muted-foreground">Leads Encontrados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Send className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalLeadsContacted}</p>
              <p className="text-sm text-muted-foreground">Leads Contatados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <MessageSquare className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalLeadsResponded}</p>
              <p className="text-sm text-muted-foreground">Respostas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-yellow-500/10">
              <TrendingUp className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{responseRate}%</p>
              <p className="text-sm text-muted-foreground">Taxa de Resposta</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
