# API rate limits (vault)

## Endpoints

- **`POST /api/vault`** — 45 accepted mutations per client IP per **sliding** 60s window
- **`POST /api/vault/s3-upload-url`** — same cap (shared counter namespace per IP)

When exceeded, the API returns **429** with body `{ "error": "rate_limited" }`.

## Backends

### In-memory (default)

If **`REDIS_URL`** is unset, limits use `lib/rate-limit.ts` (per-process `Map`). Counts reset on deploy or process restart.

### Redis (multi-instance)

Set **`REDIS_URL`** (e.g. `redis://127.0.0.1:6379` or **`rediss://`** for TLS) so every app instance shares state.

Implementation: `lib/vault-rate-limit-redis.ts` uses a **sorted-set sliding window** with a single **Lua** script so increment + trim + cap is **atomic**. Keys are prefixed with **`ssz:rl:`** (e.g. `ssz:rl:vault:mut:203.0.113.1`).

Local Redis: `docker compose -f docker-compose.redis.yml up -d`.

### Strict mode (production Redis)

Set **`VAULT_REDIS_STRICT=1`** (or `true` / `yes`) together with **`REDIS_URL`**. If Redis errors, vault mutation routes return **503** with `{ "error": "rate_limit_backend_unavailable" }` instead of falling back to in-memory limits.

Use this when every instance must share one authoritative limiter and silent fallback is unacceptable.

### Degraded mode (default)

If **`REDIS_URL`** is set but **`VAULT_REDIS_STRICT`** is off, Redis failures **log** and the app **falls back to in-memory** for that request. Monitor **`GET /api/health?probe=redis`** (`vaultMutationRedis: "error"`).

## Observability

- **`GET /api/health`** includes `vaultMutationRateLimit`: `"memory"` | `"redis"` and **`vaultRedisStrict`**: boolean.
- **`GET /api/health?probe=redis`** adds `vaultMutationRedis`: `"ok"` | `"miss"` | `"error"` (ping when Redis is configured).

## Testing

Unit tests cover in-memory exhaustion, Redis delegation (mocked), and Redis failure fallback (`tests/unit/vault-rate-limit.test.ts`). Load tests against vault POST remain the practical integration check.

## Future

Optional separate caps for vault POST vs S3 URL, or owner-based quotas, would need new keys and policy review.
