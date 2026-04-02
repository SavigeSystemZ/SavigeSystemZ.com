import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST() {
  if (!rateLimit("comments")) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  return NextResponse.json({ ok: true, status: "queued_for_moderation" });
}
