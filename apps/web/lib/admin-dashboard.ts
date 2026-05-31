import { db } from "@/lib/db";
import {
  evaluateApplicationLaunchReadiness,
  evaluateArchiveLaunchReadiness,
} from "@/lib/launch-readiness";

export type AdminDashboardWindow = "24h" | "7d";
export type AdminDashboardFocus = "launch" | "repos" | "moderation" | "requests" | "audit";

export type AdminFixNextItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  severity: "critical" | "high" | "medium";
};

type AdminTrend = {
  current: number;
  previous: number;
  delta: number;
  direction: "up" | "down" | "flat";
};

export type AdminDashboardAlert = {
  id: string;
  alertKey: string;
  category: string;
  severity: "info" | "warn" | "danger";
  message: string;
  firstSeenAt: string;
  lastSeenAt: string;
  metadata: Record<string, unknown> | null;
};

type SpikeLane = "repoErrorInflow" | "moderationInflow" | "requestInflow" | "auditAnomalies";

const SPIKE_LANE_LABEL: Record<SpikeLane, string> = {
  repoErrorInflow: "Repo sync errors",
  moderationInflow: "Moderation inflow",
  requestInflow: "Project request inflow",
  auditAnomalies: "Audit anomaly bursts",
};

const SPIKE_LANE_HREF: Record<SpikeLane, string> = {
  repoErrorInflow: "/admin?focus=repos",
  moderationInflow: "/admin?focus=moderation",
  requestInflow: "/admin?focus=requests",
  auditAnomalies: "/admin?focus=audit",
};

export type AdminDashboardSummary = {
  window: AdminDashboardWindow;
  generatedAt: string;
  launchBlockerCount: number;
  repoSyncErrorCount: number;
  pendingModerationCount: number;
  pendingRequestCount: number;
  recentAuditAnomalyCount: number;
  fixNext: AdminFixNextItem[];
  activeAlerts: AdminDashboardAlert[];
  trends: {
    repoErrorInflow: AdminTrend;
    moderationInflow: AdminTrend;
    requestInflow: AdminTrend;
    auditAnomalies: AdminTrend;
  };
  spikes: {
    repoErrorInflow: boolean;
    moderationInflow: boolean;
    requestInflow: boolean;
    auditAnomalies: boolean;
  };
  drilldowns: {
    launchBlockers: Array<{
      id: string;
      title: string;
      blockerCount: number;
      topBlocker: string;
      href: string;
    }>;
    repoSyncErrors: Array<{
      id: string;
      name: string;
      provider: string;
      syncError: string;
      href: string;
    }>;
    pendingModeration: Array<{
      id: string;
      title: string;
      type: string;
      status: string;
      href: string;
    }>;
    pendingRequests: Array<{
      id: string;
      title: string;
      status: string;
      href: string;
    }>;
    auditAnomalies: Array<{
      action: string;
      count: number;
      href: string;
    }>;
  };
};

function severityRank(severity: AdminFixNextItem["severity"]): number {
  if (severity === "critical") return 3;
  if (severity === "high") return 2;
  return 1;
}

function titleCase(text: string): string {
  return text
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function lookbackMs(window: AdminDashboardWindow): number {
  return window === "7d" ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
}

function toTrend(current: number, previous: number): AdminTrend {
  const delta = current - previous;
  return {
    current,
    previous,
    delta,
    direction: delta === 0 ? "flat" : delta > 0 ? "up" : "down",
  };
}

function isSpike(trend: AdminTrend): boolean {
  return trend.direction === "up" && (trend.delta >= 3 || trend.current >= 5);
}

export async function getAdminDashboardSummary(window: AdminDashboardWindow = "24h"): Promise<AdminDashboardSummary> {
  const windowMs = lookbackMs(window);
  const lookback = new Date(Date.now() - windowMs);
  const previousLookback = new Date(Date.now() - windowMs * 2);
  const [
    draftApps,
    draftArchive,
    repoSyncErrorCount,
    repoSyncErrors,
    pendingModerationCount,
    pendingModeration,
    moderationInflowCurrent,
    moderationInflowPrevious,
    pendingRequestCount,
    pendingRequests,
    requestInflowCurrent,
    requestInflowPrevious,
    auditLogsCurrent,
    auditLogsPrevious,
    repoErrorInflowCurrent,
    repoErrorInflowPrevious,
  ] = await Promise.all([
    db.application.findMany({
      where: { visibility: "DRAFT" },
      select: {
        id: true,
        name: true,
        slug: true,
        label: true,
        tagline: true,
        audience: true,
        priceLabel: true,
        releaseChannel: true,
        details: true,
        media: { select: { featured: true } },
        versions: {
          select: { assets: { select: { visibility: true } } },
          orderBy: [{ createdAt: "desc" }],
        },
      },
      take: 20,
    }),
    db.archiveEntry.findMany({
      where: { visibility: "DRAFT" },
      select: {
        id: true,
        title: true,
        slug: true,
        stageLabel: true,
        artifactFormat: true,
        previewImageUrl: true,
        previewThumbnailUrl: true,
        details: true,
        tags: true,
        stackItems: true,
        artifactUrl: true,
        artifactLabel: true,
      },
      take: 20,
    }),
    db.codeRepository.count({ where: { syncStatus: "ERROR" } }),
    db.codeRepository.findMany({
      where: { syncStatus: "ERROR" },
      select: { id: true, name: true, provider: true, syncError: true },
      orderBy: [{ updatedAt: "desc" }],
      take: 8,
    }),
    db.creatorSubmission.count({ where: { status: { in: ["PENDING", "REVIEWING"] } } }),
    db.creatorSubmission.findMany({
      where: { status: { in: ["PENDING", "REVIEWING"] } },
      select: { id: true, title: true, type: true, status: true },
      orderBy: [{ createdAt: "asc" }],
      take: 8,
    }),
    db.creatorSubmission.count({
      where: { status: { in: ["PENDING", "REVIEWING"] }, createdAt: { gte: lookback } },
    }),
    db.creatorSubmission.count({
      where: {
        status: { in: ["PENDING", "REVIEWING"] },
        createdAt: { gte: previousLookback, lt: lookback },
      },
    }),
    db.projectRequest.count({ where: { status: { in: ["PENDING", "REVIEWING"] }, deletedAt: null } }),
    db.projectRequest.findMany({
      where: { status: { in: ["PENDING", "REVIEWING"] }, deletedAt: null },
      select: { id: true, title: true, status: true },
      orderBy: [{ createdAt: "asc" }],
      take: 8,
    }),
    db.projectRequest.count({
      where: {
        status: { in: ["PENDING", "REVIEWING"] },
        deletedAt: null,
        createdAt: { gte: lookback },
      },
    }),
    db.projectRequest.count({
      where: {
        status: { in: ["PENDING", "REVIEWING"] },
        deletedAt: null,
        createdAt: { gte: previousLookback, lt: lookback },
      },
    }),
    db.auditLog.findMany({
      where: { createdAt: { gte: lookback } },
      select: { action: true },
    }),
    db.auditLog.findMany({
      where: { createdAt: { gte: previousLookback, lt: lookback } },
      select: { action: true },
    }),
    db.codeRepository.count({
      where: { syncStatus: "ERROR", updatedAt: { gte: lookback } },
    }),
    db.codeRepository.count({
      where: { syncStatus: "ERROR", updatedAt: { gte: previousLookback, lt: lookback } },
    }),
  ]);

  const fixNext: AdminFixNextItem[] = [];
  let launchBlockerCount = 0;
  const launchBlockers: AdminDashboardSummary["drilldowns"]["launchBlockers"] = [];

  for (const app of draftApps) {
    const readiness = evaluateApplicationLaunchReadiness(app);
    if (!readiness.ready) {
      launchBlockerCount += readiness.blockers.length;
      launchBlockers.push({
        id: `draft-app-${app.id}`,
        title: app.name,
        blockerCount: readiness.blockers.length,
        topBlocker: readiness.blockers[0] ?? "Complete launch readiness checks before publishing.",
        href: "/admin",
      });
      fixNext.push({
        id: `draft-app-${app.id}`,
        title: `Publish ${app.name}`,
        description: readiness.blockers[0] ?? "Complete launch readiness checks before publishing.",
        href: "/admin",
        severity: readiness.blockers.length >= 3 ? "critical" : "high",
      });
    }
  }

  for (const entry of draftArchive) {
    const readiness = evaluateArchiveLaunchReadiness(entry);
    if (!readiness.ready) {
      launchBlockerCount += readiness.blockers.length;
      launchBlockers.push({
        id: `draft-archive-${entry.id}`,
        title: entry.title,
        blockerCount: readiness.blockers.length,
        topBlocker: readiness.blockers[0] ?? "Complete archive launch checks before publishing.",
        href: "/admin/archive",
      });
      fixNext.push({
        id: `draft-archive-${entry.id}`,
        title: `Publish ${entry.title}`,
        description: readiness.blockers[0] ?? "Complete archive launch checks before publishing.",
        href: "/admin/archive",
        severity: readiness.blockers.length >= 2 ? "high" : "medium",
      });
    }
  }

  if (repoSyncErrorCount > 0) {
    fixNext.push({
      id: "repo-sync-errors",
      title: "Resolve repository sync errors",
      description: `${repoSyncErrorCount} tracked repos are currently in ERROR state.`,
      href: "/admin/code",
      severity: "high",
    });
  }

  if (pendingModerationCount > 0) {
    fixNext.push({
      id: "pending-moderation",
      title: "Review moderation queue",
      description: `${pendingModerationCount} creator submissions are pending review.`,
      href: "/admin/moderation",
      severity: "medium",
    });
  }

  const actionCounts = new Map<string, number>();
  for (const row of auditLogsCurrent) {
    actionCounts.set(row.action, (actionCounts.get(row.action) ?? 0) + 1);
  }
  const anomalyActions = [...actionCounts.entries()].filter(([, count]) => count >= 20);
  const recentAuditAnomalyCount = anomalyActions.length;

  const previousActionCounts = new Map<string, number>();
  for (const row of auditLogsPrevious) {
    previousActionCounts.set(row.action, (previousActionCounts.get(row.action) ?? 0) + 1);
  }
  const previousAuditAnomalyCount = [...previousActionCounts.entries()].filter(([, count]) => count >= 20).length;

  const trends: AdminDashboardSummary["trends"] = {
    repoErrorInflow: toTrend(repoErrorInflowCurrent, repoErrorInflowPrevious),
    moderationInflow: toTrend(moderationInflowCurrent, moderationInflowPrevious),
    requestInflow: toTrend(requestInflowCurrent, requestInflowPrevious),
    auditAnomalies: toTrend(recentAuditAnomalyCount, previousAuditAnomalyCount),
  };
  const spikes: AdminDashboardSummary["spikes"] = {
    repoErrorInflow: isSpike(trends.repoErrorInflow),
    moderationInflow: isSpike(trends.moderationInflow),
    requestInflow: isSpike(trends.requestInflow),
    auditAnomalies: isSpike(trends.auditAnomalies),
  };

  if (recentAuditAnomalyCount > 0) {
    const [firstAction, firstCount] = anomalyActions[0];
    fixNext.push({
      id: "audit-anomalies",
      title: "Inspect audit anomaly burst",
      description: `${titleCase(firstAction)} occurred ${firstCount} times in the last ${window}.`,
      href: "/admin/audit",
      severity: "high",
    });
  }

  fixNext.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));

  await recordSpikeAlerts(window, spikes, trends);
  const activeAlerts = await listActiveDashboardAlerts();

  return {
    window,
    generatedAt: new Date().toISOString(),
    launchBlockerCount,
    repoSyncErrorCount,
    pendingModerationCount,
    pendingRequestCount,
    recentAuditAnomalyCount,
    fixNext: fixNext.slice(0, 8),
    activeAlerts,
    trends,
    spikes,
    drilldowns: {
      launchBlockers: launchBlockers
        .sort((a, b) => b.blockerCount - a.blockerCount)
        .slice(0, 8),
      repoSyncErrors: repoSyncErrors.map((repo) => ({
        id: repo.id,
        name: repo.name,
        provider: repo.provider,
        syncError: repo.syncError ?? "Sync failed",
        href: "/admin/code",
      })),
      pendingModeration: pendingModeration.map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        status: item.status,
        href: "/admin/moderation",
      })),
      pendingRequests: pendingRequests.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        href: "/admin/requests",
      })),
      auditAnomalies: anomalyActions
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([action, count]) => ({
          action,
          count,
          href: "/admin/audit",
        })),
    },
  };
}

function spikeSeverity(trend: AdminTrend): "info" | "warn" | "danger" {
  if (trend.delta >= 5 || trend.current >= 10) return "danger";
  if (trend.delta >= 3 || trend.current >= 5) return "warn";
  return "info";
}

function spikeMessage(lane: SpikeLane, trend: AdminTrend, window: AdminDashboardWindow): string {
  const label = SPIKE_LANE_LABEL[lane];
  const deltaText = trend.delta > 0 ? `+${trend.delta} vs prior ${window}` : `${trend.delta} vs prior ${window}`;
  return `${label}: ${trend.current} in last ${window} (${deltaText}).`;
}

async function recordSpikeAlerts(
  window: AdminDashboardWindow,
  spikes: AdminDashboardSummary["spikes"],
  trends: AdminDashboardSummary["trends"],
): Promise<void> {
  const lanes: SpikeLane[] = ["repoErrorInflow", "moderationInflow", "requestInflow", "auditAnomalies"];
  const now = new Date();
  for (const lane of lanes) {
    if (!spikes[lane]) continue;
    const trend = trends[lane];
    const alertKey = `spike:${lane}:${window}`;
    const severity = spikeSeverity(trend);
    const message = spikeMessage(lane, trend, window);
    const metadata = JSON.stringify({
      lane,
      window,
      current: trend.current,
      previous: trend.previous,
      delta: trend.delta,
      href: SPIKE_LANE_HREF[lane],
    });
    // Re-firing the same spike updates lastSeenAt + clears any prior ack so
    // the operator sees the recurrence; firstSeenAt is preserved.
    await db.dashboardAlert.upsert({
      where: { alertKey },
      create: {
        alertKey,
        category: "spike",
        severity,
        message,
        metadata,
        firstSeenAt: now,
        lastSeenAt: now,
      },
      update: {
        severity,
        message,
        metadata,
        lastSeenAt: now,
        acknowledgedAt: null,
        acknowledgedBy: null,
      },
    });
  }
}

export async function listActiveDashboardAlerts(): Promise<AdminDashboardAlert[]> {
  const rows = await db.dashboardAlert.findMany({
    where: { acknowledgedAt: null },
    orderBy: [{ lastSeenAt: "desc" }],
    take: 12,
  });
  return rows.map((row) => {
    let metadata: Record<string, unknown> | null = null;
    if (row.metadata) {
      try {
        metadata = JSON.parse(row.metadata) as Record<string, unknown>;
      } catch {
        metadata = null;
      }
    }
    const severity: AdminDashboardAlert["severity"] =
      row.severity === "danger" || row.severity === "warn" ? row.severity : "info";
    return {
      id: row.id,
      alertKey: row.alertKey,
      category: row.category,
      severity,
      message: row.message,
      firstSeenAt: row.firstSeenAt.toISOString(),
      lastSeenAt: row.lastSeenAt.toISOString(),
      metadata,
    };
  });
}

