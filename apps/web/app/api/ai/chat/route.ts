import { sanitizePromptInput } from "@savige/ai";
import { NextResponse } from "next/server";
import { getPublicArchiveEntries } from "@/lib/archive-resolver";
import { getPublicCatalogWithReleases } from "@/lib/catalog-resolver";
import { buildConciergeReply } from "@/lib/concierge";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit("ai-chat")) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const body = (await request.json()) as { message?: string };
  const message = sanitizePromptInput(body.message ?? "");
  const [applications, archiveEntries] = await Promise.all([
    getPublicCatalogWithReleases(),
    getPublicArchiveEntries(),
  ]);
  return NextResponse.json(buildConciergeReply(message, { applications, archiveEntries }));
}
