import { sanitizePromptInput } from "@savige/ai";
import { NextResponse } from "next/server";
import { getPublicArchiveEntries } from "@/lib/archive-resolver";
import { getPublicCatalogWithReleases } from "@/lib/catalog-resolver";
import { buildConciergeReply } from "@/lib/concierge";
import { rateLimit } from "@/lib/rate-limit";
import { getRequestClientIp } from "@/lib/client-ip";
import { getAuthContext } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const context = await getAuthContext();
  const ip = getRequestClientIp(request);
  const rateLimitKey = context.userId ? `ai-chat:user:${context.userId}` : `ai-chat:ip:${ip}`;
  
  if (!rateLimit(rateLimitKey, 10, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await request.json()) as { message?: string };
  const message = sanitizePromptInput(body.message ?? "");

  const [applications, archiveEntries] = await Promise.all([
    getPublicCatalogWithReleases(),
    getPublicArchiveEntries(),
  ]);

  if (context.userId) {
    await writeAuditLog({
      actorUserId: context.userId,
      action: "ai.chat",
      targetType: "system",
      targetId: "concierge",
      metadata: { promptLength: message.length },
    });
  }

  return NextResponse.json(buildConciergeReply(message, { applications, archiveEntries }));
}
