import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Video, Check, Loader2, ExternalLink, Info } from 'lucide-react';

export function MeetingSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [meetLink, setMeetLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('google_meet_link')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data?.google_meet_link) {
          setMeetLink(data.google_meet_link);
        }
      } catch (error) {
        console.error('Error loading meet link:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;

    // Validate URL format
    if (meetLink && !meetLink.includes('meet.google.com')) {
      toast({
        title: 'Link inválido',
        description: 'Por favor, insira um link válido do Google Meet.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ google_meet_link: meetLink || null })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: '✓ Link salvo',
        description: meetLink 
          ? 'Seu link do Google Meet foi configurado. Ele será enviado automaticamente ao agendar reuniões.'
          : 'Link do Google Meet removido.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    setMeetLink('');
    await handleSave();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Reuniões Online
        </CardTitle>
        <CardDescription>
          Configure o link da sua sala do Google Meet para ser enviado automaticamente ao agendar reuniões
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-info/20 bg-info/5">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Como criar uma sala fixa do Google Meet:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Acesse <a href="https://meet.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">meet.google.com</a></li>
              <li>Clique em "Nova reunião" → "Criar uma reunião para mais tarde"</li>
              <li>Copie o link gerado (ex: meet.google.com/abc-defg-hij)</li>
              <li>Cole o link no campo abaixo</li>
            </ol>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="meet-link">Link do Google Meet</Label>
          <div className="flex gap-2">
            <Input
              id="meet-link"
              placeholder="https://meet.google.com/abc-defg-hij"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Este link será enviado automaticamente quando o agente agendar uma reunião pelo WhatsApp.
          </p>
        </div>

        {meetLink && (
          <div className="flex items-center gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(meetLink, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Testar link
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClear}
              className="text-destructive hover:text-destructive"
            >
              Remover link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}