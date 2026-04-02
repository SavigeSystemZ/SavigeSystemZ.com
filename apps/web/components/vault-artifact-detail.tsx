"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type VaultArtifactDetailProps = {
  artifactId: string;
};

export function VaultArtifactDetail({ artifactId }: VaultArtifactDetailProps) {
  const [note, setNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [s3DownloadUrl, setS3DownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/vault/${artifactId}`, { credentials: "include" })
      .then(async (res) => {
        if (res.status === 503) {
          setError("Vault decryption is not configured (set VAULT_ENCRYPTION_KEY or VAULT_ENCRYPTION_KEY_LEGACY).");
          return;
        }
        if (!res.ok) {
          setError("Could not load this entry.");
          return;
        }
        const data = (await res.json()) as {
          note?: string;
          tags?: string[];
          createdAt?: string;
          s3DownloadUrl?: string;
        };
        setNote(data.note ?? "");
        setTags(Array.isArray(data.tags) ? data.tags : []);
        setCreatedAt(data.createdAt ?? null);
        setS3DownloadUrl(typeof data.s3DownloadUrl === "string" ? data.s3DownloadUrl : null);
      })
      .catch(() => setError("Could not load this entry."));
  }, [artifactId]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link href="/admin/vault" className="text-sm text-cyan-400 hover:text-cyan-300">
        ← Back to vault
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Vault entry</h1>
      {createdAt ? (
        <p className="mt-1 text-xs text-zinc-500">{new Date(createdAt).toISOString()}</p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      {!error && createdAt ? (
        <div className="mt-6 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-zinc-400">Note</h2>
            <p className="mt-1 whitespace-pre-wrap rounded border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-200">
              {note || "—"}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-zinc-400">Tags</h2>
            <p className="mt-1 text-sm text-zinc-300">{tags.length ? tags.join(", ") : "—"}</p>
          </div>
          {s3DownloadUrl ? (
            <div>
              <h2 className="text-sm font-medium text-zinc-400">Attached object</h2>
              <p className="mt-1 text-sm text-zinc-500">Time-limited download (S3 presigned GET).</p>
              <a
                href={s3DownloadUrl}
                className="mt-2 inline-block rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
              >
                Download from S3
              </a>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
