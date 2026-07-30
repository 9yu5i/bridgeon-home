import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const workskinRoot = resolve(root, "firstmall-workskin");
const requiredFiles = [
  "css/bridgeon-mypage.css",
  "js/bridgeon-mypage.js",
  "mypage/dashboard.html",
  "README.md",
];

const requiredDashboardTokens = [
  "{member.name}",
  "{member.current_level.group_name}",
  "{=number_format(showMypageTop('emoney'))}",
  "{=number_format(member.coupon_count)}",
  "{wishlist_count}",
  "<!--{ ? orders }-->",
  "<!--{ @ orders }-->",
  "{.order_seq}",
  "{.mstep}",
  "{shortform_summary.saved_count}",
  "<!--{ @ wishlist_list }-->",
  "<!--{ @ recently_viewed_list }-->",
  "/mypage/order_catalog",
  "/mypage/wish",
  "/mypage/dashboard",
];

const forbiddenCommonTokens = [
  "{order_summary.",
  "/mypage/order_list",
  "/mypage/wishlist",
  'href="#"',
];

let failed = false;

for (const relativePath of requiredFiles) {
  const file = resolve(workskinRoot, relativePath);
  if (existsSync(file)) continue;
  failed = true;
  console.error(`Missing Firstmall work-skin file: ${relativePath}`);
}

const dashboardPath = resolve(workskinRoot, "mypage/dashboard.html");

if (existsSync(dashboardPath)) {
  const dashboard = readFileSync(dashboardPath, "utf8");
  const combined = dashboard;

  for (const token of requiredDashboardTokens) {
    if (dashboard.includes(token)) continue;
    failed = true;
    console.error(`Missing confirmed dashboard token: ${token}`);
  }

  for (const token of forbiddenCommonTokens) {
    if (!combined.includes(token)) continue;
    failed = true;
    console.error(`Forbidden Firstmall work-skin token: ${token}`);
  }

  for (const [name, source] of [["dashboard.html", dashboard]]) {
    const commentOpenCount = (source.match(/<!--\{\s*[@?]/g) || []).length;
    const commentCloseCount = (source.match(/<!--\{\s*\/\s*\}-->/g) || []).length;
    if (commentOpenCount !== commentCloseCount) {
      failed = true;
      console.error(
        `Unbalanced Firstmall comment blocks in ${name}: ${commentOpenCount} open, ${commentCloseCount} close`,
      );
    }

    const inlineOpenCount = (source.match(/\{\?[^}]*\}/g) || []).length;
    const inlineCloseCount = (source.match(/\{\/\}/g) || []).length;
    if (inlineOpenCount !== inlineCloseCount) {
      failed = true;
      console.error(
        `Unbalanced Firstmall inline conditions in ${name}: ${inlineOpenCount} open, ${inlineCloseCount} close`,
      );
    }
  }
}

if (failed) process.exit(1);

console.log(`Firstmall work-skin check passed (${requiredFiles.length} files).`);
