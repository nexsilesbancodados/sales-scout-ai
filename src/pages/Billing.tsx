import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useLeads } from '@/hooks/use-leads';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useSubscription } from '@/hooks/use-subscription';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Check,
  Crown,
  Rocket,
  Building2,
  MessageSquare,
  Smartphone,
  Zap,
  Star,
  ExternalLink,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Receipt,
  Copy,
  Shield,
} from 'lucide-react';

// ============================================================
// CONFIGURE SEUS LINKS DE CHECKOUT DA CAKTO AQUI
// Substitua pelos links reais dos seus produtos na Cakto
// ============================================================
const CAKTO_CHECKOUT_URLS: Record<string, { monthly: string; annual: string }> = {
  starter: {
    monthly: 'https://pay.cakto.com.br/STARTER_MENSAL',
    annual: 'https://pay.cakto.com.br/STARTER_ANUAL',
  },
  pro: {
    monthly: 'https://pay.cakto.com.br/PRO_MENSAL',
    annual: 'https://pay.cakto.com.br/PRO_ANUAL',
  },
  enterprise: {
    monthly: 'https://pay.cakto.com.br/ENTERPRISE_MENSAL',
    annual: 'https://pay.cakto.com.br/ENTERPRISE_ANUAL',
  },
};

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Rocket,
    monthlyPrice: 97,
    features: [
      'Disparos ilimitados',
      '1 chip WhatsApp',
      'Google Maps + Radar CNPJ',
      'Funil de vendas',
      'Leads ilimitados',
      'Suporte por email',
    ],
    chips: 1,
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Crown,
    monthlyPrice: 149,
    features: [
      'Disparos ilimitados',
      '3 chips WhatsApp',
      'Todos os extratores',
      'Agente SDR ativo',
      'Leads ilimitados',
      'Relatórios avançados',
      'Suporte prioritário',
    ],
    chips: 3,
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building2,
    monthlyPrice: 199,
    features: [
      'Disparos ilimitados',
      '10 chips WhatsApp',
      'API pública',
      'Leads ilimitados',
      'Múltiplos funis',
      'Gerente dedicado',
      'SLA garantido',
    ],
    chips: 10,
    highlight: false,
  },
];

const EVENT_LABELS: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  purchase_approved: { label: 'Pagamento aprovado', color: 'text-green-600', icon: CheckCircle2 },
  subscription_created: { label: 'Assinatura criada', color: 'text-green-600', icon: CheckCircle2 },
  subscription_renewed: { label: 'Assinatura renovada', color: 'text-green-600', icon: CheckCircle2 },
  subscription_canceled: { label: 'Assinatura cancelada', color: 'text-destructive', icon: XCircle },
  subscription_renewal_refused: { label: 'Renovação recusada', color: 'text-orange-500', icon: AlertTriangle },
  refund: { label: 'Reembolso', color: 'text-orange-500', icon: AlertTriangle },
  chargeback: { label: 'Chargeback', color: 'text-destructive', icon: XCircle },
  purchase_refused: { label: 'Pagamento recusado', color: 'text-destructive', icon: XCircle },
};

const STATUS_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Ativo', variant: 'default' },
  canceled: { label: 'Cancelado', variant: 'destructive' },
  past_due: { label: 'Pagamento pendente', variant: 'secondary' },
  refunded: { label: 'Reembolsado', variant: 'destructive' },
  chargeback: { label: 'Chargeback', variant: 'destructive' },
  free: { label: 'Gratuito', variant: 'outline' },
};

export default function BillingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { leads } = useLeads();
  const { settings } = useUserSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscription, paymentHistory, currentPlan, isActive, isPastDue, isLoading } = useSubscription();

  const chipsConnected = settings?.whatsapp_connected ? 1 : 0;
  const leadsCount = leads?.length || 0;
  const currentPlanData = plans.find(p => p.id === currentPlan) || plans[0];

  const webhookUrl = `https://oeztpxyprifabkvysroh.supabase.co/functions/v1/cakto-webhook`;

  const getPrice = (monthly: number) => {
    if (isAnnual) return Math.round(monthly * 0.8);
    return monthly;
  };

  const getCheckoutUrl = (planId: string) => {
    const urls = CAKTO_CHECKOUT_URLS[planId];
    if (!urls) return '#';
    const baseUrl = isAnnual ? urls.annual : urls.monthly;
    // Append email as query param for auto-identification
    const email = user?.email;
    if (email) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}email=${encodeURIComponent(email)}`;
    }
    return baseUrl;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: '✓ Copiado!' });
  };

  const statusBadge = STATUS_BADGES[subscription?.status || 'free'] || STATUS_BADGES.free;

  return (
    <DashboardLayout
      title="Planos e Faturamento"
      description="Gerencie seu plano e acompanhe pagamentos — integrado com Cakto"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Current Subscription Status */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>Sua Assinatura</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusBadge.variant}>
                  {statusBadge.label}
                </Badge>
                <Badge className="bg-primary text-primary-foreground">
                  Plano {currentPlanData.name}
                </Badge>
              </div>
            </div>
            {isPastDue && (
              <div className="flex items-center gap-2 p-3 mt-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                <p className="text-sm text-orange-600">
                  Seu pagamento está pendente. Regularize para manter o acesso completo.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Disparos</p>
                  <p className="font-semibold">Ilimitados ∞</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Smartphone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Chips WhatsApp</p>
                  <p className="font-semibold">{chipsConnected}/{currentPlanData.chips}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Star className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Leads</p>
                  <p className="font-semibold">{leadsCount.toLocaleString()} — ∞</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Valor</p>
                  <p className="font-semibold">
                    {subscription?.amount
                      ? `R$ ${(subscription.amount / 100).toFixed(2)}`
                      : 'Gratuito'}
                    {subscription?.payment_method && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({subscription.payment_method})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            {subscription?.started_at && (
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Assinante desde {format(new Date(subscription.started_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                {subscription?.expires_at && (
                  <span className="ml-2">
                    • Expira em {format(new Date(subscription.expires_at), "dd/MM/yyyy")}
                  </span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3">
          <Label className={!isAnnual ? 'font-semibold' : 'text-muted-foreground'}>Mensal</Label>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <Label className={isAnnual ? 'font-semibold' : 'text-muted-foreground'}>
            Anual
            <Badge variant="secondary" className="ml-2 text-xs bg-green-500/10 text-green-600">-20%</Badge>
          </Label>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            const PlanIcon = plan.icon;
            const price = getPrice(plan.monthlyPrice);
            const checkoutUrl = getCheckoutUrl(plan.id);

            return (
              <Card
                key={plan.id}
                className={`relative transition-all ${
                  plan.highlight
                    ? 'border-primary shadow-lg ring-2 ring-primary/20 scale-[1.02]'
                    : 'hover:border-primary/50'
                } ${isCurrentPlan ? 'bg-primary/5' : ''}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-md">
                      <Star className="h-3 w-3 mr-1" />
                      Mais popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <div className="mx-auto p-3 rounded-xl bg-primary/10 w-fit mb-2">
                    <PlanIcon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1 mt-2">
                    <span className="text-3xl font-bold">R$ {price}</span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                  {isAnnual && (
                    <p className="text-xs text-green-600">
                      R$ {price * 12}/ano (economia de R$ {plan.monthlyPrice * 12 - price * 12})
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? 'secondary' : plan.highlight ? 'default' : 'outline'}
                    disabled={isCurrentPlan}
                    asChild={!isCurrentPlan}
                  >
                    {isCurrentPlan ? (
                      <span>Plano atual</span>
                    ) : (
                      <a
                        href={checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        Assinar agora
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </Button>
                  {!isCurrentPlan && (
                    <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      Pagamento seguro via Cakto
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Histórico de Pagamentos</CardTitle>
              </div>
              <CardDescription>Eventos recebidos via webhook Cakto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {paymentHistory.map((event) => {
                  const eventInfo = EVENT_LABELS[event.event_type] || {
                    label: event.event_type,
                    color: 'text-muted-foreground',
                    icon: Clock,
                  };
                  const EventIcon = eventInfo.icon;

                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/20"
                    >
                      <div className="flex items-center gap-3">
                        <EventIcon className={`h-4 w-4 ${eventInfo.color}`} />
                        <div>
                          <p className="text-sm font-medium">{eventInfo.label}</p>
                          {event.product_name && (
                            <p className="text-xs text-muted-foreground">{event.product_name}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {event.amount > 0 && (
                          <p className="text-sm font-semibold">
                            R$ {(event.amount / 100).toFixed(2)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.created_at), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Webhook Config for Admin */}
        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm text-muted-foreground">Integração Cakto (Admin)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">URL do Webhook — configure na Cakto</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 text-xs bg-muted p-2.5 rounded-lg font-mono break-all select-all">
                  {webhookUrl}
                </code>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(webhookUrl)} className="gap-1.5 shrink-0">
                  <Copy className="h-3 w-3" />
                  Copiar
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border/50 p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Como configurar:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Acesse o painel da Cakto → <strong>Integrações → Webhooks</strong></li>
                <li>Cole a URL acima como endpoint</li>
                <li>Selecione os eventos:
                  <span className="font-mono text-[10px] ml-1">
                    purchase_approved, subscription_created, subscription_canceled, subscription_renewed, refund, chargeback
                  </span>
                </li>
                <li>Crie produtos com nomes contendo "Starter", "Pro" ou "Enterprise"</li>
                <li>O email do cliente na Cakto deve ser o mesmo do cadastro aqui</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
