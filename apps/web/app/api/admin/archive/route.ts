import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { evaluateArchiveLaunchReadiness } from "@/lib/launch-readiness";
import { createArchiveEntrySchema } from "@/lib/validation";

export async function GET() {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const items = await db.archiveEntry.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({
    items: items.map((item) => ({
      ...item,
      launchReadiness: evaluateArchiveLaunchReadiness(item),
    })),
  });
}

export async function POST(request: Request) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const payload = await request.json();
  const parsed = createArchiveEntrySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }

  const created = await db.archiveEntry.create({
    data: parsed.data,
  });

  await writeAuditLog({
    actorUserId: context.userId,
    action: "archive_entry.create",
    targetType: "archive_entry",
    targetId: created.id,
    metadata: {
      slug: created.slug,
      category: created.category,
    },
  });

  return NextResponse.json({ item: created }, { status: 201 });
}
