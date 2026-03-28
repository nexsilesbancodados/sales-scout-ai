import { useState, useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useMeetings } from '@/hooks/use-meetings';
import { useLeads } from '@/hooks/use-leads';
import { format, isSameDay, isToday, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar as CalendarIcon, Video, CheckCircle, XCircle, Clock,
  MessageCircle, ExternalLink, Loader2,
} from 'lucide-react';

export default function CRMActivitiesPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { meetings, isLoading: meetingsLoading, updateMeeting } = useMeetings();
  const { leads } = useLeads();

  const meetingDates = useMemo(() => {
    const dates = new Set<string>();
    meetings.forEach(m => dates.add(format(new Date(m.scheduled_at), 'yyyy-MM-dd')));
    return dates;
  }, [meetings]);

  const dayMeetings = useMemo(() =>
    meetings.filter(m => isSameDay(new Date(m.scheduled_at), selectedDate))
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()),
    [meetings, selectedDate]
  );

  const pendingFollowUps = useMemo(() =>
    leads.filter(l => l.next_follow_up_at && isBefore(new Date(l.next_follow_up_at), new Date()) && l.stage !== 'Perdido'),
    [leads]
  );

  const todayMeetingsCount = useMemo(() => meetings.filter(m => isToday(new Date(m.scheduled_at))).length, [meetings]);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { scheduled: 'bg-blue-500/10 text-blue-600', completed: 'bg-green-500/10 text-green-600', cancelled: 'bg-red-500/10 text-red-600', no_show: 'bg-amber-500/10 text-amber-600' };
    return <Badge variant="outline" className={`text-xs ${map[status] || ''}`}>{status}</Badge>;
  };

  return (
    <div className="p-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{todayMeetingsCount}</p><p className="text-xs text-muted-foreground">Reuniões hoje</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{pendingFollowUps.length}</p><p className="text-xs text-muted-foreground">Follow-ups pendentes</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{dayMeetings.length}</p><p className="text-xs text-muted-foreground">Atividades em {format(selectedDate, 'dd/MM')}</p></CardContent></Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className="shrink-0">
          <Card>
            <CardContent className="pt-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={d => d && setSelectedDate(d)}
                locale={ptBR}
                modifiers={{ hasMeeting: (date) => meetingDates.has(format(date, 'yyyy-MM-dd')) }}
                modifiersStyles={{ hasMeeting: { fontWeight: 'bold', textDecoration: 'underline', color: 'hsl(var(--primary))' } }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Day details */}
        <div className="flex-1 space-y-4">
          <h3 className="font-semibold text-lg">{format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}</h3>

          {/* Meetings */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CalendarIcon className="h-4 w-4" />Reuniões</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {meetingsLoading && <Loader2 className="h-5 w-5 animate-spin" />}
              {dayMeetings.length === 0 && !meetingsLoading && <p className="text-sm text-muted-foreground">Nenhuma reunião neste dia</p>}
              {dayMeetings.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="text-center shrink-0">
                    <p className="text-sm font-bold">{format(new Date(m.scheduled_at), 'HH:mm')}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{(m as any).lead?.business_name || 'Lead'}</p>
                  </div>
                  {statusBadge(m.status)}
                  <div className="flex items-center gap-1">
                    {m.meeting_link && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild><a href={m.meeting_link} target="_blank"><Video className="h-3.5 w-3.5" /></a></Button>
                    )}
                    {m.status === 'scheduled' && (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateMeeting({ id: m.id, status: 'completed' })}><CheckCircle className="h-3.5 w-3.5 text-green-500" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateMeeting({ id: m.id, status: 'no_show' })}><XCircle className="h-3.5 w-3.5 text-red-500" /></Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Follow-ups */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" />Follow-ups Pendentes</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {pendingFollowUps.length === 0 && <p className="text-sm text-muted-foreground">Nenhum follow-up pendente</p>}
              {pendingFollowUps.slice(0, 10).map(lead => (
                <div key={lead.id} className="flex items-center gap-3 p-2 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{lead.business_name}</p>
                    <p className="text-xs text-muted-foreground">{lead.next_follow_up_at && format(new Date(lead.next_follow_up_at), 'dd/MM HH:mm')}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank"><MessageCircle className="h-3.5 w-3.5 mr-1" />WA</a>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
