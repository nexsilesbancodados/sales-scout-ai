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
  lead_created: 'text-info',
  message_sent: 'text-primary',
  meeting_scheduled: 'text-success',
  lead_qualified: 'text-warning',
};

interface RecentActivityProps {
  activities: ActivityLog[];
  isLoading: boolean;
}

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  return (
    <Card className="border-border/40">
      <CardHeader className="pb-1">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Atividades Recentes</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-3.5 w-3/4 mb-1.5" />
                  <Skeleton className="h-2.5 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-3 opacity-20" />
            <p className="text-xs font-medium">Sem atividades ainda</p>
            <p className="text-[10px] mt-1 text-muted-foreground/50">Comece a prospectar para ver atividades</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {activities.slice(0, 8).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 py-2.5 first:pt-0">
                <div className={cn(
                  "shrink-0",
                  activityColors[activity.activity_type] || "text-muted-foreground"
                )}>
                  {activityIcons[activity.activity_type] || <Clock className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate">{activity.description}</p>
                </div>
                <p className="text-[10px] text-muted-foreground/50 shrink-0">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
