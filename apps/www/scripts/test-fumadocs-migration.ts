// Checks the drop-in claim: scaffolds the stock create-fumadocs-app project
// (Next.js + Fumadocs MDX), adds a copy of its docs route in the notebook
// layout, migrates it to docscn the way the migration guide describes, removes
// fumadocs-ui, then type-checks, builds and smoke-tests it.
//
// Run `shadcn build` first. Pass `--keep` to keep the generated app for
// inspection, and `--registry <url>` to install from a deployed registry.
import { execFileSync } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  addFixturePage,
  addAIChat,
  addI18n,
  addNotebookRoute,
  allowBuild,
  getOption,
  run,
  serveRegistry,
  setRegistry,
  shadcn,
  smokeTest,
} from "./utils.ts";

/**
 * The create-fumadocs-app release that shipped with the fumadocs-core version
 * docscn targets. Bump it together with fumadocs-core.
 */
const CREATE_FUMADOCS_APP = "create-fumadocs-app@16.2.16";

const keep = process.argv.includes("--keep");
const registryOption = getOption("--registry");
const local = registryOption ? undefined : await serveRegistry();
const registryUrl = registryOption ?? local!.url;

const tempDir = await mkdtemp(path.join(tmpdir(), "docscn-migration-"));
const app = path.join(tempDir, "app");

async function listSourceFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        /\.(tsx?|jsx?|mjs|css)$/.test(entry.name) &&
        !/(^|\/)(node_modules|\.next|\.source)(\/|$)/.test(
          path.relative(app, entry.parentPath),
        ),
    )
    .map((entry) => path.join(entry.parentPath, entry.name));
}

/** The migration guide's steps after installing @docscn/fumadocs-ui. */
async function migrate() {
  for (const file of await listSourceFiles(app)) {
    if (path.relative(app, file).startsWith("components/docs/")) continue;

    const content = await readFile(file, "utf8");
    // Fumadocs UI's stylesheets are replaced by the items' css fields.
    let migrated = file.endsWith(".css")
      ? content.replaceAll(/^@import ['"]fumadocs-ui\/css\/[^'"]+['"];\n/gm, "")
      : content;
    migrated = migrated.replaceAll(
      /(["'])fumadocs-ui\//g,
      "$1@/components/docs/",
    );
    if (migrated !== content) {
      await writeFile(file, migrated);
      console.log(`Migrated ${path.relative(app, file)}`);
    }
  }

  await run("pnpm", ["remove", "fumadocs-ui"], app);
}

async function assertNoFumadocsUi() {
  const offenders: string[] = [];
  for (const file of await listSourceFiles(app)) {
    if ((await readFile(file, "utf8")).includes("fumadocs-ui")) {
      offenders.push(path.relative(app, file));
    }
  }
  if (offenders.length > 0) {
    throw new Error(
      `fumadocs-ui is still referenced in: ${offenders.join(", ")}`,
    );
  }

  const why = execFileSync(
    "pnpm",
    ["why", "fumadocs-ui", "@fumadocs/base-ui"],
    {
      cwd: app,
      encoding: "utf8",
    },
  ).trim();
  if (why.length > 0) {
    throw new Error(`fumadocs-ui is still installed:\n${why}`);
  }
  console.log("\nNo source file or dependency refers to fumadocs-ui.");
}

try {
  await run(
    "pnpm",
    [
      "dlx",
      CREATE_FUMADOCS_APP,
      "app",
      "--template",
      "+next+fuma-docs-mdx",
      "--pm",
      "pnpm",
      "--og-image",
      "next-og",
      "--search",
      "orama",
      "--no-git",
      "--install",
      "--yes",
    ],
    tempDir,
    { CI: "1" },
  );

  // create-fumadocs-app leaves a placeholder for esbuild's install script,
  // which pnpm 11 refuses to install with.
  await allowBuild(app, "esbuild", false);
  await run(shadcn, ["init", "--base=base", "--preset=nova", "--yes"], app);
  await setRegistry(app, registryUrl);
  await run(shadcn, ["add", "@docscn/fumadocs-ui", "--yes"], app);
  // a route in Fumadocs UI's notebook layout, for the migration to carry over
  await addNotebookRoute(app);
  // Fumadocs UI's translations, for the migration to carry over
  await addI18n(app, "fumadocs-ui");
  // Fumadocs UI's AI chat panel, for the migration to carry over
  await addAIChat(app, "fumadocs-ui");

  await migrate();
  await assertNoFumadocsUi();
  await addFixturePage(app);

  await run("pnpm", ["run", "types:check"], app);
  await run("pnpm", ["run", "build"], app);
  await smokeTest(app, {
    i18n: true,
    aiChat: true,
    extraPaths: ["/", "/og/docs/image.png", "/llms.mdx/docs/content.md"],
  });
  console.log("\nMigrated, built and smoke-tested the stock Fumadocs app.");
} finally {
  local?.server.close();
  if (keep) console.log(`\nKept the generated app at ${app}`);
  else await rm(tempDir, { recursive: true, force: true });
}
