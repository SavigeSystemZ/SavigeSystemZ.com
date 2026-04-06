"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AssetVisibility = "PUBLIC" | "ENTITLED" | "PRIVATE";
type AppVisibility = "PUBLIC" | "PRIVATE" | "DRAFT";

type LaunchReadiness = {
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

type AppItem = {
  id: string;
  name: string;
  slug: string;
  visibility: AppVisibility;
  featured: boolean;
  media: Array<{ id: string; featured: boolean }>;
  versions: Array<{ id: string; assets: Array<{ id: string; visibility: AssetVisibility }> }>;
  launchReadiness: LaunchReadiness;
};

type VersionAssetItem = {
  id: string;
  visibility: AssetVisibility;
};

type AssetItem = {
  id: string;
  versionId: string;
  fileName: string;
  fileUrl: string;
  checksum?: string | null;
  s3Bucket?: string | null;
  s3Key?: string | null;
  visibility: AssetVisibility;
  createdAt: string;
  version: {
    id: string;
    version: string;
    applicationId: string;
    application: {
      id: string;
      name: string;
      slug: string;
    };
  };
};

type VersionItem = {
  id: string;
  applicationId: string;
  version: string;
  changelog: string;
  createdAt: string;
  application: {
    id: string;
    name: string;
    slug: string;
  };
  assets: VersionAssetItem[];
};

type VersionFormState = {
  applicationId: string;
  version: string;
  changelog: string;
};

type AssetFormState = {
  versionId: string;
  fileName: string;
  fileUrl: string;
  checksum: string;
  s3Bucket: string;
  s3Key: string;
  visibility: AssetVisibility;
};

type LaunchComposerFormState = {
  applicationId: string;
  version: string;
  changelog: string;
  fileName: string;
  fileUrl: string;
  checksum: string;
  s3Bucket: string;
  s3Key: string;
  visibility: AssetVisibility;
  publishAfterCreate: boolean;
};

type ReleaseUploadSlot = {
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

function emptyVersionForm(applicationId = ""): VersionFormState {
  return {
    applicationId,
    version: "",
    changelog: "",
  };
}

function emptyAssetForm(versionId = ""): AssetFormState {
  return {
    versionId,
    fileName: "",
    fileUrl: "",
    checksum: "",
    s3Bucket: "",
    s3Key: "",
    visibility: "PUBLIC",
  };
}

function emptyLaunchComposerForm(applicationId = ""): LaunchComposerFormState {
  return {
    applicationId,
    version: "",
    changelog: "",
    fileName: "",
    fileUrl: "",
    checksum: "",
    s3Bucket: "",
    s3Key: "",
    visibility: "PUBLIC",
    publishAfterCreate: true,
  };
}

function versionDraftFromItem(item: VersionItem): VersionFormState {
  return {
    applicationId: item.applicationId,
    version: item.version,
    changelog: item.changelog,
  };
}

function assetDraftFromItem(item: AssetItem): AssetFormState {
  return {
    versionId: item.versionId,
    fileName: item.fileName,
    fileUrl: item.fileUrl,
    checksum: item.checksum ?? "",
    s3Bucket: item.s3Bucket ?? "",
    s3Key: item.s3Key ?? "",
    visibility: item.visibility,
  };
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function trimOptional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildAssetPayload(form: AssetFormState): Record<string, unknown> {
  return {
    versionId: form.versionId,
    fileName: form.fileName,
    fileUrl: form.fileUrl,
    checksum: trimOptional(form.checksum),
    s3Bucket: trimOptional(form.s3Bucket),
    s3Key: trimOptional(form.s3Key),
    visibility: form.visibility,
  };
}

function buildLaunchComposerPayload(form: LaunchComposerFormState): Record<string, unknown> {
  return {
    version: form.version,
    changelog: form.changelog,
    fileName: form.fileName,
    fileUrl: form.fileUrl,
    checksum: trimOptional(form.checksum),
    s3Bucket: trimOptional(form.s3Bucket),
    s3Key: trimOptional(form.s3Key),
    visibility: form.visibility,
    publishAfterCreate: form.publishAfterCreate,
  };
}

function getVersionLabel(item: Pick<VersionItem, "version" | "application">): string {
  return `${item.application.name} · ${item.version}`;
}

function pickPreferredLaunchApplicationId(items: AppItem[], currentId: string): string {
  if (currentId && items.some((item) => item.id === currentId)) {
    return currentId;
  }

  return items.find((item) => item.visibility !== "PUBLIC")?.id ?? items[0]?.id ?? "";
}

export function ReleaseManager() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [versionDrafts, setVersionDrafts] = useState<Record<string, VersionFormState>>({});
  const [assetDrafts, setAssetDrafts] = useState<Record<string, AssetFormState>>({});
  const [versionForm, setVersionForm] = useState<VersionFormState>(emptyVersionForm());
  const [assetForm, setAssetForm] = useState<AssetFormState>(emptyAssetForm());
  const [launchComposerForm, setLaunchComposerForm] = useState<LaunchComposerFormState>(
    emptyLaunchComposerForm(),
  );
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSlot, setUploadSlot] = useState<ReleaseUploadSlot | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [launchUploadFile, setLaunchUploadFile] = useState<File | null>(null);
  const [launchUploadSlot, setLaunchUploadSlot] = useState<ReleaseUploadSlot | null>(null);
  const [launchUploadMessage, setLaunchUploadMessage] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const publicAssetCount = useMemo(
    () => assets.filter((asset) => asset.visibility === "PUBLIC").length,
    [assets],
  );
  const entitledAssetCount = useMemo(
    () => assets.filter((asset) => asset.visibility === "ENTITLED").length,
    [assets],
  );
  const nonPublicApps = useMemo(
    () => apps.filter((app) => app.visibility !== "PUBLIC"),
    [apps],
  );
  const launchReadyCount = useMemo(
    () => nonPublicApps.filter((app) => app.launchReadiness.ready).length,
    [nonPublicApps],
  );
  const selectedLaunchApp = useMemo(
    () => apps.find((app) => app.id === launchComposerForm.applicationId) ?? null,
    [apps, launchComposerForm.applicationId],
  );
  const selectedLaunchHref = selectedLaunchApp ? `/applications/${selectedLaunchApp.slug}` : null;

  async function load() {
    const [appRes, versionRes, assetRes] = await Promise.all([
      fetch("/api/admin/applications", { credentials: "include" }),
      fetch("/api/admin/versions", { credentials: "include" }),
      fetch("/api/admin/release-assets", { credentials: "include" }),
    ]);

    if (!appRes.ok || !versionRes.ok || !assetRes.ok) {
      setError("Failed loading release data. Ensure owner login.");
      return;
    }

    const appData = (await appRes.json()) as { items: AppItem[] };
    const versionData = (await versionRes.json()) as { items: VersionItem[] };
    const assetData = (await assetRes.json()) as { items: AssetItem[] };

    setError("");
    setApps(appData.items);
    setVersions(versionData.items);
    setAssets(assetData.items);
    setVersionDrafts(
      Object.fromEntries(versionData.items.map((item) => [item.id, versionDraftFromItem(item)])),
    );
    setAssetDrafts(
      Object.fromEntries(assetData.items.map((item) => [item.id, assetDraftFromItem(item)])),
    );

    setVersionForm((current) => {
      if (appData.items.length === 0) return current;
      const hasSelectedApp = appData.items.some((app) => app.id === current.applicationId);
      return hasSelectedApp ? current : { ...current, applicationId: appData.items[0].id };
    });
    setAssetForm((current) => {
      if (versionData.items.length === 0) return current;
      const hasSelectedVersion = versionData.items.some((version) => version.id === current.versionId);
      return hasSelectedVersion ? current : { ...current, versionId: versionData.items[0].id };
    });
    setLaunchComposerForm((current) => {
      const applicationId = pickPreferredLaunchApplicationId(appData.items, current.applicationId);
      return {
        ...current,
        applicationId,
      };
    });
  }

  useEffect(() => {
    load().catch(() => setError("Failed loading release data. Ensure owner login."));
  }, []);

  useEffect(() => {
    setUploadSlot(null);
    setUploadMessage("");
    setUploadFile(null);
  }, [assetForm.versionId]);

  useEffect(() => {
    setLaunchUploadSlot(null);
    setLaunchUploadMessage("");
    setLaunchUploadFile(null);
  }, [launchComposerForm.applicationId, launchComposerForm.version]);

  function updateVersionDraft(id: string, key: keyof VersionFormState, value: string) {
    setVersionDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? emptyVersionForm()),
        [key]: value,
      },
    }));
  }

  function updateAssetDraft(id: string, key: keyof AssetFormState, value: string) {
    setAssetDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? emptyAssetForm()),
        [key]: value,
      },
    }));
  }

  function updateLaunchComposerField<K extends keyof LaunchComposerFormState>(
    key: K,
    value: LaunchComposerFormState[K],
  ) {
    setLaunchComposerForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function createVersion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyAction("create-version");
    setError("");
    setInfo("");

    try {
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
      setInfo("Version created.");
      setVersionForm(emptyVersionForm(versionForm.applicationId));
      await load();
    } finally {
      setBusyAction(null);
    }
  }

  async function saveVersion(event: React.FormEvent<HTMLFormElement>, versionId: string) {
    event.preventDefault();
    const payload = versionDrafts[versionId];
    if (!payload) return;

    setBusyAction(`save-version-${versionId}`);
    setError("");
    setInfo("");

    try {
      const res = await fetch(`/api/admin/versions/${versionId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError("Failed to update version.");
        return;
      }
      setInfo("Version updated.");
      await load();
    } finally {
      setBusyAction(null);
    }
  }

  async function removeVersion(versionId: string) {
    setBusyAction(`delete-version-${versionId}`);
    setError("");
    setInfo("");

    try {
      const res = await fetch(`/api/admin/versions/${versionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        setError("Failed to delete version.");
        return;
      }
      setInfo("Version deleted.");
      await load();
    } finally {
      setBusyAction(null);
    }
  }

  async function createAsset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyAction("create-asset");
    setError("");
    setInfo("");

    try {
      const res = await fetch("/api/admin/release-assets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(buildAssetPayload(assetForm)),
      });
      if (!res.ok) {
        setError("Failed to create release asset.");
        return;
      }
      setInfo("Release asset created.");
      setAssetForm(emptyAssetForm(assetForm.versionId));
      await load();
    } finally {
      setBusyAction(null);
    }
  }

  async function uploadAssetFile() {
    if (!uploadFile) {
      setUploadMessage("Select a file first.");
      return;
    }
    if (!assetForm.versionId) {
      setUploadMessage("Select a version before requesting an upload URL.");
      return;
    }

    setBusyAction("upload-asset-file");
    setError("");
    setInfo("");
    setUploadMessage("");

    try {
      const presignRes = await fetch("/api/admin/release-assets/s3-upload-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          versionId: assetForm.versionId,
          fileName: uploadFile.name,
          contentType: uploadFile.type || undefined,
        }),
      });

      const presignData = (await presignRes.json().catch(() => ({}))) as {
        error?: string;
        uploadUrl?: string;
        bucket?: string;
        key?: string;
        fileUrl?: string;
        fileName?: string;
        expiresInSeconds?: number;
      };

      if (!presignRes.ok) {
        setUploadSlot(null);
        setUploadMessage(
          presignData.error === "s3_release_not_configured"
            ? "Release S3 bucket is not configured on the server."
            : presignData.error === "version_not_found"
              ? "Version not found."
              : "Could not request an upload URL.",
        );
        return;
      }

      if (
        !presignData.uploadUrl ||
        !presignData.bucket ||
        !presignData.key ||
        !presignData.fileUrl ||
        !presignData.fileName ||
        !presignData.expiresInSeconds
      ) {
        setUploadSlot(null);
        setUploadMessage("Upload slot response was incomplete.");
        return;
      }

      const uploadRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: uploadFile.type ? { "content-type": uploadFile.type } : undefined,
        body: uploadFile,
      });

      if (!uploadRes.ok) {
        setUploadSlot(null);
        setUploadMessage(
          "Upload to the storage bucket failed. Check S3 bucket CORS and presign configuration.",
        );
        return;
      }

      const slot = {
        uploadUrl: presignData.uploadUrl,
        bucket: presignData.bucket,
        key: presignData.key,
        fileUrl: presignData.fileUrl,
        fileName: presignData.fileName,
        expiresInSeconds: presignData.expiresInSeconds,
      };
      setUploadSlot(slot);
      setAssetForm((prev) => ({
        ...prev,
        fileName: slot.fileName,
        fileUrl: slot.fileUrl,
        s3Bucket: slot.bucket,
        s3Key: slot.key,
      }));
      setUploadMessage("Upload completed. Review visibility/checksum, then create the asset record.");
    } catch {
      setUploadSlot(null);
      setUploadMessage("Network error while uploading file.");
    } finally {
      setBusyAction(null);
    }
  }

  async function uploadLaunchAssetFile() {
    if (!launchUploadFile) {
      setLaunchUploadMessage("Select a launch file first.");
      return;
    }
    if (!launchComposerForm.applicationId) {
      setLaunchUploadMessage("Select an application before requesting an upload URL.");
      return;
    }
    if (!launchComposerForm.version.trim()) {
      setLaunchUploadMessage("Enter a version before requesting an upload URL.");
      return;
    }

    setBusyAction("upload-launch-file");
    setError("");
    setInfo("");
    setLaunchUploadMessage("");

    try {
      const presignRes = await fetch(
        `/api/admin/applications/${launchComposerForm.applicationId}/launch-compose/s3-upload-url`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            version: launchComposerForm.version,
            fileName: launchUploadFile.name,
            contentType: launchUploadFile.type || undefined,
          }),
        },
      );

      const presignData = (await presignRes.json().catch(() => ({}))) as {
        error?: string;
        uploadUrl?: string;
        bucket?: string;
        key?: string;
        fileUrl?: string;
        fileName?: string;
        expiresInSeconds?: number;
      };

      if (!presignRes.ok) {
        setLaunchUploadSlot(null);
        setLaunchUploadMessage(
          presignData.error === "s3_release_not_configured"
            ? "Release S3 bucket is not configured on the server."
            : presignData.error === "not_found"
              ? "Application not found."
              : "Could not request a launch upload URL.",
        );
        return;
      }

      if (
        !presignData.uploadUrl ||
        !presignData.bucket ||
        !presignData.key ||
        !presignData.fileUrl ||
        !presignData.fileName ||
        !presignData.expiresInSeconds
      ) {
        setLaunchUploadSlot(null);
        setLaunchUploadMessage("Launch upload slot response was incomplete.");
        return;
      }

      const uploadRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: launchUploadFile.type ? { "content-type": launchUploadFile.type } : undefined,
        body: launchUploadFile,
      });

      if (!uploadRes.ok) {
        setLaunchUploadSlot(null);
        setLaunchUploadMessage(
          "Upload to the storage bucket failed. Check S3 bucket CORS and presign configuration.",
        );
        return;
      }

      const slot = {
        uploadUrl: presignData.uploadUrl,
        bucket: presignData.bucket,
        key: presignData.key,
        fileUrl: presignData.fileUrl,
        fileName: presignData.fileName,
        expiresInSeconds: presignData.expiresInSeconds,
      };
      setLaunchUploadSlot(slot);
      setLaunchComposerForm((prev) => ({
        ...prev,
        fileName: slot.fileName,
        fileUrl: slot.fileUrl,
        s3Bucket: slot.bucket,
        s3Key: slot.key,
      }));
      setLaunchUploadMessage(
        "Launch file uploaded. Review visibility and checksum, then compose the launch package.",
      );
    } catch {
      setLaunchUploadSlot(null);
      setLaunchUploadMessage("Network error while uploading the launch file.");
    } finally {
      setBusyAction(null);
    }
  }

  async function composeLaunch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!launchComposerForm.applicationId) {
      setError("Select an application to compose a launch.");
      return;
    }

    setBusyAction("compose-launch");
    setError("");
    setInfo("");

    try {
      const res = await fetch(`/api/admin/applications/${launchComposerForm.applicationId}/launch-compose`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(buildLaunchComposerPayload(launchComposerForm)),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        published?: boolean;
      };

      if (!res.ok) {
        if (data.error === "version_exists") {
          setError(`Version ${launchComposerForm.version.trim()} already exists for this application.`);
        } else if (data.error === "not_found") {
          setError("Application not found.");
        } else {
          setError("Launch composition failed.");
        }
        return;
      }

      const selectedId = launchComposerForm.applicationId;
      const published = data.published === true;
      setLaunchComposerForm(emptyLaunchComposerForm(selectedId));
      setLaunchUploadFile(null);
      setLaunchUploadSlot(null);
      setLaunchUploadMessage("");
      setInfo(
        published
          ? "Launch package created and application published."
          : "Launch package created. Review remaining blockers, then publish when ready.",
      );
      await load();
    } finally {
      setBusyAction(null);
    }
  }

  async function saveAsset(event: React.FormEvent<HTMLFormElement>, assetId: string) {
    event.preventDefault();
    const payload = assetDrafts[assetId];
    if (!payload) return;

    setBusyAction(`save-asset-${assetId}`);
    setError("");
    setInfo("");

    try {
      const res = await fetch(`/api/admin/release-assets/${assetId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(buildAssetPayload(payload)),
      });
      if (!res.ok) {
        setError("Failed to update release asset.");
        return;
      }
      setInfo("Release asset updated.");
      await load();
    } finally {
      setBusyAction(null);
    }
  }

  async function removeAsset(assetId: string) {
    setBusyAction(`delete-asset-${assetId}`);
    setError("");
    setInfo("");

    try {
      const res = await fetch(`/api/admin/release-assets/${assetId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        setError("Failed to delete release asset.");
        return;
      }
      setInfo("Release asset deleted.");
      await load();
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section className="surface-panel rounded-[1.9rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/70">Release center</p>
          <h2 className="display-title mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Release Manager
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Manage launch composition, version history, and delivery assets by application instead of juggling raw IDs.
            This is the owner surface for first-launch choreography, public files, entitled packages, and release
            publication hygiene.
          </p>
        </div>
        <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
          {apps.length} apps / {versions.length} versions / {assets.length} assets
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Applications</p>
          <p className="display-title mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">{apps.length}</p>
        </article>
        <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Versions</p>
          <p className="display-title mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">{versions.length}</p>
        </article>
        <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Public assets</p>
          <p className="display-title mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">{publicAssetCount}</p>
        </article>
        <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Entitled assets</p>
          <p className="display-title mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">{entitledAssetCount}</p>
        </article>
        <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Drafts launch-ready</p>
          <p className="display-title mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
            {launchReadyCount}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {nonPublicApps.length} draft/private apps in the launch lane
          </p>
        </article>
      </div>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      {!error && info ? <p className="mt-4 text-sm text-cyan-200">{info}</p> : null}

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <form id="launch-composer" onSubmit={composeLaunch} className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.28em] text-cyan-100/70">Guided launch</p>
              <h3 className="mt-2 text-lg font-semibold text-white">Launch composer</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Create the first version, attach the first distributable file, and optionally publish the application
                when launch blockers are clear.
              </p>
            </div>
            <button
              type="submit"
              disabled={busyAction === "compose-launch" || !launchComposerForm.applicationId}
              className="action-primary text-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busyAction === "compose-launch" ? "Composing…" : "Compose launch"}
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-2 text-sm text-slate-300">
              <span>Application</span>
              <select
                className={inputClass}
                value={launchComposerForm.applicationId}
                onChange={(event) => updateLaunchComposerField("applicationId", event.target.value)}
              >
                <option value="">Select application</option>
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} ({app.slug}) · {app.visibility.toLowerCase()}
                  </option>
                ))}
              </select>
            </label>

            {selectedLaunchApp ? (
              <div className="rounded-[1.4rem] border border-white/8 bg-slate-950/50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{selectedLaunchApp.name}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                      {selectedLaunchApp.slug} / {selectedLaunchApp.visibility.toLowerCase()}
                      {selectedLaunchApp.featured ? " / featured" : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                      selectedLaunchApp.launchReadiness.ready
                        ? "border border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                        : "border border-amber-300/30 bg-amber-300/10 text-amber-100"
                    }`}
                  >
                    {selectedLaunchApp.launchReadiness.ready ? "Launch ready" : "Needs launch work"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  {selectedLaunchApp.launchReadiness.counts.media} media /{" "}
                  {selectedLaunchApp.launchReadiness.counts.versions} versions /{" "}
                  {selectedLaunchApp.launchReadiness.counts.publicAssets +
                    selectedLaunchApp.launchReadiness.counts.entitledAssets}{" "}
                  distributable assets
                </p>
              </div>
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
                Create or select an application before composing a launch package.
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <input
                className={inputClass}
                placeholder="Version e.g. 1.0.0"
                value={launchComposerForm.version}
                onChange={(event) => updateLaunchComposerField("version", event.target.value)}
              />
              <select
                className={inputClass}
                value={launchComposerForm.visibility}
                onChange={(event) =>
                  updateLaunchComposerField("visibility", event.target.value as AssetVisibility)
                }
              >
                <option value="PUBLIC">PUBLIC</option>
                <option value="ENTITLED">ENTITLED</option>
                <option value="PRIVATE">PRIVATE</option>
              </select>
            </div>

            <textarea
              className={textareaClass}
              placeholder="Launch changelog"
              value={launchComposerForm.changelog}
              onChange={(event) => updateLaunchComposerField("changelog", event.target.value)}
            />

            <div className="rounded-[1.4rem] border border-white/8 bg-slate-950/50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Launch asset upload</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Upload the first distributable file into the release bucket before the version exists. The composer
                    will reuse the resulting bucket, key, and public object URL.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void uploadLaunchAssetFile()}
                  disabled={busyAction === "upload-launch-file"}
                  className="action-secondary text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyAction === "upload-launch-file" ? "Uploading…" : "Upload launch file"}
                </button>
              </div>
              <input
                type="file"
                className="mt-4 block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400/12 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.18em] file:text-cyan-100"
                onChange={(event) => setLaunchUploadFile(event.target.files?.[0] ?? null)}
              />
              {launchUploadMessage ? <p className="mt-3 text-sm text-cyan-200">{launchUploadMessage}</p> : null}
              {launchUploadSlot ? (
                <div className="mt-4 rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4 text-sm text-slate-300">
                  <p>
                    Bucket <code className="text-slate-100">{launchUploadSlot.bucket}</code> · expires in{" "}
                    {launchUploadSlot.expiresInSeconds}s
                  </p>
                  <p className="mt-2 break-all text-xs text-slate-500">{launchUploadSlot.key}</p>
                </div>
              ) : null}
            </div>

            <input
              className={inputClass}
              placeholder="File name"
              value={launchComposerForm.fileName}
              onChange={(event) => updateLaunchComposerField("fileName", event.target.value)}
            />
            <input
              className={inputClass}
              placeholder="File URL"
              value={launchComposerForm.fileUrl}
              onChange={(event) => updateLaunchComposerField("fileUrl", event.target.value)}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className={inputClass}
                placeholder="Checksum (optional)"
                value={launchComposerForm.checksum}
                onChange={(event) => updateLaunchComposerField("checksum", event.target.value)}
              />
              <label className="flex items-start gap-3 rounded-[1.4rem] border border-white/8 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={launchComposerForm.publishAfterCreate}
                  onChange={(event) => updateLaunchComposerField("publishAfterCreate", event.target.checked)}
                />
                <span>
                  Publish automatically when blockers are clear.
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    If readiness is satisfied after the first version and asset are created, the app flips to public
                    immediately.
                  </span>
                </span>
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className={inputClass}
                placeholder="S3 bucket (optional)"
                value={launchComposerForm.s3Bucket}
                onChange={(event) => updateLaunchComposerField("s3Bucket", event.target.value)}
              />
              <input
                className={inputClass}
                placeholder="S3 key (optional)"
                value={launchComposerForm.s3Key}
                onChange={(event) => updateLaunchComposerField("s3Key", event.target.value)}
              />
            </div>
          </div>
        </form>

        <article className="rounded-[1.6rem] border border-white/8 bg-slate-950/40 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.28em] text-cyan-100/70">Launch status</p>
              <h3 className="mt-2 text-lg font-semibold text-white">Readiness board</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Blockers here explain exactly why publish is still gated. Use the quick links to jump into the owning
                editor when a draft needs more framing.
              </p>
            </div>
            <div className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-400">
              {launchReadyCount} ready / {nonPublicApps.length} staged
            </div>
          </div>

          {selectedLaunchApp ? (
            <>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <article className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[0.72rem] uppercase tracking-[0.24em] text-slate-500">Media</p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {selectedLaunchApp.launchReadiness.counts.media}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {selectedLaunchApp.launchReadiness.counts.featuredMedia} featured
                  </p>
                </article>
                <article className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[0.72rem] uppercase tracking-[0.24em] text-slate-500">Versions</p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {selectedLaunchApp.launchReadiness.counts.versions}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Tracked release history</p>
                </article>
                <article className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[0.72rem] uppercase tracking-[0.24em] text-slate-500">Public assets</p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {selectedLaunchApp.launchReadiness.counts.publicAssets}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Visible in the public download lane</p>
                </article>
                <article className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[0.72rem] uppercase tracking-[0.24em] text-slate-500">Entitled assets</p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {selectedLaunchApp.launchReadiness.counts.entitledAssets}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Buyer-only delivery files</p>
                </article>
              </div>

              <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[0.72rem] uppercase tracking-[0.24em] text-slate-500">Launch blockers</p>
                {selectedLaunchApp.launchReadiness.blockers.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedLaunchApp.launchReadiness.blockers.map((blocker) => (
                      <span
                        key={blocker}
                        className="rounded-full border border-amber-300/20 bg-amber-300/8 px-3 py-1 text-xs text-amber-100"
                      >
                        {blocker}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-emerald-200">Launch blockers are cleared for this application.</p>
                )}

                {selectedLaunchApp.launchReadiness.warnings.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-[0.72rem] uppercase tracking-[0.24em] text-slate-500">Warnings</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedLaunchApp.launchReadiness.warnings.map((warning) => (
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

              <div className="mt-5 grid gap-2">
                <Link
                  href={`/admin/applications#application-${selectedLaunchApp.id}`}
                  className="action-secondary justify-center text-xs"
                >
                  Open application record
                </Link>
                <Link href="/admin/media" className="action-secondary justify-center text-xs">
                  Open media manager
                </Link>
                <Link href="/admin/releases" className="action-secondary justify-center text-xs">
                  Open release editor
                </Link>
                {selectedLaunchHref && selectedLaunchApp.visibility === "PUBLIC" ? (
                  <Link
                    href={selectedLaunchHref}
                    className="action-secondary justify-center text-xs"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View public route
                  </Link>
                ) : (
                  <div className="rounded-full border border-white/10 px-4 py-2 text-center text-[0.68rem] uppercase tracking-[0.18em] text-slate-500">
                    Public preview after publish
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm leading-6 text-slate-400">
              No application is selected yet. Create one in the catalog manager or pick an existing draft to begin the
              guided launch flow.
            </div>
          )}
        </article>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/70">Manual release operations</p>
          <h3 className="display-title mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Version And Asset Controls
          </h3>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-slate-400">
          Use the manual controls below when editing established releases, backfilling assets, or handling special
          delivery lanes outside the guided first-launch flow.
        </p>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <form onSubmit={createVersion} className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">Create version</h3>
            <button
              type="submit"
              disabled={busyAction === "create-version"}
              className="action-primary text-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busyAction === "create-version" ? "Creating…" : "Create version"}
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-2 text-sm text-slate-300">
              <span>Application</span>
              <select
                className={inputClass}
                value={versionForm.applicationId}
                onChange={(event) =>
                  setVersionForm((prev) => ({ ...prev, applicationId: event.target.value }))
                }
              >
                <option value="">Select application</option>
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} ({app.slug})
                  </option>
                ))}
              </select>
            </label>
            <input
              className={inputClass}
              placeholder="Version e.g. 1.0.0"
              value={versionForm.version}
              onChange={(event) =>
                setVersionForm((prev) => ({ ...prev, version: event.target.value }))
              }
            />
            <textarea
              className={textareaClass}
              placeholder="Changelog"
              value={versionForm.changelog}
              onChange={(event) =>
                setVersionForm((prev) => ({ ...prev, changelog: event.target.value }))
              }
            />
          </div>
        </form>

        <form onSubmit={createAsset} className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">Create asset</h3>
            <button
              type="submit"
              disabled={busyAction === "create-asset"}
              className="action-primary text-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busyAction === "create-asset" ? "Creating…" : "Create asset"}
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-2 text-sm text-slate-300">
              <span>Version</span>
              <select
                className={inputClass}
                value={assetForm.versionId}
                onChange={(event) =>
                  setAssetForm((prev) => ({ ...prev, versionId: event.target.value }))
                }
              >
                <option value="">Select version</option>
                {versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {getVersionLabel(version)}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-[1.4rem] border border-white/8 bg-slate-950/50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Direct upload</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Upload a file to the release bucket, then save the resulting asset record with the selected
                    visibility and metadata.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void uploadAssetFile()}
                  disabled={busyAction === "upload-asset-file"}
                  className="action-secondary text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyAction === "upload-asset-file" ? "Uploading…" : "Upload file to S3"}
                </button>
              </div>
              <input
                type="file"
                className="mt-4 block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400/12 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.18em] file:text-cyan-100"
                onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
              />
              {uploadMessage ? <p className="mt-3 text-sm text-cyan-200">{uploadMessage}</p> : null}
              {uploadSlot ? (
                <div className="mt-4 rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4 text-sm text-slate-300">
                  <p>
                    Bucket <code className="text-slate-100">{uploadSlot.bucket}</code> · expires in{" "}
                    {uploadSlot.expiresInSeconds}s
                  </p>
                  <p className="mt-2 break-all text-xs text-slate-500">{uploadSlot.key}</p>
                </div>
              ) : null}
            </div>
            <input
              className={inputClass}
              placeholder="File name"
              value={assetForm.fileName}
              onChange={(event) =>
                setAssetForm((prev) => ({ ...prev, fileName: event.target.value }))
              }
            />
            <input
              className={inputClass}
              placeholder="File URL"
              value={assetForm.fileUrl}
              onChange={(event) =>
                setAssetForm((prev) => ({ ...prev, fileUrl: event.target.value }))
              }
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className={inputClass}
                placeholder="Checksum (optional)"
                value={assetForm.checksum}
                onChange={(event) =>
                  setAssetForm((prev) => ({ ...prev, checksum: event.target.value }))
                }
              />
              <select
                className={inputClass}
                value={assetForm.visibility}
                onChange={(event) =>
                  setAssetForm((prev) => ({
                    ...prev,
                    visibility: event.target.value as AssetVisibility,
                  }))
                }
              >
                <option value="PUBLIC">PUBLIC</option>
                <option value="ENTITLED">ENTITLED</option>
                <option value="PRIVATE">PRIVATE</option>
              </select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className={inputClass}
                placeholder="S3 bucket (optional)"
                value={assetForm.s3Bucket}
                onChange={(event) =>
                  setAssetForm((prev) => ({ ...prev, s3Bucket: event.target.value }))
                }
              />
              <input
                className={inputClass}
                placeholder="S3 key (optional)"
                value={assetForm.s3Key}
                onChange={(event) =>
                  setAssetForm((prev) => ({ ...prev, s3Key: event.target.value }))
                }
              />
            </div>
          </div>
        </form>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="display-title text-2xl font-semibold tracking-[-0.04em] text-white">Versions</h3>
            <p className="text-sm text-slate-400">Edit changelogs and version ownership.</p>
          </div>
          {versions.map((version) => {
            const draft = versionDrafts[version.id] ?? versionDraftFromItem(version);
            const busy =
              busyAction === `save-version-${version.id}` || busyAction === `delete-version-${version.id}`;

            return (
              <form
                key={version.id}
                onSubmit={(event) => void saveVersion(event, version.id)}
                className="rounded-[1.6rem] border border-white/8 bg-slate-950/40 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.72rem] uppercase tracking-[0.28em] text-cyan-100/70">
                      {getVersionLabel(version)}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Created {formatDate(version.createdAt)} / {version.assets.length} assets
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={busy}
                      className="action-secondary text-xs disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyAction === `save-version-${version.id}` ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void removeVersion(version.id)}
                      className="rounded-full border border-red-400/30 bg-red-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyAction === `delete-version-${version.id}` ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <select
                    className={inputClass}
                    value={draft.applicationId}
                    onChange={(event) => updateVersionDraft(version.id, "applicationId", event.target.value)}
                  >
                    {apps.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.name} ({app.slug})
                      </option>
                    ))}
                  </select>
                  <input
                    className={inputClass}
                    value={draft.version}
                    onChange={(event) => updateVersionDraft(version.id, "version", event.target.value)}
                  />
                  <textarea
                    className={textareaClass}
                    value={draft.changelog}
                    onChange={(event) => updateVersionDraft(version.id, "changelog", event.target.value)}
                  />
                </div>
              </form>
            );
          })}
        </div>

        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="display-title text-2xl font-semibold tracking-[-0.04em] text-white">Assets</h3>
            <p className="text-sm text-slate-400">Edit delivery files, URLs, checksums, and visibility.</p>
          </div>
          {assets.map((asset) => {
            const draft = assetDrafts[asset.id] ?? assetDraftFromItem(asset);
            const busy =
              busyAction === `save-asset-${asset.id}` || busyAction === `delete-asset-${asset.id}`;

            return (
              <form
                key={asset.id}
                onSubmit={(event) => void saveAsset(event, asset.id)}
                className="rounded-[1.6rem] border border-white/8 bg-slate-950/40 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.72rem] uppercase tracking-[0.28em] text-cyan-100/70">
                      {asset.version.application.name} · {asset.version.version}
                    </p>
                    <h4 className="mt-2 text-lg font-semibold text-white">{asset.fileName}</h4>
                    <p className="mt-2 text-sm text-slate-400">
                      {asset.visibility.toLowerCase()} / created {formatDate(asset.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href={asset.fileUrl} target="_blank" rel="noreferrer" className="action-secondary text-xs">
                      Open file
                    </a>
                    <button
                      type="submit"
                      disabled={busy}
                      className="action-secondary text-xs disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyAction === `save-asset-${asset.id}` ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void removeAsset(asset.id)}
                      className="rounded-full border border-red-400/30 bg-red-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyAction === `delete-asset-${asset.id}` ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <select
                    className={inputClass}
                    value={draft.versionId}
                    onChange={(event) => updateAssetDraft(asset.id, "versionId", event.target.value)}
                  >
                    {versions.map((version) => (
                      <option key={version.id} value={version.id}>
                        {getVersionLabel(version)}
                      </option>
                    ))}
                  </select>
                  <input
                    className={inputClass}
                    value={draft.fileName}
                    onChange={(event) => updateAssetDraft(asset.id, "fileName", event.target.value)}
                  />
                  <input
                    className={inputClass}
                    value={draft.fileUrl}
                    onChange={(event) => updateAssetDraft(asset.id, "fileUrl", event.target.value)}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      className={inputClass}
                      value={draft.checksum}
                      onChange={(event) => updateAssetDraft(asset.id, "checksum", event.target.value)}
                      placeholder="checksum"
                    />
                    <select
                      className={inputClass}
                      value={draft.visibility}
                      onChange={(event) =>
                        updateAssetDraft(asset.id, "visibility", event.target.value)
                      }
                    >
                      <option value="PUBLIC">PUBLIC</option>
                      <option value="ENTITLED">ENTITLED</option>
                      <option value="PRIVATE">PRIVATE</option>
                    </select>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      className={inputClass}
                      value={draft.s3Bucket}
                      onChange={(event) => updateAssetDraft(asset.id, "s3Bucket", event.target.value)}
                      placeholder="S3 bucket"
                    />
                    <input
                      className={inputClass}
                      value={draft.s3Key}
                      onChange={(event) => updateAssetDraft(asset.id, "s3Key", event.target.value)}
                      placeholder="S3 object key"
                    />
                  </div>
                </div>
              </form>
            );
          })}
        </div>
      </div>
    </section>
  );
}
