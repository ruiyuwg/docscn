import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/components/mdx";
import { source } from "@/lib/source";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <article>
      <h1 className="text-3xl font-semibold tracking-tight">
        {page.data.title}
      </h1>
      {page.data.description && (
        <p className="mt-2 text-lg text-muted-foreground">
          {page.data.description}
        </p>
      )}
      <div className="mt-8">
        <MDX components={getMDXComponents()} />
      </div>
    </article>
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
  };
}
