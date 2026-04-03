import type {
  ApplicationVisibility,
  ArchiveCategory,
  CreatorPromotionTarget,
  CreatorSubmission,
  CreatorSubmissionType,
  Prisma,
} from "@prisma/client";
import { createArchiveEntrySchema, createApplicationSchema } from "@/lib/validation";

const archiveCategoryBySubmissionType: Record<Exclude<CreatorSubmissionType, "APPLICATION">, ArchiveCategory> = {
  ARCHIVE_ENTRY: "RESEARCH",
  CONFIG_PACK: "CONFIGURATION",
  CONTAINER_STACK: "CONTAINER_STACK",
  MODEL: "MODEL",
  RESEARCH: "RESEARCH",
  SECURITY_TOOL: "SECURITY_TOOL",
  AUTOMATION: "AUTOMATION",
};

export function getPromotionTargetForSubmissionType(
  type: CreatorSubmissionType,
): CreatorPromotionTarget {
  return type === "APPLICATION" ? "APPLICATION" : "ARCHIVE_ENTRY";
}

export function getArchiveCategoryForSubmissionType(
  type: Exclude<CreatorSubmissionType, "APPLICATION">,
): ArchiveCategory {
  return archiveCategoryBySubmissionType[type];
}

export function slugifyPromotionTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "submission-draft";
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function buildPromotionNotes(submission: CreatorSubmission, maxLength: number): string {
  const lines = [
    submission.details.trim(),
    "",
    "Promotion provenance",
    `Submission ID: ${submission.id}`,
    `Submission type: ${submission.type}`,
    `Requested visibility: ${submission.plannedVisibility}`,
    submission.contactEmail ? `Creator contact: ${submission.contactEmail}` : null,
    submission.repoUrl ? `Repository: ${submission.repoUrl}` : null,
    submission.artifactUrl ? `Artifact: ${submission.artifactUrl}` : null,
    submission.ownerNotes ? `Owner notes: ${submission.ownerNotes}` : null,
  ].filter(Boolean);

  return truncate(lines.join("\n"), maxLength);
}

async function ensureUniqueSlug(
  tx: Prisma.TransactionClient,
  target: CreatorPromotionTarget,
  baseSlug: string,
): Promise<string> {
  const normalized = slugifyPromotionTitle(baseSlug);
  let candidate = normalized;
  let suffix = 2;

  while (true) {
    const existing =
      target === "APPLICATION"
        ? await tx.application.findUnique({ where: { slug: candidate }, select: { id: true } })
        : await tx.archiveEntry.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing) return candidate;
    candidate = `${normalized}-${suffix}`;
    suffix += 1;
  }
}

export async function promoteCreatorSubmissionToDraft(
  tx: Prisma.TransactionClient,
  submission: CreatorSubmission,
  actorUserId: string,
): Promise<{
  targetType: CreatorPromotionTarget;
  targetId: string;
  targetSlug: string;
}> {
  const targetType = getPromotionTargetForSubmissionType(submission.type);

  if (submission.promotedTargetType && submission.promotedTargetId && submission.promotedTargetSlug) {
    return {
      targetType: submission.promotedTargetType,
      targetId: submission.promotedTargetId,
      targetSlug: submission.promotedTargetSlug,
    };
  }

  const targetSlug = await ensureUniqueSlug(tx, targetType, submission.title);
  const releaseChannel =
    submission.plannedVisibility === "PRIVATE" ? "Controlled access draft" : "Creator submission draft";
  const priceLabel =
    submission.plannedVisibility === "PRIVATE" ? "Private rollout draft" : "Draft launch packaging";

  if (targetType === "APPLICATION") {
    const details = buildPromotionNotes(submission, 2000);
    const payload = createApplicationSchema.parse({
      slug: targetSlug,
      name: submission.title,
      summary: submission.summary,
      label: "Creator draft",
      tagline: truncate(submission.summary, 180),
      priceLabel,
      releaseChannel,
      details,
      visibility: "DRAFT" satisfies ApplicationVisibility,
      featured: false,
    });

    const created = await tx.application.create({ data: payload });
    await tx.auditLog.create({
      data: {
        actorUserId,
        action: "application.create",
        targetType: "application",
        targetId: created.id,
        metadata: JSON.stringify({
          slug: created.slug,
          sourceSubmissionId: submission.id,
        }),
      },
    });

    await tx.creatorSubmission.update({
      where: { id: submission.id },
      data: {
        status: "APPROVED",
        promotedTargetType: "APPLICATION",
        promotedTargetId: created.id,
        promotedTargetSlug: created.slug,
        promotedAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId,
        action: "creator_submission.promote",
        targetType: "creator_submission",
        targetId: submission.id,
        metadata: JSON.stringify({
          targetType: "APPLICATION",
          targetId: created.id,
          targetSlug: created.slug,
        }),
      },
    });

    return {
      targetType: "APPLICATION",
      targetId: created.id,
      targetSlug: created.slug,
    };
  }

  const details = buildPromotionNotes(submission, 4000);
  const payload = createArchiveEntrySchema.parse({
    slug: targetSlug,
    title: submission.title,
    summary: submission.summary,
    category: getArchiveCategoryForSubmissionType(submission.type as Exclude<CreatorSubmissionType, "APPLICATION">),
    visibility: "DRAFT" satisfies ApplicationVisibility,
    featured: false,
    stageLabel: "Creator submission draft",
    artifactFormat: submission.type.replace(/_/g, " ").toLowerCase(),
    details,
    tags: ["Creator submission", submission.type.replace(/_/g, " "), submission.plannedVisibility].join("\n"),
    stackItems: submission.repoUrl ? [submission.repoUrl].join("\n") : undefined,
    artifactUrl: submission.artifactUrl ?? submission.repoUrl ?? undefined,
    artifactLabel: submission.artifactUrl ? "Submitted artifact" : submission.repoUrl ? "Repository" : undefined,
  });

  const created = await tx.archiveEntry.create({ data: payload });
  await tx.auditLog.create({
    data: {
      actorUserId,
      action: "archive_entry.create",
      targetType: "archive_entry",
      targetId: created.id,
      metadata: JSON.stringify({
        slug: created.slug,
        category: created.category,
        sourceSubmissionId: submission.id,
      }),
    },
  });

  await tx.creatorSubmission.update({
    where: { id: submission.id },
    data: {
      status: "APPROVED",
      promotedTargetType: "ARCHIVE_ENTRY",
      promotedTargetId: created.id,
      promotedTargetSlug: created.slug,
      promotedAt: new Date(),
    },
  });

  await tx.auditLog.create({
    data: {
      actorUserId,
      action: "creator_submission.promote",
      targetType: "creator_submission",
      targetId: submission.id,
      metadata: JSON.stringify({
        targetType: "ARCHIVE_ENTRY",
        targetId: created.id,
        targetSlug: created.slug,
      }),
    },
  });

  return {
    targetType: "ARCHIVE_ENTRY",
    targetId: created.id,
    targetSlug: created.slug,
  };
}
