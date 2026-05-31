import { NextResponse } from "next/server";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe-client";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, props: Params) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const { id } = await props.params;

  const purchase = await db.purchase.findUnique({
    where: { id },
  });

  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  if (purchase.status !== "COMPLETED") {
    return NextResponse.json({ error: "Purchase is not completed" }, { status: 400 });
  }

  const stripe = getStripe();
  if (stripe) {
    // We have to look up the checkout session to find the payment intent
    try {
      const session = await stripe.checkout.sessions.retrieve(purchase.stripeCheckoutSessionId);
      if (session.payment_intent) {
        await stripe.refunds.create({
          payment_intent: session.payment_intent as string,
        });
      } else {
        return NextResponse.json({ error: "No payment intent found on checkout session" }, { status: 400 });
      }
    } catch (error) {
      console.error("Stripe refund error:", error);
      return NextResponse.json({ error: "Stripe refund failed" }, { status: 500 });
    }
  }

  const updatedPurchase = await db.purchase.update({
    where: { id },
    data: { status: "REFUNDED" },
  });

  // Revoke any licenses associated with this checkout session
  await db.license.updateMany({
    where: { stripeCheckoutSessionId: purchase.stripeCheckoutSessionId },
    data: { status: "REVOKED" },
  });

  await writeAuditLog({
    actorUserId: context.userId,
    action: "purchase.refund",
    targetType: "Purchase",
    targetId: id,
    metadata: { stripeCheckoutSessionId: purchase.stripeCheckoutSessionId },
  });

  return NextResponse.json({ purchase: updatedPurchase });
}
