# Web security posture (SavigeSystemZ `apps/web`)

This document records **what is enforced in code** versus **what operators must configure**. It is not a formal audit certificate.

## Critical fixes (implemented)

1. **Removed spoofable `x-user-id` / `x-user-role` trust**  
   API authorization used to read these from incoming request headers. Any client could send `x-user-role: owner` and bypass checks. **Auth is now only** the signed session cookie validated against the database (`Session` rows).

2. **Owner APIs require both `role === owner` and a non-null `userId`**  
   Prevents inconsistent auth contexts from being treated as privileged.

3. **Next.js `proxy.ts` (edge / proxy layer)**  
   Security headers and `/admin` HTML route protection run in the **Proxy** (`export async function proxy`) before pages render. Next.js 16 renamed this from `middleware.ts`; the implementation uses **Web Crypto** for HMAC so it stays compatible with the Edge runtime.

4. **HTTP hardening** (`@savige/security`)  
   - `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP`, baseline `Content-Security-Policy` (frame/form/base/object restrictions; **not** a full script lockdown—Next.js requires compatible script policies for hydration).  
   - **HSTS** when the request is HTTPS (or `x-forwarded-proto: https` behind a TLS terminator).

5. **Production gate for owner area**  
   If `NODE_ENV=production` and `OWNER_LOGIN_SECRET` is missing, shorter than 32 characters, or equals the placeholder, **`/admin` returns 503** instead of running with a weak default.

## What you must configure in production

- **Secrets:** `OWNER_LOGIN_SECRET` (32+ random bytes as hex/base64 string), `OWNER_ACCESS_CODE`, `DOWNLOAD_SIGNING_SECRET`, Stripe secrets, DB credentials. Never commit `.env` or SQLite files.
- **TLS:** Terminate HTTPS at your reverse proxy or host; ensure `x-forwarded-proto` is set correctly so HSTS and secure cookies behave as intended.
- **Database:** Use PostgreSQL (or equivalent) with least-privilege credentials; run Prisma migrations deliberately.
- **Rate limits:** In-process limits (e.g. auth, project requests) reset on process restart and do not coordinate across instances—use a shared store (Redis) at scale.

## Residual risks (acceptable for many sites; plan upgrades as you grow)

- **CSP** is not a strict nonce-based policy (would require deeper Next.js integration). Relies on React’s XSS model + same-origin APIs + careful handling of `dangerouslySetInnerHTML` (avoid).
- **Session fixation / theft:** Protect with HTTPS-only cookies in production (`secure` flag already tied to `NODE_ENV`), short TTLs, and logout invalidation (session row deleted).
- **DDoS / botnets:** Use CDN/WAF (Cloudflare, etc.) in front of production; not implemented in app code.
- **Dependency vulnerabilities:** Run `pnpm audit` and CI scanning regularly.

## Quick verification

```bash
pnpm --filter web exec eslint .
pnpm --filter web exec tsc --noEmit
pnpm --filter web test
```

Confirm `/api/admin/*` and **`/api/vault`** (GET and POST) return **403** without a valid owner session cookie (e.g. with `curl` and no cookies). Automated checks: `pnpm --filter web test:e2e` includes `tests/e2e/api-authz.spec.ts`. POST `/api/vault` writes **`vault.placeholder.submit`** audit entries with **length counts and `persisted` flag** (not raw note text). When **`VAULT_ENCRYPTION_KEY`** is set, vault payloads are stored as **AES-256-GCM** ciphertext (`docs/VAULT.md`); optional **`VAULT_ENCRYPTION_KEY_LEGACY`** decrypts older rows after rotation. Optional **S3** pointers use presigned PUT under `vault/<ownerUserId>/…` and must match **`AWS_S3_VAULT_BUCKET`**. Vault **POST** routes use per-IP rate limits (`lib/vault-rate-limit.ts`). The SQLite/Postgres DB file and S3 bucket must be protected like any secret-bearing asset.
