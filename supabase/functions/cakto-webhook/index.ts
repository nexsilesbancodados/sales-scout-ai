import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map Cakto event types to internal subscription status
const EVENT_TO_STATUS: Record<string, string> = {
  purchase_approved: "active",
  subscription_created: "active",
  subscription_renewed: "active",
  subscription_canceled: "canceled",
  subscription_renewal_refused: "past_due",
  subscription_expired: "canceled",
  refund: "refunded",
  chargeback: "chargeback",
  purchase_refused: "refused",
  purchase_delayed: "pending",
};

// Resolve plan from product name or amount
function resolvePlan(productName: string, amount: number): string {
  const name = (productName || "").toLowerCase();
  if (name.includes("enterprise") || name.includes("empresarial") || amount >= 19900) return "enterprise";
  if (name.includes("pro") || name.includes("profissional") || amount >= 14900) return "pro";
  if (name.includes("starter") || name.includes("básico") || name.includes("basico") || amount >= 9700) return "starter";
  return "starter";
}

// Extract nested data safely
function extractField(obj: any, ...paths: string[]): any {
  for (const path of paths) {
    const keys = path.split(".");
    let val = obj;
    for (const k of keys) {
      val = val?.[k];
      if (val === undefined || val === null) break;
    }
    if (val !== undefined && val !== null && val !== "") return val;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify webhook secret if configured
    const webhookSecret = Deno.env.get("CAKTO_WEBHOOK_SECRET");
    if (webhookSecret) {
      const incomingSecret =
        req.headers.get("x-webhook-secret") ||
        req.headers.get("x-cakto-secret") ||
        req.headers.get("authorization")?.replace("Bearer ", "");
      if (incomingSecret !== webhookSecret) {
        console.error("Invalid webhook secret");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const payload = await req.json();
    console.log("Cakto webhook received:", JSON.stringify(payload).slice(0, 2000));

    // Extract event type — Cakto can send in different formats
    const eventType =
      payload.event ||
      payload.type ||
      payload.event_type ||
      payload.action ||
      payload.custom_id;

    const data = payload.data || payload;

    if (!eventType) {
      return new Response(JSON.stringify({ error: "Missing event type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract all fields from different Cakto payload shapes
    const customer = data.customer || data.buyer || data.client || {};
    const order = data.order || data.purchase || data;
    const product = data.product || data.offer || (data.products && data.products[0]) || {};
    const subscription = data.subscription || {};

    const customerEmail = extractField({ customer, order, data, payload },
      "customer.email", "order.email", "data.email", "payload.email",
      "customer.buyer_email", "order.buyer_email"
    ) || "";

    const customerName = extractField({ customer, order },
      "customer.name", "order.name", "customer.full_name"
    ) || "";

    const orderId = String(
      extractField({ order, payload }, "order.id", "order.orderId", "payload.id", "order.order_id") || ""
    );

    const amount = Number(
      extractField({ order, product, data },
        "order.amount", "order.baseAmount", "order.total",
        "product.price", "data.amount", "order.value"
      ) || 0
    );

    const productName = String(
      extractField({ product, order }, "product.name", "product.title", "order.product_name") || ""
    );

    const productId = String(
      extractField({ product }, "product.id", "product.product_id") || ""
    );

    const subscriptionId = String(
      extractField({ subscription, data }, "subscription.id", "data.subscription_id") || ""
    );

    const paymentMethod = String(
      extractField({ order, data }, "order.paymentMethod", "order.payment_method", "data.payment_method") || ""
    );

    const customerId = String(
      extractField({ customer }, "customer.id", "customer.customer_id") || ""
    );

    // Find user by email
    let userId: string | null = null;
    if (customerEmail) {
      // Try profiles table first
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id")
        .ilike("email", customerEmail)
        .limit(1);

      if (profiles && profiles.length > 0) {
        userId = profiles[0].user_id;
      } else {
        // Fallback: search auth.users via admin API
        const { data: authData } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1,
        });
        const foundUser = authData?.users?.find(
          (u) => u.email?.toLowerCase() === customerEmail.toLowerCase()
        );
        if (foundUser) {
          userId = foundUser.id;
        }
      }
    }

    // Log the payment event (always, even without user match)
    const { error: eventError } = await supabase.from("payment_events").insert({
      user_id: userId,
      event_type: eventType,
      cakto_order_id: orderId || null,
      cakto_event_id: payload.webhookEventId
        ? String(payload.webhookEventId)
        : payload.webhook_event_id
          ? String(payload.webhook_event_id)
          : null,
      customer_email: customerEmail || null,
      customer_name: customerName || null,
      amount,
      product_name: productName || null,
      raw_payload: payload,
    });

    if (eventError) {
      console.error("Error logging payment event:", eventError);
    }

    // Process subscription changes
    const newStatus = EVENT_TO_STATUS[eventType];

    if (newStatus && userId) {
      const plan = resolvePlan(productName, amount);

      if (newStatus === "active") {
        // Check for existing subscription
        const { data: existing } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1);

        const subscriptionData = {
          plan,
          status: "active" as const,
          amount,
          payment_method: paymentMethod || null,
          cakto_order_id: orderId || null,
          cakto_product_id: productId || null,
          cakto_subscription_id: subscriptionId || null,
          cakto_customer_id: customerId || null,
          canceled_at: null,
          metadata: {
            last_event: eventType,
            product_name: productName,
            updated_at: new Date().toISOString(),
          },
        };

        if (existing && existing.length > 0) {
          await supabase
            .from("subscriptions")
            .update(subscriptionData)
            .eq("id", existing[0].id);
        } else {
          await supabase.from("subscriptions").insert({
            user_id: userId,
            ...subscriptionData,
            started_at: new Date().toISOString(),
          });
        }

        // Log activity
        await supabase.from("activity_log").insert({
          user_id: userId,
          activity_type: "subscription_activated",
          description: `Plano ${plan.toUpperCase()} ativado via Cakto (${eventType})`,
          metadata: { plan, amount, event: eventType },
        });

      } else if (["canceled", "refunded", "chargeback"].includes(newStatus)) {
        await supabase
          .from("subscriptions")
          .update({
            status: newStatus,
            canceled_at: new Date().toISOString(),
            metadata: {
              last_event: eventType,
              canceled_reason: newStatus,
              canceled_at: new Date().toISOString(),
            },
          })
          .eq("user_id", userId)
          .in("status", ["active", "past_due"]);

        await supabase.from("activity_log").insert({
          user_id: userId,
          activity_type: "subscription_canceled",
          description: `Assinatura ${newStatus} via Cakto (${eventType})`,
          metadata: { status: newStatus, event: eventType },
        });

      } else if (newStatus === "past_due" || newStatus === "pending") {
        await supabase
          .from("subscriptions")
          .update({
            status: "past_due",
            metadata: {
              last_event: eventType,
              past_due_at: new Date().toISOString(),
            },
          })
          .eq("user_id", userId)
          .eq("status", "active");
      }
    }

    const response = {
      success: true,
      event: eventType,
      user_found: !!userId,
      user_id: userId,
      status: newStatus || "logged",
      plan: newStatus === "active" ? resolvePlan(productName, amount) : undefined,
    };

    console.log("Webhook processed:", JSON.stringify(response));

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Cakto webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
