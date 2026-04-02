/**
 * Baseline HTTP security headers for SavigeSystemZ web surfaces.
 * Apply in Next.js middleware (and optionally in API routes).
 */

export const securityHeadersStatic: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  /**
   * Does not include script-src (Next.js needs inline/hydration). Use with HTML sanitization and same-origin APIs.
   * Omit upgrade-insecure-requests so local HTTP dev (127.0.0.1) is not broken; rely on HSTS on HTTPS deployments.
   */
  "Content-Security-Policy": "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
};

/** @deprecated Use securityHeadersStatic + buildSecurityHeaders; kept for backwards compatibility. */
export const securityHeaders: Record<string, string> = {
  ...securityHeadersStatic,
};

export function isHttpsRequest(request: {
  headers: Headers;
  nextUrl?: { protocol: string };
}): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded?.split(",")[0]?.trim() === "https") return true;
  if (request.nextUrl?.protocol === "https:") return true;
  return false;
}

/**
 * Full header set for a request. Adds HSTS only when the incoming request is HTTPS
 * (or behind a reverse proxy that sets x-forwarded-proto).
 */
export function buildSecurityHeaders(request: {
  headers: Headers;
  nextUrl?: { protocol: string };
}): Record<string, string> {
  const out: Record<string, string> = { ...securityHeadersStatic };
  if (isHttpsRequest(request)) {
    out["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload";
  }
  return out;
}

export function isOwnerRole(role: string): boolean {
  return role === "owner";
}
