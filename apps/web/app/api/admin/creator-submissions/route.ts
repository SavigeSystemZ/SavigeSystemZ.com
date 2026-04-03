import type { CreatorSubmissionStatus, CreatorSubmissionType } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";

const validStatuses = new Set(["PENDING", "REVIEWING", "APPROVED", "HOLD", "REJECTED"]);
const validTypes = new Set([
  "APPLICATION",
  "ARCHIVE_ENTRY",
  "CONFIG_PACK",
  "CONTAINER_STACK",
  "MODEL",
  "RESEARCH",
  "SECURITY_TOOL",
  "AUTOMATION",
]);

export async function GET(request: Request) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const includeArchived = searchParams.get("includeArchived") === "1";
  const statusFilter =
    status && validStatuses.has(status) ? (status as CreatorSubmissionStatus) : undefined;
  const typeFilter = type && validTypes.has(type) ? (type as CreatorSubmissionType) : undefined;

  const where = {
    ...(includeArchived ? {} : { deletedAt: null }),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(typeFilter ? { type: typeFilter } : {}),
  };

  const [items, pending, reviewing, approved, hold, rejected, total, promoted] = await Promise.all([
    db.creatorSubmission.findMany({
      where,
      orderBy: [{ deletedAt: "asc" }, { createdAt: "desc" }],
    }),
    db.creatorSubmission.count({ where: { deletedAt: null, status: "PENDING" } }),
    db.creatorSubmission.count({ where: { deletedAt: null, status: "REVIEWING" } }),
    db.creatorSubmission.count({ where: { deletedAt: null, status: "APPROVED" } }),
    db.creatorSubmission.count({ where: { deletedAt: null, status: "HOLD" } }),
    db.creatorSubmission.count({ where: { deletedAt: null, status: "REJECTED" } }),
    db.creatorSubmission.count({ where: { deletedAt: null } }),
    db.creatorSubmission.count({ where: { deletedAt: null, promotedTargetId: { not: null } } }),
  ]);

  return NextResponse.json({
    items,
    counts: {
      total,
      pending,
      reviewing,
      approved,
      hold,
      rejected,
      promoted,
    },
  });
}
