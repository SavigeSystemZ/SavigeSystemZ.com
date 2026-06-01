import { type AdminDashboardSummary } from "@/lib/admin-dashboard";

export type OperatorRoute = {
  href: string;
  label: string;
  reason: string;
};

export type OperatorReply = {
  answer: string;
  topic: "health" | "moderation" | "repos" | "requests" | "audit" | "general";
  routes: OperatorRoute[];
  highlights: string[];
};



const topicKeywords = {
  health: ["health", "status", "spikes", "alerts", "errors", "fix", "urgent", "dashboard"],
  moderation: ["moderation", "review", "submissions", "creator", "queue", "approve", "reject"],
  repos: ["repo", "repos", "sync", "github", "code", "errors"],
  requests: ["requests", "projects", "build", "custom", "queue"],
  audit: ["audit", "anomalies", "bursts", "security", "logs"],
  general: [],
} satisfies Record<OperatorReply["topic"], string[]>;

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
}

function pickTopic(message: string): OperatorReply["topic"] {
  const lowered = normalize(message);
  let bestTopic: OperatorReply["topic"] = "general";
  let bestScore = 0;

  for (const [topic, keywords] of Object.entries(topicKeywords) as Array<[OperatorReply["topic"], string[]]>) {
    const score = keywords.reduce((total, keyword) => total + (lowered.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  return bestTopic;
}

export function buildOperatorReply(message: string, dashboard: AdminDashboardSummary): OperatorReply {
  const topic = pickTopic(message);

  const activeSpikes = Object.entries(dashboard.spikes).filter(([, isSpike]) => isSpike).map(([lane]) => lane);
  const hasSpikes = activeSpikes.length > 0;
  const urgentFixes = dashboard.fixNext.filter((f) => f.severity === "critical" || f.severity === "high");

  switch (topic) {
    case "health":
      return {
        topic,
        answer: hasSpikes
          ? `There are active spikes in ${activeSpikes.join(", ")}. ${urgentFixes.length} urgent issues need attention.`
          : `System health is nominal. ${dashboard.fixNext.length > 0 ? `There are ${dashboard.fixNext.length} items in the fix-next queue.` : "No urgent issues detected."}`,
        routes: [
          { href: "/admin", label: "Open dashboard", reason: "View top-level health and alerts." },
          ...(hasSpikes ? [{ href: "/admin/audit", label: "View Audit", reason: "Inspect system anomalies." }] : []),
        ],
        highlights: dashboard.activeAlerts.slice(0, 3).map((a) => a.message),
      };
    case "moderation":
      return {
        topic,
        answer: dashboard.pendingModerationCount > 0
          ? `There are ${dashboard.pendingModerationCount} submissions pending moderation. ${dashboard.spikes.moderationInflow ? "Warning: There is a spike in moderation inflow." : ""}`
          : "The moderation queue is currently empty.",
        routes: [
          { href: "/admin/moderation", label: "Process Queue", reason: "Review pending creator submissions." },
        ],
        highlights: dashboard.drilldowns.pendingModeration.slice(0, 3).map((m) => `${m.title} (${m.type}) - ${m.status}`),
      };
    case "repos":
      return {
        topic,
        answer: dashboard.repoSyncErrorCount > 0
          ? `There are ${dashboard.repoSyncErrorCount} repositories with sync errors. ${dashboard.spikes.repoErrorInflow ? "Warning: Spike in repo sync errors." : ""}`
          : "All repository syncs are healthy.",
        routes: [
          { href: "/admin/code", label: "Open Code Manager", reason: "Review and fix repository syncs." },
        ],
        highlights: dashboard.drilldowns.repoSyncErrors.slice(0, 3).map((r) => `${r.name}: ${r.syncError}`),
      };
    case "requests":
      return {
        topic,
        answer: dashboard.pendingRequestCount > 0
          ? `There are ${dashboard.pendingRequestCount} project requests awaiting review.`
          : "The project request queue is currently empty.",
        routes: [
          { href: "/admin/requests", label: "View Requests", reason: "Process inbound project requests." },
        ],
        highlights: dashboard.drilldowns.pendingRequests.slice(0, 3).map((r) => `${r.title} - ${r.status}`),
      };
    case "audit":
      return {
        topic,
        answer: dashboard.recentAuditAnomalyCount > 0
          ? `Detected ${dashboard.recentAuditAnomalyCount} anomaly bursts in the last ${dashboard.window}.`
          : "No audit anomalies detected in the current window.",
        routes: [
          { href: "/admin/audit", label: "Review Audit Log", reason: "Inspect high-volume actions." },
        ],
        highlights: dashboard.drilldowns.auditAnomalies.slice(0, 3).map((a) => `${a.action} (${a.count}x)`),
      };
    default:
      return {
        topic: "general",
        answer: `I am the owner copilot. The dashboard is tracking ${dashboard.launchBlockerCount} blockers, ${dashboard.repoSyncErrorCount} sync errors, and ${dashboard.pendingModerationCount} items in moderation. How can I help you operate the foundry?`,
        routes: [
          { href: "/admin", label: "Dashboard", reason: "Command center overview." },
          { href: "/admin/vault", label: "Vault", reason: "Access owner-only artifacts." },
          { href: "/owner/workspace", label: "Workspace", reason: "Switch to private projects." },
        ],
        highlights: [
          `${dashboard.activeAlerts.length} active alerts`,
          `${urgentFixes.length} urgent fixes needed`,
        ],
      };
  }
}
