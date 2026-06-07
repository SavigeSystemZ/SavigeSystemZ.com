import type { CatalogVerifyResult } from "@/lib/verify-catalog-completeness";

export type StagingEnvCheck = {
  key: string;
  label: string;
  status: "ok" | "missing" | "weak" | "optional";
  detail?: string;
};

export type StagingReadinessReport = {
  ready: boolean;
  mode: "staging" | "production";
  envChecks: StagingEnvCheck[];
  blockers: StagingEnvCheck[];
  catalog?: Pick<CatalogVerifyResult, "ok" | "applicationCount" | "expectedRepoCount" | "issues">;
};

/**
 * Staging-focused env checks — Stripe test keys and S3 media/release buckets.
 * Softer than production launch: vault bucket optional; presign flag required for uploads.
 */
export function evaluateStagingEnvReadiness(
  env: Record<string, string | undefined> = process.env,
): StagingReadinessReport {
  const checks: StagingEnvCheck[] = [
    requiredString(env, "DATABASE_URL", "Database connection string"),
    requiredString(env, "SITE_URL", "Public site URL"),
    requiredSecret(env, "OWNER_LOGIN_SECRET", "Owner session signing key", 32),
    requiredSecret(env, "OWNER_ACCESS_CODE", "Owner login access code", 12),
    stripeKey(env),
    requiredSecret(env, "STRIPE_WEBHOOK_SECRET", "Stripe webhook signing secret", 16),
    presignFlag(env),
    requiredString(env, "AWS_S3_MEDIA_BUCKET", "S3 application media bucket"),
    requiredString(env, "AWS_S3_RELEASE_BUCKET", "S3 release assets bucket"),
    requiredString(env, "AWS_REGION", "AWS region"),
    awsCredentials(env, "AWS_ACCESS_KEY_ID", "AWS access key id", 16),
    awsCredentials(env, "AWS_SECRET_ACCESS_KEY", "AWS secret access key", 32),
    optionalString(env, "AWS_S3_VAULT_BUCKET", "S3 vault bucket (optional on staging)"),
    optionalString(env, "GITHUB_TOKEN", "GitHub API token (recommended for live sync)"),
  ];

  const blockers = checks.filter((check) => check.status === "missing" || check.status === "weak");
  return {
    ready: blockers.length === 0,
    mode: "staging",
    envChecks: checks,
    blockers,
  };
}

function requiredString(env: Record<string, string | undefined>, key: string, label: string): StagingEnvCheck {
  const value = env[key];
  if (!value?.trim()) return { key, label, status: "missing", detail: "Not set." };
  return { key, label, status: "ok" };
}

function optionalString(env: Record<string, string | undefined>, key: string, label: string): StagingEnvCheck {
  const value = env[key];
  if (!value?.trim()) return { key, label, status: "optional", detail: "Optional for staging." };
  return { key, label, status: "ok" };
}

function requiredSecret(
  env: Record<string, string | undefined>,
  key: string,
  label: string,
  minLength: number,
): StagingEnvCheck {
  const value = env[key];
  if (!value?.trim()) return { key, label, status: "missing", detail: "Not set." };
  if (value === "change-me-in-production" || value.length < minLength) {
    return { key, label, status: "weak", detail: `Must be at least ${minLength} characters.` };
  }
  return { key, label, status: "ok" };
}

function awsCredentials(
  env: Record<string, string | undefined>,
  key: string,
  label: string,
  minLength: number,
): StagingEnvCheck {
  const value = env[key];
  if (!value?.trim()) {
    return {
      key,
      label,
      status: "weak",
      detail: "Missing — presign routes return 501 until IAM credentials are configured.",
    };
  }
  if (value.length < minLength) return { key, label, status: "weak", detail: `Should be at least ${minLength} characters.` };
  return { key, label, status: "ok" };
}

function presignFlag(env: Record<string, string | undefined>): StagingEnvCheck {
  const value = env.AWS_S3_PRESIGN_ENABLED?.trim();
  if (!value || value === "0" || value.toLowerCase() === "false") {
    return {
      key: "AWS_S3_PRESIGN_ENABLED",
      label: "S3 presign enabled flag",
      status: "weak",
      detail: "Set to 1 so admin media/release upload routes issue presigned URLs.",
    };
  }
  return { key: "AWS_S3_PRESIGN_ENABLED", label: "S3 presign enabled flag", status: "ok" };
}

function stripeKey(env: Record<string, string | undefined>): StagingEnvCheck {
  const value = env.STRIPE_SECRET_KEY?.trim();
  if (!value) {
    return { key: "STRIPE_SECRET_KEY", label: "Stripe secret key", status: "missing", detail: "Use sk_test_… on staging." };
  }
  if (!value.startsWith("sk_test_") && !value.startsWith("sk_live_")) {
    return { key: "STRIPE_SECRET_KEY", label: "Stripe secret key", status: "weak", detail: "Unexpected key format." };
  }
  if (value.startsWith("sk_live_")) {
    return {
      key: "STRIPE_SECRET_KEY",
      label: "Stripe secret key",
      status: "weak",
      detail: "Live Stripe key detected — use sk_test_ on staging.",
    };
  }
  return { key: "STRIPE_SECRET_KEY", label: "Stripe secret key (test mode)", status: "ok" };
}

export function mergeStagingReport(
  envReport: StagingReadinessReport,
  catalog: CatalogVerifyResult,
): StagingReadinessReport {
  const catalogBlockers: StagingEnvCheck[] = catalog.ok
    ? []
    : [
        {
          key: "catalog_completeness",
          label: "Catalog completeness",
          status: "weak",
          detail: `${catalog.issues.length} issue(s): ${catalog.issues[0]?.message ?? "run pnpm code:verify-catalog"}`,
        },
      ];

  const blockers = [...envReport.blockers, ...catalogBlockers];
  return {
    ...envReport,
    ready: blockers.length === 0,
    blockers,
    catalog: {
      ok: catalog.ok,
      applicationCount: catalog.applicationCount,
      expectedRepoCount: catalog.expectedRepoCount,
      issues: catalog.issues.slice(0, 8),
    },
  };
}
