import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppGroup {
  id: string;
  subject: string;
  size: number;
  creation: number;
  owner: string;
  desc?: string;
}

interface GroupParticipant {
  id: string;
  admin?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, instanceId, groupJids } = await req.json();

    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

    if (!evolutionApiUrl || !evolutionApiKey) {
      console.error('Missing Evolution API configuration');
      return new Response(
        JSON.stringify({ error: 'Evolution API não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!instanceId) {
      console.error('Missing instance ID');
      return new Response(
        JSON.stringify({ error: 'ID da instância não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const baseUrl = evolutionApiUrl.replace(/\/$/, '');

    if (action === 'list_groups') {
      console.log(`Fetching groups for instance: ${instanceId}`);
      
      const response = await fetch(`${baseUrl}/group/fetchAllGroups/${instanceId}`, {
        method: 'GET',
        headers: {
          'apikey': evolutionApiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Evolution API error:', errorText);
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar grupos', details: errorText }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const groups: WhatsAppGroup[] = await response.json();
      console.log(`Found ${groups.length} groups`);

      // Format groups for frontend
      const formattedGroups = groups.map((group) => ({
        id: group.id,
        name: group.subject,
        memberCount: group.size || 0,
        description: group.desc || '',
        createdAt: group.creation ? new Date(group.creation * 1000).toISOString() : null,
      }));

      return new Response(
        JSON.stringify({ groups: formattedGroups }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_participants') {
      if (!groupJids || !Array.isArray(groupJids) || groupJids.length === 0) {
        return new Response(
          JSON.stringify({ error: 'IDs dos grupos não fornecidos' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Fetching participants for ${groupJids.length} groups`);
      
      const allParticipants: Array<{
        phone: string;
        name: string;
        groupId: string;
        groupName: string;
      }> = [];

      for (const groupJid of groupJids) {
        try {
          // First get group info for the name
          const groupInfoResponse = await fetch(`${baseUrl}/group/findGroupInfos/${instanceId}?groupJid=${encodeURIComponent(groupJid)}`, {
            method: 'GET',
            headers: {
              'apikey': evolutionApiKey,
              'Content-Type': 'application/json',
            },
          });

          let groupName = 'Grupo WhatsApp';
          if (groupInfoResponse.ok) {
            const groupInfo = await groupInfoResponse.json();
            groupName = groupInfo.subject || groupName;
          }

          // Get participants
          const response = await fetch(`${baseUrl}/group/participants/${instanceId}?groupJid=${encodeURIComponent(groupJid)}`, {
            method: 'GET',
            headers: {
              'apikey': evolutionApiKey,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            console.error(`Error fetching participants for group ${groupJid}:`, await response.text());
            continue;
          }

          const data = await response.json();
          const participants: GroupParticipant[] = data.participants || data || [];

          for (const participant of participants) {
            // Extract phone number from JID (format: 5511999999999@s.whatsapp.net)
            const phone = participant.id.split('@')[0];
            
            // Skip invalid numbers or group IDs
            if (!phone || phone.includes('-') || phone.length < 10) continue;

            allParticipants.push({
              phone,
              name: `Contato ${phone.slice(-4)}`, // Default name with last 4 digits
              groupId: groupJid,
              groupName,
            });
          }

          console.log(`Found ${participants.length} participants in group ${groupName}`);
        } catch (error) {
          console.error(`Error processing group ${groupJid}:`, error);
        }
      }

      // Remove duplicates based on phone number
      const uniqueParticipants = Array.from(
        new Map(allParticipants.map(p => [p.phone, p])).values()
      );

      console.log(`Total unique participants: ${uniqueParticipants.length}`);

      return new Response(
        JSON.stringify({ participants: uniqueParticipants }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Ação não reconhecida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in whatsapp-groups function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
