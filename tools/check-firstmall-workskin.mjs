import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const workskinRoot = resolve(root, "firstmall-workskin");
const requiredFiles = [
  "css/trendypicker-mypage.css",
  "css/trendypicker-profile.css",
  "js/trendypicker-mypage.js",
  "js/trendypicker-profile.js",
  "js/trendypicker-profile-birthday.js",
  "mypage/dashboard.html",
  "mypage/myinfo.html",
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
  "/login_process/logout",
  "mypage-avatar-modal",
  "data-mypage-avatar-open",
  "data-mypage-avatar-remove",
  "name=\"membericonFile\"",
  "../member_process/membericonsave",
  "mypage-logout-modal",
  "data-mypage-logout-confirm",
  "data-trendypicker-order-preview",
  'class="bo-live-order mypage-order-preview"',
  "<em>+2 items</em>",
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
    label: "profile avatar fallback uses a plain background",
    pattern:
      /\.bo-profile__avatar\s+i\s*\{[^}]*inset:\s*0;[^}]*background:\s*#fff8ff;/s,
  },
  {
    label: "order empty-state cancel icon",
    pattern:
      /\.bo-order-empty\s*>\s*span\s*\{[^}]*background:\s*url\("\.\.\/images\/mypage\/cancel\.png"\)\s*center\s*\/\s*contain\s*no-repeat;/s,
  },
  {
    label: "saved-post mobile icon size",
    pattern:
      /\.bo-mobile-activity__grid\s+a:nth-child\(3\)\s+\.bo-mobile-icon\s*\{[^}]*background-image:\s*url\("\.\.\/images\/mypage\/saved\.png"\);[^}]*background-size:\s*38%\s+auto;/s,
  },
  {
    label: "mobile logout icon",
    pattern:
      /\.bo-mobile-service__grid\s+a:nth-child\(6\)\s+\.bo-mobile-icon\s*\{[^}]*background-image:\s*url\("\.\.\/images\/mypage\/logout\.png"\);/s,
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
      /\.bo-mypage-shell\s*\{[^}]*grid-template-columns:\s*clamp\(180px,\s*17vw,\s*205px\)\s+minmax\(0,\s*900px\);[^}]*padding:\s*36px\s+clamp\(20px,\s*3vw,\s*40px\)\s+86px;[\s\S]*?\.bo-profile\s*\{[^}]*min-height:\s*clamp\(208px,\s*17\.5vw,\s*232px\);/s,
  },
  {
    label: "all desktop My Page content shares the dashboard start line",
    pattern:
      /@media\s*\(min-width:\s*1121px\)\s*\{\s*\.bo-mypage-shell\s*>\s*\.subpage_container\.bo-mypage\s*\{[^}]*grid-column:\s*2;[^}]*justify-self:\s*start;/s,
  },
];

const requiredJsTokens = [
  "[data-mypage-avatar-open]",
  "[data-mypage-avatar-input]",
  "[data-mypage-avatar-remove]",
  "window.membericonDisplay",
  '#mypageLnbBasic .lnb_sub a[href*="/login_process/logout"]',
  '.bo-mobile-service__grid a[href*="/login_process/logout"]',
  "[data-mypage-logout-confirm]",
  "/login_process/logout",
  "trendypicker_order_preview",
  "is-trendypicker-preview-hidden",
  "getOrderStage",
  "getTrackingStage",
  "syncOrderTimeline",
  "hydrateTrackingDetails",
  'readOrderDetail(page, "Shipping Address")',
  "[data-bo-track-order]",
  "https://www.ups.com/track",
  "data-orders-epost-number",
];

const requiredProfileTokens = [
  "trendypicker-profile.css",
  'class="subpage_wrap bo-mypage-shell bo-profile-shell"',
  'class="subpage_container myinfo_wrap bo-mypage bo-profile-page"',
  'action="{=sslAction(\'../member_process/myinfo_modify\')}"',
  "{# form_member}",
  "Account settings",
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
  "/mypage/delivery_address?tab=1",
  "data-bo-default-address",
  "data-bo-preferences",
  "Preferences",
  "Save Changes",
  "data-bo-profile-avatar-edit",
  "data-bo-profile-avatar-image",
  "{member.name}",
  "{member.current_level.group_name}",
  "{user_icon_file}",
  "Connected Accounts",
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
  "../js/trendypicker-mypage.js",
  "../js/trendypicker-profile.js",
  "../js/trendypicker-profile-birthday.js",
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
    label: "profile page uses the neutral responsive page background",
    pattern:
      /\.bo-profile-shell\s*\{[^}]*background:\s*#faf7fc;[\s\S]*?\.bo-profile-shell::before\s*\{[^}]*background:\s*#faf7fc;/s,
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
    label: "profile content collapses to one column on mobile",
    pattern:
      /@media\s*\(max-width:\s*760px\)[\s\S]*?\.bo-profile-native-fields\s+\.resp_join_table\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/s,
  },
  {
    label: "wider profile content grows right from the shared dashboard start line",
    pattern:
      /@media\s*\(min-width:\s*1121px\)\s*\{\s*\.bo-profile-page\s*\{[^}]*width:\s*calc\(100%\s*\+\s*clamp\(0px,\s*calc\(100vw\s*-\s*1220px\),\s*120px\)\);/s,
  },
  {
    label: "desktop profile sidebar aligns with the profile heading",
    pattern:
      /\.bo-profile-shell\s+\.bo-account-side\s*\{[^}]*margin-top:\s*28px;/s,
  },
  {
    label: "profile select trigger has no arrow and keeps its value left aligned",
    pattern:
      /\.profile-field\s+\.realtrend-select-wrap::after\s*\{[^}]*content:\s*none;[\s\S]*?\.profile-field\s+\.realtrend-select-trigger\s*\{[^}]*justify-content:\s*flex-start;[\s\S]*?\.profile-field\s+\.realtrend-select-value\s*\{[^}]*text-align:\s*left;/s,
  },
  {
    label: "profile password, address, and preference cards are styled",
    pattern:
      /\.bo-profile-security-note\s*\{[^}]*grid-template-columns:\s*34px\s+minmax\(0,\s*1fr\)\s+auto;[\s\S]*?\.bo-profile-address__card\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto\s+auto;[\s\S]*?\.bo-profile-preferences__list\s*\{[^}]*display:\s*grid;/s,
  },
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

const cssPath = resolve(workskinRoot, "css/trendypicker-mypage.css");

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

const profileCssPath = resolve(workskinRoot, "css/trendypicker-profile.css");

if (existsSync(profileCssPath)) {
  const css = readFileSync(profileCssPath, "utf8");

  for (const { label, pattern } of requiredProfileCssPatterns) {
    if (pattern.test(css)) continue;
    failed = true;
    console.error(`Missing Firstmall profile CSS regression rule: ${label}`);
  }
}

const profileJsPath = resolve(workskinRoot, "js/trendypicker-profile.js");

if (existsSync(profileJsPath)) {
  const script = readFileSync(profileJsPath, "utf8");
  const requiredTokens = [
    "[data-bo-profile-avatar-edit]",
    "[data-bo-native-source] .resp_join_table",
    "[data-bo-personal-fields] .resp_join_table",
    "[data-bo-password-fields] .resp_join_table",
    "movePersonalField(",
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
  "js/trendypicker-profile-birthday.js",
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

const jsPath = resolve(workskinRoot, "js/trendypicker-mypage.js");

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
