import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") || "" } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action } = await req.json();

    if (action === "get-checkout-urls") {
      // Return checkout URLs with user email appended
      const email = user.email || "";
      const appendEmail = (url: string) => {
        if (!email) return url;
        const sep = url.includes("?") ? "&" : "?";
        return `${url}${sep}email=${encodeURIComponent(email)}`;
      };

      return new Response(JSON.stringify({
        starter: {
          monthly: appendEmail("https://pay.cakto.com.br/STARTER_MENSAL"),
          annual: appendEmail("https://pay.cakto.com.br/STARTER_ANUAL"),
        },
        pro: {
          monthly: appendEmail("https://pay.cakto.com.br/PRO_MENSAL"),
          annual: appendEmail("https://pay.cakto.com.br/PRO_ANUAL"),
        },
        enterprise: {
          monthly: appendEmail("https://pay.cakto.com.br/ENTERPRISE_MENSAL"),
          annual: appendEmail("https://pay.cakto.com.br/ENTERPRISE_ANUAL"),
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get-subscription-status") {
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: sub } = await adminClient
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      return new Response(JSON.stringify({
        subscription: sub && sub.length > 0 ? sub[0] : null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("cakto-api error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
