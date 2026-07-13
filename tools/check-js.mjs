import { readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const skipDirs = new Set([".git", ".agents", "node_modules"]);

const collect = (dir) => {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) return [];
      return collect(resolve(dir, entry.name));
    }

    if (!entry.isFile() || !entry.name.endsWith(".js")) return [];
    return [resolve(dir, entry.name)];
  });
};

const files = collect(root);
let failed = false;

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    cwd: root,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    failed = true;
    console.error(`JS check failed: ${relative(root, file)}`);
    if (result.stderr) console.error(result.stderr.trim());
  }
}

if (failed) process.exit(1);

console.log(`JS check passed (${files.length} files).`);
