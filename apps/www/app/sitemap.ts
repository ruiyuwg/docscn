import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

const baseUrl = "https://docscn.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl },
    ...source.getPages().map((page) => ({ url: `${baseUrl}${page.url}` })),
  ];
}
