import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WhatsAppConnection } from '@/components/WhatsAppConnection';
import { MultiChipSettings } from '@/components/settings/MultiChipSettings';
import { useUserSettings } from '@/hooks/use-user-settings';
import { MessageSquare, Loader2, Wifi, WifiOff, CreditCard, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function SettingsConnections() {
  const { settings, isLoading } = useUserSettings();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isWhatsAppConnected = settings?.whatsapp_connected;

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Conexões</h1>
            <p className="text-sm text-muted-foreground">Gerencie suas conexões WhatsApp e multi-chip</p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-xl border transition-all",
        isWhatsAppConnected 
          ? "bg-emerald-500/5 border-emerald-500/20" 
          : "bg-destructive/5 border-destructive/20"
      )}>
        {isWhatsAppConnected ? (
          <Wifi className="h-5 w-5 text-emerald-500" />
        ) : (
          <WifiOff className="h-5 w-5 text-destructive" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">
            {isWhatsAppConnected ? 'WhatsApp conectado e pronto' : 'WhatsApp desconectado'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isWhatsAppConnected 
              ? 'Seu chip está ativo e pronto para enviar mensagens'
              : 'Conecte seu WhatsApp para começar a prospectar'}
          </p>
        </div>
        <Badge className={cn(
          isWhatsAppConnected 
            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20" 
            : "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
        )} variant="outline">
          {isWhatsAppConnected ? 'Online' : 'Offline'}
        </Badge>
      </div>

      {/* WhatsApp Connection */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Conectar WhatsApp</CardTitle>
          <CardDescription>
            Escaneie o QR Code para vincular seu número
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WhatsAppConnection />
        </CardContent>
      </Card>

      {/* Multi-Chip */}
      <MultiChipSettings />
    </div>
  );
}
