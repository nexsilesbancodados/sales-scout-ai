import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AntiBlockSettings } from '@/components/settings/AntiBlockSettings';
import { Shield } from 'lucide-react';

export default function SettingsAntiBlock() {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Proteção Anti-Bloqueio</h1>
            <p className="text-sm text-muted-foreground">Configure limites e intervalos para evitar banimento</p>
          </div>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Configurações de Proteção</CardTitle>
          <CardDescription>
            Ajuste limites de envio, intervalos e comportamento anti-ban para manter seu chip seguro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AntiBlockSettings />
        </CardContent>
      </Card>
    </div>
  );
}
