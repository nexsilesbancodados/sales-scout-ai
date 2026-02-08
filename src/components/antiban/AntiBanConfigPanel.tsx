import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Clock, 
  Timer,
  Flame,
  Coffee,
  MessageSquare,
  Save,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { useAntiBan } from '@/hooks/use-antiban';
import { useToast } from '@/hooks/use-toast';

export function AntiBanConfigPanel() {
  const { config, updateConfig, isUpdatingConfig } = useAntiBan();
  const { toast } = useToast();

  const [localConfig, setLocalConfig] = useState({
    min_delay_seconds: config?.min_delay_seconds ?? 30,
    max_delay_seconds: config?.max_delay_seconds ?? 90,
    warmup_enabled: config?.warmup_enabled ?? true,
    warmup_daily_limit: config?.warmup_daily_limit ?? 10,
    warmup_increment_percent: config?.warmup_increment_percent ?? 20,
    typing_enabled: config?.typing_enabled ?? true,
    min_typing_seconds: config?.min_typing_seconds ?? 2,
    max_typing_seconds: config?.max_typing_seconds ?? 6,
    rest_pause_enabled: config?.rest_pause_enabled ?? true,
    messages_before_rest: config?.messages_before_rest ?? 20,
    rest_duration_minutes: config?.rest_duration_minutes ?? 15,
    daily_limit: config?.daily_limit ?? 200,
    hourly_limit: config?.hourly_limit ?? 30,
    blacklist_keywords: config?.blacklist_keywords ?? ['sair', 'stop', 'pare'],
  });

  const [hasChanges, setHasChanges] = useState(false);

  const updateLocal = (key: string, value: any) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateConfig(localConfig);
    setHasChanges(false);
    toast({
      title: '✓ Configurações Anti-Ban salvas',
      description: 'As proteções foram atualizadas.',
    });
  };

  const applyConservative = () => {
    setLocalConfig({
      min_delay_seconds: 60,
      max_delay_seconds: 180,
      warmup_enabled: true,
      warmup_daily_limit: 5,
      warmup_increment_percent: 15,
      typing_enabled: true,
      min_typing_seconds: 3,
      max_typing_seconds: 8,
      rest_pause_enabled: true,
      messages_before_rest: 10,
      rest_duration_minutes: 30,
      daily_limit: 100,
      hourly_limit: 15,
      blacklist_keywords: ['sair', 'stop', 'pare', 'parar', 'não quero', 'remover'],
    });
    setHasChanges(true);
    toast({
      title: 'Configuração Conservadora',
      description: 'Máxima proteção aplicada. Clique em Salvar.',
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Delays */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Intervalos
          </CardTitle>
          <CardDescription>
            Tempo entre cada mensagem enviada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Intervalo mínimo</Label>
              <span className="text-sm font-medium">{localConfig.min_delay_seconds}s</span>
            </div>
            <Slider
              value={[localConfig.min_delay_seconds]}
              onValueChange={([v]) => updateLocal('min_delay_seconds', v)}
              min={15}
              max={120}
              step={5}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Intervalo máximo</Label>
              <span className="text-sm font-medium">{localConfig.max_delay_seconds}s</span>
            </div>
            <Slider
              value={[localConfig.max_delay_seconds]}
              onValueChange={([v]) => updateLocal('max_delay_seconds', v)}
              min={30}
              max={300}
              step={10}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Intervalos maiores = mais seguro. Recomendado: 60-180s
          </p>
        </CardContent>
      </Card>

      {/* Typing Simulation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Simulação de Digitação
          </CardTitle>
          <CardDescription>
            Envia "digitando..." antes da mensagem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Ativar simulação</Label>
            <Switch
              checked={localConfig.typing_enabled}
              onCheckedChange={(v) => updateLocal('typing_enabled', v)}
            />
          </div>

          {localConfig.typing_enabled && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Duração mínima</Label>
                  <span className="text-sm font-medium">{localConfig.min_typing_seconds}s</span>
                </div>
                <Slider
                  value={[localConfig.min_typing_seconds]}
                  onValueChange={([v]) => updateLocal('min_typing_seconds', v)}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Duração máxima</Label>
                  <span className="text-sm font-medium">{localConfig.max_typing_seconds}s</span>
                </div>
                <Slider
                  value={[localConfig.max_typing_seconds]}
                  onValueChange={([v]) => updateLocal('max_typing_seconds', v)}
                  min={3}
                  max={15}
                  step={1}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Warmup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Aquecimento Progressivo
          </CardTitle>
          <CardDescription>
            Aumenta o volume gradualmente para evitar bloqueio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Ativar aquecimento</Label>
            <Switch
              checked={localConfig.warmup_enabled}
              onCheckedChange={(v) => updateLocal('warmup_enabled', v)}
            />
          </div>

          {localConfig.warmup_enabled && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Limite inicial</Label>
                  <span className="text-sm font-medium">{localConfig.warmup_daily_limit} msgs/dia</span>
                </div>
                <Slider
                  value={[localConfig.warmup_daily_limit]}
                  onValueChange={([v]) => updateLocal('warmup_daily_limit', v)}
                  min={5}
                  max={30}
                  step={5}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Aumento diário</Label>
                  <span className="text-sm font-medium">{localConfig.warmup_increment_percent}%</span>
                </div>
                <Slider
                  value={[localConfig.warmup_increment_percent]}
                  onValueChange={([v]) => updateLocal('warmup_increment_percent', v)}
                  min={10}
                  max={50}
                  step={5}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Dia 1: {localConfig.warmup_daily_limit} msgs → 
                Dia 7: ~{Math.floor(localConfig.warmup_daily_limit * Math.pow(1 + localConfig.warmup_increment_percent/100, 6))} msgs
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Rest Pauses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            Pausas de Descanso
          </CardTitle>
          <CardDescription>
            Pausa automática após X mensagens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Ativar pausas</Label>
            <Switch
              checked={localConfig.rest_pause_enabled}
              onCheckedChange={(v) => updateLocal('rest_pause_enabled', v)}
            />
          </div>

          {localConfig.rest_pause_enabled && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Mensagens antes da pausa</Label>
                  <span className="text-sm font-medium">{localConfig.messages_before_rest}</span>
                </div>
                <Slider
                  value={[localConfig.messages_before_rest]}
                  onValueChange={([v]) => updateLocal('messages_before_rest', v)}
                  min={5}
                  max={50}
                  step={5}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Duração da pausa</Label>
                  <span className="text-sm font-medium">{localConfig.rest_duration_minutes} min</span>
                </div>
                <Slider
                  value={[localConfig.rest_duration_minutes]}
                  onValueChange={([v]) => updateLocal('rest_duration_minutes', v)}
                  min={5}
                  max={60}
                  step={5}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Limites
          </CardTitle>
          <CardDescription>
            Limites máximos de envio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Limite diário máximo</Label>
              <span className="text-sm font-medium">{localConfig.daily_limit} msgs</span>
            </div>
            <Slider
              value={[localConfig.daily_limit]}
              onValueChange={([v]) => updateLocal('daily_limit', v)}
              min={50}
              max={500}
              step={10}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Limite por hora</Label>
              <span className="text-sm font-medium">{localConfig.hourly_limit} msgs</span>
            </div>
            <Slider
              value={[localConfig.hourly_limit]}
              onValueChange={([v]) => updateLocal('hourly_limit', v)}
              min={10}
              max={60}
              step={5}
            />
          </div>
        </CardContent>
      </Card>

      {/* Blacklist Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Palavras de Opt-out</CardTitle>
          <CardDescription>
            Se o lead responder com essas palavras, será removido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {localConfig.blacklist_keywords.map((kw, i) => (
              <div 
                key={i}
                className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm flex items-center gap-1"
              >
                {kw}
                <button 
                  onClick={() => {
                    const newKw = localConfig.blacklist_keywords.filter((_, idx) => idx !== i);
                    updateLocal('blacklist_keywords', newKw);
                  }}
                  className="ml-1 hover:text-destructive/80"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <Input
            placeholder="Adicionar palavra..."
            className="mt-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value.trim().toLowerCase();
                if (val && !localConfig.blacklist_keywords.includes(val)) {
                  updateLocal('blacklist_keywords', [...localConfig.blacklist_keywords, val]);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="lg:col-span-2 flex gap-4">
        <Button variant="outline" onClick={applyConservative} className="flex-1">
          <RotateCcw className="h-4 w-4 mr-2" />
          Configuração Conservadora
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges || isUpdatingConfig} className="flex-1">
          {isUpdatingConfig ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
