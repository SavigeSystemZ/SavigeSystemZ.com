"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AppVisibility = "PUBLIC" | "PRIVATE" | "DRAFT";

type AppItem = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  label?: string | null;
  tagline?: string | null;
  audience?: string | null;
  priceLabel?: string | null;
  releaseChannel?: string | null;
  details?: string | null;
  highlights?: string | null;
  surfaceAreas?: string | null;
  stackItems?: string | null;
  visibility: AppVisibility;
  featured: boolean;
  media: Array<{ id: string; featured: boolean }>;
  versions: Array<{ id: string; assets: Array<{ id: string; visibility: "PUBLIC" | "ENTITLED" | "PRIVATE" }> }>;
  launchReadiness: {
    ready: boolean;
    blockers: string[];
    warnings: string[];
    counts: {
      media: number;
      featuredMedia: number;
      versions: number;
      publicAssets: number;
      entitledAssets: number;
    };
  };
};

type AppFormState = {
  slug: string;
  name: string;
  summary: string;
  label: string;
  tagline: string;
  audience: string;
  priceLabel: string;
  releaseChannel: string;
  details: string;
  highlights: string;
  surfaceAreas: string;
  stackItems: string;
  visibility: AppVisibility;
  featured: boolean;
};

const inputClass =
  "rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40";
const textareaClass =
  "min-h-28 rounded-[1.4rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40";

function emptyForm(): AppFormState {
  return {
    slug: "",
    name: "",
    summary: "",
    label: "",
    tagline: "",
    audience: "",
    priceLabel: "",
    releaseChannel: "",
    details: "",
    highlights: "",
    surfaceAreas: "",
    stackItems: "",
    visibility: "DRAFT",
    featured: false,
  };
}

function toForm(item: Partial<AppItem>): AppFormState {
  return {
    slug: item.slug ?? "",
    name: item.name ?? "",
    summary: item.summary ?? "",
    label: item.label ?? "",
    tagline: item.tagline ?? "",
    audience: item.audience ?? "",
    priceLabel: item.priceLabel ?? "",
    releaseChannel: item.releaseChannel ?? "",
    details: item.details ?? "",
    highlights: item.highlights ?? "",
    surfaceAreas: item.surfaceAreas ?? "",
    stackItems: item.stackItems ?? "",
    visibility: item.visibility ?? "DRAFT",
    featured: item.featured ?? false,
  };
}

export function ApplicationManager() {
  const [items, setItems] = useState<AppItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, AppFormState>>({});
  const [createForm, setCreateForm] = useState<AppFormState>(emptyForm());
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busyCreate, setBusyCreate] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const readyCount = useMemo(() => items.filter((item) => item.launchReadiness.ready).length, [items]);

  async function load() {
    const res = await fetch("/api/admin/applications", { credentials: "include" });
    if (!res.ok) {
      setError("Failed to load applications. Ensure owner login.");
      return;
    }

    const data = (await res.json()) as { items: AppItem[] };
    setItems(data.items);
    setDrafts(
      Object.fromEntries(data.items.map((item) => [item.id, toForm(item)])),
    );
  }

  useEffect(() => {
    load().catch(() => setError("Failed to load applications. Ensure owner login."));
  }, []);

  function updateCreateField<K extends keyof AppFormState>(key: K, value: AppFormState[K]) {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateDraftField(id: string, key: keyof AppFormState, value: AppFormState[keyof AppFormState]) {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? emptyForm()),
        [key]: value,
      },
    }));
  }

  async function createApp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyCreate(true);
    setError("");
    setInfo("");

    try {
      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(createForm),
      });

      if (!res.ok) {
        setError("Create failed. Check inputs and owner auth.");
        return;
      }

      setCreateForm(emptyForm());
      setInfo("Application created.");
      await load();
    } finally {
      setBusyCreate(false);
    }
  }

  async function saveApp(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const draft = drafts[id];
    if (!draft) return;

    setBusyItemId(id);
    setError("");
    setInfo("");

    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(draft),
      });

      if (!res.ok) {
        setError("Save failed. Check inputs and owner auth.");
        return;
      }

      setInfo("Application updated.");
      await load();
    } finally {
      setBusyItemId(null);
    }
  }

  async function removeApp(id: string) {
    setBusyItemId(id);
    setError("");
    setInfo("");

    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        setError("Delete failed.");
        return;
      }

      setInfo("Application deleted.");
      await load();
    } finally {
      setBusyItemId(null);
    }
  }

  async function publishApp(id: string) {
    setBusyItemId(id);
    setError("");
    setInfo("");

    try {
      const res = await fetch(`/api/admin/applications/${id}/publish`, {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        launchReadiness?: { blockers?: string[] };
      };

      if (!res.ok) {
        if (data.error === "launch_not_ready" && data.launchReadiness?.blockers?.length) {
          setError(`Publish blocked: ${data.launchReadiness.blockers.join(" ")}`);
        } else {
          setError("Publish failed.");
        }
        return;
      }

      setInfo("Application published to the public shell.");
      await load();
    } finally {
      setBusyItemId(null);
    }
  }

  return (
    <section className="surface-panel rounded-[1.8rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/70">Flagship catalog</p>
          <h2 className="display-title mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Application Manager
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Create and maintain the metadata that drives the public showcase pages: narrative, audience, pricing
            signal, release lane, and the list-based highlights used across the site.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-slate-300">
          <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3">
            {items.length} applications loaded
          </div>
          <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3">
            {readyCount} launch-ready
          </div>
        </div>
      </div>

      <form onSubmit={createApp} className="mt-6 grid gap-4 rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Create application</h3>
          <button
            type="submit"
            disabled={busyCreate}
            className="action-primary text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busyCreate ? "Creating…" : "Create app"}
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <input className={inputClass} placeholder="slug" value={createForm.slug} onChange={(event) => updateCreateField("slug", event.target.value)} />
          <input className={inputClass} placeholder="name" value={createForm.name} onChange={(event) => updateCreateField("name", event.target.value)} />
          <input className={inputClass} placeholder="label e.g. Field platform" value={createForm.label} onChange={(event) => updateCreateField("label", event.target.value)} />
          <input className={inputClass} placeholder="audience" value={createForm.audience} onChange={(event) => updateCreateField("audience", event.target.value)} />
          <input className={inputClass} placeholder="pricing label" value={createForm.priceLabel} onChange={(event) => updateCreateField("priceLabel", event.target.value)} />
          <input className={inputClass} placeholder="release channel" value={createForm.releaseChannel} onChange={(event) => updateCreateField("releaseChannel", event.target.value)} />
        </div>

        <textarea className={textareaClass} placeholder="summary" value={createForm.summary} onChange={(event) => updateCreateField("summary", event.target.value)} />
        <textarea className={textareaClass} placeholder="tagline / headline" value={createForm.tagline} onChange={(event) => updateCreateField("tagline", event.target.value)} />
        <textarea className={textareaClass} placeholder="details / operational focus" value={createForm.details} onChange={(event) => updateCreateField("details", event.target.value)} />

        <div className="grid gap-3 md:grid-cols-3">
          <textarea
            className={textareaClass}
            placeholder={"highlights, one per line\nSignal inventory\nOperator workflow"}
            value={createForm.highlights}
            onChange={(event) => updateCreateField("highlights", event.target.value)}
          />
          <textarea
            className={textareaClass}
            placeholder={"surface areas, one per line\nAssessment cockpit\nReport packaging"}
            value={createForm.surfaceAreas}
            onChange={(event) => updateCreateField("surfaceAreas", event.target.value)}
          />
          <textarea
            className={textareaClass}
            placeholder={"stack items, one per line\nNext.js\nPrisma"}
            value={createForm.stackItems}
            onChange={(event) => updateCreateField("stackItems", event.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
          <label className="flex items-center gap-2">
            <span>Visibility</span>
            <select
              className={inputClass}
              value={createForm.visibility}
              onChange={(event) => updateCreateField("visibility", event.target.value as AppVisibility)}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLIC">PUBLIC</option>
              <option value="PRIVATE">PRIVATE</option>
            </select>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={createForm.featured}
              onChange={(event) => updateCreateField("featured", event.target.checked)}
            />
            <span>Featured</span>
          </label>
        </div>
      </form>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      {!error && info ? <p className="mt-4 text-sm text-cyan-200">{info}</p> : null}

      <div className="mt-6 grid gap-4">
        {items.map((item) => {
          const draft = drafts[item.id] ?? toForm(item);
          const busy = busyItemId === item.id;
          const readiness = item.launchReadiness;
          const publicHref = `/applications/${item.slug}`;

          return (
            <form
              key={item.id}
              id={`application-${item.id}`}
              onSubmit={(event) => void saveApp(event, item.id)}
              className="rounded-[1.6rem] border border-white/8 bg-slate-950/40 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="display-title text-2xl font-semibold tracking-[-0.04em] text-white">{item.name}</h3>
                  <p className="mt-2 text-xs uppercase tracking-[0.26em] text-slate-500">{item.slug}</p>
                  <p className="mt-3 text-sm text-slate-400">
                    {readiness.counts.versions} versions
                    {" / "}
                    {readiness.counts.media} media
                    {" / "}
                    {readiness.counts.publicAssets + readiness.counts.entitledAssets} distributable assets
                    {item.featured ? " / featured" : ""}
                    {" / "}
                    {item.visibility.toLowerCase()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                      readiness.ready
                        ? "border border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                        : "border border-amber-300/30 bg-amber-300/10 text-amber-100"
                    }`}
                  >
                    {readiness.ready ? "Launch ready" : "Needs launch work"}
                  </span>
                  <button
                    type="submit"
                    disabled={busy}
                    className="action-secondary text-xs disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? "Saving…" : "Save"}
                  </button>
                  {item.visibility !== "PUBLIC" ? (
                    <button
                      type="button"
                      disabled={busy || !readiness.ready}
                      onClick={() => void publishApp(item.id)}
                      className="action-primary text-xs disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Publish
                    </button>
                  ) : (
                    <Link href={publicHref} className="action-primary text-xs" target="_blank" rel="noreferrer">
                      View public
                    </Link>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void removeApp(item.id)}
                    className="rounded-full border border-red-400/30 bg-red-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[0.78fr_0.22fr]">
                <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[0.72rem] uppercase tracking-[0.24em] text-slate-500">Launch blockers</p>
                  {readiness.blockers.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {readiness.blockers.map((blocker) => (
                        <span
                          key={blocker}
                          className="rounded-full border border-amber-300/20 bg-amber-300/8 px-3 py-1 text-xs text-amber-100"
                        >
                          {blocker}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-emerald-200">Ready to publish.</p>
                  )}
                  {readiness.warnings.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-[0.72rem] uppercase tracking-[0.24em] text-slate-500">Warnings</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {readiness.warnings.map((warning) => (
                          <span
                            key={warning}
                            className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs text-slate-300"
                          >
                            {warning}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Link href="/admin/media" className="action-secondary justify-center text-xs">
                    Open media
                  </Link>
                  <Link href="/admin/releases" className="action-secondary justify-center text-xs">
                    Open releases
                  </Link>
                  {item.visibility === "PUBLIC" ? (
                    <Link href={publicHref} className="action-secondary justify-center text-xs" target="_blank" rel="noreferrer">
                      Preview route
                    </Link>
                  ) : (
                    <div className="rounded-full border border-white/10 px-4 py-2 text-center text-[0.68rem] uppercase tracking-[0.18em] text-slate-500">
                      Public preview after publish
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <input className={inputClass} value={draft.slug} onChange={(event) => updateDraftField(item.id, "slug", event.target.value)} />
                <input className={inputClass} value={draft.name} onChange={(event) => updateDraftField(item.id, "name", event.target.value)} />
                <input className={inputClass} value={draft.label} onChange={(event) => updateDraftField(item.id, "label", event.target.value)} placeholder="label" />
                <input className={inputClass} value={draft.audience} onChange={(event) => updateDraftField(item.id, "audience", event.target.value)} placeholder="audience" />
                <input className={inputClass} value={draft.priceLabel} onChange={(event) => updateDraftField(item.id, "priceLabel", event.target.value)} placeholder="pricing label" />
                <input className={inputClass} value={draft.releaseChannel} onChange={(event) => updateDraftField(item.id, "releaseChannel", event.target.value)} placeholder="release channel" />
              </div>

              <div className="mt-3 grid gap-3">
                <textarea className={textareaClass} value={draft.summary} onChange={(event) => updateDraftField(item.id, "summary", event.target.value)} placeholder="summary" />
                <textarea className={textareaClass} value={draft.tagline} onChange={(event) => updateDraftField(item.id, "tagline", event.target.value)} placeholder="tagline / headline" />
                <textarea className={textareaClass} value={draft.details} onChange={(event) => updateDraftField(item.id, "details", event.target.value)} placeholder="details / operational focus" />
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <textarea
                  className={textareaClass}
                  value={draft.highlights}
                  onChange={(event) => updateDraftField(item.id, "highlights", event.target.value)}
                  placeholder={"highlights, one per line\nSignal inventory"}
                />
                <textarea
                  className={textareaClass}
                  value={draft.surfaceAreas}
                  onChange={(event) => updateDraftField(item.id, "surfaceAreas", event.target.value)}
                  placeholder={"surface areas, one per line\nAssessment cockpit"}
                />
                <textarea
                  className={textareaClass}
                  value={draft.stackItems}
                  onChange={(event) => updateDraftField(item.id, "stackItems", event.target.value)}
                  placeholder={"stack items, one per line\nNext.js"}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <label className="flex items-center gap-2">
                  <span>Visibility</span>
                  <select
                    className={inputClass}
                    value={draft.visibility}
                    onChange={(event) => updateDraftField(item.id, "visibility", event.target.value as AppVisibility)}
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLIC">PUBLIC</option>
                    <option value="PRIVATE">PRIVATE</option>
                  </select>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={draft.featured}
                    onChange={(event) => updateDraftField(item.id, "featured", event.target.checked)}
                  />
                  <span>Featured</span>
                </label>
              </div>
            </form>
          );
        })}
      </div>
    </section>
  );
}
