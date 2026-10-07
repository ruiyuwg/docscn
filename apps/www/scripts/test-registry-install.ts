// Installs every docscn registry item into a fresh shadcn/ui (Base UI) Next.js
// app, then lints and builds it, to check that items install and compile the
// way they will for users. Run `shadcn build` first. Pass `--keep` to keep the
// generated app for inspection.
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outputDir = path.join(root, "public/r");
const shadcn = path.join(root, "node_modules/.bin/shadcn");
const keep = process.argv.includes("--keep");

function run(command: string, args: string[], cwd: string) {
  console.log(`\n$ ${command} ${args.join(" ")}`);
  return new Promise<void>((resolve, reject) => {
    spawn(command, args, { cwd, stdio: "inherit" })
      .on("error", reject)
      .on("exit", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`${command} exited with code ${code}`));
      });
  });
}

const registry = JSON.parse(
  await readFile(path.join(outputDir, "registry.json"), "utf8"),
) as { items: { name: string }[] };
const items = registry.items.map((item) => `@docscn/${item.name}`);

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  try {
    const body = await readFile(path.join(outputDir, path.basename(pathname)));
    res.writeHead(200, { "content-type": "application/json" }).end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address() as AddressInfo;

const tempDir = await mkdtemp(path.join(tmpdir(), "docscn-install-"));
const app = path.join(tempDir, "app");

try {
  await run(
    shadcn,
    [
      "init",
      "--template=next",
      "--base=base",
      "--preset=nova",
      "--name=app",
      "--no-monorepo",
      "--yes",
      `--cwd=${tempDir}`,
    ],
    root,
  );

  const componentsJsonPath = path.join(app, "components.json");
  const componentsJson = JSON.parse(await readFile(componentsJsonPath, "utf8"));
  componentsJson.registries = {
    ...componentsJson.registries,
    "@docscn": `http://127.0.0.1:${port}/r/{name}.json`,
  };
  await writeFile(componentsJsonPath, JSON.stringify(componentsJson, null, 2));

  if (items.length > 0) {
    await run(shadcn, ["add", ...items, "--yes"], app);
  } else {
    console.log("\nThe registry has no items. Checking the base app only.");
  }

  await run("pnpm", ["run", "lint"], app);
  await run("pnpm", ["run", "build"], app);
  console.log(`\nInstalled and built ${items.length} registry item(s).`);
} finally {
  server.close();
  if (keep) console.log(`\nKept the generated app at ${app}`);
  else await rm(tempDir, { recursive: true, force: true });
}
