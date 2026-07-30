import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const skipDirs = new Set([".git", ".agents", "node_modules"]);
const localPageExtensions = new Set(["", ".html"]);

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

const stripUrlDecorations = (value) => value.split("#")[0].split("?")[0].trim();

const isExternalReference = (value) =>
  /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value) ||
  value.startsWith("{") ||
  value.startsWith("[");

const resolveLocalReference = (file, value) => {
  const cleanValue = stripUrlDecorations(value);
  if (!cleanValue || isExternalReference(value)) return null;
  return resolve(dirname(file), cleanValue);
};

const files = collectHtmlFiles(root);
let failed = false;

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const displayPath = relative(root, file);
  const ids = new Map();

  if (/<script\b(?![^>]*\bsrc\s*=)[^>]*>[\s\S]*?<\/script>/i.test(html)) {
    failed = true;
    console.error(`Inline executable script: ${displayPath}`);
  }

  for (const match of html.matchAll(/<script\b([^>]*)\bsrc\s*=\s*(["'])(.*?)\2[^>]*>/gi)) {
    if (!match[3].includes("scripts/prototype/")) continue;
    if (/\bdata-prototype(?:\s|=|>)/i.test(match[0])) continue;

    failed = true;
    console.error(`Prototype script missing data-prototype: ${displayPath} -> ${match[3]}`);
  }

  for (const match of html.matchAll(/\bid\s*=\s*(["'])(.*?)\1/gi)) {
    const id = match[2].trim();
    if (!id) continue;
    ids.set(id, (ids.get(id) || 0) + 1);
  }

  for (const [id, count] of ids) {
    if (count < 2) continue;
    failed = true;
    console.error(`Duplicate HTML id: ${displayPath} -> #${id} (${count})`);
  }

  for (const match of html.matchAll(/<(img|script|link)\b[^>]*?\b(src|href)\s*=\s*(["'])(.*?)\3/gi)) {
    const target = resolveLocalReference(file, match[4]);
    if (!target || existsSync(target)) continue;

    failed = true;
    console.error(`Missing HTML asset: ${displayPath} -> ${match[4]}`);
  }

  for (const match of html.matchAll(/<a\b[^>]*?\bhref\s*=\s*(["'])(.*?)\1/gi)) {
    const href = match[2];
    const target = resolveLocalReference(file, href);
    if (!target || !localPageExtensions.has(extname(target).toLowerCase())) continue;
    if (existsSync(target)) continue;

    failed = true;
    console.error(`Missing HTML page: ${displayPath} -> ${href}`);
  }
}

if (failed) process.exit(1);

console.log(`HTML check passed (${files.length} files).`);
