import { readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const skipDirs = new Set([".git", ".agents", "node_modules"]);

const collectHtmlFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) return [];
      return collectHtmlFiles(resolve(directory, entry.name));
    }
    return entry.isFile() && entry.name.endsWith(".html")
      ? [resolve(directory, entry.name)]
      : [];
  });

const files = collectHtmlFiles(root);
const rows = [];
let total = 0;

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const matches = [...html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])#\1[^>]*>/gi)];
  if (!matches.length) continue;

  total += matches.length;
  rows.push({
    file: relative(root, file),
    count: matches.length,
    controls: matches.filter((match) => /\bdata-[\w-]+(?:\s|=|>)/i.test(match[0])).length,
  });
}

console.log(`Placeholder link audit: ${total} href="#" links across ${rows.length} files.`);
console.log("Files with the most placeholders:");

rows
  .sort((a, b) => b.count - a.count || a.file.localeCompare(b.file))
  .slice(0, 10)
  .forEach(({ file, count, controls }) => {
    console.log(`- ${file}: ${count} (${controls} identified UI controls)`);
  });

console.log(
  "These links are intentionally reported, not auto-fixed: final category, policy, social, and account URLs depend on Firstmall configuration.",
);
