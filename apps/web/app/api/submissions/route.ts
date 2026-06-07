import { NextResponse } from "next/server";
import { getRequestClientIp } from "@/lib/client-ip";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { isProjectRequestHoneypotTripped } from "@/lib/project-request-honeypot";
import { rateLimit } from "@/lib/rate-limit";
import { creatorSubmissionSchema } from "@/lib/validation";

const WINDOW_MS = 60_000;
/** Parallel E2E hammers one IP; keep production tight. */
const MAX_PER_IP = process.env.NODE_ENV === "production" ? 6 : 1000;

export async function POST(request: Request) {
  const ip = getRequestClientIp(request);
  if (!rateLimit(`creator-submissions:${ip}`, MAX_PER_IP, WINDOW_MS)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = creatorSubmissionSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }

  if (isProjectRequestHoneypotTripped(parsed.data.website)) {
    return NextResponse.json({ ok: true, status: "received" });
  }

  const created = await db.creatorSubmission.create({
    data: {
      title: parsed.data.title,
      type: parsed.data.type,
      summary: parsed.data.summary,
      details: parsed.data.details,
      plannedVisibility: parsed.data.plannedVisibility,
      contactEmail: parsed.data.contactEmail,
      repoUrl: parsed.data.repoUrl,
      artifactUrl: parsed.data.artifactUrl,
      sourceIp: ip !== "unknown" ? ip : null,
    },
  });

  await writeAuditLog({
    actorUserId: null,
    action: "creator_submission.create",
    targetType: "creator_submission",
    targetId: created.id,
    metadata: {
      type: created.type,
      plannedVisibility: created.plannedVisibility,
      hasEmail: Boolean(created.contactEmail),
      hasRepoUrl: Boolean(created.repoUrl),
      hasArtifactUrl: Boolean(created.artifactUrl),
    },
  });

  return NextResponse.json({
    ok: true,
    status: "queued_for_moderation",
    id: created.id,
  });
}
