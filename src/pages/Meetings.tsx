import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
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
} from 'lucide-react';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
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
  const { meetings, isLoading, updateMeeting } = useMeetings();

  const groupMeetings = () => {
    const groups: { [key: string]: typeof meetings } = {
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: [],
      past: [],
    };

    meetings.forEach((meeting) => {
      const date = new Date(meeting.scheduled_at);
      const now = new Date();

      if (date < now && meeting.status === 'scheduled') {
        groups.past.push(meeting);
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

  const groupedMeetings = groupMeetings();

  const renderMeetingCard = (meeting: typeof meetings[0], index: number) => {
    const status = statusConfig[meeting.status];
    const StatusIcon = status.icon;
    
    return (
      <Card 
        key={meeting.id} 
        className="card-hover animate-fade-in overflow-hidden"
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
                  {status.label}
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
            
            {meeting.status === 'scheduled' && (
              <div className="flex flex-col gap-2 shrink-0">
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
                  onClick={() => updateMeeting({ id: meeting.id, status: 'cancelled' })}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Cancelar
                </Button>
              </div>
            )}
          </div>
          
          {meeting.description && (
            <p className="mt-4 text-sm text-muted-foreground border-t pt-4">
              {meeting.description}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSection = (title: string, items: typeof meetings) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-4">{items.map((m, i) => renderMeetingCard(m, i))}</div>
      </div>
    );
  };

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
      ) : meetings.length === 0 ? (
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
          {renderSection('Hoje', groupedMeetings.today)}
          {renderSection('Amanhã', groupedMeetings.tomorrow)}
          {renderSection('Esta Semana', groupedMeetings.thisWeek)}
          {renderSection('Próximas', groupedMeetings.later)}
          {groupedMeetings.past.length > 0 && (
            <div className="opacity-70">
              {renderSection('Pendentes (Passadas)', groupedMeetings.past)}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
