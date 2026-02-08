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

// Extended search result with more data
interface ExtendedSearchResult extends SearchResult {
  rating?: number;
  reviews_count?: number;
  website?: string;
  address?: string;
  google_maps_url?: string;
  photo_url?: string;
  thumbnail?: string;
  category?: string;
}

// Subniches for expanded search - variations of each main niche
const SUBNICHES: Record<string, string[]> = {
  "restaurantes": ["restaurante", "restaurantes", "comida", "lanchonete", "self-service", "rodízio", "buffet", "churrascaria", "pizzaria", "hamburgueria", "sushi", "japonês", "italiana", "mexicana", "árabe", "bistrô", "cafeteria", "padaria", "bar e restaurante", "delivery comida"],
  "salão de beleza": ["salão de beleza", "cabeleireiro", "cabelo", "manicure", "esmalteria", "estética", "maquiagem", "sobrancelha", "depilação", "spa", "nail designer", "hair stylist"],
  "academia": ["academia", "fitness", "musculação", "crossfit", "pilates", "yoga", "personal trainer", "ginástica", "natação", "artes marciais", "funcional"],
  "clínica": ["clínica médica", "consultório médico", "médico", "centro médico", "dermatologista", "cardiologista", "ortopedista", "fisioterapia", "psicólogo", "nutricionista"],
  "dentista": ["dentista", "odontologia", "clínica odontológica", "ortodontista", "implante dentário", "clareamento dental"],
  "advogado": ["advogado", "advocacia", "escritório de advocacia", "advogados", "escritório jurídico", "consultoria jurídica"],
  "pet shop": ["pet shop", "petshop", "banho e tosa", "clínica veterinária", "veterinário", "ração", "acessórios pet"],
  "oficina": ["oficina mecânica", "mecânica", "mecânico", "auto center", "funilaria", "elétrica automotiva", "troca de óleo", "alinhamento"],
  "loja": ["loja de roupas", "roupas", "moda", "boutique", "vestuário", "calçados", "sapatos", "acessórios"],
  "imobiliária": ["imobiliária", "corretor de imóveis", "imóveis", "venda de imóveis", "aluguel"],
  "hotel": ["hotel", "pousada", "hospedagem", "resort", "hostel", "airbnb"],
  "escola": ["escola", "curso", "cursos", "escola de idiomas", "inglês", "escola de música", "informática", "reforço escolar"],
  "floricultura": ["floricultura", "flores", "florista", "plantas", "jardim", "paisagismo"],
  "farmácia": ["farmácia", "drogaria", "farmácia de manipulação", "medicamentos"],
  "barbearia": ["barbearia", "barbeiro", "barber shop", "corte masculino"],
};

// Get search variations for a niche
function getSearchVariations(niche: string): string[] {
  const nicheLower = niche.toLowerCase().trim();
  
  // Check if niche matches any key
  for (const [key, variations] of Object.entries(SUBNICHES)) {
    if (nicheLower.includes(key) || key.includes(nicheLower)) {
      return variations;
    }
  }
  
  // Check if niche matches any variation
  for (const [_, variations] of Object.entries(SUBNICHES)) {
    if (variations.some(v => nicheLower.includes(v) || v.includes(nicheLower))) {
      return variations;
    }
  }
  
  // Return the niche itself if no match
  return [niche];
}

// Search using Serper.dev API with expanded variations
async function searchWithSerper(
  apiKey: string,
  searchQuery: string,
  location: string,
  numResults: number,
  searchType: string,
  expandSearch: boolean = true
): Promise<{ results: ExtendedSearchResult[]; searchInfo: any }> {
  console.log(`Using Serper.dev API for ${expandSearch ? 'expanded' : 'single'} search...`);
  
  const allResults: ExtendedSearchResult[] = [];
  const seenPhones = new Set<string>();
  const seenNames = new Set<string>();
  
  // Get search variations if expanded search is enabled
  const searchTerms = expandSearch ? getSearchVariations(searchQuery) : [searchQuery];
  console.log(`Search terms: ${searchTerms.slice(0, 5).join(', ')}... (${searchTerms.length} total)`);
  
  const endpoint = searchType === 'places' 
    ? 'https://google.serper.dev/places'
    : 'https://google.serper.dev/search';
  
  for (const term of searchTerms) {
    // Stop if we have enough results
    if (numResults > 0 && allResults.length >= numResults) break;
    
    const fullQuery = location ? `${term} ${location}` : term;
    console.log(`Searching: "${fullQuery}"`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: fullQuery,
          gl: 'br',
          hl: 'pt-br',
          num: 100,
        }),
      });

      if (!response.ok) {
        console.warn(`Serper error for "${term}": ${response.status}`);
        continue;
      }

      const data = await response.json();

      // Handle places/local results with full data
      if (data.places && data.places.length > 0) {
        console.log(`Found ${data.places.length} places for "${term}"`);
        
        for (const place of data.places) {
          const phone = place.phoneNumber || place.phone;
          if (!phone) continue;
          
          const normalizedPhone = phone.replace(/\D/g, '');
          if (seenPhones.has(normalizedPhone)) continue;
          
          const normalizedName = (place.title || '').toLowerCase().trim();
          if (seenNames.has(normalizedName)) continue;
          
          seenPhones.add(normalizedPhone);
          seenNames.add(normalizedName);

          allResults.push({
            title: place.title,
            link: place.website || place.link || '',
            snippet: place.address || '',
            phone: phone,
            position: allResults.length + 1,
            rating: place.rating,
            reviews_count: place.reviews || place.reviewsCount,
            website: place.website,
            address: place.address,
            google_maps_url: place.cid ? `https://www.google.com/maps?cid=${place.cid}` : undefined,
            photo_url: place.thumbnailUrl || place.imageUrl || place.thumbnail,
            thumbnail: place.thumbnailUrl || place.imageUrl || place.thumbnail,
            category: place.category || place.type,
          });
        }
      }

      // Handle organic results as fallback
      if (data.organic && data.organic.length > 0) {
        for (const result of data.organic) {
          const phoneMatch = result.snippet?.match(/\(?(\d{2})\)?\s*(\d{4,5})[-.\s]?(\d{4})/);
          const phone = phoneMatch ? phoneMatch[0] : undefined;
          
          if (phone) {
            const normalizedPhone = phone.replace(/\D/g, '');
            if (seenPhones.has(normalizedPhone)) continue;
            seenPhones.add(normalizedPhone);

            const emailMatch = result.snippet?.match(/[\w.-]+@[\w.-]+\.\w+/);
            allResults.push({
              title: result.title,
              link: result.link,
              snippet: result.snippet || '',
              phone: phone,
              email: emailMatch ? emailMatch[0] : undefined,
              position: allResults.length + 1,
              thumbnail: result.imageUrl || result.thumbnail,
            });
          }
        }
      }

      // Small delay between searches
      await new Promise(r => setTimeout(r, 150));
    } catch (error) {
      console.error(`Error searching "${term}":`, error);
      continue;
    }
  }

  console.log(`Serper: Found ${allResults.length} unique leads with phone numbers using ${searchTerms.length} search terms`);

  return {
    results: allResults,
    searchInfo: {
      query: searchQuery,
      location: location,
      search_type: searchType,
      total_results: allResults.length,
      search_terms_used: searchTerms.length,
    },
  };
}

// Search using SerpAPI with Google Maps engine - NO LIMITS
async function searchWithSerpApi(
  apiKey: string,
  searchQuery: string,
  numResults: number,
  searchType: string
): Promise<{ results: ExtendedSearchResult[]; searchInfo: any }> {
  console.log('Using SerpAPI for unlimited Google Maps search...');
  
  const allResults: ExtendedSearchResult[] = [];
  const seenPhones = new Set<string>();
  let start = 0;
  const maxPages = 10; // Up to 10 pages

  // Use Google Maps engine for places search
  const engine = searchType === 'places' ? 'google_maps' : 'google';

  while (start < maxPages * 20) {
    try {
      const serpUrl = new URL('https://serpapi.com/search.json');
      serpUrl.searchParams.set('api_key', apiKey);
      serpUrl.searchParams.set('q', searchQuery);
      serpUrl.searchParams.set('hl', 'pt-br');
      serpUrl.searchParams.set('gl', 'br');
      serpUrl.searchParams.set('engine', engine);
      
      if (engine === 'google_maps') {
        serpUrl.searchParams.set('type', 'search');
        serpUrl.searchParams.set('start', String(start));
      } else {
        serpUrl.searchParams.set('num', '100');
        serpUrl.searchParams.set('start', String(start));
      }

      const response = await fetch(serpUrl.toString());
      const data = await response.json();

      if (data.error) {
        if (start === 0) {
          console.error('SerpAPI error:', data.error);
          throw new Error(data.error);
        }
        break;
      }

      let foundNewResults = false;

      // Handle Google Maps local results
      const localResults = data.local_results || [];
      for (const place of localResults) {
        const phone = place.phone;
        if (!phone) continue;
        
        const normalizedPhone = phone.replace(/\D/g, '');
        if (seenPhones.has(normalizedPhone)) continue;
        seenPhones.add(normalizedPhone);
        foundNewResults = true;

        allResults.push({
          title: place.title,
          link: place.website || place.link,
          snippet: place.address || '',
          phone: phone,
          position: allResults.length + 1,
          rating: place.rating,
          reviews_count: place.reviews,
          website: place.website,
          address: place.address,
          google_maps_url: place.place_id ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}` : undefined,
          photo_url: place.thumbnail,
          thumbnail: place.thumbnail,
          category: place.type,
        });
      }

      // Handle organic results
      const organicResults = data.organic_results || [];
      for (const result of organicResults) {
        const phoneMatch = result.snippet?.match(/\(?(\d{2})\)?\s*(\d{4,5})[-.\s]?(\d{4})/);
        const phone = phoneMatch ? phoneMatch[0] : undefined;
        
        if (phone) {
          const normalizedPhone = phone.replace(/\D/g, '');
          if (seenPhones.has(normalizedPhone)) continue;
          seenPhones.add(normalizedPhone);
          foundNewResults = true;

          const emailMatch = result.snippet?.match(/[\w.-]+@[\w.-]+\.\w+/);
          allResults.push({
            title: result.title,
            link: result.link,
            snippet: result.snippet || '',
            phone: phone,
            email: emailMatch ? emailMatch[0] : undefined,
            position: allResults.length + 1,
            thumbnail: result.thumbnail,
          });
        }
      }

      // Stop if no new results or reached target
      if (!foundNewResults || (numResults > 0 && allResults.length >= numResults)) {
        break;
      }

      start += 20;
      await new Promise(r => setTimeout(r, 100));
    } catch (error) {
      console.error(`Error fetching start ${start}:`, error);
      break;
    }
  }

  console.log(`SerpAPI: Found ${allResults.length} unique leads with phone numbers`);

  return {
    results: allResults,
    searchInfo: {
      query: searchQuery,
      search_type: searchType,
      total_results: allResults.length,
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

    const { query, location, num_results = 0, search_type = 'places', expand_search = true } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Web search: query="${query}" location="${location || 'Brasil'}", type: ${search_type}, expand: ${expand_search}, preferred: ${preferredApi}`);

    let searchResult: { results: ExtendedSearchResult[]; searchInfo: any } | null = null;
    let apiUsed = '';
    let fallbackReason = '';

    // Try preferred API first
    if (preferredApi === 'serper' && serperApiKey) {
      try {
        searchResult = await searchWithSerper(serperApiKey, query, location || 'Brasil', num_results, search_type, expand_search);
        apiUsed = 'serper';
      } catch (error: any) {
        console.warn('Serper API failed, trying fallback:', error.message);
        fallbackReason = error.message;
      }
    } else if (preferredApi === 'serpapi' && (serpApiKey || GLOBAL_SERPAPI_KEY)) {
      try {
        const apiKey = serpApiKey || GLOBAL_SERPAPI_KEY!;
        const fullQuery = location ? `${query} ${location}` : query;
        searchResult = await searchWithSerpApi(apiKey, fullQuery, num_results, search_type);
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
            const fullQuery = location ? `${query} ${location}` : query;
            searchResult = await searchWithSerpApi(fallbackKey, fullQuery, num_results, search_type);
            apiUsed = 'serpapi (fallback)';
          } catch (error: any) {
            console.error('SerpAPI fallback also failed:', error.message);
          }
        }
      } else {
        // Try Serper as fallback
        if (serperApiKey) {
          try {
            searchResult = await searchWithSerper(serperApiKey, query, location || 'Brasil', num_results, search_type, expand_search);
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
