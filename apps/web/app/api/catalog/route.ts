import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Public read-only list of catalog applications (PUBLIC visibility).
 * Used by storefront integrations and E2E to resolve `applicationId` without admin auth.
 */
export async function GET() {
  const items = await db.application.findMany({
    where: { visibility: "PUBLIC" },
    select: {
      id: true,
      slug: true,
      name: true,
      summary: true,
      featured: true,
    },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  return NextResponse.json(
    { items },
    {
      headers: {
        "cache-control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    },
  );
}
