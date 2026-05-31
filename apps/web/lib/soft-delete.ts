export function isArchived(row: { deletedAt?: Date | string | null }): boolean {
  return Boolean(row.deletedAt);
}

export function isNotArchived<T extends { deletedAt?: Date | string | null }>(row: T): boolean {
  return !row.deletedAt;
}

export function excludeArchived<T extends { deletedAt?: Date | string | null }>(rows: T[]): T[] {
  return rows.filter(isNotArchived);
}

export function includeArchivedIf<T extends { deletedAt?: Date | string | null }>(
  rows: T[],
  include: boolean,
): T[] {
  if (include) return rows;
  return rows.filter(isNotArchived);
}
