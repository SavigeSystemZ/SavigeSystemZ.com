"use client";

import { useCallback, useEffect, useState } from "react";
import {
  creatorSubmissionStatusLabels,
  creatorSubmissionStatusOptions,
  creatorSubmissionTypeLabels,
  creatorSubmissionTypeOptions,
} from "@/lib/creator-submission-taxonomy";

type CreatorSubmissionRow = {
  id: string;
  title: string;
  summary: string;
  details: string;
  type: (typeof creatorSubmissionTypeOptions)[number];
  plannedVisibility: "PUBLIC" | "PRIVATE" | "DRAFT";
  status: (typeof creatorSubmissionStatusOptions)[number];
  contactEmail: string | null;
  repoUrl: string | null;
  artifactUrl: string | null;
  ownerNotes: string | null;
  promotedTargetType: "APPLICATION" | "ARCHIVE_ENTRY" | null;
  promotedTargetId: string | null;
  promotedTargetSlug: string | null;
  promotedAt: string | null;
  sourceIp: string | null;
  deletedAt: string | null;
  createdAt: string;
};

type Counts = {
  total: number;
  pending: number;
  reviewing: number;
  approved: number;
  hold: number;
  rejected: number;
  promoted: number;
};

const inputClass =
  "rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40";

function emptyCounts(): Counts {
  return {
    total: 0,
    pending: 0,
    reviewing: 0,
    approved: 0,
    hold: 0,
    rejected: 0,
    promoted: 0,
  };
}

function getPromotionMeta(item: CreatorSubmissionRow): {
  label: string;
  actionLabel: string;
  href: string;
} {
  if (item.type === "APPLICATION" || item.promotedTargetType === "APPLICATION") {
    return {
      label: "Draft application",
      actionLabel: "Promote to draft app",
      href: item.promotedTargetId ? `/admin#application-${item.promotedTargetId}` : "/admin",
    };
  }

  return {
    label: "Draft archive entry",
    actionLabel: "Promote to draft archive",
    href: item.promotedTargetId ? `/admin/archive#archive-entry-${item.promotedTargetId}` : "/admin/archive",
  };
}

export function CreatorSubmissionsPanel() {
  const [items, setItems] = useState<CreatorSubmissionRow[]>([]);
  const [counts, setCounts] = useState<Counts>(emptyCounts);
  const [statusFilter, setStatusFilter] = useState<"" | CreatorSubmissionRow["status"]>("");
  const [typeFilter, setTypeFilter] = useState<"" | CreatorSubmissionRow["type"]>("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { status: CreatorSubmissionRow["status"]; ownerNotes: string }>>(
    {},
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (statusFilter) qs.set("status", statusFilter);
    if (typeFilter) qs.set("type", typeFilter);
    if (includeArchived) qs.set("includeArchived", "1");
    const suffix = qs.toString() ? `?${qs.toString()}` : "";

    try {
      const response = await fetch(`/api/admin/creator-submissions${suffix}`, {
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("load_failed");
      const data = (await response.json()) as { items: CreatorSubmissionRow[]; counts: Counts };
      setItems(data.items);
      setCounts(data.counts);
      setDrafts(
        Object.fromEntries(
          data.items.map((item) => [
            item.id,
            {
              status: item.status,
              ownerNotes: item.ownerNotes ?? "",
            },
          ]),
        ),
      );
      setError("");
      setInfo("");
    } catch {
      setError("Failed to load creator moderation items.");
    } finally {
      setLoading(false);
    }
  }, [includeArchived, statusFilter, typeFilter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function setDraft<K extends keyof (typeof drafts)[string]>(
    id: string,
    field: K,
    value: (typeof drafts)[string][K],
  ) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        status: current[id]?.status ?? "PENDING",
        ownerNotes: current[id]?.ownerNotes ?? "",
        [field]: value,
      },
    }));
  }

  async function patchItem(id: string, body: Record<string, unknown>) {
    setSavingId(id);
    setInfo("");
    try {
      const response = await fetch(`/api/admin/creator-submissions/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "update_failed");
      }
      await refresh();
    } catch {
      setError("Could not update creator submission.");
    } finally {
      setSavingId(null);
    }
  }

  async function promoteItem(id: string) {
    setSavingId(id);
    setError("");
    setInfo("");
    try {
      const response = await fetch(`/api/admin/creator-submissions/${encodeURIComponent(id)}/promote`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        promotion?: {
          targetType: "APPLICATION" | "ARCHIVE_ENTRY";
          targetId: string;
          targetSlug: string;
        };
      };
      if (!response.ok || !data.promotion) {
        throw new Error(data.error ?? "promotion_failed");
      }
      setInfo(
        data.promotion.targetType === "APPLICATION"
          ? `Submission promoted into draft application "${data.promotion.targetSlug}".`
          : `Submission promoted into draft archive entry "${data.promotion.targetSlug}".`,
      );
      await refresh();
    } catch {
      setError("Could not promote creator submission.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="section-eyebrow">Moderation queue</p>
          <h2 className="display-title mt-5 text-3xl font-semibold tracking-[-0.05em] text-white">
            Creator submissions ready for owner review.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            This queue is for staged applications, archive drops, and engineering artifacts that need triage before they
            enter the public shell or private delivery flow.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Pending", value: counts.pending },
            { label: "Reviewing", value: counts.reviewing },
            { label: "Approved", value: counts.approved },
          ].map((metric) => (
            <div key={metric.label} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="display-title text-2xl font-semibold tracking-[-0.05em] text-white">{metric.value}</p>
              <p className="mt-2 text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[0.72fr_0.28fr]">
        <div className="grid gap-4 md:grid-cols-3">
          <select className={inputClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
            <option value="">All statuses</option>
            {creatorSubmissionStatusOptions.map((status) => (
              <option key={status} value={status}>
                {creatorSubmissionStatusLabels[status]}
              </option>
            ))}
          </select>
          <select className={inputClass} value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}>
            <option value="">All types</option>
            {creatorSubmissionTypeOptions.map((type) => (
              <option key={type} value={type}>
                {creatorSubmissionTypeLabels[type]}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(event) => setIncludeArchived(event.target.checked)}
              className="rounded border-white/20 bg-slate-950"
            />
            Include archived
          </label>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-slate-400">
          <p className="font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Queue totals</p>
          <p className="mt-3">Active items: {counts.total}</p>
          <p>Hold: {counts.hold}</p>
          <p>Rejected: {counts.rejected}</p>
          <p>Promoted: {counts.promoted}</p>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      {!error && info ? <p className="mt-4 text-sm text-cyan-100">{info}</p> : null}

      <div className="mt-8 grid gap-4">
        {loading ? (
          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] px-5 py-6 text-sm text-slate-400">
            Loading moderation queue…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[1.6rem] border border-dashed border-white/12 bg-white/[0.02] px-5 py-6 text-sm text-slate-500">
            No creator submissions match the current filters.
          </div>
        ) : (
          items.map((item) => {
            const draft = drafts[item.id] ?? {
              status: item.status,
              ownerNotes: item.ownerNotes ?? "",
            };
            const archived = Boolean(item.deletedAt);
            const promotion = getPromotionMeta(item);
            const promoted = Boolean(item.promotedTargetId && item.promotedTargetType);
            return (
              <article key={item.id} className="surface-panel rounded-[1.8rem] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-4xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="signal-chip text-[0.68rem] uppercase tracking-[0.18em] text-slate-200">
                        {creatorSubmissionTypeLabels[item.type]}
                      </span>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-slate-400">
                        {item.plannedVisibility.toLowerCase()}
                      </span>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-slate-400">
                        {promotion.label}
                      </span>
                      {archived ? (
                        <span className="rounded-full border border-amber-300/20 bg-amber-300/8 px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-amber-200">
                          Archived
                        </span>
                      ) : null}
                      {promoted ? (
                        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/8 px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-cyan-100">
                          Promoted
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-4 display-title text-2xl font-semibold tracking-[-0.05em] text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{item.summary}</p>
                    <p className="mt-4 text-sm leading-7 text-slate-400">{item.details}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                      {item.contactEmail ? <span>{item.contactEmail}</span> : null}
                      {item.sourceIp ? <span>{item.sourceIp}</span> : null}
                      {item.repoUrl ? <a href={item.repoUrl} target="_blank" rel="noreferrer" className="text-cyan-200 hover:text-white">Repo</a> : null}
                      {item.artifactUrl ? <a href={item.artifactUrl} target="_blank" rel="noreferrer" className="text-cyan-200 hover:text-white">Artifact</a> : null}
                      {item.promotedTargetSlug ? <span>Draft slug: {item.promotedTargetSlug}</span> : null}
                    </div>
                  </div>

                  <div className="grid min-w-[18rem] gap-3">
                    <select
                      className={inputClass}
                      value={draft.status}
                      onChange={(event) => setDraft(item.id, "status", event.target.value as CreatorSubmissionRow["status"])}
                      disabled={savingId === item.id}
                    >
                      {creatorSubmissionStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {creatorSubmissionStatusLabels[status]}
                        </option>
                      ))}
                    </select>
                    <textarea
                      className="min-h-28 rounded-[1.4rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
                      placeholder="Owner notes, routing guidance, or moderation decision context"
                      value={draft.ownerNotes}
                      onChange={(event) => setDraft(item.id, "ownerNotes", event.target.value)}
                      disabled={savingId === item.id}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={savingId === item.id}
                        onClick={() => void patchItem(item.id, { status: draft.status, ownerNotes: draft.ownerNotes })}
                        className="action-primary text-[0.68rem]"
                      >
                        {savingId === item.id ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        disabled={savingId === item.id || archived || promoted}
                        onClick={() => void promoteItem(item.id)}
                        className="action-secondary text-[0.68rem] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingId === item.id ? "Working…" : promoted ? "Promoted" : promotion.actionLabel}
                      </button>
                      <button
                        type="button"
                        disabled={savingId === item.id}
                        onClick={() => void patchItem(item.id, { archived: !archived })}
                        className="action-secondary text-[0.68rem]"
                      >
                        {archived ? "Restore" : "Archive"}
                      </button>
                    </div>
                    {promoted ? (
                      <a
                        href={promotion.href}
                        className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-xs uppercase tracking-[0.22em] text-cyan-100 hover:border-cyan-300/30 hover:text-white"
                      >
                        Open {promotion.label}
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
