"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { VaultPlaceholderForm, type VaultS3Attachment } from "@/components/vault-placeholder-form";

type VaultListItem = {
  id: string;
  createdAt: string;
  cipherBytes: number;
};

type S3Slot = {
  uploadUrl: string;
  bucket: string;
  key: string;
  expiresInSeconds: number;
};

export function VaultClientPanel() {
  const [items, setItems] = useState<VaultListItem[]>([]);
  const [encryption, setEncryption] = useState<"configured" | "missing" | "unknown">("unknown");
  const [decryption, setDecryption] = useState<"configured" | "missing" | "unknown">("unknown");
  const [s3Vault, setS3Vault] = useState<"configured" | "missing" | "unknown">("unknown");
  const [maxPlaintextBytes, setMaxPlaintextBytes] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [s3Slot, setS3Slot] = useState<S3Slot | null>(null);
  const [s3Busy, setS3Busy] = useState(false);
  const [s3Message, setS3Message] = useState("");
  const [s3Attachment, setS3Attachment] = useState<VaultS3Attachment | null>(null);

  const load = useCallback(() => {
    fetch("/api/vault", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          setError("Could not load vault list.");
          return;
        }
        const data = (await res.json()) as {
          items: VaultListItem[];
          encryption?: "configured" | "missing";
          decryption?: "configured" | "missing";
          s3Vault?: "configured" | "missing";
          maxPlaintextBytes?: number;
        };
        setItems(data.items);
        setEncryption(data.encryption ?? "unknown");
        setDecryption(data.decryption ?? "unknown");
        setS3Vault(data.s3Vault ?? "unknown");
        setMaxPlaintextBytes(typeof data.maxPlaintextBytes === "number" ? data.maxPlaintextBytes : null);
        setError("");
      })
      .catch(() => setError("Could not load vault list."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function requestS3UploadUrl() {
    setS3Message("");
    setS3Busy(true);
    try {
      const res = await fetch("/api/vault/s3-upload-url", { method: "POST", credentials: "include" });
      const data = (await res.json()) as {
        error?: string;
        uploadUrl?: string;
        bucket?: string;
        key?: string;
        expiresInSeconds?: number;
      };
      if (!res.ok) {
        setS3Slot(null);
        setS3Message(data.error === "s3_vault_not_configured" ? "S3 vault bucket not configured on server." : "Request failed.");
        return;
      }
      if (data.uploadUrl && data.bucket && data.key && data.expiresInSeconds) {
        setS3Slot({
          uploadUrl: data.uploadUrl,
          bucket: data.bucket,
          key: data.key,
          expiresInSeconds: data.expiresInSeconds,
        });
      }
    } catch {
      setS3Message("Network error.");
    } finally {
      setS3Busy(false);
    }
  }

  return (
    <div className="space-y-6">
      {encryption === "missing" ? (
        <p className="rounded-md border border-amber-700/60 bg-amber-950/40 px-3 py-2 text-sm text-amber-200">
          <strong className="font-semibold">Encryption key missing.</strong> Set{" "}
          <code className="text-amber-100">VAULT_ENCRYPTION_KEY</code> (64 hex characters) to store encrypted vault
          rows. Submissions still write audit entries.
        </p>
      ) : null}
      {decryption === "missing" && items.length > 0 ? (
        <p className="rounded-md border border-red-800/60 bg-red-950/50 px-3 py-2 text-sm text-red-200">
          <strong className="font-semibold">Cannot decrypt existing rows.</strong> Set{" "}
          <code className="text-red-100">VAULT_ENCRYPTION_KEY</code> or{" "}
          <code className="text-red-100">VAULT_ENCRYPTION_KEY_LEGACY</code>.
        </p>
      ) : null}
      {maxPlaintextBytes !== null ? (
        <p className="text-xs text-zinc-500">
          Encrypted JSON manifest limit: <code className="text-zinc-400">{maxPlaintextBytes}</code> UTF-8 bytes (
          override with <code className="text-zinc-400">VAULT_MAX_PLAINTEXT_BYTES</code>).
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {s3Vault === "configured" ? (
        <section className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-4">
          <h2 className="text-lg font-semibold text-zinc-200">Large binary (S3)</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Request a presigned <strong className="text-zinc-400">PUT</strong>, upload your file, then attach the key
            to the next vault row. Keys are scoped to <code className="text-zinc-400">vault/&lt;your-user-id&gt;/…</code>
            .
          </p>
          <button
            type="button"
            disabled={s3Busy}
            onClick={() => void requestS3UploadUrl()}
            className="mt-3 rounded-md border border-zinc-600 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
          >
            {s3Busy ? "Requesting…" : "Get upload URL"}
          </button>
          {s3Message ? <p className="mt-2 text-sm text-amber-300">{s3Message}</p> : null}
          {s3Slot ? (
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-zinc-400">
                Expires in {s3Slot.expiresInSeconds}s · bucket <code className="text-zinc-300">{s3Slot.bucket}</code>
              </p>
              <p className="text-xs text-zinc-500">Key (readonly)</p>
              <code className="block break-all rounded bg-zinc-950 p-2 text-xs text-cyan-200">{s3Slot.key}</code>
              <p className="text-xs text-zinc-500">PUT URL</p>
              <textarea
                readOnly
                rows={3}
                className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 font-mono text-xs text-zinc-300"
                value={s3Slot.uploadUrl}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void navigator.clipboard.writeText(s3Slot.uploadUrl)}
                  className="rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-200"
                >
                  Copy PUT URL
                </button>
                <button
                  type="button"
                  onClick={() => setS3Attachment({ bucket: s3Slot.bucket, key: s3Slot.key })}
                  className="rounded bg-cyan-800 px-2 py-1 text-xs font-medium text-cyan-100"
                >
                  Attach to next vault row
                </button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-zinc-200">Stored entries</h2>
        {items.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No encrypted rows yet.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {items.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-800 px-3 py-2">
                <span className="text-zinc-400">
                  {new Date(row.createdAt).toLocaleString()} · {row.cipherBytes} bytes (encrypted)
                </span>
                <Link href={`/admin/vault/${row.id}`} className="text-cyan-400 hover:text-cyan-300">
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <VaultPlaceholderForm
        s3Attachment={s3Attachment}
        onClearS3Attachment={() => setS3Attachment(null)}
        onSuccess={() => load()}
      />
    </div>
  );
}
