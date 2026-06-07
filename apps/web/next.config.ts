import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // S3 release / media buckets — exact host is env-driven; allow the v-host
      // pattern so we do not need to redeploy when buckets are renamed.
      { protocol: "https", hostname: "*.s3.amazonaws.com" },
      { protocol: "https", hostname: "*.s3.*.amazonaws.com" },
      // GitHub user-content (avatars, repo OG images surfaced from the code module).
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "opengraph.githubassets.com" },
    ],
  },
};

// Wire @next/bundle-analyzer when ANALYZE=1 so the package stays a dev-time
// concern and never gets pulled into the runtime bundle. Requires devDep:
//   pnpm add -D -F web @next/bundle-analyzer
// Run with: ANALYZE=1 pnpm --filter web build
const exported: NextConfig =
  process.env.ANALYZE === "1"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require("@next/bundle-analyzer")({ enabled: true })(nextConfig) as NextConfig)
    : nextConfig;

export default exported;
