import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusIcons = {
  scheduled: <Clock className="h-4 w-4 text-info" />,
  completed: <CheckCircle2 className="h-4 w-4 text-success" />,
  cancelled: <XCircle className="h-4 w-4 text-destructive" />,
  no_show: <AlertCircle className="h-4 w-4 text-warning" />,
};

const statusLabels = {
  scheduled: 'Agendada',
  completed: 'Realizada',
  cancelled: 'Cancelada',
  no_show: 'Não Compareceu',
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

  const renderMeetingCard = (meeting: typeof meetings[0]) => (
    <Card key={meeting.id} className="animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {statusIcons[meeting.status]}
              <h3 className="font-semibold">{meeting.title}</h3>
              <Badge variant="secondary">{statusLabels[meeting.status]}</Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(meeting.scheduled_at), "EEEE, d 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(meeting.scheduled_at), 'HH:mm')} -{' '}
                  {meeting.duration_minutes} minutos
                </span>
              </div>
              {meeting.lead && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{meeting.lead.business_name}</span>
                </div>
              )}
              {meeting.meeting_link && (
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <a
                    href={meeting.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Link da reunião
                  </a>
                </div>
              )}
            </div>
          </div>
          {meeting.status === 'scheduled' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateMeeting({ id: meeting.id, status: 'completed' })}
              >
                Concluir
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updateMeeting({ id: meeting.id, status: 'cancelled' })}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
        {meeting.description && (
          <p className="mt-3 text-sm text-muted-foreground border-t pt-3">
            {meeting.description}
          </p>
        )}
      </CardContent>
    </Card>
  );

  const renderSection = (title: string, items: typeof meetings) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="space-y-4">{items.map(renderMeetingCard)}</div>
      </div>
    );
  };

  return (
    <DashboardLayout
      title="Agendamentos"
      description="Gerencie suas reuniões com leads"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : meetings.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhuma reunião agendada</p>
              <p className="text-sm">
                Quando o agente agendar reuniões com leads, elas aparecerão aqui
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {renderSection('Hoje', groupedMeetings.today)}
          {renderSection('Amanhã', groupedMeetings.tomorrow)}
          {renderSection('Esta Semana', groupedMeetings.thisWeek)}
          {renderSection('Próximas', groupedMeetings.later)}
          {groupedMeetings.past.length > 0 && (
            <div className="opacity-60">
              {renderSection('Pendentes (Passadas)', groupedMeetings.past)}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
