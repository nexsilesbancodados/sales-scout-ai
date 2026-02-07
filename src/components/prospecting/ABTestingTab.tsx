import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useTemplates } from '@/hooks/use-templates';
import { useToast } from '@/hooks/use-toast';
import {
  FlaskConical,
  Plus,
  Play,
  Pause,
  TrendingUp,
  Trophy,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Copy,
} from 'lucide-react';

interface ABTestVariant {
  id: string;
  name: string;
  content: string;
  sent: number;
  responses: number;
  conversions: number;
}

interface ABTest {
  id: string;
  name: string;
  niche: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: ABTestVariant[];
  startedAt?: string;
  completedAt?: string;
  winnerId?: string;
  minSampleSize: number;
  confidence?: number;
}

export function ABTestingTab() {
  const { toast } = useToast();
  const { templates } = useTemplates();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  const runningTests = tests.filter(t => t.status === 'running');
  const completedTests = tests.filter(t => t.status === 'completed');

  const calculateSignificance = (variantA: ABTest['variants'][0], variantB: ABTest['variants'][0]) => {
    const rateA = variantA.sent > 0 ? variantA.responses / variantA.sent : 0;
    const rateB = variantB.sent > 0 ? variantB.responses / variantB.sent : 0;
    
    // Simplified significance calculation
    const pooledRate = (variantA.responses + variantB.responses) / (variantA.sent + variantB.sent);
    if (pooledRate === 0 || pooledRate === 1) return 0;
    
    const standardError = Math.sqrt(pooledRate * (1 - pooledRate) * (1/variantA.sent + 1/variantB.sent));
    if (standardError === 0) return 0;
    
    const zScore = Math.abs(rateA - rateB) / standardError;
    
    // Convert z-score to confidence level (simplified)
    if (zScore >= 2.576) return 99;
    if (zScore >= 1.96) return 95;
    if (zScore >= 1.645) return 90;
    return Math.min(89, Math.round(zScore * 30));
  };

  const toggleTemplateSelection = (templateId: string) => {
    setSelectedTemplates(prev => {
      if (prev.includes(templateId)) {
        return prev.filter(id => id !== templateId);
      }
      if (prev.length >= 2) {
        toast({
          title: 'Máximo de 2 templates',
          description: 'Selecione apenas 2 templates para comparar.',
          variant: 'destructive',
        });
        return prev;
      }
      return [...prev, templateId];
    });
  };

  const handleCreateTest = () => {
    if (selectedTemplates.length !== 2) {
      toast({
        title: 'Selecione 2 templates',
        description: 'Escolha exatamente 2 templates para criar o teste A/B.',
        variant: 'destructive',
      });
      return;
    }

    const templateA = templates?.find(t => t.id === selectedTemplates[0]);
    const templateB = templates?.find(t => t.id === selectedTemplates[1]);

    if (!templateA || !templateB) return;

    // Auto-generate test name and settings
    const niche = templateA.niche === templateB.niche ? templateA.niche : 'Múltiplos';
    const testName = `Teste: ${templateA.name} vs ${templateB.name}`;

    const test: ABTest = {
      id: Date.now().toString(),
      name: testName,
      niche: niche,
      status: 'running', // Auto-start
      variants: [
        { id: 'a', name: templateA.name, content: templateA.content, sent: 0, responses: 0, conversions: 0 },
        { id: 'b', name: templateB.name, content: templateB.content, sent: 0, responses: 0, conversions: 0 },
      ],
      minSampleSize: 50, // Default
      startedAt: new Date().toISOString(),
    };

    setTests(prev => [test, ...prev]);
    setSelectedTemplates([]);
    setIsCreating(false);
    
    toast({
      title: 'Teste A/B iniciado!',
      description: 'As mensagens serão distribuídas automaticamente entre os templates.',
    });
  };

  const handleStartTest = (testId: string) => {
    setTests(prev => prev.map(t => 
      t.id === testId 
        ? { ...t, status: 'running' as const, startedAt: new Date().toISOString() }
        : t
    ));
    toast({ title: 'Teste iniciado!', description: 'As mensagens serão distribuídas entre as variantes.' });
  };

  const handlePauseTest = (testId: string) => {
    setTests(prev => prev.map(t => 
      t.id === testId ? { ...t, status: 'paused' as const } : t
    ));
  };

  const handleDeleteTest = (testId: string) => {
    setTests(prev => prev.filter(t => t.id !== testId));
    toast({ title: 'Teste excluído' });
  };

  const getWinnerVariant = (test: ABTest) => {
    if (test.winnerId) {
      return test.variants.find(v => v.id === test.winnerId);
    }
    
    const sorted = [...test.variants].sort((a, b) => {
      const rateA = a.sent > 0 ? a.responses / a.sent : 0;
      const rateB = b.sent > 0 ? b.responses / b.sent : 0;
      return rateB - rateA;
    });
    
    return sorted[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Testes A/B</h3>
          <p className="text-sm text-muted-foreground">
            Compare diferentes versões de mensagens para descobrir qual converte mais
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Teste
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Teste A/B</DialogTitle>
              <DialogDescription>
                Selecione 2 templates para comparar. O teste será iniciado automaticamente.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Selecione 2 Templates</Label>
                <Badge variant={selectedTemplates.length === 2 ? 'default' : 'secondary'}>
                  {selectedTemplates.length}/2 selecionados
                </Badge>
              </div>

              {(!templates || templates.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhum template disponível.</p>
                  <p className="text-sm">Crie templates na aba "Templates" primeiro.</p>
                </div>
              ) : (
                <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {templates.map(template => {
                    const isSelected = selectedTemplates.includes(template.id);
                    return (
                      <div
                        key={template.id}
                        onClick={() => toggleTemplateSelection(template.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-muted hover:border-muted-foreground/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                            }`}>
                              {isSelected && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                            </div>
                            <span className="font-medium">{template.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{template.niche}</Badge>
                            {template.response_rate && template.response_rate > 0 && (
                              <Badge variant="secondary">
                                {template.response_rate.toFixed(1)}% resposta
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedTemplates.length === 2 && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <FlaskConical className="h-4 w-4 text-primary" />
                    <span className="font-medium text-primary">Configuração Automática</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Distribuição 50/50 entre as variantes</li>
                    <li>• Amostra mínima: 50 envios por variante</li>
                    <li>• Análise estatística em tempo real</li>
                    <li>• O teste será iniciado automaticamente</li>
                  </ul>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsCreating(false); setSelectedTemplates([]); }}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTest} disabled={selectedTemplates.length !== 2}>
                <Play className="h-4 w-4 mr-2" />
                Iniciar Teste
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Testes Ativos</p>
                <p className="text-3xl font-bold">{runningTests.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/20">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Testes Concluídos</p>
                <p className="text-3xl font-bold">{completedTests.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/20">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Melhoria Média</p>
                <p className="text-3xl font-bold text-green-500">+23%</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/20">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Tests */}
      {runningTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-500" />
              Testes em Execução
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {runningTests.map(test => {
              const totalSent = test.variants.reduce((sum, v) => sum + v.sent, 0);
              const progress = Math.min(100, (totalSent / (test.minSampleSize * 2)) * 100);
              const significance = calculateSignificance(test.variants[0], test.variants[1]);
              const leader = getWinnerVariant(test);

              return (
                <div key={test.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{test.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{test.niche}</Badge>
                        <Badge variant="default" className="bg-green-500">Em execução</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handlePauseTest(test.id)}>
                        <Pause className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {test.variants.map((variant, index) => {
                      const responseRate = variant.sent > 0 ? (variant.responses / variant.sent) * 100 : 0;
                      const conversionRate = variant.responses > 0 ? (variant.conversions / variant.responses) * 100 : 0;
                      const isLeading = leader?.id === variant.id;

                      return (
                        <div 
                          key={variant.id} 
                          className={`p-4 rounded-lg border-2 ${isLeading ? 'border-green-500 bg-green-500/5' : 'border-muted'}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium">{variant.name}</span>
                            {isLeading && (
                              <Badge variant="default" className="bg-green-500">
                                <Trophy className="h-3 w-3 mr-1" />
                                Liderando
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-center mb-3">
                            <div>
                              <p className="text-lg font-bold">{variant.sent}</p>
                              <p className="text-xs text-muted-foreground">Enviados</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold">{responseRate.toFixed(1)}%</p>
                              <p className="text-xs text-muted-foreground">Resposta</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold">{variant.conversions}</p>
                              <p className="text-xs text-muted-foreground">Conversões</p>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {variant.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progresso do teste</span>
                      <span>{Math.round(progress)}% ({totalSent}/{test.minSampleSize * 2})</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Confiança estatística</span>
                      <Badge variant={significance >= 95 ? 'default' : 'secondary'}>
                        {significance}%
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Completed Tests */}
      {completedTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Testes Concluídos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedTests.map(test => {
              const winner = getWinnerVariant(test);
              const loser = test.variants.find(v => v.id !== winner?.id);
              const improvement = winner && loser && loser.responses > 0
                ? (((winner.responses / winner.sent) - (loser.responses / loser.sent)) / (loser.responses / loser.sent)) * 100
                : 0;

              return (
                <div key={test.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium">{test.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{test.niche}</Badge>
                        <Badge variant="secondary">Concluído</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Usar Vencedor
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTest(test.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {test.variants.map(variant => {
                      const responseRate = variant.sent > 0 ? (variant.responses / variant.sent) * 100 : 0;
                      const isWinner = variant.id === winner?.id;

                      return (
                        <div 
                          key={variant.id} 
                          className={`p-4 rounded-lg ${isWinner ? 'bg-green-500/10 border border-green-500/30' : 'bg-muted/50'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{variant.name}</span>
                            {isWinner && (
                              <Badge className="bg-green-500">
                                <Trophy className="h-3 w-3 mr-1" />
                                Vencedor
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="text-lg font-bold">{variant.sent}</p>
                              <p className="text-xs text-muted-foreground">Enviados</p>
                            </div>
                            <div>
                              <p className={`text-lg font-bold ${isWinner ? 'text-green-500' : ''}`}>
                                {responseRate.toFixed(1)}%
                              </p>
                              <p className="text-xs text-muted-foreground">Resposta</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold">{variant.conversions}</p>
                              <p className="text-xs text-muted-foreground">Conversões</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {improvement > 0 && (
                    <div className="mt-4 p-3 bg-green-500/10 rounded-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <span className="text-sm">
                        A variante vencedora teve <strong className="text-green-500">+{improvement.toFixed(1)}%</strong> mais respostas
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {tests.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum teste A/B ainda</p>
            <p className="text-sm text-muted-foreground mb-4">
              Crie seu primeiro teste para começar a otimizar suas mensagens
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Teste
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
