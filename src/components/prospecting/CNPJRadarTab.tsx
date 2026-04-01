import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLeads } from '@/hooks/use-leads';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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
  Globe,
  ExternalLink,
  Briefcase,
  Hash,
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

type TabType = 'individual' | 'massa';

export function CNPJRadarTab() {
  const { createLead, leads } = useLeads();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('individual');

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
        if (!data || !Array.isArray(data) || data.length === 0) break;

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
      phone,
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

  const tabs: { id: TabType; icon: typeof Search; label: string }[] = [
    { id: 'individual', icon: Search, label: 'Consulta por CNPJ' },
    { id: 'massa', icon: Users, label: 'Busca em Massa' },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "h-9 px-4 text-xs gap-2 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/90 hover:text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <TabIcon className="h-3.5 w-3.5" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Individual Lookup */}
      {activeTab === 'individual' && (
        <div className="space-y-5 animate-fade-in">
          <Card className="border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="px-6 pt-6 pb-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="p-2.5 rounded-xl bg-primary/10 ring-2 ring-primary/20">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">Consultar CNPJ</h3>
                    <p className="text-xs text-muted-foreground">Digite o CNPJ para consultar dados da empresa</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex gap-3">
                  <Input
                    placeholder="XX.XXX.XXX/XXXX-XX"
                    value={cnpjInput}
                    onChange={(e) => setCnpjInput(formatCNPJ(e.target.value))}
                    className="max-w-sm h-11"
                    onKeyDown={(e) => e.key === 'Enter' && handleSingleLookup()}
                  />
                  <Button
                    onClick={handleSingleLookup}
                    disabled={singleLoading}
                    className="h-11 gap-2 px-6 gradient-primary shadow-sm"
                  >
                    {singleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Consultar
                  </Button>
                </div>

                {singleResult && (
                  <Card className="border-primary/20 bg-primary/5 overflow-hidden animate-fade-in">
                    <CardContent className="p-6 space-y-5">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold truncate">
                            {singleResult.nome_fantasia || singleResult.razao_social}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">{singleResult.razao_social}</p>
                          <p className="text-xs text-muted-foreground mt-1 font-mono">CNPJ: {formatCNPJ(singleResult.cnpj)}</p>
                        </div>
                        <Badge
                          variant={singleResult.situacao_cadastral?.toLowerCase().includes('ativa') ? 'default' : 'destructive'}
                          className="shrink-0"
                        >
                          {singleResult.situacao_cadastral || 'Desconhecido'}
                        </Badge>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoRow icon={Briefcase} label="Atividade" value={singleResult.cnae_fiscal_descricao} />
                        <InfoRow icon={MapPin} label="Cidade" value={`${singleResult.municipio} - ${singleResult.uf}`} />
                        <InfoRow icon={Phone} label="Telefone" value={cleanPhone(singleResult.ddd_telefone_1) || 'Sem telefone'} />
                        <InfoRow icon={Mail} label="Email" value={singleResult.email || 'Sem email'} />
                        <InfoRow icon={Calendar} label="Abertura" value={singleResult.data_inicio_atividade} />
                        <InfoRow icon={Building2} label="Porte" value={singleResult.porte} />
                      </div>

                      {/* Address */}
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                        <p className="text-xs text-muted-foreground flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          {`${singleResult.descricao_tipo_de_logradouro} ${singleResult.logradouro}, ${singleResult.numero} ${singleResult.complemento} - ${singleResult.bairro}, ${singleResult.municipio}/${singleResult.uf} - CEP ${singleResult.cep}`}
                        </p>
                      </div>

                      <Button onClick={() => addAsLead(singleResult)} className="w-full h-11 gap-2 gradient-primary shadow-sm">
                        <Plus className="h-4 w-4" />
                        Adicionar como Lead
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {!singleResult && !singleLoading && (
                  <div className="text-center py-16 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-15" />
                    <p className="text-sm">Digite um CNPJ acima para consultar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mass Search */}
      {activeTab === 'massa' && (
        <div className="space-y-5 animate-fade-in">
          <Card className="border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="px-6 pt-6 pb-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="p-2.5 rounded-xl bg-primary/10 ring-2 ring-primary/20">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">Busca em Massa</h3>
                    <p className="text-xs text-muted-foreground">Encontre empresas por estado, cidade, CNAE e porte</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" /> Estado
                    </Label>
                    <Select value={estado} onValueChange={setEstado}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="UF" /></SelectTrigger>
                      <SelectContent>
                        {ESTADOS_BR.map(uf => (
                          <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="h-3 w-3" /> Cidade
                    </Label>
                    <Input placeholder="Ex: São Paulo" value={cidade} onChange={e => setCidade(e.target.value)} className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Hash className="h-3 w-3" /> CNAE
                    </Label>
                    <Input placeholder="Ex: 4712100" value={cnae} onChange={e => setCnae(e.target.value)} className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="h-3 w-3" /> Porte
                    </Label>
                    <Select value={porte} onValueChange={setPorte}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Todos" /></SelectTrigger>
                      <SelectContent>
                        {PORTES.map(p => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border/50">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Quantidade de empresas</Label>
                    <Badge variant="secondary" className="tabular-nums">{quantidade[0]}</Badge>
                  </div>
                  <Slider value={quantidade} onValueChange={setQuantidade} min={10} max={200} step={10} />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>10</span>
                    <span>200</span>
                  </div>
                </div>

                <Button
                  onClick={handleMassSearch}
                  disabled={massLoading || !estado}
                  className={cn(
                    "w-full h-12 gap-2.5 text-sm font-semibold rounded-xl transition-all duration-300",
                    estado && !massLoading
                      ? "gradient-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01]"
                      : ""
                  )}
                >
                  {massLoading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Buscando...</>
                  ) : (
                    <><Search className="h-5 w-5" /> Buscar Empresas</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loading */}
          {massLoading && (
            <Card className="border-border/50">
              <CardContent className="pt-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!massLoading && massResults.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-15" />
              <p className="text-sm">{estado ? 'Nenhuma empresa encontrada com esses filtros' : 'Selecione um estado para iniciar a busca'}</p>
            </div>
          )}

          {/* Results Table */}
          {massResults.length > 0 && (
            <Card className="border-border/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-border/30 bg-muted/20">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="tabular-nums">{massResults.length}</Badge>
                    <span className="text-sm font-medium">empresas encontradas</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5 h-8 text-xs">
                      <Download className="h-3.5 w-3.5" />
                      CSV
                    </Button>
                    {selectedIds.size > 0 && (
                      <Button size="sm" onClick={importSelected} className="gap-1.5 h-8 text-xs gradient-primary">
                        <Plus className="h-3.5 w-3.5" />
                        Importar {selectedIds.size}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-10">
                          <Checkbox
                            checked={selectedIds.size === massResults.length && massResults.length > 0}
                            onCheckedChange={toggleAll}
                          />
                        </TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>CNAE</TableHead>
                        <TableHead>Cidade/UF</TableHead>
                        <TableHead>Situação</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {massResults.map((item) => {
                        const imported = isAlreadyImported(item);
                        return (
                          <TableRow key={item.cnpj} className={cn(imported && "opacity-50")}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(item.cnpj)}
                                onCheckedChange={() => toggleSelect(item.cnpj)}
                                disabled={imported}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-sm">{item.nome_fantasia || item.razao_social}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">{formatCNPJ(item.cnpj)}</div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                              {item.cnae_fiscal_descricao}
                            </TableCell>
                            <TableCell className="text-sm">{item.municipio}/{item.uf}</TableCell>
                            <TableCell>
                              <Badge
                                variant={item.situacao_cadastral?.toLowerCase().includes('ativa') ? 'default' : 'secondary'}
                                className="text-[10px] px-1.5 py-0"
                              >
                                {item.situacao_cadastral || '—'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs tabular-nums">{cleanPhone(item.ddd_telefone_1) || '—'}</TableCell>
                            <TableCell className="text-xs truncate max-w-[140px]">{item.email || '—'}</TableCell>
                            <TableCell className="text-right">
                              {imported ? (
                                <Badge variant="secondary" className="text-[10px] gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Importado
                                </Badge>
                              ) : (
                                <Button size="sm" variant="ghost" onClick={() => addAsLead(item)} className="h-7 w-7 p-0">
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
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/20 border border-border/30">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
