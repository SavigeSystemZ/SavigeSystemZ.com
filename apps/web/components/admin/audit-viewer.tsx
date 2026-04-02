"use client";

import { useEffect, useState } from "react";

type AuditRow = {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: string | null;
  createdAt: string;
  actor: { id: string; email: string; role: string } | null;
};

export function AuditViewer() {
  const [items, setItems] = useState<AuditRow[]>([]);
  const [error, setError] = useState("");
  const [actionDraft, setActionDraft] = useState("");
  const [appliedAction, setAppliedAction] = useState("");

  useEffect(() => {
    const qs = new URLSearchParams();
    if (appliedAction.trim()) qs.set("action", appliedAction.trim());
    fetch(`/api/admin/audit-logs?${qs.toString()}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          setError("Failed to load audit logs. Owner login required.");
          return;
        }
        const data = (await res.json()) as { items: AuditRow[] };
        setItems(data.items);
      })
      .catch(() => setError("Failed to load audit logs. Owner login required."));
  }, [appliedAction]);

  return (
    <section className="rounded-lg border border-zinc-800 p-4">
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="text-xs text-zinc-400">Filter by action</label>
          <input
            className="mt-1 block rounded border border-zinc-700 bg-zinc-950 p-2 text-sm"
            value={actionDraft}
            onChange={(event) => setActionDraft(event.target.value)}
            placeholder="e.g. license.grant, passkey.login"
            list="audit-action-suggestions"
          />
          <datalist id="audit-action-suggestions">
            <option value="project_request.create" />
            <option value="project_request.update" />
            <option value="project_request.archive" />
            <option value="project_request.restore" />
            <option value="passkey.login" />
            <option value="passkey.register" />
            <option value="passkey.revoke" />
            <option value="license.grant" />
            <option value="release_asset.create" />
          </datalist>
        </div>
        <button
          type="button"
          onClick={() => setAppliedAction(actionDraft.trim())}
          className="rounded bg-cyan-400 px-3 py-2 text-sm font-medium text-zinc-950"
        >
          Apply
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      <ul className="mt-4 max-h-96 space-y-2 overflow-auto text-sm">
        {items.map((row) => (
          <li key={row.id} className="rounded border border-zinc-800 p-2">
            <p className="font-medium text-cyan-300">{row.action}</p>
            <p className="text-xs text-zinc-400">
              {new Date(row.createdAt).toISOString()} · {row.targetType}
              {row.targetId ? ` · ${row.targetId}` : ""}
            </p>
            {row.actor ? (
              <p className="text-xs text-zinc-500">Actor: {row.actor.email}</p>
            ) : null}
            {row.metadata ? <p className="mt-1 text-xs text-zinc-500">{row.metadata}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
