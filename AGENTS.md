<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

# docscn

docscn is a shadcn/ui registry of documentation components (docs layouts, sidebars, tables of contents, search, etc.) built on Fumadocs Core. It is a drop-in replacement for Fumadocs UI built the shadcn/ui way: users install source into their own app with the shadcn CLI, styled with their shadcn/ui primitives and theme.

## Decisions

- **Base UI only.** Components target shadcn/ui projects using Base UI (`base-*` styles). No Radix or React Aria variants.
- **Next.js only.** Components may use `next/link`, `next/navigation`, etc.
- **`@docscn` namespace.** The registry is served from `https://docscn.dev/r/{name}.json`, built by `shadcn build` from `apps/www/registry.json`.

## Fumadocs UI compatibility

docscn aims to be a drop-in replacement for Fumadocs UI (`fumadocs-ui` / `@fumadocs/base-ui`). Use Fumadocs UI's source as the reference for behaviour and APIs, taken from the Fumadocs release tag that matches the installed `fumadocs-core` (currently [`fumadocs@16.16.2`](https://github.com/fuma-nama/fumadocs/tree/fumadocs@16.16.2/packages/base-ui/src)), not the `dev` branch. When upgrading `fumadocs-core`, check upstream changes to the components docscn has adapted.

- **Content must render unchanged.** Support every element Fumadocs MDX's default preset emits: Shiki `pre` blocks (including the `icon` attribute), `CodeBlockTabs` / `CodeBlockTabsList` / `CodeBlockTabsTrigger` / `CodeBlockTab` (from `remark-code-tab` and `remark-npm`), headings with ids, images and GFM tables. Also support the opt-in plugins' output: `Callout` (`remark-admonition`), `Files` / `Folder` / `File` (`remark-mdx-files`) and the `fd-steps` / `fd-step` classes (`remark-steps`).
- **The public API matches.** Keep Fumadocs UI's component names and main props, so migrating means changing import paths: `RootProvider`, `DocsLayout` (`tree`, `nav`, `links`, `githubUrl`, `sidebar`, `tabs`), `DocsPage` (`toc`, `full`, `tableOfContent`, `footer`, `breadcrumb`), `DocsTitle`, `DocsDescription`, `DocsBody`, `BaseLayoutProps`, `defaultMdxComponents`, `createRelativeLink`, the search dialog parts, and the MDX components (`Card`, `Cards`, `Callout`, `Tabs`, `Tab`, `Steps`, `Step`, `Accordion`, `Accordions`, `Files`, `TypeTable`, ...).
- **Mirror Fumadocs UI's module paths.** Install everything under `components/docs/` (target `@components/docs/...`), laid out like `fumadocs-ui`'s import paths, so migration is one find-and-replace of `fumadocs-ui/` with `@/components/docs/`. For example, `fumadocs-ui/layouts/docs/page` becomes `@/components/docs/layouts/docs/page`, and `fumadocs-ui/provider/next` becomes `@/components/docs/provider/next`.
- **Inputs are Fumadocs Core types** (`PageTree.Root`, `TOCItemType`, ...), so any content source Fumadocs supports works.
- **Deliberately not compatible:** the `slots` API (users edit their own copy instead), `--color-fd-*` variables and `fd-*` utility classes, Fumadocs UI's colour themes and CSS presets, non-Next.js providers, Radix, and deprecated props. Document each in the migration guide.

## Architecture

- **Layout:** build `DocsLayout` on the shadcn/ui `sidebar` (`SidebarProvider` / `SidebarInset`), not Fumadocs UI's CSS grid, so docs match the sidebars in the rest of the user's app.
- **Building blocks:** search on `command` + `kbd` + `useDocsSearch` (`fumadocs-core/search/client`). Breadcrumb on `breadcrumb` + `getBreadcrumbItems` (`fumadocs-core/breadcrumb`). TOC on `fumadocs-core/toc` + `scroll-area`. Prev/next footer on `findNeighbour` (`fumadocs-core/page-tree`). Callout on `alert` extended with Fumadocs' types. Cards on `card`, tabs on `tabs`, accordions on `accordion`, files on `collapsible`.
- **Typography:** `DocsBody` applies the `docs-typeset` class, typeset-style CSS (in the style of shadcn/typeset) that docscn ships, built from the user's theme tokens. It replaces Fumadocs UI's `prose` styles. Components opt out with `not-docs-typeset` (Fumadocs UI's `not-prose`). The name is docscn-specific so it can't clash with a user's own `prose` or `typeset` styles.
- **Code highlighting:** keep Fumadocs MDX's default `rehype-code` (Shiki) output. The code block component ships the Shiki CSS it needs.
- **Theme:** use `next-themes`, as shadcn/ui's dark mode guide does.
- **Layouts:** the docs layout first, then home and notebook. Add flux, glass or spacious only if users ask.

## Packaging

- **Components:** one registry item per Fumadocs UI component or module, depending on shadcn/ui primitives and other docscn items through `registryDependencies`.
- **`@docscn/docs`:** a block for new projects. It installs the components plus `lib/source.ts`, `lib/layout.shared.tsx`, the `app/docs` routes and `app/api/search/route.ts`. Use the item's `docs` field to explain wrapping the root layout in `RootProvider`.
- **`@docscn/fumadocs-ui`:** a bundle for migrating from Fumadocs UI. It installs every component but no routes.

## Layout

- `apps/www`: the docscn.dev site and the registry host. Its `turbo.json` makes `build` depend on `registry:build`, which writes `public/r/` (gitignored).
- `apps/www/registry/base/docs/`: source for all registry items, declared in `apps/www/registry.json`. It mirrors the install layout (see Registry conventions). The docscn.dev site imports this source directly.
- `apps/www/components/ui/` and `apps/www/hooks/use-mobile.ts`: shadcn/ui primitives installed with the shadcn CLI. The site and registry items both use them. Don't edit them, so they stay comparable with upstream. They're excluded from Prettier, and any lint exceptions go in `apps/www/eslint.config.js`.
- `apps/www/content/docs/`: docscn's documentation, loaded by Fumadocs MDX (`lib/source.ts`) and served at `/docs`. The docs layout and MDX components are temporary until docscn's own components replace them.

## Registry conventions

- Build on shadcn/ui primitives through `registryDependencies` (e.g. `button`, `collapsible`, `sidebar`) instead of shipping copies, so installed components use the user's own primitives.
- Style with shadcn/ui theme tokens (`bg-background`, `text-muted-foreground`, `--sidebar-*`, ...), not Fumadocs UI's `--color-fd-*` variables.
- Use `fumadocs-core` headless APIs (`page-tree`, `toc`, `breadcrumb`, `search`, `link`, ...). Never depend on `fumadocs-ui` or `@fumadocs/base-ui`. Use their source only as a reference.
- Import `cn` from the `cn` package and list it in `dependencies`.
- Put source at `apps/www/registry/base/docs/<path>` and give each file `"target": "@components/docs/<path>"`, where `<path>` mirrors Fumadocs UI's module path (e.g. `layouts/docs/page/index.tsx`). Keep upstream's file names inside each module, including `slots/` folders, so every file stays comparable with its upstream counterpart.
- Name items in kebab-case after the Fumadocs UI component or module, with a `docs-` prefix where the plain name would read as a shadcn/ui primitive (`docs-layout`, `docs-page`, `docs-sidebar`).
- Import other docscn modules with relative paths (`../utils/urls`), which the CLI leaves unchanged and which resolve because files install with the same layout. Don't use `@/registry/base/docs/...`: the CLI rewrites any such path containing a `/components`, `/lib`, `/hooks` or `/ui` segment to the matching alias and drops `docs/`, so `@/registry/base/docs/components/card` would become `@/components/card`.
- Import shadcn/ui primitives with `@/components/ui/...`. The CLI rewrites them to the user's `ui` alias.
- Files outside `components/docs/` (the `docs` block's routes and `lib/` files) use plain targets such as `app/docs/layout.tsx` or `lib/source.ts`, which the CLI places under `src/` when the project has one. Content uses `~/content/docs/...`, because Fumadocs MDX resolves `content/docs` from the project root.
- Reference other docscn items in `registryDependencies` as `@docscn/<name>`.
- Give every item a clear `description`.
- Ship CSS (typography, Shiki styles, ...) through the registry item's `css` field, so it merges into the user's global stylesheet. Write it as a plain stylesheet in `apps/www/registry/base/docs/styles/`, list it in `scripts/sync-registry-css.ts`, and run `pnpm registry:css` to copy it into `registry.json` (`registry:build` fails while they differ). docscn.dev imports the same stylesheets from `app/globals.css`. The CLI mangles nested (`&`) selectors and moves `@keyframes` into `@theme`, so use flat rules inside `@layer components`, and pseudo-elements outside `:where()`.
- Files adapted from Fumadocs UI start with this comment, which is installed into users' projects with the code. The full licence texts are in `NOTICE`.

  ```ts
  // Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
  // Copyright (c) 2023 Fuma, MIT License
  ```

## Tooling

- ESLint uses `eslint-config-next`, the config `create-next-app` generates, so registry source is linted with the rules most users run. It stays on ESLint 9 because `eslint-config-next`'s React, import and jsx-a11y plugins don't support ESLint 10.
- `apps/www` installs TypeScript 6.0 as `typescript` (the API that `typescript-eslint` and Next.js load) and TypeScript 7 as `@typescript/native` (provides `tsc`). TypeScript 7 has no JS API until 7.1, and `typescript-eslint` doesn't support it yet. Revisit once both do.
- Prettier sorts Tailwind classes with `prettier-plugin-tailwindcss`, including inside `cn()` and `cva()`.

## Checks

Run `pnpm build`, `pnpm lint` and `pnpm check-types` from the root, and `pnpm exec shadcn registry validate` in `apps/www`. Run `pnpm format` (or `pnpm format:check`) before committing.

After changing registry items, run `pnpm test:registry`. It scaffolds a fresh shadcn/ui (Base UI) Next.js app in a temp directory, installs every item from the locally built registry, then lints and builds the app. Pass `-- --keep` to keep the app for inspection.

pnpm enforces a minimum release age, so a package version published in the last day fails to install. Pin the previous version instead of adding entries to `minimumReleaseAgeExclude`.

pnpm also blocks dependency install scripts by default. Record each decision under `allowBuilds` in `pnpm-workspace.yaml`, and use `false` unless the package breaks without its script.
