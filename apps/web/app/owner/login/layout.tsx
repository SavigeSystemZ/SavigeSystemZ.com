import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner login",
  robots: { index: false, follow: false },
};

export default function OwnerLoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
