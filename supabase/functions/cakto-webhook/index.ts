import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map Cakto event types to internal status
const EVENT_TO_STATUS: Record<string, string> = {
  purchase_approved: "active",
  subscription_created: "active",
  subscription_renewed: "active",
  subscription_canceled: "canceled",
  subscription_renewal_refused: "past_due",
  refund: "refunded",
  chargeback: "chargeback",
  purchase_refused: "refused",
};

// Map Cakto product IDs to plan names (configurable)
function resolvePlan(productName: string, amount: number): string {
  const name = (productName || "").toLowerCase();
  if (name.includes("enterprise") || amount >= 19900) return "enterprise";
  if (name.includes("pro") || amount >= 14900) return "pro";
  if (name.includes("starter") || amount >= 9700) return "starter";
  return "starter";
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
      const incomingSecret = req.headers.get("x-webhook-secret");
      if (incomingSecret !== webhookSecret) {
        console.error("Invalid webhook secret");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const payload = await req.json();
    console.log("Cakto webhook received:", JSON.stringify(payload));

    // Extract event data from Cakto payload
    // Cakto sends: { event, data: { order, customer, product, subscription, ... } }
    const eventType = payload.event || payload.type || payload.custom_id;
    const data = payload.data || payload;

    if (!eventType) {
      return new Response(JSON.stringify({ error: "Missing event type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract customer info
    const customer = data.customer || data.buyer || {};
    const order = data.order || data;
    const product = data.product || (data.products && data.products[0]) || {};
    const subscription = data.subscription || {};

    const customerEmail = customer.email || order.email || "";
    const customerName = customer.name || order.name || "";
    const orderId = String(order.id || order.orderId || payload.id || "");
    const amount = order.amount || order.baseAmount || product.price || 0;
    const productName = product.name || "";
    const productId = product.id ? String(product.id) : "";
    const subscriptionId = subscription.id ? String(subscription.id) : "";
    const paymentMethod = order.paymentMethod || order.payment_method || "";

    // Find user by email
    let userId: string | null = null;
    if (customerEmail) {
      const { data: users } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", customerEmail)
        .limit(1);

      if (users && users.length > 0) {
        userId = users[0].user_id;
      }
    }

    // Log the payment event
    await supabase.from("payment_events").insert({
      user_id: userId,
      event_type: eventType,
      cakto_order_id: orderId,
      cakto_event_id: payload.webhookEventId ? String(payload.webhookEventId) : null,
      customer_email: customerEmail,
      customer_name: customerName,
      amount,
      product_name: productName,
      raw_payload: payload,
    });

    // Process subscription events
    const newStatus = EVENT_TO_STATUS[eventType];
    if (newStatus && userId) {
      const plan = resolvePlan(productName, amount);

      if (newStatus === "active") {
        // Upsert subscription
        const { data: existing } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (existing && existing.length > 0) {
          // Update existing subscription
          await supabase
            .from("subscriptions")
            .update({
              plan,
              status: "active",
              amount,
              payment_method: paymentMethod,
              cakto_order_id: orderId,
              cakto_product_id: productId,
              cakto_subscription_id: subscriptionId || undefined,
              canceled_at: null,
              metadata: { last_event: eventType, product_name: productName },
            })
            .eq("id", existing[0].id);
        } else {
          // Create new subscription
          await supabase.from("subscriptions").insert({
            user_id: userId,
            plan,
            status: "active",
            amount,
            payment_method: paymentMethod,
            cakto_order_id: orderId,
            cakto_customer_id: customer.id ? String(customer.id) : null,
            cakto_product_id: productId,
            cakto_subscription_id: subscriptionId || null,
            started_at: new Date().toISOString(),
            metadata: { product_name: productName },
          });
        }

        // Log activity
        await supabase.from("activity_log").insert({
          user_id: userId,
          activity_type: "subscription_activated",
          description: `Assinatura ${plan} ativada via Cakto (${eventType})`,
        });
      } else if (newStatus === "canceled" || newStatus === "refunded" || newStatus === "chargeback") {
        // Update subscription status
        await supabase
          .from("subscriptions")
          .update({
            status: newStatus,
            canceled_at: new Date().toISOString(),
            metadata: { last_event: eventType },
          })
          .eq("user_id", userId)
          .eq("status", "active");

        await supabase.from("activity_log").insert({
          user_id: userId,
          activity_type: "subscription_canceled",
          description: `Assinatura ${newStatus} via Cakto (${eventType})`,
        });
      } else if (newStatus === "past_due") {
        await supabase
          .from("subscriptions")
          .update({
            status: "past_due",
            metadata: { last_event: eventType },
          })
          .eq("user_id", userId)
          .eq("status", "active");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        event: eventType,
        user_found: !!userId,
        status: newStatus || "logged",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
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
