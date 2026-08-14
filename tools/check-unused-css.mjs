import { readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const skipDirs = new Set([".git", ".agents", "node_modules"]);
const nonSelectorTokens = new Set(["inner", "jsdelivr", "net", "w3"]);
const serverRenderedClasses = new Set([
  // Firstmall inserts these through `{#form_member}` at runtime.
  "address_area",
  "member_icon_list",
  "row_email",
  "row_phone",
  "size_full",
  "size_mail1",
  "size_mail2",
  // Checkout `{#shipping_address}` module: order/_shipping_address.html
  "delivery_info",
  "delivery_info_member",
  "delivery_info_input",
  "settle_tab",
  "four_input_row",
  "shipping-info-guidelines",
  // Firstmall listing / cart / goods display hooks (injected HTML, not always in workskin).
  "search_filter_wrap",
  "percent_sale",
  "display_wish",
  "display_cart",
  "goods_icons",
  "color_option",
  "review_count",
  "no_scroll",
  "btn_cart",
  "cart_btn",
  "goods_cart",
  "icon_cart",
  "display_option",
  "zzimImage",
  "goods_list_style2",
  "displaY_review_score_a",
  "displaY_review_score_c",
  "goods_review_area",
  "reviewCnt",
  "price_won",
  "new_icon",
  // Coupons / login / magazine / board help chrome Firstmall may inject.
  "Clearfix",
  "coupon_box",
  "ab_p",
  "input_area",
  "login_sns_info",
  "ajaxLineMap",
  "service_section",
  "right2",
  "searchform",
  "board_cate_slide",
  "board_category2",
  "boad_faqview_btn",
  // Redesign sticky-nav / select hooks (reserved or toggled outside static HTML).
  "is-pinned",
  "help-topic-nav-placeholder",
  "checkout-native-select-value",
]);

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

const isFirstmallLegacyBoardCss = (file) => {
  const rel = relative(root, file).replace(/\\/g, "/");
  return /(^|\/)board\.css$/.test(rel);
};

const cssFiles = collectFiles(root, [".css"]);
const usageFiles = collectFiles(root, [".html", ".js"]);
const usageSource = usageFiles.map((file) => readFileSync(file, "utf8")).join("\n");
const classDefinitions = new Map();

for (const file of cssFiles) {
  if (isFirstmallLegacyBoardCss(file)) continue;
  const css = readFileSync(file, "utf8");
  for (const match of css.matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)) {
    const className = match[1];
    if (nonSelectorTokens.has(className)) continue;
    if (!classDefinitions.has(className)) classDefinitions.set(className, new Set());
    classDefinitions.get(className).add(file);
  }
}

const hasUsage = (className) => {
  if (serverRenderedClasses.has(className)) return true;

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
