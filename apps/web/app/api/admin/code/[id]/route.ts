import { NextResponse } from "next/server";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import {
  codeRepositoryPatchSchema,
  setCodeRepositoryApplicationLinks,
  syncCodeRepository,
} from "@/lib/code-repository";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Params) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = codeRepositoryPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    let updated = null;

    if (parsed.data.applicationIds !== undefined) {
      updated = await setCodeRepositoryApplicationLinks(id, parsed.data.applicationIds);
      await writeAuditLog({
        actorUserId: context.userId,
        action: "code.repository.link",
        targetType: "CodeRepository",
        targetId: id,
        metadata: { applicationIds: parsed.data.applicationIds },
      });
    }

    if (parsed.data.visibility !== undefined) {
      updated = await db.codeRepository.update({
        where: { id },
        data: { visibility: parsed.data.visibility },
        include: {
          applications: {
            select: { id: true, slug: true, name: true, visibility: true },
            orderBy: [{ name: "asc" }],
          },
        },
      });
      await writeAuditLog({
        actorUserId: context.userId,
        action: "code.repository.visibility",
        targetType: "CodeRepository",
        targetId: id,
        metadata: { visibility: parsed.data.visibility },
      });
    }

    if (!updated) {
      return NextResponse.json({ error: "No patch fields provided" }, { status: 400 });
    }
    return NextResponse.json({ item: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update repository";
    const status = /not found/i.test(message) ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(_request: Request, ctx: Params) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const { id } = await ctx.params;

  try {
    const updated = await syncCodeRepository(id);
    await writeAuditLog({
      actorUserId: context.userId,
      action: "code.repository.sync",
      targetType: "CodeRepository",
      targetId: updated.id,
      metadata: { syncStatus: updated.syncStatus },
    });
    return NextResponse.json({ item: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, ctx: Params) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const { id } = await ctx.params;
  const row = await db.codeRepository.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.codeRepository.delete({ where: { id } });
  await writeAuditLog({
    actorUserId: context.userId,
    action: "code.repository.delete",
    targetType: "CodeRepository",
    targetId: id,
    metadata: { slug: row.slug },
  });
  return NextResponse.json({ ok: true });
}
