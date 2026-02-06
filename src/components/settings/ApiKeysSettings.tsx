import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useUserSettings } from '@/hooks/use-user-settings';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import {
  Key,
  Eye,
  EyeOff,
  Check,
  Loader2,
  ExternalLink,
  Shield,
  Sparkles,
  Search,
  AlertCircle,
  Info,
} from 'lucide-react';

export function ApiKeysSettings() {
  const { user } = useAuth();
  const { settings, isLoading, updateSettings, isUpdating } = useUserSettings();
  const { toast } = useToast();
  
  const [geminiKey, setGeminiKey] = useState('');
  const [serpApiKey, setSerpApiKey] = useState('');
  const [showGemini, setShowGemini] = useState(false);
  const [showSerpApi, setShowSerpApi] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [testingSerpApi, setTestingSerpApi] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');
  const [serpApiStatus, setSerpApiStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');

  // Load existing keys (masked)
  useEffect(() => {
    if (settings) {
      // Show masked version if key exists
      const gemini = (settings as any).gemini_api_key;
      const serp = (settings as any).serpapi_api_key;
      
      if (gemini) {
        setGeminiKey('••••••••••••••••' + gemini.slice(-4));
        setGeminiStatus('valid');
      }
      if (serp) {
        setSerpApiKey('••••••••••••••••' + serp.slice(-4));
        setSerpApiStatus('valid');
      }
    }
  }, [settings]);

  const handleSaveGemini = async () => {
    if (!geminiKey || geminiKey.includes('••••')) {
      toast({
        title: 'Chave inválida',
        description: 'Digite uma chave de API válida.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ gemini_api_key: geminiKey })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: '✓ Chave Gemini salva',
        description: 'Sua chave de API do Gemini foi salva com segurança.',
      });
      
      setGeminiKey('••••••••••••••••' + geminiKey.slice(-4));
      setGeminiStatus('valid');
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveSerpApi = async () => {
    if (!serpApiKey || serpApiKey.includes('••••')) {
      toast({
        title: 'Chave inválida',
        description: 'Digite uma chave de API válida.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ serpapi_api_key: serpApiKey })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: '✓ Chave SerpAPI salva',
        description: 'Sua chave de API do SerpAPI foi salva com segurança.',
      });
      
      setSerpApiKey('••••••••••••••••' + serpApiKey.slice(-4));
      setSerpApiStatus('valid');
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const testGeminiKey = async () => {
    if (!geminiKey || geminiKey.includes('••••')) {
      toast({
        title: 'Digite uma chave',
        description: 'Insira uma nova chave para testar.',
        variant: 'destructive',
      });
      return;
    }

    setTestingGemini(true);
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + geminiKey);
      
      if (response.ok) {
        setGeminiStatus('valid');
        toast({
          title: '✓ Chave válida',
          description: 'Sua chave do Gemini está funcionando!',
        });
      } else {
        setGeminiStatus('invalid');
        toast({
          title: 'Chave inválida',
          description: 'A chave do Gemini não é válida.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setGeminiStatus('invalid');
      toast({
        title: 'Erro ao testar',
        description: 'Não foi possível validar a chave.',
        variant: 'destructive',
      });
    } finally {
      setTestingGemini(false);
    }
  };

  const testSerpApiKey = async () => {
    if (!serpApiKey || serpApiKey.includes('••••')) {
      toast({
        title: 'Digite uma chave',
        description: 'Insira uma nova chave para testar.',
        variant: 'destructive',
      });
      return;
    }

    setTestingSerpApi(true);
    try {
      const response = await fetch(`https://serpapi.com/account.json?api_key=${serpApiKey}`);
      
      if (response.ok) {
        const data = await response.json();
        setSerpApiStatus('valid');
        toast({
          title: '✓ Chave válida',
          description: `SerpAPI ativo! ${data.searches_remaining || 0} buscas restantes.`,
        });
      } else {
        setSerpApiStatus('invalid');
        toast({
          title: 'Chave inválida',
          description: 'A chave do SerpAPI não é válida.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setSerpApiStatus('invalid');
      toast({
        title: 'Erro ao testar',
        description: 'Não foi possível validar a chave.',
        variant: 'destructive',
      });
    } finally {
      setTestingSerpApi(false);
    }
  };

  const clearGeminiKey = async () => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ gemini_api_key: null })
        .eq('user_id', user?.id);

      if (error) throw error;

      setGeminiKey('');
      setGeminiStatus('unknown');
      toast({ title: 'Chave Gemini removida' });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const clearSerpApiKey = async () => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ serpapi_api_key: null })
        .eq('user_id', user?.id);

      if (error) throw error;

      setSerpApiKey('');
      setSerpApiStatus('unknown');
      toast({ title: 'Chave SerpAPI removida' });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4" />
        <AlertTitle>Suas chaves são privadas</AlertTitle>
        <AlertDescription>
          Cada usuário deve configurar suas próprias chaves de API. 
          Elas são armazenadas de forma segura e usadas apenas para suas operações.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gemini API Key */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Google Gemini API
              {geminiStatus === 'valid' && (
                <Badge variant="default" className="bg-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  Configurada
                </Badge>
              )}
              {geminiStatus === 'invalid' && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Inválida
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Usada para personalização de mensagens com IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Chave de API do Gemini</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showGemini ? 'text' : 'password'}
                    placeholder="AIza..."
                    value={geminiKey}
                    onChange={(e) => {
                      setGeminiKey(e.target.value);
                      setGeminiStatus('unknown');
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowGemini(!showGemini)}
                  >
                    {showGemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testGeminiKey}
                disabled={testingGemini || !geminiKey}
              >
                {testingGemini ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Testar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveGemini}
                disabled={!geminiKey || geminiKey.includes('••••')}
              >
                <Key className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              {geminiStatus === 'valid' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearGeminiKey}
                  className="text-destructive"
                >
                  Remover
                </Button>
              )}
            </div>

            <div className="pt-2 border-t">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Obter chave no Google AI Studio
              </a>
            </div>
          </CardContent>
        </Card>

        {/* SerpAPI Key */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-orange-500" />
              SerpAPI
              {serpApiStatus === 'valid' && (
                <Badge variant="default" className="bg-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  Configurada
                </Badge>
              )}
              {serpApiStatus === 'invalid' && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Inválida
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Usada para buscar leads no Google Maps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Chave de API do SerpAPI</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showSerpApi ? 'text' : 'password'}
                    placeholder="Sua chave SerpAPI..."
                    value={serpApiKey}
                    onChange={(e) => {
                      setSerpApiKey(e.target.value);
                      setSerpApiStatus('unknown');
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowSerpApi(!showSerpApi)}
                  >
                    {showSerpApi ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testSerpApiKey}
                disabled={testingSerpApi || !serpApiKey}
              >
                {testingSerpApi ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Testar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveSerpApi}
                disabled={!serpApiKey || serpApiKey.includes('••••')}
              >
                <Key className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              {serpApiStatus === 'valid' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSerpApiKey}
                  className="text-destructive"
                >
                  Remover
                </Button>
              )}
            </div>

            <div className="pt-2 border-t">
              <a
                href="https://serpapi.com/manage-api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Obter chave no SerpAPI
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert variant="default">
        <Info className="h-4 w-4" />
        <AlertTitle>Por que preciso das minhas próprias chaves?</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>
            <strong>• Gemini API:</strong> Usada para personalizar mensagens de prospecção com IA. 
            O plano gratuito oferece 15 requisições por minuto.
          </p>
          <p>
            <strong>• SerpAPI:</strong> Usada para buscar empresas no Google Maps.
            O plano gratuito oferece 100 buscas por mês.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
