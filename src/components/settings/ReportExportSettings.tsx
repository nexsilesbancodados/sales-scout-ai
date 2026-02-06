import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Download, CalendarIcon, FileSpreadsheet, FileJson, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ReportType = 'leads' | 'analytics' | 'campaigns' | 'conversations';
type ExportFormat = 'csv' | 'json';

export function ReportExportSettings() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<ReportType>('leads');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [stage, setStage] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const reportTypes = [
    { value: 'leads', label: 'Leads', icon: FileText, description: 'Exportar todos os leads com seus dados' },
    { value: 'analytics', label: 'Analytics', icon: FileSpreadsheet, description: 'Estatísticas de prospecção por data' },
    { value: 'campaigns', label: 'Campanhas', icon: FileText, description: 'Histórico de campanhas realizadas' },
    { value: 'conversations', label: 'Conversas', icon: FileText, description: 'Mensagens trocadas com leads' },
  ];

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const filters: any = {};
      if (dateFrom) filters.dateFrom = format(dateFrom, 'yyyy-MM-dd');
      if (dateTo) filters.dateTo = format(dateTo, 'yyyy-MM-dd');
      if (stage && stage !== 'all') filters.stage = stage;

      const response = await supabase.functions.invoke('export-data', {
        body: {
          type: reportType,
          format: exportFormat,
          filters,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (exportFormat === 'csv') {
        // For CSV, the response is the file content directly
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportType}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // For JSON, download the data
        const blob = new Blob([JSON.stringify(response.data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast({
        title: '✓ Relatório exportado',
        description: `Seu relatório de ${reportTypes.find(r => r.value === reportType)?.label} foi baixado.`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Erro na exportação',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Relatórios
        </CardTitle>
        <CardDescription>
          Exporte seus dados em CSV ou JSON para análise externa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div className="space-y-3">
          <Label>Tipo de Relatório</Label>
          <div className="grid grid-cols-2 gap-3">
            {reportTypes.map((type) => (
              <div
                key={type.value}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-colors",
                  reportType === type.value
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                )}
                onClick={() => setReportType(type.value as ReportType)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <type.icon className="h-4 w-4" />
                  <span className="font-medium">{type.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {type.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <Label>Formato</Label>
          <div className="flex gap-3">
            <Button
              variant={exportFormat === 'csv' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setExportFormat('csv')}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button
              variant={exportFormat === 'json' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setExportFormat('json')}
            >
              <FileJson className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>

        {/* Date Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data Inicial</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP", { locale: ptBR }) : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Data Final</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP", { locale: ptBR }) : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Stage Filter (only for leads) */}
        {reportType === 'leads' && (
          <div className="space-y-2">
            <Label>Estágio do Lead</Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estágios</SelectItem>
                <SelectItem value="new">Novo</SelectItem>
                <SelectItem value="contacted">Contactado</SelectItem>
                <SelectItem value="qualified">Qualificado</SelectItem>
                <SelectItem value="proposal">Proposta</SelectItem>
                <SelectItem value="negotiation">Negociação</SelectItem>
                <SelectItem value="won">Fechado</SelectItem>
                <SelectItem value="lost">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Export Button */}
        <Button
          className="w-full"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar {reportTypes.find(r => r.value === reportType)?.label}
            </>
          )}
        </Button>

        {/* Tips */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 Dicas:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>CSV é ideal para abrir no Excel ou Google Sheets</li>
            <li>JSON é melhor para integrações com outras ferramentas</li>
            <li>Deixe as datas em branco para exportar todos os registros</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
