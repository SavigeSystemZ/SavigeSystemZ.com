import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe-client";
import {
  claimStripeWebhookEvent,
  processStripeWebhookEvent,
} from "@/lib/stripe-webhook-processor";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  // Idempotency: claim this event.id; if Stripe retries (network glitch, our
  // 5xx, etc.) the second delivery short-circuits here without re-running the
  // mutation. We still return 200 so Stripe stops retrying.
  const claimed = await claimStripeWebhookEvent(event);
  if (!claimed) {
    return NextResponse.json({ received: true, idempotent: true });
  }

  await processStripeWebhookEvent(event);

  return NextResponse.json({ received: true });
}
