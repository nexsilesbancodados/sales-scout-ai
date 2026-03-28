import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImg from '@/assets/logo.png';
import { useAuth } from '@/lib/auth';
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
  Calendar,
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
  History,
  FlaskConical,
  Building2,
  Globe,
  Bot,
  CreditCard,
  Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
];

const captureItems = [
  { title: 'Prospecção', icon: Target, path: '/prospecting', highlight: true },
  { title: 'Campanhas', icon: Rocket, path: '/campaigns' },
  { title: 'Radar CNPJ', icon: Building2, path: '/cnpj-radar' },
  { title: 'Extrator Social', icon: Globe, path: '/social-extractor' },
  { title: 'Agendado', icon: Calendar, path: '/scheduled-prospecting' },
];

const outreachItems = [
  { title: 'Disparo em Massa', icon: Send, path: '/mass-send' },
  { title: 'Follow-up', icon: RefreshCw, path: '/follow-up' },
  { title: 'Templates', icon: MessageSquareText, path: '/templates' },
];

const crmItems = [
  { title: 'CRM', icon: Kanban, path: '/crm/pipeline', highlight: true },
  { title: 'Leads', icon: Users, path: '/leads' },
  { title: 'Pipeline', icon: Kanban, path: '/funnel' },
  { title: 'Agente SDR', icon: Bot, path: '/sdr-agent' },
  { title: 'Conversas', icon: MessageSquare, path: '/conversations' },
  { title: 'Reuniões', icon: Calendar, path: '/meetings' },
];

const toolItems = [
  { title: 'Buscador de Emails', icon: Mail, path: '/email-finder' },
  { title: 'Histórico', icon: History, path: '/prospecting-history' },
  { title: 'Testes A/B', icon: FlaskConical, path: '/ab-testing' },
  { title: 'Analytics', icon: BarChart3, path: '/analytics' },
  { title: 'Anti-Ban', icon: Shield, path: '/antiban' },
  { title: 'Planos', icon: CreditCard, path: '/billing' },
  { title: 'API', icon: Code2, path: '/api-reference' },
  { title: 'Tutorial', icon: BookOpen, path: '/tutorial' },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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
    if (path.includes('?')) return location.pathname + location.search === path;
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
            "relative h-10 rounded-lg transition-all duration-200 group/item",
            active
              ? "gradient-primary text-primary-foreground shadow-md"
              : "hover:bg-accent text-muted-foreground hover:text-accent-foreground"
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
    <p className="px-4 pt-5 pb-1.5 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.12em]">
      {children}
    </p>
  );

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-5 pb-6">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <img src={logoImg} alt="NexaProspect" className="h-9 w-9 rounded-lg object-contain" />
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

        <SectionLabel>Captura</SectionLabel>
        <SidebarMenu className="space-y-0.5">
          {captureItems.map((item) => (
            <MenuItem key={item.path} item={item} />
          ))}
        </SidebarMenu>

        <SectionLabel>Disparo</SectionLabel>
        <SidebarMenu className="space-y-0.5">
          {outreachItems.map((item) => (
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
          {toolItems.map((item) => (
            <MenuItem key={item.path} item={item} />
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/settings')}
              className={cn(
                "rounded-lg h-10 transition-all duration-200",
                isActive('/settings')
                  ? 'gradient-primary text-primary-foreground shadow-md'
                  : 'hover:bg-accent text-muted-foreground hover:text-accent-foreground'
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
