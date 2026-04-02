import { NextResponse } from "next/server";

import { getRequestClientIp } from "@/lib/client-ip";
import { rateLimit } from "@/lib/rate-limit";
import {
  isVaultRedisRateLimitConfigured,
  isVaultRedisStrict,
  slidingWindowAllowRedis,
} from "@/lib/vault-rate-limit-redis";

const WINDOW_MS = 60_000;
const MAX_VAULT_MUTATIONS_PER_IP = 45;

export type VaultRateLimitBackend = "redis" | "memory";

export function vaultRateLimitBackend(): VaultRateLimitBackend {
  return isVaultRedisRateLimitConfigured() ? "redis" : "memory";
}

/**
 * Returns a **429** or **503** response when the request must be blocked; otherwise `null`.
 * Uses Redis (sliding window) when `REDIS_URL` is set; otherwise in-memory.
 */
export async function vaultMutationGate(request: Request): Promise<NextResponse | null> {
  const ip = getRequestClientIp(request);
  const key = `vault:mut:${ip}`;

  if (isVaultRedisRateLimitConfigured()) {
    try {
      const ok = await slidingWindowAllowRedis(key, MAX_VAULT_MUTATIONS_PER_IP, WINDOW_MS);
      if (!ok) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      }
      return null;
    } catch (e) {
      if (isVaultRedisStrict()) {
        console.error("[vault-rate-limit] redis required (strict) but failed", e);
        return NextResponse.json(
          { error: "rate_limit_backend_unavailable" },
          { status: 503 },
        );
      }
      console.error("[vault-rate-limit] redis error; falling back to in-memory", e);
    }
  }

  if (!rateLimit(key, MAX_VAULT_MUTATIONS_PER_IP, WINDOW_MS)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  return null;
}
