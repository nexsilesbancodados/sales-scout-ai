import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
  MapPin,
  Building2,
  Phone,
  Star,
  Globe,
  Send,
  CheckCircle2,
  AlertCircle,
  Users,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { CapturedLead } from './types';

interface LeadResultsTableProps {
  capturedLeads: CapturedLead[];
  selectedLeadIds: string[];
  toggleLeadSelection: (id: string) => void;
  selectAllNew: () => void;
  onSaveLeads: () => void;
  onSendMessages: () => void;
  newCount: number;
  totalResults: number;
  duplicateCount: number;
  isCreating: boolean;
  hasActiveJob: boolean;
  activeJobPayload?: any;
  activeJobCurrentIndex?: number;
  activeJobStatus?: string;
}

export function LeadResultsTable({
  capturedLeads,
  selectedLeadIds,
  toggleLeadSelection,
  selectAllNew,
  onSaveLeads,
  onSendMessages,
  newCount,
  totalResults,
  duplicateCount,
  isCreating,
  hasActiveJob,
  activeJobPayload,
  activeJobCurrentIndex,
  activeJobStatus,
}: LeadResultsTableProps) {
  if (capturedLeads.length === 0) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-muted/50 border">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold">{totalResults}</span>
          <span className="text-sm text-muted-foreground">resultados</span>
        </div>

        <div className="h-6 w-px bg-border hidden sm:block" />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="font-medium">{newCount}</span>
            <span className="text-sm text-muted-foreground">novos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="font-medium">{duplicateCount}</span>
            <span className="text-sm text-muted-foreground">existentes</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={selectAllNew} disabled={newCount === 0}>
            Selecionar Novos ({newCount})
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onSaveLeads}
            disabled={newCount === 0}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Salvar Leads ({newCount})
          </Button>
          <Button
            size="sm"
            onClick={onSendMessages}
            disabled={selectedLeadIds.length === 0 || isCreating || hasActiveJob}
            className="gap-2 gradient-primary"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Enviar ({selectedLeadIds.length})
          </Button>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {capturedLeads.map((lead, index) => {
          const isCurrentlySending =
            activeJobStatus === 'running' &&
            activeJobPayload?.leads?.[activeJobCurrentIndex || 0]?.phone === lead.phone;

          return (
            <Card
              key={lead.id}
              className={cn(
                'group cursor-pointer transition-all duration-200 animate-fade-in overflow-hidden',
                selectedLeadIds.includes(lead.id) && 'ring-2 ring-primary border-primary',
                lead.isDuplicate && 'opacity-60',
                isCurrentlySending && 'ring-2 ring-success border-success animate-pulse'
              )}
              style={{ animationDelay: `${index * 30}ms` }}
              onClick={() => !lead.isDuplicate && toggleLeadSelection(lead.id)}
            >
              <CardContent className="p-0">
                {/* Photo Header */}
                <div className="relative h-24 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                  {lead.photo_url ? (
                    <img
                      src={lead.photo_url}
                      alt={lead.business_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width={300}
                      height={96}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                  )}

                  {isCurrentlySending && (
                    <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
                      <div className="bg-success text-success-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg">
                        <Send className="h-3 w-3 animate-bounce" />
                        Enviando agora...
                      </div>
                    </div>
                  )}

                  {lead.qualityScore && (
                    <Badge
                      variant={lead.qualityScore >= 70 ? 'default' : 'secondary'}
                      className="absolute top-2 right-2 text-xs shadow-md"
                    >
                      {lead.qualityScore}%
                    </Badge>
                  )}

                  {lead.rating && (
                    <div className="absolute top-2 left-2 bg-background/90 rounded-full px-2 py-0.5 flex items-center gap-1 text-xs shadow-md">
                      <Star className="h-3 w-3 text-warning fill-warning" />
                      <span className="font-medium">{lead.rating}</span>
                      {lead.reviews_count && (
                        <span className="text-muted-foreground">({lead.reviews_count})</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedLeadIds.includes(lead.id)}
                      disabled={lead.isDuplicate}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{lead.business_name}</h4>

                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span className="truncate">{lead.phone}</span>
                        </div>

                        {lead.address && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">{lead.address}</span>
                          </div>
                        )}

                        {lead.website && (
                          <div className="flex items-center gap-2 text-xs">
                            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {lead.website.replace(/^https?:\/\//, '').slice(0, 25)}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        <Badge variant="outline" className="text-xs">
                          {lead.niche}
                        </Badge>
                        {lead.lead_group && (
                          <Badge variant="secondary" className="text-xs">
                            {lead.lead_group}
                          </Badge>
                        )}
                        {lead.isDuplicate && (
                          <Badge variant="secondary" className="text-xs bg-warning/10 text-warning border-warning/20">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Existente
                          </Badge>
                        )}
                        {isCurrentlySending && (
                          <Badge className="text-xs bg-success text-success-foreground animate-pulse">
                            <Send className="h-3 w-3 mr-1" />
                            Enviando
                          </Badge>
                        )}
                      </div>

                      {lead.service_opportunities && lead.service_opportunities.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Oportunidades:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {lead.service_opportunities.slice(0, 2).map((opp, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                                {opp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
