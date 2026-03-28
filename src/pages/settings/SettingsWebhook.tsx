import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useToast } from '@/hooks/use-toast';
import { Webhook } from 'lucide-react';

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

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Webhook</h1>
        <p className="text-muted-foreground text-sm">Receba eventos em tempo real no seu sistema</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            URL do Webhook
          </CardTitle>
          <CardDescription>
            Receba eventos em tempo real (n8n, Zapier, Make)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://seu-webhook.com/endpoint"
              className="flex-1"
            />
            <Button onClick={handleSave} disabled={isUpdating}>
              Salvar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Eventos: lead_created, message_sent, meeting_scheduled
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
