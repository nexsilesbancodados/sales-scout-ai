import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProspectingStats } from '@/hooks/use-prospecting-stats';
import { useTemplates, DEFAULT_TEMPLATES } from '@/hooks/use-templates';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Brain,
  Clock,
  TrendingUp,
  Sparkles,
  Loader2,
  Lightbulb,
  BarChart3,
} from 'lucide-react';

const NICHES = Object.keys(DEFAULT_TEMPLATES);

export function AIInsightsTab() {
  const { getBestTimeSlots, getNichePerformance, stats } = useProspectingStats();
  const { templates } = useTemplates();
  const { toast } = useToast();

  const [selectedNiche, setSelectedNiche] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string>('');
  const [bestTimeRecommendation, setBestTimeRecommendation] = useState<string>('');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingBestTime, setIsLoadingBestTime] = useState(false);

  const nichePerformance = getNichePerformance();
  const bestTimeSlots = getBestTimeSlots(selectedNiche || undefined);

  const handleGetSuggestions = async () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) {
      toast({
        title: 'Selecione um template',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await supabase.functions.invoke('ai-prospecting', {
        body: {
          action: 'suggest_improvements',
          data: {
            template: template.content,
            responseRate: template.response_rate || 0,
            niche: template.niche,
          },
        },
      });

      if (response.error) throw response.error;
      setSuggestions(response.data.suggestions);
    } catch (error: any) {
      toast({
        title: 'Erro ao obter sugestões',
        description: error.message || 'Tente novamente',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleGetBestTime = async () => {
    if (!selectedNiche) {
      toast({
        title: 'Selecione um nicho',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingBestTime(true);
    try {
      const response = await supabase.functions.invoke('ai-prospecting', {
        body: {
          action: 'get_best_time',
          data: {
            niche: selectedNiche,
            stats: stats.filter(s => s.niche === selectedNiche),
          },
        },
      });

      if (response.error) throw response.error;
      setBestTimeRecommendation(response.data.recommendation);
    } catch (error: any) {
      toast({
        title: 'Erro ao obter recomendação',
        description: error.message || 'Tente novamente',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingBestTime(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance by Niche */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle>Performance por Nicho</CardTitle>
          </div>
          <CardDescription>
            Análise de taxa de resposta e conversão por segmento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nichePerformance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Ainda não há dados suficientes</p>
              <p className="text-sm">Envie mensagens para começar a ver estatísticas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {nichePerformance.map((perf) => (
                <div key={perf.niche} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">{perf.niche}</p>
                    <p className="text-sm text-muted-foreground">
                      {perf.totalSent} mensagens enviadas
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{perf.responseRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Taxa de resposta</p>
                    </div>
                    <Badge variant={perf.responseRate > 10 ? 'default' : 'secondary'}>
                      {perf.totalResponses} respostas
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Best Time Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Melhor Horário por Nicho</CardTitle>
          </div>
          <CardDescription>
            IA analisa seus dados e sugere os melhores horários para contato
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedNiche} onValueChange={setSelectedNiche}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione o nicho" />
              </SelectTrigger>
              <SelectContent>
                {NICHES.map((niche) => (
                  <SelectItem key={niche} value={niche}>
                    {niche}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleGetBestTime} disabled={!selectedNiche || isLoadingBestTime}>
              {isLoadingBestTime ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Analisar
            </Button>
          </div>

          {bestTimeSlots.length > 0 && (
            <div className="grid gap-2 md:grid-cols-3">
              {bestTimeSlots.slice(0, 3).map((slot, index) => (
                <div
                  key={slot.hour}
                  className={`p-4 rounded-lg border ${
                    index === 0 ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-bold">{slot.hour}:00</span>
                    {index === 0 && (
                      <Badge variant="default" className="ml-auto">Melhor</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {slot.responseRate.toFixed(1)}% de resposta ({slot.messagesSent} msgs)
                  </p>
                </div>
              ))}
            </div>
          )}

          {bestTimeRecommendation && (
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                <p className="text-sm">{bestTimeRecommendation}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Suggestions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Sugestões de Melhoria de Templates</CardTitle>
          </div>
          <CardDescription>
            IA analisa seus templates e sugere melhorias para aumentar a taxa de resposta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.niche})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleGetSuggestions} disabled={!selectedTemplate || isLoadingSuggestions}>
              {isLoadingSuggestions ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Obter Sugestões
            </Button>
          </div>

          {suggestions && (
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Sugestões da IA
              </h4>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm">{suggestions}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
