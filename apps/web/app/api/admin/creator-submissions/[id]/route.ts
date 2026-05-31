import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateCreatorSubmissionSchema } from "@/lib/validation";
import { readJsonBody } from "@/lib/json-body";

const MAX_BODY_BYTES = 32 * 1024;

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const { id } = await props.params;

  const body = await readJsonBody<unknown>(request, MAX_BODY_BYTES);
  if (!body.ok) {
    if (body.reason === "too_large") {
      return NextResponse.json(
        { error: "payload_too_large", limitBytes: body.limitBytes, sawBytes: body.sawBytes },
        { status: 413 },
      );
    }
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = updateCreatorSubmissionSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }

  const existing = await db.creatorSubmission.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const updated = await db.creatorSubmission.update({
    where: { id },
    data: {
      status: parsed.data.status,
      ownerNotes: parsed.data.ownerNotes,
      deletedAt:
        parsed.data.archived === undefined
          ? undefined
          : parsed.data.archived
            ? new Date()
            : null,
    },
  });

  await writeAuditLog({
    actorUserId: context.userId,
    action: "creator_submission.update",
    targetType: "creator_submission",
    targetId: updated.id,
    metadata: {
      statusBefore: existing.status,
      statusAfter: updated.status,
      archived: Boolean(updated.deletedAt),
    },
  });

  return NextResponse.json({ item: updated });
}
