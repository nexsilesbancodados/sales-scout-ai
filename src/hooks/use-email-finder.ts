import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmailResult {
  email: string;
  confidence: number;
  first_name?: string;
  last_name?: string;
  position?: string;
  linkedin?: string;
  twitter?: string;
}

interface FindEmailResult {
  success: boolean;
  emails: EmailResult[];
  domain?: string;
  organization?: string;
  pattern?: string;
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
}

interface EnrichResult {
  success: boolean;
  enrichment: {
    linkedin_url?: string;
    facebook_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    company_description?: string;
    industry?: string;
  };
  email: string | null;
  email_confidence: number;
  lead_id?: string;
}

interface BulkEnrichResult {
  success: boolean;
  results: {
    lead_id: string;
    status: 'enriched' | 'skipped' | 'error' | 'no_emails_found';
    email?: string;
    confidence?: number;
    reason?: string;
    error?: string;
  }[];
}

export function useEmailFinder() {
  const { toast } = useToast();

  const findEmail = useMutation({
    mutationFn: async ({ domain, company_name }: { domain?: string; company_name?: string }): Promise<FindEmailResult> => {
      const { data, error } = await supabase.functions.invoke('email-finder', {
        body: {
          action: 'find_email',
          data: { domain, company_name },
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao buscar email',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const verifyEmail = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.functions.invoke('email-finder', {
        body: {
          action: 'verify_email',
          data: { email },
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao verificar email',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const enrichLead = useMutation({
    mutationFn: async ({ 
      lead_id, 
      domain, 
      company_name,
      website 
    }: { 
      lead_id?: string; 
      domain?: string; 
      company_name?: string;
      website?: string;
    }): Promise<EnrichResult> => {
      const { data, error } = await supabase.functions.invoke('email-finder', {
        body: {
          action: 'enrich_lead',
          data: { lead_id, domain, company_name, website },
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      if (data.email) {
        toast({
          title: 'Lead enriquecido!',
          description: `Email encontrado: ${data.email} (${data.email_confidence}% confiança)`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao enriquecer lead',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const bulkEnrich = useMutation({
    mutationFn: async (lead_ids: string[]): Promise<BulkEnrichResult> => {
      const { data, error } = await supabase.functions.invoke('email-finder', {
        body: {
          action: 'bulk_enrich',
          data: { lead_ids },
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      const enriched = data.results.filter(r => r.status === 'enriched').length;
      toast({
        title: 'Enriquecimento concluído!',
        description: `${enriched} de ${data.results.length} leads enriquecidos.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro no enriquecimento em massa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    findEmail,
    verifyEmail,
    enrichLead,
    bulkEnrich,
  };
}
