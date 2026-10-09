import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { RootProvider } from "@/registry/base/docs/provider/next";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const description =
  "Documentation components for shadcn/ui, built on Fumadocs Core.";

export const metadata: Metadata = {
  metadataBase: new URL("https://docscn.dev"),
  title: "docscn",
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "docscn",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["SoftwareApplication", "SoftwareSourceCode"],
  name: "docscn",
  description,
  url: "https://docscn.dev",
  codeRepository: "https://github.com/ruiyuwg/docscn",
  programmingLanguage: "TypeScript",
  runtimePlatform: "Next.js",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  license: "https://opensource.org/licenses/MIT",
  sameAs: ["https://github.com/ruiyuwg/docscn"],
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
        <script
          type="application/ld+json"
          // JSON-LD for agents and search engines, escaped as Next.js' guide does
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
