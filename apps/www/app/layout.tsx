import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { siteDescription, siteName, siteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { RootProvider } from "@/registry/base/docs/provider/next";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName}: documentation components for shadcn/ui`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName,
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
      className={cn("font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="flex min-h-svh flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
