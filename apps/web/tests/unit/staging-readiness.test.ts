import { describe, expect, it } from "vitest";
import { evaluateStagingEnvReadiness, mergeStagingReport } from "@/lib/staging-readiness";

const stagingEnv = {
  DATABASE_URL: "postgresql://ssz:dev@localhost:5433/savige",
  SITE_URL: "http://127.0.0.1:43907",
  OWNER_LOGIN_SECRET: "e2e-owner-secret-change-me-32chars",
  OWNER_ACCESS_CODE: "e2e-owner-code",
  STRIPE_SECRET_KEY: "sk_test_123456789012345",
  STRIPE_WEBHOOK_SECRET: "whsec_123456789012345",
  AWS_S3_PRESIGN_ENABLED: "1",
  AWS_S3_MEDIA_BUCKET: "ssz-staging-media",
  AWS_S3_RELEASE_BUCKET: "ssz-staging-releases",
  AWS_REGION: "us-east-1",
  AWS_ACCESS_KEY_ID: "AKIA1234567890123",
  AWS_SECRET_ACCESS_KEY: "0123456789abcdef0123456789abcdef01234567",
};

describe("evaluateStagingEnvReadiness", () => {
  it("flags missing Stripe and S3 presign on empty env", () => {
    const report = evaluateStagingEnvReadiness({});
    expect(report.ready).toBe(false);
    expect(report.blockers.some((check) => check.key === "STRIPE_SECRET_KEY")).toBe(true);
    expect(report.blockers.some((check) => check.key === "AWS_S3_PRESIGN_ENABLED")).toBe(true);
  });

  it("passes with staging-shaped env", () => {
    const report = evaluateStagingEnvReadiness(stagingEnv);
    expect(report.ready).toBe(true);
  });

  it("merges catalog failures into staging report", () => {
    const envReport = evaluateStagingEnvReadiness(stagingEnv);
    const merged = mergeStagingReport(envReport, {
      ok: false,
      expectedRepoCount: 52,
      codeRepositoryCount: 52,
      applicationCount: 40,
      uiCatalogScreenshotCount: 40,
      issues: [{ code: "count_mismatch", message: "PUBLIC applications (40) != catalog repos (52)" }],
    });
    expect(merged.ready).toBe(false);
    expect(merged.catalog?.applicationCount).toBe(40);
  });
});
