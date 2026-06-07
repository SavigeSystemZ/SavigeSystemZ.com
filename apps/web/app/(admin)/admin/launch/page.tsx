import type { Metadata } from "next";
import Link from "next/link";
import { Panel, SectionHeading, StatusChip } from "@savige/ui";
import {
  evaluateProductionLaunchReadiness,
  type ProductionEnvCheck,
} from "@/lib/launch-readiness";
import { verifyCatalogCompleteness } from "@/lib/verify-catalog-completeness";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Launch readiness",
};

function chipVariant(status: ProductionEnvCheck["status"]): "success" | "warn" | "danger" {
  if (status === "ok") return "success";
  if (status === "weak") return "warn";
  return "danger";
}

function chipLabel(status: ProductionEnvCheck["status"]): string {
  if (status === "ok") return "OK";
  if (status === "weak") return "Weak";
  return "Missing";
}

export default async function LaunchReadinessPage() {
  const readiness = evaluateProductionLaunchReadiness();
  let catalogOk = false;
  let catalogCount = 0;
  let catalogIssues: string[] = [];

  try {
    const catalog = await verifyCatalogCompleteness();
    catalogOk = catalog.ok;
    catalogCount = catalog.applicationCount;
    catalogIssues = catalog.issues.slice(0, 5).map((issue) => issue.message);
  } catch {
    catalogIssues = ["Catalog verify failed — check DATABASE_URL and run pnpm code:bootstrap."];
  }

  const goLiveDisabled = !readiness.ready || !catalogOk;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
      <Panel className="rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Owner launch gate"
          title="Production launch readiness"
          description="Environment-level checks plus catalog completeness gate the production go-live affordance."
        />
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <StatusChip
            variant={readiness.ready ? "success" : "danger"}
            className="text-[0.62rem] uppercase tracking-[0.2em]"
          >
            {readiness.ready ? "Env checks passing" : `${readiness.blockers.length} env blocker${readiness.blockers.length === 1 ? "" : "s"}`}
          </StatusChip>
          <StatusChip
            variant={catalogOk ? "success" : "danger"}
            className="text-[0.62rem] uppercase tracking-[0.2em]"
          >
            {catalogOk ? `${catalogCount} catalog entries OK` : "Catalog incomplete"}
          </StatusChip>
          <button
            type="button"
            disabled={goLiveDisabled}
            aria-disabled={goLiveDisabled}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              goLiveDisabled
                ? "cursor-not-allowed border border-white/10 bg-white/[0.04] text-slate-500"
                : "border border-emerald-300/60 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
            }`}
          >
            {goLiveDisabled ? "Go live (gated)" : "Go live"}
          </button>
          <span className="text-xs text-slate-400">
            Staging checklist: <code className="font-mono text-cyan-200">pnpm staging:verify</code>
          </span>
        </div>
      </Panel>

      {!catalogOk ? (
        <Panel className="mt-6 rounded-[1.6rem] border border-rose-300/20 bg-rose-400/5 p-5 sm:p-6">
          <SectionHeading
            eyebrow="Catalog gate"
            title="Bootstrap catalog before launch"
            description="Run pnpm code:bootstrap locally or in CI, then pnpm code:verify-catalog until green."
          />
          <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-slate-300">
            {catalogIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel className="mt-6 rounded-[1.6rem] p-5 sm:p-6">
        <SectionHeading
          eyebrow="Environment checks"
          title="Required and optional secrets"
          description="GitHub entries are optional and never block launch; AWS media/release buckets and presign flag are required."
        />
        <div className="mt-5 space-y-2">
          {readiness.checks.map((check) => (
            <div
              key={check.key}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  <code className="font-mono text-cyan-200">{check.key}</code>
                  <span className="ml-3 text-slate-300">{check.label}</span>
                </p>
                {check.detail ? (
                  <p className="mt-1 text-xs text-slate-400">{check.detail}</p>
                ) : null}
              </div>
              <StatusChip
                variant={chipVariant(check.status)}
                className="text-[0.62rem] uppercase tracking-[0.18em]"
              >
                {chipLabel(check.status)}
              </StatusChip>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="mt-6 rounded-[1.6rem] p-5 sm:p-6">
        <SectionHeading
          eyebrow="Operator runbook"
          title="What this page does not check"
          description="The page is env-only for secrets. The following must be verified out-of-band before flipping production traffic."
        />
        <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-7 text-slate-300">
          <li>
            <strong className="text-white">Postgres reachability:</strong> run{" "}
            <code className="font-mono text-cyan-200">pnpm --filter web exec prisma migrate deploy</code> against the
            production DSN; expect zero pending migrations.
          </li>
          <li>
            <strong className="text-white">Stripe webhook:</strong> see{" "}
            <code className="font-mono text-cyan-200">docs/STRIPE_WEBHOOK_TESTING.md</code>; confirm a real{" "}
            <code className="font-mono text-cyan-200">checkout.session.completed</code> event reaches{" "}
            <code className="font-mono text-cyan-200">/api/webhooks/stripe</code> and de-dupes on retry.
          </li>
          <li>
            <strong className="text-white">S3 presign smoke:</strong> with staging keys set, run{" "}
            <code className="font-mono text-cyan-200">
              pnpm staging:verify -- --probe-http --probe-presign
            </code>{" "}
            against a running dev server.
          </li>
          <li>
            <strong className="text-white">Domain DNS:</strong> follow{" "}
            <code className="font-mono text-cyan-200">docs/PRODUCTION_DOMAIN_VERIFICATION.md</code> for the Vercel
            attach.
          </li>
        </ul>
        <div className="mt-5">
          <Link href="/admin" className="action-secondary text-xs">
            Back to overview
          </Link>
        </div>
      </Panel>
    </main>
  );
}
