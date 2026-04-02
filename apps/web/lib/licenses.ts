import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

export async function upsertUserByEmail(email: string, name?: string | null) {
  return db.user.upsert({
    where: { email },
    update: { name: name ?? undefined },
    create: {
      email,
      name: name ?? null,
      role: "USER",
    },
  });
}

export async function grantLicenseForPurchase(input: {
  userId: string;
  applicationId: string;
  stripeCheckoutSessionId: string;
  actorUserId?: string | null;
}): Promise<{ licenseId: string; created: boolean }> {
  const existing = await db.license.findFirst({
    where: { stripeCheckoutSessionId: input.stripeCheckoutSessionId },
  });
  if (existing) {
    return { licenseId: existing.id, created: false };
  }

  const license = await db.license.create({
    data: {
      userId: input.userId,
      applicationId: input.applicationId,
      status: "ACTIVE",
      stripeCheckoutSessionId: input.stripeCheckoutSessionId,
    },
  });

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

  return { licenseId: license.id, created: true };
}
