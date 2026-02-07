import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';

export function RealtimeNotificationsProvider({ children }: { children: React.ReactNode }) {
  // Initialize realtime notifications
  useRealtimeNotifications();
  
  return <>{children}</>;
}
