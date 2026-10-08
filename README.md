# docscn

A [shadcn/ui](https://ui.shadcn.com) registry of documentation components built on [Fumadocs Core](https://fumadocs.dev/docs/headless).

Install docs layouts, sidebars, tables of contents, search, and other documentation components into your own Next.js app with the shadcn CLI. They are built on your existing shadcn/ui primitives and theme, so your docs look like the rest of your project.

## What's included

- **Layouts:** `DocsLayout` on the shadcn/ui sidebar, and `HomeLayout` with a navbar
- **Pages:** `DocsPage` with a table of contents, breadcrumb, previous/next links and page actions
- **Search:** a ⌘K search dialog for Fumadocs' search server
- **MDX components:** code blocks and code tabs for Shiki output, headings, callouts and cards
- **Styles:** `docs-typeset` typography and Shiki styles built from your shadcn/ui theme

docscn targets Next.js projects using shadcn/ui with [Base UI](https://base-ui.com).

## Usage

Add the `@docscn` registry to your project:

```sh
pnpm dlx shadcn@latest registry add @docscn=https://docscn.dev/r/{name}.json
```

For a new docs site, install the `docs` block, which adds every component plus the routes, a search API and a first page:

```sh
pnpm dlx shadcn@latest add @docscn/docs
```

To migrate an existing Fumadocs UI project, install every component, then replace `fumadocs-ui/` with `@/components/docs/` in your imports:

```sh
pnpm dlx shadcn@latest add @docscn/fumadocs-ui
```

See [Getting started](https://docscn.dev/docs/getting-started) and [Migrating from Fumadocs UI](https://docscn.dev/docs/migrating-from-fumadocs-ui) for the full steps.

## Development

This is a [Turborepo](https://turborepo.dev) monorepo using pnpm.

| Path                                  | Description                                                              |
| ------------------------------------- | ------------------------------------------------------------------------ |
| `apps/www`                            | The [docscn.dev](https://docscn.dev) site, which also hosts the registry |
| `apps/www/registry.json`              | The registry definition                                                  |
| `apps/www/registry/base/docs/`        | Source for registry items                                                |
| `apps/www/registry/base/blocks/docs/` | Source for the `docs` block's routes, `lib/` files and content           |
| `apps/www/scripts/`                   | The registry CSS sync, install test and migration test                   |
| `apps/www/content/docs/`              | docscn's documentation (MDX)                                             |
| `packages/typescript-config`          | Shared TypeScript configuration                                          |

```sh
pnpm install
pnpm dev              # start the site at http://localhost:3000
pnpm build            # build the registry into apps/www/public/r, then the site
pnpm registry:build   # build the registry only
pnpm test:registry    # install every registry item into a fresh app, build and smoke-test it
pnpm test:migration   # migrate a stock create-fumadocs-app project to docscn and build it
pnpm lint
pnpm check-types
pnpm format          # format with Prettier (pnpm format:check to check only)
```

## License

[MIT](LICENSE). docscn builds on [Fumadocs](https://github.com/fuma-nama/fumadocs) and [shadcn/ui](https://github.com/shadcn-ui/ui), both MIT-licensed, and includes code adapted from them. See [NOTICE](NOTICE).
