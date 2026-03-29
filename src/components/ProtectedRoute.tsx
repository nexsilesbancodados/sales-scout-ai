import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import logoImg from '@/assets/logo.png';
import { SubscriptionGuard } from '@/components/SubscriptionGuard';

interface ProtectedRouteProps {
  children: ReactNode;
}

// Routes that don't require an active subscription
const FREE_ROUTES = ['/billing', '/auth', '/settings'];

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src={logoImg} alt="Logo" className="h-16 w-auto animate-pulse" />
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Allow billing and settings pages without active subscription
  const isFreeRoute = FREE_ROUTES.some(route => location.pathname.startsWith(route));

  if (isFreeRoute) {
    return <>{children}</>;
  }

  return <SubscriptionGuard>{children}</SubscriptionGuard>;
}
