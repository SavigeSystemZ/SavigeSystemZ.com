import { NextResponse } from "next/server";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import {
  codeRepositoryCreateSchema,
  createCodeRepositoryFromGithub,
  listApplicationsForLinking,
  listCodeRepositories,
} from "@/lib/code-repository";

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = codeRepositoryCreateSchema.safeParse(body);
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
