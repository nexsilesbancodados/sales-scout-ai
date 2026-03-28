import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Clock, Users, MessageSquare, Calendar, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ActivityLog } from '@/types/database';

const activityIcons: Record<string, React.ReactNode> = {
  lead_created: <Users className="h-3.5 w-3.5" />,
  message_sent: <MessageSquare className="h-3.5 w-3.5" />,
  meeting_scheduled: <Calendar className="h-3.5 w-3.5" />,
  lead_qualified: <Target className="h-3.5 w-3.5" />,
};

const activityColors: Record<string, string> = {
  lead_created: 'bg-info/10 text-info',
  message_sent: 'bg-primary/10 text-primary',
  meeting_scheduled: 'bg-success/10 text-success',
  lead_qualified: 'bg-warning/10 text-warning',
};

interface RecentActivityProps {
  activities: ActivityLog[];
  isLoading: boolean;
}

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">Atividades Recentes</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-3.5 w-3/4 mb-1.5" />
                  <Skeleton className="h-2.5 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-xs font-medium">Sem atividades</p>
            <p className="text-[11px] mt-0.5 text-muted-foreground/60">Comece a prospectar</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.slice(0, 8).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className={cn(
                  "p-1.5 rounded-lg shrink-0 mt-0.5",
                  activityColors[activity.activity_type] || "bg-muted text-muted-foreground"
                )}>
                  {activityIcons[activity.activity_type] || <Clock className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-snug truncate">{activity.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
