import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NichePattern {
  id: string;
  niche: string;
  location: string | null;
  best_contact_hours: number[];
  response_rate_by_hour: Record<string, number>;
  best_opening_style: string | null;
  best_follow_up_interval_days: number;
  avg_messages_to_convert: number | null;
  total_contacts: number;
  total_responses: number;
  total_conversions: number;
  response_rate: number;
  conversion_rate: number;
  common_objections: any[];
  successful_responses: any[];
}

export interface LeadQualification {
  id: string;
  lead_id: string;
  budget_status: string | null;
  budget_details: string | null;
  budget_confidence: number;
  authority_status: string | null;
  authority_details: string | null;
  authority_confidence: number;
  need_status: string | null;
  need_details: string | null;
  need_confidence: number;
  timeline_status: string | null;
  timeline_details: string | null;
  timeline_confidence: number;
  qualification_score: number;
  close_probability: number;
  predicted_close_date: string | null;
  deal_value_estimate: number | null;
}

export interface BuyingSignal {
  id: string;
  lead_id: string;
  signal_type: string;
  signal_strength: number;
  signal_text: string | null;
  context: string | null;
  created_at: string;
}

export interface AgentEscalation {
  id: string;
  lead_id: string;
  escalation_reason: string;
  priority: string;
  context: string | null;
  recommended_action: string | null;
  status: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
}

export interface IntelligentFollowup {
  id: string;
  lead_id: string;
  trigger_reason: string;
  scheduled_at: string;
  message_template: string | null;
  message_sent: string | null;
  status: string;
  sent_at: string | null;
  result: string | null;
}

export interface GeneratedProposal {
  id: string;
  lead_id: string;
  service_id: string | null;
  proposal_title: string;
  executive_summary: string | null;
  identified_needs: string[];
  proposed_solution: string | null;
  deliverables: any[];
  pricing_breakdown: any;
  timeline: string | null;
  terms_conditions: string | null;
  status: string;
  sent_at: string | null;
  viewed_at: string | null;
  response_at: string | null;
  created_at: string;
}

export function useNichePatterns() {
  return useQuery({
    queryKey: ["niche-patterns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("niche_patterns")
        .select("*")
        .order("response_rate", { ascending: false });

      if (error) throw error;
      return data as NichePattern[];
    },
  });
}

export function useLeadQualification(leadId: string) {
  return useQuery({
    queryKey: ["lead-qualification", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_qualification")
        .select("*")
        .eq("lead_id", leadId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as LeadQualification | null;
    },
    enabled: !!leadId,
  });
}

export function useBuyingSignals(leadId?: string) {
  return useQuery({
    queryKey: ["buying-signals", leadId],
    queryFn: async () => {
      let query = supabase
        .from("buying_signals")
        .select("*")
        .order("created_at", { ascending: false });

      if (leadId) {
        query = query.eq("lead_id", leadId);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as BuyingSignal[];
    },
  });
}

export function useAgentEscalations(status?: string) {
  return useQuery({
    queryKey: ["agent-escalations", status],
    queryFn: async () => {
      let query = supabase
        .from("agent_escalations")
        .select(`
          *,
          leads (
            business_name,
            phone,
            niche
          )
        `)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
  });
}

export function useIntelligentFollowups(status?: string) {
  return useQuery({
    queryKey: ["intelligent-followups", status],
    queryFn: async () => {
      let query = supabase
        .from("intelligent_followups")
        .select(`
          *,
          leads (
            business_name,
            phone,
            niche
          )
        `)
        .order("scheduled_at", { ascending: true });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
  });
}

export function useGeneratedProposals(leadId?: string) {
  return useQuery({
    queryKey: ["generated-proposals", leadId],
    queryFn: async () => {
      let query = supabase
        .from("generated_proposals")
        .select(`
          *,
          leads (
            business_name,
            phone,
            niche
          )
        `)
        .order("created_at", { ascending: false });

      if (leadId) {
        query = query.eq("lead_id", leadId);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    },
  });
}

export function useHotLeads() {
  return useQuery({
    queryKey: ["hot-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_qualification")
        .select(`
          *,
          leads (
            id,
            business_name,
            phone,
            niche,
            stage,
            temperature
          )
        `)
        .gte("close_probability", 60)
        .order("close_probability", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });
}

export function useResolveEscalation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      escalationId,
      resolution_notes,
    }: {
      escalationId: string;
      resolution_notes: string;
    }) => {
      const { error } = await supabase
        .from("agent_escalations")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolution_notes,
        })
        .eq("id", escalationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-escalations"] });
      toast.success("Escalação resolvida");
    },
    onError: (error: any) => {
      toast.error(`Erro ao resolver: ${error.message}`);
    },
  });
}

export function useAnalyzePatterns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (action: string) => {
      const { data, error } = await supabase.functions.invoke("analyze-patterns", {
        body: { action },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["niche-patterns"] });
      toast.success("Análise concluída");
    },
    onError: (error: any) => {
      toast.error(`Erro na análise: ${error.message}`);
    },
  });
}

export function useGenerateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lead_id,
      service_name,
    }: {
      lead_id: string;
      service_name?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("generate-proposal", {
        body: { lead_id, service_name },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated-proposals"] });
      toast.success("Proposta gerada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao gerar proposta: ${error.message}`);
    },
  });
}
