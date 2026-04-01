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
  Kanban,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  BookOpen,
  Moon,
  Sun,
  Menu,
  Zap,
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
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { BackgroundJobsMonitor } from '@/components/jobs/BackgroundJobsMonitor';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const mainItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
];

const prospectItems = [
  { title: 'Buscar Leads', icon: Search, path: '/prospecting' },
  { title: 'Campanhas', icon: Rocket, path: '/campaigns' },
  { title: 'Radar CNPJ', icon: Building2, path: '/cnpj-radar' },
  { title: 'Agendamentos', icon: Calendar, path: '/scheduled-prospecting' },
];

const engageItems = [
  { title: 'Disparo em Massa', icon: Send, path: '/mass-send' },
  { title: 'Follow-up', icon: RefreshCw, path: '/follow-up' },
  { title: 'Templates', icon: MessageSquareText, path: '/templates' },
  { title: 'Anti-Ban', icon: Shield, path: '/antiban' },
];

const crmItems = [
  { title: 'CRM', icon: Kanban, path: '/crm/pipeline' },
];

const insightItems = [
  { title: 'Analytics', icon: BarChart3, path: '/analytics' },
  { title: 'Funil', icon: TrendingUp, path: '/funnel' },
  { title: 'Testes A/B', icon: FlaskConical, path: '/ab-testing' },
];

const toolItems = [
  { title: 'Automações', icon: Zap, path: '/automations' },
  { title: 'Agente SDR', icon: Bot, path: '/sdr-agent' },
  { title: 'Email Finder', icon: Mail, path: '/email-finder' },
  { title: 'Extrator Social', icon: Globe, path: '/social-extractor' },
  { title: 'Reuniões', icon: Calendar, path: '/meetings' },
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

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

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

  const NavLink = ({ item, mobile = false }: { item: typeof mainItems[0]; mobile?: boolean }) => {
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

  const DropdownSection = ({ label, icon: Icon, items }: { label: string; icon: React.ElementType; items: typeof mainItems }) => (
    <NavigationMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "flex items-center gap-2 h-10",
              items.some(item => isActive(item.path)) && "gradient-primary text-primary-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {items.map((item) => (
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
  );

  const mobileSections = [
    { label: null, items: mainItems },
    { label: 'Prospecção', items: prospectItems },
    { label: 'Engajamento', items: engageItems },
    { label: 'CRM', items: crmItems },
    { label: 'Inteligência', items: insightItems },
    { label: 'Ferramentas', items: toolItems },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 safe-top">
        <div className="container flex h-[60px] items-center px-4">
          <Link to="/dashboard" className="flex items-center gap-2.5 mr-6">
            <img src="/logo.png" alt="NexaProspect" className="h-7 w-7 rounded-lg object-contain" width={28} height={28} />
            <span className="text-sm font-bold text-gradient hidden sm:inline">NexaProspect</span>
          </Link>

          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="gap-1">
              {mainItems.map((item) => (
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

              <DropdownSection label="Prospecção" icon={Target} items={prospectItems} />
              <DropdownSection label="Engajamento" icon={Send} items={engageItems} />

              {/* CRM direct link */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive('/crm/pipeline') && "gradient-primary text-primary-foreground"
                  )}
                >
                  <Link to="/crm/pipeline" className="flex items-center gap-2">
                    <Kanban className="h-4 w-4" />
                    CRM
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <DropdownSection label="Inteligência" icon={BarChart3} items={insightItems} />
              <DropdownSection label="Ferramentas" icon={Zap} items={toolItems} />
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
              <SheetContent side="right" className="w-72 p-4 overflow-y-auto">
                <nav className="flex flex-col gap-3 mt-4">
                  {mobileSections.map((section, i) => (
                    <div key={i} className={cn(i > 0 && "border-t pt-3")}>
                      {section.label && (
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.14em] mb-2 px-3">
                          {section.label}
                        </p>
                      )}
                      <div className="space-y-0.5">
                        {section.items.map((item) => (
                          <NavLink key={item.path} item={item} mobile />
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3">
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
