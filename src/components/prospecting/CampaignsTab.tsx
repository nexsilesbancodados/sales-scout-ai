import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { useLeads } from '@/hooks/use-leads';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NicheAutocomplete } from './NicheAutocomplete';
import { LocationAutocomplete } from './LocationAutocomplete';
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
  Plus,
  Sparkles,
  FileText,
  UserCheck,
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
  const { campaigns, isLoading, createCampaign, isCreating, updateCampaign, deleteCampaign } = useCampaigns();
  const { settings } = useUserSettings();
  const { leads } = useLeads();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [campaignTab, setCampaignTab] = useState<'automatic' | 'manual'>('automatic');
  const [niches, setNiches] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [messageTemplate, setMessageTemplate] = useState('');
  const [useAIMessage, setUseAIMessage] = useState(true);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [leadSearch, setLeadSearch] = useState('');

  const savedLeads = leads?.filter(l => !l.message_sent) || [];
  const filteredLeads = savedLeads.filter(l =>
    l.business_name.toLowerCase().includes(leadSearch.toLowerCase()) ||
    (l.niche || '').toLowerCase().includes(leadSearch.toLowerCase())
  );

  const resetForm = () => {
    setName('');
    setCampaignTab('automatic');
    setNiches([]);
    setLocations([]);
    setMessageTemplate('');
    setUseAIMessage(true);
    setSelectedLeadIds([]);
    setLeadSearch('');
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast({ title: 'Nome obrigatório', description: 'Dê um nome para sua campanha.', variant: 'destructive' });
      return;
    }

    if (campaignTab === 'automatic' && (niches.length === 0 || locations.length === 0)) {
      toast({ title: 'Campos obrigatórios', description: 'Selecione pelo menos um nicho e uma localização.', variant: 'destructive' });
      return;
    }

    if (campaignTab === 'manual' && selectedLeadIds.length === 0) {
      toast({ title: 'Selecione leads', description: 'Escolha pelo menos um lead para a campanha manual.', variant: 'destructive' });
      return;
    }

    createCampaign({
      name: name.trim(),
      campaign_type: campaignTab,
      niches: campaignTab === 'automatic' ? niches : [],
      locations: campaignTab === 'automatic' ? locations : [],
      message_template: useAIMessage ? null : (messageTemplate.trim() || null),
      status: 'draft',
      scheduled_at: null,
      started_at: null,
      completed_at: null,
    });

    resetForm();
    setOpen(false);
  };

  const handleStartCampaign = async (campaign: Campaign) => {
    if (!settings?.whatsapp_connected) {
      toast({ title: 'WhatsApp não conectado', description: 'Conecte seu WhatsApp em Configurações antes de iniciar uma campanha.', variant: 'destructive' });
      return;
    }

    updateCampaign({ id: campaign.id, status: 'running', started_at: new Date().toISOString() });

    try {
      const response = await supabase.functions.invoke('hunter', {
        headers: { Authorization: `Bearer ${settings?.hunter_api_token}` },
        body: { niches: campaign.niches || [], locations: campaign.locations || [] },
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

      toast({ title: 'Campanha concluída', description: `${result.leads_created || 0} leads prospectados com sucesso!` });
    } catch (error: any) {
      updateCampaign({ id: campaign.id, status: 'failed' });
      toast({ title: 'Erro na campanha', description: error.message || 'Erro ao executar prospecção', variant: 'destructive' });
    }
  };

  const handlePauseCampaign = (campaign: Campaign) => {
    updateCampaign({ id: campaign.id, status: 'paused' });
  };

  const toggleLeadSelection = (id: string) => {
    setSelectedLeadIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllLeads = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Suas Campanhas</CardTitle>
          <CardDescription>Gerencie e acompanhe suas campanhas de prospecção</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Campanha</DialogTitle>
              <DialogDescription>Configure os detalhes da sua campanha de prospecção</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nome da Campanha</Label>
                <Input
                  placeholder="Ex: Restaurantes São Paulo"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <Tabs value={campaignTab} onValueChange={(v) => setCampaignTab(v as 'automatic' | 'manual')}>
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="automatic" className="gap-2">
                    <Zap className="h-3.5 w-3.5" />
                    Automática
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Manual
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="automatic" className="space-y-4 mt-4">
                  <p className="text-xs text-muted-foreground">
                    A IA captura leads automaticamente com base nos nichos e localizações selecionados.
                  </p>
                  <div className="space-y-2">
                    <Label>Nichos</Label>
                    <NicheAutocomplete
                      value={niches}
                      onChange={setNiches}
                      placeholder="Selecione os nichos..."
                      maxSelections={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Localizações</Label>
                    <LocationAutocomplete
                      value={locations}
                      onChange={setLocations}
                      placeholder="Selecione as localizações..."
                      maxSelections={10}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="space-y-4 mt-4">
                  <p className="text-xs text-muted-foreground">
                    Selecione leads salvos para disparar mensagens manualmente.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Leads Salvos</Label>
                      <span className="text-xs text-muted-foreground">
                        {selectedLeadIds.length} selecionado{selectedLeadIds.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <Input
                      placeholder="Buscar lead por nome ou nicho..."
                      value={leadSearch}
                      onChange={e => setLeadSearch(e.target.value)}
                      className="mb-2"
                    />
                    {filteredLeads.length > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <Checkbox
                          checked={selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0}
                          onCheckedChange={selectAllLeads}
                          id="select-all"
                        />
                        <label htmlFor="select-all" className="text-xs text-muted-foreground cursor-pointer">
                          Selecionar todos ({filteredLeads.length})
                        </label>
                      </div>
                    )}
                    <ScrollArea className="h-48 rounded-md border">
                      {filteredLeads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
                          <UserCheck className="h-8 w-8 mb-2 opacity-30" />
                          <p className="text-sm">Nenhum lead pendente encontrado</p>
                        </div>
                      ) : (
                        <div className="p-2 space-y-1">
                          {filteredLeads.map(lead => (
                            <label
                              key={lead.id}
                              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                            >
                              <Checkbox
                                checked={selectedLeadIds.includes(lead.id)}
                                onCheckedChange={() => toggleLeadSelection(lead.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{lead.business_name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {lead.niche || 'Sem nicho'} • {lead.location || 'Sem local'}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Message Template Section */}
              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Modelo de Mensagem
                  </Label>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium">IA Automática</span>
                    <Switch checked={useAIMessage} onCheckedChange={setUseAIMessage} />
                  </div>
                </div>

                {useAIMessage ? (
                  <div className="flex items-center gap-2 rounded-md bg-primary/5 border border-primary/10 px-3 py-2.5">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      A IA gerará mensagens personalizadas automaticamente para cada lead com base no nicho, localização e perfil do negócio.
                    </p>
                  </div>
                ) : (
                  <Textarea
                    placeholder="Olá {nome}, vi que você atua em {nicho}..."
                    value={messageTemplate}
                    onChange={e => setMessageTemplate(e.target.value)}
                    rows={3}
                  />
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={isCreating} className="gap-2">
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                Criar Campanha
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            <p className="text-sm mb-4">Crie sua primeira campanha de prospecção</p>
            <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Campanha
            </Button>
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
                        {(campaign.niches?.length || 0) > 1 && (
                          <span className="text-xs text-muted-foreground">+{campaign.niches!.length - 1}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {campaign.locations?.[0] || '-'}
                        {(campaign.locations?.length || 0) > 1 && (
                          <span className="text-xs text-muted-foreground">+{campaign.locations!.length - 1}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{campaign.leads_contacted || 0}</span>
                        <span className="text-muted-foreground">/{campaign.leads_found || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true, locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {campaign.status === 'draft' || campaign.status === 'paused' ? (
                          <Button size="sm" variant="outline" onClick={() => handleStartCampaign(campaign)}>
                            <Play className="h-4 w-4" />
                          </Button>
                        ) : campaign.status === 'running' ? (
                          <Button size="sm" variant="outline" onClick={() => handlePauseCampaign(campaign)}>
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteCampaign(campaign.id)}>
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
