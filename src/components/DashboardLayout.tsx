import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { TopNavigation } from '@/components/TopNavigation';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Moon, Sun, PanelLeft, PanelTop, Bell, Sparkles, CalendarDays, Settings } from 'lucide-react';
import { BackgroundJobsMonitor } from '@/components/jobs/BackgroundJobsMonitor';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type NavigationMode = 'sidebar' | 'topbar';

interface NavigationContextType {
  mode: NavigationMode;
  setMode: (mode: NavigationMode) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  mode: 'sidebar',
  setMode: () => {},
});

export const useNavigationMode = () => useContext(NavigationContext);

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function DashboardLayout({ children, title, description, actions }: DashboardLayoutProps) {
  const { theme, setTheme } = useTheme();
  const [navigationMode, setNavigationMode] = useState<NavigationMode>(() => {
    const saved = localStorage.getItem('navigation-mode');
    return (saved as NavigationMode) || 'sidebar';
  });

  useEffect(() => {
    localStorage.setItem('navigation-mode', navigationMode);
  }, [navigationMode]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const toggleNavigationMode = () => setNavigationMode(navigationMode === 'sidebar' ? 'topbar' : 'sidebar');

  if (navigationMode === 'topbar') {
    return (
      <NavigationContext.Provider value={{ mode: navigationMode, setMode: setNavigationMode }}>
        <TopNavigation>
          <div className="container py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
                {description && (
                  <p className="text-muted-foreground mt-0.5 text-[13px] sm:text-sm">{description}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {actions}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleNavigationMode} className="h-8 w-8">
                      <PanelLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Menu lateral</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="animate-fade-in">{children}</div>
          </div>
        </TopNavigation>
      </NavigationContext.Provider>
    );
  }

  return (
    <NavigationContext.Provider value={{ mode: navigationMode, setMode: setNavigationMode }}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-screen overflow-y-auto">
          {/* Enhanced Header */}
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center border-b border-white/5 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 safe-top">
            <div className="flex items-center gap-2 flex-1 px-4 sm:px-6">
              {/* Left: Sidebar trigger + breadcrumb */}
              <SidebarTrigger className="-ml-1 tap-target text-muted-foreground hover:text-foreground transition-colors" />
              <Separator orientation="vertical" className="mx-2 h-4 hidden sm:block" />
              <Breadcrumb className="flex-1 min-w-0">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold truncate text-lg">{title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              {/* Right: Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {actions}

                {/* Tarefas button */}
                <BackgroundJobsMonitor />

                {/* Notifications */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground relative">
                      <Bell className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notificações</TooltipContent>
                </Tooltip>

                {/* Navigation mode toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleNavigationMode}
                      className="h-8 w-8 hidden sm:flex text-muted-foreground hover:text-foreground"
                    >
                      <PanelTop className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Menu no topo</TooltipContent>
                </Tooltip>

                {/* Theme toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="tap-target h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Alternar tema</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 animate-fade-in safe-bottom">
            {description && (
              <p className="text-muted-foreground mb-4 text-xs">{description}</p>
            )}
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </NavigationContext.Provider>
  );
}
