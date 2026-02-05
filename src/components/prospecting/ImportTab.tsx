import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';

export function ImportTab() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const nameIdx = headers.findIndex(h => h.includes('nome') || h.includes('empresa') || h.includes('name') || h.includes('business'));
      const phoneIdx = headers.findIndex(h => h.includes('telefone') || h.includes('phone') || h.includes('celular'));
      const nicheIdx = headers.findIndex(h => h.includes('nicho') || h.includes('niche') || h.includes('segmento'));
      const locationIdx = headers.findIndex(h => h.includes('cidade') || h.includes('local') || h.includes('city'));

      if (phoneIdx === -1) {
        throw new Error('CSV deve conter uma coluna de telefone');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const dataLines = lines.slice(1);
      let imported = 0;

      for (let i = 0; i < dataLines.length; i++) {
        const values = dataLines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        const phone = values[phoneIdx];
        if (!phone) continue;

        const leadData = {
          user_id: user.id,
          business_name: nameIdx !== -1 ? values[nameIdx] : 'Lead Importado',
          phone: phone.replace(/\D/g, ''),
          niche: nicheIdx !== -1 ? values[nicheIdx] : null,
          location: locationIdx !== -1 ? values[locationIdx] : null,
          stage: 'Contato' as const,
          temperature: 'frio' as const,
          source: 'csv_import',
        };

        const { error } = await supabase.from('leads').insert(leadData);
        if (!error) imported++;

        setImportProgress(Math.round(((i + 1) / dataLines.length) * 100));
      }

      toast({
        title: 'Importação concluída',
        description: `${imported} leads importados com sucesso!`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro na importação',
        description: error.message || 'Erro ao processar arquivo CSV',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Leads via CSV</CardTitle>
        <CardDescription>
          Faça upload de um arquivo CSV com seus leads. O arquivo deve conter colunas para telefone (obrigatório),
          nome/empresa, nicho e localização (opcionais).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="border-2 border-dashed rounded-xl p-8 text-center">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Arraste seu arquivo CSV aqui</p>
            <p className="text-sm text-muted-foreground mb-4">ou clique para selecionar</p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
              id="csv-upload"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Selecionar Arquivo
            </Button>
          </div>

          {isImporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importando leads...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} />
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Formato esperado do CSV:</h4>
            <code className="text-sm text-muted-foreground block whitespace-pre-wrap">
              Nome,Telefone,Nicho,Cidade{'\n'}
              "Restaurante do João","11999998888","Restaurantes","São Paulo"{'\n'}
              "Clínica Saúde","11988887777","Clínicas","São Paulo"
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
