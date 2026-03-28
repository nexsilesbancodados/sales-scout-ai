import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, data } = await req.json();

    switch (action) {
      case 'get_best_chip': {
        // For now, return the main instance
        const { data: settings } = await supabase
          .from('user_settings')
          .select('whatsapp_instance_id, whatsapp_connected')
          .eq('user_id', user.id)
          .single();

        if (!settings?.whatsapp_connected) {
          return new Response(JSON.stringify({ error: 'No connected chips' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({
          instance_id: settings.whatsapp_instance_id,
          strategy: data?.strategy || 'round_robin',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'list_chips': {
        const { data: settings } = await supabase
          .from('user_settings')
          .select('whatsapp_instance_id, whatsapp_connected')
          .eq('user_id', user.id)
          .single();

        const chips = [];
        if (settings?.whatsapp_connected && settings?.whatsapp_instance_id) {
          chips.push({
            id: 'main',
            instance_id: settings.whatsapp_instance_id,
            status: 'connected',
            health: 'healthy',
          });
        }

        return new Response(JSON.stringify({ chips }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
