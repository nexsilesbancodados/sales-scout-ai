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

// Search using Serper.dev API
async function searchWithSerper(
  apiKey: string,
  searchQuery: string,
  numResults: number,
  searchType: string
): Promise<{ results: SearchResult[]; searchInfo: any }> {
  console.log('Using Serper.dev API for search...');
  
  let endpoint = 'https://google.serper.dev/search';
  if (searchType === 'news') {
    endpoint = 'https://google.serper.dev/news';
  } else if (searchType === 'images') {
    endpoint = 'https://google.serper.dev/images';
  } else if (searchType === 'places') {
    endpoint = 'https://google.serper.dev/places';
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: searchQuery,
      gl: 'br',
      hl: 'pt-br',
      num: numResults,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Serper API error:', errorText);
    throw new Error(`Serper API error: ${response.status}`);
  }

  const data = await response.json();

  // Normalize Serper response to match our internal format
  const results: SearchResult[] = [];

  // Handle organic results
  if (data.organic) {
    for (let idx = 0; idx < data.organic.length; idx++) {
      const result = data.organic[idx];
      const phoneMatch = result.snippet?.match(/\(?(\d{2})\)?\s*(\d{4,5})[-.\s]?(\d{4})/);
      const emailMatch = result.snippet?.match(/[\w.-]+@[\w.-]+\.\w+/);

      results.push({
        title: result.title,
        link: result.link,
        snippet: result.snippet || '',
        phone: phoneMatch ? phoneMatch[0] : undefined,
        email: emailMatch ? emailMatch[0] : undefined,
        position: idx + 1,
      });
    }
  }

  // Handle places/local results
  if (data.places) {
    for (let idx = 0; idx < data.places.length; idx++) {
      const place = data.places[idx];
      results.push({
        title: place.title,
        link: place.website || place.link || '',
        snippet: place.address || '',
        phone: place.phoneNumber,
        position: results.length + 1,
      });
    }
  }

  return {
    results,
    searchInfo: {
      query: searchQuery,
      search_type: searchType,
      total_results: data.searchParameters?.totalResults || results.length,
      credits_used: data.credits || 1,
    },
  };
}

// Search using SerpAPI
async function searchWithSerpApi(
  apiKey: string,
  searchQuery: string,
  numResults: number,
  searchType: string
): Promise<{ results: SearchResult[]; searchInfo: any }> {
  console.log('Using SerpAPI for search...');
  
  const serpUrl = new URL('https://serpapi.com/search.json');
  serpUrl.searchParams.set('api_key', apiKey);
  serpUrl.searchParams.set('q', searchQuery);
  serpUrl.searchParams.set('num', String(numResults));
  serpUrl.searchParams.set('hl', 'pt-br');
  serpUrl.searchParams.set('gl', 'br');

  if (searchType === 'google') {
    serpUrl.searchParams.set('engine', 'google');
  } else if (searchType === 'news') {
    serpUrl.searchParams.set('engine', 'google_news');
  } else if (searchType === 'images') {
    serpUrl.searchParams.set('engine', 'google_images');
  }

  const response = await fetch(serpUrl.toString());
  const data = await response.json();

  if (data.error) {
    console.error('SerpAPI error:', data.error);
    throw new Error(data.error);
  }

  // Extract organic results
  const organicResults = data.organic_results || [];
  const results: SearchResult[] = organicResults.map((result: any, idx: number) => {
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

  // Also check local results
  const localResults = data.local_results?.places || [];
  const localLeads = localResults.map((place: any, idx: number) => ({
    title: place.title,
    link: place.link || place.website,
    snippet: place.address || '',
    phone: place.phone,
    position: results.length + idx + 1,
  }));

  return {
    results: [...results, ...localLeads],
    searchInfo: {
      query: searchQuery,
      search_type: searchType,
      total_results: data.search_information?.total_results,
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
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

    // Get user settings to determine preferred API
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('serper_api_key, serpapi_api_key, preferred_search_api')
      .eq('user_id', user.id)
      .single();

    const preferredApi = userSettings?.preferred_search_api || 'serper';
    const serperApiKey = userSettings?.serper_api_key;
    const serpApiKey = userSettings?.serpapi_api_key;
    
    // Fallback to global secrets if user doesn't have their own keys
    const GLOBAL_SERPAPI_KEY = Deno.env.get('SERPAPI_API_KEY');

    console.log(`User preferred API: ${preferredApi}, Serper key: ${serperApiKey ? 'set' : 'not set'}, SerpAPI key: ${serpApiKey ? 'set' : 'not set'}`);

    const { query, location, num_results = 20, search_type = 'google' } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build search query
    let searchQuery = query;
    if (location) {
      searchQuery = `${query} ${location}`;
    }

    console.log(`Web search: "${searchQuery}" in ${location || 'Brazil'}, type: ${search_type}, preferred: ${preferredApi}`);

    let searchResult: { results: SearchResult[]; searchInfo: any } | null = null;
    let apiUsed = '';
    let fallbackReason = '';

    // Try preferred API first
    if (preferredApi === 'serper' && serperApiKey) {
      try {
        searchResult = await searchWithSerper(serperApiKey, searchQuery, num_results, search_type);
        apiUsed = 'serper';
      } catch (error: any) {
        console.warn('Serper API failed, trying fallback:', error.message);
        fallbackReason = error.message;
      }
    } else if (preferredApi === 'serpapi' && (serpApiKey || GLOBAL_SERPAPI_KEY)) {
      try {
        const apiKey = serpApiKey || GLOBAL_SERPAPI_KEY!;
        searchResult = await searchWithSerpApi(apiKey, searchQuery, num_results, search_type);
        apiUsed = 'serpapi';
      } catch (error: any) {
        console.warn('SerpAPI failed, trying fallback:', error.message);
        fallbackReason = error.message;
      }
    }

    // Try fallback if primary failed or wasn't available
    if (!searchResult) {
      if (preferredApi === 'serper') {
        // Try SerpAPI as fallback
        const fallbackKey = serpApiKey || GLOBAL_SERPAPI_KEY;
        if (fallbackKey) {
          try {
            searchResult = await searchWithSerpApi(fallbackKey, searchQuery, num_results, search_type);
            apiUsed = 'serpapi (fallback)';
          } catch (error: any) {
            console.error('SerpAPI fallback also failed:', error.message);
          }
        }
      } else {
        // Try Serper as fallback
        if (serperApiKey) {
          try {
            searchResult = await searchWithSerper(serperApiKey, searchQuery, num_results, search_type);
            apiUsed = 'serper (fallback)';
          } catch (error: any) {
            console.error('Serper fallback also failed:', error.message);
          }
        }
      }
    }

    // If still no result, return error
    if (!searchResult) {
      return new Response(
        JSON.stringify({ 
          error: 'Nenhuma API de busca configurada ou todas falharam. Configure Serper.dev ou SerpAPI em Configurações > APIs.',
          fallback_reason: fallbackReason,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${searchResult.results.length} results using ${apiUsed}`);

    return new Response(
      JSON.stringify({
        success: true,
        results: searchResult.results,
        total: searchResult.results.length,
        search_info: {
          ...searchResult.searchInfo,
          api_used: apiUsed,
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
