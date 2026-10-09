import { getBreadcrumbItems } from "fumadocs-core/breadcrumb";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { getMDXComponents } from "@/components/mdx";
import { siteName, siteUrl, websiteId } from "@/lib/site";
import {
  getPageImageUrl,
  getPageMarkdownUrl,
  gitConfig,
  source,
} from "@/lib/source";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from "@/registry/base/docs/layouts/docs/page";
import { createRelativeLink } from "@/registry/base/docs/mdx";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const url = `${siteUrl}${page.url}`;
  // folders without an index page have no URL, so they're left out
  const breadcrumbs = [
    { name: "Docs", url: "/docs" },
    ...getBreadcrumbItems(page.url, source.getPageTree(), {
      includePage: true,
    }).filter(
      (item): item is { name: string; url: string } =>
        typeof item.name === "string" && !!item.url && item.url !== "/docs",
    ),
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: page.data.title,
        description: page.data.description,
        url,
        image: `${siteUrl}${getPageImageUrl(page).url}`,
        dateModified: page.data.lastModified?.toISOString(),
        inLanguage: "en",
        isPartOf: { "@id": websiteId },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: `${siteUrl}${item.url}`,
        })),
      },
    ],
  };

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <JsonLd data={jsonLd} />
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">
        {page.data.description}
      </DocsDescription>
      <div className="flex flex-row items-center gap-2 border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/apps/www/content/docs/${page.path}`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: page.url,
      types: {
        "text/markdown": getPageMarkdownUrl(page).url,
      },
    },
    // replaces the root layout's Open Graph fields, so repeat the site name
    openGraph: {
      type: "article",
      siteName,
      url: page.url,
      images: {
        url: getPageImageUrl(page).url,
        width: 1200,
        height: 630,
        alt: page.data.title,
      },
    },
  };
}
