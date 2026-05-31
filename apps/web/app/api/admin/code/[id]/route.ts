import { NextResponse } from "next/server";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import {
  codeRepositoryPatchSchema,
  setCodeRepositoryApplicationLinks,
  syncCodeRepository,
} from "@/lib/code-repository";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/json-body";

const MAX_BODY_BYTES = 16 * 1024;

type Params = { params: Promise<{ id: string }> };

// Per-owner caps. Sync calls hit the GitHub API, so it gets a tighter limit
// than schema mutations. Both protect against double-clicks and a compromised
// owner token from hammering downstreams.
const PATCH_RATE_PER_MIN = 60;
const SYNC_RATE_PER_MIN = 12;
const DELETE_RATE_PER_MIN = 30;
const RATE_WINDOW_MS = 60_000;

function rateLimited(scope: string, userId: string, max: number) {
  return !rateLimit(`admin:code:${scope}:${userId}`, max, RATE_WINDOW_MS);
}

export async function PATCH(request: Request, ctx: Params) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  if (rateLimited("patch", context.userId!, PATCH_RATE_PER_MIN)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { id } = await ctx.params;

  const body = await readJsonBody<unknown>(request, MAX_BODY_BYTES);
  if (!body.ok) {
    if (body.reason === "too_large") {
      return NextResponse.json(
        { error: "payload_too_large", limitBytes: body.limitBytes, sawBytes: body.sawBytes },
        { status: 413 },
      );
    }
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = codeRepositoryPatchSchema.safeParse(body.data);
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

  if (rateLimited("sync", context.userId!, SYNC_RATE_PER_MIN)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

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

  if (rateLimited("delete", context.userId!, DELETE_RATE_PER_MIN)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

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
