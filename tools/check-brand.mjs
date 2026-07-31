import { readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const skippedDirectories = new Set([".git", "node_modules"]);
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".txt",
  ".yaml",
  ".yml",
]);
const legacyName = ["bridge", "on"].join("");
const failures = [];

const visit = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && skippedDirectories.has(entry.name)) continue;

    const file = resolve(directory, entry.name);
    const projectPath = relative(root, file);

    if (projectPath.toLowerCase().includes(legacyName)) {
      failures.push(`Legacy brand in path: ${projectPath}`);
    }

    if (entry.isDirectory()) {
      visit(file);
      continue;
    }

    if (!entry.isFile()) continue;
    const extension = entry.name.slice(entry.name.lastIndexOf(".")).toLowerCase();
    if (!textExtensions.has(extension)) continue;

    const source = readFileSync(file, "utf8");
    if (source.toLowerCase().includes(legacyName)) {
      failures.push(`Legacy brand in text: ${projectPath}`);
    }
  }
};

visit(root);

if (failures.length) {
  failures.forEach((failure) => console.error(failure));
  process.exit(1);
}

console.log("Brand check passed: TrendyPicker naming is consistent.");
