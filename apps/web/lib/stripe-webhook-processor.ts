import type Stripe from "stripe";
import { completePurchaseFromSessionId } from "@/lib/checkout-complete";

/**
 * Handles verified Stripe webhook events (called after signature validation).
 */
export async function processStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.id) {
      await completePurchaseFromSessionId(session.id);
    }
  }
}
