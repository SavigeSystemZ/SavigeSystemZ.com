import { NextResponse } from "next/server";
import { parseProjectRequestsListParams, projectRequestsWhere } from "@/lib/admin-project-requests";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(request.url);
  const { limit, status, includeDeleted } = parseProjectRequestsListParams(searchParams);

  const items = await db.projectRequest.findMany({
    where: projectRequestsWhere(status, includeDeleted),
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ items });
}
