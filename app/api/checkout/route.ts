import { Checkout } from "@dodopayments/nextjs";

export const GET = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  returnUrl: process.env.DODO_PAYMENTS_RETURN_URL || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
  environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") || "test_mode",
  type: "dynamic",
});
