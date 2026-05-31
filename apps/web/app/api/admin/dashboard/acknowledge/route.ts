import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { getRequestClientIp } from "@/lib/client-ip";
import { rateLimit } from "@/lib/rate-limit";

const ACK_RATE_LIMIT_PER_MINUTE = 60;
const ACK_WINDOW_MS = 60_000;

const bodySchema = z.object({
  alertKey: z.string().min(1).max(200),
});

/**
 * Acknowledge a dashboard alert. Idempotent — repeated acknowledgement of an
 * already-acknowledged alert returns 200 without rewriting the row.
 *
 * Errors:
 *   400 invalid body
 *   403 not owner
 *   404 unknown alertKey
 *   429 rate limited
 */
export async function POST(request: Request) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const ip = getRequestClientIp(request);
  if (!rateLimit(`admin:dashboard:ack:${context.userId}:${ip}`, ACK_RATE_LIMIT_PER_MINUTE, ACK_WINDOW_MS)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", issues: parsed.error.issues }, { status: 400 });
  }

  const existing = await db.dashboardAlert.findUnique({ where: { alertKey: parsed.data.alertKey } });
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (existing.acknowledgedAt) {
    return NextResponse.json({ ok: true, alreadyAcknowledged: true });
  }

  const updated = await db.dashboardAlert.update({
    where: { alertKey: parsed.data.alertKey },
    data: {
      acknowledgedAt: new Date(),
      acknowledgedBy: context.userId,
    },
  });

  await writeAuditLog({
    actorUserId: context.userId,
    action: "admin.dashboard.alert.acknowledge",
    targetType: "DashboardAlert",
    targetId: parsed.data.alertKey,
    metadata: { category: updated.category, severity: updated.severity, ip },
  });

  return NextResponse.json({
    ok: true,
    alert: {
      alertKey: updated.alertKey,
      acknowledgedAt: updated.acknowledgedAt?.toISOString(),
      acknowledgedBy: updated.acknowledgedBy,
    },
  });
}
