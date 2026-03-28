import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLeads } from '@/hooks/use-leads';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Search,
  Loader2,
  Download,
  Plus,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
} from 'lucide-react';

const ESTADOS_BR = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA',
  'PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'
];

const PORTES = [
  { value: 'MEI', label: 'MEI' },
  { value: 'ME', label: 'ME - Microempresa' },
  { value: 'EPP', label: 'EPP - Empresa de Pequeno Porte' },
  { value: 'DEMAIS', label: 'Demais' },
];

interface CNPJResult {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: string;
  cnae_fiscal_descricao: string;
  cnae_fiscal: number;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  ddd_telefone_1: string;
  email: string;
  data_inicio_atividade: string;
  porte: string;
  descricao_tipo_de_logradouro: string;
}

function formatCNPJ(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function cleanPhone(ddd_phone: string): string {
  if (!ddd_phone) return '';
  const digits = ddd_phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return digits;
}

export function CNPJRadarTab() {
  const { createLead, leads } = useLeads();
  const { toast } = useToast();
  
  // Single lookup
  const [cnpjInput, setCnpjInput] = useState('');
  const [singleResult, setSingleResult] = useState<CNPJResult | null>(null);
  const [singleLoading, setSingleLoading] = useState(false);
  
  // Mass search
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [cnae, setCnae] = useState('');
  const [porte, setPorte] = useState('');
  const [quantidade, setQuantidade] = useState([50]);
  const [massResults, setMassResults] = useState<CNPJResult[]>([]);
  const [massLoading, setMassLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const existingPhones = new Set(leads.map(l => l.phone.replace(/\D/g, '')));

  const handleSingleLookup = async () => {
    const digits = cnpjInput.replace(/\D/g, '');
    if (digits.length !== 14) {
      toast({ title: 'CNPJ inválido', description: 'Digite um CNPJ com 14 dígitos.', variant: 'destructive' });
      return;
    }
    setSingleLoading(true);
    setSingleResult(null);
    try {
      const res = await fetch(`https://publica.cnpj.ws/cnpj/${digits}`);
      if (!res.ok) throw new Error('CNPJ não encontrado');
      const data = await res.json();
      const mapped: CNPJResult = {
        cnpj: digits,
        razao_social: data.razao_social || '',
        nome_fantasia: data.estabelecimento?.nome_fantasia || '',
        situacao_cadastral: data.estabelecimento?.situacao_cadastral || '',
        cnae_fiscal_descricao: data.estabelecimento?.atividade_principal?.descricao || data.cnae_fiscal_descricao || '',
        cnae_fiscal: data.estabelecimento?.atividade_principal?.id || 0,
        logradouro: data.estabelecimento?.logradouro || '',
        numero: data.estabelecimento?.numero || '',
        complemento: data.estabelecimento?.complemento || '',
        bairro: data.estabelecimento?.bairro || '',
        municipio: data.estabelecimento?.cidade?.nome || '',
        uf: data.estabelecimento?.estado?.sigla || '',
        cep: data.estabelecimento?.cep || '',
        ddd_telefone_1: data.estabelecimento?.ddd1 && data.estabelecimento?.telefone1 
          ? `${data.estabelecimento.ddd1}${data.estabelecimento.telefone1}` : '',
        email: data.estabelecimento?.email || '',
        data_inicio_atividade: data.estabelecimento?.data_inicio_atividade || '',
        porte: data.porte?.descricao || '',
        descricao_tipo_de_logradouro: data.estabelecimento?.tipo_logradouro || '',
      };
      setSingleResult(mapped);
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message || 'Erro ao consultar CNPJ', variant: 'destructive' });
    } finally {
      setSingleLoading(false);
    }
  };

  const handleMassSearch = async () => {
    if (!estado) {
      toast({ title: 'Selecione um estado', variant: 'destructive' });
      return;
    }
    setMassLoading(true);
    setMassResults([]);
    setSelectedIds(new Set());
    try {
      const params = new URLSearchParams();
      if (estado) params.set('uf', estado);
      if (cidade) params.set('municipio', cidade.toUpperCase());
      if (cnae) params.set('cnae', cnae.replace(/\D/g, ''));
      if (porte) params.set('porte', porte);
      
      const results: CNPJResult[] = [];
      const maxPages = Math.ceil(quantidade[0] / 20);
      
      for (let page = 1; page <= maxPages && results.length < quantidade[0]; page++) {
        params.set('pagina', String(page));
        const res = await fetch(`https://publica.cnpj.ws/cnpj/s?${params.toString()}`);
        if (!res.ok) break;
        const data = await res.json();
        if (!data || !Array.isArray(data)) break;
        if (data.length === 0) break;
        
        for (const item of data) {
          if (results.length >= quantidade[0]) break;
          results.push({
            cnpj: item.cnpj || '',
            razao_social: item.razao_social || '',
            nome_fantasia: item.nome_fantasia || '',
            situacao_cadastral: item.situacao_cadastral || 'Ativa',
            cnae_fiscal_descricao: item.cnae_fiscal_descricao || '',
            cnae_fiscal: item.cnae_fiscal || 0,
            logradouro: item.logradouro || '',
            numero: item.numero || '',
            complemento: item.complemento || '',
            bairro: item.bairro || '',
            municipio: item.municipio || '',
            uf: item.uf || estado,
            cep: item.cep || '',
            ddd_telefone_1: item.ddd_telefone_1 || '',
            email: item.email || '',
            data_inicio_atividade: item.data_inicio_atividade || '',
            porte: item.porte || '',
            descricao_tipo_de_logradouro: item.descricao_tipo_de_logradouro || '',
          });
        }
      }
      
      setMassResults(results);
      if (results.length === 0) {
        toast({ title: 'Nenhuma empresa encontrada', description: 'Tente outros filtros.' });
      } else {
        toast({ title: `${results.length} empresas encontradas` });
      }
    } catch (err: any) {
      toast({ title: 'Erro na busca', description: err.message, variant: 'destructive' });
    } finally {
      setMassLoading(false);
    }
  };

  const addAsLead = (item: CNPJResult) => {
    const phone = item.ddd_telefone_1.replace(/\D/g, '');
    if (!phone) {
      toast({ title: 'Sem telefone', description: 'Esta empresa não possui telefone cadastrado.', variant: 'destructive' });
      return;
    }
    createLead({
      business_name: item.nome_fantasia || item.razao_social,
      phone: phone,
      email: item.email || null,
      address: `${item.descricao_tipo_de_logradouro} ${item.logradouro}, ${item.numero} ${item.complemento} - ${item.bairro}`.trim(),
      niche: item.cnae_fiscal_descricao,
      location: `${item.municipio} - ${item.uf}`,
      source: 'cnpj_radar',
      stage: 'Contato',
      temperature: 'morno',
      message_sent: false,
      follow_up_count: 0,
      lead_score: 0,
      score_factors: {},
      analyzed_needs: {},
      tags: [],
      quality_score: 0,
      reviews_count: 0,
      total_messages_exchanged: 0,
    } as any);
  };

  const importSelected = () => {
    const items = massResults.filter(r => selectedIds.has(r.cnpj));
    items.forEach(addAsLead);
    toast({ title: `${items.length} leads importados` });
    setSelectedIds(new Set());
  };

  const toggleSelect = (cnpj: string) => {
    const next = new Set(selectedIds);
    if (next.has(cnpj)) next.delete(cnpj);
    else next.add(cnpj);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === massResults.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(massResults.map(r => r.cnpj)));
    }
  };

  const exportCSV = () => {
    const headers = ['CNPJ','Razão Social','Nome Fantasia','CNAE','Município','UF','Telefone','Email','Situação'];
    const rows = massResults.map(r => [
      r.cnpj, r.razao_social, r.nome_fantasia, r.cnae_fiscal_descricao,
      r.municipio, r.uf, cleanPhone(r.ddd_telefone_1), r.email, r.situacao_cadastral
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c||'').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cnpj_radar_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isAlreadyImported = (item: CNPJResult) => {
    const phone = item.ddd_telefone_1.replace(/\D/g, '');
    return existingPhones.has(phone);
  };

  return (
    <Tabs defaultValue="individual" className="space-y-4">
      <TabsList>
        <TabsTrigger value="individual">
          <Search className="h-4 w-4 mr-2" />
          Consulta por CNPJ
        </TabsTrigger>
        <TabsTrigger value="massa">
          <Users className="h-4 w-4 mr-2" />
          Busca em Massa
        </TabsTrigger>
      </TabsList>

      <TabsContent value="individual" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Consultar CNPJ
            </CardTitle>
            <CardDescription>Digite o CNPJ para consultar dados da empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="XX.XXX.XXX/XXXX-XX"
                value={cnpjInput}
                onChange={(e) => setCnpjInput(formatCNPJ(e.target.value))}
                className="max-w-xs"
              />
              <Button onClick={handleSingleLookup} disabled={singleLoading}>
                {singleLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Consultar
              </Button>
            </div>

            {singleResult && (
              <Card className="border-primary/20">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{singleResult.nome_fantasia || singleResult.razao_social}</h3>
                      <p className="text-sm text-muted-foreground">{singleResult.razao_social}</p>
                    </div>
                    <Badge variant={singleResult.situacao_cadastral?.toLowerCase().includes('ativa') ? 'default' : 'destructive'}>
                      {singleResult.situacao_cadastral || 'Desconhecido'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{singleResult.cnae_fiscal_descricao}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{singleResult.municipio} - {singleResult.uf}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{cleanPhone(singleResult.ddd_telefone_1) || 'Sem telefone'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{singleResult.email || 'Sem email'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Abertura: {singleResult.data_inicio_atividade}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Porte: {singleResult.porte}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {`${singleResult.descricao_tipo_de_logradouro} ${singleResult.logradouro}, ${singleResult.numero} ${singleResult.complemento} - ${singleResult.bairro}, ${singleResult.municipio}/${singleResult.uf} - CEP ${singleResult.cep}`}
                  </p>

                  <Button onClick={() => addAsLead(singleResult)} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar como Lead
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="massa" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Busca em Massa por Filtros
            </CardTitle>
            <CardDescription>Encontre empresas por estado, cidade, CNAE e porte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Estado (UF)</Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {ESTADOS_BR.map(uf => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input placeholder="Ex: São Paulo" value={cidade} onChange={e => setCidade(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>CNAE</Label>
                <Input placeholder="Ex: 4712100" value={cnae} onChange={e => setCnae(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Porte</Label>
                <Select value={porte} onValueChange={setPorte}>
                  <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    {PORTES.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quantidade: {quantidade[0]} empresas</Label>
              <Slider value={quantidade} onValueChange={setQuantidade} min={10} max={200} step={10} />
            </div>

            <Button onClick={handleMassSearch} disabled={massLoading} className="w-full">
              {massLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Buscar Empresas
            </Button>
          </CardContent>
        </Card>

        {massLoading && (
          <Card>
            <CardContent className="pt-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        )}

        {!massLoading && massResults.length === 0 && estado && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhuma empresa encontrada com esses filtros</p>
              </div>
            </CardContent>
          </Card>
        )}

        {massResults.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{massResults.length} empresas encontradas</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                  {selectedIds.size > 0 && (
                    <Button size="sm" onClick={importSelected}>
                      <Plus className="h-4 w-4 mr-2" />
                      Importar {selectedIds.size} selecionados
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedIds.size === massResults.length}
                          onCheckedChange={toggleAll}
                        />
                      </TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>CNAE</TableHead>
                      <TableHead>Cidade/UF</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {massResults.map((item) => {
                      const imported = isAlreadyImported(item);
                      return (
                        <TableRow key={item.cnpj}>
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.has(item.cnpj)}
                              onCheckedChange={() => toggleSelect(item.cnpj)}
                              disabled={imported}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.nome_fantasia || item.razao_social}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {item.cnae_fiscal_descricao}
                          </TableCell>
                          <TableCell>{item.municipio}/{item.uf}</TableCell>
                          <TableCell>
                            <Badge variant={item.situacao_cadastral?.toLowerCase().includes('ativa') ? 'default' : 'secondary'} className="text-xs">
                              {item.situacao_cadastral || '—'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{cleanPhone(item.ddd_telefone_1) || '—'}</TableCell>
                          <TableCell className="text-sm truncate max-w-[150px]">{item.email || '—'}</TableCell>
                          <TableCell>
                            {imported ? (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Importado
                              </Badge>
                            ) : (
                              <Button size="sm" variant="ghost" onClick={() => addAsLead(item)}>
                                <Plus className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}