import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLeads } from '@/hooks/use-leads';
import { useUserSettings } from '@/hooks/use-user-settings';
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
  Infinity as InfinityIcon,
} from 'lucide-react';

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

export default function BillingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const { leads } = useLeads();
  const { settings } = useUserSettings();

  const currentPlan = 'starter'; // TODO: from user subscription
  const chipsConnected = settings?.whatsapp_connected ? 1 : 0;
  const leadsCount = leads?.length || 0;
  const currentPlanData = plans.find(p => p.id === currentPlan)!;

  const getPrice = (monthly: number) => {
    if (isAnnual) return Math.round(monthly * 0.8);
    return monthly;
  };

  return (
    <DashboardLayout
      title="Planos e Faturamento"
      description="Gerencie seu plano e acompanhe o uso"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Current Plan Info */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>Seu Plano</CardTitle>
              </div>
              <Badge className="bg-primary text-primary-foreground">
                Plano {currentPlanData.name}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Disparos</p>
                  <p className="font-semibold flex items-center gap-1">Ilimitados ∞</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Smartphone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Chips WhatsApp</p>
                  <p className="font-semibold">{chipsConnected}/{currentPlanData.chips}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Star className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Leads</p>
                  <p className="font-semibold">{leadsCount.toLocaleString()} — Ilimitados ∞</p>
                </div>
              </div>
            </div>
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
                    onClick={() => setContactOpen(true)}
                  >
                    {isCurrentPlan ? 'Plano atual' : 'Escolher plano'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Contact Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fale conosco para upgrade</DialogTitle>
            <DialogDescription>
              Entre em contato pelo WhatsApp para ativar ou mudar seu plano.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <Button asChild className="w-full">
              <a
                href="https://wa.me/5511999999999?text=Olá! Quero saber mais sobre os planos do NexaProspect"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Falar no WhatsApp
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
