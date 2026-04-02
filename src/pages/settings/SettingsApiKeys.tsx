import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Search, Mail, Bot, Shield, CheckCircle2 } from 'lucide-react';

const services = [
  { icon: Sparkles, label: 'DeepSeek IA', desc: 'Geração de mensagens, respostas automáticas e análise de leads', color: 'text-blue-500' },
  { icon: Search, label: 'DuckDuckGo', desc: 'Busca gratuita de empresas na web (sem custo de API)', color: 'text-green-500' },
  { icon: Mail, label: 'Email Finder', desc: 'Descoberta de emails via padrões DNS e scraping (gratuito)', color: 'text-purple-500' },
  { icon: Bot, label: 'Extrator Social', desc: 'Extração gratuita de perfis do Instagram e Facebook', color: 'text-pink-500' },
  { icon: Search, label: 'Firecrawl', desc: 'Busca e scraping avançado de websites', color: 'text-cyan-500' },
];

export default function SettingsApiKeys() {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">APIs & Integrações</h1>
            <p className="text-sm text-muted-foreground">Todas as APIs já estão configuradas e prontas para uso</p>
          </div>
        </div>
      </div>

      <Alert className="border-emerald-500/20 bg-emerald-500/5">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        <AlertTitle className="flex items-center gap-2">
          Tudo incluído no seu plano
          <Badge className="bg-emerald-600 text-white">Ativo</Badge>
        </AlertTitle>
        <AlertDescription>
          Todas as APIs e integrações são configuradas globalmente e compartilhadas entre todos os usuários. 
          Você não precisa configurar nenhuma chave — tudo funciona automaticamente.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((svc) => (
          <Card key={svc.label} className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <svc.icon className={`h-4 w-4 ${svc.color}`} />
                {svc.label}
                <Badge variant="outline" className="ml-auto bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                  Ativo
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{svc.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
