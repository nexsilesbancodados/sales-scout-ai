import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useScheduledProspecting } from '@/hooks/use-scheduled-prospecting';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Play,
  Pause,
  MapPin,
  Building2,
  Target,
  Loader2,
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

const NICHES = [
  'Restaurantes', 'Salões de Beleza', 'Academias', 'Clínicas',
  'Imobiliárias', 'Pet Shops', 'Oficinas', 'Lojas', 'Cafeterias'
];

const LOCATIONS = [
  'São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG',
  'Curitiba, PR', 'Porto Alegre, RS', 'Salvador, BA'
];

export function ScheduledProspectingTab() {
  const { schedules, isLoading, createSchedule, toggleSchedule, deleteSchedule } = useScheduledProspecting();
  const [isCreating, setIsCreating] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    niches: [] as string[],
    locations: [] as string[],
    prospecting_type: 'consultivo',
    schedule_days: [1, 2, 3, 4, 5] as number[],
    schedule_hour: 9,
    max_leads_per_run: 20,
  });

  const handleCreate = async () => {
    if (!newSchedule.name || newSchedule.niches.length === 0 || newSchedule.locations.length === 0) {
      return;
    }

    await createSchedule.mutateAsync(newSchedule);
    setNewSchedule({
      name: '',
      niches: [],
      locations: [],
      prospecting_type: 'consultivo',
      schedule_days: [1, 2, 3, 4, 5],
      schedule_hour: 9,
      max_leads_per_run: 20,
    });
    setIsCreating(false);
  };

  const toggleDay = (day: number) => {
    setNewSchedule(prev => ({
      ...prev,
      schedule_days: prev.schedule_days.includes(day)
        ? prev.schedule_days.filter(d => d !== day)
        : [...prev.schedule_days, day].sort(),
    }));
  };

  const toggleNiche = (niche: string) => {
    setNewSchedule(prev => ({
      ...prev,
      niches: prev.niches.includes(niche)
        ? prev.niches.filter(n => n !== niche)
        : [...prev.niches, niche],
    }));
  };

  const toggleLocation = (location: string) => {
    setNewSchedule(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location],
    }));
  };

  const formatNextRun = (date: string | null) => {
    if (!date) return 'Não agendado';
    return new Date(date).toLocaleString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Prospecção Agendada</h3>
          <p className="text-sm text-muted-foreground">
            Configure capturas automáticas de leads em horários específicos
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Prospecção Agendada</DialogTitle>
              <DialogDescription>
                Configure a captura automática de leads
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Nome do Agendamento</Label>
                <Input
                  placeholder="Ex: Restaurantes SP - Manhã"
                  value={newSchedule.name}
                  onChange={e => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Dias da Semana</Label>
                <div className="flex gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <Button
                      key={day.value}
                      variant={newSchedule.schedule_days.includes(day.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDay(day.value)}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Horário de Execução</Label>
                  <Select
                    value={String(newSchedule.schedule_hour)}
                    onValueChange={v => setNewSchedule(prev => ({ ...prev, schedule_hour: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 7).map(hour => (
                        <SelectItem key={hour} value={String(hour)}>
                          {hour.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Máximo de Leads</Label>
                  <Input
                    type="number"
                    min={5}
                    max={100}
                    value={newSchedule.max_leads_per_run}
                    onChange={e => setNewSchedule(prev => ({ 
                      ...prev, 
                      max_leads_per_run: parseInt(e.target.value) || 20 
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nichos</Label>
                <div className="flex flex-wrap gap-2">
                  {NICHES.map(niche => (
                    <Badge
                      key={niche}
                      variant={newSchedule.niches.includes(niche) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleNiche(niche)}
                    >
                      {niche}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Locais</Label>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS.map(location => (
                    <Badge
                      key={location}
                      variant={newSchedule.locations.includes(location) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleLocation(location)}
                    >
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={!newSchedule.name || newSchedule.niches.length === 0 || newSchedule.locations.length === 0}
              >
                {createSchedule.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Criar Agendamento'
                )}
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
                <p className="text-sm text-muted-foreground">Agendamentos Ativos</p>
                <p className="text-3xl font-bold">
                  {schedules?.filter(s => s.is_active).length || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/20">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leads Capturados</p>
                <p className="text-3xl font-bold">
                  {schedules?.reduce((sum, s) => sum + (s.total_leads_captured || 0), 0) || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/20">
                <Target className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Próxima Execução</p>
                <p className="text-lg font-medium">
                  {formatNextRun(
                    schedules?.filter(s => s.is_active && s.next_run_at)
                      .sort((a, b) => new Date(a.next_run_at!).getTime() - new Date(b.next_run_at!).getTime())[0]?.next_run_at || null
                  )}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules List */}
      {!schedules || schedules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-2">Nenhum agendamento</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie um agendamento para capturar leads automaticamente
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Agendamento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {schedules.map(schedule => (
            <Card key={schedule.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{schedule.name}</h4>
                      <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                        {schedule.is_active ? 'Ativo' : 'Pausado'}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {schedule.schedule_hour}:00
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {schedule.schedule_days.map(d => DAYS_OF_WEEK[d]?.label).join(', ')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {schedule.total_leads_captured} leads capturados
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {schedule.niches.slice(0, 3).map(niche => (
                        <Badge key={niche} variant="outline" className="text-xs">
                          <Building2 className="h-3 w-3 mr-1" />
                          {niche}
                        </Badge>
                      ))}
                      {schedule.niches.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{schedule.niches.length - 3}
                        </Badge>
                      )}
                      {schedule.locations.slice(0, 2).map(location => (
                        <Badge key={location} variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {location}
                        </Badge>
                      ))}
                      {schedule.locations.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{schedule.locations.length - 2}
                        </Badge>
                      )}
                    </div>

                    {schedule.next_run_at && (
                      <p className="text-xs text-muted-foreground">
                        Próxima execução: {formatNextRun(schedule.next_run_at)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={schedule.is_active}
                      onCheckedChange={(checked) => 
                        toggleSchedule.mutate({ id: schedule.id, is_active: checked })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSchedule.mutate(schedule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
