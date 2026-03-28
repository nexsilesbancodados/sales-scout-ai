import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { WhatsAppConnection } from '@/components/WhatsAppConnection';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useToast } from '@/hooks/use-toast';
import {
  Smartphone,
  Plus,
  Trash2,
  Signal,
  Shield,
  RotateCcw,
} from 'lucide-react';

interface ChipInstance {
  id: string;
  instance_id: string;
  label: string;
  status: 'connected' | 'disconnected';
  health: 'healthy' | 'warning' | 'critical';
  messages_today: number;
}

export function MultiChipSettings() {
  const { settings, updateSettings } = useUserSettings();
  const { toast } = useToast();
  const [addChipOpen, setAddChipOpen] = useState(false);
  const [rotationEnabled, setRotationEnabled] = useState(false);
  const [rotationStrategy, setRotationStrategy] = useState<string>('round_robin');

  // Derive chip instances from settings
  const mainChip: ChipInstance | null = settings?.whatsapp_connected ? {
    id: 'main',
    instance_id: settings.whatsapp_instance_id || '',
    label: 'Chip Principal',
    status: 'connected',
    health: 'healthy',
    messages_today: 0,
  } : null;

  const chips: ChipInstance[] = mainChip ? [mainChip] : [];

  const healthColors = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
  };

  const healthLabels = {
    healthy: 'Saudável',
    warning: 'Atenção',
    critical: 'Crítico',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base">Múltiplos Chips</CardTitle>
              <CardDescription className="text-xs">
                Gerencie várias instâncias WhatsApp para rotação de envio
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary">{chips.length} chip{chips.length !== 1 ? 's' : ''}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chip List */}
        {chips.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Nenhum chip conectado. Conecte o WhatsApp acima primeiro.
          </div>
        ) : (
          <div className="space-y-3">
            {chips.map((chip) => (
              <div
                key={chip.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${chip.status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
                  <div>
                    <p className="text-sm font-medium">{chip.label}</p>
                    <p className="text-xs text-muted-foreground font-mono">{chip.instance_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Signal className="h-3 w-3 mr-1" />
                    {healthLabels[chip.health]}
                  </Badge>
                  <Badge variant={chip.status === 'connected' ? 'default' : 'secondary'} className="text-xs">
                    {chip.status === 'connected' ? 'Online' : 'Offline'}
                  </Badge>
                  {chip.id !== 'main' && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Chip Button */}
        <Dialog open={addChipOpen} onOpenChange={setAddChipOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full" disabled={!settings?.whatsapp_connected}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar novo chip
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Conectar novo chip WhatsApp</DialogTitle>
              <DialogDescription>
                Escaneie o QR Code com outro número para adicionar um chip de rotação
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground text-center">
                Funcionalidade disponível no plano Pro e superior.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Rotation Settings */}
        {chips.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-primary" />
                <Label className="font-medium">Rotação automática</Label>
              </div>
              <Switch
                checked={rotationEnabled}
                onCheckedChange={(checked) => {
                  setRotationEnabled(checked);
                  toast({
                    title: checked ? 'Rotação ativada' : 'Rotação desativada',
                  });
                }}
                disabled={chips.length < 2}
              />
            </div>

            {rotationEnabled && (
              <div className="space-y-2">
                <Label className="text-sm">Estratégia de rotação</Label>
                <Select value={rotationStrategy} onValueChange={setRotationStrategy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round_robin">Round-robin</SelectItem>
                    <SelectItem value="health">Por saúde do chip</SelectItem>
                    <SelectItem value="random">Aleatório</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
