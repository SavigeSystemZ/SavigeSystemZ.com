import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateApplicationMediaSchema } from "@/lib/validation";
import { readJsonBody } from "@/lib/json-body";

const MAX_BODY_BYTES = 32 * 1024;

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
  const parsed = updateApplicationMediaSchema.safeParse(body.data);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }

  const updated = await db.applicationMedia.update({
    where: { id },
    data: parsed.data,
  });

  await writeAuditLog({
    actorUserId: context.userId,
    action: "application_media.update",
    targetType: "application_media",
    targetId: id,
  });

  return NextResponse.json({ item: updated });
}

export async function DELETE(_: Request, props: { params: Promise<{ id: string }> }) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const { id } = await props.params;

  await db.applicationMedia.delete({ where: { id } });
  await writeAuditLog({
    actorUserId: context.userId,
    action: "application_media.delete",
    targetType: "application_media",
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}
