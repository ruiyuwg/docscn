// Copies the stylesheets in registry/base/docs/styles/ into the `css` field of
// the registry items that ship them, so users get the CSS merged into their
// global stylesheet by the shadcn CLI, while docscn.dev imports the same files.
// Pass `--check` to fail instead of writing when registry.json is out of date.
//
// The CLI's `css` field can't express CSS nesting (`&` selectors are rewritten
// incorrectly), so the stylesheets use flat rules, optionally inside at-rules
// such as `@layer`.
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const registryPath = path.join(root, "registry.json");
const check = process.argv.includes("--check");

/** Registry item name -> stylesheet whose rules go in its `css` field. */
const stylesheets: Record<string, string> = {
  typography: "registry/base/docs/styles/typography.css",
  codeblock: "registry/base/docs/styles/codeblock.css",
  steps: "registry/base/docs/styles/steps.css",
  "image-zoom": "registry/base/docs/styles/image-zoom.css",
};

type CssTree = { [key: string]: string | CssTree };

function parseCss(source: string, file: string): CssTree {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, "");
  let i = 0;

  function normalize(text: string) {
    return text
      .replace(/\s+/g, " ")
      .replace(/\(\s+/g, "(")
      .replace(/\s+\)/g, ")")
      .trim();
  }

  function block(): CssTree {
    const tree: CssTree = {};
    let buffer = "";
    let depth = 0; // parentheses, so `;` inside `url(...)` etc. is kept

    while (i < css.length) {
      const char = css[i++];

      if (char === "(") depth++;
      if (char === ")") depth--;

      if (depth === 0 && char === "{") {
        const prelude = normalize(buffer);
        buffer = "";
        if (prelude.includes("&")) {
          throw new Error(
            `${file}: nested selectors are not supported (${prelude})`,
          );
        }
        const body = block();
        const existing = tree[prelude];
        tree[prelude] =
          typeof existing === "object" ? { ...existing, ...body } : body;
      } else if (depth === 0 && (char === ";" || char === "}")) {
        const declaration = normalize(buffer);
        buffer = "";
        if (declaration) {
          const colon = declaration.indexOf(":");
          if (colon === -1) {
            throw new Error(`${file}: invalid declaration "${declaration}"`);
          }
          tree[declaration.slice(0, colon).trim()] = declaration
            .slice(colon + 1)
            .trim();
        }
        if (char === "}") return tree;
      } else {
        buffer += char;
      }
    }

    if (normalize(buffer)) throw new Error(`${file}: unexpected end of file`);
    return tree;
  }

  return block();
}

const registryText = await readFile(registryPath, "utf8");
const registry = JSON.parse(registryText) as {
  items: { name: string; css?: CssTree }[];
};
const before = JSON.stringify(registry);

for (const [name, file] of Object.entries(stylesheets)) {
  const item = registry.items.find((item) => item.name === name);
  if (!item) throw new Error(`registry.json has no item named "${name}"`);
  item.css = parseCss(await readFile(path.join(root, file), "utf8"), file);
}

if (JSON.stringify(registry) === before) {
  console.log("The registry's css fields are up to date.");
} else if (check) {
  console.error(
    "registry.json's css fields are out of date with registry/base/docs/styles/. Run `pnpm registry:css` in apps/www.",
  );
  process.exit(1);
} else {
  await writeFile(registryPath, JSON.stringify(registry, null, 2));
  execFileSync(
    path.join(root, "../../node_modules/.bin/prettier"),
    ["--write", registryPath],
    { stdio: "inherit" },
  );
  console.log("Updated the css fields in registry.json.");
}
