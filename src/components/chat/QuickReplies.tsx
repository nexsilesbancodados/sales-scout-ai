import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Zap,
  Calendar,
  DollarSign,
  HandshakeIcon,
  HelpCircle,
  Clock,
  Plus,
  Loader2,
} from 'lucide-react';

interface QuickReply {
  id: string;
  label: string;
  icon: React.ReactNode;
  message: string;
  category: 'general' | 'sales' | 'scheduling' | 'custom';
}

const defaultQuickReplies: QuickReply[] = [
  {
    id: 'greeting',
    label: 'Saudação',
    icon: <HandshakeIcon className="h-3 w-3" />,
    message: 'Olá! Tudo bem? 😊 Em que posso ajudar hoje?',
    category: 'general',
  },
  {
    id: 'pricing',
    label: 'Preço',
    icon: <DollarSign className="h-3 w-3" />,
    message: 'Sobre valores, temos opções que cabem no seu orçamento. Posso te explicar melhor nossos planos?',
    category: 'sales',
  },
  {
    id: 'schedule',
    label: 'Agendar',
    icon: <Calendar className="h-3 w-3" />,
    message: 'Perfeito! Qual o melhor dia e horário para conversarmos? Tenho disponibilidade essa semana.',
    category: 'scheduling',
  },
  {
    id: 'followup',
    label: 'Follow-up',
    icon: <Clock className="h-3 w-3" />,
    message: 'Olá! Passando para saber se teve chance de analisar nossa proposta. Ficou alguma dúvida?',
    category: 'sales',
  },
  {
    id: 'question',
    label: 'Dúvidas',
    icon: <HelpCircle className="h-3 w-3" />,
    message: 'Entendo sua dúvida! Deixa eu explicar melhor...',
    category: 'general',
  },
];

interface QuickRepliesProps {
  onSelectReply: (message: string) => void;
  leadName?: string;
}

export function QuickReplies({ onSelectReply, leadName }: QuickRepliesProps) {
  const { toast } = useToast();
  const [customReplies, setCustomReplies] = useState<QuickReply[]>([]);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const allReplies = [...defaultQuickReplies, ...customReplies];

  const handleSelectReply = (reply: QuickReply) => {
    // Replace variables in message
    let message = reply.message;
    if (leadName) {
      message = message.replace('{nome}', leadName.split(' ')[0]);
    }
    onSelectReply(message);
  };

  const handleAddCustomReply = () => {
    if (!newLabel.trim() || !newMessage.trim()) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    const newReply: QuickReply = {
      id: `custom-${Date.now()}`,
      label: newLabel,
      icon: <Zap className="h-3 w-3" />,
      message: newMessage,
      category: 'custom',
    };

    setCustomReplies([...customReplies, newReply]);
    setNewLabel('');
    setNewMessage('');
    setIsAddingCustom(false);
    toast({ title: 'Resposta rápida adicionada!' });
  };

  return (
    <div className="border-t bg-muted/30 p-2">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">Respostas Rápidas</span>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2">
          {allReplies.map((reply) => (
            <Button
              key={reply.id}
              variant="outline"
              size="sm"
              className="shrink-0 gap-1"
              onClick={() => handleSelectReply(reply)}
            >
              {reply.icon}
              {reply.label}
            </Button>
          ))}
          
          <Popover open={isAddingCustom} onOpenChange={setIsAddingCustom}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="shrink-0">
                <Plus className="h-3 w-3 mr-1" />
                Criar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="label">Nome do botão</Label>
                  <Input
                    id="label"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Ex: Promoção"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite a mensagem..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {'{nome}'} para inserir o nome do lead
                  </p>
                </div>
                <Button onClick={handleAddCustomReply} className="w-full">
                  Adicionar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
