import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(_: Request, props: { params: Promise<{ id: string }> }) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const limited = rateLimit(`admin:set-catalog-screenshot:${context.userId}`, 30, 60_000);
  if (!limited) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { id } = await props.params;
  const media = await db.applicationMedia.findUnique({
    where: { id },
    include: { application: { select: { id: true, name: true, slug: true } } },
  });

  if (!media) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await db.applicationMedia.updateMany({
    where: {
      applicationId: media.applicationId,
      id: { not: id },
      OR: [
        { title: { contains: "Repository preview", mode: "insensitive" } },
        { mediaUrl: { contains: "/screenshots/" } },
      ],
    },
    data: { sortOrder: { increment: 10 } },
  });

  const updated = await db.applicationMedia.update({
    where: { id },
    data: {
      title: `Repository preview — ${media.application.name}`,
      altText: `${media.application.name} catalog screenshot`,
      description:
        media.description ??
        `Primary catalog screenshot for ${media.application.name}. Used on cards, downloads, and detail surfaces.`,
      sortOrder: 0,
      featured: true,
    },
  });

  await writeAuditLog({
    actorUserId: context.userId,
    action: "application_media.set_catalog_screenshot",
    targetType: "application_media",
    targetId: id,
    metadata: { applicationId: media.applicationId, applicationSlug: media.application.slug },
  });

  return NextResponse.json({ item: updated });
}
