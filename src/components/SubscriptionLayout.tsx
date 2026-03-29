import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useSubscription } from '@/hooks/use-subscription';
import { SubscriptionGuard } from '@/components/SubscriptionGuard';

const FREE_ROUTES = ['/billing', '/settings', '/auth', '/tutorial'];

interface SubscriptionLayoutProps {
  children: ReactNode;
}

export function SubscriptionLayout({ children }: SubscriptionLayoutProps) {
  const location = useLocation();
  const { user } = useAuth();

  // No user or free route = skip guard
  if (!user) return <>{children}</>;

  const isFreeRoute = FREE_ROUTES.some(route => location.pathname.startsWith(route));
  if (isFreeRoute) return <>{children}</>;

  return <SubscriptionGuard>{children}</SubscriptionGuard>;
}