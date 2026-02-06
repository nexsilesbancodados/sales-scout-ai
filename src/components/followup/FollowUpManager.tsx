import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useLeads } from '@/hooks/use-leads';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  MessageSquare,
  Plus,
  Trash2,
  Play,
  Pause,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Zap,
  Users,
  Timer,
  Bell,
} from 'lucide-react';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FollowUpSequence {
  id: string;
  name: string;
  enabled: boolean;
  steps: FollowUpStep[];
}

interface FollowUpStep {
  id: string;
  daysAfterPrevious: number;
  message: string;
  condition: 'no_response' | 'any' | 'positive_only';
}

const DEFAULT_SEQUENCES: FollowUpSequence[] = [
  {
    id: 'default',
    name: 'Sequência Padrão',
    enabled: true,
    steps: [
      {
        id: 'step1',
        daysAfterPrevious: 3,
        message: 'Olá {empresa}! 👋 Passei aqui para saber se você teve a oportunidade de analisar minha proposta. Ficou alguma dúvida?',
        condition: 'no_response',
      },
      {
        id: 'step2',
        daysAfterPrevious: 7,
        message: 'Oi {empresa}! Tudo bem? Sei que a rotina é corrida, mas gostaria de saber se posso ajudar de alguma forma. Estou à disposição! 😊',
        condition: 'no_response',
      },
      {
        id: 'step3',
        daysAfterPrevious: 15,
        message: '{empresa}, última tentativa de contato! Se não for o momento, sem problemas. Caso mude de ideia futuramente, é só me chamar. Sucesso! 🚀',
        condition: 'no_response',
      },
    ],
  },
];

export function FollowUpManager() {
  const { settings } = useUserSettings();
  const { leads } = useLeads();
  const { toast } = useToast();
  
  const [sequences, setSequences] = useState<FollowUpSequence[]>(DEFAULT_SEQUENCES);
  const [isCreatingSequence, setIsCreatingSequence] = useState(false);
  const [newSequenceName, setNewSequenceName] = useState('');
  const [selectedSequence, setSelectedSequence] = useState<string>('default');
  const [isRunning, setIsRunning] = useState(false);
  const [followUpLog, setFollowUpLog] = useState<string[]>([]);
  const [pendingFollowUps, setPendingFollowUps] = useState<any[]>([]);

  // Calculate leads needing follow-up
  const leadsNeedingFollowUp = leads.filter(lead => {
    if (lead.stage === 'Ganho' || lead.stage === 'Perdido') return false;
    if (!lead.last_contact_at) return false;
    
    const daysSinceContact = differenceInDays(new Date(), parseISO(lead.last_contact_at));
    return daysSinceContact >= 3 && !lead.last_response_at;
  });

  // Get current sequence
  const currentSequence = sequences.find(s => s.id === selectedSequence) || sequences[0];

  const addLog = (message: string) => {
    const timestamp = format(new Date(), 'HH:mm:ss');
    setFollowUpLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  const calculatePendingFollowUps = () => {
    const pending: any[] = [];
    
    leadsNeedingFollowUp.forEach(lead => {
      if (!lead.last_contact_at) return;
      
      const daysSinceContact = differenceInDays(new Date(), parseISO(lead.last_contact_at));
      const followUpCount = lead.follow_up_count || 0;
      
      // Find the next step based on follow-up count
      const nextStep = currentSequence.steps[followUpCount];
      if (!nextStep) return; // Already completed all steps
      
      // Calculate days until next follow-up
      const cumulativeDays = currentSequence.steps
        .slice(0, followUpCount + 1)
        .reduce((sum, step) => sum + step.daysAfterPrevious, 0);
      
      const daysUntilFollowUp = cumulativeDays - daysSinceContact;
      
      pending.push({
        lead,
        step: followUpCount + 1,
        totalSteps: currentSequence.steps.length,
        daysUntilFollowUp,
        message: nextStep.message
          .replace('{empresa}', lead.business_name)
          .replace('{nicho}', lead.niche || ''),
        isOverdue: daysUntilFollowUp <= 0,
      });
    });
    
    // Sort by urgency (overdue first, then by days until)
    pending.sort((a, b) => a.daysUntilFollowUp - b.daysUntilFollowUp);
    
    setPendingFollowUps(pending);
    return pending;
  };

  const runFollowUps = async () => {
    if (!settings?.whatsapp_connected) {
      toast({
        title: 'WhatsApp não conectado',
        description: 'Conecte seu WhatsApp em Configurações.',
        variant: 'destructive',
      });
      return;
    }

    setIsRunning(true);
    addLog('🚀 Iniciando sequência de follow-ups...');
    
    const pending = calculatePendingFollowUps();
    const overdue = pending.filter(p => p.isOverdue);
    
    addLog(`📋 ${overdue.length} follow-ups pendentes para enviar`);
    
    for (const item of overdue) {
      try {
        addLog(`📤 Enviando follow-up #${item.step} para ${item.lead.business_name}...`);
        
        // Send via WhatsApp
        const response = await supabase.functions.invoke('whatsapp-send', {
          body: {
            phone: item.lead.phone,
            message: item.message,
            instance_id: settings.whatsapp_instance_id,
          },
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        // Update lead
        await supabase
          .from('leads')
          .update({
            last_contact_at: new Date().toISOString(),
            follow_up_count: item.step,
            next_follow_up_at: item.step < item.totalSteps 
              ? addDays(new Date(), currentSequence.steps[item.step]?.daysAfterPrevious || 7).toISOString()
              : null,
          })
          .eq('id', item.lead.id);

        // Save message to chat
        await supabase.from('chat_messages').insert({
          lead_id: item.lead.id,
          sender_type: 'agent',
          content: item.message,
          status: 'sent',
        });

        addLog(`✅ Follow-up enviado para ${item.lead.business_name}`);
        
        // Random delay between 30-90 seconds
        const delay = Math.floor(Math.random() * 60000) + 30000;
        addLog(`⏳ Aguardando ${Math.round(delay / 1000)}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error: any) {
        addLog(`❌ Erro ao enviar para ${item.lead.business_name}: ${error.message}`);
      }
    }
    
    addLog('✨ Sequência de follow-ups concluída!');
    setIsRunning(false);
    
    toast({
      title: '✓ Follow-ups enviados',
      description: `${overdue.length} mensagens de acompanhamento enviadas.`,
    });
  };

  const addStep = () => {
    setSequences(prev => prev.map(seq => {
      if (seq.id !== selectedSequence) return seq;
      return {
        ...seq,
        steps: [
          ...seq.steps,
          {
            id: `step-${Date.now()}`,
            daysAfterPrevious: 7,
            message: 'Olá {empresa}! Gostaria de saber se posso ajudar...',
            condition: 'no_response',
          },
        ],
      };
    }));
  };

  const updateStep = (stepId: string, updates: Partial<FollowUpStep>) => {
    setSequences(prev => prev.map(seq => {
      if (seq.id !== selectedSequence) return seq;
      return {
        ...seq,
        steps: seq.steps.map(step => 
          step.id === stepId ? { ...step, ...updates } : step
        ),
      };
    }));
  };

  const removeStep = (stepId: string) => {
    setSequences(prev => prev.map(seq => {
      if (seq.id !== selectedSequence) return seq;
      return {
        ...seq,
        steps: seq.steps.filter(step => step.id !== stepId),
      };
    }));
  };

  const createSequence = () => {
    if (!newSequenceName.trim()) return;
    
    const newSeq: FollowUpSequence = {
      id: `seq-${Date.now()}`,
      name: newSequenceName,
      enabled: true,
      steps: [],
    };
    
    setSequences(prev => [...prev, newSeq]);
    setSelectedSequence(newSeq.id);
    setNewSequenceName('');
    setIsCreatingSequence(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aguardando Follow-up</p>
                <p className="text-3xl font-bold">{leadsNeedingFollowUp.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atrasados (enviar agora)</p>
                <p className="text-3xl font-bold text-orange-500">
                  {pendingFollowUps.filter(p => p.isOverdue).length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/20">
                <AlertCircle className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sequências Ativas</p>
                <p className="text-3xl font-bold">{sequences.filter(s => s.enabled).length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Zap className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sequence Editor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Sequências de Follow-up
                </CardTitle>
                <CardDescription>
                  Configure mensagens automáticas de acompanhamento
                </CardDescription>
              </div>
              <Dialog open={isCreatingSequence} onOpenChange={setIsCreatingSequence}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Sequência</DialogTitle>
                    <DialogDescription>
                      Crie uma nova sequência de follow-up
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nome da Sequência</Label>
                      <Input
                        value={newSequenceName}
                        onChange={(e) => setNewSequenceName(e.target.value)}
                        placeholder="Ex: Follow-up Agressivo"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={createSequence}>Criar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sequence Selector */}
            <div className="space-y-2">
              <Label>Sequência Ativa</Label>
              <Select value={selectedSequence} onValueChange={setSelectedSequence}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sequences.map(seq => (
                    <SelectItem key={seq.id} value={seq.id}>
                      {seq.name} ({seq.steps.length} passos)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Steps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Passos da Sequência</Label>
                <Button variant="ghost" size="sm" onClick={addStep}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Passo
                </Button>
              </div>

              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {currentSequence.steps.map((step, index) => (
                    <Card key={step.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              value={step.daysAfterPrevious}
                              onChange={(e) => updateStep(step.id, { daysAfterPrevious: Number(e.target.value) })}
                              className="w-20"
                              min={1}
                            />
                            <span className="text-sm text-muted-foreground">
                              dias após {index === 0 ? 'primeiro contato' : 'passo anterior'}
                            </span>
                          </div>
                          <Textarea
                            value={step.message}
                            onChange={(e) => updateStep(step.id, { message: e.target.value })}
                            rows={3}
                            placeholder="Mensagem de follow-up..."
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {step.condition === 'no_response' && 'Sem resposta'}
                                {step.condition === 'any' && 'Qualquer'}
                                {step.condition === 'positive_only' && 'Positivo'}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => removeStep(step.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {currentSequence.steps.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Nenhum passo configurado</p>
                      <Button variant="link" onClick={addStep}>
                        Adicionar primeiro passo
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Execution Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Executar Follow-ups
            </CardTitle>
            <CardDescription>
              Envie mensagens de acompanhamento para leads pendentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  calculatePendingFollowUps();
                  addLog('📊 Lista de follow-ups atualizada');
                }}
                variant="outline"
                disabled={isRunning}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Lista
              </Button>
              <Button
                onClick={runFollowUps}
                disabled={isRunning || pendingFollowUps.filter(p => p.isOverdue).length === 0}
                className="flex-1"
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Enviar Follow-ups ({pendingFollowUps.filter(p => p.isOverdue).length})
              </Button>
            </div>

            <Separator />

            {/* Pending List */}
            <div>
              <Label className="mb-2 block">Próximos Follow-ups</Label>
              <ScrollArea className="h-[200px] border rounded-lg p-3">
                {pendingFollowUps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Nenhum follow-up pendente</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingFollowUps.slice(0, 10).map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg text-sm ${
                          item.isOverdue ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.lead.business_name}</span>
                          <Badge variant={item.isOverdue ? 'destructive' : 'secondary'}>
                            {item.isOverdue 
                              ? 'Atrasado!' 
                              : `Em ${item.daysUntilFollowUp} dia(s)`}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs mt-1">
                          Passo {item.step}/{item.totalSteps}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            <Separator />

            {/* Log */}
            <div>
              <Label className="mb-2 block">Log de Execução</Label>
              <ScrollArea className="h-[150px] bg-muted/50 rounded-lg p-3">
                <div className="space-y-1 font-mono text-xs">
                  {followUpLog.length === 0 ? (
                    <p className="text-muted-foreground">Aguardando execução...</p>
                  ) : (
                    followUpLog.map((log, idx) => (
                      <p key={idx} className={
                        log.includes('✅') ? 'text-green-600 dark:text-green-400' :
                        log.includes('❌') ? 'text-destructive' :
                        log.includes('⏳') ? 'text-muted-foreground' :
                        'text-foreground'
                      }>
                        {log}
                      </p>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
