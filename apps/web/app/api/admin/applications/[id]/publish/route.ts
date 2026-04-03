import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { evaluateApplicationLaunchReadiness } from "@/lib/launch-readiness";

export async function POST(
  _: Request,
  props: { params: Promise<{ id: string }> },
) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const { id } = await props.params;
  const item = await db.application.findUnique({
    where: { id },
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

  if (!item) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const readiness = evaluateApplicationLaunchReadiness(item);
  if (!readiness.ready) {
    return NextResponse.json(
      {
        error: "launch_not_ready",
        readiness,
      },
      { status: 409 },
    );
  }

  const updated =
    item.visibility === "PUBLIC"
      ? item
      : await db.application.update({
          where: { id },
          data: { visibility: "PUBLIC" },
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

  await writeAuditLog({
    actorUserId: context.userId,
    action: "application.publish",
    targetType: "application",
    targetId: updated.id,
    metadata: {
      slug: updated.slug,
      blockers: readiness.blockers.length,
      warnings: readiness.warnings.length,
    },
  });

  return NextResponse.json({
    item: updated,
    launchReadiness: evaluateApplicationLaunchReadiness(updated),
  });
}
