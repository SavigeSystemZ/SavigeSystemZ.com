import { sanitizePromptInput } from "@savige/ai";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit("ai-chat")) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const body = (await request.json()) as { message?: string };
  const message = sanitizePromptInput(body.message ?? "");
  return NextResponse.json({
    answer: `Concierge placeholder response for: ${message}`,
    grounded: true,
  });
}
