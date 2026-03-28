import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportExportSettings } from '@/components/settings/ReportExportSettings';
import { Download } from 'lucide-react';

export default function SettingsReports() {
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground text-sm">Exporte dados e configure relatórios automáticos</p>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            Exportar Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReportExportSettings />
        </CardContent>
      </Card>
    </div>
  );
}
