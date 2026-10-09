# Migrating from Fumadocs UI

docscn keeps Fumadocs UI's component names, props and module paths, so a Fumadocs project on Next.js migrates by installing docscn and changing import paths. docscn's CI runs these steps on the stock `create-fumadocs-app` project. The current guide is at `https://docscn.dev/docs/migrating-from-fumadocs-ui.md`.

## Before you start

- The project must use Next.js. Fumadocs projects on React Router, TanStack Start, Waku or Astro can't migrate: docscn has no providers for them.
- Look for `slots` props, `fd-*` classes, `--color-fd-*` variables and deprecated props (`nav.component`, `sidebar.tabs`, ...) in the project. docscn doesn't support them, so plan how to replace each one (see "What changes" below) and tell the user.

## Steps

1. **Set up shadcn/ui with Base UI**, if the project has no `components.json`. It detects the global stylesheet (`app/global.css` in `create-fumadocs-app` projects) and adds the theme tokens:

   ```bash
   npx shadcn@latest init --base=base
   ```

   With pnpm 11, `create-fumadocs-app` leaves a placeholder for esbuild under `allowBuilds` in `pnpm-workspace.yaml`, and pnpm refuses to install anything until it's replaced. Set it to `esbuild: false` first.

   If `components.json` exists with a `radix-*` style, stop: docscn needs Base UI.

2. **Install every docscn component** into `components/docs/`. This bundle installs no routes, so the project's own routes stay:

   ```bash
   npx shadcn@latest add @docscn/fumadocs-ui
   ```

   If the project ran `fumadocs add ai`, its chat UI in `components/ai/chat/` imports from `fumadocs-ui`. Replace it with docscn's:

   ```bash
   npx shadcn@latest add @docscn/ai-chat --overwrite
   ```

3. **Change the imports.** Replace `fumadocs-ui/` with `@/components/docs/` in imports in `app/`, `components/` and `lib/` (and `src/` if the project uses it). Use the project's alias if `@/` maps somewhere else:

   ```tsx
   import { DocsLayout } from "fumadocs-ui/layouts/docs"; // before
   import { DocsLayout } from "@/components/docs/layouts/docs"; // after
   ```

   Leave `fumadocs-core` and `fumadocs-mdx` imports alone.

4. **Remove Fumadocs UI's styles.** Delete the `fumadocs-ui/css/*` imports (`neutral.css`, `preset.css`, ...) from the global stylesheet. The docscn items already added their styles to the same file.

5. **Uninstall Fumadocs UI** (`npm uninstall fumadocs-ui`, or `@fumadocs/base-ui`), then type-check and build. Search for any remaining `fumadocs-ui` imports if the build fails.

## What changes

| Fumadocs UI                                        | docscn                                                                              |
| -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `slots` on layouts and pages                       | Edit the installed component instead.                                               |
| `--color-fd-*` variables, `fd-*` classes           | shadcn/ui theme tokens (`--background`, `--primary`, `--sidebar-*`, ...).           |
| Colour themes and CSS presets                      | Change the shadcn/ui theme.                                                         |
| `prose` / `not-prose`                              | `docs-typeset` / `not-docs-typeset`.                                                |
| `fumadocs-ui/components/ui/*`                      | The project's shadcn/ui primitives in `components/ui/`.                             |
| `fumadocs-ui/components/sidebar/base`              | The shadcn/ui `sidebar`. `useSidebar()` works inside docs pages.                    |
| `createPageTreeRenderer`, `createLinkItemRenderer` | `SidebarPageTree`, `SidebarLinkItem`.                                               |
| `--fd-banner-height`                               | `--docs-banner-height`.                                                             |
| Sidebar collapse state                             | shadcn/ui's `sidebar_state` cookie. Pass it to `sidebar.defaultOpen` to restore it. |

The notebook layout spans the full width of the window, and the AI chat panel docks against the window's right edge. ⌘B toggles the sidebar.
