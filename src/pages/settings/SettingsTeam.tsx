import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamSettings } from '@/components/settings/TeamSettings';
import { Users } from 'lucide-react';

export default function SettingsTeam() {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Equipe</h1>
            <p className="text-sm text-muted-foreground">Gerencie membros e permissões da sua equipe</p>
          </div>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Membros da Equipe</CardTitle>
          <CardDescription>Adicione e gerencie quem tem acesso à plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamSettings />
        </CardContent>
      </Card>
    </div>
  );
}
