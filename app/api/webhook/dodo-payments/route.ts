import { Webhooks } from "@dodopayments/nextjs";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,
  
  onPaymentSucceeded: async (payload) => {
    console.log("Payment succeeded:", payload);
    
    // Get customer and subscription info from payload data
    const data = payload.data;
    const customerId = data.customer?.customer_id;
    
    if (!customerId) {
      console.error("No customer ID in payment payload");
      return;
    }

    // Update workspace billing info
    const { error } = await supabaseAdmin
      .from("workspaces")
      .update({
        dodo_customer_id: customerId,
        dodo_subscription_id: data.subscription_id,
        billing_status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("dodo_customer_id", customerId);

    if (error) {
      console.error("Error updating workspace billing:", error);
    }
  },

  onSubscriptionActive: async (payload) => {
    console.log("Subscription active:", payload);
    
    const data = payload.data;
    const customerId = data.customer?.customer_id;
    const subscriptionId = data.subscription_id;
    const productId = data.product_id;
    
    if (!customerId) {
      console.error("No customer ID in subscription payload");
      return;
    }

    // Determine plan based on product_id (both global and India products)
    let plan = "free";
    let emailLimit = 5000;
    let contactsLimit = 1500;
    
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
      contactsLimit = 10000;
    } else if (scaleProductIds.includes(productId)) {
      plan = "scale";
      emailLimit = 200000;
      contactsLimit = 25000;
    }

    const { error } = await supabaseAdmin
      .from("workspaces")
      .update({
        dodo_customer_id: customerId,
        dodo_subscription_id: subscriptionId,
        dodo_product_id: productId,
        plan: plan,
        email_limit: emailLimit,
        contacts_limit: contactsLimit,
        billing_status: "active",
        billing_cycle_start: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("dodo_customer_id", customerId);

    if (error) {
      console.error("Error updating workspace subscription:", error);
    }
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
      .from("workspaces")
      .update({
        plan: "free",
        email_limit: 5000,
        contacts_limit: 1500,
        billing_status: "cancelled",
        dodo_subscription_id: null,
        dodo_product_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("dodo_subscription_id", subscriptionId);

    if (error) {
      console.error("Error cancelling workspace subscription:", error);
    }
  },

  onSubscriptionPaused: async (payload) => {
    console.log("Subscription paused:", payload);
    
    const data = payload.data;
    const subscriptionId = data.subscription_id;
    
    if (!subscriptionId) return;

    const { error } = await supabaseAdmin
      .from("workspaces")
      .update({
        billing_status: "paused",
        updated_at: new Date().toISOString(),
      })
      .eq("dodo_subscription_id", subscriptionId);

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
      .from("workspaces")
      .update({
        billing_status: "active",
        billing_cycle_start: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("dodo_subscription_id", subscriptionId);

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
