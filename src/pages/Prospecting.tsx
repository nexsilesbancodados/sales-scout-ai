import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCampaigns, Campaign, CampaignStatus } from '@/hooks/use-campaigns';
import { useLeads } from '@/hooks/use-leads';
import { useUserSettings } from '@/hooks/use-user-settings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Rocket,
  Target,
  Upload,
  Calendar,
  BarChart3,
  Play,
  Pause,
  Trash2,
  Plus,
  MapPin,
  Building2,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  FileSpreadsheet,
  Users,
  TrendingUp,
  Zap,
  Search,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
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

const NICHES = [
  'Restaurantes',
  'Clínicas',
  'Academias',
  'Salões de Beleza',
  'Escritórios de Advocacia',
  'Imobiliárias',
  'Lojas de Roupas',
  'Petshops',
  'Oficinas Mecânicas',
  'Dentistas',
  'Psicólogos',
  'Contadores',
  'Consultórios Médicos',
  'Escolas',
  'Autoescolas',
];

const LOCATIONS = [
  'São Paulo, SP',
  'Rio de Janeiro, RJ',
  'Belo Horizonte, MG',
  'Brasília, DF',
  'Salvador, BA',
  'Fortaleza, CE',
  'Curitiba, PR',
  'Recife, PE',
  'Porto Alegre, RS',
  'Goiânia, GO',
  'Campinas, SP',
  'Manaus, AM',
];

export default function ProspectingPage() {
  const { campaigns, isLoading, createCampaign, updateCampaign, deleteCampaign, isCreating } = useCampaigns();
  const { leads } = useLeads();
  const { settings } = useUserSettings();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [selectedLeadsForMass, setSelectedLeadsForMass] = useState<string[]>([]);
  const [massMessage, setMassMessage] = useState('');
  const [isSendingMass, setIsSendingMass] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New campaign form state
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    campaign_type: 'automatic' as 'automatic' | 'manual',
    niches: [] as string[],
    locations: [] as string[],
    message_template: '',
    scheduled_at: null as string | null,
  });

  // Statistics
  const totalLeadsProspected = campaigns.reduce((acc, c) => acc + c.leads_found, 0);
  const totalLeadsContacted = campaigns.reduce((acc, c) => acc + c.leads_contacted, 0);
  const totalLeadsResponded = campaigns.reduce((acc, c) => acc + c.leads_responded, 0);
  const responseRate = totalLeadsContacted > 0 ? ((totalLeadsResponded / totalLeadsContacted) * 100).toFixed(1) : '0';

  const handleCreateCampaign = () => {
    if (!newCampaign.name || newCampaign.niches.length === 0 || newCampaign.locations.length === 0) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome, nicho e localização.',
        variant: 'destructive',
      });
      return;
    }

    createCampaign({
      name: newCampaign.name,
      status: newCampaign.scheduled_at ? 'scheduled' : 'draft',
      campaign_type: newCampaign.campaign_type,
      niches: newCampaign.niches,
      locations: newCampaign.locations,
      message_template: newCampaign.message_template || null,
      scheduled_at: newCampaign.scheduled_at,
      started_at: null,
      completed_at: null,
    });

    setNewCampaign({
      name: '',
      campaign_type: 'automatic',
      niches: [],
      locations: [],
      message_template: '',
      scheduled_at: null,
    });
    setIsNewCampaignOpen(false);
  };

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

    // Trigger hunter agent
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('hunter', {
        headers: {
          Authorization: `Bearer ${settings?.hunter_api_token}`,
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

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const nameIdx = headers.findIndex(h => h.includes('nome') || h.includes('empresa') || h.includes('name') || h.includes('business'));
      const phoneIdx = headers.findIndex(h => h.includes('telefone') || h.includes('phone') || h.includes('celular'));
      const nicheIdx = headers.findIndex(h => h.includes('nicho') || h.includes('niche') || h.includes('segmento'));
      const locationIdx = headers.findIndex(h => h.includes('cidade') || h.includes('local') || h.includes('city'));

      if (phoneIdx === -1) {
        throw new Error('CSV deve conter uma coluna de telefone');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const dataLines = lines.slice(1);
      let imported = 0;

      for (let i = 0; i < dataLines.length; i++) {
        const values = dataLines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        const phone = values[phoneIdx];
        if (!phone) continue;

        const leadData = {
          user_id: user.id,
          business_name: nameIdx !== -1 ? values[nameIdx] : 'Lead Importado',
          phone: phone.replace(/\D/g, ''),
          niche: nicheIdx !== -1 ? values[nicheIdx] : null,
          location: locationIdx !== -1 ? values[locationIdx] : null,
          stage: 'Contato' as const,
          temperature: 'frio' as const,
          source: 'csv_import',
        };

        const { error } = await supabase.from('leads').insert(leadData);
        if (!error) imported++;

        setImportProgress(Math.round(((i + 1) / dataLines.length) * 100));
      }

      toast({
        title: 'Importação concluída',
        description: `${imported} leads importados com sucesso!`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro na importação',
        description: error.message || 'Erro ao processar arquivo CSV',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMassSend = async () => {
    if (selectedLeadsForMass.length === 0 || !massMessage.trim()) {
      toast({
        title: 'Selecione leads e escreva uma mensagem',
        variant: 'destructive',
      });
      return;
    }

    if (!settings?.whatsapp_connected) {
      toast({
        title: 'WhatsApp não conectado',
        description: 'Conecte seu WhatsApp em Configurações.',
        variant: 'destructive',
      });
      return;
    }

    setIsSendingMass(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      let sent = 0;
      for (const leadId of selectedLeadsForMass) {
        const lead = leads.find(l => l.id === leadId);
        if (!lead) continue;

        const response = await supabase.functions.invoke('whatsapp-send', {
          body: {
            phone: lead.phone,
            message: massMessage,
            leadId: lead.id,
          },
        });

        if (!response.error) sent++;
      }

      toast({
        title: 'Mensagens enviadas',
        description: `${sent} de ${selectedLeadsForMass.length} mensagens enviadas com sucesso!`,
      });

      setSelectedLeadsForMass([]);
      setMassMessage('');
    } catch (error: any) {
      toast({
        title: 'Erro no envio',
        description: error.message || 'Erro ao enviar mensagens',
        variant: 'destructive',
      });
    } finally {
      setIsSendingMass(false);
    }
  };

  return (
    <DashboardLayout
      title="Prospecção"
      description="Gerencie suas campanhas de prospecção automática e manual"
      actions={
        <Dialog open={isNewCampaignOpen} onOpenChange={setIsNewCampaignOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Campanha</DialogTitle>
              <DialogDescription>
                Configure sua campanha de prospecção
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome da Campanha</Label>
                <Input
                  placeholder="Ex: Restaurantes SP - Janeiro"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Campanha</Label>
                <Select
                  value={newCampaign.campaign_type}
                  onValueChange={(v) => setNewCampaign({ ...newCampaign, campaign_type: v as 'automatic' | 'manual' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Automática - Hunter busca leads no Google Maps
                      </div>
                    </SelectItem>
                    <SelectItem value="manual">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Manual - Selecione leads existentes
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nichos</Label>
                  <Select
                    value={newCampaign.niches[0] || ''}
                    onValueChange={(v) => setNewCampaign({ ...newCampaign, niches: [v] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um nicho" />
                    </SelectTrigger>
                    <SelectContent>
                      {NICHES.map((niche) => (
                        <SelectItem key={niche} value={niche}>
                          {niche}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Localização</Label>
                  <Select
                    value={newCampaign.locations[0] || ''}
                    onValueChange={(v) => setNewCampaign({ ...newCampaign, locations: [v] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mensagem Personalizada (Opcional)</Label>
                <Textarea
                  placeholder="Deixe em branco para o agente gerar automaticamente..."
                  value={newCampaign.message_template}
                  onChange={(e) => setNewCampaign({ ...newCampaign, message_template: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Agendar para</Label>
                <Input
                  type="datetime-local"
                  value={newCampaign.scheduled_at || ''}
                  onChange={(e) => setNewCampaign({ ...newCampaign, scheduled_at: e.target.value || null })}
                />
                <p className="text-xs text-muted-foreground">Deixe em branco para executar manualmente</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewCampaignOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateCampaign} disabled={isCreating}>
                {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Rocket className="h-4 w-4 mr-2" />}
                Criar Campanha
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLeadsProspected}</p>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Campanhas
          </TabsTrigger>
          <TabsTrigger value="mass-send" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Disparo em Massa
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importar CSV
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Agendamentos
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
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
                              {campaign.niches[0] || '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {campaign.locations[0] || '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <span className="font-medium">{campaign.leads_contacted}</span>
                              <span className="text-muted-foreground">/{campaign.leads_found}</span>
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
        </TabsContent>

        {/* Mass Send Tab */}
        <TabsContent value="mass-send">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Selecionar Leads</CardTitle>
                <CardDescription>Escolha os leads para enviar mensagem em massa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {selectedLeadsForMass.length} leads selecionados
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedLeadsForMass.length === leads.length) {
                          setSelectedLeadsForMass([]);
                        } else {
                          setSelectedLeadsForMass(leads.map(l => l.id));
                        }
                      }}
                    >
                      {selectedLeadsForMass.length === leads.length ? 'Desmarcar todos' : 'Selecionar todos'}
                    </Button>
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {leads.map((lead) => (
                      <div
                        key={lead.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedLeadsForMass.includes(lead.id)
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => {
                          if (selectedLeadsForMass.includes(lead.id)) {
                            setSelectedLeadsForMass(selectedLeadsForMass.filter(id => id !== lead.id));
                          } else {
                            setSelectedLeadsForMass([...selectedLeadsForMass, lead.id]);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{lead.business_name}</p>
                            <p className="text-sm text-muted-foreground">{lead.phone}</p>
                          </div>
                          <Badge variant="secondary">{lead.niche || 'Sem nicho'}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mensagem</CardTitle>
                <CardDescription>Escreva a mensagem que será enviada para todos os leads selecionados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Olá! Gostaria de apresentar uma solução que pode ajudar seu negócio..."
                    value={massMessage}
                    onChange={(e) => setMassMessage(e.target.value)}
                    rows={8}
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{massMessage.length} caracteres</span>
                    <span>{selectedLeadsForMass.length} destinatários</span>
                  </div>
                  <Button
                    className="w-full gradient-primary"
                    onClick={handleMassSend}
                    disabled={isSendingMass || selectedLeadsForMass.length === 0 || !massMessage.trim()}
                  >
                    {isSendingMass ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Enviar para {selectedLeadsForMass.length} leads
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Importar Leads via CSV</CardTitle>
              <CardDescription>
                Faça upload de um arquivo CSV com seus leads. O arquivo deve conter colunas para telefone (obrigatório),
                nome/empresa, nicho e localização (opcionais).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-2 border-dashed rounded-xl p-8 text-center">
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Arraste seu arquivo CSV aqui</p>
                  <p className="text-sm text-muted-foreground mb-4">ou clique para selecionar</p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    className="hidden"
                    id="csv-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                  >
                    {isImporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Selecionar Arquivo
                  </Button>
                </div>

                {isImporting && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Importando leads...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} />
                  </div>
                )}

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Formato esperado do CSV:</h4>
                  <code className="text-sm text-muted-foreground">
                    Nome,Telefone,Nicho,Cidade<br />
                    "Restaurante do João","11999998888","Restaurantes","São Paulo"<br />
                    "Clínica Saúde","11988887777","Clínicas","São Paulo"
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Agendadas</CardTitle>
              <CardDescription>Visualize e gerencie suas campanhas programadas</CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.filter(c => c.scheduled_at).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">Nenhuma campanha agendada</p>
                  <p className="text-sm">Crie uma campanha com data/hora para agendar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns
                    .filter(c => c.scheduled_at)
                    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
                    .map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-primary/10">
                            <Clock className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {campaign.niches[0]} • {campaign.locations[0]}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {format(new Date(campaign.scheduled_at!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                          <Badge className={statusColors[campaign.status]}>
                            {statusLabels[campaign.status]}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
