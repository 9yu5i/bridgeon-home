import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const workskinRoot = resolve(root, "firstmall-workskin");
const requiredFiles = [
  "css/redesign/trendypicker-mypage.css",
  "css/redesign/trendypicker-profile.css",
  "css/redesign/trendypicker-orders.css",
  "css/redesign/trendypicker-wishlist.css",
  "css/redesign/trendypicker-help.css",
  "css/redesign/trendypicker-help-topic.css",
  "app/javascript/js/trendypicker-mypage.js",
  "app/javascript/js/trendypicker-orders.js",
  "app/javascript/js/trendypicker-wishlist.js",
  "app/javascript/js/trendypicker-profile.js",
  "app/javascript/js/trendypicker-profile-birthday.js",
  "mypage/dashboard.html",
  "mypage/myinfo.html",
  "mypage/order_catalog.html",
  "mypage/wish.html",
  "mypage/mypage_lnb.html",
  "mypage/myqna_catalog.html",
  "board/index.html",
  "board/notice/default01/index.html",
  "board/faq/_faq/index.html",
  "service/cs.html",
  "service/guide.html",
  "service/cancellation.html",
  "service/company.html",
  "service/agreement.html",
  "service/privacy.html",
  "images/mypage/cart.png",
  "images/mypage/wish_liked.png",
  "README.md",
];

const requiredOrdersTokens = [
  "/data/skin/{skin}/css/redesign/trendypicker-orders.css",
  'class="subpage_wrap bo-mypage-shell bo-orders-shell"',
  'class="subpage_container bo-mypage bo-orders-page"',
  '<!--{ @ record }-->',
  '<!--{@.items}-->',
  '<!--{@..options}-->',
  'order_view?no={.order_seq}',
  "viewImg(..goods_seq, 'thumbCart')",
  "order_cancel('{.order_seq}')",
  "order_refund('{.order_seq}')",
  "order_qna('{.order_seq}')",
  "{.custom_tracking_number}",
  "orders-controls",
  "orders-filter-tabs",
  "data-orders-search",
  "data-order-step",
  "order_catalog?sc_date=0",
  "/app/javascript/js/trendypicker-mypage.js",
  "/app/javascript/js/trendypicker-orders.js",
];

const forbiddenOrdersTokens = ["board_category2", 'class="order_tab"', "?v="];

const requiredWishlistTokens = [
  "/data/skin/{skin}/css/redesign/trendypicker-wishlist.css",
  'class="subpage_wrap bo-mypage-shell bo-wishlist-shell"',
  'class="subpage_container bo-mypage bo-wishlist-page"',
  "bo-wishlist-tabs",
  'data-wish-filter="all"',
  'data-wish-filter="beauty"',
  "bo-wish-card",
  "bo-wish-card__brand",
  "bo-wish-card__cart-btn",
  "bo-wish-card__wish-btn",
  "bo-wish-card__category-seed",
  '<!--{ @ record }-->',
  "{.goods_seq}",
  "{.wish_seq}",
  "/app/javascript/js/trendypicker-mypage.js",
  "/app/javascript/js/trendypicker-wishlist.js",
];

const forbiddenWishlistTokens = ["?v=", "장바구니 담기", "◀ 이전", "다음 ▶"];

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
  "/login_process/logout",
  "mypage-avatar-modal",
  "data-mypage-avatar-open",
  "data-mypage-avatar-remove",
  "name=\"membericonFile\"",
  "../member_process/membericonsave",
  "mypage-logout-modal",
  "data-mypage-logout-confirm",
  'class="bo-live-order mypage-order-preview"',
  "Payment Pending",
  "Payment Confirmed",
  "Order Placed",
  "Out for Delivery",
  "data-bo-track-order",
  "data-order-step",
  "data-order-tracking-number",
  "data-order-details-url",
  "data-orders-modal-layer",
  "orders-dialog-primary",
  "data-orders-track-estimated",
  "data-orders-track-address",
  "trendypicker-epost-form",
];

const forbiddenDashboardTokens = [
  "{order_summary.",
  "/mypage/order_list",
  "/mypage/wishlist",
  'href="#"',
  "bo-mobile-logout",
  "btn_sub_all",
  "bo-mobile-icon--filled",
  "bo-mobile-icon--letter",
  ">Settings<",
  'class="bo-profile__edit" href="/mypage/myinfo"',
  'src="{member.profile_image}"',
];

const forbiddenCssTokens = [
  ".bo-mobile-logout",
  ".bo-profile__edit svg",
  ".bo-profile__stat-icon svg",
  ".bo-mobile-icon svg",
  ".bo-reel-stats span svg",
];

const requiredCssPatterns = [
  {
    label: "desktop My Page keeps the purple gradient backdrop",
    pattern:
      /\.bo-mypage-shell::before\s*\{[^}]*height:\s*568px;[^}]*radial-gradient\([^}]*linear-gradient\(108deg,\s*#0b0326\s*0%,\s*#29106a\s*47%,\s*#ad42ea\s*100%\);/s,
  },
  {
    label: "profile avatar fallback uses a plain background",
    pattern:
      /\.bo-profile__avatar\s+i\s*\{[^}]*inset:\s*0;[^}]*background:\s*#fff8ff;/s,
  },
  {
    label: "order empty-state cancel icon",
    pattern:
      /\.bo-order-empty\s*>\s*span\s*\{[^}]*background:\s*url\("\.\.\/\.\.\/images\/mypage\/cancel\.png"\)\s*center\s*\/\s*contain\s*no-repeat;/s,
  },
  {
    label: "saved-post mobile icon size",
    pattern:
      /\.bo-mobile-activity__grid\s+a:nth-child\(3\)\s+\.bo-mobile-icon\s*\{[^}]*background-image:\s*url\("\.\.\/\.\.\/images\/mypage\/saved\.png"\);[^}]*background-size:\s*38%\s+auto;/s,
  },
  {
    label: "mobile logout icon",
    pattern:
      /\.bo-mobile-service__grid\s+a:nth-child\(6\)\s+\.bo-mobile-icon\s*\{[^}]*background-image:\s*url\("\.\.\/\.\.\/images\/mypage\/logout\.png"\);/s,
  },
  {
    label: "order timeline icon line mask",
    pattern:
      /\.bo-live-order__timeline\s+span:not\(\.is-current\)\s+i::before\s*\{[^}]*opacity:\s*0\.42;[\s\S]*?\.bo-live-order__timeline\s+i\s*\{[^}]*background:\s*#fff;[^}]*box-shadow:\s*0\s+0\s+0\s+4px\s+#fff;/s,
  },
  {
    label: "mobile order timeline icon alignment",
    pattern:
      /@media\s*\(max-width:\s*760px\)[\s\S]*?\.bo-live-order__timeline\s*\{[^}]*--bo-order-icon-size:\s*34px;/s,
  },
  {
    label: "order copy and timeline shared left alignment",
    pattern:
      /\.bo-live-order\s*\{[^}]*--bo-order-image-size:\s*150px;[^}]*--bo-order-copy-gap:\s*34px;[\s\S]*?\.bo-live-order__timeline\s*\{[^}]*margin:\s*-58px\s+0\s+18px\s+calc\(var\(--bo-order-image-size\)\s*\+\s*var\(--bo-order-copy-gap\)\);/s,
  },
  {
    label: "order timeline edge-to-edge stage spacing",
    pattern:
      /\.bo-live-order__timeline\s*\{[^}]*display:\s*flex;[^}]*justify-content:\s*space-between;[\s\S]*?\.bo-live-order__timeline:has\(span:nth-child\(3\)\.is-current\)::after\s*\{[^}]*transform:\s*scaleX\(0\.666667\);/s,
  },
  {
    label: "order timeline first label forced wrap",
    pattern:
      /\.bo-live-order__timeline\s+span:first-child\s+small\s*\{[^}]*width:\s*72px;/s,
  },
  {
    label: "desktop order timeline edge labels remain centered",
    pattern:
      /\.bo-live-order__timeline\s+span:first-child\s+small,\s*\.bo-live-order__timeline\s+span:last-child\s+small\s*\{[^}]*left:\s*50%;[^}]*text-align:\s*center;[^}]*transform:\s*translateX\(-50%\);/s,
  },
  {
    label: "mobile order timeline uses the compact width",
    pattern:
      /@media\s*\(max-width:\s*760px\)[\s\S]*?\.bo-live-order__timeline\s*\{[^}]*margin:\s*14px\s+0;/s,
  },
  {
    label: "desktop dashboard grid and profile sizing",
    pattern:
      /\.bo-mypage-shell\s*\{[^}]*--bo-account-content-width:\s*909px;[^}]*grid-template-columns:\s*clamp\(180px,\s*17vw,\s*205px\)\s+minmax\(0,\s*var\(--bo-account-content-width\)\);[^}]*padding:\s*36px\s+clamp\(20px,\s*3vw,\s*40px\)\s+86px;[\s\S]*?\.bo-profile\s*\{[^}]*min-height:\s*clamp\(208px,\s*17\.5vw,\s*232px\);/s,
  },
  {
    label: "all desktop My Page content shares the dashboard start line",
    pattern:
      /@media\s*\(min-width:\s*1121px\)\s*\{\s*\.bo-mypage-shell\s*>\s*\.subpage_container\.bo-mypage\s*\{[^}]*grid-column:\s*2;[^}]*justify-self:\s*start;/s,
  },
  {
    label: "all desktop My Page sidebars share one common baseline",
    pattern:
      /\.bo-mypage-shell\s*>\s*\.bo-account-side\s*\{[^}]*margin-top:\s*60px\s*!important;/s,
  },
  {
    label: "My Page prefers native cross-document transitions",
    pattern:
      /@view-transition\s*\{[^}]*navigation:\s*auto;[\s\S]*?::view-transition-old\(root\)[\s\S]*?::view-transition-new\(root\)/s,
  },
];

const requiredJsTokens = [
  "trendypicker-page-transition",
  '"PageRevealEvent" in window',
  "is-page-leaving",
  "is-page-entering",
  "[data-mypage-avatar-open]",
  "[data-mypage-avatar-input]",
  "[data-mypage-avatar-remove]",
  "window.membericonDisplay",
  '#mypageLnbBasic .lnb_sub a[href*="/login_process/logout"]',
  '.bo-mobile-service__grid a[href*="/login_process/logout"]',
  "[data-mypage-logout-confirm]",
  "/login_process/logout",
  "getOrderStage",
  "getTrackingStage",
  "syncOrderTimeline",
  "hydrateTrackingDetails",
  'readOrderDetail(page, "Shipping Address")',
  "[data-bo-track-order]",
  "https://www.ups.com/track",
  "data-orders-epost-number",
  "normalizeOrderCatalogLinks",
  'searchParams.set("sc_date", "0")',
];

const requiredProfileTokens = [
  "trendypicker-profile.css",
  'class="subpage_wrap bo-mypage-shell bo-profile-shell"',
  'class="subpage_container myinfo_wrap bo-mypage bo-profile-page"',
  'action="{=sslAction(\'../member_process/myinfo_modify\')}"',
  "{# form_member}",
  "bo-profile-identity",
  "bo-profile-avatar-panel",
  "profile-avatar-edit",
  "trendypickerProfileImageForm",
  "trendypickerProfileImageInput",
  "bo-profile-personal-fields",
  "data-bo-personal-fields",
  "data-bo-native-source",
  "data-bo-password-fields",
  "Login &amp; Security",
  "Default Shipping Address",
  "data:image/png;base64,iVBORw0KGgo",
  "/mypage/delivery_address?tab=1",
  "data-bo-default-address",
  "profile-address-dialog",
  "profile-address-modal",
  "profile-address-native-frame",
  "data-bo-address-modal-open",
  "data-bo-address-modal-close",
  "data-bo-preferences",
  "Preferences",
  "Save Changes",
  "data-bo-profile-avatar-edit",
  "data-bo-profile-avatar-image",
  "{member.name}",
  "{user_icon_file}",
  "Connected Accounts",
  ".key_ == 'twitter'}-->Twitter",
  "joinform.use_sns",
  "sns_joined_list",
  "sns-login-button-mbconnect-direct",
  "fb-login-button-mbconnect-direct",
  "snsbuttondisconnectlay",
  "data-bo-sns-connect",
  "/mypage/dashboard",
  "/mypage/myinfo",
  "/mypage/order_catalog",
  "/mypage/wish",
  "/mypage/withdrawal",
  "/login_process/logout",
  "membericonFile",
  "../member_process/membericonsave",
  "mypage-logout-modal",
  "/app/javascript/js/trendypicker-mypage.js",
  "/app/javascript/js/trendypicker-profile.js",
  "/app/javascript/js/trendypicker-profile-birthday.js",
];

const forbiddenProfileTokens = [
  'href="#"',
  "data-profile-payment",
  "profile-payment-card",
  "data-profile-add-address",
  "profile-address-card",
  "name@email.com",
  "350 5th Ave",
  "login_sns_check",
  "icon-sns-check-",
];

const requiredProfileCssPatterns = [
  {
    label: "profile page replaces the dashboard gradient with a white canvas",
    pattern:
      /\.bo-profile-shell\s*\{[^}]*background:\s*#fff;[\s\S]*?\.bo-profile-shell::before\s*\{[^}]*height:\s*100%;[^}]*background:\s*#fff;/s,
  },
  {
    label: "native Firstmall member fields use a responsive grid",
    pattern:
      /\.bo-profile-native-fields\s+\.resp_join_table\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/s,
  },
  {
    label: "profile identity uses the source design's avatar and form columns",
    pattern:
      /\.bo-profile-identity\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*190px\s+minmax\(0,\s*1fr\);[^}]*gap:\s*30px;/s,
  },
  {
    label: "native member-icon field is replaced by the profile avatar panel",
    pattern:
      /\.bo-profile-native-fields\s+\.resp_join_table\s*>\s*ul:has\(input\[name="user_icon"\]\)\s*\{[^}]*display:\s*none;/s,
  },
  {
    label: "profile form controls retain a visible focus state",
    pattern:
      /\.bo-profile-native-fields\s+input:not\(\[type="checkbox"\]\):not\(\[type="radio"\]\):focus,[\s\S]*?box-shadow:\s*0\s+0\s+0\s+3px\s+rgba\(123,\s*45,\s*226,\s*0\.12\);/s,
  },
  {
    label: "profile content collapses to one column on tablet and mobile",
    pattern:
      /@media\s*\(max-width:\s*1120px\)[\s\S]*?\.bo-profile-native-fields\s+\.resp_join_table\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/s,
  },
  {
    label: "profile content uses the shared 909px account width",
    pattern:
      /\.bo-profile-page\s*\{[^}]*width:\s*min\(100%,\s*var\(--bo-account-content-width,\s*909px\)\);[^}]*max-width:\s*var\(--bo-account-content-width,\s*909px\);/s,
  },
  {
    label: "desktop profile selects match compact native field height",
    pattern:
      /@media\s*\(min-width:\s*1121px\)[\s\S]*?\.bo-profile-form\s+\.profile-field\s+\.realtrend-select-trigger\s*\{[^}]*height:\s*44px;/s,
  },
  {
    label: "desktop profile content aligns to the shared account card baseline",
    pattern:
      /@media\s*\(min-width:\s*1121px\)[\s\S]*?\.bo-profile-shell\s+\.subpage_container\.bo-mypage\.bo-profile-page\s*\{[^}]*padding-top:\s*60px;/s,
  },
  {
    label: "profile select trigger shows an arrow and keeps its value left aligned",
    pattern:
      /\.profile-field\s+\.realtrend-select-wrap::after\s*\{[^}]*content:\s*""\s*!important;[^}]*border-right:\s*1\.5px\s+solid\s+#111;[\s\S]*?\.profile-field\s+\.realtrend-select-trigger\s*\{[^}]*justify-content:\s*flex-start;[\s\S]*?\.profile-field\s+\.realtrend-select-value\s*\{[^}]*text-align:\s*left;/s,
  },
  {
    label: "profile password, address, and preference cards are styled",
    pattern:
      /\.bo-profile-security-note\s*\{[^}]*grid-template-columns:\s*34px\s+minmax\(0,\s*1fr\)\s+auto;[\s\S]*?\.bo-profile-address__card\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto;[\s\S]*?\.bo-profile-preferences__list\s*\{[^}]*display:\s*grid;/s,
  },
  {
    label: "desktop profile side menu can follow the measured Profile title offset",
    pattern:
      /@media\s*\(min-width:\s*1121px\)[\s\S]*?\.bo-profile-shell\s*>\s*\.bo-account-side\s*\{[^}]*margin-top:\s*var\(--bo-profile-side-offset,\s*60px\)\s*!important;/s,
  },
  {
    label: "profile security note uses the approved lock image",
    pattern:
      /\.bo-profile-security-note\s*>\s*span\s*>\s*img\s*\{[^}]*display:\s*block\s*!important;[^}]*width:\s*18px\s*!important;/s,
  },
  {
    label: "default address card is marked by its own background, not a separate badge",
    pattern: /\.bo-profile-address__card\.is-default\s*\{[^}]*background:/s,
  },
  {
    label: "address delete button keeps its pink default state",
    pattern:
      /\.bo-profile-address__actions\s+\.bo-profile-address__delete\s*\{[^}]*border-color:\s*#f0d8e3;[^}]*color:\s*#d63d75;/s,
  },
  {
    label: "profile address modal follows the source responsive dialog shell",
    pattern:
      /\.profile-address-dialog\s*\{[^}]*place-items:\s*center;[\s\S]*?\.profile-address-modal\s*\{[^}]*width:\s*min\(680px,\s*calc\(100vw\s*-\s*48px\)\);[^}]*overflow:\s*hidden;[^}]*border-radius:\s*18px;/s,
  },
];

const requiredOrdersJsTokens = [
  ".bo-order-card",
  "[data-orders-search]",
  "[data-orders-filter]",
  "dataset.orderStep",
  "dataset.orderState",
  'select[name="sc_date"]',
  "orders-select-control realtrend-select-wrap",
  'searchParams.set("sc_date", "0")',
  "loadCancelRefundHistory",
  "/mypage/refund_catalog",
  "/mypage/return_catalog",
];

const requiredWishlistJsTokens = [
  ".bo-wishlist-page",
  ".bo-wishlist-tabs",
  "[data-wish-filter]",
  ".bo-wish-card",
  "dataset.wishCategory",
  "bo-wish-card__category-seed",
  "is-filtered-out",
  "/goods/get_brand_list",
  "FETCH_CONCURRENCY",
];

const requiredHelpTokens = [
  "trendypicker-help.css",
  'class="subpage_wrap bo-mypage-shell bo-help-shell"',
  'class="subpage_container bo-mypage bo-help-page"',
  "/board/?id=faq",
  "/mypage/myqna_catalog",
  "/service/guide",
  "/service/cancellation",
  'class="help-hero"',
  'class="help-directory-card"',
];

const requiredHelpCssTokens = [
  ".bo-help-shell",
  ".help-hero",
  ".help-directory-card",
  ".help-directory-contact",
];

const requiredHelpTopicFiles = [
  "service/guide.html",
  "service/cancellation.html",
  "service/company.html",
  "service/agreement.html",
  "service/privacy.html",
];

const requiredHelpTopicTokens = [
  "trendypicker-help-topic.css",
  "bo-help-topic-page",
  "bo-help-topic-body",
];

const requiredCustomerServiceShellFiles = [
  "service/guide.html",
  "service/cancellation.html",
];

const requiredCustomerServiceShellTokens = [
  "help-topic-shell",
  "help-topic-nav",
  "help-topic-layout",
  "Customer Service",
];

let failed = false;

for (const relativePath of requiredFiles) {
  const file = resolve(workskinRoot, relativePath);
  if (existsSync(file)) continue;
  failed = true;
  console.error(`Missing Firstmall work-skin file: ${relativePath}`);
}

const dashboardPath = resolve(workskinRoot, "mypage/dashboard.html");
const profilePath = resolve(workskinRoot, "mypage/myinfo.html");
const ordersPath = resolve(workskinRoot, "mypage/order_catalog.html");
const helpPath = resolve(workskinRoot, "service/cs.html");

if (existsSync(ordersPath)) {
  const orders = readFileSync(ordersPath, "utf8");

  for (const token of requiredOrdersTokens) {
    if (orders.includes(token)) continue;
    failed = true;
    console.error(`Missing confirmed orders token: ${token}`);
  }

  for (const token of forbiddenOrdersTokens) {
    if (!orders.includes(token)) continue;
    failed = true;
    console.error(`Stale orders navigation token: ${token}`);
  }

  if (orders.includes("custom_tracking_number = 'EE123456789KR'")) {
    failed = true;
    console.error("Orders page must not replace the live EMS tracking number with sample data");
  }
}

const wishlistPath = resolve(workskinRoot, "mypage/wish.html");
if (existsSync(wishlistPath)) {
  const wishlist = readFileSync(wishlistPath, "utf8");

  for (const token of requiredWishlistTokens) {
    if (wishlist.includes(token)) continue;
    failed = true;
    console.error(`Missing confirmed wishlist token: ${token}`);
  }

  for (const token of forbiddenWishlistTokens) {
    if (!wishlist.includes(token)) continue;
    failed = true;
    console.error(`Forbidden wishlist token: ${token}`);
  }
}

const wishlistJsPath = resolve(
  workskinRoot,
  "app/javascript/js/trendypicker-wishlist.js",
);

if (existsSync(wishlistJsPath)) {
  const script = readFileSync(wishlistJsPath, "utf8");

  for (const token of requiredWishlistJsTokens) {
    if (script.includes(token)) continue;
    failed = true;
    console.error(`Missing confirmed wishlist JS token: ${token}`);
  }
}

const wishlistCssPath = resolve(
  workskinRoot,
  "css/redesign/trendypicker-wishlist.css",
);

if (existsSync(wishlistCssPath)) {
  const stylesheet = readFileSync(wishlistCssPath, "utf8");
  for (const token of [
    ".bo-wishlist-tabs",
    ".bo-wish-card__cart-btn",
    ".bo-wish-card.is-filtered-out",
    "images/mypage/cart.png",
    "images/mypage/wish_liked.png",
  ]) {
    if (stylesheet.includes(token)) continue;
    failed = true;
    console.error(`Missing confirmed wishlist CSS token: ${token}`);
  }
}

if (existsSync(helpPath)) {
  const help = readFileSync(helpPath, "utf8");

  for (const token of requiredHelpTokens) {
    if (help.includes(token)) continue;
    failed = true;
    console.error(`Missing confirmed Help Center token: ${token}`);
  }
}

const helpCssPath = resolve(
  workskinRoot,
  "css/redesign/trendypicker-help.css",
);

if (existsSync(helpCssPath)) {
  const stylesheet = readFileSync(helpCssPath, "utf8");

  for (const token of requiredHelpCssTokens) {
    if (stylesheet.includes(token)) continue;
    failed = true;
    console.error(`Missing confirmed Help Center CSS token: ${token}`);
  }
}

for (const relativePath of requiredHelpTopicFiles) {
  const topicPath = resolve(workskinRoot, relativePath);
  if (!existsSync(topicPath)) continue;
  const topic = readFileSync(topicPath, "utf8");

  for (const token of requiredHelpTopicTokens) {
    if (topic.includes(token)) continue;
    failed = true;
    console.error(`Missing confirmed Help Topic token in ${relativePath}: ${token}`);
  }
}

for (const relativePath of requiredCustomerServiceShellFiles) {
  const topicPath = resolve(workskinRoot, relativePath);
  if (!existsSync(topicPath)) continue;
  const topic = readFileSync(topicPath, "utf8");

  for (const token of requiredCustomerServiceShellTokens) {
    if (topic.includes(token)) continue;
    failed = true;
    console.error(`Missing confirmed Customer Service shell token in ${relativePath}: ${token}`);
  }
}

const boardPath = resolve(workskinRoot, "board/index.html");
if (existsSync(boardPath)) {
  const board = readFileSync(boardPath, "utf8");
  for (const token of [
    "trendypicker-help-topic.css",
    "bo-help-board-page",
    "bo-help-topic-container",
    "help-topic-shell",
    "help-topic-nav",
  ]) {
    if (board.includes(token)) continue;
    failed = true;
    console.error(`Missing confirmed Help board token: ${token}`);
  }
}

const noticeBoardPath = resolve(workskinRoot, "board/notice/default01/index.html");
if (existsSync(noticeBoardPath)) {
  const noticeBoard = readFileSync(noticeBoardPath, "utf8");
  for (const token of ["help-board-count", "help-board-head", "Search", "Clear"]) {
    if (noticeBoard.includes(token)) continue;
    failed = true;
    console.error(`Missing confirmed Notice board token: ${token}`);
  }
}

const qnaPath = resolve(workskinRoot, "mypage/myqna_catalog.html");
if (existsSync(qnaPath)) {
  const qna = readFileSync(qnaPath, "utf8");
  for (const token of [
    "trendypicker-help-topic.css",
    "bo-help-qna-page",
    "help-topic-shell",
    "Search inquiries",
  ]) {
    if (qna.includes(token)) continue;
    failed = true;
    console.error(`Missing confirmed Help Q&A token: ${token}`);
  }
}

const ordersJsPath = resolve(
  workskinRoot,
  "app/javascript/js/trendypicker-orders.js",
);

if (existsSync(ordersJsPath)) {
  const script = readFileSync(ordersJsPath, "utf8");

  for (const token of requiredOrdersJsTokens) {
    if (script.includes(token)) continue;
    failed = true;
    console.error(`Missing confirmed orders JS token: ${token}`);
  }
}

if (existsSync(dashboardPath)) {
  const dashboard = readFileSync(dashboardPath, "utf8");

  for (const token of requiredDashboardTokens) {
    if (dashboard.includes(token)) continue;
    failed = true;
    console.error(`Missing confirmed dashboard token: ${token}`);
  }

  for (const token of forbiddenDashboardTokens) {
    if (!dashboard.includes(token)) continue;
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

if (existsSync(profilePath)) {
  const profile = readFileSync(profilePath, "utf8");

  for (const token of requiredProfileTokens) {
    if (profile.includes(token)) continue;
    failed = true;
    console.error(`Missing confirmed profile token: ${token}`);
  }

  for (const token of forbiddenProfileTokens) {
    if (!profile.includes(token)) continue;
    failed = true;
    console.error(`Forbidden Firstmall profile prototype token: ${token}`);
  }

  const commentOpenCount = (profile.match(/<!--\{\s*[@?]/g) || []).length;
  const commentCloseCount = (profile.match(/<!--\{\s*\/\s*\}-->/g) || []).length;
  if (commentOpenCount !== commentCloseCount) {
    failed = true;
    console.error(
      `Unbalanced Firstmall comment blocks in myinfo.html: ${commentOpenCount} open, ${commentCloseCount} close`,
    );
  }

  for (const tag of ["form", "section"]) {
    const openCount = (profile.match(new RegExp(`<${tag}\\b`, "gi")) || []).length;
    const closeCount = (profile.match(new RegExp(`</${tag}>`, "gi")) || []).length;
    if (openCount === closeCount) continue;
    failed = true;
    console.error(
      `Unbalanced ${tag} elements in myinfo.html: ${openCount} open, ${closeCount} close`,
    );
  }
}

const cssPath = resolve(workskinRoot, "css/redesign/trendypicker-mypage.css");

if (existsSync(cssPath)) {
  const css = readFileSync(cssPath, "utf8");

  for (const token of forbiddenCssTokens) {
    if (!css.includes(token)) continue;
    failed = true;
    console.error(`Stale Firstmall dashboard CSS selector: ${token}`);
  }

  for (const { label, pattern } of requiredCssPatterns) {
    if (pattern.test(css)) continue;
    failed = true;
    console.error(`Missing Firstmall dashboard CSS regression rule: ${label}`);
  }
}

const profileCssPath = resolve(workskinRoot, "css/redesign/trendypicker-profile.css");

if (existsSync(profileCssPath)) {
  const css = readFileSync(profileCssPath, "utf8");

  if (/\.bo-profile-shell\s+\.bo-account-side\s*\{/.test(css)) {
    failed = true;
    console.error("Profile CSS must not override the shared My Page sidebar position");
  }

  for (const { label, pattern } of requiredProfileCssPatterns) {
    if (pattern.test(css)) continue;
    failed = true;
    console.error(`Missing Firstmall profile CSS regression rule: ${label}`);
  }
}

const ordersCssPath = resolve(workskinRoot, "css/redesign/trendypicker-orders.css");

if (existsSync(ordersCssPath)) {
  const css = readFileSync(ordersCssPath, "utf8");

  if (/\.bo-orders-shell\s+\.bo-account-side\s*\{/.test(css)) {
    failed = true;
    console.error("Orders CSS must not override the shared My Page sidebar position");
  }

  if (
    !/@media\s*\(min-width:\s*1121px\)[\s\S]*?\.bo-orders-shell\s+\.subpage_container\.bo-orders-page\s*\{[^}]*padding-top:\s*60px;/s.test(
      css,
    )
  ) {
    failed = true;
    console.error("Orders content must align to the shared 60px account card baseline");
  }
}

const profileJsPath = resolve(
  workskinRoot,
  "app/javascript/js/trendypicker-profile.js",
);

if (existsSync(profileJsPath)) {
  const script = readFileSync(profileJsPath, "utf8");
  const requiredTokens = [
    "[data-bo-profile-avatar-edit]",
    "[data-bo-native-source] .resp_join_table",
    "[data-bo-personal-fields] .resp_join_table",
    "[data-bo-password-fields] .resp_join_table",
    "movePersonalField(",
    "syncProfileName();",
    '"First Name"',
    '"Last Name"',
    '"Phone Number"',
    '"Email"',
    '"Birthday"',
    '"Country"',
    "bo-profile-country-field",
    "enhanceCountryField",
    "enhancePhoneField",
    "profile-phone-control",
    "country_calling_code",
    "enhanceEmailField",
    "bo-profile-email-input",
    "profile-select-control realtrend-select-wrap",
    "realtrend-select-menu",
    "birthdayInput.dataset.profileBirthday",
    '"trendypickerProfileImageInput"',
    'input?.removeAttribute("readonly")',
    "boRestoreValue",
    'input.addEventListener("blur"',
    'visibleInput.placeholder = "000 000 0000"',
    'input[name="old_password"]',
    'input[name="new_password"]',
    "[data-bo-password-confirm]",
    'input[name="mailing"]',
    'input[name="sms"]',
    'fetch("/mypage/delivery_address?tab=1"',
    "hydrateDefaultAddress",
    "launchNativeAddressEditor",
    "nativeAddressModalStyles",
    "simplifyNativeAddressForm",
    "primaryRow",
    'card.className = "bo-profile-address__card is-default"',
    "syncProfileSideAlignment",
    "--bo-profile-side-offset",
    "setDefaultAddress",
    'nativeModal.dataset.addressSubmitIntent = "save"',
    'nativeModal.dataset.addressSubmitIntent = "default"',
    'const isSilentDefaultUpdate = pendingAddressOperation === "set-default"',
    "defaultInput.checked = shouldSetDefault",
    'defaultInput.removeAttribute("checked")',
    'classList.add("is-default-updating")',
    'classList.contains("is-default-updating")',
    'pendingAddressOperation = "set-default"',
    "trendypicker-address-footer",
    "defaultButton.dataset.trendypickerSubmitBound",
    "if (!validateNativeAddressForm(nativeModal)) return",
    "defaultInput.checked = true",
    "addressFrameNeedsReload",
    "completeAddressSave",
    "hideAddressModal",
    "trendypicker_reload=",
    'setLabel("address_description", "Address Name")',
    'setLabel("recipient_user_first_name", "Recipient First Name")',
    'setLabel("international_country_input", "Country / Region")',
    'setLabel("international_postcode", "ZIP / Postal Code")',
    "/^global$/i",
    'frameDocument.querySelector(".addAddress")',
    'frameDocument.querySelectorAll(".updateaddress")',
    "profileImageForm.submit()",
    'document.getElementById("membericonUpdate")?.click()',
    "window.membericonDisplay",
    "displayAvatar(source)",
    "[data-bo-sns-connect]",
    ".bo-profile-sns__item",
    ".sns-login-button-mbconnect-direct, .fb-login-button-mbconnect-direct",
    "nativeConnectControl?.click()",
  ];

  for (const token of requiredTokens) {
    if (script.includes(token)) continue;
    failed = true;
    console.error(`Missing Firstmall profile interaction token: ${token}`);
  }
}

const profileBirthdayJsPath = resolve(
  workskinRoot,
  "app/javascript/js/trendypicker-profile-birthday.js",
);

if (existsSync(profileBirthdayJsPath)) {
  const script = readFileSync(profileBirthdayJsPath, "utf8");
  const requiredTokens = [
    "[data-profile-birthday]",
    "profile-birthday-panel",
    "data-profile-birthday-month",
    "data-profile-birthday-year",
    "data-profile-birthday-day",
    "enhanceCalendarSelect",
    "profile-birthday-select-control realtrend-select-wrap",
    "parseDate(input.value) || new Date()",
    'input.dispatchEvent(new Event("change", { bubbles: true }))',
  ];

  for (const token of requiredTokens) {
    if (script.includes(token)) continue;
    failed = true;
    console.error(`Missing Firstmall profile birthday token: ${token}`);
  }
}

const jsPath = resolve(workskinRoot, "app/javascript/js/trendypicker-mypage.js");

if (existsSync(jsPath)) {
  const script = readFileSync(jsPath, "utf8");

  for (const token of requiredJsTokens) {
    if (script.includes(token)) continue;
    failed = true;
    console.error(`Missing Firstmall dashboard interaction token: ${token}`);
  }
}

if (failed) process.exit(1);

console.log(`Firstmall work-skin check passed (${requiredFiles.length} files).`);
