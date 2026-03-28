import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";

    // LIST USERS
    if (action === "list") {
      const page = parseInt(url.searchParams.get("page") || "1");
      const perPage = parseInt(url.searchParams.get("per_page") || "50");

      const {
        data: { users },
        error,
      } = await supabase.auth.admin.listUsers({ page, perPage });

      if (error) throw error;

      // Get profiles and settings for all users
      const userIds = users.map((u: any) => u.id);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      const { data: settings } = await supabase
        .from("user_settings")
        .select("user_id, whatsapp_connected, whatsapp_instance_id, auto_prospecting_enabled, created_at")
        .in("user_id", userIds);

      const { data: roles } = await supabase
        .from("user_roles")
        .select("*")
        .in("user_id", userIds);

      // Count leads per user
      const { data: leadCounts } = await supabase.rpc("admin_lead_counts_placeholder").catch(() => ({ data: null }));

      const enrichedUsers = users.map((u: any) => {
        const profile = profiles?.find((p: any) => p.user_id === u.id);
        const setting = settings?.find((s: any) => s.user_id === u.id);
        const userRoles = roles?.filter((r: any) => r.user_id === u.id).map((r: any) => r.role) || [];

        return {
          id: u.id,
          email: u.email,
          full_name: profile?.full_name || null,
          avatar_url: profile?.avatar_url || null,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          whatsapp_connected: setting?.whatsapp_connected || false,
          auto_prospecting: setting?.auto_prospecting_enabled || false,
          roles: userRoles,
        };
      });

      return new Response(JSON.stringify({ users: enrichedUsers, total: users.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE USER
    if (action === "delete" && req.method === "POST") {
      const body = await req.json();
      const targetUserId = body.user_id;
      if (!targetUserId) {
        return new Response(JSON.stringify({ error: "user_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Don't allow deleting yourself
      if (targetUserId === user.id) {
        return new Response(JSON.stringify({ error: "Cannot delete yourself" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase.auth.admin.deleteUser(targetUserId);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET USER STATS
    if (action === "stats") {
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: connectedWhatsapp } = await supabase
        .from("user_settings")
        .select("*", { count: "exact", head: true })
        .eq("whatsapp_connected", true);

      const { count: totalLeads } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });

      const { count: totalMessages } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true });

      return new Response(
        JSON.stringify({
          total_users: totalUsers || 0,
          connected_whatsapp: connectedWhatsapp || 0,
          total_leads: totalLeads || 0,
          total_messages: totalMessages || 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Admin error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
