// Helpers shared by test-registry-install.ts and test-fumadocs-migration.ts.
import { spawn } from "node:child_process";
import { cp, readFile, writeFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";

export const root = path.resolve(import.meta.dirname, "..");
export const outputDir = path.join(root, "public/r");
export const shadcn = path.join(root, "node_modules/.bin/shadcn");

export function run(
  command: string,
  args: string[],
  cwd: string,
  env?: Record<string, string>,
) {
  console.log(`\n$ ${command} ${args.join(" ")}`);
  return new Promise<void>((resolve, reject) => {
    spawn(command, args, {
      cwd,
      stdio: "inherit",
      env: env ? { ...process.env, ...env } : undefined,
    })
      .on("error", reject)
      .on("exit", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`${command} exited with code ${code}`));
      });
  });
}

export function getOption(name: string) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

/** Serves the locally built registry (public/r) on a free port. */
export async function serveRegistry(): Promise<{
  url: string;
  server: Server;
}> {
  const server = createServer(async (req, res) => {
    const { pathname } = new URL(req.url ?? "/", "http://localhost");
    try {
      const body = await readFile(
        path.join(outputDir, path.basename(pathname)),
      );
      res.writeHead(200, { "content-type": "application/json" }).end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return { url: `http://127.0.0.1:${port}/r/{name}.json`, server };
}

/**
 * Points the `@docscn` registry in the app's components.json at `url`. When
 * VERCEL_AUTOMATION_BYPASS_SECRET is set, requests carry Vercel's protection
 * bypass header, so a protected preview deployment can serve the registry. The
 * CLI expands the `${...}` placeholder from the environment, so the secret
 * isn't written to the file.
 */
export async function setRegistry(app: string, url: string) {
  const componentsJsonPath = path.join(app, "components.json");
  const componentsJson = JSON.parse(await readFile(componentsJsonPath, "utf8"));
  componentsJson.registries = {
    ...componentsJson.registries,
    "@docscn": process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? {
          url,
          headers: {
            "x-vercel-protection-bypass": "${VERCEL_AUTOMATION_BYPASS_SECRET}",
          },
        }
      : url,
  };
  await writeFile(componentsJsonPath, JSON.stringify(componentsJson, null, 2));
}

/**
 * Records a decision on a dependency's install script in pnpm-workspace.yaml,
 * which pnpm 11 requires before installing it. fumadocs-mdx depends on esbuild,
 * which works without its install script.
 */
export async function allowBuild(app: string, name: string, allow: boolean) {
  const workspacePath = path.join(app, "pnpm-workspace.yaml");
  let workspace = await readFile(workspacePath, "utf8").catch(() => "");
  workspace = workspace.replace(new RegExp(`^\\s+${name}:.*\\n?`, "m"), "");
  const entry = `  ${name}: ${allow}\n`;
  workspace = workspace.includes("allowBuilds:")
    ? workspace.replace(/^allowBuilds:.*\n/m, (line) => line + entry)
    : `${workspace.trimEnd()}\nallowBuilds:\n${entry}`.trimStart();
  await writeFile(workspacePath, workspace);
}

/** Copies the kitchen-sink fixture into the app's docs and lists it in meta.json. */
export async function addFixturePage(app: string) {
  const docs = path.join(app, "content/docs");
  for (const file of ["kitchen-sink.mdx", "kitchen-sink.png"]) {
    await cp(path.join(root, "scripts/fixtures", file), path.join(docs, file));
  }

  const metaPath = path.join(docs, "meta.json");
  const meta = JSON.parse(await readFile(metaPath, "utf8").catch(() => "{}"));
  if (Array.isArray(meta.pages)) meta.pages.push("kitchen-sink");
  await writeFile(metaPath, JSON.stringify(meta, null, 2));
}

async function getFreePort() {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

function check(condition: unknown, message: string) {
  if (!condition) throw new Error(`Smoke test failed: ${message}`);
  console.log(`  ✓ ${message}`);
}

/**
 * Starts the built app with `next start`, then checks that the docs, the
 * kitchen-sink page and the search API respond with the expected content.
 */
export async function smokeTest(
  app: string,
  { extraPaths = [] }: { extraPaths?: string[] } = {},
) {
  const port = await getFreePort();
  const base = `http://127.0.0.1:${port}`;
  console.log(`\n$ next start --port ${port}`);
  const server = spawn(
    path.join(app, "node_modules/.bin/next"),
    ["start", "--port", String(port), "--hostname", "127.0.0.1"],
    { cwd: app, stdio: "inherit" },
  );

  try {
    for (let i = 0; ; i++) {
      try {
        await fetch(base);
        break;
      } catch {
        if (i > 60) throw new Error("next start did not respond");
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    const docs = await fetch(`${base}/docs`);
    const docsHtml = await docs.text();
    check(docs.status === 200, "/docs responds with 200");
    check(
      docsHtml.includes('data-slot="sidebar"') ||
        docsHtml.includes('data-sidebar="sidebar"'),
      "/docs renders the sidebar",
    );
    check(
      docsHtml.includes('href="/docs/kitchen-sink"'),
      "the sidebar links to the fixture page",
    );

    const page = await fetch(`${base}/docs/kitchen-sink`);
    const pageHtml = await page.text();
    check(page.status === 200, "/docs/kitchen-sink responds with 200");
    check(pageHtml.includes('id="nd-toc"'), "the page renders a TOC");
    check(
      pageHtml.includes('href="#code-blocks"'),
      "the TOC links to the page's headings",
    );
    check(
      pageHtml.includes("docs-typeset"),
      "DocsBody applies the docs-typeset class",
    );
    check(
      /<figure[^>]*class="[^"]*shiki/.test(pageHtml) &&
        pageHtml.includes("--shiki-dark"),
      "code blocks render highlighted Shiki output",
    );
    check(pageHtml.includes('role="tablist"'), "code tabs render as tabs");
    check(
      pageHtml.includes('class="fd-steps"') &&
        pageHtml.includes('class="fd-step"'),
      "steps render with the fd-steps and fd-step classes",
    );
    check(
      pageHtml.includes('data-slot="accordion"') &&
        pageHtml.includes('id="what-is-docscn"'),
      "accordions render, with anchor ids",
    );
    check(
      pageHtml.includes(">layout.tsx<") && pageHtml.includes(">package.json<"),
      "the file tree renders",
    );
    check(
      pageHtml.includes("Install with <code"),
      "tabs from a list of items render their content",
    );

    const search = await fetch(`${base}/api/search?query=callouts`);
    const results = (await search.json()) as unknown[];
    check(
      search.status === 200 && Array.isArray(results) && results.length > 0,
      "/api/search returns results",
    );

    for (const extra of extraPaths) {
      const response = await fetch(`${base}${extra}`);
      check(response.status === 200, `${extra} responds with 200`);
    }
  } finally {
    server.kill();
  }
}
