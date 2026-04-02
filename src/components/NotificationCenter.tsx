import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useActivityLog } from '@/hooks/use-activity-log';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function NotificationCenter() {
  const { activities, isLoading } = useActivityLog(20);
  const [seen, setSeen] = useState(0);

  const unread = Math.max(0, (activities?.length || 0) - seen);

  const handleOpen = (open: boolean) => {
    if (open) {
      setSeen(activities?.length || 0);
    }
  };

  const getIcon = (type: string) => {
    const map: Record<string, string> = {
      lead_created: '🆕',
      message_sent: '📤',
      lead_updated: '✏️',
      meeting_scheduled: '📅',
      lead_contacted: '📱',
      lead_won: '🏆',
      lead_lost: '❌',
      prospecting_completed: '🎯',
    };
    return map[type] || '📌';
  };

  return (
    <Popover onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[9px] font-bold rounded-full bg-destructive text-destructive-foreground border-2 border-background">
              {unread > 9 ? '9+' : unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 rounded-xl">
        <div className="px-4 py-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Notificações</h3>
            {unread > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5">
                {unread} nova{unread > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
        <ScrollArea className="h-[320px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : !activities?.length ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {activities.map((activity, i) => (
                <div
                  key={activity.id}
                  className={cn(
                    "px-4 py-3 hover:bg-accent/50 transition-colors cursor-default",
                    i < (activities.length - seen) && "bg-primary/5"
                  )}
                >
                  <div className="flex gap-3">
                    <span className="text-base shrink-0 mt-0.5">{getIcon(activity.activity_type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground line-clamp-2">{activity.description}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
