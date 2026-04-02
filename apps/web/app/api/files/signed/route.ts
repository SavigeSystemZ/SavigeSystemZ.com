import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/auth";
import { canAttemptS3Presign, presignS3GetUrl } from "@/lib/s3-presign";
import { verifySignedDownloadToken } from "@/lib/signed-download";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const payload = verifySignedDownloadToken(token ?? undefined);
  if (!payload) {
    return NextResponse.json({ error: "invalid_or_expired_token" }, { status: 401 });
  }

  const asset = await db.releaseAsset.findUnique({
    where: { id: payload.assetId },
    include: { version: true },
  });

  if (!asset) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const context = await getAuthContext();

  if (asset.visibility === "PRIVATE") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (asset.visibility === "ENTITLED") {
    const userId = payload.userId ?? context.userId;
    if (!userId) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    }
    const license = await db.license.findFirst({
      where: {
        userId,
        applicationId: asset.version.applicationId,
        status: "ACTIVE",
      },
    });
    if (!license) {
      return NextResponse.json({ error: "entitlement_required" }, { status: 403 });
    }
  }

  await db.downloadEvent.create({
    data: {
      userId: payload.userId ?? context.userId,
      releaseAssetId: asset.id,
    },
  });

  if (canAttemptS3Presign(asset)) {
    const presigned = await presignS3GetUrl({
      bucket: asset.s3Bucket!,
      key: asset.s3Key!,
    });
    if (presigned) {
      return NextResponse.redirect(presigned);
    }
  }

  return NextResponse.redirect(asset.fileUrl);
}
