// Helpers shared by test-registry-install.ts and test-fumadocs-migration.ts.
import { spawn } from "node:child_process";
import { access, cp, mkdir, readFile, writeFile } from "node:fs/promises";
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

/**
 * Adds a /notebook route that renders the docs pages in the notebook layout: a
 * copy of the app's docs layout and page, importing from `layouts/notebook`
 * instead of `layouts/docs`. `layoutProps` (JSX attributes) are added to the
 * layout's DocsLayout, after the `baseOptions()` spread.
 */
export async function addNotebookRoute(app: string, layoutProps = "") {
  const appDir = await access(path.join(app, "src/app")).then(
    () => path.join(app, "src/app"),
    () => path.join(app, "app"),
  );
  for (const file of ["layout.tsx", "[[...slug]]/page.tsx"]) {
    let content = await readFile(path.join(appDir, "docs", file), "utf8");
    content = content
      .replaceAll(
        /(["'][^"']*\/layouts\/)docs(\/page)?(["'])/g,
        "$1notebook$2$3",
      )
      .replaceAll(/((?:Layout|Page)Props<["'])\/docs/g, "$1/notebook");
    if (!content.includes("layouts/notebook")) {
      throw new Error(`app/docs/${file} doesn't import a docs layout module`);
    }
    if (file === "layout.tsx" && layoutProps) {
      if (!content.includes("{...baseOptions()}")) {
        throw new Error("app/docs/layout.tsx doesn't spread baseOptions()");
      }
      content = content.replace(
        "{...baseOptions()}",
        `{...baseOptions()} ${layoutProps}`,
      );
    }
    const target = path.join(appDir, "notebook", file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
}

/**
 * Sets up translations for two languages, as Fumadocs' i18n guide does:
 * `lib/i18n.ts` defines them, RootProvider shows English, and the /notebook
 * route (from `addNotebookRoute()`) shows the second language through a nested
 * I18nProvider. `modules` is where the UI components are imported from:
 * `fumadocs-ui` before migrating, `@/components/docs` for docscn.
 */
export async function addI18n(app: string, modules: string) {
  const src = await access(path.join(app, "src/app")).then(
    () => path.join(app, "src"),
    () => app,
  );

  await mkdir(path.join(src, "lib"), { recursive: true });
  await writeFile(
    path.join(src, "lib/i18n.ts"),
    `import { defineI18n } from "fumadocs-core/i18n";
import { uiTranslations } from "${modules}/i18n";

export const i18n = defineI18n({
  defaultLanguage: "en",
  languages: ["en", "cn"],
});

export const translations = i18n
  .translations()
  .extend(uiTranslations())
  .add({
    en: { displayName: "English" },
    cn: {
      displayName: "中文",
      "On this page(table of contents)": "本页目录",
      "Choose a language(language switcher)(aria-label)": "选择语言",
    },
  });
`,
  );

  const rootPath = path.join(src, "app/layout.tsx");
  let root = await readFile(rootPath, "utf8");
  if (!root.includes("<RootProvider>")) {
    throw new Error("app/layout.tsx doesn't render <RootProvider>");
  }
  root = `import { i18nProvider } from "${modules}/i18n";
import { translations } from "@/lib/i18n";
${root.replace("<RootProvider>", '<RootProvider i18n={i18nProvider(translations, "en")}>')}`;
  await writeFile(rootPath, root);

  const notebookPath = path.join(src, "app/notebook/layout.tsx");
  let notebook = await readFile(notebookPath, "utf8");
  const layout = /<DocsLayout[\s\S]*<\/DocsLayout>/;
  if (!layout.test(notebook)) {
    throw new Error("app/notebook/layout.tsx doesn't render <DocsLayout>");
  }
  notebook = `import { I18nProvider } from "${modules}/contexts/i18n";
import { i18nProvider } from "${modules}/i18n";
import { translations } from "@/lib/i18n";
${notebook.replace(layout, (match) => `<I18nProvider {...i18nProvider(translations, "cn")}>${match}</I18nProvider>`)}`;
  await writeFile(notebookPath, notebook);
}

/**
 * Passes a stub chat panel to the /docs route's layout through `aiChat`, the
 * way the DocsLayout page's "AI chat" section describes: a client component at
 * `components/ai/layout.tsx` renders the layout with the open state. `modules`
 * is where the UI components are imported from, as for `addI18n()`. Call it
 * after `addNotebookRoute()`, which copies the docs layout.
 */
export async function addAIChat(app: string, modules: string) {
  const src = await access(path.join(app, "src/app")).then(
    () => path.join(app, "src"),
    () => app,
  );

  await mkdir(path.join(src, "components/ai"), { recursive: true });
  await writeFile(
    path.join(src, "components/ai/layout.tsx"),
    `"use client";

import { useState } from "react";
import {
  DocsLayout as Layout,
  type DocsLayoutProps,
} from "${modules}/layouts/docs";

export function DocsLayout(props: DocsLayoutProps) {
  const [open, setOpen] = useState(false);

  return (
    <Layout
      {...props}
      aiChat={{
        open,
        onOpenChange: setOpen,
        panel: (
          <button type="button" onClick={() => setOpen(false)}>
            Close the chat
          </button>
        ),
      }}
    />
  );
}
`,
  );

  const layoutPath = path.join(src, "app/docs/layout.tsx");
  const layout = await readFile(layoutPath, "utf8");
  const docsImport = new RegExp(`(["'])${modules}/layouts/docs\\1`);
  if (!docsImport.test(layout)) {
    throw new Error(
      `app/docs/layout.tsx doesn't import DocsLayout from ${modules}/layouts/docs`,
    );
  }
  await writeFile(
    layoutPath,
    layout.replace(docsImport, "$1@/components/ai/layout$1"),
  );
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
 * kitchen-sink page (also in the notebook layout) and the search API respond
 * with the expected content.
 */
export async function smokeTest(
  app: string,
  {
    extraPaths = [],
    i18n = false,
    aiChat = false,
  }: {
    extraPaths?: string[];
    /** Check the translations `addI18n()` sets up. */
    i18n?: boolean;
    /** Check the chat panel `addAIChat()` sets up. */
    aiChat?: boolean;
  } = {},
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
    if (aiChat) {
      check(
        docsHtml.includes('<aside data-state="closed"') &&
          !docsHtml.includes("Close the chat"),
        "/docs renders the closed AI chat panel, without mounting the chat",
      );
    }

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
    check(
      pageHtml.includes('id="props-title"') && pageHtml.includes(">Prop<"),
      "the type table renders its fields",
    );
    check(pageHtml.includes("Table of Contents"), "the inline TOC renders");
    check(
      /> ?fromServer<\/span>/.test(pageHtml) &&
        pageHtml.includes("--shiki-light"),
      "the server code block renders highlighted",
    );
    check(
      pageHtml.includes("fromClient"),
      "the dynamic code block renders its code",
    );
    check(
      pageHtml.includes("data-rmiz") &&
        pageHtml.includes('alt="A gradient you can zoom into"'),
      "the zoomable image renders",
    );

    const notebook = await fetch(`${base}/notebook/kitchen-sink`);
    const notebookHtml = await notebook.text();
    check(notebook.status === 200, "/notebook/kitchen-sink responds with 200");
    check(
      notebookHtml.includes('id="nd-notebook-layout"') &&
        notebookHtml.includes('id="nd-subnav"') &&
        notebookHtml.includes('data-slot="sidebar"'),
      "the notebook layout renders its navbar and sidebar",
    );
    check(
      notebookHtml.includes('id="nd-toc"') &&
        notebookHtml.includes('href="#code-blocks"'),
      "the notebook page renders a TOC",
    );

    if (i18n) {
      check(
        pageHtml.includes('aria-label="Choose a language"') &&
          pageHtml.includes(">English<") &&
          pageHtml.includes("On this page"),
        "/docs renders the language switcher, in English",
      );
      check(
        notebookHtml.includes('aria-label="选择语言"') &&
          notebookHtml.includes("本页目录"),
        "/notebook renders the second language's translations",
      );
    }

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
