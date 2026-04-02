"use client";

import { useState } from "react";

type CheckoutCtaProps = {
  applicationId: string;
};

/**
 * Client-side checkout: POST /api/checkout then follows redirect (mock or Stripe).
 */
export function CheckoutCta({ applicationId }: CheckoutCtaProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ applicationId, purchaserEmail: email.trim() }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok) {
        setError(data.error ?? "Checkout failed.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("No checkout URL returned.");
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="mt-4 flex max-w-md flex-col gap-3 rounded-lg border border-zinc-700 bg-zinc-900/40 p-4"
      aria-label="Purchase this application"
    >
      <div className="grid gap-1">
        <label htmlFor="checkout-email" className="text-sm text-zinc-400">
          Email for receipt
        </label>
        <input
          id="checkout-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          placeholder="you@example.com"
        />
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-400 disabled:opacity-50"
      >
        {busy ? "Starting checkout…" : "Purchase"}
      </button>
      <p className="text-xs text-zinc-500">
        Uses mock checkout when Stripe is not configured; you will be redirected to complete the
        session.
      </p>
    </form>
  );
}
