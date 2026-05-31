import { notFound } from "next/navigation";
import { MarkdownRender } from "@/components/markdown-render";
import { GitTree } from "@/components/public/git-tree";
import { getEntitledRepoBySlug } from "@/lib/catalog-resolver";
import { fetchGithubReadme } from "@/lib/github-client";
import { getLocalGitTree, getLocalGitBlob, getLocalGitReadme, type GitTreeEntry } from "@/lib/git-local";
import { getAuthContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string; path?: string[] }> };

export default async function PublicRepoPage({ params }: Params) {
  const { slug, path = [] } = await params;
  const context = await getAuthContext();
  const isOwner = context.role === "owner";
  
  const repo = await getEntitledRepoBySlug(slug, context.userId, isOwner);
  if (!repo) notFound();

  const isLocal = repo.storageBackend === "SELF_HOSTED";

  const isTree = path[0] === "tree";
  const isBlob = path[0] === "blob";
  const ref = path[1] || "HEAD";
  const subPath = path.slice(2).join("/");

  if ((isTree || isBlob) && !isLocal) {
    // If it's a GitHub backed repo, we don't have local blob access implemented here yet
    // Could redirect to GitHub URL
    if (repo.githubUrl) {
      return (
        <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="surface-panel rounded-2xl p-6">
            <p className="text-white">This repository is hosted on GitHub.</p>
            <a href={`${repo.githubUrl}/${path.join("/")}`} className="text-cyan-300 hover:underline">
              View on GitHub
            </a>
          </section>
        </main>
      );
    }
    notFound();
  }

  let readmeMarkdown: string | null = null;
  let treeEntries: GitTreeEntry[] = [];
  let blobContent: string | null = null;

  if (isLocal) {
    if (isBlob) {
      // Find the blob hash by getting the tree of the parent directory
      const parentDir = path.slice(2, -1).join("/");
      const fileName = path[path.length - 1];
      const parentTree = await getLocalGitTree(slug, ref, parentDir);
      const entry = parentTree.find((e) => e.name === fileName);
      if (!entry) notFound();
      blobContent = await getLocalGitBlob(slug, entry.hash);
    } else {
      treeEntries = await getLocalGitTree(slug, ref, subPath);
      if (!subPath) {
        // We are at the root
        readmeMarkdown = await getLocalGitReadme(slug, ref);
      }
    }
  } else {
    // GITHUB backed root
    if (!subPath && repo.githubOwner && repo.githubRepo) {
      const readmeObj = await fetchGithubReadme(repo.githubOwner, repo.githubRepo);
      if (readmeObj) readmeMarkdown = readmeObj.content;
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {!subPath && !isBlob && (
        <section className="surface-panel rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white">{repo.name}</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">{repo.description ?? "No description."}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                {repo.primaryLanguage ? <span className="signal-chip">{repo.primaryLanguage}</span> : null}
                {typeof repo.starCount === "number" ? <span className="signal-chip">Stars: {repo.starCount}</span> : null}
                {typeof repo.forkCount === "number" ? <span className="signal-chip">Forks: {repo.forkCount}</span> : null}
                {repo.defaultBranch ? <span className="signal-chip">Branch: {repo.defaultBranch}</span> : null}
                {isLocal ? <span className="signal-chip text-amber-200 border-amber-200/30">Self-Hosted</span> : null}
              </div>
            </div>
            {repo.githubUrl ? (
              <a href={repo.githubUrl} target="_blank" rel="noreferrer" className="action-secondary text-xs">
                Open on GitHub
              </a>
            ) : null}
          </div>
        </section>
      )}

      {isBlob ? (
        <section className="surface-panel rounded-2xl overflow-hidden">
          <div className="bg-slate-900/50 px-4 py-3 border-b border-white/5">
            <span className="text-sm font-medium text-slate-200">{path.slice(2).join("/")}</span>
          </div>
          <div className="p-4 overflow-x-auto">
            <pre className="text-sm text-slate-300 font-mono">
              {blobContent ?? "Blob could not be loaded."}
            </pre>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          {isLocal && (
            <GitTree slug={slug} tree={treeEntries} currentPath={subPath} />
          )}

          {(!isLocal || !subPath) && (
            <section className="surface-panel rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white">README</h2>
              {readmeMarkdown ? (
                <div className="mt-4">
                  <MarkdownRender markdown={readmeMarkdown} />
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">No README content available for this repository.</p>
              )}
            </section>
          )}
        </div>
      )}
    </main>
  );
}
