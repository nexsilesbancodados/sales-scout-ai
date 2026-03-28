import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Flame, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntentBadgeProps {
  messages?: Array<{ content: string; sender_type: string }>;
  compact?: boolean;
}

const POSITIVE_KEYWORDS = [
  'quanto custa', 'como funciona', 'quero', 'preciso', 'quando começa',
  'tem disponibilidade', 'pode me mandar', 'me interessei', 'gostei',
  'vamos agendar', 'pode ser', 'manda mais', 'qual o valor', 'preço',
  'orçamento', 'proposta', 'fechar', 'contratar', 'aceito',
  'me liga', 'me chama', 'quero saber mais', 'estou interessado',
];

export function calculateIntentScore(messages?: Array<{ content: string; sender_type: string }>): number {
  if (!messages || messages.length === 0) return 0;

  const leadMessages = messages
    .filter(m => m.sender_type === 'lead')
    .map(m => m.content.toLowerCase());

  if (leadMessages.length === 0) return 0;

  let score = 0;
  const recentMessages = leadMessages.slice(-10); // Last 10 messages

  recentMessages.forEach((msg, index) => {
    const recencyMultiplier = 1 + (index / recentMessages.length) * 0.5;
    
    POSITIVE_KEYWORDS.forEach(keyword => {
      if (msg.includes(keyword)) {
        score += 10 * recencyMultiplier;
      }
    });
  });

  // Bonus for response count
  if (leadMessages.length >= 5) score += 10;
  if (leadMessages.length >= 10) score += 10;

  return Math.min(100, Math.round(score));
}

export function IntentBadge({ messages, compact = false }: IntentBadgeProps) {
  const score = calculateIntentScore(messages);
  
  if (score === 0) return null;

  let label: string;
  let className: string;
  let icon: React.ReactNode;

  if (score >= 81) {
    label = '🔥 Muito quente';
    className = 'bg-red-500/10 text-red-600 border-red-500/30 animate-pulse';
    icon = <Flame className="h-3 w-3" />;
  } else if (score >= 61) {
    label = 'Quente';
    className = 'bg-orange-500/10 text-orange-600 border-orange-500/30';
    icon = <Flame className="h-3 w-3" />;
  } else if (score >= 31) {
    label = 'Morno';
    className = 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
    icon = <Thermometer className="h-3 w-3" />;
  } else {
    label = 'Frio';
    className = 'bg-muted text-muted-foreground';
    icon = <Thermometer className="h-3 w-3" />;
  }

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className={cn('text-xs px-1.5', className)}>
            {icon}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Intenção de compra: {label} ({score}%)</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Badge variant="outline" className={cn('text-xs gap-1', className)}>
      {icon}
      {label}
    </Badge>
  );
}
