import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/applications", label: "Applications" },
  { href: "/downloads", label: "Downloads" },
  { href: "/pricing", label: "Pricing" },
  { href: "/bio", label: "Bio" },
  { href: "/services", label: "Request Project" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="font-semibold tracking-wide text-cyan-300"
          aria-label="SavigeSystemZ home"
        >
          SavigeSystemZ
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-200" aria-label="Primary">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-cyan-300">
              {link.label}
            </Link>
          ))}
          <Link
            href="/owner/login"
            className="text-xs text-zinc-500 hover:text-cyan-400"
            prefetch={false}
          >
            Owner
          </Link>
        </nav>
      </div>
    </header>
  );
}
