import Redis from "ioredis";

/**
 * Atomic sliding-window counter: drop entries older than `windowMs`, allow if count < max.
 */
const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local max = tonumber(ARGV[3])
local member = ARGV[4]
local cutoff = now - window
redis.call('ZREMRANGEBYSCORE', key, '-inf', cutoff)
local c = redis.call('ZCARD', key)
if tonumber(c) >= tonumber(max) then return 0 end
redis.call('ZADD', key, now, member)
redis.call('EXPIRE', key, math.ceil(window / 1000) + 2)
return 1
`;

type GlobalRedis = typeof globalThis & {
  __sszVaultRateLimitRedis?: Redis;
};

function getRedisUrl(): string | null {
  const url = process.env.REDIS_URL?.trim();
  return url || null;
}

export function isVaultRedisRateLimitConfigured(): boolean {
  return Boolean(getRedisUrl());
}

/**
 * When `REDIS_URL` is set and this is true, Redis failures return **503** instead of
 * falling back to in-memory limits (`VAULT_REDIS_STRICT=1|true|yes`).
 */
export function isVaultRedisStrict(): boolean {
  const v = process.env.VAULT_REDIS_STRICT?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function getVaultRateLimitRedis(): Redis | null {
  const url = getRedisUrl();
  if (!url) return null;
  const g = globalThis as GlobalRedis;
  if (!g.__sszVaultRateLimitRedis) {
    g.__sszVaultRateLimitRedis = new Redis(url, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
  }
  return g.__sszVaultRateLimitRedis;
}

/**
 * @param logicalKey - e.g. `vault:mut:1.2.3.4` (caller prefixes scope)
 */
export async function slidingWindowAllowRedis(
  logicalKey: string,
  max: number,
  windowMs: number,
): Promise<boolean> {
  const redis = getVaultRateLimitRedis();
  if (!redis) {
    throw new Error("REDIS_URL not configured");
  }
  const key = `ssz:rl:${logicalKey}`;
  const now = Date.now();
  const member = `${now}:${Math.random().toString(36).slice(2, 12)}`;
  const res = await redis.eval(
    SLIDING_WINDOW_LUA,
    1,
    key,
    String(now),
    String(windowMs),
    String(max),
    member,
  );
  return res === 1;
}

export async function pingVaultRateLimitRedis(): Promise<"ok" | "miss" | "error"> {
  if (!getRedisUrl()) return "miss";
  try {
    const redis = getVaultRateLimitRedis();
    if (!redis) return "miss";
    const pong = await redis.ping();
    return pong === "PONG" ? "ok" : "error";
  } catch {
    return "error";
  }
}
