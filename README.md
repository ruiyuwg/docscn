# docscn

A [shadcn/ui](https://ui.shadcn.com) registry of documentation components built on [Fumadocs Core](https://fumadocs.dev/docs/headless).

Install docs layouts, sidebars, tables of contents, search, and other documentation components into your own Next.js app with the shadcn CLI. They are built on your existing shadcn/ui primitives and theme, so your docs look like the rest of your project.

> [!NOTE]
> docscn is in early development. No components have been published yet.

## Usage

Add the `@docscn` registry to your project:

```sh
pnpm dlx shadcn@latest registry add @docscn=https://docscn.dev/r/{name}.json
```

Then install components from it:

```sh
pnpm dlx shadcn@latest add @docscn/<component>
```

docscn targets Next.js projects using shadcn/ui with [Base UI](https://base-ui.com).

## Development

This is a [Turborepo](https://turborepo.dev) monorepo using pnpm.

| Path                         | Description                                                              |
| ---------------------------- | ------------------------------------------------------------------------ |
| `apps/www`                   | The [docscn.dev](https://docscn.dev) site, which also hosts the registry |
| `apps/www/registry.json`     | The registry definition                                                  |
| `apps/www/registry/`         | Source for registry items                                                |
| `packages/eslint-config`     | Shared ESLint configuration                                              |
| `packages/typescript-config` | Shared TypeScript configuration                                          |

```sh
pnpm install
pnpm dev              # start the site at http://localhost:3000
pnpm build            # build the registry into apps/www/public/r, then the site
pnpm registry:build   # build the registry only
pnpm lint
pnpm check-types
```
