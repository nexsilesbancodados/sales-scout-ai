import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  phone?: string;
  email?: string;
  position: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SERPAPI_API_KEY = Deno.env.get('SERPAPI_API_KEY');
    if (!SERPAPI_API_KEY) {
      console.error('SERPAPI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'SerpAPI não configurado. Adicione a chave nas configurações.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader! } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query, location, num_results = 20, search_type = 'google' } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Web search: "${query}" in ${location || 'Brazil'}, type: ${search_type}`);

    // Build search query
    let searchQuery = query;
    if (location) {
      searchQuery = `${query} ${location}`;
    }

    // Use SerpAPI for Google Search
    const serpUrl = new URL('https://serpapi.com/search.json');
    serpUrl.searchParams.set('api_key', SERPAPI_API_KEY);
    serpUrl.searchParams.set('q', searchQuery);
    serpUrl.searchParams.set('num', String(num_results));
    serpUrl.searchParams.set('hl', 'pt-br');
    serpUrl.searchParams.set('gl', 'br');

    if (search_type === 'google') {
      serpUrl.searchParams.set('engine', 'google');
    } else if (search_type === 'news') {
      serpUrl.searchParams.set('engine', 'google_news');
    } else if (search_type === 'images') {
      serpUrl.searchParams.set('engine', 'google_images');
    }

    console.log('Fetching from SerpAPI...');
    const response = await fetch(serpUrl.toString());
    const data = await response.json();

    if (data.error) {
      console.error('SerpAPI error:', data.error);
      return new Response(
        JSON.stringify({ error: data.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract organic results
    const organicResults = data.organic_results || [];
    const results: SearchResult[] = organicResults.map((result: any, idx: number) => {
      // Try to extract phone and email from snippet
      const phoneMatch = result.snippet?.match(/\(?(\d{2})\)?\s*(\d{4,5})[-.\s]?(\d{4})/);
      const emailMatch = result.snippet?.match(/[\w.-]+@[\w.-]+\.\w+/);

      return {
        title: result.title,
        link: result.link,
        snippet: result.snippet || '',
        phone: phoneMatch ? phoneMatch[0] : undefined,
        email: emailMatch ? emailMatch[0] : undefined,
        position: idx + 1,
      };
    });

    // Also check knowledge graph and local results
    const localResults = data.local_results?.places || [];
    const localLeads = localResults.map((place: any, idx: number) => ({
      title: place.title,
      link: place.link || place.website,
      snippet: place.address || '',
      phone: place.phone,
      position: results.length + idx + 1,
    }));

    const allResults = [...results, ...localLeads];

    console.log(`Found ${allResults.length} results`);

    return new Response(
      JSON.stringify({
        success: true,
        results: allResults,
        total: allResults.length,
        search_info: {
          query: searchQuery,
          search_type,
          total_results: data.search_information?.total_results,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Web search error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
