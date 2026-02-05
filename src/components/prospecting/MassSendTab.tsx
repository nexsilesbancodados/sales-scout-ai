import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useLeads } from '@/hooks/use-leads';
import { useUserSettings } from '@/hooks/use-user-settings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Send,
  Loader2,
} from 'lucide-react';

export function MassSendTab() {
  const { leads } = useLeads();
  const { settings } = useUserSettings();
  const { toast } = useToast();
  
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [massMessage, setMassMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleMassSend = async () => {
    if (selectedLeads.length === 0 || !massMessage.trim()) {
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

    setIsSending(true);

    try {
      let sent = 0;
      for (const leadId of selectedLeads) {
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
        description: `${sent} de ${selectedLeads.length} mensagens enviadas com sucesso!`,
      });

      setSelectedLeads([]);
      setMassMessage('');
    } catch (error: any) {
      toast({
        title: 'Erro no envio',
        description: error.message || 'Erro ao enviar mensagens',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
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
                {selectedLeads.length} leads selecionados
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedLeads.length === leads.length) {
                    setSelectedLeads([]);
                  } else {
                    setSelectedLeads(leads.map(l => l.id));
                  }
                }}
              >
                {selectedLeads.length === leads.length ? 'Desmarcar todos' : 'Selecionar todos'}
              </Button>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedLeads.includes(lead.id)
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => {
                    if (selectedLeads.includes(lead.id)) {
                      setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                    } else {
                      setSelectedLeads([...selectedLeads, lead.id]);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={selectedLeads.includes(lead.id)} />
                    <div className="flex-1">
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
              <span>{selectedLeads.length} destinatários</span>
            </div>
            <Button
              className="w-full gradient-primary"
              onClick={handleMassSend}
              disabled={isSending || selectedLeads.length === 0 || !massMessage.trim()}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar para {selectedLeads.length} leads
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
