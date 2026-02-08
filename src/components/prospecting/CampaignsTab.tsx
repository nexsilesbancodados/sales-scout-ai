import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCampaigns, CampaignStatus, Campaign } from '@/hooks/use-campaigns';
import { useUserSettings } from '@/hooks/use-user-settings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Rocket,
  Play,
  Pause,
  Trash2,
  Loader2,
  MapPin,
  Building2,
  Zap,
  Users,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusColors: Record<CampaignStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-blue-500/20 text-blue-400',
  running: 'bg-green-500/20 text-green-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-primary/20 text-primary',
  failed: 'bg-destructive/20 text-destructive',
};

const statusLabels: Record<CampaignStatus, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendada',
  running: 'Executando',
  paused: 'Pausada',
  completed: 'Concluída',
  failed: 'Falhou',
};

export function CampaignsTab() {
  const { campaigns, isLoading, updateCampaign, deleteCampaign } = useCampaigns();
  const { settings } = useUserSettings();
  const { toast } = useToast();

  const handleStartCampaign = async (campaign: Campaign) => {
    if (!settings?.whatsapp_connected) {
      toast({
        title: 'WhatsApp não conectado',
        description: 'Conecte seu WhatsApp em Configurações antes de iniciar uma campanha.',
        variant: 'destructive',
      });
      return;
    }

    updateCampaign({
      id: campaign.id,
      status: 'running',
      started_at: new Date().toISOString(),
    });

    try {
      const response = await supabase.functions.invoke('hunter', {
        headers: {
          Authorization: `Bearer ${settings?.hunter_api_token}`,
        },
        body: {
          niches: campaign.niches || [],
          locations: campaign.locations || [],
        },
      });

      if (response.error) throw response.error;

      const result = response.data;
      
      updateCampaign({
        id: campaign.id,
        status: 'completed',
        completed_at: new Date().toISOString(),
        leads_found: result.leads_created || 0,
        leads_contacted: result.leads_created || 0,
      });

      toast({
        title: 'Campanha concluída',
        description: `${result.leads_created || 0} leads prospectados com sucesso!`,
      });
    } catch (error: any) {
      updateCampaign({
        id: campaign.id,
        status: 'failed',
      });
      toast({
        title: 'Erro na campanha',
        description: error.message || 'Erro ao executar prospecção',
        variant: 'destructive',
      });
    }
  };

  const handlePauseCampaign = (campaign: Campaign) => {
    updateCampaign({
      id: campaign.id,
      status: 'paused',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suas Campanhas</CardTitle>
        <CardDescription>Gerencie e acompanhe suas campanhas de prospecção</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Rocket className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhuma campanha criada</p>
            <p className="text-sm">Crie sua primeira campanha de prospecção</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Nicho</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Criada</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {campaign.campaign_type === 'automatic' ? (
                          <><Zap className="h-3 w-3 mr-1" /> Auto</>
                        ) : (
                          <><Users className="h-3 w-3 mr-1" /> Manual</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[campaign.status]}>
                        {statusLabels[campaign.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        {campaign.niches?.[0] || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {campaign.locations?.[0] || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{campaign.leads_contacted || 0}</span>
                        <span className="text-muted-foreground">/{campaign.leads_found || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(campaign.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {campaign.status === 'draft' || campaign.status === 'paused' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartCampaign(campaign)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        ) : campaign.status === 'running' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePauseCampaign(campaign)}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => deleteCampaign(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
