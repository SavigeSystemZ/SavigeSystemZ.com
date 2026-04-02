import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { createApplicationSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const items = await db.application.findMany({
    orderBy: { createdAt: "desc" },
    include: { versions: true },
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const payload = await request.json();
  const parsed = createApplicationSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }

  const created = await db.application.create({
    data: parsed.data,
  });

  await writeAuditLog({
    actorUserId: context.userId,
    action: "application.create",
    targetType: "application",
    targetId: created.id,
    metadata: { slug: created.slug },
  });

  return NextResponse.json({ item: created }, { status: 201 });
}
