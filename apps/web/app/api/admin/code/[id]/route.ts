import { NextResponse } from "next/server";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { syncCodeRepository } from "@/lib/code-repository";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

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
