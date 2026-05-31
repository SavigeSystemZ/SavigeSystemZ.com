import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { updateApplicationSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";
import { readJsonBody } from "@/lib/json-body";

const MAX_BODY_BYTES = 64 * 1024;

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const { id } = await props.params;
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
  const parsed = updateApplicationSchema.safeParse(body.data);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }

  const updated = await db.application.update({
    where: { id },
    data: parsed.data,
  });

  await writeAuditLog({
    actorUserId: context.userId,
    action: "application.update",
    targetType: "application",
    targetId: id,
  });

  return NextResponse.json({ item: updated });
}

export async function DELETE(_: Request, props: { params: Promise<{ id: string }> }) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const { id } = await props.params;

  await db.application.delete({ where: { id } });
  await writeAuditLog({
    actorUserId: context.userId,
    action: "application.delete",
    targetType: "application",
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}
