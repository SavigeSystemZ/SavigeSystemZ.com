"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { archiveCategoryLabels, archiveCategoryOptions, archiveCategoryThemes, type ArchiveCategoryRecord } from "@/lib/archive-taxonomy";

type ArchiveVisibility = "PUBLIC" | "PRIVATE" | "DRAFT";

type ArchiveItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: ArchiveCategoryRecord;
  visibility: ArchiveVisibility;
  featured: boolean;
  stageLabel?: string | null;
  artifactFormat?: string | null;
  previewImageUrl?: string | null;
  previewThumbnailUrl?: string | null;
  details?: string | null;
  tags?: string | null;
  stackItems?: string | null;
  artifactUrl?: string | null;
  artifactLabel?: string | null;
  createdAt: string;
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

type ArchiveFormState = {
  slug: string;
  title: string;
  summary: string;
  category: ArchiveCategoryRecord;
  visibility: ArchiveVisibility;
  featured: boolean;
  stageLabel: string;
  artifactFormat: string;
  previewImageUrl: string;
  previewThumbnailUrl: string;
  details: string;
  tags: string;
  stackItems: string;
  artifactUrl: string;
  artifactLabel: string;
};

const inputClass =
  "rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40";
const textareaClass =
  "min-h-28 rounded-[1.4rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40";

function emptyForm(): ArchiveFormState {
  return {
    slug: "",
    title: "",
    summary: "",
    category: "OPERATING_SYSTEM",
    visibility: "DRAFT",
    featured: false,
    stageLabel: "",
    artifactFormat: "",
    previewImageUrl: "",
    previewThumbnailUrl: "",
    details: "",
    tags: "",
    stackItems: "",
    artifactUrl: "",
    artifactLabel: "",
  };
}

function toForm(item: Partial<ArchiveItem>): ArchiveFormState {
  return {
    slug: item.slug ?? "",
    title: item.title ?? "",
    summary: item.summary ?? "",
    category: item.category ?? "OPERATING_SYSTEM",
    visibility: item.visibility ?? "DRAFT",
    featured: item.featured ?? false,
    stageLabel: item.stageLabel ?? "",
    artifactFormat: item.artifactFormat ?? "",
    previewImageUrl: item.previewImageUrl ?? "",
    previewThumbnailUrl: item.previewThumbnailUrl ?? "",
    details: item.details ?? "",
    tags: item.tags ?? "",
    stackItems: item.stackItems ?? "",
    artifactUrl: item.artifactUrl ?? "",
    artifactLabel: item.artifactLabel ?? "",
  };
}

function trimOptional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildPayload(form: ArchiveFormState): Record<string, unknown> {
  return {
    slug: form.slug,
    title: form.title,
    summary: form.summary,
    category: form.category,
    visibility: form.visibility,
    featured: form.featured,
    stageLabel: trimOptional(form.stageLabel),
    artifactFormat: trimOptional(form.artifactFormat),
    previewImageUrl: trimOptional(form.previewImageUrl),
    previewThumbnailUrl: trimOptional(form.previewThumbnailUrl),
    details: trimOptional(form.details),
    tags: trimOptional(form.tags),
    stackItems: trimOptional(form.stackItems),
    artifactUrl: trimOptional(form.artifactUrl),
    artifactLabel: trimOptional(form.artifactLabel),
  };
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type LaunchComposerState = {
  slug: string;
  title: string;
  summary: string;
  category: ArchiveCategoryRecord;
  featured: boolean;
  stageLabel: string;
  artifactFormat: string;
  details: string;
  artifactUrl: string;
  artifactLabel: string;
  previewImageUrl: string;
  previewThumbnailUrl: string;
  tags: string;
  stackItems: string;
  publishAfterCreate: boolean;
};

function emptyComposer(): LaunchComposerState {
  return {
    slug: "",
    title: "",
    summary: "",
    category: "OPERATING_SYSTEM",
    featured: false,
    stageLabel: "",
    artifactFormat: "",
    details: "",
    artifactUrl: "",
    artifactLabel: "",
    previewImageUrl: "",
    previewThumbnailUrl: "",
    tags: "",
    stackItems: "",
    publishAfterCreate: false,
  };
}

export function ArchiveManager() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ArchiveFormState>>({});
  const [createForm, setCreateForm] = useState<ArchiveFormState>(emptyForm());
  const [composer, setComposer] = useState<LaunchComposerState>(emptyComposer());
  const [composerOpen, setComposerOpen] = useState(false);
  const [busyComposer, setBusyComposer] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busyCreate, setBusyCreate] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  const featuredCount = useMemo(() => items.filter((item) => item.featured).length, [items]);
  const readyCount = useMemo(() => items.filter((item) => item.launchReadiness.ready).length, [items]);

  async function load() {
    const res = await fetch("/api/admin/archive", { credentials: "include" });
    if (!res.ok) {
      setError("Failed to load archive entries. Ensure owner login.");
      return;
    }

    const data = (await res.json()) as { items: ArchiveItem[] };
    setItems(data.items);
    setDrafts(Object.fromEntries(data.items.map((item) => [item.id, toForm(item)])));
  }

  useEffect(() => {
    load().catch(() => setError("Failed to load archive entries. Ensure owner login."));
  }, []);

  function updateComposerField<K extends keyof LaunchComposerState>(key: K, value: LaunchComposerState[K]) {
    setComposer((prev) => ({ ...prev, [key]: value }));
  }

  async function composeLaunch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyComposer(true);
    setError("");
    setInfo("");

    try {
      const body = {
        slug: composer.slug,
        title: composer.title,
        summary: composer.summary,
        category: composer.category,
        featured: composer.featured,
        stageLabel: composer.stageLabel,
        artifactFormat: composer.artifactFormat,
        details: composer.details,
        artifactUrl: composer.artifactUrl,
        artifactLabel: trimOptional(composer.artifactLabel),
        previewImageUrl: trimOptional(composer.previewImageUrl),
        previewThumbnailUrl: trimOptional(composer.previewThumbnailUrl),
        tags: trimOptional(composer.tags),
        stackItems: trimOptional(composer.stackItems),
        publishAfterCreate: composer.publishAfterCreate,
      };

      const res = await fetch("/api/admin/archive/launch-compose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        published?: boolean;
        launchReadiness?: { blockers?: string[]; warnings?: string[] };
      };

      if (!res.ok) {
        if (data.error === "slug_exists") {
          setError(`Slug "${composer.slug}" already exists. Choose a different slug.`);
        } else if (data.error === "invalid_payload") {
          setError("Validation failed. Check all required fields.");
        } else {
          setError("Launch composition failed.");
        }
        return;
      }

      const publishNote = data.published
        ? " Entry auto-published to public shell."
        : composer.publishAfterCreate
          ? " Entry created as draft — blockers remain."
          : " Entry created as draft.";
      setInfo(`Archive launch composed.${publishNote}`);
      setComposer(emptyComposer());
      setComposerOpen(false);
      await load();
    } finally {
      setBusyComposer(false);
    }
  }

  function updateCreateField<K extends keyof ArchiveFormState>(key: K, value: ArchiveFormState[K]) {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateDraftField<K extends keyof ArchiveFormState>(id: string, key: K, value: ArchiveFormState[K]) {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? emptyForm()),
        [key]: value,
      },
    }));
  }

  async function createEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyCreate(true);
    setError("");
    setInfo("");

    try {
      const res = await fetch("/api/admin/archive", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(buildPayload(createForm)),
      });

      if (!res.ok) {
        setError("Create failed. Check inputs and owner auth.");
        return;
      }

      setCreateForm(emptyForm());
      setInfo("Archive entry created.");
      await load();
    } finally {
      setBusyCreate(false);
    }
  }

  async function saveEntry(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const draft = drafts[id];
    if (!draft) return;

    setBusyItemId(id);
    setError("");
    setInfo("");

    try {
      const res = await fetch(`/api/admin/archive/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(buildPayload(draft)),
      });

      if (!res.ok) {
        setError("Save failed. Check inputs and owner auth.");
        return;
      }

      setInfo("Archive entry updated.");
      await load();
    } finally {
      setBusyItemId(null);
    }
  }

  async function removeEntry(id: string) {
    setBusyItemId(id);
    setError("");
    setInfo("");

    try {
      const res = await fetch(`/api/admin/archive/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        setError("Delete failed.");
        return;
      }

      setInfo("Archive entry deleted.");
      await load();
    } finally {
      setBusyItemId(null);
    }
  }

  async function publishEntry(id: string) {
    setBusyItemId(id);
    setError("");
    setInfo("");

    try {
      const res = await fetch(`/api/admin/archive/${id}/publish`, {
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

      setInfo("Archive entry published to the public shell.");
      await load();
    } finally {
      setBusyItemId(null);
    }
  }

  return (
    <section className="surface-panel rounded-[1.8rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/70">Engineering archive</p>
          <h2 className="display-title mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Archive Manager
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Publish and maintain the broader foundry output: Linux builds, config layers, container packs, research,
            security tooling, model work, and other high-signal archive entries.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-slate-300">
          <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3">
            {items.length} archive entries
          </div>
          <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3">
            {featuredCount} featured
          </div>
          <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3">
            {readyCount} launch-ready
          </div>
        </div>
      </div>

      {/* Launch composer — guided draft-to-publish flow */}
      <div className="mt-6 rounded-[1.6rem] border border-cyan-300/20 bg-cyan-950/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-cyan-100/70">Guided launch</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Archive Launch Composer</h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Fill in all launch-required fields in one pass. Optionally auto-publish when all blockers clear.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setComposerOpen((prev) => !prev)}
            className="action-primary text-xs"
          >
            {composerOpen ? "Close composer" : "Open composer"}
          </button>
        </div>

        {composerOpen ? (
          <form onSubmit={(event) => void composeLaunch(event)} className="mt-5 grid gap-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <input
                className={inputClass}
                placeholder="slug (e.g. signal-os-build-kit)"
                value={composer.slug}
                onChange={(event) => updateComposerField("slug", event.target.value)}
                required
              />
              <input
                className={inputClass}
                placeholder="title"
                value={composer.title}
                onChange={(event) => updateComposerField("title", event.target.value)}
                required
              />
              <label className="grid gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                Category
                <select
                  className={inputClass}
                  value={composer.category}
                  onChange={(event) => updateComposerField("category", event.target.value as ArchiveCategoryRecord)}
                >
                  {archiveCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {archiveCategoryLabels[option]}
                    </option>
                  ))}
                </select>
              </label>
              <input
                className={inputClass}
                placeholder="stage label (required)"
                value={composer.stageLabel}
                onChange={(event) => updateComposerField("stageLabel", event.target.value)}
                required
              />
            </div>

            <textarea
              className={textareaClass}
              placeholder="summary (10-500 chars)"
              value={composer.summary}
              onChange={(event) => updateComposerField("summary", event.target.value)}
              required
            />
            <textarea
              className={`${textareaClass} min-h-40`}
              placeholder="details / long-form framing (20-4000 chars, required for launch)"
              value={composer.details}
              onChange={(event) => updateComposerField("details", event.target.value)}
              required
            />

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <input
                className={inputClass}
                placeholder="artifact format (required)"
                value={composer.artifactFormat}
                onChange={(event) => updateComposerField("artifactFormat", event.target.value)}
                required
              />
              <input
                className={inputClass}
                placeholder="artifact URL (required)"
                value={composer.artifactUrl}
                onChange={(event) => updateComposerField("artifactUrl", event.target.value)}
                required
              />
              <input
                className={inputClass}
                placeholder="artifact label (optional CTA)"
                value={composer.artifactLabel}
                onChange={(event) => updateComposerField("artifactLabel", event.target.value)}
              />
              <input
                className={inputClass}
                placeholder="preview image URL (optional)"
                value={composer.previewImageUrl}
                onChange={(event) => updateComposerField("previewImageUrl", event.target.value)}
              />
              <input
                className={inputClass}
                placeholder="preview thumbnail URL (optional)"
                value={composer.previewThumbnailUrl}
                onChange={(event) => updateComposerField("previewThumbnailUrl", event.target.value)}
              />
              <textarea
                className={textareaClass}
                placeholder={"tags, one per line\nLinux build\nBootstrap"}
                value={composer.tags}
                onChange={(event) => updateComposerField("tags", event.target.value)}
              />
              <textarea
                className={textareaClass}
                placeholder={"stack items, one per line\nBash\nsystemd"}
                value={composer.stackItems}
                onChange={(event) => updateComposerField("stackItems", event.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100">
                <input
                  type="checkbox"
                  checked={composer.featured}
                  onChange={(event) => updateComposerField("featured", event.target.checked)}
                />
                Mark as featured
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-950/30 px-4 py-3 text-sm text-cyan-100">
                <input
                  type="checkbox"
                  checked={composer.publishAfterCreate}
                  onChange={(event) => updateComposerField("publishAfterCreate", event.target.checked)}
                />
                Auto-publish when blockers clear
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={busyComposer}
                className="action-primary text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busyComposer ? "Composing launch…" : "Compose launch"}
              </button>
            </div>
          </form>
        ) : null}
      </div>

      <form
        onSubmit={createEntry}
        className="mt-6 grid gap-4 rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Create archive entry</h3>
          <button
            type="submit"
            disabled={busyCreate}
            className="action-primary text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busyCreate ? "Creating…" : "Create entry"}
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            className={inputClass}
            placeholder="slug"
            value={createForm.slug}
            onChange={(event) => updateCreateField("slug", event.target.value)}
          />
          <input
            className={inputClass}
            placeholder="title"
            value={createForm.title}
            onChange={(event) => updateCreateField("title", event.target.value)}
          />
          <label className="grid gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
            Category
            <select
              className={inputClass}
              value={createForm.category}
              onChange={(event) => updateCreateField("category", event.target.value as ArchiveCategoryRecord)}
            >
              {archiveCategoryOptions.map((option) => (
                <option key={option} value={option}>
                  {archiveCategoryLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
            Visibility
            <select
              className={inputClass}
              value={createForm.visibility}
              onChange={(event) => updateCreateField("visibility", event.target.value as ArchiveVisibility)}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLIC">PUBLIC</option>
              <option value="PRIVATE">PRIVATE</option>
            </select>
          </label>
        </div>

        <textarea
          className={textareaClass}
          placeholder="summary"
          value={createForm.summary}
          onChange={(event) => updateCreateField("summary", event.target.value)}
        />
        <textarea
          className={textareaClass}
          placeholder="details / long-form framing"
          value={createForm.details}
          onChange={(event) => updateCreateField("details", event.target.value)}
        />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            className={inputClass}
            placeholder="stage label"
            value={createForm.stageLabel}
            onChange={(event) => updateCreateField("stageLabel", event.target.value)}
          />
          <input
            className={inputClass}
            placeholder="artifact format"
            value={createForm.artifactFormat}
            onChange={(event) => updateCreateField("artifactFormat", event.target.value)}
          />
          <input
            className={inputClass}
            placeholder="preview image URL"
            value={createForm.previewImageUrl}
            onChange={(event) => updateCreateField("previewImageUrl", event.target.value)}
          />
          <input
            className={inputClass}
            placeholder="preview thumbnail URL"
            value={createForm.previewThumbnailUrl}
            onChange={(event) => updateCreateField("previewThumbnailUrl", event.target.value)}
          />
          <input
            className={inputClass}
            placeholder="artifact URL"
            value={createForm.artifactUrl}
            onChange={(event) => updateCreateField("artifactUrl", event.target.value)}
          />
          <input
            className={inputClass}
            placeholder="artifact label"
            value={createForm.artifactLabel}
            onChange={(event) => updateCreateField("artifactLabel", event.target.value)}
          />
          <textarea
            className={textareaClass}
            placeholder={"tags, one per line\nLinux build\nBootstrap"}
            value={createForm.tags}
            onChange={(event) => updateCreateField("tags", event.target.value)}
          />
          <textarea
            className={textareaClass}
            placeholder={"stack items, one per line\nBash\nsystemd"}
            value={createForm.stackItems}
            onChange={(event) => updateCreateField("stackItems", event.target.value)}
          />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100">
          <input
            type="checkbox"
            checked={createForm.featured}
            onChange={(event) => updateCreateField("featured", event.target.checked)}
          />
          Mark as featured
        </label>
      </form>

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      {info ? <p className="mt-4 text-sm text-cyan-100">{info}</p> : null}

      <div className="mt-6 grid gap-4">
        {items.map((item) => {
          const draft = drafts[item.id] ?? toForm(item);
          const busy = busyItemId === item.id;
          const theme = archiveCategoryThemes[draft.category];
          const previewUrl = draft.previewThumbnailUrl || draft.previewImageUrl;
          const readiness = item.launchReadiness;
          const publicHref = `/archive/${item.slug}`;

          return (
            <form
              key={item.id}
              id={`archive-entry-${item.id}`}
              onSubmit={(event) => void saveEntry(event, item.id)}
              className="grid gap-4 rounded-[1.7rem] border border-white/8 bg-white/[0.03] p-5 xl:grid-cols-[0.78fr_1.22fr]"
            >
              <div className="grid gap-4">
                <div className={`relative min-h-[15rem] overflow-hidden rounded-[1.5rem] border border-white/8 ${theme}`}>
                  {previewUrl ? (
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${previewUrl})` }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.86)_84%)]" />
                  <div className="relative flex min-h-[15rem] flex-col justify-end p-5">
                    <p className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-200/80">
                      {archiveCategoryLabels[draft.category]}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">{draft.title || item.title}</p>
                    <p className="mt-2 text-sm text-slate-300">{draft.stageLabel || item.stageLabel || "Archive lane"}</p>
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-white/8 bg-slate-950/60 p-4 text-sm text-slate-300">
                  <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Created</p>
                  <p className="mt-2 text-slate-100">{formatDate(item.createdAt)}</p>
                  <p className="mt-4 text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Visibility</p>
                  <p className="mt-2 text-slate-100">{draft.visibility}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.72rem] uppercase tracking-[0.28em] text-cyan-100/70">
                      {draft.featured ? "Featured archive" : "Archive entry"}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{draft.title || item.title}</h3>
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
                    {item.visibility !== "PUBLIC" ? (
                      <button
                        type="button"
                        disabled={busy || !readiness.ready}
                        onClick={() => void publishEntry(item.id)}
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
                      onClick={() => void removeEntry(item.id)}
                      disabled={busy}
                      className="action-secondary text-xs disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[0.78fr_0.22fr]">
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
                    <Link href="/admin/archive" className="action-secondary justify-center text-xs">
                      Archive console
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

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <input
                    className={inputClass}
                    placeholder="slug"
                    value={draft.slug}
                    onChange={(event) => updateDraftField(item.id, "slug", event.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="title"
                    value={draft.title}
                    onChange={(event) => updateDraftField(item.id, "title", event.target.value)}
                  />
                  <label className="grid gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                    Category
                    <select
                      className={inputClass}
                      value={draft.category}
                      onChange={(event) => updateDraftField(item.id, "category", event.target.value as ArchiveCategoryRecord)}
                    >
                      {archiveCategoryOptions.map((option) => (
                        <option key={option} value={option}>
                          {archiveCategoryLabels[option]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                    Visibility
                    <select
                      className={inputClass}
                      value={draft.visibility}
                      onChange={(event) => updateDraftField(item.id, "visibility", event.target.value as ArchiveVisibility)}
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="PUBLIC">PUBLIC</option>
                      <option value="PRIVATE">PRIVATE</option>
                    </select>
                  </label>
                </div>

                <textarea
                  className={textareaClass}
                  placeholder="summary"
                  value={draft.summary}
                  onChange={(event) => updateDraftField(item.id, "summary", event.target.value)}
                />
                <textarea
                  className={textareaClass}
                  placeholder="details"
                  value={draft.details}
                  onChange={(event) => updateDraftField(item.id, "details", event.target.value)}
                />

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <input
                    className={inputClass}
                    placeholder="stage label"
                    value={draft.stageLabel}
                    onChange={(event) => updateDraftField(item.id, "stageLabel", event.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="artifact format"
                    value={draft.artifactFormat}
                    onChange={(event) => updateDraftField(item.id, "artifactFormat", event.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="preview image URL"
                    value={draft.previewImageUrl}
                    onChange={(event) => updateDraftField(item.id, "previewImageUrl", event.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="preview thumbnail URL"
                    value={draft.previewThumbnailUrl}
                    onChange={(event) => updateDraftField(item.id, "previewThumbnailUrl", event.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="artifact URL"
                    value={draft.artifactUrl}
                    onChange={(event) => updateDraftField(item.id, "artifactUrl", event.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="artifact label"
                    value={draft.artifactLabel}
                    onChange={(event) => updateDraftField(item.id, "artifactLabel", event.target.value)}
                  />
                  <textarea
                    className={textareaClass}
                    placeholder={"tags, one per line\nResearch\nBooks"}
                    value={draft.tags}
                    onChange={(event) => updateDraftField(item.id, "tags", event.target.value)}
                  />
                  <textarea
                    className={textareaClass}
                    placeholder={"stack items, one per line\nMarkdown\nReview passes"}
                    value={draft.stackItems}
                    onChange={(event) => updateDraftField(item.id, "stackItems", event.target.value)}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100">
                    <input
                      type="checkbox"
                      checked={draft.featured}
                      onChange={(event) => updateDraftField(item.id, "featured", event.target.checked)}
                    />
                    Featured
                  </label>
                  <button
                    type="submit"
                    disabled={busy}
                    className="action-primary text-xs disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? "Saving…" : "Save entry"}
                  </button>
                </div>
              </div>
            </form>
          );
        })}
      </div>
    </section>
  );
}
