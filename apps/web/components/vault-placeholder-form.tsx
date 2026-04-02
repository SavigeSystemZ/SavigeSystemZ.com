"use client";

import { useState } from "react";

export type VaultS3Attachment = { bucket: string; key: string };

type VaultPlaceholderFormProps = {
  onSuccess?: () => void;
  s3Attachment?: VaultS3Attachment | null;
  onClearS3Attachment?: () => void;
};

/**
 * Registers vault metadata via POST /api/vault (owner session).
 * When `VAULT_ENCRYPTION_KEY` is set, payloads persist encrypted at rest.
 */
export function VaultPlaceholderForm({
  onSuccess,
  s3Attachment,
  onClearS3Attachment,
}: VaultPlaceholderFormProps) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setBusy(true);
    try {
      const body: Record<string, unknown> = {};
      if (note.trim()) body.note = note.trim();
      if (s3Attachment) {
        body.s3Bucket = s3Attachment.bucket;
        body.s3Key = s3Attachment.key;
      }
      const response = await fetch("/api/vault", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as {
        error?: string;
        accepted?: boolean;
        persisted?: boolean;
        warning?: string;
      };
      if (!response.ok) {
        setMessage({
          kind: "err",
          text:
            data.error === "payload_too_large"
              ? "Payload too large after encryption (see server maxPlaintextBytes)."
              : (data.error ?? "Request failed."),
        });
        return;
      }
      const extra = data.warning ? ` ${data.warning}` : "";
      const persistMsg =
        data.persisted === true
          ? " Encrypted row stored."
          : data.persisted === false
            ? " Audit only (configure encryption to persist)."
            : "";
      setMessage({
        kind: "ok",
        text: `Recorded. Check the audit log for vault.placeholder.submit.${persistMsg}${extra}`,
      });
      setNote("");
      onClearS3Attachment?.();
      onSuccess?.();
    } catch {
      setMessage({ kind: "err", text: "Network error." });
    } finally {
      setBusy(false);
    }
  }

  const canSubmit = Boolean(note.trim() || s3Attachment);

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="mt-4 max-w-xl space-y-3 rounded-lg border border-zinc-700 bg-zinc-900/40 p-4"
      aria-label="Vault placeholder registration"
    >
      {s3Attachment ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-cyan-900/50 bg-cyan-950/30 px-3 py-2 text-sm text-cyan-200">
          <span>
            S3 object attached: <code className="text-xs text-cyan-100">{s3Attachment.key}</code>
          </span>
          <button
            type="button"
            onClick={() => onClearS3Attachment?.()}
            className="text-xs text-cyan-400 underline hover:text-cyan-300"
          >
            Clear
          </button>
        </div>
      ) : null}
      <div className="grid gap-1">
        <label htmlFor="vault-note" className="text-sm text-zinc-400">
          Internal note (optional unless attaching S3 only)
        </label>
        <textarea
          id="vault-note"
          name="note"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={2000}
          className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          placeholder="Short description; pair with S3 upload for large binaries…"
        />
      </div>
      {message ? (
        <p className={message.kind === "ok" ? "text-sm text-emerald-400" : "text-sm text-red-400"}>
          {message.text}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy || !canSubmit}
        className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
      >
        {busy ? "Saving…" : "Register placeholder"}
      </button>
    </form>
  );
}
