import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// FREE: Search Facebook pages via DuckDuckGo
async function searchFacebookPages(niche: string, location: string, limit: number): Promise<any[]> {
  const pages: any[] = [];
  const seenNames = new Set<string>();

  const queries = [
    `site:facebook.com "${niche}" "${location}" telefone`,
    `site:facebook.com "${niche}" "${location}"`,
    `facebook.com "${niche}" ${location} contato telefone`,
  ];

  for (const query of queries) {
    if (pages.length >= limit) break;

    try {
      const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const response = await fetch(ddgUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html',
          'Accept-Language': 'pt-BR,pt;q=0.9',
        },
      });

      if (!response.ok) continue;

      const html = await response.text();
      const resultBlocks = html.split('class="result__body"');

      for (let i = 1; i < resultBlocks.length && pages.length < limit; i++) {
        const block = resultBlocks[i];

        // Extract URL
        const linkMatch = block.match(/href="([^"]+)"[^>]*class="result__a"/);
        let link = linkMatch ? linkMatch[1] : '';
        if (link.includes('uddg=')) {
          link = decodeURIComponent(link.split('uddg=')[1]?.split('&')[0] || '');
        }

        // Check if it's a Facebook page URL
        if (!link.includes('facebook.com') || link.includes('/posts/') || link.includes('/photos/') || link.includes('/videos/')) continue;

        // Extract title
        const titleMatch = block.match(/class="result__a"[^>]*>([^<]+)</);
        const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/ - Facebook$/, '').replace(/ \| Facebook$/, '').trim() : '';

        if (!title || seenNames.has(title.toLowerCase())) continue;
        seenNames.add(title.toLowerCase());

        // Extract snippet
        const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
        const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '';

        // Extract phone and email from snippet
        const phoneMatch = snippet.match(/(\(?\d{2}\)?\s?)?(\d{4,5}[-\s]?\d{4})/);
        const emailMatch = snippet.match(/[\w.-]+@[\w.-]+\.\w{2,}/);

        const pageName = link.split('facebook.com/')[1]?.replace(/\//g, '') || title;

        pages.push({
          name: title || pageName,
          facebook_url: link,
          phone: phoneMatch ? phoneMatch[0].replace(/\s/g, '') : '',
          email: emailMatch ? emailMatch[0] : '',
          address: '',
          website: '',
          category: niche,
          followers: 0,
          rating: null,
          location: location,
          has_contact: !!(phoneMatch || emailMatch),
          hours: null,
          source: 'duckduckgo_free',
        });
      }

      await new Promise(r => setTimeout(r, 400));
    } catch (error) {
      console.error(`Error searching Facebook for "${query}":`, error);
    }
  }

  return pages;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, niche, location, page_urls, limit = 20 } = await req.json();

    // MODE 1: Search by niche+city via DuckDuckGo (FREE)
    if (action === "search_by_niche") {
      if (!niche || !location) {
        return new Response(
          JSON.stringify({ error: "Nicho e localização são obrigatórios" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Facebook scraper (FREE): searching "${niche}" in "${location}"`);
      const pages = await searchFacebookPages(niche, location, limit);

      return new Response(
        JSON.stringify({ pages, total: pages.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // MODE 2: Enrich URLs - simplified without Apify
    if (action === "enrich_urls") {
      if (!page_urls || page_urls.length === 0) {
        return new Response(
          JSON.stringify({ error: "URLs são obrigatórias" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Without Apify, we can only return basic info from the URLs
      const pages = page_urls.map((url: string) => ({
        name: url.split('facebook.com/')[1]?.replace(/\//g, '') || 'Página Facebook',
        facebook_url: url,
        phone: '',
        email: '',
        address: '',
        category: niche || '',
        followers: 0,
        has_contact: false,
        source: 'url_import',
      }));

      return new Response(
        JSON.stringify({ pages, total: pages.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ação inválida. Use 'search_by_niche' ou 'enrich_urls'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Facebook scraper error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
