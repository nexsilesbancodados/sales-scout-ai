import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserSettings } from '@/hooks/use-user-settings';
import {
  Shield,
  Clock,
  Zap,
  Users,
  ChevronDown,
  ChevronUp,
  Settings2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function QuickConfigBanner() {
  const { settings, isLoading } = useUserSettings();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading || !settings) return null;

  // Check connection status
  const isWhatsAppConnected = settings.whatsapp_connected;
  const hasApiKey = !!settings.gemini_api_key;
  const hasKnowledge = !!settings.knowledge_base?.trim();

  // Calculate current config summary
  const dailyLimit = settings.daily_message_limit || 30;
  const intervalMin = settings.message_interval_seconds || 60;
  const operateAllDay = settings.operate_all_day;
  const workDaysOnly = settings.work_days_only ?? true;
  const warmupEnabled = settings.warmup_enabled ?? true;
  const warmupDay = settings.warmup_day || 1;

  // Determine risk level
  const getRiskInfo = () => {
    if (dailyLimit <= 30 && intervalMin >= 90 && warmupEnabled && warmupDay <= 3) {
      return { level: 'safe', label: 'Seguro', color: 'text-green-600 bg-green-500/10' };
    }
    if (dailyLimit <= 60 && intervalMin >= 60) {
      return { level: 'moderate', label: 'Moderado', color: 'text-yellow-600 bg-yellow-500/10' };
    }
    return { level: 'high', label: 'Alto Risco', color: 'text-destructive bg-destructive/10' };
  };

  const riskInfo = getRiskInfo();
  const hasIssues = !isWhatsAppConnected || !hasApiKey;

  return (
    <Card className={cn(
      "border-l-4 transition-all",
      hasIssues ? "border-l-destructive bg-destructive/5" : 
      riskInfo.level === 'safe' ? "border-l-green-500 bg-green-500/5" :
      riskInfo.level === 'moderate' ? "border-l-yellow-500 bg-yellow-500/5" :
      "border-l-destructive bg-destructive/5"
    )}>
      <CardContent className="py-3">
        {/* Collapsed view */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Connection status */}
            <div className="flex items-center gap-2">
              {isWhatsAppConnected ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              <span className="text-sm font-medium">
                {isWhatsAppConnected ? 'WhatsApp Conectado' : 'WhatsApp Desconectado'}
              </span>
            </div>

            {/* Separator */}
            <div className="hidden sm:block h-4 w-px bg-border" />

            {/* Quick stats */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>{dailyLimit}/dia</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{intervalMin}s</span>
              </div>
              {operateAllDay && (
                <Badge variant="outline" className="text-xs py-0">
                  <Zap className="h-3 w-3 mr-1" />
                  24h
                </Badge>
              )}
              {warmupEnabled && (
                <Badge variant="secondary" className="text-xs py-0">
                  🔥 Dia {warmupDay}
                </Badge>
              )}
            </div>

            {/* Separator */}
            <div className="hidden md:block h-4 w-px bg-border" />

            {/* Risk badge */}
            <Badge className={cn("text-xs", riskInfo.color)}>
              <Shield className="h-3 w-3 mr-1" />
              {riskInfo.label}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/settings')}
              className="h-8"
            >
              <Settings2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Configurar</span>
            </Button>
          </div>
        </div>

        {/* Expanded view */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-3">
            {/* Checklist */}
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              <div className={cn(
                "flex items-center gap-2 p-2 rounded-lg text-sm",
                isWhatsAppConnected ? "bg-green-500/10" : "bg-destructive/10"
              )}>
                {isWhatsAppConnected ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <span>WhatsApp</span>
              </div>

              <div className={cn(
                "flex items-center gap-2 p-2 rounded-lg text-sm",
                hasApiKey ? "bg-green-500/10" : "bg-yellow-500/10"
              )}>
                {hasApiKey ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <span>API Gemini</span>
              </div>

              <div className={cn(
                "flex items-center gap-2 p-2 rounded-lg text-sm",
                hasKnowledge ? "bg-green-500/10" : "bg-yellow-500/10"
              )}>
                {hasKnowledge ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <span>Base de Conhecimento</span>
              </div>

              <div className={cn(
                "flex items-center gap-2 p-2 rounded-lg text-sm",
                warmupEnabled ? "bg-green-500/10" : "bg-muted"
              )}>
                {warmupEnabled ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                )}
                <span>Warmup {warmupEnabled ? `(Dia ${warmupDay})` : 'Desativado'}</span>
              </div>
            </div>

            {/* Quick settings summary */}
            <div className="text-xs text-muted-foreground">
              <strong>Horário:</strong>{' '}
              {operateAllDay ? 'Operação 24 horas' : `${settings.auto_start_hour || 9}h às ${settings.auto_end_hour || 18}h`}
              {workDaysOnly && ' (dias úteis)'}
              {' • '}
              <strong>Intervalo:</strong> {intervalMin}s-{settings.message_interval_max || 180}s
              {' • '}
              <strong>Lote:</strong> {settings.batch_size || 10} msgs + {settings.cooldown_minutes || 15}min pausa
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
