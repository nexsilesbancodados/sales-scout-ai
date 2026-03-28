import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Code2,
  Copy,
  Check,
  Lock,
  Globe,
  Send,
  Users,
  Rocket,
  Webhook,
} from 'lucide-react';

const BASE_URL = `https://oeztpxyprifabkvysroh.supabase.co/functions/v1`;

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  params?: string;
  body?: string;
  response: string;
}

const endpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/leads',
    description: 'Listar todos os leads do usuário autenticado',
    params: '?page=1&limit=50&stage=Contato&temperature=quente',
    response: `{
  "data": [
    {
      "id": "uuid",
      "business_name": "Empresa X",
      "phone": "5511999999999",
      "niche": "Restaurante",
      "stage": "Contato",
      "temperature": "morno"
    }
  ],
  "total": 150,
  "page": 1
}`,
  },
  {
    method: 'POST',
    path: '/api/leads',
    description: 'Criar um novo lead',
    body: `{
  "business_name": "Nova Empresa",
  "phone": "5511999999999",
  "niche": "Restaurante",
  "location": "São Paulo, SP",
  "email": "contato@empresa.com"
}`,
    response: `{
  "data": {
    "id": "uuid",
    "business_name": "Nova Empresa",
    "created_at": "2026-03-28T00:00:00Z"
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/messages/send',
    description: 'Enviar mensagem WhatsApp para um lead',
    body: `{
  "phone": "5511999999999",
  "message": "Olá! Tudo bem?",
  "use_ai": true
}`,
    response: `{
  "success": true,
  "message_id": "wamid.xxx",
  "status": "sent"
}`,
  },
  {
    method: 'GET',
    path: '/api/campaigns',
    description: 'Listar campanhas do usuário',
    response: `{
  "data": [
    {
      "id": "uuid",
      "name": "Campanha Q1",
      "status": "running",
      "leads_contacted": 150
    }
  ]
}`,
  },
  {
    method: 'POST',
    path: '/api/campaigns/{id}/start',
    description: 'Iniciar uma campanha',
    body: `{
  "id": "campaign-uuid"
}`,
    response: `{
  "success": true,
  "status": "started",
  "message": "Campanha iniciada com sucesso"
}`,
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-green-500/10 text-green-600 border-green-500/30',
  POST: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  PUT: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  DELETE: 'bg-red-500/10 text-red-600 border-red-500/30',
};

export default function APIReferencePage() {
  const { toast } = useToast();
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    toast({ title: 'Copiado!' });
  };

  const generateCurl = (ep: Endpoint) => {
    const url = `${BASE_URL}${ep.path}`;
    let curl = `curl -X ${ep.method} "${url}"`;
    curl += ` \\\n  -H "Authorization: Bearer YOUR_API_KEY"`;
    curl += ` \\\n  -H "Content-Type: application/json"`;
    if (ep.body) {
      curl += ` \\\n  -d '${ep.body.replace(/\n/g, '').replace(/\s+/g, ' ')}'`;
    }
    return curl;
  };

  return (
    <DashboardLayout
      title="API Reference"
      description="Documentação da API pública do NexaProspect"
    >
      <div className="space-y-6 animate-fade-in max-w-4xl">
        {/* Header */}
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">API NexaProspect</h2>
                <p className="text-sm text-muted-foreground">Versão 1.0 • REST API</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Integre o NexaProspect com suas ferramentas. Gerencie leads, envie mensagens e controle campanhas programaticamente.
            </p>
          </CardContent>
        </Card>

        {/* Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Autenticação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Todas as requisições devem incluir o header <code className="bg-muted px-1.5 py-0.5 rounded text-xs">Authorization</code> com seu token Bearer.
            </p>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              <code>{`Authorization: Bearer YOUR_API_KEY`}</code>
            </pre>
            <p className="text-xs text-muted-foreground">
              Gere sua API Key em Configurações → Conexões → API Key
            </p>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Endpoints
          </h3>

          {endpoints.map((ep, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={methodColors[ep.method]}>
                      {ep.method}
                    </Badge>
                    <code className="text-sm font-mono">{ep.path}</code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generateCurl(ep), idx)}
                  >
                    {copiedIdx === idx ? (
                      <Check className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    cURL
                  </Button>
                </div>
                <CardDescription>{ep.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="response">
                  <TabsList className="h-8">
                    {ep.body && <TabsTrigger value="body" className="text-xs">Body</TabsTrigger>}
                    <TabsTrigger value="response" className="text-xs">Response</TabsTrigger>
                    <TabsTrigger value="curl" className="text-xs">cURL</TabsTrigger>
                  </TabsList>
                  {ep.body && (
                    <TabsContent value="body">
                      <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                        <code>{ep.body}</code>
                      </pre>
                    </TabsContent>
                  )}
                  <TabsContent value="response">
                    <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                      <code>{ep.response}</code>
                    </pre>
                  </TabsContent>
                  <TabsContent value="curl">
                    <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                      <code>{generateCurl(ep)}</code>
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Webhook */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              Webhooks
            </CardTitle>
            <CardDescription>
              Configure webhooks em Configurações → Avançado → Webhook para receber eventos em tempo real.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Eventos disponíveis:</p>
              <ul className="space-y-1.5">
                {['lead_created', 'message_sent', 'message_received', 'meeting_scheduled', 'lead_qualified'].map(evt => (
                  <li key={evt} className="text-sm flex items-center gap-2">
                    <code className="bg-muted px-2 py-0.5 rounded text-xs">{evt}</code>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
