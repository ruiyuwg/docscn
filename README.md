<p align="center">
  <a href="https://docscn.dev">
    <img alt="docscn" src="https://shieldcn.dev/header/surface.svg?title=docscn&subtitle=Docs+components+for+shadcn%2Fui&logo=data%3Aimage%2Fsvg%2Bxml%2C%3Csvg+xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27+fill%3D%27none%27+viewBox%3D%270+0+24+24%27%3E%3Cpath+fill%3D%27%2523fff%27+d%3D%27M16+0h8v8h-8zM8+8h8v8H8zm-8+8h8v8H0zm16+0h8v8h-8z%27%2F%3E%3C%2Fsvg%3E&mode=dark">
  </a>
</p>

<p align="center">
  <a href="https://github.com/ruiyuwg/docscn/actions/workflows/ci.yml"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/github/ruiyuwg/docscn/ci.svg?variant=secondary&font=geist&mode=dark" /><img src="https://shieldcn.dev/github/ruiyuwg/docscn/ci.svg?variant=secondary&font=geist&mode=light" alt="CI" /></picture></a>
  <a href="LICENSE"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/github/ruiyuwg/docscn/license.svg?variant=secondary&font=geist&mode=dark" /><img src="https://shieldcn.dev/github/ruiyuwg/docscn/license.svg?variant=secondary&font=geist&mode=light" alt="License" /></picture></a>
  <a href="https://github.com/ruiyuwg/docscn"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/github/ruiyuwg/docscn/stars.svg?variant=secondary&font=geist&mode=dark" /><img src="https://shieldcn.dev/github/ruiyuwg/docscn/stars.svg?variant=secondary&font=geist&mode=light" alt="GitHub stars" /></picture></a>
</p>

# docscn

A drop-in replacement for [Fumadocs UI](https://fumadocs.dev), built the [shadcn/ui](https://ui.shadcn.com) way: a registry of documentation components on [Fumadocs Core](https://fumadocs.dev/docs/headless).

Install docs layouts, sidebars, tables of contents, search, and other documentation components into your own Next.js app with the shadcn CLI. They are built on your existing shadcn/ui primitives and theme, so your docs look like the rest of your project.

## Why docscn?

- **Your primitives, your theme.** Components use your shadcn/ui `sidebar`, `dialog`, `tabs` and theme tokens, not a separate design system with its own `--color-fd-*` variables.
- **The source is yours.** The shadcn CLI copies the code into your app, so you customise it by editing it, with no `slots` API to learn.
- **Drop-in for Fumadocs UI.** Component names, props and module paths match, so migrating means changing `fumadocs-ui/` to `@/components/docs/` in your imports.

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

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) to set up the repository, and [SECURITY.md](SECURITY.md) to report a vulnerability.

```sh
pnpm install
pnpm dev   # docscn.dev at http://localhost:3000
```

## License

[MIT](LICENSE). docscn builds on [Fumadocs](https://github.com/fuma-nama/fumadocs) and [shadcn/ui](https://github.com/shadcn-ui/ui), both MIT-licensed, and includes code adapted from them. See [NOTICE](NOTICE).
