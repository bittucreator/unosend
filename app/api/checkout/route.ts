import { Checkout } from "@dodopayments/nextjs";
import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";

// Helper to normalize environment value
function getEnvironment(): "test_mode" | "live_mode" {
  const env = process.env.DODO_PAYMENTS_ENVIRONMENT?.toLowerCase();
  if (env === "test" || env === "test_mode") return "test_mode";
  if (env === "live" || env === "live_mode" || env === "production") return "live_mode";
  return "live_mode"; // default to live
}

// Static checkout for simple payment links (GET)
export const GET = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  returnUrl: process.env.DODO_PAYMENTS_RETURN_URL || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&checkout=success`,
  environment: getEnvironment(),
  type: "static",
});

// Checkout Sessions for subscriptions (POST) - recommended approach
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, organizationId, plan, region, email, name } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    if (!apiKey) {
      console.error("DODO_PAYMENTS_API_KEY is not set");
      return NextResponse.json({ error: "Payment system not configured" }, { status: 500 });
    }

    const environment = getEnvironment();
    
    console.log("Creating checkout session:", { productId, organizationId, plan, region, environment });

    const client = new DodoPayments({
      bearerToken: apiKey,
      environment,
    });

    const returnUrl = process.env.DODO_PAYMENTS_RETURN_URL || 
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://unosend.co'}/dashboard/settings?tab=billing&checkout=success`;

    // Create checkout session for subscription
    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: email ? { email, name: name || email } : undefined,
      metadata: {
        organization_id: organizationId || "",
        plan: plan || "",
        region: region || "global",
      },
      return_url: returnUrl,
    });

    console.log("Checkout session created:", session);

    return NextResponse.json({ 
      checkout_url: session.checkout_url,
      session_id: session.session_id 
    });
  } catch (error: unknown) {
    console.error("Checkout session error:", error);
    
    // Handle Dodo Payments API errors
    let errorMessage = "Failed to create checkout session";
    let errorDetails = "";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || "";
    }
    
    // Check for specific error types
    if (errorMessage.toLowerCase().includes("product") || errorMessage.toLowerCase().includes("not found")) {
      return NextResponse.json({ 
        error: "Product not found. Please verify the product ID exists in your Dodo Payments dashboard.",
        details: errorMessage 
      }, { status: 404 });
    }

    if (errorMessage.toLowerCase().includes("unauthorized") || errorMessage.toLowerCase().includes("authentication")) {
      return NextResponse.json({ 
        error: "Payment authentication failed. Please check API key configuration.",
        details: errorMessage 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: errorDetails 
    }, { status: 500 });
  }
}
