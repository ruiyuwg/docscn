import { notFound } from "next/navigation";
import { loadGeist, Mark } from "@/lib/brand-image";
import { getPageImageUrl, source } from "@/lib/source";
import { generateOGImage } from "@/registry/base/docs/og";

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<"/og/docs/[...slug]">,
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return generateOGImage({
    title: page.data.title,
    description: page.data.description,
    site: "Docscn",
    icon: <Mark size={56} color="#fafafa" />,
    // no dashed divider or bottom bar: a plain black background
    primaryColor: "transparent",
    primaryTextColor: "#fafafa",
    fonts: await loadGeist(),
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageImageUrl(page).segments,
  }));
}
