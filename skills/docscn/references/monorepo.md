# Monorepos

In a [shadcn/ui monorepo](https://ui.shadcn.com/docs/monorepo), run the shadcn CLI in the app's directory (for example `apps/web`). docscn's components install into the app, and the shadcn/ui primitives they use into the shared `packages/ui`.

Two bugs in the shadcn CLI need workarounds. Fetch `https://docscn.dev/docs/getting-started.md` and follow its "Monorepos" section, which has the exact package lists for the current registry.

1. **Before installing docscn**, add the sidebar from `packages/ui`. Installed from the app, the CLI puts the sidebar's `use-mobile` hook in the app, where the sidebar can't import it ([shadcn-ui/ui#12212](https://github.com/shadcn-ui/ui/issues/12212)):

   ```bash
   cd packages/ui && npx shadcn@latest add sidebar
   ```

2. Install docscn in the app as usual (`@docscn/docs` for a new site, `@docscn/fumadocs-ui` for a migration).

3. **After installing docscn**, add its dependencies to the app's `package.json`. The CLI adds them to `packages/ui/package.json` only, so the app can't import them ([shadcn-ui/ui#12213](https://github.com/shadcn-ui/ui/issues/12213)). Install the packages listed in Getting started in the app's directory. If you installed components one by one, install the packages the CLI added to `packages/ui/package.json` instead.

4. Delete the unused `hooks/use-mobile.ts` the CLI added to the app, then build the app.

Do the same for `@docscn/ai-chat-openrouter`: Getting started lists the AI chat's packages separately.
