# Contributing to docscn

Thanks for your interest in docscn! Bug reports, compatibility gaps with Fumadocs UI, documentation fixes and new components are all welcome.

Before working on something larger than a small fix, please open an issue (or comment on an existing one, such as the [roadmap](https://github.com/ruiyuwg/docscn/issues/10)) so we can agree on the approach first.

## Setup

You need Node.js 24 or later and pnpm 11 (the version in `package.json`'s `packageManager` field; `corepack enable` sets it up).

```sh
git clone https://github.com/ruiyuwg/docscn.git
cd docscn
pnpm install
pnpm dev   # docscn.dev at http://localhost:3000
```

The [README](README.md#development) describes the repository layout, and [AGENTS.md](AGENTS.md) records the project's decisions and conventions in detail: Fumadocs UI compatibility, architecture, registry conventions and checks. Please read the parts relevant to your change.

## Making a change

1. Create a branch from `main`.
2. Make your change, following the conventions in AGENTS.md. In short:
   - Registry source lives in `apps/www/registry/base/docs/`, mirroring Fumadocs UI's module paths, and each item is declared in `apps/www/registry.json`.
   - Build on shadcn/ui primitives and theme tokens, and on Fumadocs Core's headless APIs. Never depend on `fumadocs-ui`.
   - Files adapted from Fumadocs start with the credit comment described in AGENTS.md.
   - CSS is written in `apps/www/registry/base/docs/styles/` and copied into `registry.json` with `pnpm registry:css` (in `apps/www`).
   - Document new or changed components in `apps/www/content/docs/`, and update the Compatibility page and migration guide when support changes.
3. Run the checks (below).
4. Commit with [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) messages, e.g. `feat(registry): add the accordion` or `docs: fix a typo in Getting started`. AGENTS.md has the details.
5. Open a pull request against `main` with a Conventional Commits title. Pull requests are merged with a merge commit once CI passes.

## Checks

From the repository root:

```sh
pnpm format          # or pnpm format:check
pnpm lint
pnpm check-types
pnpm build
pnpm test:registry   # after changing registry items
pnpm test:migration  # after changing anything the migration relies on (needs network access)
```

And in `apps/www`: `pnpm exec shadcn registry validate`.

`test:registry` installs every item into a fresh shadcn/ui app, builds it and smoke-tests it. `test:migration` migrates a stock `create-fumadocs-app` project to docscn. CI runs both on every pull request.

Two things about pnpm 11 that can surprise you: it refuses package versions published in the last day (pin the previous version instead), and it blocks dependency install scripts until you record a decision under `allowBuilds` in `pnpm-workspace.yaml`.

## Reporting issues

- **Bugs and compatibility gaps:** open an issue with the bug report template, including how to reproduce it.
- **Security vulnerabilities:** please don't open a public issue. See [SECURITY.md](SECURITY.md).

## Licence

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
