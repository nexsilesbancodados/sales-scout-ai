import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Timer,
  Users,
  Calendar,
  Loader2,
  RefreshCw,
  Info,
  Settings2,
  Gauge,
  Target,
} from 'lucide-react';

// Warmup phases configuration
const WARMUP_PHASES = [
  { day: 1, dailyLimit: 5, description: 'Início - Aquecimento suave', interval: 180 },
  { day: 2, dailyLimit: 10, description: 'Dia 2 - Aumentando devagar', interval: 150 },
  { day: 3, dailyLimit: 15, description: 'Dia 3 - Ritmo crescente', interval: 120 },
  { day: 4, dailyLimit: 25, description: 'Dia 4 - Volume moderado', interval: 100 },
  { day: 5, dailyLimit: 35, description: 'Dia 5 - Consolidando', interval: 90 },
  { day: 6, dailyLimit: 50, description: 'Dia 6 - Quase normal', interval: 80 },
  { day: 7, dailyLimit: 75, description: 'Dia 7+ - Volume normal', interval: 60 },
];

// Risk level calculation
function calculateRiskLevel(settings: {
  dailyLimit: number;
  intervalSeconds: number;
  warmupDay: number;
}): { level: 'low' | 'medium' | 'high' | 'critical'; score: number; message: string } {
  let score = 0;
  
  // Daily limit scoring (0-40 points)
  if (settings.dailyLimit > 100) score += 40;
  else if (settings.dailyLimit > 75) score += 30;
  else if (settings.dailyLimit > 50) score += 20;
  else if (settings.dailyLimit > 25) score += 10;
  
  // Interval scoring (0-40 points)
  if (settings.intervalSeconds < 30) score += 40;
  else if (settings.intervalSeconds < 60) score += 30;
  else if (settings.intervalSeconds < 90) score += 20;
  else if (settings.intervalSeconds < 120) score += 10;
  
  // Warmup day scoring (0-20 points)
  if (settings.warmupDay < 3) score += 20;
  else if (settings.warmupDay < 5) score += 15;
  else if (settings.warmupDay < 7) score += 10;
  
  if (score >= 70) return { level: 'critical', score, message: 'PERIGO! Alto risco de bloqueio' };
  if (score >= 50) return { level: 'high', score, message: 'Risco elevado - Recomendamos ajustar' };
  if (score >= 30) return { level: 'medium', score, message: 'Risco moderado - Atenção recomendada' };
  return { level: 'low', score, message: 'Configuração segura' };
}

export interface AntiBlockConfig {
  // Warmup
  warmupEnabled: boolean;
  warmupStartDate: string | null;
  warmupDay: number;
  
  // Limits
  dailyMessageLimit: number;
  hourlyMessageLimit: number;
  messageIntervalMin: number;
  messageIntervalMax: number;
  
  // Timing
  operateAllDay: boolean;
  startHour: number;
  endHour: number;
  workDaysOnly: boolean;
  
  // Behavior
  randomizeInterval: boolean;
  randomizeOrder: boolean;
  pauseOnError: boolean;
  maxConsecutiveErrors: number;
  pauseDurationMinutes: number;
  
  // Natural patterns
  typingSimulation: boolean;
  typingDelayMs: number;
  readReceiptDelay: boolean;
  
  // Advanced
  cooldownAfterBatch: boolean;
  batchSize: number;
  cooldownMinutes: number;
  
  // Auto-detection
  autoSlowdown: boolean;
  slowdownThreshold: number;
}

const DEFAULT_CONFIG: AntiBlockConfig = {
  warmupEnabled: true,
  warmupStartDate: null,
  warmupDay: 1,
  dailyMessageLimit: 30,
  hourlyMessageLimit: 10,
  messageIntervalMin: 60,
  messageIntervalMax: 180,
  operateAllDay: false,
  startHour: 9,
  endHour: 18,
  workDaysOnly: true,
  randomizeInterval: true,
  randomizeOrder: true,
  pauseOnError: true,
  maxConsecutiveErrors: 3,
  pauseDurationMinutes: 30,
  typingSimulation: true,
  typingDelayMs: 2000,
  readReceiptDelay: true,
  cooldownAfterBatch: true,
  batchSize: 10,
  cooldownMinutes: 15,
  autoSlowdown: true,
  slowdownThreshold: 5,
};

export function AntiBlockSettings() {
  const { settings, updateSettings, isUpdating } = useUserSettings();
  const { toast } = useToast();
  
  const [config, setConfig] = useState<AntiBlockConfig>(DEFAULT_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      // Load settings from user_settings
      setConfig({
        ...DEFAULT_CONFIG,
        dailyMessageLimit: settings.daily_message_limit || 30,
        messageIntervalMin: settings.message_interval_seconds || 60,
        messageIntervalMax: (settings.message_interval_seconds || 60) * 3,
        startHour: settings.auto_start_hour || 9,
        endHour: settings.auto_end_hour || 18,
      });
    }
  }, [settings]);

  const handleChange = <K extends keyof AntiBlockConfig>(key: K, value: AntiBlockConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings({
      daily_message_limit: config.dailyMessageLimit,
      message_interval_seconds: config.messageIntervalMin,
      auto_start_hour: config.startHour,
      auto_end_hour: config.endHour,
    });
    setHasChanges(false);
  };

  const startWarmup = () => {
    handleChange('warmupEnabled', true);
    handleChange('warmupStartDate', new Date().toISOString());
    handleChange('warmupDay', 1);
    handleChange('dailyMessageLimit', WARMUP_PHASES[0].dailyLimit);
    handleChange('messageIntervalMin', WARMUP_PHASES[0].interval);
    toast({
      title: '🔥 Warmup iniciado!',
      description: 'Seu número será aquecido gradualmente ao longo de 7 dias.',
    });
  };

  const applyRecommendedSettings = () => {
    setConfig({
      ...DEFAULT_CONFIG,
      warmupEnabled: true,
      warmupStartDate: new Date().toISOString(),
      warmupDay: 1,
    });
    setHasChanges(true);
    toast({
      title: '✓ Configurações recomendadas aplicadas',
      description: 'Ajustes otimizados para máxima segurança.',
    });
  };

  const riskLevel = calculateRiskLevel({
    dailyLimit: config.dailyMessageLimit,
    intervalSeconds: config.messageIntervalMin,
    warmupDay: config.warmupDay,
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/10 border-green-500/30';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'high': return 'bg-orange-500/10 border-orange-500/30';
      case 'critical': return 'bg-destructive/10 border-destructive/30';
      default: return '';
    }
  };

  const currentPhase = WARMUP_PHASES.find(p => p.day === config.warmupDay) || WARMUP_PHASES[WARMUP_PHASES.length - 1];

  return (
    <div className="space-y-6">
      {/* Risk Level Overview */}
      <Card className={`${getRiskBgColor(riskLevel.level)}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className={`h-5 w-5 ${getRiskColor(riskLevel.level)}`} />
              Nível de Risco de Bloqueio
            </CardTitle>
            <Badge 
              variant={riskLevel.level === 'low' ? 'default' : 'destructive'}
              className="text-sm px-3 py-1"
            >
              {riskLevel.level === 'low' && '✓ Seguro'}
              {riskLevel.level === 'medium' && '⚠ Atenção'}
              {riskLevel.level === 'high' && '⚠ Alto Risco'}
              {riskLevel.level === 'critical' && '🚨 Crítico'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Progress 
                value={100 - riskLevel.score} 
                className="flex-1 h-3"
              />
              <span className={`font-bold ${getRiskColor(riskLevel.level)}`}>
                {100 - riskLevel.score}%
              </span>
            </div>
            <p className={`text-sm ${getRiskColor(riskLevel.level)}`}>
              {riskLevel.message}
            </p>
            {riskLevel.level !== 'low' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={applyRecommendedSettings}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Aplicar Configurações Recomendadas
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Settings Tabs */}
      <Tabs defaultValue="warmup" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="warmup" className="gap-1">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Warmup</span>
          </TabsTrigger>
          <TabsTrigger value="limits" className="gap-1">
            <Gauge className="h-4 w-4" />
            <span className="hidden sm:inline">Limites</span>
          </TabsTrigger>
          <TabsTrigger value="timing" className="gap-1">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Horários</span>
          </TabsTrigger>
          <TabsTrigger value="behavior" className="gap-1">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Comportamento</span>
          </TabsTrigger>
        </TabsList>

        {/* Warmup Tab */}
        <TabsContent value="warmup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Aquecimento do Número
              </CardTitle>
              <CardDescription>
                O warmup aumenta gradualmente o volume de mensagens para evitar bloqueios em números novos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div>
                  <p className="font-medium">Warmup Ativo</p>
                  <p className="text-sm text-muted-foreground">
                    Ativa o aquecimento progressivo do número
                  </p>
                </div>
                <Switch
                  checked={config.warmupEnabled}
                  onCheckedChange={(v) => handleChange('warmupEnabled', v)}
                />
              </div>

              {config.warmupEnabled ? (
                <>
                  {/* Current Phase */}
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-medium">Fase Atual</p>
                      <Badge variant="secondary">Dia {config.warmupDay} de 7</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{currentPhase.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>Limite: <strong>{currentPhase.dailyLimit} msgs/dia</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-primary" />
                        <span>Intervalo: <strong>{currentPhase.interval}s+</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Warmup Phases Timeline */}
                  <div className="space-y-2">
                    <Label>Cronograma do Warmup</Label>
                    <div className="space-y-2">
                      {WARMUP_PHASES.map((phase, idx) => (
                        <div 
                          key={phase.day}
                          className={`flex items-center gap-3 p-2 rounded-lg ${
                            phase.day === config.warmupDay 
                              ? 'bg-primary/10 border border-primary/30' 
                              : phase.day < config.warmupDay 
                                ? 'opacity-50' 
                                : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            phase.day < config.warmupDay 
                              ? 'bg-primary text-primary-foreground' 
                              : phase.day === config.warmupDay 
                                ? 'bg-primary/20 text-primary border-2 border-primary' 
                                : 'bg-muted text-muted-foreground'
                          }`}>
                            {phase.day < config.warmupDay ? <CheckCircle2 className="h-4 w-4" /> : phase.day}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{phase.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {phase.dailyLimit} msgs/dia • {phase.interval}s intervalo
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Manual Day Adjustment */}
                  <div className="space-y-2">
                    <Label>Ajustar Dia do Warmup (manual)</Label>
                    <Select 
                      value={String(config.warmupDay)} 
                      onValueChange={(v) => handleChange('warmupDay', Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WARMUP_PHASES.map(phase => (
                          <SelectItem key={phase.day} value={String(phase.day)}>
                            Dia {phase.day} - {phase.dailyLimit} msgs/dia
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Se você já tem histórico no WhatsApp, pode avançar para um dia maior
                    </p>
                  </div>
                </>
              ) : (
                <Button onClick={startWarmup} className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Iniciar Warmup (7 dias)
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Limits Tab */}
        <TabsContent value="limits">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                Limites de Envio
              </CardTitle>
              <CardDescription>
                Configure limites diários e por hora para evitar comportamento suspeito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Daily Limit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Limite Diário de Mensagens</Label>
                  <Badge variant="outline">{config.dailyMessageLimit} msgs/dia</Badge>
                </div>
                <Slider
                  value={[config.dailyMessageLimit]}
                  onValueChange={([v]) => handleChange('dailyMessageLimit', v)}
                  min={5}
                  max={150}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5 (Seguro)</span>
                  <span>50 (Normal)</span>
                  <span>150 (Arriscado)</span>
                </div>
              </div>

              <Separator />

              {/* Hourly Limit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Limite por Hora</Label>
                  <Badge variant="outline">{config.hourlyMessageLimit} msgs/hora</Badge>
                </div>
                <Slider
                  value={[config.hourlyMessageLimit]}
                  onValueChange={([v]) => handleChange('hourlyMessageLimit', v)}
                  min={2}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Interval Settings */}
              <div className="space-y-3">
                <Label>Intervalo entre Mensagens (segundos)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Mínimo</Label>
                    <Input
                      type="number"
                      value={config.messageIntervalMin}
                      onChange={(e) => handleChange('messageIntervalMin', Number(e.target.value))}
                      min={30}
                      max={300}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Máximo</Label>
                    <Input
                      type="number"
                      value={config.messageIntervalMax}
                      onChange={(e) => handleChange('messageIntervalMax', Number(e.target.value))}
                      min={60}
                      max={600}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  O sistema escolherá um intervalo aleatório entre o mínimo e máximo para parecer mais humano
                </p>
              </div>

              <Separator />

              {/* Batch Cooldown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                  <div>
                    <p className="font-medium">Pausa após Lote</p>
                    <p className="text-sm text-muted-foreground">
                      Faz uma pausa maior após enviar várias mensagens seguidas
                    </p>
                  </div>
                  <Switch
                    checked={config.cooldownAfterBatch}
                    onCheckedChange={(v) => handleChange('cooldownAfterBatch', v)}
                  />
                </div>
                
                {config.cooldownAfterBatch && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tamanho do Lote</Label>
                      <Input
                        type="number"
                        value={config.batchSize}
                        onChange={(e) => handleChange('batchSize', Number(e.target.value))}
                        min={5}
                        max={30}
                      />
                      <p className="text-xs text-muted-foreground">Msgs antes da pausa</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Duração da Pausa</Label>
                      <Input
                        type="number"
                        value={config.cooldownMinutes}
                        onChange={(e) => handleChange('cooldownMinutes', Number(e.target.value))}
                        min={5}
                        max={60}
                      />
                      <p className="text-xs text-muted-foreground">Minutos de pausa</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timing Tab */}
        <TabsContent value="timing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Horários de Operação
              </CardTitle>
              <CardDescription>
                Configure os horários em que as mensagens podem ser enviadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 24 Hours Operation */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Operação 24 Horas
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Permite enviar mensagens a qualquer hora do dia
                  </p>
                </div>
                <Switch
                  checked={config.operateAllDay}
                  onCheckedChange={(v) => handleChange('operateAllDay', v)}
                />
              </div>

              {config.operateAllDay && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Atenção</AlertTitle>
                  <AlertDescription>
                    Enviar mensagens fora do horário comercial pode aumentar o risco de bloqueio 
                    e diminuir a taxa de resposta. Use com cautela.
                  </AlertDescription>
                </Alert>
              )}

              {/* Working Hours */}
              {!config.operateAllDay && (
                <div className="space-y-3">
                  <Label>Horário de Funcionamento</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Início</Label>
                      <Select 
                        value={String(config.startHour)} 
                        onValueChange={(v) => handleChange('startHour', Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>
                              {i.toString().padStart(2, '0')}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Fim</Label>
                      <Select 
                        value={String(config.endHour)} 
                        onValueChange={(v) => handleChange('endHour', Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>
                              {i.toString().padStart(2, '0')}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div>
                  <p className="font-medium">Apenas Dias Úteis</p>
                  <p className="text-sm text-muted-foreground">
                    Não envia mensagens nos finais de semana
                  </p>
                </div>
                <Switch
                  checked={config.workDaysOnly}
                  onCheckedChange={(v) => handleChange('workDaysOnly', v)}
                />
              </div>

              {!config.operateAllDay && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Recomendação</AlertTitle>
                  <AlertDescription>
                    Enviar mensagens fora do horário comercial (9h-18h) pode parecer spam e aumenta 
                    o risco de bloqueio. Respeite o horário dos seus leads.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                Comportamento Humanizado
              </CardTitle>
              <CardDescription>
                Configure comportamentos que simulam uso humano natural
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Randomization */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div>
                  <p className="font-medium">Intervalos Aleatórios</p>
                  <p className="text-sm text-muted-foreground">
                    Varia o tempo entre mensagens para parecer mais natural
                  </p>
                </div>
                <Switch
                  checked={config.randomizeInterval}
                  onCheckedChange={(v) => handleChange('randomizeInterval', v)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div>
                  <p className="font-medium">Ordem Aleatória</p>
                  <p className="text-sm text-muted-foreground">
                    Envia para leads em ordem aleatória, não sequencial
                  </p>
                </div>
                <Switch
                  checked={config.randomizeOrder}
                  onCheckedChange={(v) => handleChange('randomizeOrder', v)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div>
                  <p className="font-medium">Simular Digitação</p>
                  <p className="text-sm text-muted-foreground">
                    Mostra "digitando..." antes de enviar cada mensagem
                  </p>
                </div>
                <Switch
                  checked={config.typingSimulation}
                  onCheckedChange={(v) => handleChange('typingSimulation', v)}
                />
              </div>

              {config.typingSimulation && (
                <div className="space-y-2 ml-4">
                  <Label>Tempo de Digitação (ms)</Label>
                  <Slider
                    value={[config.typingDelayMs]}
                    onValueChange={([v]) => handleChange('typingDelayMs', v)}
                    min={500}
                    max={5000}
                    step={100}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    {(config.typingDelayMs / 1000).toFixed(1)}s de "digitando..." antes de enviar
                  </p>
                </div>
              )}

              <Separator />

              {/* Error Handling */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div>
                  <p className="font-medium">Pausar em Erros</p>
                  <p className="text-sm text-muted-foreground">
                    Pausa automaticamente se detectar problemas consecutivos
                  </p>
                </div>
                <Switch
                  checked={config.pauseOnError}
                  onCheckedChange={(v) => handleChange('pauseOnError', v)}
                />
              </div>

              {config.pauseOnError && (
                <div className="grid grid-cols-2 gap-4 ml-4">
                  <div className="space-y-2">
                    <Label>Erros Consecutivos</Label>
                    <Input
                      type="number"
                      value={config.maxConsecutiveErrors}
                      onChange={(e) => handleChange('maxConsecutiveErrors', Number(e.target.value))}
                      min={1}
                      max={10}
                    />
                    <p className="text-xs text-muted-foreground">Antes de pausar</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Duração da Pausa</Label>
                    <Input
                      type="number"
                      value={config.pauseDurationMinutes}
                      onChange={(e) => handleChange('pauseDurationMinutes', Number(e.target.value))}
                      min={5}
                      max={120}
                    />
                    <p className="text-xs text-muted-foreground">Minutos</p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Auto Slowdown */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div>
                  <p className="font-medium">Redução Automática</p>
                  <p className="text-sm text-muted-foreground">
                    Reduz velocidade automaticamente se detectar sinais de risco
                  </p>
                </div>
                <Switch
                  checked={config.autoSlowdown}
                  onCheckedChange={(v) => handleChange('autoSlowdown', v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-between items-center">
        <Alert className="flex-1 mr-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Dica:</strong> Comece com configurações conservadoras e aumente gradualmente 
            após algumas semanas de uso sem problemas.
          </AlertDescription>
        </Alert>
        
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || isUpdating}
          size="lg"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
