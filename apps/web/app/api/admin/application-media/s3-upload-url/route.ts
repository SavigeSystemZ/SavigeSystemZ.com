import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { presignApplicationMediaPutUrl } from "@/lib/s3-application-media-presign";
import { applicationMediaUploadRequestSchema } from "@/lib/validation";
import { readJsonBody } from "@/lib/json-body";

const MAX_BODY_BYTES = 8 * 1024;

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
  const parsed = applicationMediaUploadRequestSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }

  const application = await db.application.findUnique({
    where: { id: parsed.data.applicationId },
  });

  if (!application) {
    return NextResponse.json({ error: "application_not_found" }, { status: 404 });
  }

  const result = await presignApplicationMediaPutUrl({
    appSlug: application.slug,
    fileName: parsed.data.fileName,
    contentType: parsed.data.contentType,
  });

  if (!result) {
    return NextResponse.json(
      {
        error: "s3_media_not_configured",
        message:
          "Set AWS_S3_MEDIA_BUCKET or AWS_S3_RELEASE_BUCKET and AWS credentials; ensure AWS_S3_PRESIGN_ENABLED is not 0.",
      },
      { status: 501 },
    );
  }

  await writeAuditLog({
    actorUserId: context.userId,
    action: "application_media.upload_url.create",
    targetType: "application",
    targetId: application.id,
    metadata: {
      bucket: result.bucket,
      key: result.key,
      fileName: parsed.data.fileName,
    },
  });

  return NextResponse.json({
    ok: true,
    uploadUrl: result.uploadUrl,
    bucket: result.bucket,
    key: result.key,
    fileUrl: result.fileUrl,
    fileName: parsed.data.fileName,
    expiresInSeconds: result.expiresInSeconds,
    method: "PUT" as const,
  });
}
