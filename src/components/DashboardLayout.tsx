import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { TopNavigation } from '@/components/TopNavigation';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Moon, Sun, PanelLeft, PanelTop } from 'lucide-react';
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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleNavigationMode = () => {
    setNavigationMode(navigationMode === 'sidebar' ? 'topbar' : 'sidebar');
  };

  // Top Navigation Mode
  if (navigationMode === 'topbar') {
    return (
      <NavigationContext.Provider value={{ mode: navigationMode, setMode: setNavigationMode }}>
        <TopNavigation>
          <div className="container py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && (
                  <p className="text-muted-foreground mt-1">{description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {actions}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleNavigationMode}
                      className="h-9 w-9"
                      aria-label="Mudar para menu lateral"
                    >
                      <PanelLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Menu lateral</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </TopNavigation>
      </NavigationContext.Provider>
    );
  }

  // Sidebar Navigation Mode (Default)
  return (
    <NavigationContext.Provider value={{ mode: navigationMode, setMode: setNavigationMode }}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-screen overflow-y-auto">
          <header className="sticky top-0 z-20 flex h-14 sm:h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 px-3 sm:px-6 safe-top">
            <SidebarTrigger className="-ml-1 tap-target" />
            <Separator orientation="vertical" className="mr-2 h-4 hide-mobile" />
            <Breadcrumb className="flex-1 min-w-0">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold truncate text-base sm:text-lg">{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {actions}
              <BackgroundJobsMonitor />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleNavigationMode}
                    className="h-9 w-9 hidden sm:flex"
                    aria-label="Mudar para menu no topo"
                  >
                    <PanelTop className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Menu no topo</TooltipContent>
              </Tooltip>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="tap-target h-9 w-9"
                aria-label="Alternar tema"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in safe-bottom">
            {description && (
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">{description}</p>
            )}
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </NavigationContext.Provider>
  );
}
