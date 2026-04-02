import { NextResponse } from "next/server";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";

export async function DELETE(_request: Request, props: { params: Promise<{ id: string }> }) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;
  if (!context.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await props.params;

  const existing = await db.passkeyCredential.findFirst({
    where: { id, userId: context.userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await db.passkeyCredential.delete({ where: { id } });

  await writeAuditLog({
    actorUserId: context.userId,
    action: "passkey.revoke",
    targetType: "passkey_credential",
    targetId: id,
    metadata: { credentialIdPrefix: existing.credentialId.slice(0, 12) },
  });

  return NextResponse.json({ ok: true });
}
