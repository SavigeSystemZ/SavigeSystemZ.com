import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe-client";
import { grantLicenseForPurchase, upsertUserByEmail } from "@/lib/licenses";

export async function completePurchaseFromSessionId(sessionId: string): Promise<{
  ok: boolean;
  reason?: string;
  alreadyDone?: boolean;
}> {
  const purchase = await db.purchase.findUnique({
    where: { stripeCheckoutSessionId: sessionId },
  });

  if (sessionId.startsWith("cs_mock_")) {
    if (!purchase) {
      return { ok: false, reason: "purchase_not_found" };
    }
    if (purchase.status === "COMPLETED") {
      return { ok: true, alreadyDone: true };
    }
    const user = await upsertUserByEmail(purchase.purchaserEmail);
    await grantLicenseForPurchase({
      userId: user.id,
      applicationId: purchase.applicationId,
      stripeCheckoutSessionId: sessionId,
    });
    await db.purchase.update({
      where: { id: purchase.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
    return { ok: true };
  }

  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, reason: "stripe_not_configured" };
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return { ok: false, reason: "unpaid" };
  }

  const email =
    session.customer_details?.email ?? session.customer_email ?? purchase?.purchaserEmail;
  if (!email) {
    return { ok: false, reason: "missing_email" };
  }

  const applicationId = session.metadata?.applicationId ?? purchase?.applicationId;
  if (!applicationId) {
    return { ok: false, reason: "missing_application" };
  }

  if (purchase?.status === "COMPLETED") {
    return { ok: true, alreadyDone: true };
  }

  const user = await upsertUserByEmail(email);
  await grantLicenseForPurchase({
    userId: user.id,
    applicationId,
    stripeCheckoutSessionId: sessionId,
  });

  if (purchase) {
    await db.purchase.update({
      where: { id: purchase.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  } else {
    await db.purchase.create({
      data: {
        stripeCheckoutSessionId: sessionId,
        applicationId,
        purchaserEmail: email,
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
  }

  return { ok: true };
}
