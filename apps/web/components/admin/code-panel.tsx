"use client";

import { useCallback, useEffect, useState } from "react";

type CodeRepo = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  provider: "GITHUB" | "LOCAL";
  visibility: "PUBLIC" | "PRIVATE" | "DRAFT";
  githubOwner: string | null;
  githubRepo: string | null;
  githubUrl: string | null;
  defaultBranch: string | null;
  primaryLanguage: string | null;
  starCount: number | null;
  forkCount: number | null;
  openIssueCount: number | null;
  latestCommitSha: string | null;
  latestCommitMessage: string | null;
  latestCommitAt: string | null;
  syncStatus: "PENDING" | "OK" | "ERROR";
  syncError: string | null;
  lastSyncedAt: string | null;
};

export function CodePanel() {
  const [items, setItems] = useState<CodeRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/code", { credentials: "same-origin" });
      if (res.ok) {
        const body = (await res.json()) as { items: CodeRepo[] };
        setItems(body.items);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function addRepo(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/code", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubRef: ref.trim() }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
      setRef("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  async function sync(id: string) {
    setBusy(true);
    try {
      await fetch(`/api/admin/code/${id}`, { method: "POST", credentials: "same-origin" });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this repository from tracking? Source code on GitHub is not affected.")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/code/${id}`, { method: "DELETE", credentials: "same-origin" });
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={addRepo}
        className="surface-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-end"
      >
        <label className="flex-1">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-400">GitHub repo</span>
          <input
            value={ref}
            onChange={(event) => setRef(event.target.value)}
            placeholder="owner/repo or https://github.com/owner/repo"
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/40"
            required
            aria-label="GitHub repository reference"
          />
        </label>
        <button
          type="submit"
          disabled={busy || ref.trim().length === 0}
          className="action-primary text-sm disabled:opacity-50"
        >
          {busy ? "Working…" : "Connect"}
        </button>
      </form>
      {error ? (
        <p role="alert" className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-400">Loading repositories…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400">
          No repositories tracked yet. Connect one above to mirror its metadata into the admin.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((repo) => (
            <li key={repo.id} className="surface-panel rounded-2xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-white">{repo.name}</h2>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-300">
                      {repo.provider.toLowerCase()}
                    </span>
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2 py-0.5 text-xs text-cyan-100">
                      {repo.visibility.toLowerCase()}
                    </span>
                    {repo.syncStatus === "ERROR" ? (
                      <span className="rounded-full border border-rose-400/30 bg-rose-500/10 px-2 py-0.5 text-xs text-rose-100">
                        sync error
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-300">
                    {repo.description ?? "No description."}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    {repo.githubUrl ? (
                      <a href={repo.githubUrl} target="_blank" rel="noreferrer" className="text-cyan-200 hover:underline">
                        {repo.githubOwner}/{repo.githubRepo}
                      </a>
                    ) : null}
                    {repo.primaryLanguage ? <span>{repo.primaryLanguage}</span> : null}
                    {typeof repo.starCount === "number" ? <span>★ {repo.starCount}</span> : null}
                    {typeof repo.forkCount === "number" ? <span>⑂ {repo.forkCount}</span> : null}
                    {typeof repo.openIssueCount === "number" ? (
                      <span>{repo.openIssueCount} open issues</span>
                    ) : null}
                    {repo.defaultBranch ? <span>branch: {repo.defaultBranch}</span> : null}
                  </div>
                  {repo.latestCommitMessage ? (
                    <p className="mt-2 text-xs text-slate-400">
                      <span className="text-slate-200">latest:</span>{" "}
                      <code className="text-slate-300">{repo.latestCommitSha?.slice(0, 7)}</code>{" "}
                      {repo.latestCommitMessage}
                    </p>
                  ) : null}
                  {repo.syncError ? (
                    <p className="mt-2 text-xs text-rose-200">{repo.syncError}</p>
                  ) : null}
                </div>
                <div className="flex flex-shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => void sync(repo.id)}
                    disabled={busy}
                    className="action-secondary text-xs disabled:opacity-50"
                  >
                    Sync
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(repo.id)}
                    disabled={busy}
                    className="action-secondary text-xs text-rose-200 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
