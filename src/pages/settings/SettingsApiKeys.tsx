import { ApiKeysSettings } from '@/components/settings/ApiKeysSettings';

export default function SettingsApiKeys() {
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Chaves API</h1>
        <p className="text-muted-foreground text-sm">Configure suas chaves de API para busca e enriquecimento</p>
      </div>
      <ApiKeysSettings />
    </div>
  );
}
