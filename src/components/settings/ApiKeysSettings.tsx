import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  Mail,
  Zap,
} from 'lucide-react';

export function ApiKeysSettings() {
  const { user } = useAuth();
  const { settings, isLoading, updateSettings, isUpdating } = useUserSettings();
  const { toast } = useToast();
  
  const [deepseekKey, setDeepseekKey] = useState('');
  const [serpApiKey, setSerpApiKey] = useState('');
  const [serperKey, setSerperKey] = useState('');
  const [hunterKey, setHunterKey] = useState('');
  const [preferredApi, setPreferredApi] = useState<'serper' | 'serpapi'>('serper');
  const [showDeepseek, setShowDeepseek] = useState(false);
  const [showSerpApi, setShowSerpApi] = useState(false);
  const [showSerper, setShowSerper] = useState(false);
  const [showHunter, setShowHunter] = useState(false);
  const [testingDeepseek, setTestingDeepseek] = useState(false);
  const [testingSerpApi, setTestingSerpApi] = useState(false);
  const [testingSerper, setTestingSerper] = useState(false);
  const [testingHunter, setTestingHunter] = useState(false);
  const [deepseekStatus, setDeepseekStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');
  const [serpApiStatus, setSerpApiStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');
  const [serperStatus, setSerperStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');
  const [hunterStatus, setHunterStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');

  // Load existing keys (masked)
  useEffect(() => {
    if (settings) {
      // Show masked version if key exists
      const deepseek = (settings as any).deepseek_api_key;
      const serp = (settings as any).serpapi_api_key;
      const serper = (settings as any).serper_api_key;
      const hunter = (settings as any).hunter_api_token;
      const preferred = (settings as any).preferred_search_api || 'serper';
      
      if (deepseek) {
        setDeepseekKey('••••••••••••••••' + deepseek.slice(-4));
        setDeepseekStatus('valid');
      }
      if (serp) {
        setSerpApiKey('••••••••••••••••' + serp.slice(-4));
        setSerpApiStatus('valid');
      }
      if (serper) {
        setSerperKey('••••••••••••••••' + serper.slice(-4));
        setSerperStatus('valid');
      }
      if (hunter) {
        setHunterKey('••••••••••••••••' + hunter.slice(-4));
        setHunterStatus('valid');
      }
      setPreferredApi(preferred);
    }
  }, [settings]);

  const handleSaveDeepseek = async () => {
    if (!deepseekKey || deepseekKey.includes('••••')) {
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
        .update({ deepseek_api_key: deepseekKey })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: '✓ Chave DeepSeek salva',
        description: 'Sua chave de API do Gemini foi salva com segurança.',
      });
      
      setDeepseekKey('••••••••••••••••' + deepseekKey.slice(-4));
      setDeepseekStatus('valid');
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

  const handleSaveSerper = async () => {
    if (!serperKey || serperKey.includes('••••')) {
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
        .update({ serper_api_key: serperKey })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: '✓ Chave Serper.dev salva',
        description: 'Sua chave de API do Serper.dev foi salva com segurança.',
      });
      
      setSerperKey('••••••••••••••••' + serperKey.slice(-4));
      setSerperStatus('valid');
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSavePreferredApi = async (value: 'serper' | 'serpapi') => {
    setPreferredApi(value);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ preferred_search_api: value })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: '✓ Preferência salva',
        description: `API de busca preferida: ${value === 'serper' ? 'Serper.dev' : 'SerpAPI'}`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const testDeepseekKey = async () => {
    if (!deepseekKey || deepseekKey.includes('••••')) {
      toast({
        title: 'Digite uma chave',
        description: 'Insira uma nova chave para testar.',
        variant: 'destructive',
      });
      return;
    }

    setTestingDeepseek(true);
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Olá' }],
          max_tokens: 5,
        }),
      });
      if (response.ok) {
        setDeepseekStatus('valid');
        toast({
          title: '✓ Chave válida',
          description: 'Sua chave da DeepSeek está funcionando!',
        });
      } else {
        setDeepseekStatus('invalid');
        toast({
          title: 'Chave inválida',
          description: 'A chave da DeepSeek não é válida.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setDeepseekStatus('invalid');
      toast({
        title: 'Erro ao testar',
        description: 'Não foi possível validar a chave.',
        variant: 'destructive',
      });
    } finally {
      setTestingDeepseek(false);
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

  const testSerperKey = async () => {
    if (!serperKey || serperKey.includes('••••')) {
      toast({
        title: 'Digite uma chave',
        description: 'Insira uma nova chave para testar.',
        variant: 'destructive',
      });
      return;
    }

    setTestingSerper(true);
    try {
      // Test Serper.dev API with a simple search
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': serperKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: 'test',
          num: 1,
        }),
      });
      
      if (response.ok) {
        setSerperStatus('valid');
        toast({
          title: '✓ Chave válida',
          description: 'Serper.dev está funcionando!',
        });
      } else {
        setSerperStatus('invalid');
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: 'Chave inválida',
          description: errorData.message || 'A chave do Serper.dev não é válida.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setSerperStatus('invalid');
      toast({
        title: 'Erro ao testar',
        description: 'Não foi possível validar a chave.',
        variant: 'destructive',
      });
    } finally {
      setTestingSerper(false);
    }
  };

  const clearDeepseekKey = async () => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ deepseek_api_key: null })
        .eq('user_id', user?.id);

      if (error) throw error;

      setDeepseekKey('');
      setDeepseekStatus('unknown');
      toast({ title: 'Chave DeepSeek removida' });
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

  const clearSerperKey = async () => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ serper_api_key: null })
        .eq('user_id', user?.id);

      if (error) throw error;

      setSerperKey('');
      setSerperStatus('unknown');
      toast({ title: 'Chave Serper.dev removida' });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleSaveHunter = async () => {
    if (!hunterKey || hunterKey.includes('••••')) {
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
        .update({ hunter_api_token: hunterKey })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: '✓ Chave Hunter salva',
        description: 'Sua chave de API do Hunter.io foi salva com segurança.',
      });
      
      setHunterKey('••••••••••••••••' + hunterKey.slice(-4));
      setHunterStatus('valid');
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const testHunterKey = async () => {
    if (!hunterKey || hunterKey.includes('••••')) {
      toast({
        title: 'Digite uma chave',
        description: 'Insira uma nova chave para testar.',
        variant: 'destructive',
      });
      return;
    }

    setTestingHunter(true);
    try {
      const response = await fetch(`https://api.hunter.io/v2/account?api_key=${hunterKey}`);
      
      if (response.ok) {
        const data = await response.json();
        setHunterStatus('valid');
        toast({
          title: '✓ Chave válida',
          description: `Hunter.io ativo! ${data.data?.requests?.searches?.available || 0} buscas disponíveis.`,
        });
      } else {
        setHunterStatus('invalid');
        toast({
          title: 'Chave inválida',
          description: 'A chave do Hunter.io não é válida.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setHunterStatus('invalid');
      toast({
        title: 'Erro ao testar',
        description: 'Não foi possível validar a chave.',
        variant: 'destructive',
      });
    } finally {
      setTestingHunter(false);
    }
  };

  const clearHunterKey = async () => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ hunter_api_token: null })
        .eq('user_id', user?.id);

      if (error) throw error;

      setHunterKey('');
      setHunterStatus('unknown');
      toast({ title: 'Chave Hunter removida' });
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

      {/* API de Busca Preferida */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            API de Busca Preferida
          </CardTitle>
          <CardDescription>
            Escolha qual API usar para buscar leads no Google Maps e Google Search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={preferredApi}
            onValueChange={(value) => handleSavePreferredApi(value as 'serper' | 'serpapi')}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="serper" id="serper" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="serper" className="cursor-pointer font-medium flex items-center gap-2">
                  Serper.dev
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                    Recomendado
                  </Badge>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>2.500 buscas grátis/mês</strong> • Mais rápido (1-2s)
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="serpapi" id="serpapi" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="serpapi" className="cursor-pointer font-medium">
                  SerpAPI
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>100 buscas grátis/mês</strong> • Mais estabelecido
                </p>
              </div>
            </div>
          </RadioGroup>
          <p className="text-xs text-muted-foreground mt-3">
            💡 Se a API preferida falhar, o sistema tentará automaticamente a outra como fallback.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Serper.dev API Key */}
        <Card className={preferredApi === 'serper' ? 'ring-2 ring-primary/50' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-green-500" />
              Serper.dev
              {preferredApi === 'serper' && (
                <Badge variant="default" className="bg-primary">
                  Preferida
                </Badge>
              )}
              {serperStatus === 'valid' && (
                <Badge variant="default" className="bg-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  Configurada
                </Badge>
              )}
              {serperStatus === 'invalid' && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Inválida
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              API rápida para buscar leads no Google • 2.500 buscas grátis/mês
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Chave de API do Serper.dev</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showSerper ? 'text' : 'password'}
                    placeholder="Sua chave Serper.dev..."
                    value={serperKey}
                    onChange={(e) => {
                      setSerperKey(e.target.value);
                      setSerperStatus('unknown');
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowSerper(!showSerper)}
                  >
                    {showSerper ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testSerperKey}
                disabled={testingSerper || !serperKey}
              >
                {testingSerper ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Testar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveSerper}
                disabled={!serperKey || serperKey.includes('••••')}
              >
                <Key className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              {serperStatus === 'valid' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSerperKey}
                  className="text-destructive"
                >
                  Remover
                </Button>
              )}
            </div>

            <div className="pt-2 border-t">
              <a
                href="https://serper.dev/api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Obter chave no Serper.dev (grátis)
              </a>
            </div>
          </CardContent>
        </Card>

        {/* DeepSeek API Key */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              DeepSeek API
              {deepseekStatus === 'valid' && (
                <Badge variant="default" className="bg-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  Configurada
                </Badge>
              )}
              {deepseekStatus === 'invalid' && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Inválida
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Usada para personalizar mensagens, gerar respostas automáticas e insights de prospecção
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Chave de API da DeepSeek</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showDeepseek ? 'text' : 'password'}
                    placeholder="sk-..."
                    value={deepseekKey}
                    onChange={(e) => {
                      setDeepseekKey(e.target.value);
                      setDeepseekStatus('unknown');
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowDeepseek(!showDeepseek)}
                  >
                    {showDeepseek ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testDeepseekKey}
                disabled={testingDeepseek || !deepseekKey}
              >
                {testingDeepseek ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Testar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveDeepseek}
                disabled={!deepseekKey || deepseekKey.includes('••••')}
              >
                <Key className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              {deepseekStatus === 'valid' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearDeepseekKey}
                  className="text-destructive"
                >
                  Remover
                </Button>
              )}
            </div>

            <div className="pt-2 border-t">
              <a
                href="https://platform.deepseek.com/api_keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Obter chave na DeepSeek Platform
              </a>
            </div>
          </CardContent>
        </Card>

        {/* SerpAPI Key */}
        <Card className={preferredApi === 'serpapi' ? 'ring-2 ring-primary/50' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-orange-500" />
              SerpAPI
              {preferredApi === 'serpapi' && (
                <Badge variant="default" className="bg-primary">
                  Preferida
                </Badge>
              )}
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
              API alternativa para buscar leads no Google Maps • 100 buscas grátis/mês
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
        
        {/* Hunter.io API Key */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-500" />
              Hunter.io API
              {hunterStatus === 'valid' && (
                <Badge variant="default" className="bg-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  Configurada
                </Badge>
              )}
              {hunterStatus === 'invalid' && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Inválida
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Usada para descobrir e verificar emails profissionais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Chave de API do Hunter.io</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showHunter ? 'text' : 'password'}
                    placeholder="Sua chave Hunter.io..."
                    value={hunterKey}
                    onChange={(e) => {
                      setHunterKey(e.target.value);
                      setHunterStatus('unknown');
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowHunter(!showHunter)}
                  >
                    {showHunter ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testHunterKey}
                disabled={testingHunter || !hunterKey}
              >
                {testingHunter ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Testar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveHunter}
                disabled={!hunterKey || hunterKey.includes('••••')}
              >
                <Key className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              {hunterStatus === 'valid' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHunterKey}
                  className="text-destructive"
                >
                  Remover
                </Button>
              )}
            </div>

            <div className="pt-2 border-t">
              <a
                href="https://hunter.io/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Obter chave no Hunter.io
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
            <strong>• Serper.dev:</strong> API recomendada para buscar empresas no Google.
            O plano gratuito oferece 2.500 buscas por mês.
          </p>
          <p>
            <strong>• Gemini API:</strong> Usada para personalizar mensagens de prospecção com IA. 
            O plano gratuito oferece 15 requisições por minuto.
          </p>
          <p>
            <strong>• SerpAPI:</strong> Alternativa para buscar empresas no Google Maps.
            O plano gratuito oferece 100 buscas por mês.
          </p>
          <p>
            <strong>• Hunter.io:</strong> Usada para descobrir e verificar emails profissionais.
            O plano gratuito oferece 25 buscas por mês.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
