/**
 * Canonical public site origin for sitemaps, robots, and absolute URLs.
 * Set `SITE_URL` in production (e.g. https://savigesystemz.com). On Vercel, `VERCEL_URL` is used when unset.
 */
export function getSiteUrl(): string {
  const explicit = process.env.SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return "https://savigesystemz.com";
}
