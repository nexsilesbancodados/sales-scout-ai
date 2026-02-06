import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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

// Menu item type
interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  highlight?: boolean;
}

// Main navigation items - organized by category
const mainItems: MenuItem[] = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { title: 'Tutorial', icon: BookOpen, path: '/tutorial' },
];

const prospectingItems: MenuItem[] = [
  { title: 'Prospecção', icon: Target, path: '/prospecting' },
  { title: 'Capturar Leads', icon: Zap, path: '/prospecting?tab=capture', highlight: true },
];

const crmItems: MenuItem[] = [
  { title: 'Leads', icon: Users, path: '/leads' },
  { title: 'Funil', icon: Kanban, path: '/funnel' },
  { title: 'Conversas', icon: MessageSquare, path: '/conversations' },
  { title: 'Agendamentos', icon: Calendar, path: '/meetings' },
];

const analysisItems: MenuItem[] = [
  { title: 'Análise', icon: BarChart3, path: '/analytics' },
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

  const renderMenuItems = (items: typeof mainItems) => (
    <SidebarMenu>
      {items.map((item) => {
        const active = isActive(item.path);
        return (
          <SidebarMenuItem key={item.path}>
            <SidebarMenuButton
              asChild
              isActive={active}
              className={`
                transition-all duration-200 rounded-lg
                ${item.highlight 
                  ? 'bg-primary/10 text-primary hover:bg-primary/20 font-medium border border-primary/20' 
                  : active
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'hover:bg-muted'
                }
              `}
            >
              <Link to={item.path} className="flex items-center gap-3 py-2.5">
                <item.icon className={`h-4 w-4 ${active && !item.highlight ? 'text-primary-foreground' : item.highlight ? 'text-primary' : ''}`} />
                <span className="font-medium">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-5 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <img 
            src={logoImage} 
            alt="Prospecte" 
            className="h-10 w-auto transition-transform duration-200 group-hover:scale-105" 
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-4 px-3">
        {/* Main */}
        <SidebarGroup>
          <SidebarGroupContent>
            {renderMenuItems(mainItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-3 opacity-50" />

        {/* Prospecting */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Prospecção
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(prospectingItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-3 opacity-50" />

        {/* CRM */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            CRM
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(crmItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-3 opacity-50" />

        {/* Analysis */}
        <SidebarGroup>
          <SidebarGroupContent>
            {renderMenuItems(analysisItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {/* Settings quick access */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive('/settings')}
              className={`rounded-lg transition-all duration-200 ${isActive('/settings') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              <Link to="/settings" className="flex items-center gap-3 py-2.5">
                <Settings className="h-4 w-4" />
                <span className="font-medium">Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 h-auto py-3 mt-3 rounded-xl hover:bg-muted transition-colors"
            >
              <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold truncate">
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
