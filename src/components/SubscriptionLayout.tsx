import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { SubscriptionGuard } from '@/components/SubscriptionGuard';

const FREE_ROUTES = ['/billing', '/settings', '/auth', '/tutorial'];

interface SubscriptionLayoutProps {
  children: ReactNode;
}

export function SubscriptionLayout({ children }: SubscriptionLayoutProps) {
  const location = useLocation();
  const isFreeRoute = FREE_ROUTES.some(route => location.pathname.startsWith(route));

  if (isFreeRoute) {
    return <>{children}</>;
  }

  return <SubscriptionGuard>{children}</SubscriptionGuard>;
}