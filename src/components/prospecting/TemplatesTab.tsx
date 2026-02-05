import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTemplates, DEFAULT_TEMPLATES, MessageTemplate } from '@/hooks/use-templates';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  MessageSquareText,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

const NICHES = Object.keys(DEFAULT_TEMPLATES);

export function TemplatesTab() {
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate, initializeDefaultTemplates, isCreating } = useTemplates();
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    niche: '',
    content: '',
    variables: [] as string[],
    is_default: false,
  });

  const filteredTemplates = selectedNiche && selectedNiche !== 'all'
    ? templates.filter(t => t.niche === selectedNiche)
    : templates;

  const handleCreate = () => {
    createTemplate({
      ...formData,
      variables: formData.content.match(/\{(\w+)\}/g)?.map(v => v.slice(1, -1)) || [],
    });
    setFormData({ name: '', niche: '', content: '', variables: [], is_default: false });
    setIsNewTemplateOpen(false);
  };

  const handleUpdate = () => {
    if (!editingTemplate) return;
    updateTemplate({
      id: editingTemplate.id,
      ...formData,
      variables: formData.content.match(/\{(\w+)\}/g)?.map(v => v.slice(1, -1)) || [],
    });
    setEditingTemplate(null);
    setFormData({ name: '', niche: '', content: '', variables: [], is_default: false });
  };

  const openEditDialog = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      niche: template.niche,
      content: template.content,
      variables: template.variables,
      is_default: template.is_default,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Biblioteca de Templates</CardTitle>
              <CardDescription>Templates de mensagens personalizados por nicho</CardDescription>
            </div>
            <div className="flex gap-2">
              {templates.length === 0 && (
                <Button variant="outline" onClick={() => initializeDefaultTemplates()}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Carregar Templates Padrão
                </Button>
              )}
              <Dialog open={isNewTemplateOpen} onOpenChange={setIsNewTemplateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Template</DialogTitle>
                    <DialogDescription>
                      Crie um template de mensagem para usar em suas campanhas
                    </DialogDescription>
                  </DialogHeader>
                  <TemplateForm formData={formData} setFormData={setFormData} />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewTemplateOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreate} disabled={isCreating}>
                      {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Criar Template
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={selectedNiche} onValueChange={setSelectedNiche}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por nicho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os nichos</SelectItem>
                {NICHES.map((niche) => (
                  <SelectItem key={niche} value={niche}>
                    {niche}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquareText className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhum template encontrado</p>
              <p className="text-sm">Crie templates ou carregue os padrões</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{template.niche}</Badge>
                          {template.is_default && (
                            <Badge variant="outline">Padrão</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditDialog(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                      {template.content}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>{template.response_rate?.toFixed(1) || 0}% resposta</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {template.usage_count || 0} usos
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
          </DialogHeader>
          <TemplateForm formData={formData} setFormData={setFormData} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TemplateForm({ formData, setFormData }: { 
  formData: { name: string; niche: string; content: string; variables: string[]; is_default: boolean };
  setFormData: React.Dispatch<React.SetStateAction<typeof formData>>;
}) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome do Template</Label>
          <Input
            placeholder="Ex: Apresentação Digital"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Nicho</Label>
          <Select
            value={formData.niche}
            onValueChange={(v) => setFormData({ ...formData, niche: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o nicho" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(DEFAULT_TEMPLATES).map((niche) => (
                <SelectItem key={niche} value={niche}>
                  {niche}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Conteúdo da Mensagem</Label>
        <Textarea
          placeholder="Olá! Vi o {nome_empresa} e..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={6}
        />
        <p className="text-xs text-muted-foreground">
          Use variáveis como {'{nome_empresa}'}, {'{localização}'}, {'{nicho}'} para personalização automática.
        </p>
      </div>
    </div>
  );
}
