// Generates the favicons from the mark in components/logo.tsx: app/icon.svg,
// and app/favicon.ico (16, 32 and 48px) for browsers without SVG favicons.
// Both show the white mark on a black tile with padding and rounded corners.
// The ICO is rasterized with supersampling, so no SVG renderer is needed. Run
// it after changing the mark or the values below:
//
//   node scripts/generate-favicon.ts
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const root = path.resolve(import.meta.dirname, "..");

/** The icon's grid, in SVG units. */
const canvas = 32;
/** Space between the tile's edge and the mark. */
const padding = 10;
/** Corner radius of the tile. */
const radius = 5;
const tileColor = "#0a0a0a";
const markColor = "#fafafa";
const sizes = [16, 32, 48];
const samples = 8; // per pixel and axis, for anti-aliasing

/** The mark's grid in components/logo.tsx. */
const markGrid = 24;
const markScale = (canvas - 2 * padding) / markGrid;

type Rect = { x0: number; y0: number; x1: number; y1: number };

/** Reads the mark's `M x yH x V y H x V y Z` rectangle paths from logo.tsx. */
async function readMark(): Promise<{ paths: string[]; rects: Rect[] }> {
  const source = await readFile(path.join(root, "components/logo.tsx"), "utf8");
  const array = source.match(/markPaths = \[([\s\S]*?)\]/)?.[1];
  const paths = [...(array ?? "").matchAll(/"([^"]+)"/g)].map(([, d]) => d!);
  if (paths.length === 0)
    throw new Error("No markPaths in components/logo.tsx");

  const rects = paths.map((d) => {
    const match = d.match(
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
  return { paths, rects };
}

function svg(paths: string[]) {
  const scale = Number(markScale.toFixed(6));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas} ${canvas}"><rect width="${canvas}" height="${canvas}" rx="${radius}" fill="${tileColor}"/><g fill="${markColor}" transform="translate(${padding} ${padding}) scale(${scale})">${paths
    .map((d) => `<path d="${d}"/>`)
    .join("")}</g></svg>\n`;
}

function insideTile(x: number, y: number) {
  const cx = Math.min(Math.max(x, radius), canvas - radius);
  const cy = Math.min(Math.max(y, radius), canvas - radius);
  return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2;
}

function insideMark(rects: Rect[], x: number, y: number) {
  const mx = (x - padding) / markScale;
  const my = (y - padding) / markScale;
  return rects.some((r) => mx >= r.x0 && mx < r.x1 && my >= r.y0 && my < r.y1);
}

function hex(color: string) {
  return [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
}

/** RGBA pixels: the tile's coverage is the alpha, the mark's blends the colour. */
function rasterize(rects: Rect[], size: number) {
  const tile = hex(tileColor);
  const mark = hex(markColor);
  const pixels = Buffer.alloc(size * size * 4);
  const unit = canvas / size;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let inTile = 0;
      let inMark = 0;
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const x = (px + (sx + 0.5) / samples) * unit;
          const y = (py + (sy + 0.5) / samples) * unit;
          if (!insideTile(x, y)) continue;
          inTile++;
          if (insideMark(rects, x, y)) inMark++;
        }
      }

      const i = (py * size + px) * 4;
      const markShare = inTile === 0 ? 0 : inMark / inTile;
      for (let c = 0; c < 3; c++) {
        pixels[i + c] = Math.round(
          mark[c]! * markShare + tile[c]! * (1 - markShare),
        );
      }
      pixels[i + 3] = Math.round((inTile / samples ** 2) * 255);
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

const { paths, rects } = await readMark();
await writeFile(path.join(root, "app/icon.svg"), svg(paths));
const ico = encodeIco(
  sizes.map((size) => ({ size, png: encodePng(rasterize(rects, size), size) })),
);
await writeFile(path.join(root, "app/favicon.ico"), ico);
console.log(
  `Wrote app/icon.svg and app/favicon.ico (${sizes.join(", ")}px, ${ico.length} bytes)`,
);
