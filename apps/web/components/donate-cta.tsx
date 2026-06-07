"use client";

import { useState } from "react";
import { buildProjectDonateExternalUrl } from "@/lib/donate-config";

type DonateCtaProps = {
  applicationId: string;
  applicationSlug: string;
  applicationName: string;
  externalDonateUrl: string;
  defaultAmountLabel?: string;
  checkoutEnabled?: boolean;
  githubSponsorsUsername?: string;
};

export function DonateCta({
  applicationId,
  applicationSlug,
  applicationName,
  externalDonateUrl,
  defaultAmountLabel = "$5",
  checkoutEnabled = true,
  githubSponsorsUsername = "whyte",
}: DonateCtaProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const sponsorUrl = buildProjectDonateExternalUrl(externalDonateUrl, applicationSlug);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/donate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          applicationId,
          donorEmail: email.trim() || undefined,
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok) {
        setError(data.error ?? "Donation checkout failed.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("No donation URL returned.");
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 grid gap-4">
      <a
        href={sponsorUrl}
        target="_blank"
        rel="noreferrer"
        className="action-secondary w-full justify-center text-xs"
      >
        Support on GitHub Sponsors (@{githubSponsorsUsername})
      </a>
      {checkoutEnabled ? (
        <form
          onSubmit={(e) => void onSubmit(e)}
          className="flex flex-col gap-3 rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5"
          aria-label={`Donate to ${applicationName}`}
        >
          <p className="text-sm leading-7 text-slate-300">
            Project-specific tip for <span className="font-medium text-white">{applicationName}</span> via foundry
            checkout. Suggested: {defaultAmountLabel}.
          </p>
          <div className="grid gap-1">
            <label htmlFor={`donate-email-${applicationSlug}`} className="text-sm text-slate-300">
              Email (optional)
            </label>
            <input
              id={`donate-email-${applicationSlug}`}
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-300/40"
              placeholder="you@example.com"
            />
          </div>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="rounded-full border border-amber-300/40 bg-amber-400/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100 hover:bg-amber-400/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Starting donation…" : "Donate to this project"}
          </button>
        </form>
      ) : (
        <p className="text-sm leading-7 text-slate-400">
          Per-project checkout donations require Stripe in production. GitHub Sponsors above supports all foundry
          work.
        </p>
      )}
    </div>
  );
}
