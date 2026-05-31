import { NextResponse } from "next/server";

import { getRequestClientIp } from "@/lib/client-ip";
import { rateLimit } from "@/lib/rate-limit";
import {
  isRedisRateLimitConfigured,
  isRedisStrict,
  slidingWindowAllowRedis,
} from "@/lib/redis-rate-limit";

const WINDOW_MS = 60_000;
const MAX_VAULT_MUTATIONS_PER_USER = 45;
const MAX_VAULT_MUTATIONS_PER_IP = 45;

export type VaultRateLimitBackend = "redis" | "memory";

export function vaultRateLimitBackend(): VaultRateLimitBackend {
  return isRedisRateLimitConfigured() ? "redis" : "memory";
}

/**
 * Returns a **429** or **503** response when the request must be blocked; otherwise `null`.
 *
 * Keying strategy:
 *   - When `userId` is supplied (authed mutation), key on the user — shared
 *     networks (corporate WiFi, NAT, CI) no longer block other users when one
 *     user goes hot.
 *   - Anonymous callers fall back to IP, with a higher cap to absorb shared
 *     egress; signature verification still gates the actual mutation.
 *
 * Uses Redis (sliding window) when `REDIS_URL` is set; otherwise in-memory.
 */
export async function vaultMutationGate(
  request: Request,
  userId?: string | null,
): Promise<NextResponse | null> {
  const scope = userId ? { kind: "user" as const, id: userId, max: MAX_VAULT_MUTATIONS_PER_USER }
    : { kind: "ip" as const, id: getRequestClientIp(request), max: MAX_VAULT_MUTATIONS_PER_IP };
  const key = `vault:mut:${scope.kind}:${scope.id}`;

  if (isRedisRateLimitConfigured()) {
    try {
      const ok = await slidingWindowAllowRedis(key, scope.max, WINDOW_MS);
      if (!ok) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      }
      return null;
    } catch (e) {
      if (isRedisStrict()) {
        console.error("[vault-rate-limit] redis required (strict) but failed", e);
        return NextResponse.json(
          { error: "rate_limit_backend_unavailable" },
          { status: 503 },
        );
      }
      console.error("[vault-rate-limit] redis error; falling back to in-memory", e);
    }
  }

  if (!rateLimit(key, scope.max, WINDOW_MS)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  return null;
}
