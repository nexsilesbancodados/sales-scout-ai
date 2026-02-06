import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Paperclip,
  Image,
  FileText,
  Mic,
  Video,
  Loader2,
  Send,
  X,
  StopCircle,
} from 'lucide-react';

interface MediaUploadProps {
  leadPhone: string;
  instanceId: string;
  onMediaSent: () => void;
}

export function MediaUpload({ leadPhone, instanceId, onMediaSent }: MediaUploadProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'document' | 'audio' | 'video' | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/ogg' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setRecordedAudio(base64.split(',')[1]); // Remove data:audio/ogg;base64, prefix
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({ title: 'Gravando áudio...', description: 'Clique em parar quando terminar' });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({ title: 'Erro ao gravar', description: 'Verifique as permissões do microfone', variant: 'destructive' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendMedia = async () => {
    if (!mediaType) return;

    if (mediaType !== 'audio' && !mediaUrl.trim()) {
      toast({ title: 'Insira a URL da mídia', variant: 'destructive' });
      return;
    }

    if (mediaType === 'audio' && !recordedAudio && !mediaUrl.trim()) {
      toast({ title: 'Grave um áudio ou insira uma URL', variant: 'destructive' });
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-media', {
        body: {
          phone: leadPhone,
          instance_id: instanceId,
          media_type: mediaType,
          media_url: mediaUrl || undefined,
          caption: caption || undefined,
          base64_audio: recordedAudio || undefined,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({ title: 'Mídia enviada com sucesso!' });
        onMediaSent();
        resetForm();
        setIsOpen(false);
      } else {
        throw new Error(data?.error || 'Erro ao enviar mídia');
      }
    } catch (error: any) {
      console.error('Error sending media:', error);
      toast({ title: 'Erro ao enviar mídia', description: error.message, variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setMediaType(null);
    setMediaUrl('');
    setCaption('');
    setRecordedAudio(null);
  };

  const mediaOptions = [
    { type: 'image' as const, icon: <Image className="h-4 w-4" />, label: 'Imagem' },
    { type: 'document' as const, icon: <FileText className="h-4 w-4" />, label: 'Documento' },
    { type: 'audio' as const, icon: <Mic className="h-4 w-4" />, label: 'Áudio' },
    { type: 'video' as const, icon: <Video className="h-4 w-4" />, label: 'Vídeo' },
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0">
          <Paperclip className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Enviar Mídia</h4>
            {mediaType && (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {!mediaType ? (
            <div className="grid grid-cols-2 gap-2">
              {mediaOptions.map((option) => (
                <Button
                  key={option.type}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => setMediaType(option.type)}
                >
                  {option.icon}
                  <span className="text-xs">{option.label}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {mediaType === 'audio' ? (
                <div className="space-y-2">
                  <Label>Gravar áudio</Label>
                  <div className="flex items-center gap-2">
                    {!isRecording && !recordedAudio && (
                      <Button onClick={startRecording} variant="outline" className="w-full">
                        <Mic className="h-4 w-4 mr-2" />
                        Gravar
                      </Button>
                    )}
                    {isRecording && (
                      <Button onClick={stopRecording} variant="destructive" className="w-full">
                        <StopCircle className="h-4 w-4 mr-2 animate-pulse" />
                        Parar Gravação
                      </Button>
                    )}
                    {recordedAudio && (
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-sm text-muted-foreground flex-1">Áudio gravado ✓</span>
                        <Button variant="ghost" size="sm" onClick={() => setRecordedAudio(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="text-center text-xs text-muted-foreground">ou</div>
                  <div className="space-y-1">
                    <Label>URL do áudio</Label>
                    <Input
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://..."
                      disabled={!!recordedAudio}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <Label>URL da {mediaType === 'image' ? 'imagem' : mediaType === 'document' ? 'documento' : 'vídeo'}</Label>
                  <Input
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}

              {mediaType !== 'audio' && (
                <div className="space-y-1">
                  <Label>Legenda (opcional)</Label>
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Descrição da mídia..."
                    rows={2}
                  />
                </div>
              )}

              <Button onClick={handleSendMedia} disabled={isSending} className="w-full">
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
