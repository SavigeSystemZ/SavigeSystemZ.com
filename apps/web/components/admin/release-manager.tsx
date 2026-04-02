"use client";

import { useEffect, useState } from "react";

type VersionItem = { id: string; applicationId: string; version: string; changelog: string };
type AssetItem = {
  id: string;
  versionId: string;
  fileName: string;
  fileUrl: string;
  s3Bucket?: string | null;
  s3Key?: string | null;
  visibility?: string;
};

export function ReleaseManager() {
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [error, setError] = useState("");
  const [versionForm, setVersionForm] = useState({
    applicationId: "",
    version: "",
    changelog: "",
  });
  const [assetForm, setAssetForm] = useState({
    versionId: "",
    fileName: "",
    fileUrl: "",
    s3Bucket: "",
    s3Key: "",
    visibility: "PUBLIC" as "PUBLIC" | "ENTITLED" | "PRIVATE",
  });

  async function load() {
    Promise.all([
      fetch("/api/admin/versions", { credentials: "include" }),
      fetch("/api/admin/release-assets", { credentials: "include" }),
    ])
      .then(async ([versionRes, assetRes]) => {
        if (!versionRes.ok || !assetRes.ok) {
          setError("Failed loading release data. Ensure owner login.");
          return;
        }
        const v = (await versionRes.json()) as { items: VersionItem[] };
        const a = (await assetRes.json()) as { items: AssetItem[] };
        setVersions(v.items);
        setAssets(a.items);
      })
      .catch(() => setError("Failed loading release data. Ensure owner login."));
  }

  useEffect(() => {
    void load();
  }, []);

  async function createVersion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const res = await fetch("/api/admin/versions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(versionForm),
    });
    if (!res.ok) {
      setError("Failed to create version.");
      return;
    }
    setVersionForm({ applicationId: "", version: "", changelog: "" });
    await load();
  }

  async function createAsset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const s3Bucket = assetForm.s3Bucket.trim();
    const s3Key = assetForm.s3Key.trim();
    const payload: Record<string, unknown> = {
      versionId: assetForm.versionId,
      fileName: assetForm.fileName,
      fileUrl: assetForm.fileUrl,
      visibility: assetForm.visibility,
    };
    if (s3Bucket && s3Key) {
      payload.s3Bucket = s3Bucket;
      payload.s3Key = s3Key;
    }
    const res = await fetch("/api/admin/release-assets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("Failed to create release asset.");
      return;
    }
    setAssetForm({
      versionId: "",
      fileName: "",
      fileUrl: "",
      s3Bucket: "",
      s3Key: "",
      visibility: "PUBLIC",
    });
    await load();
  }

  return (
    <section className="rounded-lg border border-zinc-800 p-4">
      <h2 className="text-xl font-semibold">Release Manager</h2>
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      <div className="mt-4 grid gap-3 text-sm">
        <p className="font-medium">Versions: {versions.length}</p>
        <p className="font-medium">Release Assets: {assets.length}</p>
        <ul className="max-h-40 overflow-y-auto rounded border border-zinc-800 p-2 text-xs text-zinc-400">
          {assets.slice(0, 20).map((a) => (
            <li key={a.id}>
              {a.fileName} — {a.visibility ?? "PUBLIC"}
              {a.s3Bucket && a.s3Key ? " (S3)" : ""}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <form onSubmit={createVersion} className="grid gap-2 rounded border border-zinc-800 p-3">
          <p className="text-sm font-medium">Create Version</p>
          <input
            className="rounded border border-zinc-700 bg-zinc-950 p-2"
            placeholder="applicationId"
            value={versionForm.applicationId}
            onChange={(event) => setVersionForm((prev) => ({ ...prev, applicationId: event.target.value }))}
          />
          <input
            className="rounded border border-zinc-700 bg-zinc-950 p-2"
            placeholder="version"
            value={versionForm.version}
            onChange={(event) => setVersionForm((prev) => ({ ...prev, version: event.target.value }))}
          />
          <textarea
            className="min-h-24 rounded border border-zinc-700 bg-zinc-950 p-2"
            placeholder="changelog"
            value={versionForm.changelog}
            onChange={(event) => setVersionForm((prev) => ({ ...prev, changelog: event.target.value }))}
          />
          <button className="rounded bg-cyan-400 px-3 py-2 text-zinc-950">Create version</button>
        </form>
        <form onSubmit={createAsset} className="grid gap-2 rounded border border-zinc-800 p-3">
          <p className="text-sm font-medium">Create Release Asset</p>
          <input
            className="rounded border border-zinc-700 bg-zinc-950 p-2"
            placeholder="versionId"
            value={assetForm.versionId}
            onChange={(event) => setAssetForm((prev) => ({ ...prev, versionId: event.target.value }))}
          />
          <input
            className="rounded border border-zinc-700 bg-zinc-950 p-2"
            placeholder="fileName"
            value={assetForm.fileName}
            onChange={(event) => setAssetForm((prev) => ({ ...prev, fileName: event.target.value }))}
          />
          <input
            className="rounded border border-zinc-700 bg-zinc-950 p-2"
            placeholder="fileUrl"
            value={assetForm.fileUrl}
            onChange={(event) => setAssetForm((prev) => ({ ...prev, fileUrl: event.target.value }))}
          />
          <input
            className="rounded border border-zinc-700 bg-zinc-950 p-2"
            placeholder="S3 bucket (optional, with key)"
            value={assetForm.s3Bucket}
            onChange={(event) => setAssetForm((prev) => ({ ...prev, s3Bucket: event.target.value }))}
          />
          <input
            className="rounded border border-zinc-700 bg-zinc-950 p-2"
            placeholder="S3 object key (optional)"
            value={assetForm.s3Key}
            onChange={(event) => setAssetForm((prev) => ({ ...prev, s3Key: event.target.value }))}
          />
          <select
            className="rounded border border-zinc-700 bg-zinc-950 p-2"
            value={assetForm.visibility}
            onChange={(event) =>
              setAssetForm((prev) => ({
                ...prev,
                visibility: event.target.value as "PUBLIC" | "ENTITLED" | "PRIVATE",
              }))
            }
          >
            <option value="PUBLIC">PUBLIC</option>
            <option value="ENTITLED">ENTITLED</option>
            <option value="PRIVATE">PRIVATE</option>
          </select>
          <button className="rounded bg-cyan-400 px-3 py-2 text-zinc-950">Create asset</button>
        </form>
      </div>
    </section>
  );
}
