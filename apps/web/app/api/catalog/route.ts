import { NextResponse } from "next/server";
import { getPublicCatalogWithReleases } from "@/lib/catalog-resolver";

/**
 * Public read-only list of catalog applications (PUBLIC visibility) with
 * release and media context for richer storefront rendering.
 */
export async function GET() {
  const items = await getPublicCatalogWithReleases();

  return NextResponse.json(
    { items },
    {
      headers: {
        "cache-control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    },
  );
}
