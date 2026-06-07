import { NextResponse } from "next/server";
import { getRequestClientIp } from "@/lib/client-ip";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { isProjectRequestHoneypotTripped } from "@/lib/project-request-honeypot";
import { rateLimit } from "@/lib/rate-limit";
import { isRedisRateLimitConfigured, slidingWindowAllowRedis, isRedisStrict } from "@/lib/redis-rate-limit";
import { projectRequestSchema } from "@/lib/validation";

const WINDOW_MS = 60_000;
/** Parallel E2E hammers one IP; keep production tight. */
const MAX_PER_IP = process.env.NODE_ENV === "production" ? 8 : 1000;

export async function POST(request: Request) {
  const ip = getRequestClientIp(request);
  const logicalKey = `project-requests:${ip}`;

  if (isRedisRateLimitConfigured()) {
    try {
      const ok = await slidingWindowAllowRedis(logicalKey, MAX_PER_IP, WINDOW_MS);
      if (!ok) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      }
    } catch (e) {
      if (isRedisStrict()) {
        console.error("[project-requests-rate-limit] redis strict mode blocked request due to error:", e);
        return NextResponse.json({ error: "rate_limit_backend_unavailable" }, { status: 503 });
      }
      console.error("[project-requests-rate-limit] redis error; falling back to in-memory:", e);
      if (!rateLimit(logicalKey, MAX_PER_IP, WINDOW_MS)) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      }
    }
  } else {
    if (!rateLimit(logicalKey, MAX_PER_IP, WINDOW_MS)) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = projectRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }

  if (isProjectRequestHoneypotTripped(parsed.data.website)) {
    return NextResponse.json({ ok: true, status: "received" });
  }

  const created = await db.projectRequest.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      contactEmail: parsed.data.contactEmail,
      sourceIp: ip !== "unknown" ? ip : null,
    },
  });

  await writeAuditLog({
    actorUserId: null,
    action: "project_request.create",
    targetType: "project_request",
    targetId: created.id,
    metadata: {
      hasEmail: Boolean(created.contactEmail),
    },
  });

  return NextResponse.json({
    ok: true,
    status: "received",
    id: created.id,
  });
}
