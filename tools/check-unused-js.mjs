import { readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const skipDirs = new Set([".git", ".agents", "node_modules"]);

const collectJavaScriptFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) return [];
      return collectJavaScriptFiles(resolve(directory, entry.name));
    }
    return entry.isFile() && entry.name.endsWith(".js")
      ? [resolve(directory, entry.name)]
      : [];
  });

const files = collectJavaScriptFiles(root);
let failed = false;

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const declarations = [
    ...source.matchAll(/\b(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g),
  ].map((match) => match[1]);

  for (const name of new Set(declarations)) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const references = source.match(new RegExp(`\\b${escapedName}\\b`, "g")) || [];
    if (references.length !== 1) continue;

    failed = true;
    console.error(`Unused JavaScript declaration: ${relative(root, file)} -> ${name}`);
  }
}

if (failed) process.exit(1);

console.log(`Unused JS check passed (${files.length} files).`);
