import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
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
  ChevronDown,
  BookOpen,
  Moon,
  Sun,
  Menu,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { BackgroundJobsMonitor } from '@/components/jobs/BackgroundJobsMonitor';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const menuItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { title: 'Prospecção', icon: Target, path: '/prospecting' },
];

const crmItems = [
  { title: 'Leads', icon: Users, path: '/leads' },
  { title: 'Funil', icon: Kanban, path: '/funnel' },
  { title: 'Conversas', icon: MessageSquare, path: '/conversations' },
  { title: 'Reuniões', icon: Calendar, path: '/meetings' },
];

const toolItems = [
  { title: 'Análise', icon: BarChart3, path: '/analytics' },
  { title: 'Tutorial', icon: BookOpen, path: '/tutorial' },
];

interface TopNavigationProps {
  children: React.ReactNode;
}

export function TopNavigation({ children }: TopNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const userInitials = user?.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user?.email?.[0].toUpperCase() || '?';

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ item, mobile = false }: { item: typeof menuItems[0]; mobile?: boolean }) => {
    const active = isActive(item.path);
    return (
      <Link
        to={item.path}
        onClick={() => mobile && setMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          active
            ? "gradient-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
          mobile && "w-full"
        )}
      >
        <item.icon className="h-4 w-4" />
        {item.title}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 safe-top">
        <div className="container flex h-[60px] items-center px-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 mr-6">
            <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-gradient hidden sm:inline">NexaProspect</span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="gap-1">
              {menuItems.map((item) => (
                <NavigationMenuItem key={item.path}>
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      navigationMenuTriggerStyle(),
                      isActive(item.path) && "gradient-primary text-primary-foreground"
                    )}
                  >
                    <Link to={item.path} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}

              <NavigationMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex items-center gap-2 h-10",
                        crmItems.some(item => isActive(item.path)) && "gradient-primary text-primary-foreground"
                      )}
                    >
                      <Users className="h-4 w-4" />
                      CRM
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {crmItems.map((item) => (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link to={item.path} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          {item.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex items-center gap-2 h-10",
                        toolItems.some(item => isActive(item.path)) && "gradient-primary text-primary-foreground"
                      )}
                    >
                      <BarChart3 className="h-4 w-4" />
                      Ferramentas
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {toolItems.map((item) => (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link to={item.path} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          {item.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <BackgroundJobsMonitor />

            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              asChild
              className={cn(
                "h-9 w-9 hidden sm:flex",
                isActive('/settings') && "gradient-primary text-primary-foreground"
              )}
            >
              <Link to="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold">{user?.user_metadata?.full_name || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-4">
                <nav className="flex flex-col gap-4 mt-4">
                  <div className="space-y-1">
                    {menuItems.map((item) => (
                      <NavLink key={item.path} item={item} mobile />
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.12em] mb-2 px-3">CRM</p>
                    <div className="space-y-1">
                      {crmItems.map((item) => (
                        <NavLink key={item.path} item={item} mobile />
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.12em] mb-2 px-3">Ferramentas</p>
                    <div className="space-y-1">
                      {toolItems.map((item) => (
                        <NavLink key={item.path} item={item} mobile />
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <NavLink item={{ title: 'Configurações', icon: Settings, path: '/settings' }} mobile />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
