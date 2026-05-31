"use client";

import { useCallback, useEffect, useState } from "react";

type AppSummary = {
  id: string;
  slug: string;
  name: string;
  visibility: "PUBLIC" | "PRIVATE" | "DRAFT";
};

type AppForLinking = AppSummary & { codeRepositoryId: string | null };

type CodeRepo = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  provider: "GITHUB" | "LOCAL";
  storageBackend: "GITHUB" | "SELF_HOSTED";
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
  applications: AppSummary[];
};

export function CodePanel() {
  const [items, setItems] = useState<CodeRepo[]>([]);
  const [applications, setApplications] = useState<AppForLinking[]>([]);
  const [loading, setLoading] = useState(true);
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingLinksFor, setEditingLinksFor] = useState<string | null>(null);
  const [linkDraft, setLinkDraft] = useState<string[]>([]);
  const [syncAllReport, setSyncAllReport] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/code", { credentials: "same-origin" });
      if (res.ok) {
        const body = (await res.json()) as { items: CodeRepo[]; applications: AppForLinking[] };
        setItems(body.items);
        setApplications(body.applications ?? []);
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

  async function initLocal(id: string) {
    if (!confirm("Initialize a self-hosted bare git repository for this project? You will need to git push your code directly to the foundry.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/code/${id}/init-local`, { method: "POST", credentials: "same-origin" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  function beginEditLinks(repo: CodeRepo) {
    setEditingLinksFor(repo.id);
    setLinkDraft(repo.applications.map((a) => a.id));
    setError(null);
  }

  function cancelEditLinks() {
    setEditingLinksFor(null);
    setLinkDraft([]);
  }

  function toggleLinkDraft(appId: string) {
    setLinkDraft((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId],
    );
  }

  async function saveLinks(repoId: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/code/${repoId}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationIds: linkDraft }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
      setEditingLinksFor(null);
      setLinkDraft([]);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  async function updateVisibility(repoId: string, visibility: CodeRepo["visibility"]) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/code/${repoId}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  async function syncAll() {
    setBusy(true);
    setError(null);
    setSyncAllReport({});
    try {
      const res = await fetch("/api/admin/code/sync-all", {
        method: "POST",
        credentials: "same-origin",
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        results?: Array<{ id: string; syncStatus: "OK" | "ERROR"; syncError: string | null }>;
      };
      if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
      const report = Object.fromEntries(
        (body.results ?? []).map((result) => [
          result.id,
          result.syncStatus === "OK" ? "Synced" : `Failed: ${result.syncError ?? "unknown error"}`,
        ]),
      );
      setSyncAllReport(report);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
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
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void syncAll()}
          disabled={busy || items.length === 0}
          className="action-secondary text-xs disabled:opacity-50"
        >
          {busy ? "Working…" : "Sync all"}
        </button>
      </div>

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
                  <label className="flex items-center gap-1 text-xs text-slate-300">
                    <span className="sr-only">Set repository visibility</span>
                    <select
                      value={repo.visibility}
                      onChange={(event) =>
                        void updateVisibility(repo.id, event.target.value as CodeRepo["visibility"])
                      }
                      disabled={busy}
                      className="rounded-md border border-white/10 bg-slate-950/60 px-2 py-1 text-xs text-white disabled:opacity-50"
                      aria-label={`Visibility for ${repo.name}`}
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="PRIVATE">PRIVATE</option>
                      <option value="PUBLIC">PUBLIC</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => beginEditLinks(repo)}
                    disabled={busy}
                    className="action-secondary text-xs disabled:opacity-50"
                  >
                    Link apps
                  </button>
                  <button
                    type="button"
                    onClick={() => void sync(repo.id)}
                    disabled={busy}
                    className="action-secondary text-xs disabled:opacity-50"
                  >
                    Sync
                  </button>
                  {repo.storageBackend !== "SELF_HOSTED" ? (
                    <button
                      type="button"
                      onClick={() => void initLocal(repo.id)}
                      disabled={busy}
                      className="action-secondary text-xs text-amber-200 disabled:opacity-50"
                    >
                      Init Self-Host
                    </button>
                  ) : null}
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

              <div className="mt-4 border-t border-white/8 pt-3 text-xs text-slate-300">
                {syncAllReport[repo.id] ? (
                  <p
                    className={`mb-2 ${
                      syncAllReport[repo.id].startsWith("Synced") ? "text-emerald-200" : "text-rose-200"
                    }`}
                  >
                    {syncAllReport[repo.id]}
                  </p>
                ) : null}
                <p className="text-[0.7rem] uppercase tracking-[0.24em] text-slate-500">Linked applications</p>
                {repo.applications.length === 0 ? (
                  <p className="mt-2 text-slate-400">No applications linked yet.</p>
                ) : (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {repo.applications.map((app) => (
                      <li
                        key={app.id}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1"
                      >
                        {app.name}{" "}
                        <span className="text-slate-500">({app.visibility.toLowerCase()})</span>
                      </li>
                    ))}
                  </ul>
                )}

                {editingLinksFor === repo.id ? (
                  <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/40 p-3">
                    {applications.length === 0 ? (
                      <p className="text-slate-400">No applications exist yet — create one in the Applications panel first.</p>
                    ) : (
                      <ul className="grid gap-1 sm:grid-cols-2">
                        {applications.map((app) => {
                          const checked = linkDraft.includes(app.id);
                          const linkedElsewhere =
                            !checked && app.codeRepositoryId && app.codeRepositoryId !== repo.id;
                          return (
                            <li key={app.id} className="flex items-start gap-2">
                              <input
                                id={`repo-${repo.id}-app-${app.id}`}
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleLinkDraft(app.id)}
                                className="mt-0.5"
                              />
                              <label
                                htmlFor={`repo-${repo.id}-app-${app.id}`}
                                className="cursor-pointer text-slate-200"
                              >
                                {app.name}{" "}
                                <span className="text-slate-500">({app.visibility.toLowerCase()})</span>
                                {linkedElsewhere ? (
                                  <span className="ml-1 text-amber-200">— currently linked elsewhere</span>
                                ) : null}
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => void saveLinks(repo.id)}
                        disabled={busy}
                        className="action-primary text-xs disabled:opacity-50"
                      >
                        {busy ? "Saving…" : "Save links"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditLinks}
                        disabled={busy}
                        className="action-secondary text-xs disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
