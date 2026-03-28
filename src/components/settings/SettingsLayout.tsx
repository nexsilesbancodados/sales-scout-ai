import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Zap, Bot, Settings2, ArrowLeft, Settings,
  Users, Bell, Download, Mail, Webhook, Shield,
  Calendar, Key,
} from 'lucide-react';

const settingsNav = [
  { to: '/settings/connections', icon: Zap, label: 'Conexões' },
  { to: '/settings/api-keys', icon: Key, label: 'Chaves API' },
  { to: '/settings/anti-block', icon: Shield, label: 'Anti-Bloqueio' },
  { to: '/settings/agent', icon: Bot, label: 'Agente IA' },
  { to: '/settings/team', icon: Users, label: 'Equipe' },
  { to: '/settings/notifications', icon: Bell, label: 'Notificações' },
  { to: '/settings/reports', icon: Download, label: 'Relatórios' },
  { to: '/settings/meetings', icon: Calendar, label: 'Reuniões' },
  { to: '/settings/webhook', icon: Webhook, label: 'Webhook' },
];

export default function SettingsLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const initials = user?.user_metadata?.full_name
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    || user?.email?.[0].toUpperCase() || '?';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-[220px] flex-shrink-0 border-r border-border flex flex-col bg-sidebar">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Settings className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm text-gradient">Configurações</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao app
          </Button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {settingsNav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <div className={cn(
                  'flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] font-medium transition-all',
                  isActive
                    ? 'gradient-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 px-2 mt-1">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="gradient-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">{user?.user_metadata?.full_name || user?.email}</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
