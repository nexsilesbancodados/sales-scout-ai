import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function normalizeFBPage(item: any, niche: string, location: string) {
  const phone = item.phone || item.phoneNumber || item.phones?.[0] || "";
  const email = item.email || item.emails?.[0] || "";
  const address = [item.street, item.city, item.state].filter(Boolean).join(", ");

  return {
    name: item.title || item.name || item.pageName || "",
    facebook_url: item.url || item.pageUrl || "",
    phone: typeof phone === "string" ? phone.replace(/\s/g, "") : "",
    email,
    address,
    website: item.website || "",
    category: item.categories?.[0] || niche,
    followers: item.fans || item.followers || item.likes || 0,
    rating: item.rating || null,
    location: item.city || location,
    has_contact: !!(phone || email),
    hours: item.hours || null,
    source: "facebook",
  };
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
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use global API keys
    const serperKey = Deno.env.get("SERPER_API_KEY") || Deno.env.get("SERPAPI_API_KEY");

    const { action, niche, location, page_urls, limit = 20 } = await req.json();

    // MODE 1: Search by niche+city via Google → Facebook URLs
    if (action === "search_by_niche") {
      if (!serperKey) {
        return new Response(
          JSON.stringify({ error: "API de busca não configurada no servidor." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const query = `${niche} ${location} site:facebook.com`;

      const searchRes = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "X-API-KEY": serperKey, "Content-Type": "application/json" },
        body: JSON.stringify({ q: query, num: Math.min(limit, 20), gl: "br", hl: "pt" }),
      });

      const searchData = await searchRes.json();
      const organic = searchData.organic || [];

      const fbUrls = organic
        .map((r: any) => r.link)
        .filter(
          (url: string) =>
            url &&
            url.includes("facebook.com") &&
            !url.includes("/posts/") &&
            !url.includes("/photos/") &&
            !url.includes("/videos/") &&
            !url.includes("?")
        )
        .slice(0, limit);

      if (fbUrls.length === 0) {
        return new Response(
          JSON.stringify({ pages: [], total: 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If Apify token available, enrich URLs
      const apifyToken = (settings as any)?.apify_token;
      if (apifyToken) {
        try {
          const enrichRes = await fetch(
            `https://api.apify.com/v2/acts/apify~facebook-pages-scraper/run-sync-get-dataset-items?token=${apifyToken}&timeout=120`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                startUrls: fbUrls.map((url: string) => ({ url })),
                maxPagesPerStartUrl: 1,
              }),
            }
          );

          if (enrichRes.ok) {
            const raw = await enrichRes.json();
            const items = Array.isArray(raw) ? raw : [];
            const pages = items.map((item: any) => normalizeFBPage(item, niche, location));
            return new Response(
              JSON.stringify({ pages, total: pages.length }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } catch (e) {
          console.error("Apify enrichment failed, falling back:", e);
        }
      }

      // Fallback without Apify: return just the found URLs
      const pages = fbUrls.map((url: string) => ({
        name: url.split("facebook.com/")[1]?.replace(/\//g, "") || "Página Facebook",
        facebook_url: url,
        phone: "",
        email: "",
        address: "",
        category: niche,
        followers: 0,
        has_contact: false,
        source: "google_search",
      }));

      return new Response(
        JSON.stringify({ pages, total: pages.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // MODE 2: Enrich URLs directly with Apify
    if (action === "enrich_urls") {
      const apifyToken = (settings as any)?.apify_token;
      if (!apifyToken) {
        return new Response(
          JSON.stringify({ error: "Apify token não configurado" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const enrichRes = await fetch(
        `https://api.apify.com/v2/acts/apify~facebook-pages-scraper/run-sync-get-dataset-items?token=${apifyToken}&timeout=180`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startUrls: page_urls.map((url: string) => ({ url })),
            maxPagesPerStartUrl: 1,
          }),
        }
      );

      const raw = await enrichRes.json();
      const items = Array.isArray(raw) ? raw : [];
      const pages = items.map((item: any) => normalizeFBPage(item, niche || "", location || ""));

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
