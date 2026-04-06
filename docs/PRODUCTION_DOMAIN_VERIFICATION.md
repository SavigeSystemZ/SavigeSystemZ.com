# Production domain verification (SavigeSystemZ.com)

If **https://savigesystemz.com** shows another product (for example the **Immortality** UI), the domain is routing to the **wrong deployment**. The Savige codebase already uses Savige branding in `apps/web/app/layout.tsx`; the bug is infrastructure, not copy.

## Quick checks

1. **Savige health (must be this service)**

   ```bash
   curl -fsS https://savigesystemz.com/api/health | jq .
   ```

   Expect `"service": "savigesystemz-web"`.

2. **If you see Immortality instead**

   - **Vercel (or similar):** open the **SavigeSystemZ.com** project → *Settings → Domains* → ensure **savigesystemz.com** / **www** are attached to **this** project, not another repo.
   - **Remove** the same domain from the Immortality (or other) project so only one app owns the hostname.
   - **Self-hosted reverse proxy:** Point `proxy_pass` / `reverse_proxy` for `savigesystemz.com` to the process/port for **SavigeSystemZ** `apps/web` (see `apps/web/.env.example` for `SITE_URL` and local port conventions), not Immortality’s stack.

3. **After Immortality host guard (optional)**

   If Savige traffic was misrouted to Immortality, that app now returns **502** with a plain-text explanation for `Host: savigesystemz.com`, making misroutes obvious.

## Environment

- Production: set `SITE_URL=https://savigesystemz.com` (no trailing slash) for correct metadata and absolute URLs (`apps/web/lib/site-url.ts`).
