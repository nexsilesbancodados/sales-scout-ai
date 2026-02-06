import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportRequest {
  type: 'leads' | 'analytics' | 'campaigns' | 'conversations';
  format: 'csv' | 'json';
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    stage?: string;
    niche?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, format, filters }: ReportRequest = await req.json();

    let data: any[] = [];
    let filename = "";

    switch (type) {
      case 'leads': {
        let query = supabase
          .from('leads')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (filters?.dateFrom) {
          query = query.gte('created_at', filters.dateFrom);
        }
        if (filters?.dateTo) {
          query = query.lte('created_at', filters.dateTo);
        }
        if (filters?.stage) {
          query = query.eq('stage', filters.stage);
        }
        if (filters?.niche) {
          query = query.eq('niche', filters.niche);
        }

        const { data: leads, error } = await query;
        if (error) throw error;
        
        data = (leads || []).map(lead => ({
          'Nome': lead.business_name,
          'Telefone': lead.phone,
          'Email': lead.email || '',
          'Nicho': lead.niche || '',
          'Estágio': lead.stage,
          'Temperatura': lead.temperature || '',
          'Localização': lead.location || '',
          'Website': lead.website || '',
          'Score': lead.quality_score || '',
          'Último Contato': lead.last_contact_at || '',
          'Criado em': lead.created_at,
        }));
        filename = `leads_${new Date().toISOString().split('T')[0]}`;
        break;
      }

      case 'analytics': {
        const { data: stats, error } = await supabase
          .from('prospecting_stats')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;

        data = (stats || []).map(stat => ({
          'Data': stat.date,
          'Nicho': stat.niche,
          'Localização': stat.location || '',
          'Mensagens Enviadas': stat.messages_sent || 0,
          'Respostas Recebidas': stat.responses_received || 0,
          'Respostas Positivas': stat.positive_responses || 0,
          'Taxa de Resposta': stat.messages_sent ? 
            ((stat.responses_received || 0) / stat.messages_sent * 100).toFixed(1) + '%' : '0%',
        }));
        filename = `analytics_${new Date().toISOString().split('T')[0]}`;
        break;
      }

      case 'campaigns': {
        const { data: campaigns, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        data = (campaigns || []).map(campaign => ({
          'Nome': campaign.name,
          'Tipo': campaign.campaign_type,
          'Status': campaign.status,
          'Nichos': campaign.niches?.join(', ') || '',
          'Locais': campaign.locations?.join(', ') || '',
          'Leads Encontrados': campaign.leads_found || 0,
          'Leads Contactados': campaign.leads_contacted || 0,
          'Leads Responderam': campaign.leads_responded || 0,
          'Criado em': campaign.created_at,
          'Concluído em': campaign.completed_at || '',
        }));
        filename = `campaigns_${new Date().toISOString().split('T')[0]}`;
        break;
      }

      case 'conversations': {
        // First get user's leads
        const { data: userLeads } = await supabase
          .from('leads')
          .select('id, business_name, phone')
          .eq('user_id', user.id);

        if (!userLeads || userLeads.length === 0) {
          data = [];
        } else {
          const leadIds = userLeads.map(l => l.id);
          const leadMap = new Map(userLeads.map(l => [l.id, l]));

          const { data: messages, error } = await supabase
            .from('chat_messages')
            .select('*')
            .in('lead_id', leadIds)
            .order('sent_at', { ascending: false })
            .limit(1000);

          if (error) throw error;

          data = (messages || []).map(msg => {
            const lead = leadMap.get(msg.lead_id);
            return {
              'Lead': lead?.business_name || '',
              'Telefone': lead?.phone || '',
              'Remetente': msg.sender_type === 'user' ? 'Você' : 
                           msg.sender_type === 'lead' ? 'Lead' : 'Agente IA',
              'Mensagem': msg.content,
              'Status': msg.status || '',
              'Enviado em': msg.sent_at,
            };
          });
        }
        filename = `conversations_${new Date().toISOString().split('T')[0]}`;
        break;
      }
    }

    if (format === 'csv') {
      if (data.length === 0) {
        return new Response(JSON.stringify({ error: "Nenhum dado encontrado" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            let cell = String(row[header] || '');
            // Escape quotes and wrap in quotes if contains comma or newline
            if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
              cell = `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          }).join(',')
        )
      ];
      
      const csv = csvRows.join('\n');
      
      return new Response(csv, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      });
    }

    // JSON format
    return new Response(JSON.stringify({ data, filename: `${filename}.json` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Report generation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
