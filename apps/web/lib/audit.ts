import { db } from "@/lib/db";

type AuditInput = {
  actorUserId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function writeAuditLog(input: AuditInput): Promise<void> {
  await db.auditLog.create({
    data: {
      actorUserId: input.actorUserId ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });

  // Best effort async retention sweep, fire and forget
  enforceAuditRetentionPolicy().catch((err) => {
    console.error("Audit retention sweep failed", err);
  });
}

// Keep audit logs for 90 days
const RETENTION_DAYS = 90;

export async function enforceAuditRetentionPolicy() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  await db.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoff,
      },
    },
  });
}
