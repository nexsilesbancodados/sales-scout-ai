import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImg from '@/assets/logo.png';
import { useAuth } from '@/lib/auth';
import { useAdminRole } from '@/hooks/use-admin';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Target,
  LayoutDashboard,
  Users,
  Kanban,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronUp,
  Sparkles,
  Rocket,
  Shield,
  Send,
  Bot,
  CreditCard,
  ShieldCheck,
  Zap,
  Database,
  RefreshCw,
  MessageSquareText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Simplified menu: 4 clear categories ── */

const mainItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { title: 'Automações', icon: Zap, path: '/automations', highlight: true },
];

const prospectingItems = [
  { title: 'Prospecção', icon: Target, path: '/prospecting', highlight: true },
  { title: 'Campanhas', icon: Rocket, path: '/campaigns' },
  { title: 'Disparo em Massa', icon: Send, path: '/mass-send' },
  { title: 'Anti-Ban', icon: Shield, path: '/antiban' },
];

const crmItems = [
  { title: 'CRM', icon: Database, path: '/crm/dashboard', highlight: true },
  { title: 'Pipeline', icon: Kanban, path: '/crm/pipeline' },
  { title: 'Contatos', icon: Users, path: '/crm/contacts' },
  { title: 'Conversas', icon: MessageSquare, path: '/conversations' },
  { title: 'Agente SDR', icon: Bot, path: '/sdr-agent' },
];

const toolsItems = [
  { title: 'Analytics', icon: BarChart3, path: '/analytics' },
  { title: 'Follow-up', icon: RefreshCw, path: '/follow-up' },
  { title: 'Templates', icon: MessageSquareText, path: '/templates' },
  { title: 'Planos', icon: CreditCard, path: '/billing' },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminRole();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const userInitials = user?.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user?.email?.[0].toUpperCase() || '?';

  const isActive = (path: string) => {
    if (path === '/crm/dashboard') return location.pathname.startsWith('/crm');
    return location.pathname === path;
  };

  const isExactActive = (path: string) => location.pathname === path;

  const MenuItem = ({ item }: { item: { title: string; icon: React.ComponentType<{ className?: string }>; path: string; highlight?: boolean } }) => {
    const active = isExactActive(item.path);
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={active}
          className={cn(
            "relative h-10 rounded-lg transition-all duration-200 group/item",
            active
              ? "bg-primary/15 text-primary border border-primary/20"
              : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
          )}
        >
          <Link to={item.path} className="flex items-center gap-3 px-3">
            <item.icon className={cn(
              "h-[18px] w-[18px] shrink-0 transition-colors",
              active ? 'text-primary-foreground' : 'text-muted-foreground group-hover/item:text-accent-foreground'
            )} />
            <span className={cn(
              "text-[13px] font-medium truncate",
              active ? "text-primary-foreground font-semibold" : ""
            )}>
              {item.title}
            </span>
            {item.highlight && !active && (
              <Sparkles className="h-3 w-3 text-primary ml-auto opacity-60" />
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="px-3 pt-4 pb-1 text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-[0.15em]">
      {children}
    </p>
  );

  return (
    <Sidebar className="border-r border-white/5 bg-sidebar">
      <SidebarHeader className="p-5 pb-6">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <img src={logoImg} alt="NexaProspect" className="h-10 w-10 rounded-lg object-contain" />
          <div>
            <span className="text-base font-bold tracking-tight text-gradient">NexaProspect</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarMenu className="space-y-0.5">
          {mainItems.map((item) => (
            <MenuItem key={item.path} item={item} />
          ))}
        </SidebarMenu>

        <SectionLabel>Prospecção & Disparo</SectionLabel>
        <SidebarMenu className="space-y-0.5">
          {prospectingItems.map((item) => (
            <MenuItem key={item.path} item={item} />
          ))}
        </SidebarMenu>

        <SectionLabel>CRM</SectionLabel>
        <SidebarMenu className="space-y-0.5">
          {crmItems.map((item) => (
            <MenuItem key={item.path} item={item} />
          ))}
        </SidebarMenu>

        <SectionLabel>Ferramentas</SectionLabel>
        <SidebarMenu className="space-y-0.5">
          {toolsItems.map((item) => (
            <MenuItem key={item.path} item={item} />
          ))}
        </SidebarMenu>

        {isAdmin && (
          <>
            <SectionLabel>Admin</SectionLabel>
            <SidebarMenu className="space-y-0.5">
              <MenuItem item={{ title: 'Painel Admin', icon: ShieldCheck, path: '/admin', highlight: true }} />
            </SidebarMenu>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isExactActive('/settings')}
              className={cn(
                "rounded-lg h-10 transition-all duration-200",
                isExactActive('/settings')
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
              )}
            >
              <Link to="/settings" className="flex items-center gap-3 px-3">
                <Settings className="h-[18px] w-[18px]" />
                <span className="text-[13px] font-medium">Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-2.5 mt-1 rounded-lg hover:bg-accent transition-colors"
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[13px] font-semibold truncate">
                  {user?.user_metadata?.full_name || 'Usuário'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
