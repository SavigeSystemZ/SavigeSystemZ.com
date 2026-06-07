import type { PublicApplicationMediaRecord } from "@/lib/catalog-resolver";

export type CatalogMediaKind = "screenshot" | "showcase" | "other";

export function catalogMediaKind(item: PublicApplicationMediaRecord): CatalogMediaKind {
  const haystack = `${item.title} ${item.mediaUrl}`.toLowerCase();
  if (
    haystack.includes("repository preview") ||
    haystack.includes("/screenshots/") ||
    haystack.includes("/ui-catalog/") ||
    haystack.includes("/manual/")
  ) {
    return "screenshot";
  }
  if (haystack.includes("showcase") || haystack.includes("/showcase/generated/") || haystack.endsWith(".svg")) {
    return "showcase";
  }
  return "other";
}

export function catalogMediaKindLabel(kind: CatalogMediaKind): string {
  if (kind === "screenshot") return "Repository snapshot";
  if (kind === "showcase") return "Foundry showcase art";
  return "Gallery media";
}

/** Screenshots first so catalog cards and galleries lead with real repo visuals. */
export function sortCatalogMediaForDisplay(
  items: PublicApplicationMediaRecord[],
): PublicApplicationMediaRecord[] {
  return [...items].sort((a, b) => {
    const kindRank = (item: PublicApplicationMediaRecord) => {
      const kind = catalogMediaKind(item);
      if (kind === "screenshot") return 0;
      if (kind === "showcase") return 1;
      return 2;
    };
    const rankDiff = kindRank(a) - kindRank(b);
    if (rankDiff !== 0) return rankDiff;
    return a.sortOrder - b.sortOrder;
  });
}

export function pickCatalogPreviewMedia(
  items: PublicApplicationMediaRecord[] | undefined,
): PublicApplicationMediaRecord | null {
  if (!items?.length) return null;
  const sorted = sortCatalogMediaForDisplay(items);
  return sorted.find((item) => catalogMediaKind(item) === "screenshot") ?? sorted[0] ?? null;
}
