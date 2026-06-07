import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Panel, SectionHeading, StatusChip } from "@savige/ui";
import { listPublicReposWithCatalog } from "@/lib/catalog-resolver";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Repositories",
  description: "Public source repositories tracked by the SavigeSystemZ foundry.",
};

function formatNumber(value: number | null): string {
  if (typeof value !== "number") return "—";
  return value.toLocaleString();
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "—";
  const deltaSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (deltaSec < 60) return `${deltaSec}s ago`;
  const minutes = Math.floor(deltaSec / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default async function PublicReposPage() {
  const repos = await listPublicReposWithCatalog();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <Panel className="rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Repositories"
          title="Public source code tracked by the foundry."
          description="Every repository on this page mirrors a public codebase from the foundry's GitHub footprint. Pick one to see its README, primary language, default branch, and latest commit."
          action={
            <Link href="/applications" className="action-secondary text-sm">
              Back to applications
            </Link>
          }
        />
      </Panel>

      {repos.length === 0 ? (
        <Panel className="mt-6 rounded-[1.6rem] p-6">
          <p className="text-sm text-slate-300">
            No public repositories are available right now. Owner-tracked repos appear here once their visibility flips
            to <code className="font-mono text-xs">PUBLIC</code> in the admin panel.
          </p>
        </Panel>
      ) : (
        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          {repos.map((repo) => (
            <Panel key={repo.id} className="flex h-full flex-col gap-4 rounded-[1.6rem] p-5">
              {repo.previewMediaUrl ? (
                <div className="relative min-h-[10rem] overflow-hidden rounded-[1.2rem] border border-white/8 bg-slate-950/80">
                  <Image
                    src={repo.previewMediaUrl}
                    alt={`${repo.name} repository preview`}
                    fill
                    sizes="(min-width: 1024px) 420px, 100vw"
                    className="object-contain object-center bg-slate-950"
                  />
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-white">{repo.name}</h2>
                {repo.primaryLanguage ? (
                  <StatusChip variant="info" className="text-[0.62rem] uppercase tracking-[0.16em]">
                    {repo.primaryLanguage}
                  </StatusChip>
                ) : null}
              </div>
              {repo.description ? (
                <p className="text-sm leading-6 text-slate-300">{repo.description}</p>
              ) : (
                <p className="text-sm leading-6 text-slate-500">No description provided.</p>
              )}
              <dl className="grid grid-cols-3 gap-3 text-xs text-slate-300">
                <div>
                  <dt className="uppercase tracking-[0.18em] text-slate-500">Stars</dt>
                  <dd className="mt-1 font-mono text-sm text-white">{formatNumber(repo.starCount)}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.18em] text-slate-500">Forks</dt>
                  <dd className="mt-1 font-mono text-sm text-white">{formatNumber(repo.forkCount)}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.18em] text-slate-500">Open issues</dt>
                  <dd className="mt-1 font-mono text-sm text-white">{formatNumber(repo.openIssueCount)}</dd>
                </div>
              </dl>
              <div className="text-xs text-slate-400">
                <span className="uppercase tracking-[0.18em] text-slate-500">Latest commit</span>
                <span className="ml-2">{formatRelative(repo.latestCommitAt)}</span>
                {repo.defaultBranch ? <span className="ml-2 text-slate-500">on {repo.defaultBranch}</span> : null}
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
                <Link href={`/repos/${repo.slug}`} className="action-primary text-xs">
                  Open repository
                </Link>
                {repo.linkedApplicationSlug ? (
                  <Link href={`/applications/${repo.linkedApplicationSlug}`} className="action-secondary text-xs">
                    View catalog entry
                  </Link>
                ) : null}
                {repo.githubUrl ? (
                  <a
                    href={repo.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-secondary text-xs"
                  >
                    View on GitHub
                  </a>
                ) : null}
              </div>
            </Panel>
          ))}
        </section>
      )}
    </main>
  );
}
