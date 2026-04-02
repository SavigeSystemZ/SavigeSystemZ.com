import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: {
    template: "%s | SavigeSystemZ",
    default: "SavigeSystemZ · Software Foundry",
  },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 flex-col outline-none focus:outline-none"
      >
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
