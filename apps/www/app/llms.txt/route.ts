import { docsLlms, source } from "@/lib/source";

export const revalidate = false;

const intro = `# docscn

> A shadcn/ui registry of documentation components (docs layouts, sidebars, tables of contents, search, MDX components and AI chat) built on Fumadocs Core, and a drop-in replacement for Fumadocs UI. The shadcn CLI installs the source into your project, styled with your shadcn/ui primitives and theme.

## When to use docscn

- Adding a documentation site, or docs pages, to a Next.js project that uses shadcn/ui with Base UI (the \`base-*\` styles).
- Migrating a Fumadocs project on Next.js off \`fumadocs-ui\`, keeping its content, routes and component names.
- Adding search, a table of contents, MDX components or an AI chat to docs built on Fumadocs Core.

docscn doesn't support Radix-based shadcn/ui projects or frameworks other than Next.js.

## Get started

- Install the docs block: \`npx shadcn@latest add @docscn/docs\`. docscn is in the shadcn/ui registry index, so no setup is needed.
- List every registry item: \`npx shadcn@latest search @docscn\`.
- Install the agent skill for coding agents: \`npx skills add ruiyuwg/docscn\`.
- Every page below is Markdown. All pages together are at https://docscn.dev/llms-full.txt.
- Source: https://github.com/ruiyuwg/docscn`;

/** `[Title](/docs/page)` → `[Title](https://docscn.dev/docs/page.md)` */
function linkMarkdown(index: string) {
  return index.replace(
    /\]\((\/docs[^)]*)\)/g,
    (_, url: string) => `](https://docscn.dev${url}.md)`,
  );
}

export async function GET() {
  const nodes = await Promise.all(
    source.getPageTree().children.map((node) => docsLlms.indexNode(node)),
  );

  return new Response(
    `${intro}\n\n## Docs\n\n${linkMarkdown(nodes.join("\n"))}\n`,
    {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Vary: "Accept",
      },
    },
  );
}
