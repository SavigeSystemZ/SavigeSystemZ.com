import { NextResponse } from "next/server";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { evaluateApplicationLaunchReadiness } from "@/lib/launch-readiness";
import { applicationLaunchComposerSchema } from "@/lib/validation";
import { readJsonBody } from "@/lib/json-body";

const MAX_BODY_BYTES = 256 * 1024;

function includeApplicationLaunchContext() {
  return {
    media: {
      select: {
        id: true,
        featured: true,
      },
    },
    versions: {
      include: {
        assets: {
          select: {
            id: true,
            visibility: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc" as const,
      },
    },
  };
}

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const { id } = await props.params;
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
  const parsed = applicationLaunchComposerSchema.safeParse(body.data);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }

  const result = await db.$transaction(async (tx) => {
    const app = await tx.application.findUnique({
      where: { id },
      include: includeApplicationLaunchContext(),
    });

    if (!app) {
      return { error: "not_found" as const };
    }

    const existingVersion = await tx.applicationVersion.findUnique({
      where: {
        applicationId_version: {
          applicationId: id,
          version: parsed.data.version,
        },
      },
      select: { id: true },
    });

    if (existingVersion) {
      return { error: "version_exists" as const };
    }

    const version = await tx.applicationVersion.create({
      data: {
        applicationId: id,
        version: parsed.data.version,
        changelog: parsed.data.changelog,
      },
    });

    const asset = await tx.releaseAsset.create({
      data: {
        versionId: version.id,
        fileName: parsed.data.fileName,
        fileUrl: parsed.data.fileUrl,
        checksum: parsed.data.checksum,
        s3Bucket: parsed.data.s3Bucket,
        s3Key: parsed.data.s3Key,
        visibility: parsed.data.visibility,
      },
    });

    let updated = await tx.application.findUnique({
      where: { id },
      include: includeApplicationLaunchContext(),
    });

    if (!updated) {
      return { error: "not_found" as const };
    }

    let readiness = evaluateApplicationLaunchReadiness(updated);
    let published = false;

    if (parsed.data.publishAfterCreate && readiness.ready && updated.visibility !== "PUBLIC") {
      updated = await tx.application.update({
        where: { id },
        data: { visibility: "PUBLIC" },
        include: includeApplicationLaunchContext(),
      });
      readiness = evaluateApplicationLaunchReadiness(updated);
      published = true;
    }

    await tx.auditLog.createMany({
      data: [
        {
          actorUserId: context.userId,
          action: "version.create",
          targetType: "application_version",
          targetId: version.id,
          metadata: JSON.stringify({
            applicationId: id,
            version: version.version,
            source: "launch_compose",
          }),
        },
        {
          actorUserId: context.userId,
          action: "release_asset.create",
          targetType: "release_asset",
          targetId: asset.id,
          metadata: JSON.stringify({
            applicationId: id,
            versionId: version.id,
            visibility: asset.visibility,
            source: "launch_compose",
          }),
        },
        {
          actorUserId: context.userId,
          action: "application.launch_compose",
          targetType: "application",
          targetId: id,
          metadata: JSON.stringify({
            versionId: version.id,
            assetId: asset.id,
            publishAfterCreate: parsed.data.publishAfterCreate,
            published,
          }),
        },
        ...(published
          ? [
              {
                actorUserId: context.userId,
                action: "application.publish",
                targetType: "application",
                targetId: id,
                metadata: JSON.stringify({
                  slug: updated.slug,
                  blockers: readiness.blockers.length,
                  warnings: readiness.warnings.length,
                  source: "launch_compose",
                }),
              },
            ]
          : []),
      ],
    });

    return {
      app: updated,
      version,
      asset,
      readiness,
      published,
    };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "version_exists" ? 409 : 404 });
  }

  return NextResponse.json({
    item: result.app,
    version: result.version,
    asset: result.asset,
    launchReadiness: result.readiness,
    published: result.published,
  });
}
