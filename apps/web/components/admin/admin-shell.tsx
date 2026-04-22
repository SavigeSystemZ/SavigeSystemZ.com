"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/releases", label: "Releases" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/archive", label: "Archive" },
  { href: "/admin/audit", label: "Audit" },
  { href: "/admin/vault", label: "Vault" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/code", label: "Code" },
] as const;

function linkIsActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell() {
  const pathname = usePathname();

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    window.location.href = "/owner/login";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="surface-panel flex flex-wrap items-center justify-between gap-4 rounded-full px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/80">
              Owner
            </span>
            <nav className="flex flex-wrap gap-1" aria-label="Admin sections">
              {NAV_LINKS.map((link) => {
                const active = linkIsActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-cyan-400/14 text-white ring-1 ring-cyan-300/30"
                        : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="action-secondary text-xs"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
