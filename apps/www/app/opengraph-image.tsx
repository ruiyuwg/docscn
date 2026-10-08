import { brandImage } from "@/lib/brand-image";

export const alt = "docscn: documentation components for shadcn/ui";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return brandImage(size);
}
