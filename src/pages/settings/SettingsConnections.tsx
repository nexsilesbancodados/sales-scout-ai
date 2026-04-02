import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminRole } from '@/hooks/use-admin';
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
  const { isAdmin } = useAdminRole();

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

      {/* Cakto Webhook Configuration */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            Configuração Cakto
          </CardTitle>
          <CardDescription>Configure o webhook para receber pagamentos automaticamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <p className="font-medium">Configure o webhook na Cakto em 4 passos:</p>
            {[
              { step: "1", text: "Acesse app.cakto.com.br → Apps → Webhooks → Adicionar" },
              { step: "2", text: "Cole a URL do webhook abaixo" },
              { step: "3", text: "Selecione os eventos: Compra aprovada, Assinatura cancelada, Reembolso" },
              { step: "4", text: "Copie o valor de 'Secret' gerado e adicione nas variáveis de ambiente do Supabase" },
            ].map(item => (
              <div key={item.step} className="flex gap-3 items-start">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {item.step}
                </div>
                <p className="text-muted-foreground pt-0.5">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1 font-medium">URL do webhook:</p>
            <div className="flex items-center gap-2">
              <code className="text-xs text-primary break-all flex-1">
                {import.meta.env.VITE_SUPABASE_URL}/functions/v1/cakto-webhook
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 shrink-0 gap-1"
                onClick={() => {
                  navigator.clipboard.writeText(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cakto-webhook`);
                  toast({ title: '✓ URL copiada!' });
                }}
              >
                <Copy className="h-3 w-3" />
                Copiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
