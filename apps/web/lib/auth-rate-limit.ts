import { getRequestClientIp } from "@/lib/client-ip";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Per-IP sliding window limit for authentication-related routes.
 * In-memory only: for multi-instance production, replace with Redis/edge limiter.
 */
export function allowAuthRequest(
  request: Request,
  routeKey: string,
  maxRequests: number,
  windowMs: number = 60_000,
): boolean {
  const ip = getRequestClientIp(request);
  return rateLimit(`auth:${routeKey}:${ip}`, maxRequests, windowMs);
}
