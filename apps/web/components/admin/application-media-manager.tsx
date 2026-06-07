"use client";

import { useEffect, useMemo, useState } from "react";

type AppItem = {
  id: string;
  slug: string;
  name: string;
  visibility: "PUBLIC" | "PRIVATE" | "DRAFT";
  featured: boolean;
};

type MediaItem = {
  id: string;
  applicationId: string;
  title: string;
  altText: string;
  description?: string | null;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  s3Bucket?: string | null;
  s3Key?: string | null;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  application: AppItem;
};

type MediaFormState = {
  applicationId: string;
  title: string;
  altText: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl: string;
  s3Bucket: string;
  s3Key: string;
  featured: boolean;
  sortOrder: number;
};

type UploadSlot = {
  uploadUrl: string;
  bucket: string;
  key: string;
  fileUrl: string;
  fileName: string;
  expiresInSeconds: number;
};

const inputClass =
  "rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40";
const textareaClass =
  "min-h-28 rounded-[1.4rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40";

function emptyForm(applicationId = ""): MediaFormState {
  return {
    applicationId,
    title: "",
    altText: "",
    description: "",
    mediaUrl: "",
    thumbnailUrl: "",
    s3Bucket: "",
    s3Key: "",
    featured: false,
    sortOrder: 0,
  };
}

function toForm(item: Partial<MediaItem>): MediaFormState {
  return {
    applicationId: item.applicationId ?? "",
    title: item.title ?? "",
    altText: item.altText ?? "",
    description: item.description ?? "",
    mediaUrl: item.mediaUrl ?? "",
    thumbnailUrl: item.thumbnailUrl ?? "",
    s3Bucket: item.s3Bucket ?? "",
    s3Key: item.s3Key ?? "",
    featured: item.featured ?? false,
    sortOrder: item.sortOrder ?? 0,
  };
}

function trimOptional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildPayload(form: MediaFormState): Record<string, unknown> {
  return {
    applicationId: form.applicationId,
    title: form.title,
    altText: form.altText,
    description: trimOptional(form.description),
    mediaUrl: form.mediaUrl,
    thumbnailUrl: trimOptional(form.thumbnailUrl),
    s3Bucket: trimOptional(form.s3Bucket),
    s3Key: trimOptional(form.s3Key),
    featured: form.featured,
    sortOrder: form.sortOrder,
  };
}

function backgroundStyle(url: string) {
  return { backgroundImage: `url(${url})` };
}

export function ApplicationMediaManager() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, MediaFormState>>({});
  const [createForm, setCreateForm] = useState<MediaFormState>(emptyForm());
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSlot, setUploadSlot] = useState<UploadSlot | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busyCreate, setBusyCreate] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [busyUpload, setBusyUpload] = useState(false);

  const featuredCount = useMemo(() => items.filter((item) => item.featured).length, [items]);

  async function load() {
    const [appRes, mediaRes] = await Promise.all([
      fetch("/api/admin/applications", { credentials: "include" }),
      fetch("/api/admin/application-media", { credentials: "include" }),
    ]);

    if (!appRes.ok || !mediaRes.ok) {
      setError("Failed to load media data. Ensure owner login.");
      return;
    }

    const appData = (await appRes.json()) as { items: AppItem[] };
    const mediaData = (await mediaRes.json()) as { items: MediaItem[] };

    setApps(appData.items);
    setItems(mediaData.items);
    setDrafts(Object.fromEntries(mediaData.items.map((item) => [item.id, toForm(item)])));
    setCreateForm((current) => {
      if (appData.items.length === 0) return current;
      const hasSelectedApp = appData.items.some((app) => app.id === current.applicationId);
      return hasSelectedApp ? current : { ...current, applicationId: appData.items[0].id };
    });
  }

  useEffect(() => {
    load().catch(() => setError("Failed to load media data. Ensure owner login."));
  }, []);

  function updateCreateField<K extends keyof MediaFormState>(key: K, value: MediaFormState[K]) {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateDraftField<K extends keyof MediaFormState>(id: string, key: K, value: MediaFormState[K]) {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? emptyForm()),
        [key]: value,
      },
    }));
  }

  async function createMedia(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyCreate(true);
    setError("");
    setInfo("");

    try {
      const res = await fetch("/api/admin/application-media", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(buildPayload(createForm)),
      });

      if (!res.ok) {
        setError("Create failed. Check inputs and owner auth.");
        return;
      }

      setCreateForm(emptyForm(createForm.applicationId));
      setUploadFile(null);
      setUploadSlot(null);
      setUploadMessage("");
      setInfo("Media entry created.");
      await load();
    } finally {
      setBusyCreate(false);
    }
  }

  async function saveMedia(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const draft = drafts[id];
    if (!draft) return;

    setBusyItemId(id);
    setError("");
    setInfo("");

    try {
      const res = await fetch(`/api/admin/application-media/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(buildPayload(draft)),
      });

      if (!res.ok) {
        setError("Save failed. Check inputs and owner auth.");
        return;
      }

      setInfo("Media entry updated.");
      await load();
    } finally {
      setBusyItemId(null);
    }
  }

  async function removeMedia(id: string) {
    setBusyItemId(id);
    setError("");
    setInfo("");

    try {
      const res = await fetch(`/api/admin/application-media/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        setError("Delete failed.");
        return;
      }

      setInfo("Media entry deleted.");
      await load();
    } finally {
      setBusyItemId(null);
    }
  }

  async function setCatalogScreenshot(id: string) {
    setBusyItemId(id);
    setError("");
    setInfo("");

    try {
      const res = await fetch(`/api/admin/application-media/${id}/set-catalog-screenshot`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        setError("Could not promote media to catalog screenshot.");
        return;
      }

      setInfo("Set as primary catalog screenshot.");
      await load();
    } finally {
      setBusyItemId(null);
    }
  }

  async function uploadToS3() {
    if (!uploadFile) {
      setError("Choose a media file before uploading.");
      return;
    }
    if (!createForm.applicationId) {
      setError("Select an application before uploading.");
      return;
    }

    setBusyUpload(true);
    setError("");
    setInfo("");
    setUploadMessage("");

    try {
      const res = await fetch("/api/admin/application-media/s3-upload-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          applicationId: createForm.applicationId,
          fileName: uploadFile.name,
          contentType: uploadFile.type || undefined,
        }),
      });

      const data = (await res.json()) as
        | ({ error?: string; message?: string } & Partial<UploadSlot>)
        | { error?: string; message?: string };

      if (!res.ok || !("uploadUrl" in data) || typeof data.uploadUrl !== "string") {
        setError(data.message ?? "Failed to create media upload URL.");
        return;
      }

      const putRes = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: uploadFile.type ? { "content-type": uploadFile.type } : undefined,
        body: uploadFile,
      });

      if (!putRes.ok) {
        setError("Upload failed while sending the file to storage.");
        return;
      }

      const slot = data as UploadSlot;
      setUploadSlot(slot);
      setUploadMessage(`Uploaded ${slot.fileName} to ${slot.bucket}.`);
      setCreateForm((prev) => ({
        ...prev,
        mediaUrl: slot.fileUrl,
        thumbnailUrl: prev.thumbnailUrl || slot.fileUrl,
        s3Bucket: slot.bucket,
        s3Key: slot.key,
      }));
      setInfo("Media upload complete.");
    } finally {
      setBusyUpload(false);
    }
  }

  return (
    <section className="surface-panel rounded-[1.8rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/70">Visual control lane</p>
          <h2 className="display-title mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Application Media Manager
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Curate screenshots, showcase art, branded visuals, and flagship gallery frames for each public
            application. This is the layer that turns text-only catalog entries into visual systems.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-slate-300">
          <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3">
            {items.length} media items
          </div>
          <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3">
            {featuredCount} featured
          </div>
        </div>
      </div>

      <form
        onSubmit={createMedia}
        className="mt-6 grid gap-4 rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Create media</h3>
          <button
            type="submit"
            disabled={busyCreate}
            className="action-primary text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busyCreate ? "Creating…" : "Create media"}
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
            Application
            <select
              className={inputClass}
              value={createForm.applicationId}
              onChange={(event) => updateCreateField("applicationId", event.target.value)}
            >
              {apps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </label>
          <input
            className={inputClass}
            placeholder="title"
            value={createForm.title}
            onChange={(event) => updateCreateField("title", event.target.value)}
          />
          <input
            className={inputClass}
            placeholder="media URL or /showcase/file.svg"
            value={createForm.mediaUrl}
            onChange={(event) => updateCreateField("mediaUrl", event.target.value)}
          />
          <input
            className={inputClass}
            placeholder="thumbnail URL (optional)"
            value={createForm.thumbnailUrl}
            onChange={(event) => updateCreateField("thumbnailUrl", event.target.value)}
          />
        </div>

        <input
          className={inputClass}
          placeholder="alt text"
          value={createForm.altText}
          onChange={(event) => updateCreateField("altText", event.target.value)}
        />
        <textarea
          className={textareaClass}
          placeholder="description / positioning"
          value={createForm.description}
          onChange={(event) => updateCreateField("description", event.target.value)}
        />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            className={inputClass}
            placeholder="sort order"
            type="number"
            min={0}
            max={10000}
            value={createForm.sortOrder}
            onChange={(event) => updateCreateField("sortOrder", Number(event.target.value) || 0)}
          />
          <input
            className={inputClass}
            placeholder="S3 bucket"
            value={createForm.s3Bucket}
            onChange={(event) => updateCreateField("s3Bucket", event.target.value)}
          />
          <input
            className={inputClass}
            placeholder="S3 key"
            value={createForm.s3Key}
            onChange={(event) => updateCreateField("s3Key", event.target.value)}
          />
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100">
            <input
              type="checkbox"
              checked={createForm.featured}
              onChange={(event) => updateCreateField("featured", event.target.checked)}
            />
            Mark as featured
          </label>
        </div>

        <div className="rounded-[1.5rem] border border-dashed border-cyan-300/18 bg-slate-950/50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100/70">
                Upload media to S3
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Use the owner upload lane for real screenshots or artwork. The create form will be prefilled with the
                resulting object URL and bucket metadata.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void uploadToS3()}
              disabled={busyUpload}
              className="action-secondary text-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busyUpload ? "Uploading…" : "Upload asset"}
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              className={`${inputClass} file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-slate-100`}
              type="file"
              accept="image/*,.svg"
              onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
            />
            {uploadSlot ? (
              <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                {uploadSlot.bucket}
              </div>
            ) : null}
          </div>
          {uploadMessage ? <p className="mt-3 text-sm text-cyan-100/80">{uploadMessage}</p> : null}
        </div>
      </form>

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      {info ? <p className="mt-4 text-sm text-cyan-100">{info}</p> : null}

      <div className="mt-6 grid gap-4">
        {items.map((item) => {
          const draft = drafts[item.id] ?? toForm(item);
          const busy = busyItemId === item.id;

          return (
            <form
              key={item.id}
              onSubmit={(event) => void saveMedia(event, item.id)}
              className="grid gap-4 rounded-[1.7rem] border border-white/8 bg-white/[0.03] p-5 xl:grid-cols-[0.9fr_1.1fr]"
            >
              <div className="grid gap-4">
                <div
                  aria-label={draft.altText || draft.title || item.altText}
                  className="min-h-[15rem] rounded-[1.5rem] border border-white/8 bg-slate-950 bg-cover bg-center"
                  role="img"
                  style={backgroundStyle(draft.thumbnailUrl || draft.mediaUrl || item.thumbnailUrl || item.mediaUrl)}
                />
                <div className="rounded-[1.4rem] border border-white/8 bg-slate-950/60 p-4 text-sm text-slate-300">
                  <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Bound application</p>
                  <p className="mt-2 text-slate-100">{item.application.name}</p>
                  <p className="mt-3 text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Created</p>
                  <p className="mt-2 text-slate-100">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.72rem] uppercase tracking-[0.28em] text-cyan-100/70">
                      {item.featured ? "Flagship media" : "Gallery media"}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void setCatalogScreenshot(item.id)}
                      disabled={busy}
                      className="action-secondary text-xs disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Set as catalog screenshot
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeMedia(item.id)}
                      disabled={busy}
                      className="action-secondary text-xs disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                    Application
                    <select
                      className={inputClass}
                      value={draft.applicationId}
                      onChange={(event) => updateDraftField(item.id, "applicationId", event.target.value)}
                    >
                      {apps.map((app) => (
                        <option key={app.id} value={app.id}>
                          {app.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <input
                    className={inputClass}
                    placeholder="title"
                    value={draft.title}
                    onChange={(event) => updateDraftField(item.id, "title", event.target.value)}
                  />
                </div>

                <input
                  className={inputClass}
                  placeholder="alt text"
                  value={draft.altText}
                  onChange={(event) => updateDraftField(item.id, "altText", event.target.value)}
                />
                <textarea
                  className={textareaClass}
                  placeholder="description"
                  value={draft.description}
                  onChange={(event) => updateDraftField(item.id, "description", event.target.value)}
                />

                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className={inputClass}
                    placeholder="media URL"
                    value={draft.mediaUrl}
                    onChange={(event) => updateDraftField(item.id, "mediaUrl", event.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="thumbnail URL"
                    value={draft.thumbnailUrl}
                    onChange={(event) => updateDraftField(item.id, "thumbnailUrl", event.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="S3 bucket"
                    value={draft.s3Bucket}
                    onChange={(event) => updateDraftField(item.id, "s3Bucket", event.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="S3 key"
                    value={draft.s3Key}
                    onChange={(event) => updateDraftField(item.id, "s3Key", event.target.value)}
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    className={inputClass}
                    placeholder="sort order"
                    type="number"
                    min={0}
                    max={10000}
                    value={draft.sortOrder}
                    onChange={(event) => updateDraftField(item.id, "sortOrder", Number(event.target.value) || 0)}
                  />
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100">
                    <input
                      type="checkbox"
                      checked={draft.featured}
                      onChange={(event) => updateDraftField(item.id, "featured", event.target.checked)}
                    />
                    Featured
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={busy}
                    className="action-primary text-xs disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? "Saving…" : "Save media"}
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
