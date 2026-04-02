import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";

export async function GET() {
  const context = await getAuthContext();
  return NextResponse.json({ auth: context });
}
