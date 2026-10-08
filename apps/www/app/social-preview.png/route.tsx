import { brandImage } from "@/lib/brand-image";

// The GitHub social preview (1280×640). GitHub has no API for it, so download
// https://docscn.dev/social-preview.png and upload it in the repository's
// Settings → General → Social preview whenever the design changes.
export const dynamic = "force-static";

export function GET() {
  return brandImage({ width: 1280, height: 640 });
}
