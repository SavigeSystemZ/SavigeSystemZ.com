import type Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { completePurchaseFromSessionId } from "@/lib/checkout-complete";

/**
 * Insert a row keyed by `event.id` to claim processing rights for this event.
 * Returns true if this caller is the first to see the event, false if a prior
 * delivery already claimed it (Stripe retries land here).
 *
 * Uses the unique constraint on `StripeWebhookEvent.eventId` as the dedupe primitive:
 * a duplicate insert raises P2002 (Prisma) which we translate into "already seen."
 */
export async function claimStripeWebhookEvent(event: Stripe.Event): Promise<boolean> {
  try {
    await db.stripeWebhookEvent.create({
      data: { eventId: event.id, eventType: event.type },
    });
    return true;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return false;
    }
    throw err;
  }
}

async function markEventProcessed(eventId: string): Promise<void> {
  await db.stripeWebhookEvent.update({
    where: { eventId },
    data: { processedAt: new Date() },
  });
}

async function markPurchaseFailed(stripeCheckoutSessionId: string | null | undefined): Promise<void> {
  if (!stripeCheckoutSessionId) return;
  await db.purchase.updateMany({
    where: { stripeCheckoutSessionId, status: { in: ["PENDING"] } },
    data: { status: "FAILED" },
  });
}

/**
 * Handles verified Stripe webhook events. Caller must have already
 * verified the signature and claimed the event via `claimStripeWebhookEvent`.
 *
 * Handled types:
 *   - `checkout.session.completed` — grant license + mark purchase COMPLETED.
 *   - `checkout.session.expired`   — mark the matching purchase FAILED.
 *   - `payment_intent.payment_failed` — best-effort mark FAILED via the
 *      checkout-session lookup on the payment intent.
 *
 * Unrecognized event types are accepted (200) and logged via the
 * StripeWebhookEvent table; we do not 5xx unknown types.
 */
export async function processStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.id) {
        await completePurchaseFromSessionId(session.id);
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      await markPurchaseFailed(session.id);
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      // PaymentIntent does not directly carry the checkout session id; the
      // webhook for `checkout.session.expired` covers the session-level case.
      // We log the failure intent for audit purposes only.
      console.warn("[stripe] payment_intent.payment_failed", {
        intentId: intent.id,
        last_payment_error: intent.last_payment_error?.code,
      });
      break;
    }
    default: {
      // Logged via StripeWebhookEvent.eventType for visibility.
      break;
    }
  }
  await markEventProcessed(event.id);
}
