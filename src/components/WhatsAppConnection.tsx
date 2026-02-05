import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUserSettings } from '@/hooks/use-user-settings';
import {
  createWhatsAppInstance,
  getWhatsAppQRCode,
  checkWhatsAppStatus,
  disconnectWhatsApp,
} from '@/lib/whatsapp';
import {
  MessageSquare,
  QrCode,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  LogOut,
} from 'lucide-react';

export function WhatsAppConnection() {
  const { settings, refetch } = useUserSettings();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<string>('unknown');

  const handleCheckStatus = useCallback(async () => {
    setIsCheckingStatus(true);
    try {
      const status = await checkWhatsAppStatus();
      setConnectionState(status.state);
      
      if (status.connected) {
        setQrCode(null);
        setPairingCode(null);
        refetch();
        toast({
          title: 'WhatsApp Conectado!',
          description: 'Seu agente pode enviar e receber mensagens.',
        });
      }
    } catch (error) {
      console.error('Status check error:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  }, [refetch, toast]);

  // Poll for connection status when QR code is shown
  useEffect(() => {
    if (!qrCode) return;

    const interval = setInterval(handleCheckStatus, 5000);
    return () => clearInterval(interval);
  }, [qrCode, handleCheckStatus]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await createWhatsAppInstance();
      const qrData = await getWhatsAppQRCode();
      
      if (qrData.base64) {
        setQrCode(qrData.base64);
      } else if (qrData.code) {
        setQrCode(qrData.code);
      }
      
      if (qrData.pairingCode) {
        setPairingCode(qrData.pairingCode);
      }

      toast({
        title: 'QR Code Gerado',
        description: 'Escaneie o código com seu WhatsApp para conectar.',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível gerar o QR Code';
      console.error('Connect error:', error);
      toast({
        title: 'Erro ao conectar',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshQR = async () => {
    setIsLoading(true);
    try {
      const qrData = await getWhatsAppQRCode();
      
      if (qrData.base64) {
        setQrCode(qrData.base64);
      } else if (qrData.code) {
        setQrCode(qrData.code);
      }
      
      if (qrData.pairingCode) {
        setPairingCode(qrData.pairingCode);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao atualizar QR Code',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await disconnectWhatsApp();
      setQrCode(null);
      setPairingCode(null);
      setConnectionState('disconnected');
      refetch();
      
      toast({
        title: 'WhatsApp Desconectado',
        description: 'A conexão foi encerrada com sucesso.',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao desconectar',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isConnected = settings?.whatsapp_connected;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Conexão WhatsApp
        </CardTitle>
        <CardDescription>
          Conecte seu WhatsApp para enviar e receber mensagens automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status indicator */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="h-6 w-6 text-primary" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-medium">
                {isConnected ? 'WhatsApp Conectado' : 'WhatsApp Desconectado'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isConnected
                  ? 'Seu agente pode enviar e receber mensagens'
                  : 'Escaneie o QR Code para conectar'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Online' : connectionState}
            </Badge>
            {isConnected && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDisconnect}
                disabled={isLoading}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Desconectar
              </Button>
            )}
          </div>
        </div>

        {/* QR Code section */}
        {!isConnected && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/30">
            {qrCode ? (
              <>
                <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center mb-4 p-4">
                  {qrCode.startsWith('data:') || qrCode.length > 500 ? (
                    <img 
                      src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`} 
                      alt="QR Code" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground break-all">{qrCode}</p>
                    </div>
                  )}
                </div>
                
                {pairingCode && (
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">Código de pareamento:</p>
                    <p className="text-2xl font-mono font-bold tracking-wider">{pairingCode}</p>
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Abra o WhatsApp no seu celular → Configurações → Aparelhos conectados → Conectar um aparelho
                </p>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleRefreshQR}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Atualizar QR Code
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleCheckStatus}
                    disabled={isCheckingStatus}
                  >
                    {isCheckingStatus && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Verificar Conexão
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="h-24 w-24 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Clique no botão abaixo para gerar um QR Code e conectar seu WhatsApp
                </p>
                <Button onClick={handleConnect} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <QrCode className="h-4 w-4 mr-2" />
                  )}
                  Gerar QR Code
                </Button>
              </>
            )}
          </div>
        )}

        {/* Info when connected */}
        {isConnected && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Integração Ativa</p>
                <p className="text-sm text-muted-foreground mt-1">
                  O agente Hunter enviará mensagens automaticamente para novos leads prospectados.
                  As respostas serão recebidas e processadas pelo agente de IA.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
