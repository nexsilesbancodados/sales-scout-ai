import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Clock,
  Ban,
  Loader2,
  Save,
  Plus,
  X,
} from 'lucide-react';

export function SettingsTab() {
  const { settings, updateSettings, isUpdating } = useUserSettings();
  const { toast } = useToast();
  
  const [localSettings, setLocalSettings] = useState({
    daily_message_limit: settings?.daily_message_limit || 50,
    message_interval_seconds: settings?.message_interval_seconds || 60,
    auto_start_hour: settings?.auto_start_hour || 9,
    auto_end_hour: settings?.auto_end_hour || 18,
    auto_prospecting_enabled: settings?.auto_prospecting_enabled || false,
    blacklist: settings?.blacklist || [],
  });

  const [newBlacklistItem, setNewBlacklistItem] = useState('');

  const handleSave = () => {
    updateSettings(localSettings);
    toast({
      title: 'Configurações salvas',
      description: 'Suas configurações de prospecção foram atualizadas.',
    });
  };

  const addToBlacklist = () => {
    if (newBlacklistItem.trim() && !localSettings.blacklist.includes(newBlacklistItem.trim())) {
      setLocalSettings({
        ...localSettings,
        blacklist: [...localSettings.blacklist, newBlacklistItem.trim()],
      });
      setNewBlacklistItem('');
    }
  };

  const removeFromBlacklist = (item: string) => {
    setLocalSettings({
      ...localSettings,
      blacklist: localSettings.blacklist.filter(i => i !== item),
    });
  };

  return (
    <div className="space-y-6">
      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Configurações de Segurança</CardTitle>
          </div>
          <CardDescription>
            Configure limites para evitar bloqueios no WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Limite de mensagens por dia</Label>
              <Input
                type="number"
                min={1}
                max={200}
                value={localSettings.daily_message_limit}
                onChange={(e) => setLocalSettings({ 
                  ...localSettings, 
                  daily_message_limit: parseInt(e.target.value) || 50 
                })}
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: 30-50 para contas novas, até 100 para contas estabelecidas
              </p>
            </div>

            <div className="space-y-2">
              <Label>Intervalo entre mensagens (segundos)</Label>
              <Input
                type="number"
                min={30}
                max={300}
                value={localSettings.message_interval_seconds}
                onChange={(e) => setLocalSettings({ 
                  ...localSettings, 
                  message_interval_seconds: parseInt(e.target.value) || 60 
                })}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo recomendado: 60 segundos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Automação</CardTitle>
          </div>
          <CardDescription>
            Configure horários de funcionamento da prospecção automática
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Prospecção Automática</Label>
              <p className="text-sm text-muted-foreground">
                Ativar envio automático de mensagens
              </p>
            </div>
            <Switch
              checked={localSettings.auto_prospecting_enabled}
              onCheckedChange={(checked) => setLocalSettings({ 
                ...localSettings, 
                auto_prospecting_enabled: checked 
              })}
            />
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Horário de início</Label>
              <Input
                type="number"
                min={0}
                max={23}
                value={localSettings.auto_start_hour}
                onChange={(e) => setLocalSettings({ 
                  ...localSettings, 
                  auto_start_hour: parseInt(e.target.value) || 9 
                })}
              />
              <p className="text-xs text-muted-foreground">
                Hora do dia para iniciar (0-23)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Horário de término</Label>
              <Input
                type="number"
                min={0}
                max={23}
                value={localSettings.auto_end_hour}
                onChange={(e) => setLocalSettings({ 
                  ...localSettings, 
                  auto_end_hour: parseInt(e.target.value) || 18 
                })}
              />
              <p className="text-xs text-muted-foreground">
                Hora do dia para parar (0-23)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blacklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-primary" />
            <CardTitle>Lista de Exclusão (Blacklist)</CardTitle>
          </div>
          <CardDescription>
            Empresas ou números que não devem ser contatados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nome da empresa ou telefone"
              value={newBlacklistItem}
              onChange={(e) => setNewBlacklistItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addToBlacklist()}
            />
            <Button onClick={addToBlacklist}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {localSettings.blacklist.map((item) => (
              <Badge key={item} variant="secondary" className="gap-1">
                {item}
                <button onClick={() => removeFromBlacklist(item)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {localSettings.blacklist.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum item na lista de exclusão</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
