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

    // Validate JWT
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

    const { niche, location, quantity, contactOnly } = await req.json();

    if (!niche) {
      return new Response(
        JSON.stringify({ error: "Niche is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user's Apify token from settings
    const { data: settings } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const apifyToken = (settings as any)?.apify_token;
    if (!apifyToken) {
      return new Response(
        JSON.stringify({ error: "Apify token not configured" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build search queries
    const searchQueries = [niche];
    if (location) {
      searchQueries.push(`${niche} ${location}`);
    }

    // Call Apify Instagram scraper
    const apifyResponse = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/run-sync-get-dataset-items?token=${apifyToken}&timeout=120`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hashtags: searchQueries,
          resultsLimit: quantity || 30,
          searchType: "hashtag",
        }),
      }
    );

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      console.error("Apify error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch from Apify", details: errorText }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const rawProfiles = await apifyResponse.json();

    // Deduplicate by username and map
    const seen = new Set<string>();
    let profiles = (rawProfiles || [])
      .filter((p: any) => {
        const username = p.ownerUsername || p.username || "";
        if (!username || seen.has(username)) return false;
        seen.add(username);
        return true;
      })
      .map((p: any) => ({
        username: p.ownerUsername || p.username || "",
        fullName: p.ownerFullName || p.fullName || "",
        biography: p.caption || p.biography || "",
        followersCount: p.followersCount || p.likesCount || 0,
        profilePicUrl: p.profilePicUrl || p.displayUrl || "",
        externalUrl: p.externalUrl || null,
        phone: p.businessPhoneNumber || null,
        email: p.businessEmail || null,
        isBusinessAccount: p.isBusinessAccount || false,
      }));

    // Filter contact only if requested
    if (contactOnly) {
      profiles = profiles.filter(
        (p: any) => p.phone || p.email || p.externalUrl
      );
    }

    return new Response(JSON.stringify({ profiles }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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