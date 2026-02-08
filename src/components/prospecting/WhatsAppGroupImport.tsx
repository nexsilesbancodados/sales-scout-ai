import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useBackgroundJobs } from '@/hooks/use-background-jobs';
import { fetchWhatsAppGroups, fetchGroupParticipants, WhatsAppGroup } from '@/lib/whatsapp';
import {
  MessageCircle,
  Users,
  Loader2,
  Upload,
  AlertCircle,
  Send,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Briefcase,
} from 'lucide-react';

// Available services for filtering
const DEFAULT_SERVICES = [
  { id: 'trafego_pago', label: 'Tráfego Pago' },
  { id: 'automacao', label: 'Automação' },
  { id: 'social_media', label: 'Social Media' },
  { id: 'websites', label: 'Sites e Landing Pages' },
  { id: 'seo', label: 'SEO' },
  { id: 'design', label: 'Design Gráfico' },
  { id: 'consultoria', label: 'Consultoria' },
];

interface ImportedContact {
  phone: string;
  name: string;
  groupId: string;
  groupName: string;
  selected: boolean;
}

interface WhatsAppGroupImportProps {
  onLeadsImported?: (count: number) => void;
  disabled?: boolean;
}

export function WhatsAppGroupImport({ onLeadsImported, disabled }: WhatsAppGroupImportProps) {
  const { toast } = useToast();
  const { settings } = useUserSettings();
  const { createJob, isCreating } = useBackgroundJobs();

  const [showModal, setShowModal] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  // Imported contacts state
  const [importedContacts, setImportedContacts] = useState<ImportedContact[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [customService, setCustomService] = useState('');
  const [showCustomServiceInput, setShowCustomServiceInput] = useState(false);
  const [customServices, setCustomServices] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const isWhatsAppConnected = settings?.whatsapp_connected && settings?.whatsapp_instance_id;

  // All available services (default + custom)
  const allServices = useMemo(() => [
    ...DEFAULT_SERVICES,
    ...customServices.map(s => ({ id: s, label: s })),
  ], [customServices]);

  // Group contacts by group name
  const contactsByGroup = useMemo(() => {
    const grouped: Record<string, ImportedContact[]> = {};
    importedContacts.forEach(c => {
      if (!grouped[c.groupName]) grouped[c.groupName] = [];
      grouped[c.groupName].push(c);
    });
    return grouped;
  }, [importedContacts]);

  const selectedContacts = importedContacts.filter(c => c.selected);

  const handleOpenModal = async () => {
    if (!isWhatsAppConnected) {
      toast({
        title: 'WhatsApp não conectado',
        description: 'Conecte seu WhatsApp nas configurações para importar contatos de grupos.',
        variant: 'destructive',
      });
      return;
    }

    setShowModal(true);
    setIsLoadingGroups(true);
    setGroups([]);
    setSelectedGroups([]);

    try {
      const fetchedGroups = await fetchWhatsAppGroups(settings!.whatsapp_instance_id!);
      setGroups(fetchedGroups);
    } catch (error: any) {
      toast({
        title: 'Erro ao buscar grupos',
        description: error.message || 'Não foi possível listar os grupos do WhatsApp',
        variant: 'destructive',
      });
      setShowModal(false);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const getTotalSelectedMembers = () => {
    return groups
      .filter(g => selectedGroups.includes(g.id))
      .reduce((sum, g) => sum + g.memberCount, 0);
  };

  const handleImportContacts = async () => {
    if (selectedGroups.length === 0) {
      toast({
        title: 'Nenhum grupo selecionado',
        description: 'Selecione pelo menos um grupo para importar contatos.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      setImportProgress(30);
      const participants = await fetchGroupParticipants(
        settings!.whatsapp_instance_id!,
        selectedGroups
      );

      if (participants.length === 0) {
        toast({
          title: 'Nenhum contato encontrado',
          description: 'Os grupos selecionados não contêm participantes válidos.',
          variant: 'destructive',
        });
        setIsImporting(false);
        return;
      }

      setImportProgress(70);

      // Get existing leads to mark duplicates
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { data: existingLeads } = await supabase
        .from('leads')
        .select('phone')
        .eq('user_id', user.id);

      const existingPhones = new Set(existingLeads?.map(l => l.phone) || []);

      // Filter out duplicates and format contacts
      const newContacts: ImportedContact[] = participants
        .filter(p => !existingPhones.has(p.phone))
        .map(p => ({
          phone: p.phone,
          name: p.name,
          groupId: p.groupId,
          groupName: p.groupName,
          selected: true,
        }));

      setImportProgress(100);

      if (newContacts.length === 0) {
        toast({
          title: 'Todos já importados',
          description: 'Todos os contatos dos grupos selecionados já estão na sua lista de leads.',
        });
      } else {
        setImportedContacts(newContacts);
        // Expand all groups by default
        setExpandedGroups(new Set(Object.keys(contactsByGroup)));
        toast({
          title: 'Contatos carregados!',
          description: `${newContacts.length} contatos novos prontos para configurar.`,
        });
      }

      setShowModal(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao buscar contatos',
        description: error.message || 'Erro ao importar contatos do WhatsApp',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const toggleContactSelection = (phone: string) => {
    setImportedContacts(prev =>
      prev.map(c => c.phone === phone ? { ...c, selected: !c.selected } : c)
    );
  };

  const toggleGroupContactsSelection = (groupName: string, select: boolean) => {
    setImportedContacts(prev =>
      prev.map(c => c.groupName === groupName ? { ...c, selected: select } : c)
    );
  };

  const toggleGroupExpand = (groupName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const handleAddCustomService = () => {
    if (customService.trim() && !customServices.includes(customService.trim())) {
      const newService = customService.trim();
      setCustomServices(prev => [...prev, newService]);
      setSelectedService(newService);
      setCustomService('');
      setShowCustomServiceInput(false);
    }
  };

  const handleSaveLeads = async () => {
    if (selectedContacts.length === 0) {
      toast({
        title: 'Nenhum contato selecionado',
        description: 'Selecione pelo menos um contato para salvar.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const serviceLabel = allServices.find(s => s.id === selectedService)?.label || selectedService;

      const leadsToInsert = selectedContacts.map(c => ({
        user_id: user.id,
        business_name: c.name,
        phone: c.phone,
        niche: serviceLabel || c.groupName,
        stage: 'Contato' as const,
        temperature: 'frio' as const,
        source: 'whatsapp_group',
        tags: [c.groupName, serviceLabel].filter(Boolean),
      }));

      const { error } = await supabase.from('leads').insert(leadsToInsert);

      if (error) throw error;

      toast({
        title: 'Leads salvos!',
        description: `${leadsToInsert.length} contatos salvos na sua base de leads.`,
      });

      onLeadsImported?.(leadsToInsert.length);
      setImportedContacts([]);
      setSelectedService('');
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Erro ao salvar leads',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessages = async () => {
    if (selectedContacts.length === 0) {
      toast({
        title: 'Nenhum contato selecionado',
        variant: 'destructive',
      });
      return;
    }

    if (!settings?.whatsapp_connected) {
      toast({
        title: 'WhatsApp não conectado',
        variant: 'destructive',
      });
      return;
    }

    const serviceLabel = allServices.find(s => s.id === selectedService)?.label || selectedService;

    // Create background job for mass sending
    createJob({
      job_type: 'mass_send',
      total_items: selectedContacts.length,
      priority: 7,
      payload: {
        leads: selectedContacts.map(c => ({
          id: null,
          phone: c.phone,
          business_name: c.name,
          niche: serviceLabel || c.groupName,
          location: null,
          from_whatsapp_group: true,
        })),
        message_template: null,
        use_ai_personalization: true,
        direct_ai_mode: true,
        agent_settings: {
          agent_name: settings?.agent_name,
          agent_persona: settings?.agent_persona,
          communication_style: settings?.communication_style,
          emoji_usage: settings?.emoji_usage,
          services_offered: serviceLabel ? [serviceLabel] : settings?.services_offered,
          knowledge_base: settings?.knowledge_base,
          specific_service: serviceLabel,
        },
      },
    });

    toast({
      title: 'Disparo iniciado!',
      description: `Enviando mensagens para ${selectedContacts.length} contatos em segundo plano.`,
    });

    setImportedContacts([]);
    setSelectedService('');
  };

  const handleClearContacts = () => {
    setImportedContacts([]);
    setSelectedService('');
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Importar do WhatsApp
          </CardTitle>
          <CardDescription>
            Capture leads diretamente dos seus grupos do WhatsApp - 100% gratuito
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Selecione grupos do WhatsApp e importe os participantes como leads.
              </p>
            </div>
            {isWhatsAppConnected ? (
              <Button
                variant="outline"
                onClick={handleOpenModal}
                disabled={disabled}
                className="shrink-0"
              >
                <Users className="h-4 w-4 mr-2" />
                Selecionar Grupos
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Conecte o WhatsApp primeiro</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Imported Contacts Section */}
      {importedContacts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Contatos Importados
                <Badge variant="secondary">{importedContacts.length}</Badge>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleClearContacts}>
                <Trash2 className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>
            <CardDescription>
              {selectedContacts.length} de {importedContacts.length} selecionados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Service Selection */}
            <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Serviço a Oferecer</span>
              </div>

              <div className="flex gap-2">
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione um serviço..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allServices.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {!showCustomServiceInput ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowCustomServiceInput(true)}
                    title="Adicionar serviço personalizado"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Input
                      placeholder="Novo serviço..."
                      value={customService}
                      onChange={(e) => setCustomService(e.target.value)}
                      className="w-40"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomService()}
                    />
                    <Button size="sm" onClick={handleAddCustomService}>
                      OK
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                A IA usará este serviço para personalizar as mensagens
              </p>
            </div>

            {/* Contacts List by Group */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {Object.entries(contactsByGroup).map(([groupName, contacts]) => {
                const selectedInGroup = contacts.filter(c => c.selected).length;
                const isExpanded = expandedGroups.has(groupName);

                return (
                  <div key={groupName} className="border rounded-lg overflow-hidden">
                    <div
                      className="flex items-center gap-3 p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleGroupExpand(groupName)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Checkbox
                        checked={selectedInGroup === contacts.length}
                        onCheckedChange={(checked) => {
                          toggleGroupContactsSelection(groupName, !!checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="font-medium flex-1 truncate">{groupName}</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedInGroup}/{contacts.length}
                      </Badge>
                    </div>

                    {isExpanded && (
                      <div className="divide-y">
                        {contacts.map(contact => (
                          <div
                            key={contact.phone}
                            className="flex items-center gap-3 p-2 pl-10 hover:bg-muted/20 cursor-pointer"
                            onClick={() => toggleContactSelection(contact.phone)}
                          >
                            <Checkbox
                              checked={contact.selected}
                              onCheckedChange={() => toggleContactSelection(contact.phone)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{contact.name}</p>
                              <p className="text-xs text-muted-foreground">{contact.phone}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleSaveLeads}
                disabled={selectedContacts.length === 0 || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar {selectedContacts.length} Leads
              </Button>

              <Button
                className="flex-1 gradient-primary"
                onClick={handleSendMessages}
                disabled={selectedContacts.length === 0 || isCreating || !selectedService}
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Disparar com IA
              </Button>
            </div>

            {!selectedService && selectedContacts.length > 0 && (
              <p className="text-xs text-center text-muted-foreground">
                Selecione um serviço para habilitar o disparo
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* WhatsApp Groups Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Selecionar Grupos do WhatsApp
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {isLoadingGroups ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Buscando grupos...</p>
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum grupo encontrado</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Selecione os grupos para importar os participantes:
                </p>

                <div className="space-y-2">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedGroups.includes(group.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleGroupSelection(group.id)}
                    >
                      <Checkbox
                        checked={selectedGroups.includes(group.id)}
                        onCheckedChange={() => toggleGroupSelection(group.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{group.name}</p>
                        {group.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {group.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{group.memberCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {isImporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Buscando contatos...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} />
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                {selectedGroups.length > 0 && (
                  <span>
                    {selectedGroups.length} grupo(s) · ~{getTotalSelectedMembers()} contatos
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={isImporting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleImportContacts}
                  disabled={selectedGroups.length === 0 || isImporting}
                >
                  {isImporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Importar Contatos
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
