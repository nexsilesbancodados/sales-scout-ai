import { ReactNode } from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, AlertTriangle, CreditCard, ExternalLink, Rocket, Building2, Star, Check, Shield } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import logoImg from '@/assets/logo.png';

const CAKTO_CHECKOUT_URLS: Record<string, string> = {
  starter: 'https://pay.cakto.com.br/STARTER_MENSAL',
  pro: 'https://pay.cakto.com.br/PRO_MENSAL',
  enterprise: 'https://pay.cakto.com.br/ENTERPRISE_MENSAL',
};

const plans = [
  { id: 'starter', name: 'Starter', icon: Rocket, price: 97, features: ['1 chip WhatsApp', 'Google Maps + Radar CNPJ', 'Funil de vendas'] },
  { id: 'pro', name: 'Pro', icon: Crown, price: 149, features: ['3 chips WhatsApp', 'Agente SDR ativo', 'Relatórios avançados'], highlight: true },
  { id: 'enterprise', name: 'Enterprise', icon: Building2, price: 199, features: ['10 chips WhatsApp', 'API pública', 'Gerente dedicado'] },
];

interface SubscriptionGuardProps {
  children: ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { subscription, isLoading } = useSubscription();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src={logoImg} alt="Logo" className="h-16 w-auto animate-pulse" />
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando assinatura...</p>
        </div>
      </div>
    );
  }

  const isActive = subscription?.status === 'active';

  if (isActive) {
    return <>{children}</>;
  }

  const getCheckoutUrl = (planId: string) => {
    const baseUrl = CAKTO_CHECKOUT_URLS[planId] || '#';
    const email = user?.email;
    if (email) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}email=${encodeURIComponent(email)}`;
    }
    return baseUrl;
  };

  const isExpired = subscription?.status === 'canceled' || subscription?.status === 'past_due' || subscription?.status === 'refunded' || subscription?.status === 'chargeback';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <img src={logoImg} alt="Logo" className="h-14 w-auto mx-auto" />
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <h1 className="text-2xl font-bold tracking-tight">
              {isExpired ? 'Seu plano expirou' : 'Assine para acessar'}
            </h1>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isExpired
              ? 'Sua assinatura não está mais ativa. Renove agora para recuperar o acesso completo a todas as funcionalidades.'
              : 'Para utilizar a plataforma, escolha um dos planos abaixo e comece a prospectar agora mesmo.'
            }
          </p>
          {subscription?.status && (
            <Badge variant="destructive" className="text-xs">
              Status: {subscription.status === 'canceled' ? 'Cancelado' : subscription.status === 'past_due' ? 'Pagamento pendente' : subscription.status === 'refunded' ? 'Reembolsado' : subscription.status}
            </Badge>
          )}
        </div>

        {/* Plans */}
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative transition-all hover:shadow-lg ${
                  plan.highlight ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' : 'hover:border-primary/50'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-md">
                      <Star className="h-3 w-3 mr-1" />
                      Mais popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-6 pb-2">
                  <div className="mx-auto p-2.5 rounded-xl bg-primary/10 w-fit mb-2">
                    <PlanIcon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <span className="text-2xl font-bold">R$ {plan.price}</span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.highlight ? 'default' : 'outline'}
                    asChild
                  >
                    <a href={getCheckoutUrl(plan.id)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Assinar
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    Pagamento seguro via Cakto
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Após o pagamento, seu acesso será liberado automaticamente em segundos.
        </p>
      </div>
    </div>
  );
}