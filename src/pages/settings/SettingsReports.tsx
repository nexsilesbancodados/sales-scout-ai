import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportExportSettings } from '@/components/settings/ReportExportSettings';
import { Download } from 'lucide-react';

export default function SettingsReports() {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-sm text-muted-foreground">Exporte dados e configure relatórios automáticos</p>
          </div>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Exportar Dados</CardTitle>
          <CardDescription>Gere relatórios detalhados das suas campanhas e leads</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportExportSettings />
        </CardContent>
      </Card>
    </div>
  );
}
