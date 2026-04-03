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

const PRESETS: readonly { label: string; action: string; targetType: string }[] = [
  { label: "All", action: "", targetType: "" },
  { label: "Vault placeholder", action: "vault.placeholder.submit", targetType: "" },
  { label: "Vault (target type)", action: "", targetType: "vault" },
  { label: "Licenses", action: "license.grant", targetType: "" },
  { label: "Promotions", action: "creator_submission.promote", targetType: "" },
  { label: "Launch composer", action: "application.launch_compose", targetType: "" },
  { label: "Launch publishes", action: "application.publish", targetType: "" },
  { label: "Passkeys", action: "passkey.login", targetType: "" },
];

export function AuditViewer() {
  const [items, setItems] = useState<AuditRow[]>([]);
  const [error, setError] = useState("");
  const [actionDraft, setActionDraft] = useState("");
  const [targetTypeDraft, setTargetTypeDraft] = useState("");
  const [appliedAction, setAppliedAction] = useState("");
  const [appliedTargetType, setAppliedTargetType] = useState("");

  useEffect(() => {
    const qs = new URLSearchParams();
    if (appliedAction.trim()) qs.set("action", appliedAction.trim());
    if (appliedTargetType.trim()) qs.set("targetType", appliedTargetType.trim());
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
  }, [appliedAction, appliedTargetType]);

  function applyPreset(p: { action: string; targetType: string }) {
    setActionDraft(p.action);
    setTargetTypeDraft(p.targetType);
    setAppliedAction(p.action);
    setAppliedTargetType(p.targetType);
  }

  function applyManualFilters() {
    setAppliedAction(actionDraft.trim());
    setAppliedTargetType(targetTypeDraft.trim());
  }

  return (
    <section className="rounded-lg border border-zinc-800 p-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Quick filters">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p)}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              appliedAction === p.action && appliedTargetType === p.targetType
                ? "border-cyan-600 bg-cyan-950/80 text-cyan-200"
                : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="audit-filter-action" className="text-xs text-zinc-400">
            Filter by action
          </label>
          <input
            id="audit-filter-action"
            className="mt-1 block rounded border border-zinc-700 bg-zinc-950 p-2 text-sm"
            value={actionDraft}
            onChange={(event) => setActionDraft(event.target.value)}
            placeholder="e.g. license.grant, vault.placeholder.submit"
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
            <option value="vault.placeholder.submit" />
            <option value="application.create" />
            <option value="application.launch_compose" />
            <option value="application.launch_compose.upload_url.create" />
            <option value="application.publish" />
            <option value="archive_entry.publish" />
            <option value="creator_submission.promote" />
          </datalist>
        </div>
        <div>
          <label htmlFor="audit-filter-target-type" className="text-xs text-zinc-400">
            Filter by target type
          </label>
          <input
            id="audit-filter-target-type"
            className="mt-1 block rounded border border-zinc-700 bg-zinc-950 p-2 text-sm"
            value={targetTypeDraft}
            onChange={(event) => setTargetTypeDraft(event.target.value)}
            placeholder="e.g. vault, application"
          />
        </div>
        <button
          type="button"
          onClick={() => applyManualFilters()}
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
