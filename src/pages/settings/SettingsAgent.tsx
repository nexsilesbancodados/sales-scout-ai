import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useToast } from '@/hooks/use-toast';
import { ServiceIntelligenceManager } from '@/components/settings/ServiceIntelligenceManager';
import { Bot, Zap, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const AGENT_PRESETS = [
  {
    id: 'consultor',
    name: '💡 Consultor',
    description: 'Oferece valor antes de vender, tom profissional',
    settings: { communication_style: 'formal' as const, emoji_usage: 'moderado' as const, response_length: 'medio' as const, agent_type: 'consultivo' as const }
  },
  {
    id: 'amigavel',
    name: '🤝 Amigável',
    description: 'Tom leve e próximo, mais emojis',
    settings: { communication_style: 'casual' as const, emoji_usage: 'frequente' as const, response_length: 'medio' as const, agent_type: 'amigavel' as const }
  },
  {
    id: 'direto',
    name: '🎯 Direto',
    description: 'Objetivo e claro, sem rodeios',
    settings: { communication_style: 'casual' as const, emoji_usage: 'minimo' as const, response_length: 'curto' as const, agent_type: 'agressivo' as const }
  },
  {
    id: 'especialista',
    name: '🧠 Especialista',
    description: 'Técnico e detalhista, foco em expertise',
    settings: { communication_style: 'formal' as const, emoji_usage: 'minimo' as const, response_length: 'longo' as const, agent_type: 'tecnico' as const }
  },
];

export default function SettingsAgent() {
  const { settings, isLoading, updateSettings, isUpdating } = useUserSettings();
  const { toast } = useToast();

  const [agentName, setAgentName] = useState('');
  const [agentPersona, setAgentPersona] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('consultor');

  useEffect(() => {
    if (settings) {
      setAgentName(settings.agent_name || '');
      setAgentPersona(settings.agent_persona || '');
      setKnowledgeBase(settings.knowledge_base || '');
      const currentType = settings.agent_type || 'consultivo';
      const matchingPreset = AGENT_PRESETS.find(p => p.settings.agent_type === currentType);
      setSelectedPreset(matchingPreset?.id || 'consultor');
    }
  }, [settings]);

  const handleSaveAgent = () => {
    const preset = AGENT_PRESETS.find(p => p.id === selectedPreset);
    updateSettings({
      agent_name: agentName,
      agent_persona: agentPersona,
      knowledge_base: knowledgeBase,
      ...(preset?.settings || {}),
    });
    toast({ title: '✓ Agente atualizado', description: 'As configurações foram salvas.' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Agente IA</h1>
        <p className="text-muted-foreground text-sm">Personalidade e comportamento do agente</p>
      </div>

      {/* Auto Reply Toggle */}
      <Card className={cn(!settings?.auto_prospecting_enabled && "ring-2 ring-yellow-500/50")}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Resposta Automática</p>
                <p className="text-sm text-muted-foreground">
                  A IA responde automaticamente às mensagens recebidas
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.auto_prospecting_enabled || false}
              onCheckedChange={(checked) => {
                updateSettings({ auto_prospecting_enabled: checked });
                toast({
                  title: checked ? '✓ IA ativada' : 'IA desativada',
                  description: checked 
                    ? 'A IA agora responderá automaticamente' 
                    : 'Você precisará responder manualmente',
                });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Seu Agente IA
          </CardTitle>
          <CardDescription>
            Configure como a IA se apresenta e o que ela sabe sobre seu negócio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="agentName">Nome do Agente</Label>
              <Input id="agentName" value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Ex: Ana, Carlos..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agentPersona">Cargo/Função</Label>
              <Input id="agentPersona" value={agentPersona} onChange={(e) => setAgentPersona(e.target.value)} placeholder="Ex: Consultora de Marketing" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="knowledgeBase">Sobre seu Negócio</Label>
            <Textarea id="knowledgeBase" value={knowledgeBase} onChange={(e) => setKnowledgeBase(e.target.value)} placeholder="Descreva seus serviços, diferenciais, preços... A IA usará isso para personalizar mensagens." className="min-h-[100px]" />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-semibold">Estilo de Comunicação</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {AGENT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                    selectedPreset === preset.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-2xl">{preset.name.split(' ')[0]}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{preset.name.split(' ').slice(1).join(' ')}</p>
                    <p className="text-xs text-muted-foreground">{preset.description}</p>
                  </div>
                  {selectedPreset === preset.id && (
                    <Check className="h-5 w-5 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSaveAgent} disabled={isUpdating} className="w-full">
            {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
            Salvar Agente
          </Button>
        </CardContent>
      </Card>

      <ServiceIntelligenceManager />
    </div>
  );
}
