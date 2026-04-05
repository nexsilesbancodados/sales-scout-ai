import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useConversations } from '@/hooks/use-conversations';
import { useActivityLog } from '@/hooks/use-activity-log';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Power,
  MessageSquare,
  Users,
  Calendar,
  Clock,
  Save,
  Loader2,
  Zap,
  ArrowRight,
} from 'lucide-react';

const DIAS_SEMANA = [
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

export function SDRAgentDashboard() {
  const { settings, updateSettings, isUpdating, isLoading } = useUserSettings();
  const { conversations } = useConversations();
  const { activities } = useActivityLog(20);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [agentEnabled, setAgentEnabled] = useState(false);
  const [objective, setObjective] = useState('qualify_meeting');
  const [tone, setTone] = useState('consultivo');
  const [sdrScript, setSdrScript] = useState('');
  const [calendlyLink, setCalendlyLink] = useState('');
  const [transferOnObjection, setTransferOnObjection] = useState(true);
  const [autoSchedule, setAutoSchedule] = useState(false);
  const [workDays, setWorkDays] = useState([1, 2, 3, 4, 5]);
  const [startHour, setStartHour] = useState('09:00');
  const [endHour, setEndHour] = useState('18:00');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      const s = settings as any;
      setAgentEnabled(s.sdr_agent_enabled || false);
      setObjective(s.sdr_objective || 'qualify_meeting');
      setTone(s.communication_style || 'consultivo');
      setSdrScript(s.sdr_script || '');
      setCalendlyLink(s.calendly_link || s.google_meet_link || '');
      setTransferOnObjection(s.sdr_transfer_objection !== false);
      setAutoSchedule(s.sdr_auto_schedule || false);
      setStartHour(String(s.auto_start_hour || 9).padStart(2, '0') + ':00');
      setEndHour(String(s.auto_end_hour || 18).padStart(2, '0') + ':00');
    }
  }, [settings]);

  const handleToggleAgent = (enabled: boolean) => {
    setAgentEnabled(enabled);
    updateSettings({ auto_prospecting_enabled: enabled, sdr_agent_enabled: enabled } as any);
    toast({ title: enabled ? '🟢 Agente SDR ativado' : '⏸️ Agente SDR pausado' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      updateSettings({
        sdr_agent_enabled: agentEnabled,
        communication_style: tone as any,
        google_meet_link: calendlyLink,
        auto_start_hour: parseInt(startHour),
        auto_end_hour: parseInt(endHour),
        work_days_only: !workDays.includes(0) && !workDays.includes(6),
        operate_all_day: startHour === '00:00' && endHour === '23:59',
      } as any);
      toast({ title: '✅ Configurações salvas', description: `Dias: ${workDays.map(d => DIAS_SEMANA.find(ds => ds.value === d)?.label).join(', ')} · ${startHour}–${endHour}` });
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: number) => {
    setWorkDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Stats
  const todayConversations = conversations.filter(c => {
    const lastMsg = c.lastMessage?.sent_at;
    if (!lastMsg) return false;
    const d = new Date(lastMsg);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const qualifiedToday = todayConversations.filter(c =>
    c.lead.stage === 'Qualificado' || c.lead.stage === 'Proposta'
  );

  const recentConversations = conversations.slice(0, 10);
  const sdrActivities = activities.filter(a =>
    a.activity_type?.includes('sdr') || a.activity_type?.includes('ai_reply') || a.activity_type?.includes('message')
  ).slice(0, 15);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Controls */}
      <div className="space-y-6">
        {/* Status Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Status do Agente SDR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-4 w-4 rounded-full ${agentEnabled ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                <span className="font-medium text-lg">
                  {agentEnabled ? 'Agente Ativo' : 'Agente Pausado'}
                </span>
              </div>
              <Switch checked={agentEnabled} onCheckedChange={handleToggleAgent} />
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{todayConversations.length}</p>
                <p className="text-xs text-muted-foreground">Conversas hoje</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{qualifiedToday.length}</p>
                <p className="text-xs text-muted-foreground">Qualificados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">0</p>
                <p className="text-xs text-muted-foreground">Reuniões</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Behavior Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Comportamento do Agente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Objetivo principal</Label>
              <Select value={objective} onValueChange={setObjective}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="qualify_meeting">Qualificar e agendar reunião</SelectItem>
                  <SelectItem value="present_service">Apresentar serviço e coletar interesse</SelectItem>
                  <SelectItem value="answer_convert">Responder dúvidas e converter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tom de voz</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultivo">Consultivo</SelectItem>
                  <SelectItem value="direto">Direto</SelectItem>
                  <SelectItem value="amigavel">Amigável</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Script base do SDR</Label>
              <Textarea
                placeholder="Descreva o contexto e instruções para o agente SDR..."
                value={sdrScript}
                onChange={e => setSdrScript(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Link de agendamento (Calendly, Google Meet)</Label>
              <Input
                placeholder="https://calendly.com/seu-link"
                value={calendlyLink}
                onChange={e => setCalendlyLink(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Transferir para humano em objeção forte</Label>
                <Switch checked={transferOnObjection} onCheckedChange={setTransferOnObjection} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Agendar reunião automaticamente</Label>
                <Switch checked={autoSchedule} onCheckedChange={setAutoSchedule} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Horário de Funcionamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {DIAS_SEMANA.map(dia => (
                <div key={dia.value} className="flex items-center gap-1.5">
                  <Checkbox
                    checked={workDays.includes(dia.value)}
                    onCheckedChange={() => toggleDay(dia.value)}
                  />
                  <Label className="text-sm cursor-pointer">{dia.label}</Label>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Início</Label>
                <Input type="time" value={startHour} onChange={e => setStartHour(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Fim</Label>
                <Input type="time" value={endHour} onChange={e => setEndHour(e.target.value)} />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full" disabled={isUpdating || saving}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Live Feed */}
      <div className="space-y-6">
        {/* Active Conversations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Conversas em Andamento
            </CardTitle>
            <CardDescription>Últimas conversas com atividade recente</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {recentConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Nenhuma conversa ativa</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentConversations.map(conv => (
                    <div
                      key={conv.lead.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate('/conversations')}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {conv.lead.business_name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{conv.lead.business_name}</p>
                          {conv.lead.stage === 'Qualificado' && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0">Qualificado</Badge>
                          )}
                          {agentEnabled && conv.hasMessages && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">SDR ativo</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.lastMessage?.content || 'Sem mensagens'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-muted-foreground">
                          {conv.lastMessage?.sent_at
                            ? formatDistanceToNow(new Date(conv.lastMessage.sent_at), { addSuffix: true, locale: ptBR })
                            : '—'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge className="mt-1 text-[10px] px-1.5">{conv.unreadCount}</Badge>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Log de Ações do SDR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {sdrActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Nenhuma ação registrada ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sdrActivities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}