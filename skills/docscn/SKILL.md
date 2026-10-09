---
name: docscn
description: Add documentation to a Next.js project that uses shadcn/ui, with docscn's components built on Fumadocs Core. Use when setting up docs pages, a docs layout, search or AI chat in a shadcn/ui app, when migrating a Fumadocs project off fumadocs-ui, or when editing files under components/docs/ or writing pages in content/docs.
---

# docscn

docscn is a shadcn/ui registry of documentation components: docs layouts, sidebars, tables of contents, search, MDX components and AI chat, built on Fumadocs Core. It's a drop-in replacement for Fumadocs UI. The shadcn CLI installs its source into the project, styled with the project's shadcn/ui primitives and theme, so the user owns and edits the code.

## Look things up live

The registry and docs change. Check them instead of relying on memory:

- `https://docscn.dev/llms.txt` indexes every docs page. Any page is available as Markdown at its URL plus `.md`, for example `https://docscn.dev/docs/getting-started.md`.
- `npx shadcn@latest search @docscn` lists every registry item, and `npx shadcn@latest view @docscn/<item>` shows an item's files and dependencies.

Run the shadcn CLI with the project's package manager (`pnpm dlx shadcn@latest`, `bunx --bun shadcn@latest`, ...). docscn is in the shadcn/ui registry index, so `@docscn/<item>` works without adding the registry to `components.json`.

## Check the project first

1. **Next.js.** docscn supports Next.js only (`next` in `package.json`). For React Router, TanStack Start, Waku or Astro, say so and stop: docscn has no providers for them.
2. **shadcn/ui with Base UI.** Read `components.json`. Its `style` must start with `base-` (for example `base-nova`). If it starts with `radix-`, docscn won't work: say so and stop, rather than converting the project. If there's no `components.json`, initialise shadcn/ui with Base UI (see below).
3. **Monorepo.** If `components.json` files are in both an app (`apps/web`) and a shared package (`packages/ui`), it's a shadcn/ui monorepo. Read [references/monorepo.md](references/monorepo.md) before installing anything.
4. **Fumadocs UI.** If `package.json` has `fumadocs-ui` or `@fumadocs/base-ui`, this is a migration. Follow [references/migration.md](references/migration.md).

## Set up a new docs site

For a project without docs:

1. If the project doesn't exist yet, create it with shadcn/ui and Base UI:

   ```bash
   npx shadcn@latest init --template=next --base=base
   ```

   In an existing Next.js app without shadcn/ui, run `npx shadcn@latest init --base=base` in it.

2. Install the `docs` block. It installs every component, plus `lib/source.ts`, `lib/layout.shared.tsx`, `components/mdx.tsx`, the `app/docs` routes, `app/api/search/route.ts` and a first page in `content/docs`:

   ```bash
   npx shadcn@latest add @docscn/docs
   ```

   With pnpm 11, if the install stops with `ERR_PNPM_IGNORED_BUILDS`, pnpm has added `esbuild: set this to true or false` under `allowBuilds` in `pnpm-workspace.yaml`. Set it to `esbuild: false` and run the command again.

3. Make the two edits the CLI can't. Wrap the app in `RootProvider` in `app/layout.tsx`. It sets up next-themes, so it replaces any `ThemeProvider` from shadcn/ui's dark mode guide. Keep `suppressHydrationWarning` on `<html>`:

   ```tsx
   import { RootProvider } from "@/components/docs/provider/next";

   // ...
   <body>
     <RootProvider>{children}</RootProvider>
   </body>;
   ```

   Then compile MDX with Fumadocs MDX in `next.config.ts`:

   ```ts
   import { createMDX } from "fumadocs-mdx/next";
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {};

   export default createMDX()(nextConfig);
   ```

4. Build the project, or run the dev server and open `/docs`.

To add only some components, install them one by one (`npx shadcn@latest add @docscn/docs-layout @docscn/docs-page @docscn/mdx`). Each item installs the shadcn/ui primitives and docscn items it needs.

## Rules

- **Never install or import `fumadocs-ui` or `@fumadocs/base-ui`.** docscn replaces them. Use `fumadocs-core` and `fumadocs-mdx` as usual.
- **Import docscn from `@/components/docs/...`.** The paths mirror Fumadocs UI's: `fumadocs-ui/layouts/docs/page` is `@/components/docs/layouts/docs/page`, and `fumadocs-ui/provider/next` is `@/components/docs/provider/next`. Fumadocs UI's docs and examples apply once the import paths are changed.
- **Style with shadcn/ui theme tokens** (`bg-background`, `text-muted-foreground`, `border`, `--sidebar-*`, ...). There are no `--color-fd-*` variables, `fd-*` utility classes or Fumadocs colour presets. Change the look by changing the shadcn/ui theme. See `https://docscn.dev/docs/theming.md`.
- **Use `docs-typeset`, not `prose`.** `DocsBody` adds `docs-typeset` to page content. Opt an element out with `not-docs-typeset` (Fumadocs UI's `not-prose`).
- **Customise by editing the installed files.** There's no `slots` API. Edit the component under `components/docs/` (or `components/ai/` for the chat). The CLI overwrites files when re-adding an item with `--overwrite`, so don't pass it for files the user has changed. Use `npx shadcn@latest add @docscn/<item> --diff` to compare with the current registry version.
- **Don't edit `components/ui/`** to make docscn work. docscn uses the project's shadcn/ui primitives as they are.
- **Inputs are Fumadocs Core types.** The layouts take a `PageTree.Root` (`source.getPageTree()`), the page takes `TOCItemType[]` (`page.data.toc`), so any content source Fumadocs supports works.
- **Translate UI strings as in Fumadocs UI.** Pass translations to `RootProvider`'s `i18n` prop. Keys are the English text plus notes in parentheses (`On this page(table of contents)`), listed in `components/docs/.translations/index.ts`. See `https://docscn.dev/docs/internationalization.md`.

## Write pages

Pages are `.mdx` files in `content/docs`, ordered with `meta.json`, as in Fumadocs. See the [Fumadocs docs](https://fumadocs.dev/docs) for frontmatter, `meta.json` and `source.config.ts`.

`defaultMdxComponents` renders code blocks (with titles, icons and tabs), headings with anchor links, images, tables, `Card` / `Cards` and `Callout`. The `docs` block's `components/mdx.tsx` adds `Tabs` / `Tab`, `Steps` / `Step`, `Accordions` / `Accordion`, `Files` / `Folder` / `File` and `TypeTable`. To use another component in MDX (`ImageZoom`, `InlineTOC`, `GithubInfo`, ...), install it and add it to `getMDXComponents()` in `components/mdx.tsx`, or import it in the page.

Each component's page (`https://docscn.dev/docs/components/<name>.md`) has its props and examples.

## Add AI chat

`@docscn/ai-chat-openrouter` adds an Ask AI chat to the docs layout, with a chat route that answers from the pages. Follow [references/ai-chat.md](references/ai-chat.md).

## Not supported

Don't try to build these from Fumadocs UI's source unless the user asks:

- the flux, glass and spacious layouts (docscn has the docs, notebook and home layouts)
- the Algolia and Orama Cloud search dialogs (build one from the search dialog parts instead)
- Fumadocs UI's Radix variant, non-Next.js providers, and deprecated props

`https://docscn.dev/docs/compatibility.md` lists every Fumadocs UI module and its status.
