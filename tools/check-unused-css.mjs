import { readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const skipDirs = new Set([".git", ".agents", "node_modules"]);
const nonSelectorTokens = new Set(["inner", "jsdelivr", "net", "w3"]);

const collectFiles = (directory, extensions) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) return [];
      return collectFiles(resolve(directory, entry.name), extensions);
    }
    return entry.isFile() && extensions.some((extension) => entry.name.endsWith(extension))
      ? [resolve(directory, entry.name)]
      : [];
  });

const cssFiles = collectFiles(root, [".css"]);
const usageFiles = collectFiles(root, [".html", ".js"]);
const usageSource = usageFiles.map((file) => readFileSync(file, "utf8")).join("\n");
const classDefinitions = new Map();

for (const file of cssFiles) {
  const css = readFileSync(file, "utf8");
  for (const match of css.matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)) {
    const className = match[1];
    if (nonSelectorTokens.has(className)) continue;
    if (!classDefinitions.has(className)) classDefinitions.set(className, new Set());
    classDefinitions.get(className).add(file);
  }
}

const hasUsage = (className) => {
  const escapedName = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (
    new RegExp(`(^|[^A-Za-z0-9_-])${escapedName}([^A-Za-z0-9_-]|$)`).test(usageSource)
  ) {
    return true;
  }

  const modifierIndex = className.indexOf("--");
  return modifierIndex > 0 && usageSource.includes(className.slice(0, modifierIndex + 2));
};

const unusedClasses = [...classDefinitions].filter(([className]) => !hasUsage(className));

if (unusedClasses.length) {
  unusedClasses.forEach(([className, files]) => {
    console.error(
      `Unused CSS class: .${className} -> ${[...files]
        .map((file) => relative(root, file))
        .join(", ")}`,
    );
  });
  process.exit(1);
}

console.log(`Unused CSS check passed (${classDefinitions.size} classes).`);
