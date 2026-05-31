import type { Metadata } from "next";
import Link from "next/link";
import { CommandPaletteRow, Panel, SectionHeading, StatusChip } from "@savige/ui";
import { ApplicationManager } from "@/components/admin/application-manager";
import { AdminAutoRefresh } from "@/components/admin/auto-refresh";
import { DashboardSpikeNotices } from "@/components/admin/dashboard-spike-notices";
import { PasskeyRegistration } from "@/components/admin/passkey-registration";
import {
  type AdminDashboardFocus,
  type AdminDashboardWindow,
  getAdminDashboardSummary,
} from "@/lib/admin-dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Overview",
};

type AdminPageProps = {
  searchParams: Promise<{
    window?: string;
    focus?: string;
    refresh?: string;
  }>;
};

function parseWindow(value?: string): AdminDashboardWindow {
  return value === "7d" ? "7d" : "24h";
}

function parseFocus(value?: string): AdminDashboardFocus {
  if (value === "repos") return "repos";
  if (value === "moderation") return "moderation";
  if (value === "requests") return "requests";
  if (value === "audit") return "audit";
  return "launch";
}

function formatTrendDelta(delta: number): string {
  if (delta === 0) return "No change";
  return delta > 0 ? `+${delta}` : `${delta}`;
}

function trendTone(
  trend: { direction: "up" | "down" | "flat" },
  higherIsWorse: boolean,
): "danger" | "warn" | "success" | "info" {
  if (trend.direction === "flat") return "info";
  if (higherIsWorse) {
    return trend.direction === "up" ? "danger" : "success";
  }
  return trend.direction === "up" ? "success" : "warn";
}

function fixNextHref(
  baseHref: string,
  selectedWindow: AdminDashboardWindow,
  selectedRefresh: "off" | "30s",
): string {
  if (baseHref !== "/admin") return baseHref;
  return `/admin?window=${selectedWindow}&focus=launch&refresh=${selectedRefresh}`;
}

function parseRefresh(value?: string): "off" | "30s" {
  return value === "30s" ? "30s" : "off";
}

export default async function AdminPage(props: AdminPageProps) {
  const searchParams = await props.searchParams;
  const selectedWindow = parseWindow(searchParams.window);
  const selectedFocus = parseFocus(searchParams.focus);
  const selectedRefresh = parseRefresh(searchParams.refresh);
  const dashboard = await getAdminDashboardSummary(selectedWindow);
  const lastUpdated = new Date(dashboard.generatedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const quickPanels = [
    {
      title: "Release operations",
      description:
        "Create versions, manage delivery assets, and keep the public download center current.",
      href: "/admin/releases",
      cta: "Open releases",
      variant: "info" as const,
    },
    {
      title: "Application media",
      description:
        "Attach flagship artwork, screenshots, and gallery media so catalog entries have visual depth.",
      href: "/admin/media",
      cta: "Open media",
      variant: "success" as const,
    },
    {
      title: "Foundry archive",
      description:
        "Publish and maintain Linux builds, config packs, research notes, models, and non-app engineering drops.",
      href: "/admin/archive",
      cta: "Open archive",
      variant: "info" as const,
    },
    {
      title: "Project requests",
      description: "Review inbound build requests and move them through the owner queue.",
      href: "/admin/requests",
      cta: "Open requests",
      variant: "warn" as const,
    },
    {
      title: "Audit trail",
      description: "Track privileged operations and release mutations in one searchable surface.",
      href: "/admin/audit",
      cta: "Open audit",
      variant: "danger" as const,
    },
    {
      title: "Vault",
      description: "Access encrypted owner-only artifacts, notes, and private workbench material.",
      href: "/admin/vault",
      cta: "Open vault",
      variant: "success" as const,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <AdminAutoRefresh enabled={selectedRefresh === "30s"} />
      <Panel className="rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Owner control plane"
          title="Owner Admin Console"
          description="This is the private operating surface behind the flagship site: application narrative, release operations, moderation, audit visibility, passkeys, and vault artifacts."
        />
      </Panel>

      <DashboardSpikeNotices alerts={dashboard.activeAlerts} />

      <section className="mt-6 grid gap-4 xl:grid-cols-6">
        {quickPanels.map((panel) => (
          <Panel key={panel.title} className="rounded-[1.6rem] p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{panel.title}</h2>
              <StatusChip variant={panel.variant} className="text-[0.62rem] uppercase tracking-[0.16em]">
                Ready
              </StatusChip>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-300">{panel.description}</p>
            <Link href={panel.href} className="action-secondary mt-5 text-xs">
              {panel.cta}
            </Link>
          </Panel>
        ))}
      </section>

      <Panel className="mt-6 rounded-[1.6rem] p-5">
        <SectionHeading
          eyebrow="Fix next"
          title="Server-ranked queue of what to resolve first."
          description="This queue is computed from draft launch blockers, sync error states, moderation backlog, and audit bursts."
        />
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Timeframe</span>
          {(["24h", "7d"] as const).map((window) => (
            <Link
              key={window}
              href={`/admin?window=${window}&focus=${selectedFocus}`}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${
                selectedWindow === window
                  ? "border-cyan-300/60 bg-cyan-500/10 text-cyan-100"
                  : "border-white/15 text-slate-300 hover:border-white/30"
              }`}
            >
              {window}
            </Link>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Refresh</span>
          {(["off", "30s"] as const).map((refresh) => (
            <Link
              key={refresh}
              href={`/admin?window=${selectedWindow}&focus=${selectedFocus}&refresh=${refresh}`}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${
                selectedRefresh === refresh
                  ? "border-cyan-300/60 bg-cyan-500/10 text-cyan-100"
                  : "border-white/15 text-slate-300 hover:border-white/30"
              }`}
            >
              {refresh}
            </Link>
          ))}
          <span className="text-xs text-slate-400">Last updated {lastUpdated}</span>
        </div>
        <div className="mt-6 grid gap-3 xl:grid-cols-5">
          <CommandPaletteRow
            title="Launch blockers"
            description={`${dashboard.launchBlockerCount} unresolved blockers across draft applications and archive entries.`}
            shortcut={dashboard.launchBlockerCount > 0 ? "High" : "Clear"}
            action={
              <Link href={`/admin?window=${selectedWindow}&focus=launch`} className="action-secondary text-xs">
                Drill down
              </Link>
            }
          />
          <CommandPaletteRow
            title="Repo sync errors"
            description={`${dashboard.repoSyncErrorCount} repositories currently in ERROR sync status.`}
            shortcut={
              dashboard.repoSyncErrorCount > 0
                ? `${formatTrendDelta(dashboard.trends.repoErrorInflow.delta)}`
                : "Clear"
            }
            action={
              <Link href={`/admin?window=${selectedWindow}&focus=repos`} className="action-secondary text-xs">
                Drill down
              </Link>
            }
          />
          <CommandPaletteRow
            title="Pending moderation"
            description={`${dashboard.pendingModerationCount} creator submissions need review.`}
            shortcut={
              dashboard.pendingModerationCount > 0
                ? `${formatTrendDelta(dashboard.trends.moderationInflow.delta)}`
                : "Clear"
            }
            action={
              <Link
                href={`/admin?window=${selectedWindow}&focus=moderation`}
                className="action-secondary text-xs"
              >
                Drill down
              </Link>
            }
          />
          <CommandPaletteRow
            title="Pending requests"
            description={`${dashboard.pendingRequestCount} inbound project requests waiting for owner action.`}
            shortcut={
              dashboard.pendingRequestCount > 0 ? `${formatTrendDelta(dashboard.trends.requestInflow.delta)}` : "Clear"
            }
            action={
              <Link href={`/admin?window=${selectedWindow}&focus=requests`} className="action-secondary text-xs">
                Drill down
              </Link>
            }
          />
          <CommandPaletteRow
            title="Audit anomalies"
            description={`${dashboard.recentAuditAnomalyCount} high-volume action bursts in the last ${dashboard.window}.`}
            shortcut={
              dashboard.recentAuditAnomalyCount > 0
                ? `${formatTrendDelta(dashboard.trends.auditAnomalies.delta)}`
                : "Clear"
            }
            action={
              <Link href={`/admin?window=${selectedWindow}&focus=audit`} className="action-secondary text-xs">
                Drill down
              </Link>
            }
          />
        </div>
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              {selectedFocus === "launch" && "Launch blocker details"}
              {selectedFocus === "repos" && "Repository sync errors"}
              {selectedFocus === "moderation" && "Moderation queue details"}
              {selectedFocus === "requests" && "Project request queue details"}
              {selectedFocus === "audit" && `Audit anomaly details (${dashboard.window})`}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {selectedFocus === "repos" && (
                <>
                  <StatusChip
                    variant={trendTone(dashboard.trends.repoErrorInflow, true)}
                    className="text-[0.62rem] uppercase tracking-[0.16em]"
                  >
                    {formatTrendDelta(dashboard.trends.repoErrorInflow.delta)} vs prior {dashboard.window}
                  </StatusChip>
                  {dashboard.spikes.repoErrorInflow ? (
                    <StatusChip variant="danger" className="text-[0.62rem] uppercase tracking-[0.16em]">
                      Spike
                    </StatusChip>
                  ) : null}
                  <Link href="/admin/code" className="action-secondary text-xs">
                    Sync all now
                  </Link>
                </>
              )}
              {selectedFocus === "moderation" && (
                <>
                  <StatusChip
                    variant={trendTone(dashboard.trends.moderationInflow, true)}
                    className="text-[0.62rem] uppercase tracking-[0.16em]"
                  >
                    {formatTrendDelta(dashboard.trends.moderationInflow.delta)} new vs prior {dashboard.window}
                  </StatusChip>
                  {dashboard.spikes.moderationInflow ? (
                    <StatusChip variant="danger" className="text-[0.62rem] uppercase tracking-[0.16em]">
                      Spike
                    </StatusChip>
                  ) : null}
                  <Link href="/admin/moderation" className="action-secondary text-xs">
                    Process queue
                  </Link>
                </>
              )}
              {selectedFocus === "requests" && (
                <>
                  <StatusChip
                    variant={trendTone(dashboard.trends.requestInflow, true)}
                    className="text-[0.62rem] uppercase tracking-[0.16em]"
                  >
                    {formatTrendDelta(dashboard.trends.requestInflow.delta)} new vs prior {dashboard.window}
                  </StatusChip>
                  {dashboard.spikes.requestInflow ? (
                    <StatusChip variant="danger" className="text-[0.62rem] uppercase tracking-[0.16em]">
                      Spike
                    </StatusChip>
                  ) : null}
                  <Link href="/admin/requests" className="action-secondary text-xs">
                    Process queue
                  </Link>
                </>
              )}
              {selectedFocus === "audit" && (
                <>
                  <StatusChip
                    variant={trendTone(dashboard.trends.auditAnomalies, true)}
                    className="text-[0.62rem] uppercase tracking-[0.16em]"
                  >
                    {formatTrendDelta(dashboard.trends.auditAnomalies.delta)} vs prior {dashboard.window}
                  </StatusChip>
                  {dashboard.spikes.auditAnomalies ? (
                    <StatusChip variant="danger" className="text-[0.62rem] uppercase tracking-[0.16em]">
                      Spike
                    </StatusChip>
                  ) : null}
                  <Link href="/admin/audit" className="action-secondary text-xs">
                    Review bursts
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {selectedFocus === "launch" &&
              (dashboard.drilldowns.launchBlockers.length > 0 ? (
                dashboard.drilldowns.launchBlockers.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"
                  >
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold text-white">{item.title}:</span> {item.topBlocker}
                    </p>
                    <Link href={item.href} className="action-secondary text-xs">
                      Resolve ({item.blockerCount})
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-emerald-200">No launch blockers in current draft inventory.</p>
              ))}
            {selectedFocus === "repos" &&
              (dashboard.drilldowns.repoSyncErrors.length > 0 ? (
                dashboard.drilldowns.repoSyncErrors.map((repo) => (
                  <div
                    key={repo.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"
                  >
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold text-white">{repo.name}</span> ({repo.provider}):{" "}
                      {repo.syncError}
                    </p>
                    <Link href={repo.href} className="action-secondary text-xs">
                      Open code panel
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-emerald-200">No repository sync errors detected.</p>
              ))}
            {selectedFocus === "moderation" &&
              (dashboard.drilldowns.pendingModeration.length > 0 ? (
                dashboard.drilldowns.pendingModeration.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"
                  >
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold text-white">{entry.title}</span> ({entry.type}) -{" "}
                      {entry.status}
                    </p>
                    <Link href={entry.href} className="action-secondary text-xs">
                      Open moderation
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-emerald-200">Moderation queue is clear.</p>
              ))}
            {selectedFocus === "requests" &&
              (dashboard.drilldowns.pendingRequests.length > 0 ? (
                dashboard.drilldowns.pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"
                  >
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold text-white">{request.title}</span> - {request.status}
                    </p>
                    <Link href={request.href} className="action-secondary text-xs">
                      Open requests
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-emerald-200">Project request queue is clear.</p>
              ))}
            {selectedFocus === "audit" &&
              (dashboard.drilldowns.auditAnomalies.length > 0 ? (
                dashboard.drilldowns.auditAnomalies.map((anomaly) => (
                  <div
                    key={anomaly.action}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"
                  >
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold text-white">{anomaly.action}</span> occurred{" "}
                      {anomaly.count} times.
                    </p>
                    <Link href={anomaly.href} className="action-secondary text-xs">
                      Open audit
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-emerald-200">No anomaly bursts in this timeframe.</p>
              ))}
          </div>
        </div>
        {dashboard.fixNext.length > 0 ? (
          <div className="mt-5 space-y-2">
            {dashboard.fixNext.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-slate-300">{item.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusChip
                    variant={
                      item.severity === "critical" ? "danger" : item.severity === "high" ? "warn" : "info"
                    }
                    className="text-[0.62rem] uppercase tracking-[0.16em]"
                  >
                    {item.severity}
                  </StatusChip>
                  <Link
                    href={fixNextHref(item.href, selectedWindow, selectedRefresh)}
                    className="action-secondary text-xs"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-emerald-200">No urgent fixes detected in current admin telemetry.</p>
        )}
      </Panel>

      <div className="mt-6 grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
        <PasskeyRegistration />
        <ApplicationManager />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="surface-panel rounded-[1.6rem] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Moderation queue</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">Review live creator submissions and promote accepted work directly into draft application or archive records.</p>
          <Link href="/admin/moderation" className="action-secondary mt-5 text-xs">
            Open moderation
          </Link>
        </section>
        <section className="surface-panel rounded-[1.6rem] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Grounded concierge</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">The public AI dock now routes across live catalog, archive, pricing, creator, and owner knowledge instead of placeholder copy.</p>
        </section>
      </div>

      <Panel className="mt-6 rounded-[1.6rem] p-5">
        <SectionHeading
          eyebrow="Command palette"
          title="Keyboard route-jump lane is live."
          description="Use Cmd/Ctrl+K from any admin route to jump across moderation, code, releases, audit, and vault surfaces."
        />
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <CommandPaletteRow
            title="Publish next draft"
            description="Jump to applications manager and ship the next launch-ready draft."
            shortcut="P"
            action={
              <Link href="/admin" className="action-secondary text-xs">
                Open applications
              </Link>
            }
          />
          <CommandPaletteRow
            title="Sync all code repositories"
            description="Open code panel and run batch sync to refresh mirrored metadata."
            shortcut="S"
            action={
              <Link href="/admin/code" className="action-secondary text-xs">
                Open code panel
              </Link>
            }
          />
        </div>
      </Panel>
    </main>
  );
}
