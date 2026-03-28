import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeads } from '@/hooks/use-leads';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Globe,
  Search,
  Loader2,
  Plus,
  Key,
  Info,
  ExternalLink,
  Phone,
  Mail,
  Link as LinkIcon,
  ChevronDown,
  Users,
  Save,
} from 'lucide-react';

interface InstagramProfile {
  username: string;
  fullName: string;
  biography: string;
  followersCount: number;
  profilePicUrl: string;
  externalUrl: string | null;
  phone: string | null;
  email: string | null;
  isBusinessAccount: boolean;
}

function formatFollowers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

export function InstagramExtractorTab() {
  const { createLead } = useLeads();
  const { settings, updateSettings } = useUserSettings();
  const { toast } = useToast();

  const [apifyToken, setApifyToken] = useState('');
  const [setupOpen, setSetupOpen] = useState(true);
  const [niche, setNiche] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState([30]);
  const [contactOnly, setContactOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<InstagramProfile[]>([]);

  // Check if token exists in settings
  const hasToken = !!(settings as any)?.apify_token;

  const handleSaveToken = () => {
    if (!apifyToken.trim()) {
      toast({ title: 'Token vazio', variant: 'destructive' });
      return;
    }
    updateSettings({ apify_token: apifyToken } as any);
    setSetupOpen(false);
  };

  const handleSearch = async () => {
    if (!niche.trim()) {
      toast({ title: 'Digite um nicho ou hashtag', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setProfiles([]);
    try {
      const { data, error } = await supabase.functions.invoke('instagram-scraper', {
        body: {
          niche: niche.trim(),
          location: location.trim(),
          quantity: quantity[0],
          contactOnly,
        },
      });

      if (error) throw error;

      const results: InstagramProfile[] = (data?.profiles || []).map((p: any) => ({
        username: p.username || p.ownerUsername || '',
        fullName: p.fullName || p.ownerFullName || '',
        biography: p.biography || p.caption || '',
        followersCount: p.followersCount || p.likesCount || 0,
        profilePicUrl: p.profilePicUrl || p.displayUrl || '',
        externalUrl: p.externalUrl || null,
        phone: p.businessPhoneNumber || p.phone || null,
        email: p.businessEmail || p.email || null,
        isBusinessAccount: p.isBusinessAccount || false,
      }));

      setProfiles(results);
      if (results.length === 0) {
        toast({ title: 'Nenhum perfil encontrado', description: 'Tente outro nicho ou localização.' });
      }
    } catch (err: any) {
      toast({ title: 'Erro na extração', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addProfileAsLead = (profile: InstagramProfile) => {
    createLead({
      business_name: profile.fullName || `@${profile.username}`,
      phone: profile.phone || '',
      email: profile.email || null,
      website: profile.externalUrl || `https://instagram.com/${profile.username}`,
      notes: profile.biography,
      niche: niche,
      source: 'instagram',
      stage: 'Contato',
      temperature: 'morno',
      message_sent: false,
      follow_up_count: 0,
      lead_score: 0,
      score_factors: {},
      analyzed_needs: {},
      tags: ['instagram'],
      quality_score: 0,
      reviews_count: 0,
      total_messages_exchanged: 0,
    } as any);
  };

  const importAllWithContact = () => {
    const withContact = profiles.filter(p => p.phone || p.email || p.externalUrl);
    withContact.forEach(addProfileAsLead);
    toast({ title: `${withContact.length} perfis importados como leads` });
  };

  if (!hasToken) {
    return (
      <div className="space-y-4">
        <Card className="border-dashed border-2">
          <CardContent className="pt-6">
            <div className="text-center py-8 space-y-4">
              <Key className="h-12 w-12 mx-auto text-muted-foreground opacity-40" />
              <div>
                <h3 className="text-lg font-semibold">Configure seu Token Apify</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  O Apify é necessário para extrair perfis do Instagram. Crie uma conta gratuita.
                </p>
              </div>
              <div className="flex gap-2 max-w-md mx-auto">
                <Input
                  type="password"
                  placeholder="Seu Apify Token..."
                  value={apifyToken}
                  onChange={e => setApifyToken(e.target.value)}
                />
                <Button onClick={handleSaveToken}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
              <a
                href="https://apify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Criar conta gratuita no Apify
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Collapsible open={setupOpen} onOpenChange={setSetupOpen}>
        <CollapsibleTrigger asChild>
          <Alert className="cursor-pointer border-primary/20 bg-primary/5">
            <Info className="h-4 w-4" />
            <AlertTitle className="flex items-center justify-between">
              Configuração Apify
              <ChevronDown className={`h-4 w-4 transition-transform ${setupOpen ? 'rotate-180' : ''}`} />
            </AlertTitle>
          </Alert>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2">
            <CardContent className="pt-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Atualizar Apify Token..."
                  value={apifyToken}
                  onChange={e => setApifyToken(e.target.value)}
                />
                <Button variant="outline" onClick={handleSaveToken}>
                  <Save className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Extrair Perfis do Instagram
          </CardTitle>
          <CardDescription>Encontre perfis de negócios por hashtag ou nicho</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hashtag ou Nicho</Label>
              <Input placeholder="Ex: restaurante, academia" value={niche} onChange={e => setNiche(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cidade/Região</Label>
              <Input placeholder="Ex: São Paulo" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quantidade de perfis: {quantity[0]}</Label>
            <Slider value={quantity} onValueChange={setQuantity} min={10} max={100} step={5} />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={contactOnly} onCheckedChange={setContactOnly} />
            <Label>Apenas perfis com contato (telefone/email/link)</Label>
          </div>

          <Button onClick={handleSearch} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Extrair Perfis do Instagram
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && profiles.length === 0 && niche && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Nenhum perfil encontrado. Tente outro nicho ou localização.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {profiles.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{profiles.length} perfis encontrados</p>
            <Button onClick={importAllWithContact} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Importar todos com contato
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profiles.map((profile) => (
              <Card key={profile.username} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile.profilePicUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(profile.fullName || profile.username)[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <a
                          href={`https://instagram.com/${profile.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          @{profile.username}
                        </a>
                        <span className="text-xs text-muted-foreground">
                          {formatFollowers(profile.followersCount)} seguidores
                        </span>
                      </div>
                      <p className="text-sm font-medium">{profile.fullName}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{profile.biography}</p>

                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {profile.phone && (
                          <Badge variant="secondary" className="text-xs">
                            <Phone className="h-3 w-3 mr-1" />
                            Telefone
                          </Badge>
                        )}
                        {profile.email && (
                          <Badge variant="secondary" className="text-xs">
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </Badge>
                        )}
                        {profile.externalUrl && (
                          <Badge variant="secondary" className="text-xs">
                            <LinkIcon className="h-3 w-3 mr-1" />
                            Link
                          </Badge>
                        )}
                      </div>

                      <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => addProfileAsLead(profile)}>
                        <Plus className="h-3 w-3 mr-1" />
                        Adicionar como Lead
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}