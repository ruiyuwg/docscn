import { markdownNotFound } from "@/lib/source";

// next.config.js rewrites requests for missing pages that ask for Markdown here
export function GET() {
  return markdownNotFound();
}
