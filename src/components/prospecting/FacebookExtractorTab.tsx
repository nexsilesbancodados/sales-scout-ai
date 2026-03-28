import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useLeads } from '@/hooks/use-leads';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useToast } from '@/hooks/use-toast';
import {
  Facebook,
  Search,
  Loader2,
  Plus,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  Info,
  AlertTriangle,
} from 'lucide-react';

interface FBPage {
  name: string;
  facebook_url: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  followers: number;
  has_contact: boolean;
  enriched: boolean;
}

export function FacebookExtractorTab() {
  const { createLead } = useLeads();
  const { settings } = useUserSettings();
  const { toast } = useToast();

  const [niche, setNiche] = useState('');
  const [location, setLocation] = useState('');
  const [limit, setLimit] = useState([20]);
  const [isLoading, setIsLoading] = useState(false);
  const [pages, setPages] = useState<FBPage[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const hasSerperKey = !!(settings?.serper_api_key || (settings as any)?.serpapi_api_key);

  const handleSearch = async () => {
    if (!niche.trim() || !location.trim()) return;
    setIsLoading(true);
    setPages([]);
    setSelected(new Set());
    try {
      const { data, error } = await supabase.functions.invoke('facebook-scraper', {
        body: { action: 'search_by_niche', niche: niche.trim(), location: location.trim(), limit: limit[0] },
      });
      if (error) throw error;
      setPages(data?.pages || []);
      if ((data?.pages || []).length === 0) {
        toast({ title: 'Nenhuma página encontrada', description: 'Tente outro nicho ou cidade' });
      }
    } catch (err: any) {
      toast({ title: 'Erro na busca', description: err.message || 'Tente novamente', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportOne = (page: FBPage) => {
    createLead({
      business_name: page.name || 'Lead Facebook',
      phone: page.phone || '0',
      email: page.email || null,
      website: page.facebook_url,
      niche: niche,
      location: location,
      source: 'facebook',
      facebook_url: page.facebook_url,
    } as any);
    toast({ title: `${page.name} importado!` });
  };

  const handleImportSelected = () => {
    const toImport = pages.filter((_, i) => selected.has(i));
    toImport.forEach(page => {
      createLead({
        business_name: page.name || 'Lead Facebook',
        phone: page.phone || '0',
        email: page.email || null,
        website: page.facebook_url,
        niche: niche,
        location: location,
        source: 'facebook',
        facebook_url: page.facebook_url,
      } as any);
    });
    toast({ title: `${toImport.length} leads importados!` });
    setSelected(new Set());
  };

  const toggleSelect = (i: number) => {
    const next = new Set(selected);
    next.has(i) ? next.delete(i) : next.add(i);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === pages.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pages.map((_, i) => i)));
    }
  };

  return (
    <div className="space-y-6">
      {!hasSerperKey && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Configure a Serper API Key em <strong>Configurações → APIs</strong> para usar o extrator do Facebook.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5" />
            Buscar Páginas do Facebook
          </CardTitle>
          <CardDescription>Encontre páginas de negócios por nicho e cidade via Google Search</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nicho *</Label>
              <Input value={niche} onChange={e => setNiche(e.target.value)} placeholder="Ex: Pizzaria, Academia, Salão de beleza" />
            </div>
            <div className="space-y-2">
              <Label>Cidade *</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Ex: São Paulo SP, Campinas SP" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Quantidade: {limit[0]}</Label>
            <Slider value={limit} onValueChange={setLimit} min={5} max={50} step={5} />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSearch} disabled={isLoading || !niche.trim() || !location.trim() || !hasSerperKey} className="gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Buscar páginas
            </Button>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              Funciona via Google Search — mais estável que scraping direto
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && pages.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{pages.length} páginas encontradas</CardTitle>
              {selected.size > 0 && (
                <Button size="sm" onClick={handleImportSelected} className="gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  Importar selecionados ({selected.size})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={selected.size === pages.length && pages.length > 0} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Seguidores</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Checkbox checked={selected.has(i)} onCheckedChange={() => toggleSelect(i)} />
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{page.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{page.category}</TableCell>
                    <TableCell>
                      {page.phone ? (
                        <a href={`tel:${page.phone}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                          <Phone className="h-3 w-3" />{page.phone}
                        </a>
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      {page.email ? (
                        <a href={`mailto:${page.email}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                          <Mail className="h-3 w-3" />{page.email}
                        </a>
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-sm">{page.followers > 0 ? page.followers.toLocaleString('pt-BR') : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={page.enriched ? 'default' : 'secondary'} className="text-xs">
                        {page.enriched ? 'Enriquecido' : 'URL'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                          <a href={page.facebook_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleImportOne(page)}>
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {!isLoading && pages.length === 0 && niche && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Globe className="h-12 w-12 mb-4 opacity-20" />
            <p>Nenhuma página encontrada</p>
            <p className="text-sm mt-1">Tente outro nicho ou cidade</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
