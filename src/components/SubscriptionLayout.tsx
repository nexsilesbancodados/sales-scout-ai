import { ReactNode } from 'react';

interface SubscriptionLayoutProps {
  children: ReactNode;
}

export function SubscriptionLayout({ children }: SubscriptionLayoutProps) {
  // Guard desativado temporariamente - Cakto products unavailable
  return <>{children}</>;
}