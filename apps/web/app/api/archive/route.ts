import { NextResponse } from "next/server";
import { getPublicArchiveEntries } from "@/lib/archive-resolver";

export async function GET() {
  const items = await getPublicArchiveEntries();

  return NextResponse.json(
    { items },
    {
      headers: {
        "cache-control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    },
  );
}
