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
