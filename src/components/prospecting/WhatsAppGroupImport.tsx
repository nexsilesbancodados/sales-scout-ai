import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserSettings } from '@/hooks/use-user-settings';
import { fetchWhatsAppGroups, fetchGroupParticipants, WhatsAppGroup } from '@/lib/whatsapp';
import {
  MessageCircle,
  Users,
  Loader2,
  Upload,
  ChevronDown,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface WhatsAppGroupImportProps {
  onLeadsImported?: (count: number) => void;
  disabled?: boolean;
}

export function WhatsAppGroupImport({ onLeadsImported, disabled }: WhatsAppGroupImportProps) {
  const { toast } = useToast();
  const { settings } = useUserSettings();

  const [showModal, setShowModal] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [customNiche, setCustomNiche] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const isWhatsAppConnected = settings?.whatsapp_connected && settings?.whatsapp_instance_id;

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

  const handleImport = async () => {
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // Fetch participants from selected groups
      setImportProgress(20);
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

      setImportProgress(40);

      // Get existing leads to avoid duplicates
      const { data: existingLeads } = await supabase
        .from('leads')
        .select('phone')
        .eq('user_id', user.id);

      const existingPhones = new Set(existingLeads?.map(l => l.phone) || []);

      // Filter out duplicates
      const newParticipants = participants.filter(p => !existingPhones.has(p.phone));

      if (newParticipants.length === 0) {
        toast({
          title: 'Todos já importados',
          description: 'Todos os contatos dos grupos selecionados já estão na sua lista de leads.',
        });
        setShowModal(false);
        setIsImporting(false);
        return;
      }

      setImportProgress(60);

      // Import leads in batches
      const batchSize = 50;
      let imported = 0;

      for (let i = 0; i < newParticipants.length; i += batchSize) {
        const batch = newParticipants.slice(i, i + batchSize);

        const leadsToInsert = batch.map(p => ({
          user_id: user.id,
          business_name: p.name,
          phone: p.phone,
          niche: customNiche || p.groupName,
          stage: 'Contato' as const,
          temperature: 'frio' as const,
          source: 'whatsapp_group',
          tags: [p.groupName],
        }));

        const { error } = await supabase.from('leads').insert(leadsToInsert);
        if (!error) imported += batch.length;

        setImportProgress(60 + Math.round((i / newParticipants.length) * 40));
      }

      toast({
        title: 'Importação concluída!',
        description: `${imported} contatos importados de ${selectedGroups.length} grupo(s).`,
      });

      onLeadsImported?.(imported);
      setShowModal(false);
    } catch (error: any) {
      toast({
        title: 'Erro na importação',
        description: error.message || 'Erro ao importar contatos do WhatsApp',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  return (
    <>
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
                Selecione grupos do WhatsApp e importe os participantes como leads automaticamente.
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

      {/* WhatsApp Groups Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Importar Contatos do WhatsApp
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
                  Selecione os grupos para importar os participantes como leads:
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Nicho/Tag (opcional)
                  </label>
                  <Input
                    placeholder="Ex: Marketing Digital"
                    value={customNiche}
                    onChange={(e) => setCustomNiche(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Se não definido, usará o nome do grupo como nicho
                  </p>
                </div>
              </>
            )}

            {isImporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Importando contatos...</span>
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
                  onClick={handleImport}
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
    </>
  );
}
