import { sanitizePromptInput } from "@savige/ai";
import { NextResponse } from "next/server";
import { getAdminDashboardSummary } from "@/lib/admin-dashboard";
import { buildOperatorReply } from "@/lib/operator";
import { rateLimit } from "@/lib/rate-limit";
import { getRequestClientIp } from "@/lib/client-ip";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const context = await getAuthContext();
  const authErr = requireOwner(context);
  if (authErr) return authErr;
  
  const ip = getRequestClientIp(request);
  const rateLimitKey = `owner-ai-chat:${context.userId!}:${ip}`;
  
  if (!rateLimit(rateLimitKey, 20, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await request.json()) as { message?: string };
  const message = sanitizePromptInput(body.message ?? "");

  const dashboard = await getAdminDashboardSummary("24h");

  await writeAuditLog({
    actorUserId: context.userId!,
    action: "ai.operator.chat",
    targetType: "system",
    targetId: "operator",
    metadata: { promptLength: message.length, topic: message.substring(0, 30) },
  });

  return NextResponse.json(buildOperatorReply(message, dashboard));
}
