import { archiveCatalog, type ArchiveEntryRecord } from "@/lib/archive-catalog";
import { db } from "@/lib/db";
import type { ArchiveCategoryRecord } from "@/lib/archive-taxonomy";
import { getArchiveCategoryLabel } from "@/lib/archive-taxonomy";

function mapVisibility(value: string): ArchiveEntryRecord["visibility"] {
  if (value === "PUBLIC") return "public";
  if (value === "PRIVATE") return "private";
  return "draft";
}

function splitStoredList(value?: string | null): string[] {
  if (!value) return [];
  return Array.from(
    new Set(
      value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function mapRow(row: {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: ArchiveCategoryRecord;
  visibility: string;
  featured: boolean;
  stageLabel: string | null;
  artifactFormat: string | null;
  previewImageUrl: string | null;
  previewThumbnailUrl: string | null;
  details: string | null;
  tags: string | null;
  stackItems: string | null;
  artifactUrl: string | null;
  artifactLabel: string | null;
  createdAt: Date;
}): ArchiveEntryRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    category: row.category,
    categoryLabel: getArchiveCategoryLabel(row.category),
    visibility: mapVisibility(row.visibility),
    featured: row.featured,
    stageLabel: row.stageLabel ?? undefined,
    artifactFormat: row.artifactFormat ?? undefined,
    previewImageUrl: row.previewImageUrl ?? undefined,
    previewThumbnailUrl: row.previewThumbnailUrl ?? undefined,
    details: row.details ?? undefined,
    tags: splitStoredList(row.tags),
    stackItems: splitStoredList(row.stackItems),
    artifactUrl: row.artifactUrl ?? undefined,
    artifactLabel: row.artifactLabel ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getPublicArchiveEntries(): Promise<ArchiveEntryRecord[]> {
  try {
    const rows = await db.archiveEntry.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    if (rows.length > 0) return rows.map(mapRow);
  } catch {
    // DB unavailable or misconfigured; use static archive catalog
  }

  return archiveCatalog;
}

export async function getPublicArchiveEntryBySlug(slug: string): Promise<ArchiveEntryRecord | null> {
  try {
    const row = await db.archiveEntry.findFirst({
      where: { slug, visibility: "PUBLIC" },
    });
    if (row) return mapRow(row);
  } catch {
    // fall through
  }

  return archiveCatalog.find((entry) => entry.slug === slug) ?? null;
}
