import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard, Target, Send, Users, MessageSquare, BarChart3,
  Shield, Settings, Bot, Calendar, Zap, FileText, Globe, Upload,
  Instagram, Facebook, Mail, Clock, FlaskConical, Columns3,
  Bell, CreditCard, Code, Search,
} from 'lucide-react';

interface CommandRoute {
  label: string;
  icon: React.ReactNode;
  path: string;
  group: string;
  keywords?: string;
}

const routes: CommandRoute[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, path: '/dashboard', group: 'Principal', keywords: 'inicio home' },
  { label: 'Prospecção', icon: <Target className="h-4 w-4" />, path: '/prospecting', group: 'Captura', keywords: 'buscar leads capturar' },
  { label: 'Google Maps', icon: <Globe className="h-4 w-4" />, path: '/google-maps', group: 'Captura', keywords: 'mapa empresas' },
  { label: 'Pesquisa Web', icon: <Search className="h-4 w-4" />, path: '/web-search', group: 'Captura' },
  { label: 'Instagram Extractor', icon: <Instagram className="h-4 w-4" />, path: '/instagram-extractor', group: 'Captura' },
  { label: 'Facebook Extractor', icon: <Facebook className="h-4 w-4" />, path: '/facebook-extractor', group: 'Captura' },
  { label: 'CNPJ Radar', icon: <FileText className="h-4 w-4" />, path: '/cnpj-radar', group: 'Captura' },
  { label: 'Email Finder', icon: <Mail className="h-4 w-4" />, path: '/email-finder', group: 'Captura' },
  { label: 'Importar Leads', icon: <Upload className="h-4 w-4" />, path: '/import-leads', group: 'Captura' },
  { label: 'Disparo em Massa', icon: <Send className="h-4 w-4" />, path: '/mass-send', group: 'Disparo', keywords: 'enviar mensagem' },
  { label: 'Campanhas', icon: <Zap className="h-4 w-4" />, path: '/campaigns', group: 'Disparo' },
  { label: 'Templates', icon: <FileText className="h-4 w-4" />, path: '/templates', group: 'Disparo' },
  { label: 'A/B Testing', icon: <FlaskConical className="h-4 w-4" />, path: '/ab-testing', group: 'Disparo' },
  { label: 'Leads', icon: <Users className="h-4 w-4" />, path: '/leads', group: 'CRM', keywords: 'contatos clientes' },
  { label: 'Pipeline', icon: <Columns3 className="h-4 w-4" />, path: '/crm/pipeline', group: 'CRM', keywords: 'funil kanban' },
  { label: 'Conversas', icon: <MessageSquare className="h-4 w-4" />, path: '/conversations', group: 'CRM', keywords: 'chat whatsapp' },
  { label: 'Reuniões', icon: <Calendar className="h-4 w-4" />, path: '/meetings', group: 'CRM' },
  { label: 'Follow-up', icon: <Clock className="h-4 w-4" />, path: '/follow-up', group: 'Automação' },
  { label: 'Automações', icon: <Zap className="h-4 w-4" />, path: '/automations', group: 'Automação' },
  { label: 'Agente SDR', icon: <Bot className="h-4 w-4" />, path: '/sdr-agent', group: 'Automação' },
  { label: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, path: '/analytics', group: 'Ferramentas' },
  { label: 'Anti-Ban', icon: <Shield className="h-4 w-4" />, path: '/antiban', group: 'Ferramentas' },
  { label: 'Configurações', icon: <Settings className="h-4 w-4" />, path: '/settings', group: 'Sistema', keywords: 'config preferencias' },
  { label: 'Notificações', icon: <Bell className="h-4 w-4" />, path: '/settings/notifications', group: 'Sistema' },
  { label: 'Billing', icon: <CreditCard className="h-4 w-4" />, path: '/billing', group: 'Sistema', keywords: 'plano assinatura pagamento' },
  { label: 'API Reference', icon: <Code className="h-4 w-4" />, path: '/api-reference', group: 'Sistema' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((path: string) => {
    setOpen(false);
    navigate(path);
  }, [navigate]);

  const groups = [...new Set(routes.map(r => r.group))];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar páginas, ações..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        {groups.map((group, i) => (
          <div key={group}>
            {i > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {routes.filter(r => r.group === group).map((route) => (
                <CommandItem
                  key={route.path}
                  value={`${route.label} ${route.keywords || ''}`}
                  onSelect={() => handleSelect(route.path)}
                  className="gap-2 cursor-pointer"
                >
                  {route.icon}
                  <span>{route.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
