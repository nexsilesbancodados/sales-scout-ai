import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMeetings } from '@/hooks/use-meetings';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarPlus,
  History,
  CalendarDays,
  Trash2,
} from 'lucide-react';
import { format, isToday, isTomorrow, isThisWeek, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig = {
  scheduled: { 
    icon: Clock, 
    color: 'text-info', 
    bg: 'bg-info/10',
    label: 'Agendada' 
  },
  completed: { 
    icon: CheckCircle2, 
    color: 'text-success', 
    bg: 'bg-success/10',
    label: 'Realizada' 
  },
  cancelled: { 
    icon: XCircle, 
    color: 'text-destructive', 
    bg: 'bg-destructive/10',
    label: 'Cancelada' 
  },
  no_show: { 
    icon: AlertCircle, 
    color: 'text-warning', 
    bg: 'bg-warning/10',
    label: 'Não Compareceu' 
  },
};

export default function MeetingsPage() {
  const { meetings, isLoading, updateMeeting, deleteMeeting } = useMeetings();
  const [activeTab, setActiveTab] = useState('upcoming');

  // Separate upcoming and past/historical meetings
  const upcomingMeetings = meetings.filter(m => {
    const date = new Date(m.scheduled_at);
    return !isPast(date) || (m.status === 'scheduled' && isPast(date));
  });

  const historyMeetings = meetings.filter(m => {
    const date = new Date(m.scheduled_at);
    return isPast(date) && m.status !== 'scheduled';
  });

  // Further categorize history
  const completedMeetings = historyMeetings.filter(m => m.status === 'completed');
  const missedMeetings = historyMeetings.filter(m => m.status === 'no_show' || m.status === 'cancelled');

  const groupUpcomingMeetings = () => {
    const groups: { [key: string]: typeof meetings } = {
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: [],
      overdue: [],
    };

    upcomingMeetings.forEach((meeting) => {
      const date = new Date(meeting.scheduled_at);
      const now = new Date();

      if (date < now && meeting.status === 'scheduled') {
        groups.overdue.push(meeting);
      } else if (isToday(date)) {
        groups.today.push(meeting);
      } else if (isTomorrow(date)) {
        groups.tomorrow.push(meeting);
      } else if (isThisWeek(date)) {
        groups.thisWeek.push(meeting);
      } else {
        groups.later.push(meeting);
      }
    });

    return groups;
  };

  const groupedMeetings = groupUpcomingMeetings();

  const renderMeetingCard = (meeting: typeof meetings[0], index: number, showActions = true) => {
    const status = statusConfig[meeting.status as keyof typeof statusConfig] || statusConfig.scheduled;
    const StatusIcon = status.icon;
    const isOverdue = isPast(new Date(meeting.scheduled_at)) && meeting.status === 'scheduled';
    
    return (
      <Card 
        key={meeting.id} 
        className={`card-hover animate-fade-in overflow-hidden ${isOverdue ? 'border-warning/50' : ''}`}
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${status.bg}`}>
                  <StatusIcon className={`h-4 w-4 ${status.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{meeting.title}</h3>
                  {meeting.lead && (
                    <p className="text-sm text-muted-foreground truncate">
                      {meeting.lead.business_name}
                    </p>
                  )}
                </div>
                <Badge 
                  variant="secondary" 
                  className={`shrink-0 ${status.bg} ${status.color} border-0`}
                >
                  {isOverdue ? 'Pendente' : status.label}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {format(new Date(meeting.scheduled_at), "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>
                    {format(new Date(meeting.scheduled_at), 'HH:mm')} • {meeting.duration_minutes} min
                  </span>
                </div>
                {meeting.meeting_link && (
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <Video className="h-4 w-4 shrink-0" />
                    <a
                      href={meeting.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      Entrar na reunião
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            {showActions && (
              <div className="flex flex-col gap-2 shrink-0">
                {meeting.status === 'scheduled' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMeeting({ id: meeting.id, status: 'completed' })}
                      className="text-success hover:text-success hover:bg-success/10"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Concluir
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateMeeting({ id: meeting.id, status: 'no_show' })}
                      className="text-warning hover:text-warning hover:bg-warning/10"
                    >
                      <AlertCircle className="h-4 w-4 mr-1.5" />
                      Não Veio
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateMeeting({ id: meeting.id, status: 'cancelled' })}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Cancelar
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir esta reunião?')) {
                      deleteMeeting(meeting.id);
                    }
                  }}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Excluir
                </Button>
              </div>
            )}
          </div>
          
          {meeting.description && (
            <p className="mt-4 text-sm text-muted-foreground border-t pt-4">
              {meeting.description}
            </p>
          )}
          
          {meeting.notes && (
            <p className="mt-2 text-sm text-muted-foreground italic">
              Notas: {meeting.notes}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSection = (title: string, items: typeof meetings, showActions = true) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-4">{items.map((m, i) => renderMeetingCard(m, i, showActions))}</div>
      </div>
    );
  };

  // Stats for history
  const completedCount = completedMeetings.length;
  const missedCount = missedMeetings.length;
  const totalHistory = historyMeetings.length;
  const successRate = totalHistory > 0 ? Math.round((completedCount / totalHistory) * 100) : 0;

  return (
    <DashboardLayout
      title="Agendamentos"
      description="Gerencie suas reuniões com leads"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando reuniões...</p>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Próximas
              {upcomingMeetings.length > 0 && (
                <Badge variant="secondary" className="ml-1">{upcomingMeetings.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Histórico
              {historyMeetings.length > 0 && (
                <Badge variant="secondary" className="ml-1">{historyMeetings.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingMeetings.length === 0 ? (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <EmptyState
                    icon={Calendar}
                    title="Nenhuma reunião agendada"
                    description="Quando o agente agendar reuniões com leads, elas aparecerão aqui"
                    action={{
                      label: "Capturar Leads",
                      onClick: () => window.location.href = '/prospecting?tab=capture',
                      icon: CalendarPlus,
                    }}
                    className="py-16"
                  />
                </CardContent>
              </Card>
            ) : (
              <>
                {groupedMeetings.overdue.length > 0 && (
                  <div className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-lg">
                    <div className="flex items-center gap-2 text-warning mb-2">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-semibold">
                        {groupedMeetings.overdue.length} reunião(ões) pendente(s)
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Estas reuniões já passaram. Marque como concluída, não compareceu ou cancelada.
                    </p>
                  </div>
                )}
                {renderSection('Pendentes', groupedMeetings.overdue)}
                {renderSection('Hoje', groupedMeetings.today)}
                {renderSection('Amanhã', groupedMeetings.tomorrow)}
                {renderSection('Esta Semana', groupedMeetings.thisWeek)}
                {renderSection('Próximas', groupedMeetings.later)}
              </>
            )}
          </TabsContent>

          <TabsContent value="history">
            {historyMeetings.length === 0 ? (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <EmptyState
                    icon={History}
                    title="Nenhum histórico ainda"
                    description="Quando você concluir ou cancelar reuniões, elas aparecerão aqui"
                    className="py-16"
                  />
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">{totalHistory}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-success">{completedCount}</div>
                      <div className="text-sm text-muted-foreground">Realizadas</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-warning">{missedCount}</div>
                      <div className="text-sm text-muted-foreground">Não Realizadas</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{successRate}%</div>
                      <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Completed meetings */}
                {completedMeetings.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <h3 className="text-lg font-semibold">Reuniões Realizadas ({completedCount})</h3>
                    </div>
                    <div className="space-y-4">
                      {completedMeetings
                        .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
                        .map((m, i) => renderMeetingCard(m, i, false))}
                    </div>
                  </div>
                )}

                {/* Missed/Cancelled meetings */}
                {missedMeetings.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <XCircle className="h-5 w-5 text-warning" />
                      <h3 className="text-lg font-semibold">Não Realizadas ({missedCount})</h3>
                    </div>
                    <div className="space-y-4 opacity-70">
                      {missedMeetings
                        .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
                        .map((m, i) => renderMeetingCard(m, i, false))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
}
