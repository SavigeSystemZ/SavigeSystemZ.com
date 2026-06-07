import Link from "next/link";
import { getDonateConfig } from "@/lib/donate-config";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { href: "/applications", label: "Applications" },
      { href: "/repos", label: "Repositories" },
      { href: "/archive", label: "Archive" },
      { href: "/downloads", label: "Downloads" },
      { href: "/pricing", label: "Pricing" },
      { href: "/creator", label: "Creator" },
    ],
  },
  {
    title: "Signals",
    links: [
      { href: "/bio", label: "Bio" },
      { href: "/reviews", label: "Reviews" },
      { href: "/services", label: "Project requests" },
    ],
  },
];

export function SiteFooter() {
  const donate = getDonateConfig();

  return (
    <footer className="border-t border-white/8 bg-slate-950/80" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="surface-panel grid gap-8 rounded-[2rem] px-6 py-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="section-eyebrow">SavigeSystemZ / Foundry</p>
            <h2 className="display-title mt-5 text-3xl font-semibold tracking-[-0.05em] text-white">
              Public showcase. Private control plane. Real engineering work in one system.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Built by Michael Spaulding (Sys Sav) to present applications, release artifacts, engineering systems,
              and secure internal workflows without splitting the story across separate tools.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={donate.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="action-secondary text-xs"
              >
                GitHub Sponsors
              </a>
              <a
                href="https://github.com/SavigeSystemZ"
                target="_blank"
                rel="noreferrer"
                className="action-secondary text-xs"
              >
                SavigeSystemZ org
              </a>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.28em] text-slate-500">
              Secure by default. Releases traceable. Operator-first.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {group.title}
                </h3>
                <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
                  {group.links.map((link) => (
                    <Link key={link.href} href={link.href} className="hover:text-white">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
