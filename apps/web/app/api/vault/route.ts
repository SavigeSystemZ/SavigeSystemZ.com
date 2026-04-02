import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, items: [], note: "owner-only vault placeholder" });
}
