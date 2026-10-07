import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-4 py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Docs components for shadcn/ui
      </h1>
      <p className="text-lg text-balance text-muted-foreground">
        docscn is a shadcn/ui registry of documentation components built on
        Fumadocs Core: docs layouts, sidebars, tables of contents, search and
        MDX components, installed into your app and styled with your theme.
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
      <code className="mx-auto rounded-lg border bg-muted px-4 py-2 font-mono text-sm">
        pnpm dlx shadcn@latest add @docscn/docs
      </code>
    </div>
  );
}
