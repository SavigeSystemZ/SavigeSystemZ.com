import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { evaluateApplicationLaunchReadiness } from "@/lib/launch-readiness";
import { createApplicationSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";
import { readJsonBody } from "@/lib/json-body";

const MAX_BODY_BYTES = 64 * 1024;

export async function GET() {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const items = await db.application.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      media: {
        select: {
          id: true,
          featured: true,
        },
      },
      versions: {
        include: {
          assets: {
            select: {
              id: true,
              visibility: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return NextResponse.json({
    items: items.map((item) => ({
      ...item,
      launchReadiness: evaluateApplicationLaunchReadiness(item),
    })),
  });
}

export async function POST(request: Request) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

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
  const parsed = createApplicationSchema.safeParse(body.data);
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
