import { NextResponse } from "next/server";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { promoteCreatorSubmissionToDraft } from "@/lib/creator-promotion";
import { db } from "@/lib/db";

export async function POST(
  _: Request,
  props: { params: Promise<{ id: string }> },
) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const { id } = await props.params;

  const submission = await db.creatorSubmission.findUnique({
    where: { id },
  });

  if (!submission) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (submission.deletedAt) {
    return NextResponse.json({ error: "submission_archived" }, { status: 409 });
  }

  const result = await db.$transaction((tx) =>
    promoteCreatorSubmissionToDraft(tx, submission, context.userId!),
  );

  return NextResponse.json({
    ok: true,
    promotion: result,
  });
}
