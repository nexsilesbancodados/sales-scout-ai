import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AntiBlockSettings } from '@/components/settings/AntiBlockSettings';
import { Shield } from 'lucide-react';

export default function SettingsAntiBlock() {
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Proteção Anti-Bloqueio</h1>
        <p className="text-muted-foreground text-sm">Configure limites e intervalos para evitar banimento</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base">Configurações de Proteção</CardTitle>
              <CardDescription className="text-xs">
                Ajuste limites de envio, intervalos e comportamento anti-ban
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AntiBlockSettings />
        </CardContent>
      </Card>
    </div>
  );
}
