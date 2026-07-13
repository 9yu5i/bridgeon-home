import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
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

    if (!entry.isFile() || !entry.name.endsWith(".css")) return [];
    return [resolve(dir, entry.name)];
  });
};

const stripUrlDecorations = (value) =>
  value.trim().replace(/^["']|["']$/g, "").split("#")[0].split("?")[0];

const isExternalUrl = (value) =>
  /^(data:|https?:|about:|#)/i.test(value) || value.startsWith("var(");

const files = collect(root);
let failed = false;

for (const file of files) {
  const css = readFileSync(file, "utf8");
  const open = (css.match(/\{/g) || []).length;
  const close = (css.match(/\}/g) || []).length;

  if (open !== close) {
    failed = true;
    console.error(`CSS brace mismatch: ${relative(root, file)} (${open} open, ${close} close)`);
  }

  const urlRegex = /url\(([^)]+)\)/g;
  for (const match of css.matchAll(urlRegex)) {
    const rawUrl = stripUrlDecorations(match[1]);
    if (!rawUrl || isExternalUrl(rawUrl)) continue;

    const target = resolve(dirname(file), rawUrl);
    if (!existsSync(target)) {
      failed = true;
      console.error(`Missing CSS asset: ${relative(root, file)} -> ${rawUrl}`);
    }
  }
}

if (failed) process.exit(1);

console.log(`CSS check passed (${files.length} files).`);
