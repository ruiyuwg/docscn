// Installs every docscn registry item into a fresh shadcn/ui (Base UI) Next.js
// app, follows the `docs` block's setup notes, adds the kitchen-sink fixture
// page and a copy of the docs route in the notebook layout, then lints, builds
// and smoke-tests the app, to check that items install and work the way they
// will for users.
//
// Run `shadcn build` first. Pass `--keep` to keep the generated app for
// inspection, and `--registry <url>` to install from a deployed registry
// (e.g. https://docscn.dev/r/{name}.json) instead of the local build. For a
// protected Vercel preview, also set VERCEL_AUTOMATION_BYPASS_SECRET.
//
// Pass `--monorepo` to install into the app of a shadcn/ui monorepo instead,
// following the extra steps in the "Monorepos" section of Getting started.
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  addFixturePage,
  addAIChat,
  addI18n,
  addNotebookRoute,
  allowBuild,
  getOption,
  outputDir,
  root,
  run,
  serveRegistry,
  setRegistry,
  shadcn,
  smokeTest,
} from "./utils.ts";

const keep = process.argv.includes("--keep");
const monorepo = process.argv.includes("--monorepo");
const registryOption = getOption("--registry");

const registry = JSON.parse(
  await readFile(path.join(outputDir, "registry.json"), "utf8"),
) as { items: { name: string }[] };
const items = registry.items.map((item) => `@docscn/${item.name}`);

const local = registryOption ? undefined : await serveRegistry();
const registryUrl = registryOption ?? local!.url;

const tempDir = await mkdtemp(path.join(tmpdir(), "docscn-install-"));
const workspace = path.join(tempDir, "app");
const app = monorepo ? path.join(workspace, "apps/web") : workspace;
const uiPackage = path.join(workspace, "packages/ui");

interface SourceItem {
  dependencies?: string[];
  devDependencies?: string[];
}

/**
 * The commands in Getting started's "Monorepos" section, after checking that
 * its install commands list every dependency of docscn's items. The section
 * works around shadcn CLI bugs: in a monorepo, it installs the sidebar's
 * use-mobile hook into the app, and dependencies into packages/ui only
 * (https://github.com/shadcn-ui/ui/issues/12212 and
 * https://github.com/shadcn-ui/ui/issues/12213). Remove each step once fixed.
 */
async function getMonorepoSteps() {
  const page = await readFile(
    path.join(root, "content/docs/getting-started.mdx"),
    "utf8",
  );
  const section = page.split(/^## Monorepos$/m)[1]?.split(/^## /m)[0] ?? "";
  const lines = section.split("\n").map((line) => line.trim());
  const sidebar = lines.find((line) =>
    line.startsWith("npx shadcn@latest add"),
  );
  const installs = lines.filter((line) => line.startsWith("npm install "));
  const install = installs.find((line) => !line.includes(" -D "));
  const installDev = installs.find((line) => line.includes(" -D "));
  if (!sidebar || !install || !installDev) {
    throw new Error("Getting started has no Monorepos section to follow");
  }

  const source = JSON.parse(
    await readFile(path.join(root, "registry.json"), "utf8"),
  ) as { items: SourceItem[] };
  const listed = (line: string) => new Set(line.split(" ").slice(2));
  for (const [line, key] of [
    [install, "dependencies"],
    [installDev, "devDependencies"],
  ] as const) {
    const missing = source.items
      .flatMap((item) => item[key] ?? [])
      .filter((dependency) => !listed(line).has(dependency));
    if (missing.length > 0) {
      throw new Error(
        `Getting started's monorepo install command is missing ${[...new Set(missing)].join(", ")}`,
      );
    }
  }

  // `npx shadcn@latest add sidebar` → the local shadcn CLI, and `npm install`
  // → `pnpm add`, as the docs' package manager tabs show it.
  const toPnpm = (line: string) => ["add", ...line.split(" ").slice(2)];
  return {
    sidebarArgs: sidebar.split(" ").slice(2),
    installArgs: [toPnpm(install), toPnpm(installDev)],
  };
}

/** The two edits the `docs` block's notes ask users to make. */
async function applyDocsBlockNotes() {
  const layoutPath = path.join(app, "app/layout.tsx");
  let layout = await readFile(layoutPath, "utf8");
  // RootProvider includes next-themes, so it replaces the template's ThemeProvider.
  layout = layout
    .replace(/^import \{ ThemeProvider \} from .*\n/m, "")
    .replace(
      /<ThemeProvider>\{children\}<\/ThemeProvider>|\{children\}/,
      "<RootProvider>{children}</RootProvider>",
    );
  if (!layout.includes("suppressHydrationWarning")) {
    layout = layout.replace("<html", "<html suppressHydrationWarning");
  }
  layout = `import { RootProvider } from "@/components/docs/provider/next";\n${layout}`;
  await writeFile(layoutPath, layout);

  const configPath = path.join(app, "next.config.ts");
  let config = await readFile(configPath, "utf8");
  config = `import { createMDX } from "fumadocs-mdx/next";\n${config.replace(
    /export default nextConfig;?/,
    "export default createMDX()(nextConfig);",
  )}`;
  await writeFile(configPath, config);
}

try {
  const monorepoSteps = monorepo ? await getMonorepoSteps() : undefined;

  await run(
    shadcn,
    [
      "init",
      "--template=next",
      "--base=base",
      "--preset=nova",
      "--name=app",
      monorepo ? "--monorepo" : "--no-monorepo",
      "--yes",
      `--cwd=${tempDir}`,
    ],
    root,
  );

  await setRegistry(app, registryUrl);
  await allowBuild(workspace, "esbuild", false);
  if (monorepoSteps) {
    await run(shadcn, [...monorepoSteps.sidebarArgs, "--yes"], uiPackage);
  }
  await run(shadcn, ["add", ...items, "--yes"], app);
  for (const args of monorepoSteps?.installArgs ?? []) {
    await run("pnpm", args, app);
  }
  await applyDocsBlockNotes();
  await addFixturePage(app);
  await addNotebookRoute(
    app,
    'nav={{ ...baseOptions().nav, mode: "top" }} tabMode="navbar"',
  );
  await addI18n(app, "@/components/docs");
  await addAIChat(app, "@/components/docs");

  // Lint docscn's files only: shadcn/ui's own hooks/use-mobile.ts fails
  // eslint-config-next's react-hooks rules in a fresh app. The monorepo
  // template's ESLint config matches no .ts or .tsx files, so the single-app
  // run does the linting.
  if (!monorepo) {
    await run(
      "pnpm",
      [
        "exec",
        "eslint",
        "--max-warnings",
        "0",
        "components/docs",
        "components/mdx.tsx",
        "lib/source.ts",
        "lib/layout.shared.tsx",
        "lib/i18n.ts",
        "app/layout.tsx",
        "components/ai",
        "app/docs",
        "app/notebook",
        "app/api",
      ],
      app,
    );
  }
  await run("pnpm", ["run", "build"], app);
  await smokeTest(app, { i18n: true, aiChat: true });
  console.log(
    `\nInstalled, built and smoke-tested ${items.length} registry item(s)${monorepo ? " in a monorepo" : ""}.`,
  );
} finally {
  local?.server.close();
  if (keep) console.log(`\nKept the generated app at ${workspace}`);
  else await rm(tempDir, { recursive: true, force: true });
}
