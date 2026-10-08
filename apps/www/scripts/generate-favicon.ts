// Generates app/favicon.ico (16, 32 and 48px) from the mark in app/icon.svg,
// for browsers without SVG favicon support. The mark is made of axis-aligned
// rectangles, so each pixel's coverage is computed exactly, without an SVG
// renderer. The icon is the dark mark on a light tile, so it stays visible on
// both light and dark tab bars. Run it after changing app/icon.svg:
//
//   node scripts/generate-favicon.ts
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const root = path.resolve(import.meta.dirname, "..");
const sizes = [16, 32, 48];
const viewBox = 24;
const ink = [0x0a, 0x0a, 0x0a];
const tile = [0xff, 0xff, 0xff];

type Rect = { x0: number; y0: number; x1: number; y1: number };

/** Reads the `M x yH x V y H x V y Z` rectangle paths from the SVG. */
function parseRects(svg: string): Rect[] {
  const rects = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map(([, d]) => {
    const match = d!.match(
      /^M([\d.]+) ([\d.]+)H([\d.]+)V([\d.]+)H([\d.]+)V([\d.]+)Z$/,
    );
    if (!match) throw new Error(`Not a rectangle path: ${d}`);
    const [x0, y0, x1, y1] = [1, 2, 3, 4].map((i) => Number(match[i]));
    return {
      x0: Math.min(x0!, x1!),
      y0: Math.min(y0!, y1!),
      x1: Math.max(x0!, x1!),
      y1: Math.max(y0!, y1!),
    };
  });
  if (rects.length === 0) throw new Error("No paths found in app/icon.svg");
  return rects;
}

/** RGBA pixels with each pixel's colour blended by its covered area. */
function rasterize(rects: Rect[], size: number) {
  const scale = size / viewBox;
  const pixels = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let coverage = 0;
      for (const r of rects) {
        const w = Math.min(x + 1, r.x1 * scale) - Math.max(x, r.x0 * scale);
        const h = Math.min(y + 1, r.y1 * scale) - Math.max(y, r.y0 * scale);
        if (w > 0 && h > 0) coverage += w * h;
      }
      coverage = Math.min(coverage, 1);
      const i = (y * size + x) * 4;
      for (let c = 0; c < 3; c++) {
        pixels[i + c] = Math.round(
          ink[c]! * coverage + tile[c]! * (1 - coverage),
        );
      }
      pixels[i + 3] = 0xff;
    }
  }

  return pixels;
}

function encodePng(pixels: Buffer, size: number) {
  const chunk = (type: string, data: Buffer) => {
    const typed = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(typed));
    return Buffer.concat([length, typed, crc]);
  };

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.writeUInt8(8, 8); // bit depth
  header.writeUInt8(6, 9); // RGBA

  const rows = [];
  for (let y = 0; y < size; y++) {
    rows.push(
      Buffer.from([0]),
      pixels.subarray(y * size * 4, (y + 1) * size * 4),
    );
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(Buffer.concat(rows))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** An ICO file with one PNG image per size. */
function encodeIco(images: { size: number; png: Buffer }[]) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)]);
}

const rects = parseRects(
  await readFile(path.join(root, "app/icon.svg"), "utf8"),
);
const ico = encodeIco(
  sizes.map((size) => ({ size, png: encodePng(rasterize(rects, size), size) })),
);
await writeFile(path.join(root, "app/favicon.ico"), ico);
console.log(
  `Wrote app/favicon.ico (${sizes.join(", ")}px, ${ico.length} bytes)`,
);
