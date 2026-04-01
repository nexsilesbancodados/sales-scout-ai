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
  Kanban,
  BarChart3,
  Settings,
  LogOut,
  ChevronUp,
  BookOpen,
  Sparkles,
  Rocket,
  RefreshCw,
  MessageSquareText,
  Shield,
  Send,
  Mail,
  Calendar,
  FlaskConical,
  Building2,
  Globe,
  Bot,
  CreditCard,
  Code2,
  ShieldCheck,
  Zap,
  Search,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── PRINCIPAL ──────────────────────────────────────────
const mainItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
];

// ─── PROSPECÇÃO ─────────────────────────────────────────
const prospectItems = [
  { title: 'Buscar Leads', icon: Search, path: '/prospecting', highlight: true },
  { title: 'Campanhas', icon: Rocket, path: '/campaigns' },
  { title: 'Radar CNPJ', icon: Building2, path: '/cnpj-radar' },
  { title: 'Agendamentos', icon: Calendar, path: '/scheduled-prospecting' },
];

// ─── ENGAJAMENTO ────────────────────────────────────────
const engageItems = [
  { title: 'Disparo em Massa', icon: Send, path: '/mass-send' },
  { title: 'Follow-up', icon: RefreshCw, path: '/follow-up' },
  { title: 'Templates', icon: MessageSquareText, path: '/templates' },
  { title: 'Anti-Ban', icon: Shield, path: '/antiban' },
];

// ─── CRM ────────────────────────────────────────────────
const crmItems = [
  { title: 'CRM', icon: Kanban, path: '/crm/pipeline', highlight: true },
];

// ─── INTELIGÊNCIA ───────────────────────────────────────
const insightItems = [
  { title: 'Analytics', icon: BarChart3, path: '/analytics' },
  { title: 'Funil', icon: TrendingUp, path: '/funnel' },
  { title: 'Testes A/B', icon: FlaskConical, path: '/ab-testing' },
];

// ─── FERRAMENTAS ────────────────────────────────────────
const toolItems = [
  { title: 'Automações', icon: Zap, path: '/automations', highlight: true },
  { title: 'Agente SDR', icon: Bot, path: '/sdr-agent' },
  { title: 'Email Finder', icon: Mail, path: '/email-finder' },
  { title: 'Extrator Social', icon: Globe, path: '/social-extractor' },
  { title: 'Reuniões', icon: Calendar, path: '/meetings' },
];

const sections = [
  { label: null, items: mainItems },
  { label: 'Prospecção', items: prospectItems },
  { label: 'Engajamento', items: engageItems },
  { label: 'CRM', items: crmItems },
  { label: 'Inteligência', items: insightItems },
  { label: 'Ferramentas', items: toolItems },
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
    if (path === '/crm/pipeline') return location.pathname.startsWith('/crm');
    return location.pathname === path;
  };

  const MenuItem = ({ item }: { item: { title: string; icon: React.ComponentType<{ className?: string }>; path: string; highlight?: boolean } }) => {
    const active = isActive(item.path);
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={active}
          className={cn(
            "relative h-9 rounded-lg transition-all duration-200 group/item",
            active
              ? "gradient-primary text-primary-foreground shadow-md"
              : "hover:bg-accent text-muted-foreground hover:text-accent-foreground"
          )}
        >
          <Link to={item.path} className="flex items-center gap-3 px-3">
            <item.icon className={cn(
              "h-[17px] w-[17px] shrink-0 transition-colors",
              active ? 'text-primary-foreground' : 'text-muted-foreground group-hover/item:text-accent-foreground'
            )} />
            <span className={cn(
              "text-[13px] font-medium truncate",
              active ? "text-primary-foreground font-semibold" : ""
            )}>
              {item.title}
            </span>
            {item.highlight && !active && (
              <Sparkles className="h-3 w-3 text-primary ml-auto opacity-50" />
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="px-4 pt-4 pb-1 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.14em]">
      {children}
    </p>
  );

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4 pb-5">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <img src={logoImg} alt="NexaProspect" className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-base font-bold tracking-tight text-gradient">NexaProspect</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 overflow-y-auto">
        {sections.map((section, i) => (
          <div key={i}>
            {section.label && <SectionLabel>{section.label}</SectionLabel>}
            <SidebarMenu className="space-y-0.5">
              {section.items.map((item) => (
                <MenuItem key={item.path} item={item} />
              ))}
            </SidebarMenu>
          </div>
        ))}

        {isAdmin && (
          <>
            <SectionLabel>Admin</SectionLabel>
            <SidebarMenu className="space-y-0.5">
              <MenuItem item={{ title: 'Painel Admin', icon: ShieldCheck, path: '/admin', highlight: true }} />
            </SidebarMenu>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border space-y-1">
        <SidebarMenu className="space-y-0.5">
          {[
            { title: 'Configurações', icon: Settings, path: '/settings' },
            { title: 'Planos', icon: CreditCard, path: '/billing' },
          ].map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.path)}
                className={cn(
                  "rounded-lg h-9 transition-all duration-200",
                  isActive(item.path)
                    ? 'gradient-primary text-primary-foreground shadow-md'
                    : 'hover:bg-accent text-muted-foreground hover:text-accent-foreground'
                )}
              >
                <Link to={item.path} className="flex items-center gap-3 px-3">
                  <item.icon className="h-[17px] w-[17px]" />
                  <span className="text-[13px] font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-2 rounded-lg hover:bg-accent transition-colors"
            >
              <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="gradient-primary text-primary-foreground text-[10px] font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[12px] font-semibold truncate">
                  {user?.user_metadata?.full_name || 'Usuário'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <ChevronUp className="h-3 w-3 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/tutorial" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Tutorial
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/api-reference" className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                API
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
