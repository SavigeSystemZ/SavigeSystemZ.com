import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { evaluateArchiveLaunchReadiness } from "@/lib/launch-readiness";
import { archiveLaunchComposerSchema } from "@/lib/validation";
import { readJsonBody } from "@/lib/json-body";

const MAX_BODY_BYTES = 256 * 1024;

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const body = await readJsonBody(request, MAX_BODY_BYTES);
  if (!body.ok) {
    if (body.reason === "too_large") {
      return NextResponse.json(
        { error: "payload_too_large", limitBytes: body.limitBytes, sawBytes: body.sawBytes },
        { status: 413 },
      );
    }
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = archiveLaunchComposerSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { publishAfterCreate, ...entryData } = parsed.data;

  // Check slug uniqueness before creating
  const existing = await db.archiveEntry.findUnique({
    where: { slug: entryData.slug },
  });
  if (existing) {
    return NextResponse.json(
      { error: "slug_exists", message: `Archive entry with slug "${entryData.slug}" already exists.` },
      { status: 409 },
    );
  }

  // Create the archive entry as DRAFT
  const created = await db.archiveEntry.create({
    data: {
      ...entryData,
      visibility: "DRAFT",
    },
  });

  await writeAuditLog({
    actorUserId: context.userId,
    action: "archive_entry.launch_compose",
    targetType: "archive_entry",
    targetId: created.id,
    metadata: {
      slug: created.slug,
      category: created.category,
      publishAfterCreate,
    },
  });

  // Evaluate readiness and conditionally publish
  const readiness = evaluateArchiveLaunchReadiness(created);
  let published = false;

  if (publishAfterCreate && readiness.ready) {
    await db.archiveEntry.update({
      where: { id: created.id },
      data: { visibility: "PUBLIC" },
    });
    created.visibility = "PUBLIC";
    published = true;

    await writeAuditLog({
      actorUserId: context.userId,
      action: "archive_entry.publish",
      targetType: "archive_entry",
      targetId: created.id,
      metadata: {
        slug: created.slug,
        via: "launch_compose",
        blockers: readiness.blockers.length,
        warnings: readiness.warnings.length,
      },
    });
  }

  return NextResponse.json(
    {
      item: created,
      launchReadiness: evaluateArchiveLaunchReadiness(created),
      published,
    },
    { status: 201 },
  );
}
