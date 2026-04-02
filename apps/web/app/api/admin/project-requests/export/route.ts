import { NextResponse } from "next/server";
import { parseProjectRequestsListParams, projectRequestsWhere } from "@/lib/admin-project-requests";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { toCsvRow } from "@/lib/csv";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(request.url);
  const { limit, status, includeDeleted } = parseProjectRequestsListParams(searchParams, {
    defaultLimit: 500,
    maxLimit: 500,
  });

  const items = await db.projectRequest.findMany({
    where: projectRequestsWhere(status, includeDeleted),
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const header = toCsvRow([
    "id",
    "title",
    "description",
    "contactEmail",
    "status",
    "sourceIp",
    "deletedAt",
    "createdAt",
    "updatedAt",
  ]);

  const lines = items.map((row) =>
    toCsvRow([
      row.id,
      row.title,
      row.description,
      row.contactEmail ?? "",
      row.status,
      row.sourceIp ?? "",
      row.deletedAt ? row.deletedAt.toISOString() : "",
      row.createdAt.toISOString(),
      row.updatedAt.toISOString(),
    ]),
  );

  const csv = [header, ...lines].join("");
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="project-requests-${stamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}
