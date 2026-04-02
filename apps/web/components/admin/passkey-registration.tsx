"use client";

import { browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { useEffect, useState } from "react";
import { registerOwnerPasskey } from "@/lib/passkey-browser";

type PasskeyRow = {
  id: string;
  credentialId: string;
  counter: number;
  createdAt: string;
};

function formatCredentialId(id: string): string {
  if (id.length <= 16) return id;
  return `${id.slice(0, 10)}…${id.slice(-6)}`;
}

export function PasskeyRegistration() {
  const [supportsWa, setSupportsWa] = useState<boolean | null>(null);
  const [items, setItems] = useState<PasskeyRow[]>([]);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setSupportsWa(browserSupportsWebAuthn());
    });
  }, []);

  async function loadPasskeys() {
    const res = await fetch("/api/admin/passkeys", { credentials: "same-origin" });
    if (!res.ok) return;
    const data = (await res.json()) as { items: PasskeyRow[] };
    setItems(data.items);
  }

  useEffect(() => {
    if (!supportsWa) return;
    let cancelled = false;
    fetch("/api/admin/passkeys", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setItems((data as { items: PasskeyRow[] }).items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [supportsWa]);

  async function onRegister() {
    setBusy(true);
    setFeedback(null);
    const result = await registerOwnerPasskey();
    setBusy(false);
    if (result.ok) {
      setFeedback({
        kind: "ok",
        text: "Passkey registered. You can use “Sign in with passkey” on the owner login page.",
      });
      await loadPasskeys();
    } else {
      setFeedback({ kind: "err", text: result.error ?? "Registration failed." });
    }
  }

  async function onRevoke(id: string) {
    setRevokingId(id);
    setFeedback(null);
    const res = await fetch(`/api/admin/passkeys/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    setRevokingId(null);
    if (!res.ok) {
      setFeedback({ kind: "err", text: "Could not remove passkey." });
      return;
    }
    setFeedback({ kind: "ok", text: "Passkey removed." });
    await loadPasskeys();
  }

  if (supportsWa === false) {
    return (
      <section className="rounded-lg border border-zinc-800 p-4">
        <h2 className="text-xl font-semibold">Passkeys</h2>
        <p className="mt-2 text-sm text-zinc-500">
          This browser does not support WebAuthn passkeys. Use a current Chrome, Safari, Firefox, or Edge
          on a secure context (HTTPS or localhost).
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-zinc-800 p-4">
      <h2 className="text-xl font-semibold">Passkeys</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Register or remove passkeys for passwordless owner sign-in.
      </p>
      {feedback ? (
        <p className={`mt-2 text-sm ${feedback.kind === "err" ? "text-red-400" : "text-cyan-300"}`}>
          {feedback.text}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || supportsWa === null}
          onClick={() => void onRegister()}
          className="rounded bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 disabled:opacity-50"
        >
          {busy ? "Working…" : "Register new passkey"}
        </button>
      </div>
      {supportsWa === null ? (
        <p className="mt-3 text-xs text-zinc-500">Checking WebAuthn support…</p>
      ) : (
        <ul className="mt-4 space-y-2 text-sm">
          {items.length === 0 ? (
            <li className="text-zinc-500">No passkeys yet.</li>
          ) : (
            items.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-800 p-2"
              >
                <div>
                  <p className="font-mono text-xs text-cyan-200">{formatCredentialId(row.credentialId)}</p>
                  <p className="text-xs text-zinc-500">
                    Added {new Date(row.createdAt).toLocaleString()} · counter {row.counter}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={revokingId === row.id}
                  onClick={() => void onRevoke(row.id)}
                  className="rounded border border-red-900/60 bg-red-950/40 px-2 py-1 text-xs text-red-300 hover:bg-red-950 disabled:opacity-50"
                >
                  {revokingId === row.id ? "Removing…" : "Revoke"}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </section>
  );
}
