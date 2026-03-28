import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useToast } from '@/hooks/use-toast';
import { Webhook, Save, Code2 } from 'lucide-react';

export default function SettingsWebhook() {
  const { settings, updateSettings, isUpdating } = useUserSettings();
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    if (settings) {
      setWebhookUrl(settings.webhook_url || '');
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings({ webhook_url: webhookUrl });
    toast({ title: '✓ Webhook salvo' });
  };

  const events = [
    { name: 'lead_created', desc: 'Novo lead capturado' },
    { name: 'message_sent', desc: 'Mensagem enviada' },
    { name: 'meeting_scheduled', desc: 'Reunião agendada' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Webhook className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Webhook</h1>
            <p className="text-sm text-muted-foreground">Receba eventos em tempo real no seu sistema externo</p>
          </div>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">URL do Webhook</CardTitle>
          <CardDescription>
            Integre com n8n, Zapier, Make ou qualquer sistema que aceite webhooks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Endpoint URL</Label>
            <div className="flex gap-2">
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://seu-webhook.com/endpoint"
                className="flex-1 font-mono text-sm"
              />
              <Button onClick={handleSave} disabled={isUpdating} className="gap-2 shrink-0">
                <Save className="h-4 w-4" />
                Salvar
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Code2 className="h-3 w-3" />
              Eventos Disponíveis
            </Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {events.map((event) => (
                <div key={event.name} className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
                  <Badge variant="outline" className="font-mono text-[10px] shrink-0">{event.name}</Badge>
                  <span className="text-xs text-muted-foreground truncate">{event.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
