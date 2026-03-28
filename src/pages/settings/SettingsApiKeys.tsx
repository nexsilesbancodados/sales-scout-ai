import { ApiKeysSettings } from '@/components/settings/ApiKeysSettings';
import { Key } from 'lucide-react';

export default function SettingsApiKeys() {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Key className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Chaves API</h1>
            <p className="text-sm text-muted-foreground">Configure suas chaves de API para busca e enriquecimento de leads</p>
          </div>
        </div>
      </div>
      <ApiKeysSettings />
    </div>
  );
}
