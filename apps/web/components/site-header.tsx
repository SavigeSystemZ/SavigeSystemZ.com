import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/applications", label: "Applications" },
  { href: "/archive", label: "Archive" },
  { href: "/repos", label: "GitHub Repos" },
  { href: "/downloads", label: "Downloads" },
  { href: "/pricing", label: "Pricing" },
  { href: "/creator", label: "Creator" },
  { href: "/bio", label: "Bio" },
  { href: "/services", label: "Request Project" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="surface-panel flex flex-wrap items-center justify-between gap-4 rounded-full px-4 py-3">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3 text-left"
            aria-label="SavigeSystemZ home"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/10 text-xs font-bold uppercase tracking-[0.32em] text-cyan-100">
              SZ
            </span>
            <span className="min-w-0">
              <span className="display-title block text-lg font-semibold tracking-[-0.04em] text-white">
                SavigeSystemZ
              </span>
              <span className="block text-[0.68rem] uppercase tracking-[0.28em] text-slate-400">
                software foundry / operator lab
              </span>
            </span>
          </Link>

          <nav
            className="flex flex-1 flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-zinc-200"
            aria-label="Primary"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-2 text-slate-300 hover:bg-white/[0.05] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/services" className="action-primary text-xs">
              Start a Build
            </Link>
            <Link
              href="/owner/login"
              className="action-secondary text-xs text-slate-300"
              prefetch={false}
            >
              Owner
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
