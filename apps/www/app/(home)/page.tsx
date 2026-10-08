import {
  ArrowRight,
  Code as CodeIcon,
  ListTree,
  PanelLeft,
  Search,
  Sparkles,
  Type,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Code, PackageCommand } from "@/components/home/code";
import { ThemePreview } from "@/components/home/theme-preview";
import { Logo } from "@/components/logo";
import { Card, Cards } from "@/registry/base/docs/components/card";

const migrationDiff = `
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { DocsLayout } from "@/components/docs/layouts/docs";
`;

const installTree = `
components/
├── docs/
│   ├── layouts/     DocsLayout…
│   ├── components/  CodeBlock, TOC…
│   ├── provider/    RootProvider
│   └── mdx.tsx      MDX components
└── ui/              your shadcn/ui
`;

const features = [
  {
    icon: <PanelLeft />,
    title: "Docs layout",
    description:
      "Built on the shadcn/ui sidebar, with the page tree, layout tabs, links and a mobile menu.",
  },
  {
    icon: <Search />,
    title: "Search",
    description:
      "A ⌘K dialog for Fumadocs' search server, with tag filters and keyboard navigation.",
  },
  {
    icon: <ListTree />,
    title: "Navigation",
    description:
      "A table of contents that follows the headings in view, breadcrumbs and previous/next links.",
  },
  {
    icon: <CodeIcon />,
    title: "MDX components",
    description:
      "Shiki code blocks and code tabs, linked headings, callouts and cards for Fumadocs MDX content.",
  },
  {
    icon: <Sparkles />,
    title: "Ready for AI",
    description:
      "Copy a page as Markdown, or open it in ChatGPT, Claude or Cursor, from every page.",
  },
  {
    icon: <Type />,
    title: "Typography",
    description:
      "Prose styles built from your theme tokens, plus generated Open Graph images.",
  },
];

export default function HomePage() {
  return (
    <>
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
            <Link href="/docs" className={buttonVariants({ size: "lg" })}>
              Get started
            </Link>
            <Link
              href="/docs/migrating-from-fumadocs-ui"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Migrate from Fumadocs UI
            </Link>
          </div>
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
              diff={{ remove: [1], add: [2] }}
            />
          </Path>
        </div>
      </Section>

      <Section
        title="Everything a docs site needs"
        description="The pieces of Fumadocs UI, rebuilt on shadcn/ui."
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
          <Code code={installTree} lang="text" allowCopy={false} />
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-6 px-4 py-20 text-center">
          <Logo className="size-8" />
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Write docs, not docs components
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/docs" className={buttonVariants({ size: "lg" })}>
              Get started
            </Link>
            <a
              href="https://github.com/ruiyuwg/docscn"
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              GitHub
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground">
          <p>© 2026 Ruiyu Wang. MIT licensed.</p>
          <p>
            Built on{" "}
            <FooterLink href="https://fumadocs.dev">Fumadocs</FooterLink> and{" "}
            <FooterLink href="https://ui.shadcn.com">shadcn/ui</FooterLink>.
          </p>
        </div>
      </footer>
    </>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-4 py-20">
        <div className="flex max-w-2xl flex-col gap-3">
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
