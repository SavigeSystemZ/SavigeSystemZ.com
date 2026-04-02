import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { updateVersionSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;
  const { id } = await props.params;
  const payload = await request.json();
  const parsed = updateVersionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }
  const updated = await db.applicationVersion.update({ where: { id }, data: parsed.data });
  await writeAuditLog({
    actorUserId: context.userId,
    action: "version.update",
    targetType: "application_version",
    targetId: id,
  });
  return NextResponse.json({ item: updated });
}

export async function DELETE(_: Request, props: { params: Promise<{ id: string }> }) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;
  const { id } = await props.params;
  await db.applicationVersion.delete({ where: { id } });
  await writeAuditLog({
    actorUserId: context.userId,
    action: "version.delete",
    targetType: "application_version",
    targetId: id,
  });
  return NextResponse.json({ ok: true });
}
