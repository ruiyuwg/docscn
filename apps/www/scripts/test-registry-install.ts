// Installs every docscn registry item into a fresh shadcn/ui (Base UI) Next.js
// app, follows the `docs` block's setup notes, adds the kitchen-sink fixture
// page, then lints, builds and smoke-tests the app, to check that items install
// and work the way they will for users.
//
// Run `shadcn build` first. Pass `--keep` to keep the generated app for
// inspection, and `--registry <url>` to install from a deployed registry
// (e.g. https://docscn.dev/r/{name}.json) instead of the local build.
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  addFixturePage,
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
const registryOption = getOption("--registry");

const registry = JSON.parse(
  await readFile(path.join(outputDir, "registry.json"), "utf8"),
) as { items: { name: string }[] };
const items = registry.items.map((item) => `@docscn/${item.name}`);

const local = registryOption ? undefined : await serveRegistry();
const registryUrl = registryOption ?? local!.url;

const tempDir = await mkdtemp(path.join(tmpdir(), "docscn-install-"));
const app = path.join(tempDir, "app");

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
  await run(
    shadcn,
    [
      "init",
      "--template=next",
      "--base=base",
      "--preset=nova",
      "--name=app",
      "--no-monorepo",
      "--yes",
      `--cwd=${tempDir}`,
    ],
    root,
  );

  await setRegistry(app, registryUrl);
  await allowBuild(app, "esbuild", false);
  await run(shadcn, ["add", ...items, "--yes"], app);
  await applyDocsBlockNotes();
  await addFixturePage(app);

  // Lint docscn's files only: shadcn/ui's own hooks/use-mobile.ts fails
  // eslint-config-next's react-hooks rules in a fresh app.
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
      "app/docs",
      "app/api",
    ],
    app,
  );
  await run("pnpm", ["run", "build"], app);
  await smokeTest(app);
  console.log(
    `\nInstalled, built and smoke-tested ${items.length} registry item(s).`,
  );
} finally {
  local?.server.close();
  if (keep) console.log(`\nKept the generated app at ${app}`);
  else await rm(tempDir, { recursive: true, force: true });
}
