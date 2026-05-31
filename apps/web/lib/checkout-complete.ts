import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { getStripe } from "@/lib/stripe-client";
import { grantLicenseForPurchase, upsertUserByEmail } from "@/lib/licenses";

/**
 * Mark a Stripe checkout session as fulfilled: upsert the user, grant the
 * license, and mark/create the Purchase row as COMPLETED. The license-grant
 * and purchase-update are run inside a single `db.$transaction` so a partial
 * failure cannot leave a license active without the matching Purchase row in
 * COMPLETED state. The audit log is best-effort and emitted after the
 * transaction commits.
 */
export async function completePurchaseFromSessionId(sessionId: string): Promise<{
  ok: boolean;
  reason?: string;
  alreadyDone?: boolean;
  userId?: string;
  applicationId?: string;
}> {
  const purchase = await db.purchase.findUnique({
    where: { stripeCheckoutSessionId: sessionId },
  });

  if (sessionId.startsWith("cs_mock_")) {
    if (!purchase) {
      return { ok: false, reason: "purchase_not_found" };
    }
    if (purchase.status === "COMPLETED") {
      const user = await upsertUserByEmail(purchase.purchaserEmail);
      return { ok: true, alreadyDone: true, userId: user.id, applicationId: purchase.applicationId };
    }
    const user = await upsertUserByEmail(purchase.purchaserEmail);
    const grant = await db.$transaction(async (tx) => {
      const result = await grantLicenseForPurchase(
        {
          userId: user.id,
          applicationId: purchase.applicationId,
          stripeCheckoutSessionId: sessionId,
        },
        tx,
      );
      await tx.purchase.update({
        where: { id: purchase.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      return result;
    });
    if (grant.created) {
      await writeAuditLog({
        action: "license.grant",
        targetType: "license",
        targetId: grant.licenseId,
        metadata: { applicationId: purchase.applicationId, stripeCheckoutSessionId: sessionId },
      });
    }
    return { ok: true, userId: user.id, applicationId: purchase.applicationId };
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
    const user = await upsertUserByEmail(email);
    return { ok: true, alreadyDone: true, userId: user.id, applicationId };
  }

  const user = await upsertUserByEmail(email);
  const grant = await db.$transaction(async (tx) => {
    const result = await grantLicenseForPurchase(
      {
        userId: user.id,
        applicationId,
        stripeCheckoutSessionId: sessionId,
      },
      tx,
    );
    if (purchase) {
      await tx.purchase.update({
        where: { id: purchase.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
    } else {
      // Live Stripe path may produce a webhook without a pre-created Purchase row
      // (mock mode pre-creates the row at checkout time). Use upsert on the
      // unique session id so a Stripe retry on the same session is safe.
      await tx.purchase.upsert({
        where: { stripeCheckoutSessionId: sessionId },
        create: {
          stripeCheckoutSessionId: sessionId,
          applicationId,
          purchaserEmail: email,
          status: "COMPLETED",
          completedAt: new Date(),
        },
        update: { status: "COMPLETED", completedAt: new Date() },
      });
    }
    return result;
  });
  if (grant.created) {
    await writeAuditLog({
      action: "license.grant",
      targetType: "license",
      targetId: grant.licenseId,
      metadata: { applicationId, stripeCheckoutSessionId: sessionId },
    });
  }

  return { ok: true, userId: user.id, applicationId };
}
