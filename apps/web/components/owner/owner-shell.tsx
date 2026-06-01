"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/owner/workspace", label: "Workspace" },
  { href: "/owner/projects", label: "Projects" },
  { href: "/owner/journal", label: "Journal" },
] as const;

function linkIsActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/owner/workspace") return pathname === "/owner/workspace";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OwnerShell() {
  const pathname = usePathname();

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    window.location.href = "/owner/login";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-rose-500/10 bg-rose-500/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-rose-200">
              Private
            </span>
            <nav className="flex flex-wrap gap-1" aria-label="Owner sections">
              {NAV_LINKS.map((link) => {
                const active = linkIsActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-rose-500/20 text-white ring-1 ring-rose-400/40"
                        : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="action-secondary text-xs border-cyan-500/20 text-cyan-200 hover:bg-cyan-500/10">
              Switch to Admin
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="action-secondary text-xs"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
