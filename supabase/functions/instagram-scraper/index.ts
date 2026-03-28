import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const { queries, limit = 30, search_type = "hashtag", niche, location, quantity, contactOnly } = await req.json();

    // Get user's Apify token from settings
    const { data: settings } = await supabase
      .from("user_settings")
      .select("apify_token")
      .eq("user_id", user.id)
      .single();

    const apifyToken = (settings as any)?.apify_token;
    if (!apifyToken) {
      return new Response(
        JSON.stringify({ error: "Apify token não configurado. Adicione em Configurações > APIs." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Support both old format (niche/location) and new format (queries)
    const searchQueries = queries
      ? (Array.isArray(queries) ? queries : [queries])
      : [niche, location ? `${niche} ${location}` : null].filter(Boolean);

    const resultsLimit = Math.min(limit || quantity || 30, 100);

    // Call Apify Instagram Search Scraper
    const actorId = "apify~instagram-search-scraper";
    const apifyResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${apifyToken}&timeout=120&memory=512`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchType: search_type,
          searchQueries,
          resultsLimit,
          addParentData: false,
        }),
      }
    );

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      console.error("Apify error:", errorText);
      return new Response(
        JSON.stringify({ error: `Erro Apify: ${errorText}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const raw = await apifyResponse.json();
    const items = Array.isArray(raw) ? raw : (raw.items || []);

    // Deduplicate by username and normalize
    const seen = new Set<string>();
    let profiles = items
      .filter((item: any) => {
        const username = item.ownerUsername || item.username || "";
        if (!username || seen.has(username)) return false;
        seen.add(username);
        return true;
      })
      .map((item: any) => {
        const username = item.ownerUsername || item.username || "";
        const fullName = item.fullName || item.ownerFullName || item.name || username;
        const bio = item.biography || item.bio || item.caption || item.description || "";
        const followers = item.followersCount || item.followers || item.likesCount || 0;
        const externalUrl = item.externalUrl || item.url || item.website || "";
        const isVerified = item.verified || item.isVerified || false;
        const profilePicUrl = item.profilePicUrl || item.profilePic || item.displayUrl || "";
        const category = item.businessCategoryName || item.category || "";
        const itemLocation = item.cityName || item.location || "";

        // Extract phone and email from bio
        const phoneMatch = bio.match(/(\(?\d{2}\)?\s?)?(\d{4,5}[-\s]?\d{4})/);
        const emailMatch = bio.match(/[\w.-]+@[\w.-]+\.\w{2,}/);

        const phone = item.businessPhoneNumber || item.phone || (phoneMatch ? phoneMatch[0].replace(/\s/g, "") : "");
        const email = item.businessEmail || item.email || (emailMatch ? emailMatch[0] : "");

        return {
          username,
          full_name: fullName,
          bio,
          followers,
          external_url: externalUrl,
          profile_pic_url: profilePicUrl,
          is_verified: isVerified,
          category,
          location: itemLocation,
          instagram_url: `https://instagram.com/${username}`,
          phone,
          email,
          has_contact: !!(phone || email || externalUrl),
          is_business: item.isBusinessAccount || false,
        };
      });

    // Filter contact only if requested
    if (contactOnly) {
      profiles = profiles.filter((p: any) => p.has_contact);
    }

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
