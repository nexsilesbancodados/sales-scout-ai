import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Kanban,
  Users,
  CalendarDays,
  BarChart3,
  Megaphone,
} from 'lucide-react';

const crmNavItems = [
  { title: 'Pipeline', icon: Kanban, path: '/crm/pipeline' },
  { title: 'Contatos', icon: Users, path: '/crm/contacts' },
  { title: 'Atividades', icon: CalendarDays, path: '/crm/activities' },
  { title: 'Analytics', icon: BarChart3, path: '/crm/analytics' },
  { title: 'Meta Ads', icon: Megaphone, path: '/crm/meta-ads' },
];

interface CRMLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function CRMLayout({ children, title, description, actions }: CRMLayoutProps) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center border-b bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-2 flex-1 px-4 sm:px-6">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
            <Separator orientation="vertical" className="mx-2 h-4 hidden sm:block" />
            <span className="font-semibold text-sm truncate">{title}</span>
            <div className="ml-auto flex items-center gap-2">{actions}</div>
          </div>
        </header>

        {/* CRM Sub-navigation */}
        <nav className="border-b bg-background/50 px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {crmNavItems.map((item) => {
              const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          {description && (
            <p className="text-muted-foreground mb-4 text-sm">{description}</p>
          )}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
