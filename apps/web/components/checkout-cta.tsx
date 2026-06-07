"use client";

import { useState } from "react";

type CheckoutCtaProps = {
  applicationId: string;
  priceLabel?: string | null;
};

/**
 * Client-side checkout: POST /api/checkout then follows redirect (mock or Stripe).
 */
export function CheckoutCta({ applicationId, priceLabel }: CheckoutCtaProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const pricingTbd = !priceLabel || priceLabel.toUpperCase() === "TBD";

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
      className="mt-4 flex flex-col gap-3 rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5"
      aria-label="Purchase this application"
    >
      {pricingTbd ? (
        <p className="text-sm leading-7 text-slate-300">
          Commercial pricing is <span className="font-medium text-white">TBD</span>. You can still complete a mock
          purchase flow locally, or download the public GitHub source archive below for free.
        </p>
      ) : (
        <p className="text-sm leading-7 text-slate-300">
          Pricing model: <span className="font-medium text-white">{priceLabel}</span>
        </p>
      )}
      <div className="grid gap-1">
        <label htmlFor="checkout-email" className="text-sm text-slate-300">
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
          className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
          placeholder="you@example.com"
        />
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="action-primary w-full justify-center text-xs disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Starting checkout…" : pricingTbd ? "Purchase (pricing TBD)" : "Purchase"}
      </button>
      <p className="text-xs leading-6 text-slate-500">
        Uses mock checkout when Stripe is not configured; you will be redirected to complete the session.
      </p>
    </form>
  );
}
