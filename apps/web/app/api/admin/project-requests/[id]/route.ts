import { NextResponse } from "next/server";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { updateProjectRequestSchema } from "@/lib/validation";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;
  if (!context.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await props.params;
  const raw = await request.json().catch(() => null);
  const parsed = updateProjectRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }

  const existing = await db.projectRequest.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (existing.deletedAt) {
    if (parsed.data.archived !== false) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }
    const updated = await db.projectRequest.update({
      where: { id },
      data: {
        deletedAt: null,
        ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
      },
    });
    await writeAuditLog({
      actorUserId: context.userId,
      action: "project_request.restore",
      targetType: "project_request",
      targetId: id,
      metadata: { status: updated.status },
    });
    return NextResponse.json({ item: updated });
  }

  if (parsed.data.archived === false) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  if (parsed.data.archived === true) {
    const updated = await db.projectRequest.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
      },
    });
    await writeAuditLog({
      actorUserId: context.userId,
      action: "project_request.archive",
      targetType: "project_request",
      targetId: id,
      metadata: { status: updated.status },
    });
    return NextResponse.json({ item: updated });
  }

  if (parsed.data.status === undefined) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const updated = await db.projectRequest.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  await writeAuditLog({
    actorUserId: context.userId,
    action: "project_request.update",
    targetType: "project_request",
    targetId: id,
    metadata: { from: existing.status, to: updated.status },
  });

  return NextResponse.json({ item: updated });
}
