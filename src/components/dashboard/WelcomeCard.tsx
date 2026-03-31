import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Send, Users, Bot, ArrowRight, Sparkles } from 'lucide-react';

interface WelcomeCardProps {
  userName?: string | null;
  totalLeads: number;
  whatsappConnected: boolean;
}

const quickActions = [
  { label: 'Prospectar', icon: Target, path: '/prospecting', color: 'text-primary' },
  { label: 'Disparar', icon: Send, path: '/mass-send', color: 'text-info' },
  { label: 'Ver Leads', icon: Users, path: '/leads', color: 'text-success' },
  { label: 'Agente IA', icon: Bot, path: '/sdr-agent', color: 'text-warning' },
];

export function WelcomeCard({ userName, totalLeads, whatsappConnected }: WelcomeCardProps) {
  const greeting = getGreeting();
  const displayName = userName?.split(' ')[0] || 'Usuário';

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/10 mb-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      <CardContent className="relative p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <p className="text-xs font-medium text-primary uppercase tracking-wider">{greeting}</p>
            </div>
            <h2 className="text-lg sm:text-xl font-bold">
              Olá, {displayName}! 👋
            </h2>
            <p className="text-sm text-muted-foreground">
              {totalLeads === 0
                ? 'Comece capturando seus primeiros leads hoje!'
                : `Você tem ${totalLeads} leads. Continue prospectando!`}
            </p>
          </div>

          {!whatsappConnected && (
            <Button asChild size="sm" variant="outline" className="border-warning/50 text-warning hover:bg-warning/10 shrink-0">
              <Link to="/settings/connections" className="gap-1.5">
                Conectar WhatsApp
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.path}
              asChild
              variant="outline"
              size="sm"
              className="h-11 justify-start gap-2 bg-background/60 backdrop-blur-sm hover:bg-background/80 border-border/50"
            >
              <Link to={action.path}>
                <action.icon className={`h-4 w-4 ${action.color}`} />
                <span className="text-xs font-medium">{action.label}</span>
              </Link>
            </Button>
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
