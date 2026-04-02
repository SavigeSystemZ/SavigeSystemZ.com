import type { Prisma, ProjectRequestStatus } from "@prisma/client";

const STATUS_SET = new Set<ProjectRequestStatus>(["PENDING", "REVIEWING", "CLOSED"]);

export function parseProjectRequestsListParams(
  searchParams: URLSearchParams,
  opts?: { defaultLimit?: number; maxLimit?: number },
): {
  limit: number;
  status: ProjectRequestStatus | undefined;
  includeDeleted: boolean;
} {
  const defaultLimit = opts?.defaultLimit ?? 50;
  const maxLimit = opts?.maxLimit ?? 100;
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") ?? String(defaultLimit)), 1),
    maxLimit,
  );
  const statusParam = searchParams.get("status");
  const status =
    statusParam && STATUS_SET.has(statusParam as ProjectRequestStatus)
      ? (statusParam as ProjectRequestStatus)
      : undefined;
  const includeDeleted = searchParams.get("includeDeleted") === "1";
  return { limit, status, includeDeleted };
}

export function projectRequestsWhere(
  status: ProjectRequestStatus | undefined,
  includeDeleted: boolean,
): Prisma.ProjectRequestWhereInput {
  return {
    ...(status ? { status } : {}),
    ...(!includeDeleted ? { deletedAt: null } : {}),
  };
}
