import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useLeads } from '@/hooks/use-leads';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Globe, Key, Search, Users, Phone, Mail, Link as LinkIcon,
  ExternalLink, CheckCircle2, Loader2, AlertCircle, Building2,
} from 'lucide-react';

interface InstagramProfile {
  username: string;
  full_name: string;
  bio: string;
  followers: number;
  external_url: string;
  profile_pic_url: string;
  is_verified: boolean;
  category: string;
  location: string;
  instagram_url: string;
  phone: string;
  email: string;
  has_contact: boolean;
}

interface FacebookPage {
  name: string;
  facebook_url: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  category: string;
  followers: number;
  rating: number | null;
  location: string;
  has_contact: boolean;
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function SocialExtractorTab() {
  const { settings, updateSettings, isUpdating } = useUserSettings();
  const { createLead } = useLeads();
  const { toast } = useToast();

  // Setup state
  const [apifyTokenInput, setApifyTokenInput] = useState('');
  const [showSetup, setShowSetup] = useState(true);

  // Instagram state
  const [igNiche, setIgNiche] = useState('');
  const [igLocation, setIgLocation] = useState('');
  const [igLimit, setIgLimit] = useState([30]);
  const [igContactOnly, setIgContactOnly] = useState(true);
  const [igLoading, setIgLoading] = useState(false);
  const [igProfiles, setIgProfiles] = useState<InstagramProfile[]>([]);
  const [igImported, setIgImported] = useState<Set<string>>(new Set());

  // Facebook state
  const [fbNiche, setFbNiche] = useState('');
  const [fbLocation, setFbLocation] = useState('');
  const [fbLimit, setFbLimit] = useState([20]);
  const [fbLoading, setFbLoading] = useState(false);
  const [fbPages, setFbPages] = useState<FacebookPage[]>([]);
  const [fbImported, setFbImported] = useState<Set<string>>(new Set());

  const hasApifyToken = !!(settings as any)?.apify_token;

  const handleSaveToken = () => {
    if (!apifyTokenInput.trim()) return;
    updateSettings({ apify_token: apifyTokenInput.trim() } as any);
    setShowSetup(false);
  };

  // Instagram search
  const handleIgSearch = async () => {
    if (!igNiche.trim()) return;
    setIgLoading(true);
    setIgProfiles([]);

    try {
      const queries = [igNiche];
      if (igLocation) queries.push(`${igNiche} ${igLocation}`);

      const { data, error } = await supabase.functions.invoke('instagram-scraper', {
        body: {
          queries,
          limit: igLimit[0],
          search_type: 'hashtag',
          contactOnly: igContactOnly,
        },
      });

      if (error) throw error;
      setIgProfiles(data?.profiles || []);

      if ((data?.profiles || []).length === 0) {
        toast({ title: 'Nenhum perfil encontrado', description: 'Tente outro nicho ou localização.' });
      }
    } catch (err: any) {
      toast({ title: 'Erro na extração', description: err.message, variant: 'destructive' });
    } finally {
      setIgLoading(false);
    }
  };

  // Facebook search
  const handleFbSearch = async () => {
    if (!fbNiche.trim() || !fbLocation.trim()) return;
    setFbLoading(true);
    setFbPages([]);

    try {
      const { data, error } = await supabase.functions.invoke('facebook-scraper', {
        body: {
          action: 'search_by_niche',
          niche: fbNiche,
          location: fbLocation,
          limit: fbLimit[0],
        },
      });

      if (error) throw error;
      setFbPages(data?.pages || []);

      if ((data?.pages || []).length === 0) {
        toast({ title: 'Nenhuma página encontrada', description: 'Tente outro nicho ou localização.' });
      }
    } catch (err: any) {
      toast({ title: 'Erro na extração', description: err.message, variant: 'destructive' });
    } finally {
      setFbLoading(false);
    }
  };

  // Add IG profile as lead
  const addIgAsLead = async (profile: InstagramProfile) => {
    try {
      await createLead({
        business_name: profile.full_name || `@${profile.username}`,
        phone: profile.phone || '000',
        email: profile.email || undefined,
        website: profile.external_url || undefined,
        notes: `${profile.bio}\n\nInstagram: ${profile.instagram_url}`,
        niche: profile.category || igNiche,
        location: profile.location || igLocation,
        source: 'instagram',
      } as any);
      setIgImported(prev => new Set(prev).add(profile.username));
      toast({ title: 'Lead adicionado!', description: `@${profile.username}` });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  // Add FB page as lead
  const addFbAsLead = async (page: FacebookPage) => {
    try {
      await createLead({
        business_name: page.name,
        phone: page.phone || '000',
        email: page.email || undefined,
        website: page.website || undefined,
        address: page.address || undefined,
        notes: `Facebook: ${page.facebook_url}`,
        niche: page.category || fbNiche,
        location: page.location || fbLocation,
        source: 'facebook',
      } as any);
      setFbImported(prev => new Set(prev).add(page.facebook_url));
      toast({ title: 'Lead adicionado!', description: page.name });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  // Bulk import
  const bulkImportIg = async () => {
    const toImport = igProfiles.filter(p => p.has_contact && !igImported.has(p.username));
    for (const p of toImport) {
      await addIgAsLead(p);
    }
    toast({ title: `${toImport.length} leads importados do Instagram!` });
  };

  const bulkImportFb = async () => {
    const toImport = fbPages.filter(p => p.has_contact && !fbImported.has(p.facebook_url));
    for (const p of toImport) {
      await addFbAsLead(p);
    }
    toast({ title: `${toImport.length} leads importados do Facebook!` });
  };

  return (
    <div className="space-y-6">

      <Tabs defaultValue="instagram" className="space-y-4">
        <TabsList>
          <TabsTrigger value="instagram" className="gap-2">
            <Globe className="h-4 w-4" /> Instagram
          </TabsTrigger>
          <TabsTrigger value="facebook" className="gap-2">
            <Building2 className="h-4 w-4" /> Facebook
          </TabsTrigger>
        </TabsList>

        {/* INSTAGRAM TAB */}
        <TabsContent value="instagram" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Buscar perfis no Instagram</CardTitle>
              <CardDescription>Encontre negócios por hashtag, nicho ou localização</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hashtag ou nicho</Label>
                  <Input
                    placeholder="Ex: restaurante, pizzaria, academia"
                    value={igNiche}
                    onChange={(e) => setIgNiche(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade/Região (opcional)</Label>
                  <Input
                    placeholder="Ex: São Paulo, Campinas"
                    value={igLocation}
                    onChange={(e) => setIgLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Quantidade de perfis: {igLimit[0]}</Label>
                <Slider
                  value={igLimit}
                  onValueChange={setIgLimit}
                  min={10}
                  max={100}
                  step={10}
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={igContactOnly} onCheckedChange={setIgContactOnly} />
                <Label>Apenas perfis com contato (telefone/email/link)</Label>
              </div>

              <Button
                onClick={handleIgSearch}
                disabled={igLoading || !igNiche.trim() || !hasApifyToken}
                className="w-full gradient-primary text-primary-foreground"
              >
                {igLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Extraindo perfis...</>
                ) : (
                  <><Search className="h-4 w-4 mr-2" /> Extrair perfis do Instagram</>
                )}
              </Button>

              {!hasApifyToken && (
                <p className="text-sm text-muted-foreground text-center">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  Configure seu token Apify acima para começar
                </p>
              )}
            </CardContent>
          </Card>

          {/* Loading skeleton */}
          {igLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-8 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Results */}
          {igProfiles.length > 0 && !igLoading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {igProfiles.length} perfis encontrados
                </p>
                <Button onClick={bulkImportIg} variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Importar todos com contato
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {igProfiles.map((profile) => (
                  <Card key={profile.username} className="card-hover">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={profile.profile_pic_url} />
                          <AvatarFallback className="gradient-primary text-primary-foreground text-sm">
                            {profile.full_name?.[0] || '@'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <a
                              href={profile.instagram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-sm hover:text-primary truncate"
                            >
                              @{profile.username}
                            </a>
                            {profile.is_verified && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{profile.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFollowers(profile.followers)} seguidores
                          </p>
                        </div>
                      </div>

                      {profile.bio && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{profile.bio}</p>
                      )}

                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {profile.phone && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Phone className="h-3 w-3" /> Tel
                          </Badge>
                        )}
                        {profile.email && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Mail className="h-3 w-3" /> Email
                          </Badge>
                        )}
                        {profile.external_url && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <LinkIcon className="h-3 w-3" /> Link
                          </Badge>
                        )}
                      </div>

                      <div className="mt-3">
                        {igImported.has(profile.username) ? (
                          <Badge className="bg-primary/10 text-primary border-primary/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Importado
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addIgAsLead(profile)}
                          >
                            Adicionar como lead
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {igProfiles.length === 0 && !igLoading && igNiche && (
            <div className="text-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum perfil encontrado. Tente outro nicho ou localização.</p>
            </div>
          )}
        </TabsContent>

        {/* FACEBOOK TAB */}
        <TabsContent value="facebook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Buscar páginas no Facebook</CardTitle>
              <CardDescription>
                Encontra páginas via Google (Serper) e enriquece com Apify (se configurado)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nicho / Segmento</Label>
                  <Input
                    placeholder="Ex: restaurante, clínica, oficina"
                    value={fbNiche}
                    onChange={(e) => setFbNiche(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    placeholder="Ex: São Paulo, Curitiba"
                    value={fbLocation}
                    onChange={(e) => setFbLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Quantidade de páginas: {fbLimit[0]}</Label>
                <Slider
                  value={fbLimit}
                  onValueChange={setFbLimit}
                  min={5}
                  max={50}
                  step={5}
                />
              </div>

              <Button
                onClick={handleFbSearch}
                disabled={fbLoading || !fbNiche.trim() || !fbLocation.trim()}
                className="w-full gradient-primary text-primary-foreground"
              >
                {fbLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Buscando páginas...</>
                ) : (
                  <><Search className="h-4 w-4 mr-2" /> Buscar páginas do Facebook</>
                )}
              </Button>

              <p className="text-xs text-muted-foreground">
                Requer Serper API Key. Apify Token opcional para dados mais ricos.
              </p>
            </CardContent>
          </Card>

          {/* Loading skeleton */}
          {fbLoading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex gap-4">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-60" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Results */}
          {fbPages.length > 0 && !fbLoading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {fbPages.length} páginas encontradas
                </p>
                <Button onClick={bulkImportFb} variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Importar todos com contato
                </Button>
              </div>

              <div className="space-y-3">
                {fbPages.map((page, idx) => (
                  <Card key={idx} className="card-hover">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                        {page.name?.[0] || 'F'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <a
                            href={page.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-sm hover:text-primary truncate"
                          >
                            {page.name}
                          </a>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          {page.category && <span>{page.category}</span>}
                          {page.location && <span>📍 {page.location}</span>}
                          {page.followers > 0 && <span>{formatFollowers(page.followers)} seguidores</span>}
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        {page.phone && (
                          <Badge variant="outline" className="text-xs"><Phone className="h-3 w-3" /></Badge>
                        )}
                        {page.email && (
                          <Badge variant="outline" className="text-xs"><Mail className="h-3 w-3" /></Badge>
                        )}
                      </div>

                      <div className="shrink-0">
                        {fbImported.has(page.facebook_url) ? (
                          <Badge className="bg-primary/10 text-primary border-primary/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Importado
                          </Badge>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => addFbAsLead(page)}>
                            Adicionar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {fbPages.length === 0 && !fbLoading && fbNiche && fbLocation && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma página encontrada. Tente outro nicho ou localização.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
