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
import { Bot, Zap, Loader2, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const AGENT_PRESETS = [
  {
    id: 'consultor',
    emoji: '💡',
    name: 'Consultor',
    description: 'Oferece valor antes de vender, tom profissional',
    settings: { communication_style: 'formal' as const, emoji_usage: 'moderado' as const, response_length: 'medio' as const, agent_type: 'consultivo' as const }
  },
  {
    id: 'amigavel',
    emoji: '🤝',
    name: 'Amigável',
    description: 'Tom leve e próximo, mais emojis',
    settings: { communication_style: 'casual' as const, emoji_usage: 'frequente' as const, response_length: 'medio' as const, agent_type: 'amigavel' as const }
  },
  {
    id: 'direto',
    emoji: '🎯',
    name: 'Direto',
    description: 'Objetivo e claro, sem rodeios',
    settings: { communication_style: 'casual' as const, emoji_usage: 'minimo' as const, response_length: 'curto' as const, agent_type: 'agressivo' as const }
  },
  {
    id: 'especialista',
    emoji: '🧠',
    name: 'Especialista',
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
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agente IA</h1>
            <p className="text-sm text-muted-foreground">Personalidade, comportamento e base de conhecimento</p>
          </div>
        </div>
      </div>

      {/* Auto Reply Toggle */}
      <div className={cn(
        "flex items-center gap-4 p-5 rounded-xl border transition-all",
        settings?.auto_prospecting_enabled 
          ? "bg-emerald-500/5 border-emerald-500/20" 
          : "bg-muted/30 border-border"
      )}>
        <div className={cn(
          "h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
          settings?.auto_prospecting_enabled ? "bg-emerald-500/10" : "bg-muted"
        )}>
          <Zap className={cn(
            "h-5 w-5",
            settings?.auto_prospecting_enabled ? "text-emerald-500" : "text-muted-foreground"
          )} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Resposta Automática</p>
          <p className="text-xs text-muted-foreground">
            {settings?.auto_prospecting_enabled 
              ? 'A IA está respondendo automaticamente às mensagens' 
              : 'Ative para a IA responder automaticamente'}
          </p>
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

      {/* Identity & Knowledge */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Identidade do Agente
          </CardTitle>
          <CardDescription>
            Configure como a IA se apresenta e o que ela sabe sobre seu negócio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="agentName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome do Agente</Label>
              <Input id="agentName" value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Ex: Ana, Carlos..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agentPersona" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cargo / Função</Label>
              <Input id="agentPersona" value={agentPersona} onChange={(e) => setAgentPersona(e.target.value)} placeholder="Ex: Consultora de Marketing" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="knowledgeBase" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Base de Conhecimento</Label>
            <Textarea 
              id="knowledgeBase" 
              value={knowledgeBase} 
              onChange={(e) => setKnowledgeBase(e.target.value)} 
              placeholder="Descreva seus serviços, diferenciais, preços, condições de pagamento... A IA usará isso para personalizar cada mensagem." 
              className="min-h-[120px] resize-y" 
            />
            <p className="text-[11px] text-muted-foreground">Quanto mais detalhado, melhor a IA conversa com seus leads.</p>
          </div>

          <Separator />

          {/* Presets */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estilo de Comunicação</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {AGENT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200",
                    selectedPreset === preset.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                      : "border-border hover:border-primary/40 hover:bg-accent/30"
                  )}
                >
                  <span className="text-2xl shrink-0">{preset.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{preset.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{preset.description}</p>
                  </div>
                  {selectedPreset === preset.id && (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSaveAgent} disabled={isUpdating} className="w-full h-11 text-sm font-semibold">
            {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
            Salvar Configurações do Agente
          </Button>
        </CardContent>
      </Card>

      {/* Service Intelligence */}
      <ServiceIntelligenceManager />
    </div>
  );
}
