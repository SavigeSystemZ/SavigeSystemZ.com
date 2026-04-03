import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AiDock } from "@/components/ai-dock";
import { getSiteUrl } from "@/lib/site-url";

const bodySans = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const displayFont = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteDescription =
  "Flagship software foundry for applications, releases, systems engineering work, AI experiments, and secure owner operations.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  description: siteDescription,
  title: "SavigeSystemZ · Foundry and Operator Platform",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "SavigeSystemZ",
    title: "SavigeSystemZ · Foundry and Operator Platform",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "SavigeSystemZ · Foundry and Operator Platform",
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodySans.variable} ${displayFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <a
          href="#main-content"
          className="pointer-events-none fixed left-4 top-4 z-[100] -translate-y-[150%] rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 opacity-0 shadow-lg transition focus:pointer-events-auto focus:translate-y-0 focus:opacity-100 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-cyan-300"
        >
          Skip to content
        </a>
        <div className="flex min-h-full flex-1 flex-col">{children}</div>
        <AiDock />
      </body>
    </html>
  );
}
