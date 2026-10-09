import {
  docsLlms,
  getPageMarkdownUrl,
  markdownNotFound,
  source,
} from "@/lib/source";

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<"/llms.mdx/docs/[[...slug]]">,
) {
  const { slug } = await params;
  const page = source.getPage(slug?.slice(0, -1));
  if (!page) return markdownNotFound();

  // YAML frontmatter for agents; JSON strings are valid YAML
  const frontmatter = [
    `title: ${JSON.stringify(page.data.title)}`,
    page.data.description &&
      `description: ${JSON.stringify(page.data.description)}`,
    `url: https://docscn.dev${page.url}`,
    page.data.lastModified &&
      `lastModified: ${page.data.lastModified.toISOString()}`,
  ].filter(Boolean);

  return new Response(
    `---\n${frontmatter.join("\n")}\n---\n\n${await docsLlms.page(page)}`,
    {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Vary: "Accept",
      },
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageMarkdownUrl(page).segments,
  }));
}
