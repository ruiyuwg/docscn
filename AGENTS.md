<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

# docscn

docscn is a shadcn/ui registry of documentation components (docs layouts, sidebars, tables of contents, search, etc.) built on Fumadocs Core. It replaces Fumadocs UI with the shadcn/ui model: users install source into their own app with the shadcn CLI.

## Decisions

- **Base UI only.** Components target shadcn/ui projects using Base UI (`base-*` styles). No Radix or React Aria variants.
- **Next.js only.** Components may use `next/link`, `next/navigation`, etc.
- **`@docscn` namespace.** The registry is served from `https://docscn.dev/r/{name}.json`, built by `shadcn build` from `apps/www/registry.json`.

## Layout

- `apps/www`: the docscn.dev site and the registry host. Its `turbo.json` makes `build` depend on `registry:build`, which writes `public/r/` (gitignored).
- `apps/www/registry/<item>/`: source for each registry item, declared in `apps/www/registry.json`.
- `apps/www/components/ui/`: shadcn/ui primitives installed with the shadcn CLI. The site and registry items both use them.

## Registry conventions

- Build on shadcn/ui primitives through `registryDependencies` (e.g. `button`, `collapsible`, `sidebar`) instead of shipping copies, so installed components use the user's own primitives.
- Style with shadcn/ui theme tokens (`bg-background`, `text-muted-foreground`, `--sidebar-*`, ...), not Fumadocs UI's `--color-fd-*` variables.
- Use `fumadocs-core` headless APIs (`page-tree`, `toc`, `breadcrumb`, `search`, `link`, ...). Never depend on `fumadocs-ui` or `@fumadocs/base-ui`. Use their source only as a reference.
- Import `cn` from the `cn` package and list it in `dependencies`.
- Import within registry source using `@/registry/...` paths, and give every item a clear `description`.

## Checks

Run `pnpm build`, `pnpm lint` and `pnpm check-types` from the root, and `pnpm exec shadcn registry validate` in `apps/www`.

pnpm enforces a minimum release age, so a package version published in the last day fails to install. Pin the previous version instead of adding entries to `minimumReleaseAgeExclude`.
