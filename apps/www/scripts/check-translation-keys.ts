// Checks that every UI string the registry translates has its key in
// registry/base/docs/.translations, the list `uiTranslations()` registers with
// Fumadocs Core. A key is the English text followed by each note, in
// parentheses: the `useTranslations({ note })` note, then the `t()` one.
//
// The list may hold more keys than the source uses: it keeps all of Fumadocs
// UI's, so translations written for Fumadocs UI still type-check.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { keys } from "../registry/base/docs/.translations/index.ts";

const root = path.resolve(import.meta.dirname, "../registry/base/docs");

const hookPattern = /useTranslations\(\{\s*note:\s*"([^"]*)"\s*\}\)/g;
const callPattern = /\bt\(\s*"((?:[^"\\]|\\.)*)"/g;
const componentPattern = /<T\s+text="([^"]*)"(?:\s+note="([^"]*)")?/g;
const notePattern = /note:\s*"([^"]*)"/;

/** The arguments after the text of the `t()` call ending at `index`. */
function callOptions(source: string, index: number) {
  let depth = 1;
  for (let i = index; i < source.length; i++) {
    if (source[i] === "(") depth++;
    if (source[i] === ")" && --depth === 0) return source.slice(index, i);
  }
  return "";
}

function encodeKey(text: string, notes: (string | undefined)[]) {
  return text + notes.map((note) => (note ? `(${note})` : "")).join("");
}

async function* sourceFiles(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(file);
    else if (/\.tsx?$/.test(entry.name)) yield file;
  }
}

const known = new Set<string>(keys);
const missing: string[] = [];
let count = 0;

for await (const file of sourceFiles(root)) {
  const source = await readFile(file, "utf8");
  // the note of the nearest `useTranslations()` above each call
  const hooks = [...source.matchAll(hookPattern)].map((m) => ({
    index: m.index,
    note: m[1],
  }));
  const hookNote = (index: number) =>
    hooks.findLast((hook) => hook.index < index)?.note;

  const used: string[] = [];
  for (const m of source.matchAll(callPattern)) {
    const text = JSON.parse(`"${m[1]}"`) as string;
    const options = callOptions(source, m.index + m[0].length);
    used.push(
      encodeKey(text, [hookNote(m.index), options.match(notePattern)?.[1]]),
    );
  }
  for (const m of source.matchAll(componentPattern)) {
    used.push(encodeKey(m[1] ?? "", [m[2]]));
  }

  for (const key of used) {
    count++;
    if (!known.has(key)) missing.push(`${path.relative(root, file)}: ${key}`);
  }
}

if (missing.length > 0) {
  console.error(
    `These translation keys are missing from registry/base/docs/.translations/index.ts:\n${missing.join("\n")}`,
  );
  process.exit(1);
}
console.log(`All ${count} translated strings have keys.`);
