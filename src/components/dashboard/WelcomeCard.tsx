import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Send, Users, Bot, ArrowRight, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeCardProps {
  userName?: string | null;
  totalLeads: number;
  whatsappConnected: boolean;
}

const quickActions = [
  { label: 'Prospectar', icon: Target, path: '/prospecting', gradient: 'from-primary/20 to-primary/5', color: 'text-primary' },
  { label: 'Disparar', icon: Send, path: '/mass-send', gradient: 'from-info/20 to-info/5', color: 'text-info' },
  { label: 'Ver Leads', icon: Users, path: '/leads', gradient: 'from-success/20 to-success/5', color: 'text-success' },
  { label: 'Agente IA', icon: Bot, path: '/sdr-agent', gradient: 'from-warning/20 to-warning/5', color: 'text-warning' },
];

export function WelcomeCard({ userName, totalLeads, whatsappConnected }: WelcomeCardProps) {
  const greeting = getGreeting();
  const displayName = userName?.split(' ')[0] || 'Usuário';

  return (
    <Card className="relative overflow-hidden border-border/50 mb-6 bg-gradient-to-br from-card via-card to-primary/[0.03]">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/[0.03] rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-primary/[0.02] rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />

      <CardContent className="relative p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{greeting}</span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Olá, {displayName}! 👋
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {totalLeads === 0
                ? 'Comece capturando seus primeiros leads hoje!'
                : `Você tem ${totalLeads.toLocaleString('pt-BR')} leads na base. Continue prospectando!`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* WhatsApp status badge */}
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              whatsappConnected
                ? "bg-success/10 text-success border-success/20"
                : "bg-muted/50 text-muted-foreground border-border/50"
            )}>
              {whatsappConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {whatsappConnected ? 'Conectado' : 'Desconectado'}
            </div>

            {!whatsappConnected && (
              <Button asChild size="sm" className="gradient-primary text-primary-foreground h-8 text-xs">
                <Link to="/settings/connections" className="gap-1.5">
                  Conectar
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className={cn(
                "group flex items-center gap-2.5 p-3 rounded-xl border border-border/50",
                "bg-gradient-to-br hover:border-primary/20 transition-all duration-300",
                "hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5",
                action.gradient
              )}
            >
              <div className={cn("p-2 rounded-lg bg-background/80 shadow-sm", action.color)}>
                <action.icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-foreground">{action.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
