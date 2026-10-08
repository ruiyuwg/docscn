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
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";
`;

const blockFiles = `
app/docs/layout.tsx
app/docs/[[...slug]]/page.tsx
app/api/search/route.ts
lib/source.ts
lib/layout.shared.tsx
components/mdx.tsx
components/docs/…
content/docs/index.mdx
`;

const installTree = `
components/
├── docs/
│   ├── layouts/
│   │   ├── docs/       DocsLayout, DocsPage
│   │   └── home/       HomeLayout
│   ├── components/     CodeBlock, Callout, TOC…
│   ├── provider/       RootProvider
│   └── mdx.tsx         defaultMdxComponents
└── ui/                 your shadcn/ui
    ├── sidebar.tsx
    ├── tabs.tsx
    └── …
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
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_top,black,transparent_70%)] bg-size-[32px_32px]"
        />
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 pt-20 pb-16 text-center sm:pt-28">
          <Link
            href="/docs/compatibility"
            className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Early release: see what&apos;s supported
            <ArrowRight className="size-3" />
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Docs that look like the rest of your app
          </h1>
          <p className="max-w-2xl text-lg text-balance text-muted-foreground">
            docscn is a shadcn/ui registry of documentation components built on
            Fumadocs Core. Layouts, search, a table of contents and MDX
            components, installed as source and styled with your theme.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
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
          <PackageCommand
            command="shadcn@latest add @docscn/docs"
            className="my-0 w-full max-w-lg text-start"
          />
        </div>
      </section>

      <Section
        title="Your theme, your docs"
        description="These are docscn.dev's own docs. Change the theme variables and they follow, because every component is built from your shadcn/ui tokens and primitives."
      >
        <ThemePreview />
      </Section>

      <Section
        title="Start fresh or migrate"
        description="Add docs to a shadcn/ui project, or move an existing Fumadocs UI site over without touching your content."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Path
            title="New docs site"
            description="The docs block adds every component, the /docs routes, a search API and a first page. Then make two small edits to your root layout and Next.js config."
            href="/docs/getting-started"
            link="Getting started"
          >
            <Code code={blockFiles} lang="text" title="Files added" />
          </Path>
          <Path
            title="From Fumadocs UI"
            description="Components keep Fumadocs UI's names, props and module paths, so migrating is a find-and-replace. CI migrates and builds a stock create-fumadocs-app project on every change."
            href="/docs/migrating-from-fumadocs-ui"
            link="Migration guide"
          >
            <Code
              code={migrationDiff}
              lang="tsx"
              title="app/docs/layout.tsx"
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

      <Section
        title="You own the code"
        description="Components install into components/docs and build on the shadcn/ui primitives you already have. Change anything by editing your copy, like any other component in your app."
      >
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <ul className="grid gap-4 text-sm text-muted-foreground">
            <Point title="Fumadocs Core underneath">
              Page trees, search and table of contents data come from Fumadocs
              Core, so any content source Fumadocs supports works.
            </Point>
            <Point title="Your primitives">
              The sidebar, tabs, alerts, cards and dialogs are your own
              shadcn/ui components, not a second copy.
            </Point>
            <Point title="Your tokens">
              No extra colour themes or CSS presets. Everything uses background,
              muted-foreground, sidebar and the rest of your theme.
            </Point>
          </ul>
          <Code code={installTree} lang="text" />
        </div>
      </Section>

      <section className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center">
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
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground">
          <p>
            Built on{" "}
            <FooterLink href="https://fumadocs.dev">Fumadocs</FooterLink> and{" "}
            <FooterLink href="https://ui.shadcn.com">shadcn/ui</FooterLink>. MIT
            licensed.
          </p>
          <FooterLink href="https://github.com/ruiyuwg/docscn">
            GitHub
          </FooterLink>
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
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-20">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          <p className="text-balance text-muted-foreground">{description}</p>
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
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
