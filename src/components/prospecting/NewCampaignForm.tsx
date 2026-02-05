import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogFooter } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useToast } from '@/hooks/use-toast';
import { Rocket, Loader2, Zap, Users } from 'lucide-react';

const NICHES = [
  'Restaurantes',
  'Clínicas',
  'Academias',
  'Salões de Beleza',
  'Escritórios de Advocacia',
  'Imobiliárias',
  'Lojas de Roupas',
  'Petshops',
  'Oficinas Mecânicas',
  'Dentistas',
  'Psicólogos',
  'Contadores',
  'Consultórios Médicos',
  'Escolas',
  'Autoescolas',
];

const LOCATIONS = [
  'São Paulo, SP',
  'Rio de Janeiro, RJ',
  'Belo Horizonte, MG',
  'Brasília, DF',
  'Salvador, BA',
  'Fortaleza, CE',
  'Curitiba, PR',
  'Recife, PE',
  'Porto Alegre, RS',
  'Goiânia, GO',
  'Campinas, SP',
  'Manaus, AM',
];

interface NewCampaignFormProps {
  onSuccess: () => void;
}

export function NewCampaignForm({ onSuccess }: NewCampaignFormProps) {
  const { createCampaign, isCreating } = useCampaigns();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    campaign_type: 'automatic' as 'automatic' | 'manual',
    niches: [] as string[],
    locations: [] as string[],
    message_template: '',
    scheduled_at: null as string | null,
  });

  const handleSubmit = () => {
    if (!formData.name || formData.niches.length === 0 || formData.locations.length === 0) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome, nicho e localização.',
        variant: 'destructive',
      });
      return;
    }

    createCampaign({
      name: formData.name,
      status: formData.scheduled_at ? 'scheduled' : 'draft',
      campaign_type: formData.campaign_type,
      niches: formData.niches,
      locations: formData.locations,
      message_template: formData.message_template || null,
      scheduled_at: formData.scheduled_at,
      started_at: null,
      completed_at: null,
    });

    onSuccess();
  };

  return (
    <>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>Nome da Campanha</Label>
          <Input
            placeholder="Ex: Restaurantes SP - Janeiro"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Tipo de Campanha</Label>
          <Select
            value={formData.campaign_type}
            onValueChange={(v) => setFormData({ ...formData, campaign_type: v as 'automatic' | 'manual' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="automatic">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Automática - Hunter busca leads no Google Maps
                </div>
              </SelectItem>
              <SelectItem value="manual">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Manual - Selecione leads existentes
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nichos</Label>
            <Select
              value={formData.niches[0] || ''}
              onValueChange={(v) => setFormData({ ...formData, niches: [v] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um nicho" />
              </SelectTrigger>
              <SelectContent>
                {NICHES.map((niche) => (
                  <SelectItem key={niche} value={niche}>
                    {niche}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Localização</Label>
            <Select
              value={formData.locations[0] || ''}
              onValueChange={(v) => setFormData({ ...formData, locations: [v] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma cidade" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Mensagem Personalizada (Opcional)</Label>
          <Textarea
            placeholder="Deixe em branco para o agente gerar automaticamente..."
            value={formData.message_template}
            onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Agendar para</Label>
          <Input
            type="datetime-local"
            value={formData.scheduled_at || ''}
            onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value || null })}
          />
          <p className="text-xs text-muted-foreground">Deixe em branco para executar manualmente</p>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSubmit} disabled={isCreating}>
          {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Rocket className="h-4 w-4 mr-2" />}
          Criar Campanha
        </Button>
      </DialogFooter>
    </>
  );
}
