import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

// The skills in the repository's skills/ folder, published for the Agent
// Skills discovery RFC (https://github.com/cloudflare/agent-skills-discovery-rfc)
// at /.well-known/agent-skills/.
const skillsDir = path.resolve(process.cwd(), "../../skills");

export const skillsIndexSchema =
  "https://schemas.agentskills.io/discovery/0.2.0/schema.json";

async function listFiles(dir: string, prefix = ""): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const name = prefix + entry.name;
      if (entry.isDirectory())
        return listFiles(path.join(dir, entry.name), `${name}/`);
      return entry.isFile() ? [name] : [];
    }),
  );

  return files.flat().sort();
}

/** One ustar header block, with a fixed mode and mtime so builds match. */
function tarHeader(name: string, size: number) {
  const header = Buffer.alloc(512);
  const field = (value: string, offset: number, length: number) =>
    header.write(value, offset, length, "utf8");
  const octal = (value: number, offset: number, length: number) =>
    field(value.toString(8).padStart(length - 1, "0"), offset, length - 1);

  field(name, 0, 100);
  octal(0o644, 100, 8);
  octal(0, 108, 8);
  octal(0, 116, 8);
  octal(size, 124, 12);
  octal(0, 136, 12);
  field(" ".repeat(8), 148, 8);
  field("0", 156, 1);
  field("ustar\x0000", 257, 8);

  let checksum = 0;
  for (const byte of header) checksum += byte;
  field(`${checksum.toString(8).padStart(6, "0")}\0 `, 148, 8);

  return header;
}

/** A .tar.gz of the skill's folder, with SKILL.md at its root. */
async function packSkill(dir: string) {
  const blocks: Buffer[] = [];
  for (const file of await listFiles(dir)) {
    const content = await readFile(path.join(dir, file));
    blocks.push(tarHeader(file, content.length), content);
    blocks.push(Buffer.alloc((512 - (content.length % 512)) % 512));
  }
  blocks.push(Buffer.alloc(1024));

  return gzipSync(Buffer.concat(blocks), { level: 9 });
}

function frontmatter(source: string, key: string) {
  const block = /^---\n([\s\S]*?)\n---/.exec(source)?.[1] ?? "";
  return new RegExp(`^${key}:\\s*(.*)$`, "m").exec(block)?.[1]?.trim();
}

export async function getSkills() {
  const names = (await readdir(skillsDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  return Promise.all(
    names.map(async (name) => {
      const dir = path.join(skillsDir, name);
      const skill = await readFile(path.join(dir, "SKILL.md"), "utf8");
      const archive = await packSkill(dir);

      return {
        name: frontmatter(skill, "name") ?? name,
        description: frontmatter(skill, "description") ?? "",
        archive,
        digest: `sha256:${createHash("sha256").update(archive).digest("hex")}`,
      };
    }),
  );
}

export function getSkillArchiveUrl(name: string) {
  return `/.well-known/agent-skills/${name}.tar.gz`;
}
