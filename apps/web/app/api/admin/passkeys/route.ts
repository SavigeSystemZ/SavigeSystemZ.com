import { NextResponse } from "next/server";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;
  if (!context.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const items = await db.passkeyCredential.findMany({
    where: { userId: context.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      credentialId: true,
      counter: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ items });
}
