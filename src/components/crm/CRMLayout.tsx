import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Kanban, Users, CheckSquare, MessageSquare,
  BarChart3, Megaphone, ArrowLeft, Database, Menu,
} from 'lucide-react';

const crmNav = [
  { to: '/crm/pipeline', icon: Kanban, label: 'Pipeline' },
  { to: '/crm/contacts', icon: Users, label: 'Contatos' },
  { to: '/crm/activities', icon: CheckSquare, label: 'Atividades' },
  { to: '/crm/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/crm/meta-ads', icon: Megaphone, label: 'Meta Ads' },
];

function SidebarContent({ navigate, initials, email }: { navigate: (path: string) => void; initials: string; email: string }) {
  return (
    <>
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <Database className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm text-gradient">CRM</span>
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
        {crmNav.map(({ to, icon: Icon, label }) => (
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
          <span className="text-xs text-muted-foreground truncate">{email}</span>
        </div>
      </div>
    </>
  );
}

export default function CRMLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.user_metadata?.full_name
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    || user?.email?.[0].toUpperCase() || '?';
  const email = user?.user_metadata?.full_name || user?.email || '';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[220px] flex-shrink-0 border-r border-border flex-col bg-sidebar">
        <SidebarContent navigate={navigate} initials={initials} email={email} />
      </aside>

      {/* Mobile header + sheet */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b border-border bg-background/95 backdrop-blur flex items-center px-4 gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-0 flex flex-col">
            <SidebarContent navigate={(path) => { navigate(path); setMobileOpen(false); }} initials={initials} email={email} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <span className="font-bold text-sm">CRM</span>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto md:pt-0 pt-14">
        <Outlet />
      </main>
    </div>
  );
}
