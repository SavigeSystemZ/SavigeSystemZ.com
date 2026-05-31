import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vaultRateLimitBackend } from "@/lib/vault-rate-limit";
import { isRedisStrict, pingRateLimitRedis } from "@/lib/redis-rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const probe = url.searchParams.get("probe");

  let dbStatus = "unknown";
  let redisStatus = "unknown";

  if (probe === "db" || probe === "all") {
    try {
      await db.$queryRaw`SELECT 1`;
      dbStatus = "ok";
    } catch {
      dbStatus = "error";
    }
  }

  if (probe === "redis" || probe === "all") {
    redisStatus = await pingRateLimitRedis();
  }

  const body: Record<string, unknown> = {
    ok: true,
    service: "savigesystemz-web",
    time: new Date().toISOString(),
    vaultMutationRateLimit: vaultRateLimitBackend(),
    vaultRedisStrict: isRedisStrict(),
    ...(probe === "db" || probe === "all" ? { db: dbStatus } : {}),
    ...(probe === "redis" || probe === "all" ? { redis: redisStatus } : {}),
  };

  return NextResponse.json(body);
}
