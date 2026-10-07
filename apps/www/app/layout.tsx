import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://docscn.dev"),
  title: "docscn",
  description:
    "Documentation components for shadcn/ui, built on Fumadocs Core.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
