import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useAuth } from '@/lib/auth';
import { Bell, Mail } from 'lucide-react';

export default function SettingsNotifications() {
  const { settings, updateSettings } = useUserSettings();
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Notificações</h1>
        <p className="text-muted-foreground text-sm">Configure alertas e relatórios por email</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationSettings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Relatório Diário
          </CardTitle>
          <CardDescription>Receba um resumo da prospecção por email todo dia</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Ativar relatório diário</Label>
              <p className="text-sm text-muted-foreground">Enviado todo dia às 8h no seu email</p>
            </div>
            <Switch
              checked={settings?.daily_report_enabled || false}
              onCheckedChange={(v) => updateSettings({ daily_report_enabled: v })}
            />
          </div>
          {settings?.daily_report_enabled && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              Relatório ativo — você receberá um email diário em <strong>{user?.email}</strong> com métricas de prospecção, leads novos e atividades do dia anterior.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
