import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { createReleaseAssetSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;
  const items = await db.releaseAsset.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      version: {
        include: {
          application: true,
        },
      },
    },
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;
  const payload = await request.json();
  const parsed = createReleaseAssetSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }
  const created = await db.releaseAsset.create({ data: parsed.data });
  await writeAuditLog({
    actorUserId: context.userId,
    action: "release_asset.create",
    targetType: "release_asset",
    targetId: created.id,
  });
  return NextResponse.json({ item: created }, { status: 201 });
}
