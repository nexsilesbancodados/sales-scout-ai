import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Target, Send, Users, Bot, ArrowRight, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeCardProps {
  userName?: string | null;
  totalLeads: number;
  whatsappConnected: boolean;
}

const quickActions = [
  { label: 'Prospectar', icon: Target, path: '/prospecting', color: 'text-primary', bg: 'bg-primary/8 group-hover:bg-primary/12' },
  { label: 'Disparar', icon: Send, path: '/mass-send', color: 'text-info', bg: 'bg-info/8 group-hover:bg-info/12' },
  { label: 'Ver Leads', icon: Users, path: '/leads', color: 'text-success', bg: 'bg-success/8 group-hover:bg-success/12' },
  { label: 'Agente IA', icon: Bot, path: '/sdr-agent', color: 'text-warning', bg: 'bg-warning/8 group-hover:bg-warning/12' },
];

export function WelcomeCard({ userName, totalLeads, whatsappConnected }: WelcomeCardProps) {
  const greeting = getGreeting();
  const displayName = userName?.split(' ')[0] || 'Usuário';

  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest mb-1">{greeting}</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Olá, {displayName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalLeads === 0
              ? 'Comece capturando seus primeiros leads hoje.'
              : `${totalLeads.toLocaleString('pt-BR')} leads na sua base.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
            whatsappConnected
              ? "bg-success/8 text-success border-success/15"
              : "bg-muted/50 text-muted-foreground border-border/50"
          )}>
            {whatsappConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {whatsappConnected ? 'WhatsApp conectado' : 'WhatsApp desconectado'}
          </div>
          {!whatsappConnected && (
            <Button asChild size="sm" className="gradient-primary h-8 text-xs shadow-sm shadow-primary/15">
              <Link to="/settings/connections" className="gap-1.5">
                Conectar <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {quickActions.map((action, i) => (
          <Link
            key={action.path}
            to={action.path}
            className={cn(
              "group flex items-center gap-3 p-3.5 rounded-xl border border-border/40",
              "hover:border-border/60 hover:shadow-sm transition-all duration-200",
              "active:scale-[0.98]",
              `animate-slide-up stagger-${i + 1}`
            )}
          >
            <div className={cn("p-2 rounded-lg transition-colors duration-200", action.bg, action.color)}>
              <action.icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
