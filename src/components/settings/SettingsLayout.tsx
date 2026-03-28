import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Zap, Bot, ArrowLeft, Settings,
  Users, Bell, Download, Webhook, Shield,
  Calendar, Key,
} from 'lucide-react';

const settingsGroups = [
  {
    label: 'Integrações',
    items: [
      { to: '/settings/connections', icon: Zap, label: 'Conexões' },
      { to: '/settings/api-keys', icon: Key, label: 'Chaves API' },
      { to: '/settings/webhook', icon: Webhook, label: 'Webhook' },
    ],
  },
  {
    label: 'Agente & Proteção',
    items: [
      { to: '/settings/agent', icon: Bot, label: 'Agente IA' },
      { to: '/settings/anti-block', icon: Shield, label: 'Anti-Bloqueio' },
    ],
  },
  {
    label: 'Geral',
    items: [
      { to: '/settings/team', icon: Users, label: 'Equipe' },
      { to: '/settings/notifications', icon: Bell, label: 'Notificações' },
      { to: '/settings/reports', icon: Download, label: 'Relatórios' },
      { to: '/settings/meetings', icon: Calendar, label: 'Reuniões' },
    ],
  },
];

export default function SettingsLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const initials = user?.user_metadata?.full_name
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    || user?.email?.[0].toUpperCase() || '?';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-[240px] flex-shrink-0 border-r border-border flex flex-col bg-sidebar">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Settings className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-sm text-gradient block leading-tight">Configurações</span>
              <span className="text-[11px] text-muted-foreground">Gerencie sua conta</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-9"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao app
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {settingsGroups.map((group, gi) => (
            <div key={group.label}>
              {gi > 0 && <Separator className="my-3" />}
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-3 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label }) => (
                  <NavLink key={to} to={to}>
                    {({ isActive }) => (
                      <div className={cn(
                        'flex items-center gap-3 px-3 h-9 rounded-lg text-[13px] font-medium transition-all duration-200',
                        isActive
                          ? 'gradient-primary text-primary-foreground shadow-md shadow-primary/25'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      )}>
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 truncate">{label}</span>
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-accent/30 transition-colors">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="gradient-primary text-primary-foreground text-[10px] font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.user_metadata?.full_name || 'Usuário'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
}
