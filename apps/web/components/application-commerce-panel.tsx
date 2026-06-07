import Link from "next/link";
import { CheckoutCta } from "@/components/checkout-cta";
import { DonateCta } from "@/components/donate-cta";
import { formatUsdFromCents, getDonateConfig } from "@/lib/donate-config";

type PublicReleaseAsset = {
  id: string;
  fileName: string;
  visibility: string;
};

type ApplicationCommercePanelProps = {
  applicationId: string;
  applicationSlug: string;
  applicationName: string;
  priceLabel?: string | null;
  publicDownloadAssets: PublicReleaseAsset[];
};

export function ApplicationCommercePanel({
  applicationId,
  applicationSlug,
  applicationName,
  priceLabel,
  publicDownloadAssets,
}: ApplicationCommercePanelProps) {
  const donateConfig = getDonateConfig();

  return (
    <section className="mt-8 grid gap-4 xl:grid-cols-3">
      <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
        <h2 className="display-title text-3xl font-semibold tracking-[-0.05em] text-white">Download</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          Public GitHub source archives and release assets for this project. No purchase required for source
          downloads.
        </p>
        {publicDownloadAssets.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {publicDownloadAssets.map((asset) => (
              <div key={asset.id} className="rounded-[1.2rem] border border-white/8 bg-slate-950/50 p-4">
                <p className="text-sm font-semibold text-white">{asset.fileName}</p>
                <a href={`/api/download/${asset.id}?redirect=1`} className="action-primary mt-3 inline-flex text-xs">
                  Download source
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-400">Release assets are being prepared. Check back after bootstrap.</p>
        )}
        <Link href="/downloads" className="action-secondary mt-5 inline-flex text-xs">
          Open release center
        </Link>
      </div>

      <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
        <h2 className="display-title text-3xl font-semibold tracking-[-0.05em] text-white">Purchase</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          Licensed builds and entitled deliveries will route through checkout once pricing is finalized.
        </p>
        <CheckoutCta applicationId={applicationId} priceLabel={priceLabel} />
      </div>

      <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
        <h2 className="display-title text-3xl font-semibold tracking-[-0.05em] text-white">Donate</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          Fund this project via GitHub Sponsors or the foundry tip-jar checkout lane.
        </p>
        <DonateCta
          applicationId={applicationId}
          applicationSlug={applicationSlug}
          applicationName={applicationName}
          externalDonateUrl={donateConfig.externalUrl}
          defaultAmountLabel={formatUsdFromCents(donateConfig.defaultAmountCents)}
          checkoutEnabled={donateConfig.checkoutEnabled}
          githubSponsorsUsername={donateConfig.githubSponsorsUsername}
        />
      </div>
    </section>
  );
}
