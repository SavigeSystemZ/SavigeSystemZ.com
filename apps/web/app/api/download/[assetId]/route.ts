import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/auth";
import { createSignedDownloadToken } from "@/lib/signed-download";

const SIGNED_TTL_SECONDS = 300;

export async function GET(request: Request, props: { params: Promise<{ assetId: string }> }) {
  const { assetId } = await props.params;
  const context = await getAuthContext();

  const asset = await db.releaseAsset.findUnique({
    where: { id: assetId },
    include: {
      version: true,
    },
  });

  if (!asset) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (asset.visibility === "PRIVATE") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (asset.visibility === "ENTITLED") {
    if (!context.userId) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    }
    const license = await db.license.findFirst({
      where: {
        userId: context.userId,
        applicationId: asset.version.applicationId,
        status: "ACTIVE",
      },
    });
    if (!license) {
      return NextResponse.json({ error: "entitlement_required" }, { status: 403 });
    }
  }

  const exp = Math.floor(Date.now() / 1000) + SIGNED_TTL_SECONDS;
  const signedToken = createSignedDownloadToken({
    assetId: asset.id,
    exp,
    userId: context.userId,
  });

  const { searchParams } = new URL(request.url);
  if (searchParams.get("redirect") === "1") {
    const { origin } = new URL(request.url);
    return NextResponse.redirect(
      `${origin}/api/files/signed?token=${encodeURIComponent(signedToken)}`,
    );
  }

  return NextResponse.json({
    ok: true,
    fileUrl: asset.fileUrl,
    signedUrl: `/api/files/signed?token=${encodeURIComponent(signedToken)}`,
    expiresAtEpoch: exp,
    note: "Prefer signedUrl for time-limited delivery; direct fileUrl is for admin-only contexts.",
  });
}
