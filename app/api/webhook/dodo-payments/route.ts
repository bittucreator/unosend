import { Webhooks } from "@dodopayments/nextjs";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,
  
  onPaymentSucceeded: async (payload) => {
    console.log("Payment succeeded:", payload);
    
    // Get customer and subscription info from payload data
    const data = payload.data;
    const customerId = data.customer?.customer_id;
    const metadata = data.metadata as Record<string, string> | undefined;
    const organizationId = metadata?.organization_id || metadata?.workspace_id;
    
    if (!customerId) {
      console.error("No customer ID in payment payload");
      return;
    }

    // If we have organization_id from metadata, update that specific org
    if (organizationId) {
      // Update subscriptions table
      const { error: subError } = await supabaseAdmin
        .from("subscriptions")
        .update({
          stripe_customer_id: customerId, // Using stripe_ field for dodo customer id
          stripe_subscription_id: data.subscription_id,
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("organization_id", organizationId);

      if (subError) {
        console.error("Error updating subscription:", subError);
      }
    } else {
      // Fallback: try to find by existing customer_id
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customerId);

      if (error) {
        console.error("Error updating subscription by customer ID:", error);
      }
    }
  },

  onSubscriptionActive: async (payload) => {
    console.log("Subscription active:", payload);
    
    const data = payload.data;
    const customerId = data.customer?.customer_id;
    const subscriptionId = data.subscription_id;
    const productId = data.product_id;
    const metadata = data.metadata as Record<string, string> | undefined;
    const organizationId = metadata?.organization_id || metadata?.workspace_id;
    
    if (!customerId) {
      console.error("No customer ID in subscription payload");
      return;
    }

    // Determine plan based on product_id (both global and India products)
    let plan = "free";
    let emailLimit = 5000;
    
    // Pro plans (global and India)
    const proProductIds = [
      process.env.DODO_PRO_PRODUCT_ID,
      process.env.DODO_PRO_INDIA_PRODUCT_ID,
    ].filter(Boolean);
    
    // Scale plans (global and India)
    const scaleProductIds = [
      process.env.DODO_SCALE_PRODUCT_ID,
      process.env.DODO_SCALE_INDIA_PRODUCT_ID,
    ].filter(Boolean);
    
    if (proProductIds.includes(productId)) {
      plan = "pro";
      emailLimit = 50000;
    } else if (scaleProductIds.includes(productId)) {
      plan = "scale";
      emailLimit = 200000;
    }

    // Find organization - either by metadata or customer_id
    let orgId = organizationId;
    
    if (!orgId) {
      // Try to find by customer_id
      const { data: existingSub } = await supabaseAdmin
        .from("subscriptions")
        .select("organization_id")
        .eq("stripe_customer_id", customerId)
        .single();
      
      orgId = existingSub?.organization_id;
    }

    if (!orgId) {
      console.error("Could not find organization for subscription");
      return;
    }

    // Update subscriptions table
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plan: plan,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq("organization_id", orgId);

    if (error) {
      console.error("Error updating subscription:", error);
    }

    // Also update usage limits
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    await supabaseAdmin
      .from("usage")
      .upsert({
        organization_id: orgId,
        period_start: startOfMonth.toISOString(),
        period_end: endOfMonth.toISOString(),
        emails_limit: emailLimit,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "organization_id"
      });
  },

  onSubscriptionCancelled: async (payload) => {
    console.log("Subscription cancelled:", payload);
    
    const data = payload.data;
    const subscriptionId = data.subscription_id;
    
    if (!subscriptionId) {
      console.error("No subscription ID in cancellation payload");
      return;
    }

    // Downgrade to free plan
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        plan: "free",
        status: "canceled",
        stripe_subscription_id: null,
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (error) {
      console.error("Error cancelling subscription:", error);
    }
  },

  onSubscriptionPaused: async (payload) => {
    console.log("Subscription paused:", payload);
    
    const data = payload.data;
    const subscriptionId = data.subscription_id;
    
    if (!subscriptionId) return;

    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "past_due",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (error) {
      console.error("Error pausing subscription:", error);
    }
  },

  onSubscriptionRenewed: async (payload) => {
    console.log("Subscription renewed:", payload);
    
    const data = payload.data;
    const subscriptionId = data.subscription_id;
    
    if (!subscriptionId) return;

    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (error) {
      console.error("Error renewing subscription:", error);
    }
  },

  onRefundSucceeded: async (payload) => {
    console.log("Refund succeeded:", payload);
    // Handle refund logic if needed
  },

  onDisputeOpened: async (payload) => {
    console.log("Dispute opened:", payload);
    // Handle dispute logic if needed
  },
});
