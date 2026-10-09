// Checks that the docscn agent skill in skills/ only names registry items
// that exist, links docs pages that exist, and links its own reference files.
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const skills = path.resolve(root, "../../skills");

const itemPattern = /@docscn\/([a-z0-9-]+)/g;
const pagePattern = /https:\/\/docscn\.dev\/docs((?:\/[a-z0-9-]+)*)\.md/g;
const linkPattern = /\]\((?!https?:)([^)#]+)\)/g;

async function* markdownFiles(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* markdownFiles(file);
    else if (entry.name.endsWith(".md")) yield file;
  }
}

async function exists(file: string) {
  return stat(file).then(
    () => true,
    () => false,
  );
}

const registry = JSON.parse(
  await readFile(path.join(root, "registry.json"), "utf8"),
) as { items: { name: string }[] };
const items = new Set(registry.items.map((item) => item.name));

const problems: string[] = [];
let count = 0;

for await (const file of markdownFiles(skills)) {
  const source = await readFile(file, "utf8");
  const where = path.relative(skills, file);
  count++;

  for (const [, name] of source.matchAll(itemPattern)) {
    if (!items.has(name!)) problems.push(`${where}: no item @docscn/${name}`);
  }
  for (const [url, slug] of source.matchAll(pagePattern)) {
    const page = path.join(root, "content/docs", slug!);
    if (
      !(await exists(`${page}.mdx`)) &&
      !(await exists(path.join(page, "index.mdx")))
    )
      problems.push(`${where}: no docs page for ${url}`);
  }
  for (const [, link] of source.matchAll(linkPattern)) {
    if (!(await exists(path.resolve(path.dirname(file), link!))))
      problems.push(`${where}: no file ${link}`);
  }
}

if (count === 0) {
  console.error(`No skill files found in ${skills}`);
  process.exit(1);
}
if (problems.length > 0) {
  console.error(
    `The skill links to things that don't exist:\n${problems.join("\n")}`,
  );
  process.exit(1);
}
console.log(`All ${count} skill files link to existing items and pages.`);
