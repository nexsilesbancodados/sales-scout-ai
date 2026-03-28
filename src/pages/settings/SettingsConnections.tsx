import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WhatsAppConnection } from '@/components/WhatsAppConnection';
import { MultiChipSettings } from '@/components/settings/MultiChipSettings';
import { useUserSettings } from '@/hooks/use-user-settings';
import { MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsConnections() {
  const { settings, isLoading } = useUserSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isWhatsAppConnected = settings?.whatsapp_connected;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Conexões</h1>
        <p className="text-muted-foreground text-sm">WhatsApp e multi-chip</p>
      </div>

      <Card className={cn(!isWhatsAppConnected && "ring-2 ring-destructive/50")}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>WhatsApp</CardTitle>
            </div>
            {isWhatsAppConnected ? (
              <Badge className="bg-primary text-primary-foreground">Conectado</Badge>
            ) : (
              <Badge variant="destructive">Desconectado</Badge>
            )}
          </div>
          <CardDescription>
            {isWhatsAppConnected 
              ? 'Seu WhatsApp está pronto para enviar mensagens'
              : 'Conecte seu WhatsApp para começar a prospectar'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WhatsAppConnection />
        </CardContent>
      </Card>

      <MultiChipSettings />
    </div>
  );
}
