import { NextResponse } from "next/server";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import {
  codeRepositoryCreateSchema,
  createCodeRepositoryFromGithub,
  listApplicationsForLinking,
  listCodeRepositories,
} from "@/lib/code-repository";
import { readJsonBody } from "@/lib/json-body";

const MAX_BODY_BYTES = 16 * 1024;

export async function GET() {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const [items, applications] = await Promise.all([
    listCodeRepositories(),
    listApplicationsForLinking(),
  ]);
  return NextResponse.json({ items, applications });
}

export async function POST(request: Request) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

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

  const parsed = codeRepositoryCreateSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const created = await createCodeRepositoryFromGithub(parsed.data);
    await writeAuditLog({
      actorUserId: context.userId,
      action: "code.repository.create",
      targetType: "CodeRepository",
      targetId: created.id,
      metadata: { slug: created.slug, githubOwner: created.githubOwner, githubRepo: created.githubRepo },
    });
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create repository";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
