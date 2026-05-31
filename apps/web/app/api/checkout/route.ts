import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe-client";
import { checkoutRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = checkoutRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }

  const { applicationId, purchaserEmail } = parsed.data;
  const application = await db.application.findUnique({ where: { id: applicationId } });
  if (!application) {
    return NextResponse.json({ error: "application_not_found" }, { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const stripe = getStripe();

  if (!stripe) {
    const sessionId = `cs_mock_${randomUUID().replace(/-/g, "")}`;
    await db.purchase.create({
      data: {
        stripeCheckoutSessionId: sessionId,
        applicationId,
        purchaserEmail,
        status: "PENDING",
      },
    });
    return NextResponse.json({
      mode: "mock",
      url: `${origin}/api/checkout/complete?session_id=${encodeURIComponent(sessionId)}`,
    });
  }

  const amountCents = Number(process.env.DEFAULT_PURCHASE_AMOUNT_CENTS ?? "999");
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: application.name },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/api/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?canceled=1`,
    customer_email: purchaserEmail,
    metadata: { applicationId },
  });

  if (!session.id || !session.url) {
    return NextResponse.json({ error: "stripe_session_failed" }, { status: 502 });
  }

  await db.purchase.create({
    data: {
      stripeCheckoutSessionId: session.id,
      applicationId,
      purchaserEmail,
      status: "PENDING",
    },
  });

  return NextResponse.json({
    mode: "stripe",
    url: session.url,
  });
}
