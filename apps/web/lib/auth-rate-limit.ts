import { getRequestClientIp } from "@/lib/client-ip";
import { rateLimit } from "@/lib/rate-limit";
import { isRedisRateLimitConfigured, slidingWindowAllowRedis, isRedisStrict } from "@/lib/redis-rate-limit";

/**
 * Per-IP sliding window limit for authentication-related routes.
 * Uses Redis if configured; falls back to in-memory otherwise.
 */
export async function allowAuthRequest(
  request: Request,
  routeKey: string,
  maxRequests: number,
  windowMs: number = 60_000,
): Promise<boolean> {
  const ip = getRequestClientIp(request);
  const logicalKey = `auth:${routeKey}:${ip}`;

  if (isRedisRateLimitConfigured()) {
    try {
      return await slidingWindowAllowRedis(logicalKey, maxRequests, windowMs);
    } catch (e) {
      if (isRedisStrict()) {
        console.error("[auth-rate-limit] redis strict mode blocked request due to error:", e);
        return false;
      }
      console.error("[auth-rate-limit] redis error; falling back to in-memory:", e);
    }
  }

  return rateLimit(logicalKey, maxRequests, windowMs);
}
