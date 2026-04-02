import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const logLevels: ("error" | "warn")[] | ("error" | "warn" | "query")[] =
  process.env.NODE_ENV === "development" && process.env.PRISMA_LOG_QUERIES === "1"
    ? ["query", "error", "warn"]
    : ["error", "warn"];

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logLevels,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
