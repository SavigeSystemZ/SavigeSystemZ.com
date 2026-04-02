"use client";

import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  title: string;
  description: string;
  contactEmail: string | null;
  status: "PENDING" | "REVIEWING" | "CLOSED";
  sourceIp: string | null;
  deletedAt: string | null;
  createdAt: string;
};

function exportHref(filter: "" | "PENDING" | "REVIEWING" | "CLOSED", includeDeleted: boolean): string {
  const qs = new URLSearchParams();
  if (filter) qs.set("status", filter);
  if (includeDeleted) qs.set("includeDeleted", "1");
  const q = qs.toString();
  return `/api/admin/project-requests/export${q ? `?${q}` : ""}`;
}

export function ProjectRequestsPanel() {
  const [items, setItems] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"" | "PENDING" | "REVIEWING" | "CLOSED">("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchList = useCallback((statusFilter: typeof filter, deleted: boolean) => {
    const qs = new URLSearchParams();
    if (statusFilter) qs.set("status", statusFilter);
    if (deleted) qs.set("includeDeleted", "1");
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return fetch(`/api/admin/project-requests${suffix}`, { credentials: "same-origin" }).then(async (res) => {
      if (!res.ok) throw new Error("load_failed");
      return (await res.json()) as { items: Row[] };
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchList(filter, includeDeleted)
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setError("");
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load project requests.");
      });
    return () => {
      cancelled = true;
    };
  }, [filter, includeDeleted, fetchList]);

  async function patchRequest(
    id: string,
    body: Record<string, unknown>,
    onSuccess: () => void,
  ) {
    setUpdatingId(id);
    const res = await fetch(`/api/admin/project-requests/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    setUpdatingId(null);
    if (!res.ok) {
      setError("Could not update request.");
      return;
    }
    onSuccess();
  }

  function setStatus(id: string, status: Row["status"]) {
    void patchRequest(id, { status }, () => {
      fetchList(filter, includeDeleted)
        .then((data) => {
          setItems(data.items);
          setError("");
        })
        .catch(() => setError("Failed to refresh list."));
    });
  }

  function archive(id: string) {
    void patchRequest(id, { archived: true }, () => {
      fetchList(filter, includeDeleted)
        .then((data) => {
          setItems(data.items);
          setError("");
        })
        .catch(() => setError("Failed to refresh list."));
    });
  }

  function restore(id: string) {
    void patchRequest(id, { archived: false }, () => {
      fetchList(filter, includeDeleted)
        .then((data) => {
          setItems(data.items);
          setError("");
        })
        .catch(() => setError("Failed to refresh list."));
    });
  }

  return (
    <section className="rounded-lg border border-zinc-800 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-zinc-400">Status filter</label>
            <select
              className="mt-1 block rounded border border-zinc-700 bg-zinc-950 p-2 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
            >
              <option value="">All</option>
              <option value="PENDING">PENDING</option>
              <option value="REVIEWING">REVIEWING</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
              className="rounded border-zinc-600"
            />
            Include archived
          </label>
        </div>
        <a
          href={exportHref(filter, includeDeleted)}
          className="rounded-md border border-zinc-600 px-3 py-2 text-sm text-cyan-300 hover:bg-zinc-900"
        >
          Export CSV
        </a>
      </div>
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      <ul className="mt-4 max-h-[32rem] space-y-3 overflow-auto text-sm">
        {items.length === 0 ? (
          <li className="text-zinc-500">No requests yet.</li>
        ) : (
          items.map((row) => {
            const isArchived = Boolean(row.deletedAt);
            return (
              <li
                key={row.id}
                className={`rounded border p-3 ${isArchived ? "border-zinc-700 opacity-80" : "border-zinc-800"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-cyan-200">{row.title}</p>
                    <p className="mt-1 whitespace-pre-wrap text-xs text-zinc-400">{row.description}</p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {new Date(row.createdAt).toISOString()}
                      {row.contactEmail ? ` · ${row.contactEmail}` : ""}
                      {row.sourceIp ? ` · ${row.sourceIp}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      {isArchived ? (
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">Archived</span>
                      ) : null}
                      <span className="text-xs uppercase text-zinc-500">{row.status}</span>
                    </div>
                    {isArchived ? (
                      <button
                        type="button"
                        disabled={updatingId === row.id}
                        className="rounded border border-zinc-600 px-2 py-1 text-xs text-cyan-300 hover:bg-zinc-900 disabled:opacity-50"
                        onClick={() => restore(row.id)}
                      >
                        Restore
                      </button>
                    ) : (
                      <>
                        <select
                          disabled={updatingId === row.id}
                          className="rounded border border-zinc-700 bg-zinc-950 p-1 text-xs"
                          value={row.status}
                          onChange={(e) => void setStatus(row.id, e.target.value as Row["status"])}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="REVIEWING">REVIEWING</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                        <button
                          type="button"
                          disabled={updatingId === row.id}
                          className="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-900 disabled:opacity-50"
                          onClick={() => archive(row.id)}
                        >
                          Archive
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
