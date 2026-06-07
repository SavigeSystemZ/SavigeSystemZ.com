export type DonateConfig = {
  /** GitHub Sponsors / Ko-fi / external founder hub URL. */
  externalUrl: string;
  githubSponsorsUsername: string;
  /** Default donation amount in cents when Stripe checkout is used. */
  defaultAmountCents: number;
  /** Whether Stripe (or mock) donate checkout is available. */
  checkoutEnabled: boolean;
};

const DEFAULT_SPONSORS_USERNAME = "whyte";

export function getDonateConfig(): DonateConfig {
  const githubSponsorsUsername =
    process.env.FOUNDER_GITHUB_SPONSORS_USERNAME?.trim() || DEFAULT_SPONSORS_USERNAME;
  const externalUrl =
    process.env.FOUNDER_DONATE_URL?.trim() || `https://github.com/sponsors/${githubSponsorsUsername}`;
  const defaultAmountCents = Number(process.env.DEFAULT_DONATE_AMOUNT_CENTS ?? "500");
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY?.trim());

  return {
    externalUrl,
    githubSponsorsUsername,
    defaultAmountCents: Number.isFinite(defaultAmountCents) && defaultAmountCents > 0 ? defaultAmountCents : 500,
    checkoutEnabled: stripeConfigured || process.env.NODE_ENV !== "production",
  };
}

/** UTM-tagged external donate URL so sponsors traffic is attributable per catalog entry. */
export function buildProjectDonateExternalUrl(baseUrl: string, applicationSlug: string): string {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("utm_source", "savigesystemz.com");
    url.searchParams.set("utm_medium", "application");
    url.searchParams.set("utm_campaign", applicationSlug);
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}
