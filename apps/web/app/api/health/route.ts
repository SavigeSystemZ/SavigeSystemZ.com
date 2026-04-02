import { NextResponse } from "next/server";

import {
  isVaultRedisStrict,
  pingVaultRateLimitRedis,
} from "@/lib/vault-rate-limit-redis";
import { vaultRateLimitBackend } from "@/lib/vault-rate-limit";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const probeRedis = url.searchParams.get("probe") === "redis";

  const body: Record<string, unknown> = {
    ok: true,
    service: "savigesystemz-web",
    time: new Date().toISOString(),
    vaultMutationRateLimit: vaultRateLimitBackend(),
    vaultRedisStrict: isVaultRedisStrict(),
  };

  if (probeRedis) {
    body.vaultMutationRedis = await pingVaultRateLimitRedis();
  }

  return NextResponse.json(body);
}
