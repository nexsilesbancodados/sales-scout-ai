import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  Zap,
  BookOpen,
} from 'lucide-react';
import logoImage from '@/assets/logo.png';
import { cn } from '@/lib/utils';

// Menu items with clear hierarchy
const menuItems = [
  { 
    title: 'Dashboard', 
    icon: LayoutDashboard, 
    path: '/dashboard',
    description: 'Visão geral'
  },
  { 
    title: 'Prospecção', 
    icon: Target, 
    path: '/prospecting',
    description: 'Capturar leads'
  },
  { 
    title: 'Capturar', 
    icon: Zap, 
    path: '/prospecting?tab=capture', 
    highlight: true,
    description: 'Iniciar captura'
  },
];

const crmItems = [
  { title: 'Leads', icon: Users, path: '/leads', description: 'Gerenciar contatos' },
  { title: 'Funil', icon: Kanban, path: '/funnel', description: 'Pipeline de vendas' },
  { title: 'Conversas', icon: MessageSquare, path: '/conversations', description: 'Chat com leads' },
  { title: 'Reuniões', icon: Calendar, path: '/meetings', description: 'Agendamentos' },
];

const toolItems = [
  { title: 'Análise', icon: BarChart3, path: '/analytics', description: 'Relatórios' },
  { title: 'Tutorial', icon: BookOpen, path: '/tutorial', description: 'Guia de uso' },
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
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  const MenuItem = ({ item }: { item: typeof menuItems[0] }) => {
    const active = isActive(item.path);
    return (
      <SidebarMenuItem>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              asChild
              isActive={active}
              className={cn(
                "transition-all duration-200 rounded-lg h-10",
                item.highlight 
                  ? "bg-primary/10 text-primary hover:bg-primary/20 font-medium border border-primary/20" 
                  : active
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-muted"
              )}
            >
              <Link to={item.path} className="flex items-center gap-3">
                <item.icon className={cn(
                  "h-4 w-4",
                  active && !item.highlight ? 'text-primary-foreground' : item.highlight ? 'text-primary' : ''
                )} />
                <span className="font-medium truncate">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right" className="hidden lg:block">
            {item.description}
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    );
  };

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      {children}
    </p>
  );

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <img 
            src={logoImage} 
            alt="Prospecte" 
            className="h-9 w-auto transition-transform duration-200 group-hover:scale-105" 
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-3 px-2">
        {/* Main Actions */}
        <SidebarMenu className="space-y-1">
          {menuItems.map((item) => (
            <MenuItem key={item.path} item={item} />
          ))}
        </SidebarMenu>

        <SidebarSeparator className="my-3" />

        {/* CRM Section */}
        <SectionLabel>CRM</SectionLabel>
        <SidebarMenu className="space-y-1">
          {crmItems.map((item) => (
            <MenuItem key={item.path} item={item} />
          ))}
        </SidebarMenu>

        <SidebarSeparator className="my-3" />

        {/* Tools Section */}
        <SectionLabel>Ferramentas</SectionLabel>
        <SidebarMenu className="space-y-1">
          {toolItems.map((item) => (
            <MenuItem key={item.path} item={item} />
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {/* Settings */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive('/settings')}
              className={cn(
                "rounded-lg h-10 transition-all duration-200",
                isActive('/settings') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
            >
              <Link to="/settings" className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                <span className="font-medium">Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 h-auto py-2.5 mt-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.user_metadata?.full_name || 'Usuário'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
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
