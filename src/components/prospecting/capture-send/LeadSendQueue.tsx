import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { ProcessStatus } from './types';

interface LeadSendQueueProps {
  processStatus: ProcessStatus;
  hasLeads: boolean;
}

export function LeadSendQueue({ processStatus, hasLeads }: LeadSendQueueProps) {
  if (hasLeads || processStatus !== 'idle') return null;

  return (
    <Card className="border-dashed">
      <CardContent className="py-16 text-center">
        <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Nenhum lead capturado</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Digite um nicho e localização acima para começar a buscar leads potenciais para sua prospecção.
        </p>
      </CardContent>
    </Card>
  );
}
