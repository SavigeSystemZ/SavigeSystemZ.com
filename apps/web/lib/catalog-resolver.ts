import type { ApplicationRecord } from "@savige/domain";
import { appCatalog } from "@/lib/catalog";
import { db } from "@/lib/db";

function mapVisibility(v: string): ApplicationRecord["visibility"] {
  if (v === "PUBLIC") return "public";
  if (v === "PRIVATE") return "private";
  return "draft";
}

function mapRow(row: {
  id: string;
  slug: string;
  name: string;
  summary: string;
  visibility: string;
  featured: boolean;
}): ApplicationRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    visibility: mapVisibility(row.visibility),
    featured: row.featured,
  };
}

/**
 * Public catalog: prefers database rows (`visibility = PUBLIC`), falls back to static `appCatalog` if empty or on error.
 */
export async function getPublicCatalog(): Promise<ApplicationRecord[]> {
  try {
    const rows = await db.application.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });
    if (rows.length > 0) {
      return rows.map(mapRow);
    }
  } catch {
    // DB unavailable or misconfigured — demo static catalog
  }
  return appCatalog;
}

/**
 * Single application by slug: DB first (PUBLIC only for anonymous catalog), then static catalog.
 */
export async function getPublicApplicationBySlug(slug: string): Promise<ApplicationRecord | null> {
  try {
    const row = await db.application.findFirst({
      where: { slug, visibility: "PUBLIC" },
    });
    if (row) return mapRow(row);
  } catch {
    // fall through
  }
  return appCatalog.find((a) => a.slug === slug) ?? null;
}
