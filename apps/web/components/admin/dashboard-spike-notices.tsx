"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AdminDashboardAlert } from "@/lib/admin-dashboard";

const SEVERITY_TONE: Record<AdminDashboardAlert["severity"], string> = {
  danger: "border-red-400/60 bg-red-500/10 text-red-100",
  warn: "border-amber-300/60 bg-amber-500/10 text-amber-100",
  info: "border-cyan-300/60 bg-cyan-500/10 text-cyan-100",
};

type Props = {
  alerts: AdminDashboardAlert[];
};

export function DashboardSpikeNotices({ alerts }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dismissing, setDismissing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());

  const visible = alerts.filter((alert) => !hidden.has(alert.alertKey));
  if (visible.length === 0) return null;

  async function dismiss(alertKey: string) {
    setError(null);
    setDismissing(alertKey);
    try {
      const response = await fetch("/api/admin/dashboard/acknowledge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ alertKey }),
      });
      if (!response.ok) {
        setError(`Acknowledge failed (${response.status})`);
        return;
      }
      setHidden((prev) => {
        const next = new Set(prev);
        next.add(alertKey);
        return next;
      });
      startTransition(() => router.refresh());
    } catch {
      setError("Acknowledge failed (network)");
    } finally {
      setDismissing(null);
    }
  }

  return (
    <section className="mt-6 space-y-3" aria-label="Dashboard spike notices">
      {visible.map((alert) => {
        const href =
          alert.metadata && typeof (alert.metadata as { href?: unknown }).href === "string"
            ? ((alert.metadata as { href: string }).href)
            : null;
        const tone = SEVERITY_TONE[alert.severity];
        return (
          <div
            key={alert.alertKey}
            className={`flex flex-col gap-3 rounded-2xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${tone}`}
            role="status"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] opacity-80">
                <span>{alert.severity}</span>
                <span aria-hidden>·</span>
                <span>{alert.category}</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-white">{alert.message}</p>
              <p className="mt-1 text-xs opacity-70">
                First seen {new Date(alert.firstSeenAt).toLocaleString()} · Last seen{" "}
                {new Date(alert.lastSeenAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {href ? (
                <a
                  href={href}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white hover:border-white/40"
                >
                  Inspect
                </a>
              ) : null}
              <button
                type="button"
                disabled={isPending || dismissing === alert.alertKey}
                onClick={() => dismiss(alert.alertKey)}
                className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-white/20 disabled:opacity-60"
              >
                {dismissing === alert.alertKey ? "Dismissing…" : "Dismiss"}
              </button>
            </div>
          </div>
        );
      })}
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </section>
  );
}
