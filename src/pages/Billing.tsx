import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLeads } from '@/hooks/use-leads';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useSubscription } from '@/hooks/use-subscription';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
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
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

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
    tagline: 'Para quem está começando',
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
    gradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
    borderColor: 'border-sky-500/20',
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-500',
    accentColor: 'text-sky-500',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'ROI comprovado',
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
    gradient: 'from-primary/15 via-primary/5 to-transparent',
    borderColor: 'border-primary/30',
    iconBg: 'bg-primary/15',
    iconColor: 'text-primary',
    accentColor: 'text-primary',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Escala máxima',
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
    gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    borderColor: 'border-amber-500/20',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-500',
    accentColor: 'text-amber-500',
  },
];

const EVENT_LABELS: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  purchase_approved: { label: 'Pagamento aprovado', color: 'text-emerald-500', icon: CheckCircle2 },
  subscription_created: { label: 'Assinatura criada', color: 'text-emerald-500', icon: CheckCircle2 },
  subscription_renewed: { label: 'Assinatura renovada', color: 'text-emerald-500', icon: CheckCircle2 },
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

  const getPrice = (monthly: number) => isAnnual ? Math.round(monthly * 0.8) : monthly;

  const getCheckoutUrl = (planId: string) => {
    const urls = CAKTO_CHECKOUT_URLS[planId];
    if (!urls) return '#';
    const baseUrl = isAnnual ? urls.annual : urls.monthly;
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
      description="Gerencie seu plano e acompanhe pagamentos"
    >
      <div className="space-y-8 animate-fade-in">
        {/* Current Subscription Status */}
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/8 via-primary/3 to-transparent shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/15 shadow-sm">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Sua Assinatura</h3>
                  {subscription?.started_at && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Desde {format(new Date(subscription.started_at), "MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusBadge.variant} className="text-xs">
                  {statusBadge.label}
                </Badge>
                <Badge className="bg-primary/15 text-primary border-primary/20 font-semibold">
                  {currentPlanData.name}
                </Badge>
              </div>
            </div>

            {isPastDue && (
              <div className="flex items-center gap-2.5 p-3 mb-5 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                <p className="text-sm text-orange-400">
                  Pagamento pendente. Regularize para manter o acesso.
                </p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: MessageSquare, label: 'Disparos', value: 'Ilimitados ∞', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { icon: Smartphone, label: 'Chips WhatsApp', value: `${chipsConnected}/${currentPlanData.chips}`, color: 'text-sky-500', bg: 'bg-sky-500/10' },
                { icon: Star, label: 'Leads Capturados', value: `${leadsCount.toLocaleString()}`, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { icon: CreditCard, label: 'Valor', value: subscription?.amount ? `R$ ${(subscription.amount / 100).toFixed(0)}/mês` : 'Gratuito', color: 'text-violet-500', bg: 'bg-violet-500/10' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 p-3.5 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
                  <div className={cn("p-2 rounded-lg", stat.bg)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
                    <p className="font-bold text-sm">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 py-2">
          <span className={cn("text-sm font-medium transition-colors", !isAnnual ? 'text-foreground' : 'text-muted-foreground')}>
            Mensal
          </span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className={cn("text-sm font-medium transition-colors flex items-center gap-2", isAnnual ? 'text-foreground' : 'text-muted-foreground')}>
            Anual
            <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-[10px] font-bold px-2">
              -20%
            </Badge>
          </span>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan, index) => {
            const isCurrentPlan = plan.id === currentPlan;
            const PlanIcon = plan.icon;
            const price = getPrice(plan.monthlyPrice);
            const checkoutUrl = getCheckoutUrl(plan.id);

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 border-0 animate-slide-up",
                  `bg-gradient-to-b ${plan.gradient}`,
                  plan.highlight
                    ? 'ring-2 ring-primary/30 shadow-xl shadow-primary/5 scale-[1.02]'
                    : 'hover:ring-1 hover:ring-border shadow-md',
                  isCurrentPlan && 'ring-2 ring-primary/40'
                )}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {plan.highlight && (
                  <div className="absolute -top-px left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent" />
                )}
                
                {plan.highlight && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-primary-foreground text-[10px] font-bold shadow-md gap-1">
                      <Sparkles className="h-3 w-3" />
                      Popular
                    </Badge>
                  </div>
                )}

                <CardContent className="p-6 pt-7">
                  {/* Plan header */}
                  <div className="mb-6">
                    <div className={cn("inline-flex p-3 rounded-2xl mb-4", plan.iconBg)}>
                      <PlanIcon className={cn("h-6 w-6", plan.iconColor)} />
                    </div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-muted-foreground">R$</span>
                      <span className="text-4xl font-extrabold tracking-tight">{price}</span>
                      <span className="text-sm text-muted-foreground">/mês</span>
                    </div>
                    {isAnnual && (
                      <p className="text-[11px] text-emerald-400 font-medium mt-1">
                        R$ {price * 12}/ano — economia de R$ {plan.monthlyPrice * 12 - price * 12}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5 text-sm">
                        <div className={cn("p-0.5 rounded-full", plan.iconBg)}>
                          <Check className={cn("h-3 w-3", plan.iconColor)} />
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className={cn(
                      "w-full h-11 font-semibold text-sm gap-2 transition-all",
                      plan.highlight && !isCurrentPlan && "gradient-primary shadow-md hover:shadow-lg",
                      isCurrentPlan && "bg-muted text-muted-foreground"
                    )}
                    variant={isCurrentPlan ? 'secondary' : plan.highlight ? 'default' : 'outline'}
                    disabled={isCurrentPlan}
                    asChild={!isCurrentPlan}
                  >
                    {isCurrentPlan ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Plano atual
                      </span>
                    ) : (
                      <a
                        href={checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        Assinar agora
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    )}
                  </Button>

                  {!isCurrentPlan && (
                    <p className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/60 mt-3">
                      <Shield className="h-3 w-3" />
                      Pagamento seguro via Cakto
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Receipt className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Histórico de Pagamentos</CardTitle>
                  <CardDescription className="text-xs">Eventos via webhook Cakto</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
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
                      className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-background">
                          <EventIcon className={cn("h-3.5 w-3.5", eventInfo.color)} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{eventInfo.label}</p>
                          {event.product_name && (
                            <p className="text-[11px] text-muted-foreground">{event.product_name}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {event.amount > 0 && (
                          <p className="text-sm font-bold">
                            R$ {(event.amount / 100).toFixed(2)}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground">
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

        {/* Webhook Config */}
        <Card className="border-dashed border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground/60" />
              <CardTitle className="text-xs text-muted-foreground/60 font-medium">
                Integração Cakto (Admin)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-[10px] text-muted-foreground/60">URL do Webhook</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 text-[11px] bg-muted/50 p-2.5 rounded-lg font-mono break-all select-all text-muted-foreground">
                  {webhookUrl}
                </code>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(webhookUrl)} className="gap-1.5 shrink-0 h-8 text-xs">
                  <Copy className="h-3 w-3" />
                  Copiar
                </Button>
              </div>
            </div>

            <details className="group">
              <summary className="text-[11px] text-muted-foreground/50 cursor-pointer hover:text-muted-foreground transition-colors list-none flex items-center gap-1">
                <ArrowRight className="h-3 w-3 transition-transform group-open:rotate-90" />
                Como configurar
              </summary>
              <ol className="text-[11px] text-muted-foreground/60 space-y-1 list-decimal list-inside mt-2 pl-4">
                <li>Acesse Cakto → Integrações → Webhooks</li>
                <li>Cole a URL acima como endpoint</li>
                <li>Selecione: purchase_approved, subscription_created, subscription_canceled, refund</li>
                <li>Nomes dos produtos devem conter "Starter", "Pro" ou "Enterprise"</li>
                <li>O email do cliente deve ser o mesmo do cadastro</li>
              </ol>
            </details>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
