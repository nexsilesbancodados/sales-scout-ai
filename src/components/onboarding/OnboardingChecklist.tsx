import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useLeads } from '@/hooks/use-leads';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Circle,
  Phone,
  Bot,
  Target,
  MessageSquare,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  action?: {
    label: string;
    href: string;
  };
}

interface OnboardingChecklistProps {
  onDismiss?: () => void;
}

export function OnboardingChecklist({ onDismiss }: OnboardingChecklistProps) {
  const { settings } = useUserSettings();
  const { leads } = useLeads();

  const checklist: ChecklistItem[] = useMemo(() => [
    {
      id: 'whatsapp',
      title: 'Conectar WhatsApp',
      description: 'Vincule seu número para enviar mensagens',
      icon: <Phone className="h-5 w-5" />,
      completed: !!settings?.whatsapp_connected,
      action: { label: 'Conectar', href: '/settings?tab=conexao' },
    },
    {
      id: 'agent',
      title: 'Configurar Agente IA',
      description: 'Defina personalidade e base de conhecimento',
      icon: <Bot className="h-5 w-5" />,
      completed: !!(settings?.agent_name && settings?.knowledge_base),
      action: { label: 'Configurar', href: '/settings?tab=agente' },
    },
    {
      id: 'capture',
      title: 'Capturar Primeiro Lead',
      description: 'Busque leads no Google Maps',
      icon: <Target className="h-5 w-5" />,
      completed: leads.length > 0,
      action: { label: 'Capturar', href: '/prospecting?tab=capture' },
    },
    {
      id: 'send',
      title: 'Enviar Primeira Mensagem',
      description: 'Inicie uma conversa com um lead',
      icon: <MessageSquare className="h-5 w-5" />,
      completed: leads.some(l => l.message_sent),
      action: { label: 'Enviar', href: '/prospecting?tab=mass-send' },
    },
  ], [settings, leads]);

  const completedCount = checklist.filter(item => item.completed).length;
  const progress = (completedCount / checklist.length) * 100;
  const allComplete = completedCount === checklist.length;

  if (allComplete) {
    return null; // Hide when all complete
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Primeiros Passos</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {completedCount}/{checklist.length}
            </Badge>
            {onDismiss && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDismiss}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Complete estas etapas para começar a prospectar
        </CardDescription>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {checklist.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all",
              item.completed 
                ? "bg-green-500/10 border border-green-500/20" 
                : "bg-muted/50 border border-transparent hover:border-primary/20"
            )}
          >
            <div className={cn(
              "p-2 rounded-lg",
              item.completed ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"
            )}>
              {item.completed ? <CheckCircle2 className="h-5 w-5" /> : item.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-medium text-sm",
                item.completed && "line-through text-muted-foreground"
              )}>
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {item.description}
              </p>
            </div>

            {!item.completed && item.action && (
              <Button size="sm" variant="outline" asChild>
                <Link to={item.action.href}>
                  {item.action.label}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            )}
            
            {item.completed && (
              <Badge variant="default" className="bg-green-500 text-xs">
                ✓
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
