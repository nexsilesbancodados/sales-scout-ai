import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Loader2, Sparkles, Send, Copy, RefreshCw } from 'lucide-react';

interface AIReplyButtonProps {
  leadId: string;
  lastMessage?: string;
  onUseReply: (message: string) => void;
}

export function AIReplyButton({ leadId, lastMessage, onUseReply }: AIReplyButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReply, setGeneratedReply] = useState('');

  const generateReply = async () => {
    if (!lastMessage) {
      toast({ title: 'Sem mensagem para responder', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setGeneratedReply('');

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-ai-reply', {
        body: {
          lead_id: leadId,
          message_content: lastMessage,
          auto_reply_enabled: false,
        },
      });

      if (error) throw error;

      if (data?.success && data?.reply) {
        setGeneratedReply(data.reply);
      } else {
        throw new Error(data?.error || 'Erro ao gerar resposta');
      }
    } catch (error: any) {
      console.error('Error generating reply:', error);
      toast({ title: 'Erro ao gerar resposta', description: error.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseReply = () => {
    onUseReply(generatedReply);
    setIsOpen(false);
    setGeneratedReply('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReply);
    toast({ title: 'Copiado!' });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0" title="Gerar resposta com IA">
          <Bot className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Resposta Inteligente</h4>
          </div>

          {!generatedReply && !isGenerating && (
            <div className="text-center py-4">
              <Bot className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Clique para gerar uma resposta baseada no contexto da conversa
              </p>
              <Button onClick={generateReply} disabled={!lastMessage}>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Resposta
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Analisando contexto e gerando resposta...
              </p>
            </div>
          )}

          {generatedReply && !isGenerating && (
            <div className="space-y-3">
              <Textarea
                value={generatedReply}
                onChange={(e) => setGeneratedReply(e.target.value)}
                rows={5}
                className="resize-none"
              />
              <div className="flex gap-2">
                <Button onClick={generateReply} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerar
                </Button>
                <Button onClick={handleCopy} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar
                </Button>
                <Button onClick={handleUseReply} size="sm" className="flex-1">
                  <Send className="h-4 w-4 mr-1" />
                  Usar
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
