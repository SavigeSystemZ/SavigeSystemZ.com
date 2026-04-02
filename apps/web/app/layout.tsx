import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AiDock } from "@/components/ai-dock";
import { getSiteUrl } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteDescription =
  "Flagship app showcase, release hub, founder profile, AI concierge, and secure owner operations.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  description: siteDescription,
  title: "SavigeSystemZ · Software Foundry",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "SavigeSystemZ",
    title: "SavigeSystemZ · Software Foundry",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "SavigeSystemZ · Software Foundry",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-950 text-zinc-100">
        <a
          href="#main-content"
          className="pointer-events-none fixed left-4 top-4 z-[100] -translate-y-[150%] rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 opacity-0 shadow-lg transition focus:pointer-events-auto focus:translate-y-0 focus:opacity-100 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-cyan-300"
        >
          Skip to content
        </a>
        <div id="main-content" tabIndex={-1} className="flex min-h-full flex-1 flex-col outline-none">
          {children}
        </div>
        <AiDock />
      </body>
    </html>
  );
}
