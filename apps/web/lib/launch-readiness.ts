type AssetVisibility = "PUBLIC" | "ENTITLED" | "PRIVATE";

export type LaunchReadiness = {
  ready: boolean;
  blockers: string[];
  warnings: string[];
  counts: {
    media: number;
    featuredMedia: number;
    versions: number;
    publicAssets: number;
    entitledAssets: number;
  };
};

export function evaluateApplicationLaunchReadiness(input: {
  label?: string | null;
  tagline?: string | null;
  audience?: string | null;
  priceLabel?: string | null;
  releaseChannel?: string | null;
  details?: string | null;
  media: Array<{ featured: boolean }>;
  versions: Array<{ assets: Array<{ visibility: AssetVisibility }> }>;
}): LaunchReadiness {
  const publicAssets = input.versions.reduce(
    (count, version) => count + version.assets.filter((asset) => asset.visibility === "PUBLIC").length,
    0,
  );
  const entitledAssets = input.versions.reduce(
    (count, version) => count + version.assets.filter((asset) => asset.visibility === "ENTITLED").length,
    0,
  );
  const featuredMedia = input.media.filter((item) => item.featured).length;
  const latestVersion = input.versions[0];
  const latestVersionAssets = latestVersion
    ? latestVersion.assets.filter((asset) => asset.visibility === "PUBLIC" || asset.visibility === "ENTITLED").length
    : 0;

  const blockers = [
    input.label ? null : "Add a label so the catalog card has lane framing.",
    input.tagline ? null : "Add a tagline so the public detail page has a proper headline.",
    input.audience ? null : "Add an audience so the launch has a clear buyer/operator fit.",
    input.priceLabel ? null : "Add a pricing label before publishing.",
    input.releaseChannel ? null : "Add a release channel before publishing.",
    input.details ? null : "Add long-form details before publishing.",
    input.media.length > 0 ? null : "Attach at least one media item before publishing.",
    input.versions.length > 0 ? null : "Create at least one version before publishing.",
    publicAssets + entitledAssets > 0
      ? null
      : "Create at least one public or entitled release asset before publishing.",
  ].filter(Boolean) as string[];

  const warnings = [
    input.media.length > 0 && featuredMedia === 0 ? "Mark one media item as featured for stronger launch framing." : null,
    publicAssets === 0 && entitledAssets > 0
      ? "All current assets are entitlement-gated; the public download lane will not show a free public file."
      : null,
    input.versions.length > 0 && latestVersionAssets === 0
      ? "The latest version has no public or entitled asset attached yet."
      : null,
  ].filter(Boolean) as string[];

  return {
    ready: blockers.length === 0,
    blockers,
    warnings,
    counts: {
      media: input.media.length,
      featuredMedia,
      versions: input.versions.length,
      publicAssets,
      entitledAssets,
    },
  };
}

export type ProductionEnvCheck = {
  key: string;
  label: string;
  status: "ok" | "missing" | "weak";
  detail?: string;
};

export type ProductionLaunchReadiness = {
  ready: boolean;
  checks: ProductionEnvCheck[];
  blockers: ProductionEnvCheck[];
};

/**
 * Evaluate whether the runtime environment is configured for a production
 * launch. Reads only `process.env` — no DB, no network — so it is safe to
 * call at request time on a Server Component.
 *
 * The /admin/launch page surfaces the result and gates the production
 * "Go live" affordance until every check is `ok`.
 */
export function evaluateProductionLaunchReadiness(
  env: NodeJS.ProcessEnv = process.env,
): ProductionLaunchReadiness {
  const checks: ProductionEnvCheck[] = [
    requiredSecret(env, "OWNER_LOGIN_SECRET", "Owner session signing key", 32),
    requiredSecret(env, "OWNER_ACCESS_CODE", "Owner login access code", 12),
    requiredString(env, "DATABASE_URL", "Database connection string"),
    requiredString(env, "SITE_URL", "Public site URL"),
    requiredSecret(env, "STRIPE_SECRET_KEY", "Stripe secret key", 16),
    requiredSecret(env, "STRIPE_WEBHOOK_SECRET", "Stripe webhook signing secret", 16),
    requiredString(env, "AWS_S3_RELEASE_BUCKET", "S3 release bucket"),
    requiredString(env, "AWS_S3_VAULT_BUCKET", "S3 vault bucket"),
    requiredSecret(env, "AWS_ACCESS_KEY_ID", "AWS access key id", 16),
    requiredSecret(env, "AWS_SECRET_ACCESS_KEY", "AWS secret access key", 32),
    requiredString(env, "AWS_REGION", "AWS region"),
    optionalSecret(env, "GITHUB_WEBHOOK_SECRET", "GitHub webhook secret", 16),
    optionalSecret(env, "GITHUB_TOKEN", "GitHub API token (for private repos / higher rate limit)", 8),
  ];

  const blockers = checks.filter((c) => c.status !== "ok" && !c.label.startsWith("GitHub"));
  return {
    ready: blockers.length === 0,
    checks,
    blockers,
  };
}

function requiredString(env: NodeJS.ProcessEnv, key: string, label: string): ProductionEnvCheck {
  const value = env[key];
  if (!value || value.trim().length === 0) {
    return { key, label, status: "missing", detail: "Not set." };
  }
  return { key, label, status: "ok" };
}

function requiredSecret(
  env: NodeJS.ProcessEnv,
  key: string,
  label: string,
  minLength: number,
): ProductionEnvCheck {
  const value = env[key];
  if (!value || value.trim().length === 0) {
    return { key, label, status: "missing", detail: "Not set." };
  }
  if (value === "change-me-in-production" || value.length < minLength) {
    return {
      key,
      label,
      status: "weak",
      detail: `Must be at least ${minLength} characters and not the placeholder.`,
    };
  }
  return { key, label, status: "ok" };
}

function optionalSecret(
  env: NodeJS.ProcessEnv,
  key: string,
  label: string,
  minLength: number,
): ProductionEnvCheck {
  const value = env[key];
  if (!value || value.trim().length === 0) {
    return { key, label, status: "missing", detail: "Optional — recommended for production." };
  }
  if (value.length < minLength) {
    return { key, label, status: "weak", detail: `Should be at least ${minLength} characters.` };
  }
  return { key, label, status: "ok" };
}

export function evaluateArchiveLaunchReadiness(input: {
  stageLabel?: string | null;
  artifactFormat?: string | null;
  previewImageUrl?: string | null;
  previewThumbnailUrl?: string | null;
  details?: string | null;
  tags?: string | null;
  stackItems?: string | null;
  artifactUrl?: string | null;
  artifactLabel?: string | null;
}): LaunchReadiness {
  const blockers = [
    input.stageLabel ? null : "Add a stage label so the entry has launch posture.",
    input.artifactFormat ? null : "Add an artifact format before publishing.",
    input.details ? null : "Add long-form details before publishing.",
    input.artifactUrl ? null : "Add an artifact URL or route before publishing.",
  ].filter(Boolean) as string[];

  const warnings = [
    input.previewImageUrl || input.previewThumbnailUrl
      ? null
      : "Add preview artwork so the archive entry has stronger visual framing.",
    input.artifactUrl && !input.artifactLabel
      ? "Add an artifact label so the launch CTA has clearer copy."
      : null,
    input.tags ? null : "Add tags so the archive entry is easier to scan and filter.",
    input.stackItems ? null : "Add stack items so the entry communicates its technical shape.",
  ].filter(Boolean) as string[];

  return {
    ready: blockers.length === 0,
    blockers,
    warnings,
    counts: {
      media: input.previewImageUrl || input.previewThumbnailUrl ? 1 : 0,
      featuredMedia: input.previewImageUrl || input.previewThumbnailUrl ? 1 : 0,
      versions: 0,
      publicAssets: input.artifactUrl ? 1 : 0,
      entitledAssets: 0,
    },
  };
}
