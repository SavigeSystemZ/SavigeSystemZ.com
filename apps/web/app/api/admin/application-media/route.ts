import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { createApplicationMediaSchema } from "@/lib/validation";

export async function GET() {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const items = await db.applicationMedia.findMany({
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      application: true,
    },
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const payload = await request.json();
  const parsed = createApplicationMediaSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }

  const created = await db.applicationMedia.create({
    data: parsed.data,
  });

  await writeAuditLog({
    actorUserId: context.userId,
    action: "application_media.create",
    targetType: "application_media",
    targetId: created.id,
    metadata: {
      applicationId: created.applicationId,
      mediaUrl: created.mediaUrl,
    },
  });

  return NextResponse.json({ item: created }, { status: 201 });
}
