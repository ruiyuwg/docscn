import { llms, loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { defineDocs } from "fumadocs-mdx/macro";

const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export const docsLlms = llms(source, {
  renderPage: async (page) => {
    const text = (await page.data.getText("processed")).trim();
    const description = page.data.description
      ? `> ${page.data.description}\n\n`
      : "";

    return `# ${page.data.title} (${page.url})\n\n${description}${text}`;
  },
});

export const gitConfig = {
  user: "ruiyuwg",
  repo: "docscn",
  branch: "main",
};

// `segments` are the Markdown route's params. `url` is the page's URL plus
// `.md`, which next.config.js rewrites to that route.
export function getPageMarkdownUrl(page: { slugs: string[]; url: string }) {
  const segments = [...page.slugs, "content.md"];

  return { segments, url: `${page.url}.md` };
}

export function getPageImageUrl(page: { slugs: string[] }) {
  const segments = [...page.slugs, "image.png"];

  return { segments, url: `/og/docs/${segments.join("/")}` };
}
