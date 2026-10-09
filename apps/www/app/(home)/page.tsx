import { cn } from "cn";
import {
  ArrowRight,
  Bot,
  Code as CodeIcon,
  Languages,
  ListTree,
  MessageCircle,
  Palette,
  PanelLeft,
  Search,
  SquareStack,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Code, PackageCommand } from "@/components/home/code";
import { JsonLd } from "@/components/json-ld";
import { ThemePreview } from "@/components/home/theme-preview";
import { Logo } from "@/components/logo";
import { siteDescription, siteName, siteUrl, websiteId } from "@/lib/site";
import { Card, Cards } from "@/registry/base/docs/components/card";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName, url: "/" },
};

const githubUrl = "https://github.com/ruiyuwg/docscn";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: siteName,
      url: siteUrl,
      description: siteDescription,
      inLanguage: "en",
    },
    {
      "@type": ["SoftwareApplication", "SoftwareSourceCode"],
      name: siteName,
      description: siteDescription,
      url: siteUrl,
      codeRepository: githubUrl,
      programmingLanguage: "TypeScript",
      runtimePlatform: "Next.js",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      license: "https://opensource.org/licenses/MIT",
      sameAs: [githubUrl],
    },
  ],
};

const installCommand = "npx shadcn@latest add @docscn/docs";

// the path on its own line, so the diff fits on phones
const migrationDiff = `
import { DocsLayout }
  from "fumadocs-ui/layouts/docs";
  from "@/components/docs/layouts/docs";
`;

// what the docs block installs, with notes from column 21
const installTree = `
app/
├── api/search/      search server
└── docs/            docs routes
components/
├── docs/            docscn
│   ├── layouts/     DocsLayout, DocsPage
│   ├── components/  CodeBlock, Callout
│   ├── provider/    RootProvider
│   └── mdx.tsx      MDX defaults
├── ui/              your shadcn/ui
└── mdx.tsx          your MDX components
content/docs/        your pages
lib/
├── layout.shared.tsx
└── source.ts        content source
`;

const features = [
  {
    icon: <PanelLeft />,
    title: "Layouts",
    description:
      "Docs, notebook and home layouts on the shadcn/ui sidebar, with the page tree, tabs and a mobile menu.",
    href: "/docs/components/docs-layout",
  },
  {
    icon: <Search />,
    title: "Search",
    description:
      "A ⌘K dialog for Fumadocs' search server, with tag filters and keyboard navigation.",
    href: "/docs/components/search-dialog",
  },
  {
    icon: <ListTree />,
    title: "Navigation",
    description:
      "A table of contents that follows the headings in view, breadcrumbs and previous/next links.",
    href: "/docs/components/toc",
  },
  {
    icon: <CodeIcon />,
    title: "Code blocks",
    description:
      "Fumadocs MDX's Shiki output with titles, icons, tabs and copy buttons, in light and dark.",
    href: "/docs/components/codeblock",
  },
  {
    icon: <SquareStack />,
    title: "MDX components",
    description:
      "Callouts, cards, tabs, steps, accordions, file trees and type tables for your pages.",
    href: "/docs/components/mdx",
  },
  {
    icon: <MessageCircle />,
    title: "AI chat",
    description:
      "An Ask AI dialog that answers readers' questions from your pages.",
    href: "/docs/components/ai-chat",
  },
  {
    icon: <Bot />,
    title: "Ready for agents",
    description:
      "Copy a page as Markdown or open it in ChatGPT, Claude or Cursor. Coding agents get docscn's skill.",
    href: "/docs/ai-agents",
  },
  {
    icon: <Palette />,
    title: "Theming and typography",
    description:
      "Every component and the prose styles are built from your shadcn/ui theme tokens.",
    href: "/docs/theming",
  },
  {
    icon: <Languages />,
    title: "Internationalization",
    description:
      "UI strings translated as in Fumadocs UI, so its language packs work, plus a language switcher.",
    href: "/docs/internationalization",
  },
];

const footerLinks = [
  { text: "Docs", href: "/docs" },
  { text: "Components", href: "/docs#whats-included" },
  { text: "Compatibility", href: "/docs/compatibility" },
  { text: "GitHub", href: githubUrl },
  { text: "llms.txt", href: "/llms.txt" },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="pb-20">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pt-12 pb-12 text-center sm:pt-18 sm:pb-16">
          <Link
            href="/docs/compatibility"
            className="mb-5 inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Early release: see what&apos;s supported
            <ArrowRight className="size-3" />
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Docs that look like the rest of your app
          </h1>
          <p className="mt-4 max-w-2xl text-base text-balance text-muted-foreground sm:text-lg">
            docscn is a shadcn/ui registry of documentation components that work
            with Fumadocs.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/docs" className={cn(buttonVariants({ size: "lg" }))}>
              Get started
            </Link>
            <Link
              href="/docs/migrating-from-fumadocs-ui"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Migrate from Fumadocs UI
            </Link>
          </div>
          <Code
            code={installCommand}
            lang="bash"
            className="my-0 mt-6 w-full max-w-sm text-left"
          />
        </div>
        <div className="mx-auto w-full max-w-[1400px] px-4">
          <ThemePreview />
        </div>
      </section>

      <Section title="Start fresh or migrate">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-4">
          <Path
            title="New docs site"
            description="One command adds the components, routes, search and a first page."
            href="/docs/getting-started"
            link="Getting started"
          >
            <PackageCommand
              command="shadcn@latest add @docscn/docs"
              className="my-0"
            />
          </Path>
          <Path
            title="From Fumadocs UI"
            description="Same component names, props and module paths. Swap the import prefix."
            href="/docs/migrating-from-fumadocs-ui"
            link="Migration guide"
          >
            <Code
              code={migrationDiff}
              lang="tsx"
              title="Find and replace"
              diff={{ remove: [2], add: [3] }}
            />
          </Path>
        </div>
      </Section>

      <Section
        title="Everything a docs site needs"
        description="The pieces of Fumadocs UI, rebuilt on shadcn/ui."
        centered
        className="bg-muted/40 dark:bg-muted/20"
      >
        <Cards className="my-0 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} {...feature} />
          ))}
        </Cards>
      </Section>

      <section className="border-t">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-10 px-4 py-20 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              You own the code
            </h2>
            <p className="text-balance text-muted-foreground">
              Components install into components/docs as source you edit like
              the rest of your app.
            </p>
            <ul className="mt-5 grid gap-4 text-sm text-muted-foreground">
              <Point title="Your primitives and tokens">
                Built on your sidebar, tabs and dialogs, styled with your theme.
              </Point>
              <Point title="Any content source">
                Data comes from Fumadocs Core, so any source Fumadocs supports
                works.
              </Point>
            </ul>
          </div>
          <Code
            code={installTree}
            lang="text"
            title="Your project"
            muted={21}
            allowCopy={false}
          />
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-6 px-4 py-20 text-center">
          <Logo className="size-8" />
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Write docs, not docs components
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/docs" className={cn(buttonVariants({ size: "lg" }))}>
              Get started
            </Link>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              <GitHubIcon />
              GitHub
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-1.5 font-semibold text-foreground"
            >
              <Logo className="size-3.5" />
              docscn
            </Link>
            <p>
              Built on{" "}
              <FooterLink href="https://fumadocs.dev">Fumadocs</FooterLink> and{" "}
              <FooterLink href="https://ui.shadcn.com">shadcn/ui</FooterLink>. ©
              2026 Ruiyu Wang. MIT licensed.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </>
  );
}

function Section({
  title,
  description,
  centered = false,
  className,
  children,
}: {
  title: string;
  description?: string;
  /** centre the heading over the content */
  centered?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("border-t", className)}>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-4 py-20">
        <div
          className={cn(
            "flex max-w-2xl flex-col gap-3",
            centered && "mx-auto items-center text-center",
          )}
        >
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          {description && (
            <p className="text-balance text-muted-foreground">{description}</p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

function Path({
  title,
  description,
  href,
  link,
  children,
}: {
  title: string;
  description: string;
  href: string;
  link: string;
  children: ReactNode;
}) {
  return (
    // on large screens, share the parent grid's rows so the header, code and
    // link line up across both columns
    <div className="flex flex-col gap-4 lg:row-span-3 lg:grid lg:grid-rows-subgrid lg:items-start">
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
      <Link
        href={href}
        className="inline-flex w-fit items-center gap-1 text-sm font-medium hover:underline"
      >
        {link}
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function Point({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="flex flex-col gap-1">
      <span className="font-medium text-foreground">{title}</span>
      {children}
    </li>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-foreground underline-offset-4 hover:underline"
    >
      {children}
    </a>
  );
}

function GitHubIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
