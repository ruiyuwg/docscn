import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { markPaths } from "@/components/logo";

const background = "#0a0a0a";
const foreground = "#fafafa";
const muted = "#a1a1a1";

/** Geist, read from the `geist` package, since ImageResponse needs font files. */
export async function loadGeist() {
  const dir = path.join(
    process.cwd(),
    "node_modules/geist/dist/fonts/geist-sans",
  );
  const [regular, semibold] = await Promise.all([
    readFile(path.join(dir, "Geist-Regular.ttf")),
    readFile(path.join(dir, "Geist-SemiBold.ttf")),
  ]);
  return [
    {
      name: "Geist",
      data: regular,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Geist",
      data: semibold,
      weight: 600 as const,
      style: "normal" as const,
    },
  ];
}

/** The docscn mark as an inline SVG for ImageResponse. */
export function Mark({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      {markPaths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/**
 * The site's brand image: the mark, the name and the tagline. Used for the
 * default Open Graph image and the GitHub social preview.
 */
export async function brandImage({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const scale = height / 630;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 80 * scale,
        backgroundColor: background,
        color: foreground,
        fontFamily: "Geist",
      }}
    >
      <Mark size={72 * scale} color={foreground} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 96 * scale,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          docscn
        </div>
        <div
          style={{
            marginTop: 28 * scale,
            maxWidth: 860 * scale,
            color: muted,
            fontSize: 40 * scale,
            lineHeight: 1.3,
          }}
        >
          Documentation components for shadcn/ui, built on Fumadocs Core.
        </div>
      </div>
    </div>,
    { width, height, fonts: await loadGeist() },
  );
}
