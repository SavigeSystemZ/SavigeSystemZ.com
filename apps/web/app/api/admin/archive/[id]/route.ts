import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateArchiveEntrySchema } from "@/lib/validation";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const { id } = await props.params;
  const payload = await request.json();
  const parsed = updateArchiveEntrySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }

  const updated = await db.archiveEntry.update({
    where: { id },
    data: parsed.data,
  });

  await writeAuditLog({
    actorUserId: context.userId,
    action: "archive_entry.update",
    targetType: "archive_entry",
    targetId: id,
    metadata: {
      slug: updated.slug,
    },
  });

  return NextResponse.json({ item: updated });
}

export async function DELETE(_: Request, props: { params: Promise<{ id: string }> }) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const { id } = await props.params;

  await db.archiveEntry.delete({ where: { id } });
  await writeAuditLog({
    actorUserId: context.userId,
    action: "archive_entry.delete",
    targetType: "archive_entry",
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}
