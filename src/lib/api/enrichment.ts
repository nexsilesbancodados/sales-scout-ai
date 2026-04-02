import { supabase } from '@/integrations/supabase/client';

async function invoke(action: string, params: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke('lead-enrichment', {
    body: { action, ...params },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

export const enrichmentApi = {
  /** Busca endereço pelo CEP (ViaCEP) */
  lookupCep: (cep: string) => invoke('cep', { cep }),

  /** Busca endereço pelo CEP (BrasilAPI - mais completo) */
  lookupCepBrasil: (cep: string) => invoke('cep_brasil', { cep }),

  /** Consulta CNPJ via BrasilAPI */
  lookupCnpj: (cnpj: string) => invoke('cnpj', { cnpj }),

  /** Informações de um DDD (estado, cidades) */
  lookupDdd: (ddd: string) => invoke('ddd', { ddd }),

  /** Lista de bancos brasileiros */
  listBanks: () => invoke('banks'),

  /** Feriados nacionais do ano */
  listHolidays: (year?: string) => invoke('holidays', { year }),

  /** URL do logo de qualquer empresa pelo domínio (Clearbit) */
  getLogo: (domain: string) => invoke('logo', { domain }),

  /** WHOIS/RDAP de um domínio (registro, validade, dono) */
  lookupWhois: (domain: string) => invoke('whois', { domain }),

  /** Enriquecimento completo de um lead (DDD + logo + WHOIS) */
  enrichLead: (lead: { phone?: string; website?: string; address?: string }) =>
    invoke('enrich', { lead }),

  /** Gera a URL do logo direto (sem chamada ao servidor) */
  getLogoUrl: (domain: string) => {
    const clean = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    return `https://logo.clearbit.com/${clean}`;
  },
};
