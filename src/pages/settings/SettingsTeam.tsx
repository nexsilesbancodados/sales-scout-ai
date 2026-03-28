import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamSettings } from '@/components/settings/TeamSettings';
import { Users } from 'lucide-react';

export default function SettingsTeam() {
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Equipe</h1>
        <p className="text-muted-foreground text-sm">Gerencie membros e permissões</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Membros da Equipe
          </CardTitle>
          <CardDescription>Adicione e gerencie membros da sua equipe</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamSettings />
        </CardContent>
      </Card>
    </div>
  );
}
