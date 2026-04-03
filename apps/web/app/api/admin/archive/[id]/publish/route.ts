import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { evaluateArchiveLaunchReadiness } from "@/lib/launch-readiness";

export async function POST(
  _: Request,
  props: { params: Promise<{ id: string }> },
) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const { id } = await props.params;
  const item = await db.archiveEntry.findUnique({ where: { id } });

  if (!item) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const readiness = evaluateArchiveLaunchReadiness(item);
  if (!readiness.ready) {
    return NextResponse.json(
      {
        error: "launch_not_ready",
        readiness,
      },
      { status: 409 },
    );
  }

  const updated =
    item.visibility === "PUBLIC"
      ? item
      : await db.archiveEntry.update({
          where: { id },
          data: { visibility: "PUBLIC" },
        });

  await writeAuditLog({
    actorUserId: context.userId,
    action: "archive_entry.publish",
    targetType: "archive_entry",
    targetId: updated.id,
    metadata: {
      slug: updated.slug,
      blockers: readiness.blockers.length,
      warnings: readiness.warnings.length,
    },
  });

  return NextResponse.json({
    item: updated,
    launchReadiness: evaluateArchiveLaunchReadiness(updated),
  });
}
