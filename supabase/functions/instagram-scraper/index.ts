import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// FREE: Scrape Instagram profiles via DuckDuckGo search + public profile parsing
async function searchInstagramProfiles(queries: string[], limit: number): Promise<any[]> {
  const profiles: any[] = [];
  const seenUsernames = new Set<string>();

  for (const query of queries) {
    if (profiles.length >= limit) break;

    // Search for Instagram profiles via DuckDuckGo
    const searchQuery = `site:instagram.com "${query}" telefone OR contato OR email OR whatsapp`;
    console.log(`Searching Instagram profiles: ${searchQuery}`);

    try {
      const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
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

      for (let i = 1; i < resultBlocks.length && profiles.length < limit; i++) {
        const block = resultBlocks[i];

        // Extract URL
        const linkMatch = block.match(/href="([^"]+)"[^>]*class="result__a"/);
        let link = '';
        if (linkMatch) {
          link = linkMatch[1];
          if (link.includes('uddg=')) {
            link = decodeURIComponent(link.split('uddg=')[1]?.split('&')[0] || '');
          }
        }

        // Check if it's an Instagram profile URL
        const igMatch = link.match(/instagram\.com\/([a-zA-Z0-9._]+)\/?$/);
        if (!igMatch) continue;

        const username = igMatch[1].toLowerCase();
        if (seenUsernames.has(username) || ['p', 'explore', 'reel', 'stories', 'accounts', 'about', 'developer', 'legal'].includes(username)) continue;
        seenUsernames.add(username);

        // Extract title and snippet
        const titleMatch = block.match(/class="result__a"[^>]*>([^<]+)</);
        const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').trim() : username;

        const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
        const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '';

        // Extract phone and email from snippet
        const phoneMatch = snippet.match(/(\(?\d{2}\)?\s?)?(\d{4,5}[-\s]?\d{4})/);
        const emailMatch = snippet.match(/[\w.-]+@[\w.-]+\.\w{2,}/);

        // Extract follower count from snippet
        const followersMatch = snippet.match(/([\d,.]+[KkMm]?)\s*(?:Followers|seguidores|seguidor)/i);
        let followers = 0;
        if (followersMatch) {
          const raw = followersMatch[1].replace(/,/g, '');
          if (raw.toLowerCase().includes('k')) followers = parseFloat(raw) * 1000;
          else if (raw.toLowerCase().includes('m')) followers = parseFloat(raw) * 1000000;
          else followers = parseInt(raw) || 0;
        }

        profiles.push({
          username,
          full_name: title.replace(/\(@[^)]+\)/, '').replace(/• Instagram.*/, '').replace(/on Instagram:.*/, '').trim() || username,
          bio: snippet.substring(0, 200),
          followers,
          external_url: '',
          profile_pic_url: '',
          is_verified: false,
          category: query,
          location: '',
          instagram_url: `https://instagram.com/${username}`,
          phone: phoneMatch ? phoneMatch[0].replace(/\s/g, '') : '',
          email: emailMatch ? emailMatch[0] : '',
          has_contact: !!(phoneMatch || emailMatch),
          is_business: true,
        });
      }

      await new Promise(r => setTimeout(r, 400));
    } catch (error) {
      console.error(`Error searching Instagram for "${query}":`, error);
    }
  }

  // Also search with business-specific queries
  for (const query of queries) {
    if (profiles.length >= limit) break;

    const bizQuery = `instagram.com "${query}" bio telefone OR whatsapp OR email`;
    try {
      const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(bizQuery)}&kl=br-pt`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          'Accept': 'text/html',
        },
      });

      if (!response.ok) continue;

      const html = await response.text();
      const blocks = html.split('class="result__body"');

      for (let i = 1; i < blocks.length && profiles.length < limit; i++) {
        const block = blocks[i];
        const linkMatch = block.match(/href="([^"]+)"[^>]*class="result__a"/);
        let link = linkMatch ? linkMatch[1] : '';
        if (link.includes('uddg=')) link = decodeURIComponent(link.split('uddg=')[1]?.split('&')[0] || '');

        const igMatch = link.match(/instagram\.com\/([a-zA-Z0-9._]+)\/?$/);
        if (!igMatch) continue;

        const username = igMatch[1].toLowerCase();
        if (seenUsernames.has(username)) continue;
        seenUsernames.add(username);

        const titleMatch = block.match(/class="result__a"[^>]*>([^<]+)</);
        const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
        const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        const phoneMatch = snippet.match(/(\(?\d{2}\)?\s?)?(\d{4,5}[-\s]?\d{4})/);
        const emailMatch = snippet.match(/[\w.-]+@[\w.-]+\.\w{2,}/);

        profiles.push({
          username,
          full_name: (titleMatch ? titleMatch[1] : username).replace(/&amp;/g, '&').replace(/\(@[^)]+\)/, '').replace(/• Instagram.*/, '').trim(),
          bio: snippet.substring(0, 200),
          followers: 0,
          external_url: '',
          profile_pic_url: '',
          is_verified: false,
          category: query,
          location: '',
          instagram_url: `https://instagram.com/${username}`,
          phone: phoneMatch ? phoneMatch[0].replace(/\s/g, '') : '',
          email: emailMatch ? emailMatch[0] : '',
          has_contact: !!(phoneMatch || emailMatch),
          is_business: true,
        });
      }

      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      console.error('Biz search error:', e);
    }
  }

  return profiles;
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

    const { queries, limit = 30, search_type = "hashtag", niche, location, quantity, contactOnly } = await req.json();

    // Build search queries
    const searchQueries = queries
      ? (Array.isArray(queries) ? queries : [queries])
      : [niche, location ? `${niche} ${location}` : null].filter(Boolean);

    const resultsLimit = Math.min(limit || quantity || 30, 100);

    console.log(`Instagram scraper (FREE): queries=${searchQueries.join(', ')}, limit=${resultsLimit}`);

    // Use free DuckDuckGo-based search
    let profiles = await searchInstagramProfiles(searchQueries, resultsLimit);

    // Filter contact only if requested
    if (contactOnly) {
      profiles = profiles.filter((p: any) => p.has_contact);
    }

    console.log(`Found ${profiles.length} Instagram profiles (FREE method)`);

    return new Response(
      JSON.stringify({ profiles, total: profiles.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Instagram scraper error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
