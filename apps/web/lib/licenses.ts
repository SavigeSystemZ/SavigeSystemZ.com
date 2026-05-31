import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

type DbLike = typeof db | Prisma.TransactionClient;

export async function upsertUserByEmail(email: string, name?: string | null, client: DbLike = db) {
  return client.user.upsert({
    where: { email },
    update: { name: name ?? undefined },
    create: {
      email,
      name: name ?? null,
      role: "USER",
    },
  });
}

/**
 * Grant a license for a completed checkout session. Idempotent — returns the
 * existing license if one already exists for the session. Pass `client` when
 * calling from inside a `db.$transaction(...)` so the read+create observes the
 * transaction's isolation. The audit log is best-effort and emitted by the
 * caller after the transaction commits, so a transient audit failure cannot
 * roll back the license grant.
 */
export async function grantLicenseForPurchase(
  input: {
    userId: string;
    applicationId: string;
    stripeCheckoutSessionId: string;
    actorUserId?: string | null;
  },
  client: DbLike = db,
): Promise<{ licenseId: string; created: boolean }> {
  const existing = await client.license.findFirst({
    where: { stripeCheckoutSessionId: input.stripeCheckoutSessionId },
  });
  if (existing) {
    return { licenseId: existing.id, created: false };
  }

  const license = await client.license.create({
    data: {
      userId: input.userId,
      applicationId: input.applicationId,
      status: "ACTIVE",
      stripeCheckoutSessionId: input.stripeCheckoutSessionId,
    },
  });

  // When called outside a transaction, log inline. Transactional callers pass
  // their own `client` and emit the audit log after `$transaction` resolves.
  if (client === db) {
    await writeAuditLog({
      actorUserId: input.actorUserId ?? null,
      action: "license.grant",
      targetType: "license",
      targetId: license.id,
      metadata: {
        applicationId: input.applicationId,
        stripeCheckoutSessionId: input.stripeCheckoutSessionId,
      },
    });
  }

  return { licenseId: license.id, created: true };
}
