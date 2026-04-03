import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { presignReleaseAssetPutUrl } from "@/lib/s3-release-presign";
import { releaseAssetUploadRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const payload = await request.json();
  const parsed = releaseAssetUploadRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }

  const version = await db.applicationVersion.findUnique({
    where: { id: parsed.data.versionId },
    include: {
      application: true,
    },
  });

  if (!version) {
    return NextResponse.json({ error: "version_not_found" }, { status: 404 });
  }

  const result = await presignReleaseAssetPutUrl({
    appSlug: version.application.slug,
    version: version.version,
    fileName: parsed.data.fileName,
    contentType: parsed.data.contentType,
  });

  if (!result) {
    return NextResponse.json(
      {
        error: "s3_release_not_configured",
        message:
          "Set AWS_S3_RELEASE_BUCKET and AWS credentials; ensure AWS_S3_PRESIGN_ENABLED is not 0.",
      },
      { status: 501 },
    );
  }

  await writeAuditLog({
    actorUserId: context.userId,
    action: "release_asset.upload_url.create",
    targetType: "application_version",
    targetId: version.id,
    metadata: {
      applicationId: version.applicationId,
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
