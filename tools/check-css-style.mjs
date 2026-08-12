// Cross-agent style/complexity check for the redesign CSS/JS layer.
//
// Several agents edit this repo over time. This check exists to catch the
// drift patterns that keep coming back:
//   1. Duplicate selectors in the same file/media context (hard failure).
//      A second block for the same selector is a leftover, not a fix.
//   2. New or growing !important use. Prefer a more specific page-scoped
//      selector. !important is last resort for beating Firstmall ID/legacy
//      rules. Crossing 25% is a hard failure. Crossing 10% on a new file,
//      or rising past a recorded baseline, is a warning.
//   3. Quiet file growth. Large page files are expected (My Page, Orders,
//      Profile, Magazine, Time Deal). Do not split a page file just to
//      silence this. Warn only when a file grows past its recorded size,
//      or when a new file crosses the default soft limit.
//
// Scope: files named trendypicker-*.{css,js} under firstmall-workskin/.
// Firstmall-owned files (common.css, user.css, board.css, ...) are out of
// scope. See AGENTS.md and .agents/coding-rules.md.
import { basename } from "node:path";
import { readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const workskinRoot = resolve(root, "firstmall-workskin");

const CSS_LINE_WARN = 1200;
const JS_LINE_WARN = 700;
const CSS_LINE_HEADROOM = 150;
const JS_LINE_HEADROOM = 100;

const IMPORTANT_PCT_WARN = 10;
const IMPORTANT_PCT_FAIL = 25;
const IMPORTANT_PCT_HEADROOM = 1;

// Recorded 2026-08-12. Update after a legitimate size change or an
// !important cleanup. Do not raise a baseline just to silence leftover dumps.
const cssLineBaselines = {
  "trendypicker-best.css": 261,
  "trendypicker-brand.css": 836,
  "trendypicker-cart.css": 3448,
  "trendypicker-catalog.css": 497,
  "trendypicker-coupons.css": 1119,
  "trendypicker-help-topic.css": 2348,
  "trendypicker-help.css": 321,
  "trendypicker-listing-cards.css": 440,
  "trendypicker-login.css": 1201,
  "trendypicker-magazine.css": 1701,
  "trendypicker-membership.css": 556,
  "trendypicker-mypage.css": 3036,
  "trendypicker-new.css": 692,
  "trendypicker-orders.css": 1730,
  "trendypicker-points.css": 427,
  "trendypicker-profile.css": 1625,
  "trendypicker-reviews.css": 957,
  "trendypicker-timedeal.css": 1762,
  "trendypicker-wishlist.css": 479,
};

const jsLineBaselines = {
  "trendypicker-best.js": 137,
  "trendypicker-cart.js": 1814,
  "trendypicker-catalog.js": 227,
  "trendypicker-coupons.js": 544,
  "trendypicker-help-topic.js": 347,
  "trendypicker-magazine.js": 938,
  "trendypicker-mypage.js": 1087,
  "trendypicker-new.js": 334,
  "trendypicker-orders.js": 1413,
  "trendypicker-profile-birthday.js": 292,
  "trendypicker-profile.js": 1813,
  "trendypicker-timedeal.js": 753,
  "trendypicker-wishlist.js": 493,
};

const importantPctBaselines = {
  "trendypicker-help-topic.css": 22,
  "trendypicker-catalog.css": 19,
  "trendypicker-listing-cards.css": 17,
  "trendypicker-wishlist.css": 12,
  "trendypicker-reviews.css": 8,
};

const collect = (dir, extension) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) return collect(full, extension);
    return entry.isFile() &&
      entry.name.endsWith(extension) &&
      entry.name.startsWith("trendypicker-")
      ? [full]
      : [];
  });

function splitTopLevel(value, separator) {
  const parts = [];
  let current = "";
  let depth = 0;
  for (const ch of value) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === separator && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current) parts.push(current);
  return parts;
}

function normalizeCssHeader(header) {
  const compact = header
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ",")
    .replace(/\s*([>+~])\s*/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s*:/g, ":")
    .replace(/:\s+/g, ":");

  if (compact.startsWith("@")) return compact;

  return splitTopLevel(compact, ",")
    .map((part) => part.trim())
    .filter(Boolean)
    .sort()
    .join(",");
}

function findDuplicateRules(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const duplicates = [];
  const seen = new Map();
  const stack = [];
  let buffer = "";

  for (const ch of withoutComments) {
    if (ch === "{") {
      const header = normalizeCssHeader(buffer);
      buffer = "";

      if (header.startsWith("@")) {
        stack.push(header);
      } else {
        const context = stack.filter(Boolean).join(" > ");
        if (header) {
          const key = `${context}::${header}`;
          const count = (seen.get(key) || 0) + 1;
          seen.set(key, count);
          if (count === 2) {
            duplicates.push({ selector: header, media: context || null });
          }
        }
        stack.push(null);
      }
      continue;
    }

    if (ch === "}") {
      stack.pop();
      buffer = "";
      continue;
    }

    buffer += ch;
  }

  return duplicates;
}

function importantStats(css) {
  const declarations = css.match(/[a-zA-Z-]+\s*:\s*[^;{}]+;/g) || [];
  const important = declarations.filter((d) => /!important/i.test(d)).length;
  const pct = declarations.length
    ? Math.round((important / declarations.length) * 100)
    : 0;
  return { declarations: declarations.length, important, pct };
}

const SIZE_HINT =
  "audit for dead or leftover duplicate rules — do not split a page file just to silence this";
const IMPORTANT_HINT =
  "prefer a more specific page-scoped selector; !important is last resort for Firstmall ID/legacy rules";

let failed = false;
const warnings = [];

for (const file of collect(workskinRoot, ".css")) {
  const css = readFileSync(file, "utf8");
  const relPath = relative(root, file);
  const name = basename(file);
  const lineCount = css.split("\n").length;

  const duplicates = findDuplicateRules(css);
  for (const dup of duplicates) {
    failed = true;
    console.error(
      `Duplicate CSS selector in ${relPath}${dup.media ? ` (inside ${dup.media})` : ""}: ${dup.selector}`,
    );
  }

  const baseline = cssLineBaselines[name];
  if (baseline == null) {
    if (lineCount > CSS_LINE_WARN) {
      warnings.push(
        `${relPath} is ${lineCount} lines (new file over ${CSS_LINE_WARN}) — ${SIZE_HINT}`,
      );
    }
  } else if (lineCount > baseline + CSS_LINE_HEADROOM) {
    warnings.push(
      `${relPath} grew to ${lineCount} lines (was ~${baseline}) — ${SIZE_HINT}`,
    );
  }

  const stats = importantStats(css);
  const knownPct = importantPctBaselines[name];
  if (stats.pct > IMPORTANT_PCT_FAIL) {
    failed = true;
    console.error(
      `${relPath} is ${stats.pct}% !important (${stats.important}/${stats.declarations}, limit ${IMPORTANT_PCT_FAIL}%) — ${IMPORTANT_HINT}`,
    );
  } else if (knownPct != null) {
    if (stats.pct > knownPct + IMPORTANT_PCT_HEADROOM) {
      warnings.push(
        `${relPath} rose to ${stats.pct}% !important (was ~${knownPct}%) — do not add more; ${IMPORTANT_HINT}`,
      );
    }
  } else if (stats.pct > IMPORTANT_PCT_WARN) {
    warnings.push(
      `${relPath} is ${stats.pct}% !important (${stats.important}/${stats.declarations}) — ${IMPORTANT_HINT}`,
    );
  }
}

for (const file of collect(workskinRoot, ".js")) {
  const js = readFileSync(file, "utf8");
  const relPath = relative(root, file);
  const name = basename(file);
  const lineCount = js.split("\n").length;
  const baseline = jsLineBaselines[name];

  if (baseline == null) {
    if (lineCount > JS_LINE_WARN) {
      warnings.push(
        `${relPath} is ${lineCount} lines (new file over ${JS_LINE_WARN}) — ${SIZE_HINT}`,
      );
    }
  } else if (lineCount > baseline + JS_LINE_HEADROOM) {
    warnings.push(
      `${relPath} grew to ${lineCount} lines (was ~${baseline}) — ${SIZE_HINT}`,
    );
  }
}

if (warnings.length) {
  console.warn("\nStyle warnings (non-fatal):");
  for (const warning of warnings) console.warn(`  - ${warning}`);
}

if (failed) process.exit(1);

console.log(`\nCSS style check passed.`);
