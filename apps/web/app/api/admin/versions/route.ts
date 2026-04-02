import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { createVersionSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const items = await db.applicationVersion.findMany({
    orderBy: { createdAt: "desc" },
    include: { application: true, assets: true },
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;
  const payload = await request.json();
  const parsed = createVersionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }
  const created = await db.applicationVersion.create({ data: parsed.data });
  await writeAuditLog({
    actorUserId: context.userId,
    action: "version.create",
    targetType: "application_version",
    targetId: created.id,
  });
  return NextResponse.json({ item: created }, { status: 201 });
}
