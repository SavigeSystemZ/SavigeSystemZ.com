import { notFound } from "next/navigation";
import { MarkdownRender } from "@/components/markdown-render";
import { getPublicRepoBySlug } from "@/lib/catalog-resolver";
import { fetchGithubReadme } from "@/lib/github-client";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

type CachedReadme = { expiresAt: number; content: string | null; sha: string | null };
const README_CACHE = new Map<string, CachedReadme>();
const FIVE_MINUTES_MS = 5 * 60 * 1000;

async function getCachedReadme(owner: string, repo: string): Promise<string | null> {
  const repoKey = `${owner}/${repo}`.toLowerCase();
  const now = Date.now();
  const cached = README_CACHE.get(repoKey);
  if (cached && cached.expiresAt > now) return cached.content;

  const readme = await fetchGithubReadme(owner, repo);
  if (!readme) {
    README_CACHE.set(repoKey, { expiresAt: now + FIVE_MINUTES_MS, content: null, sha: null });
    return null;
  }

  const shaKey = `${repoKey}:${readme.sha}`;
  const shaCached = README_CACHE.get(shaKey);
  if (shaCached && shaCached.expiresAt > now) {
    README_CACHE.set(repoKey, { ...shaCached });
    return shaCached.content;
  }

  const value = { expiresAt: now + FIVE_MINUTES_MS, content: readme.content, sha: readme.sha };
  README_CACHE.set(repoKey, value);
  README_CACHE.set(shaKey, value);
  return readme.content;
}

export default async function PublicRepoPage({ params }: Params) {
  const { slug } = await params;
  const repo = await getPublicRepoBySlug(slug);
  if (!repo) notFound();

  const readme =
    repo.githubOwner && repo.githubRepo
      ? await getCachedReadme(repo.githubOwner, repo.githubRepo)
      : null;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="surface-panel rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">{repo.name}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">{repo.description ?? "No description."}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
              {repo.primaryLanguage ? <span className="signal-chip">{repo.primaryLanguage}</span> : null}
              {typeof repo.starCount === "number" ? <span className="signal-chip">Stars: {repo.starCount}</span> : null}
              {typeof repo.forkCount === "number" ? <span className="signal-chip">Forks: {repo.forkCount}</span> : null}
              {repo.defaultBranch ? <span className="signal-chip">Branch: {repo.defaultBranch}</span> : null}
            </div>
          </div>
          {repo.githubUrl ? (
            <a href={repo.githubUrl} target="_blank" rel="noreferrer" className="action-secondary text-xs">
              Open on GitHub
            </a>
          ) : null}
        </div>
      </section>

      <section className="surface-panel mt-6 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white">README</h2>
        {readme ? (
          <div className="mt-4">
            <MarkdownRender markdown={readme} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-400">No README content available for this repository.</p>
        )}
      </section>
    </main>
  );
}
