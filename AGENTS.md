# TrendyPicker Agent Notes

This file is the first stop for any human or AI agent working on this project.
Keep it current when project structure, ownership, or validation rules change.

## Project Goal

TrendyPicker is a static responsive ecommerce frontend prototype. The current priority is to preserve the visual result while making the codebase easier to maintain.

## Project Context Folder

Detailed long-lived project context lives in `.agents/`.

Read order for new chats:

1. `AGENTS.md`
2. `.agents/README.md`
3. `.agents/project-spec.md`
4. `.agents/architecture.md`
5. `.agents/coding-rules.md`
6. `.agents/roadmap.md`
7. `.agents/decisions.md`
8. `docs/structure-plan.md`

Update `.agents/` whenever architecture, coding rules, major decisions, or future plans change.

## Working Rules

- Treat every requested UI change as responsive by default across desktop, tablet, and mobile.
- Read the nearby HTML, CSS, and JavaScript before editing; many components share class names across pages.
- Keep edits in the owning file instead of adding quick patch blocks at the end of large files.
- Do not reintroduce drained compatibility files or broad legacy catch-all files.
- Do not remove `html { zoom: 0.9; }` from `styles/base.css` without a dedicated desktop visual calibration pass.
- Avoid unrelated refactors while fixing design details.
- Preserve existing user changes and avoid reverting work unless explicitly asked.

## CSS Ownership

The active structure is documented in `docs/structure-plan.md`.

High-level ownership:

- `common.css` imports shared base layers.
- `styles.css` is the home/global page entry file.
- `styles/tokens.css` owns shared custom properties.
- `styles/base.css` owns document defaults and page shell helpers.
- `firstmall-workskin/css/redesign/trendypicker-fonts.css` owns the shared Firstmall
  Pretendard font stack and legacy font-family overrides.
- `styles/header-navigation.css` owns promo bar, header, search panel, category navigation, and mobile menu base styles.
- `styles/hero.css` owns the main hero carousel and desktop hero Today's Pick panel.
- `styles/sections.css` owns section headings, tabs, and generic section layout.
- `styles/rails.css` owns shared rail movement controls.
- `styles/reels.css` owns home Real Trend reel cards.
- `styles/product-cards.css` owns Best Sellers product card base styles.
- `styles/deal-cards.css` owns Today's Pick and Time Deal card base styles.
- `styles/editorial.css` owns T.P Pick and T.P Magazine base styles.
- `styles/reviews.css` owns Customer Real Picks review cards.
- `styles/support-footer.css` owns Share Pick, newsletter, footer, and floating action buttons.
- `styles/responsive-*.css` files own responsive overrides for the matching component area.
- `styles/trend-product-sheet.css` owns the shared Real Trend product sheet popup, option controls, add-to-cart CTA, wishlist state, reviews, and cart toast.
- `realtrend/realtrend.css` is only for the Real Trend video page.
- `editors-pick/editors-pick.css` is only for the Editor's Pick page.
- `my-page/my-page.css` is shared by the My Page dashboard and account subpages.
- `my-page/orders.css`, `my-page/reviews.css`, `my-page/coupons.css`, `my-page/profile.css`, `my-page/points.css`, `my-page/membership.css`, `my-page/account-collections.css`, `my-page/wishlist.css`, and `my-page/saved-posts.css` own their matching account page additions.

## JavaScript Ownership

The active extraction plan is documented in `docs/structure-plan.md`.

Current component scripts:

- `script.js`: page transitions and shared TrendyPicker URL helpers only.
- `scripts/components/bootstrap.js`: shared presentation component loading.
- `scripts/prototype/cart-store.js`: static-prototype cart storage and badge state; replace during Firstmall integration.
- `scripts/prototype/wishlist-store.js`: static-prototype wishlist storage and UI state; replace during Firstmall integration.
- `scripts/prototype/saved-posts-store.js`: static-prototype Real Trend saved posts storage and My Page sync; replace during Firstmall integration.
- `scripts/components/header-navigation.js`: search, mobile menu, category link wiring, mobile category browsing, and desktop mega menu.
- `scripts/components/loop-rail.js`: generic rail buttons and loop rails.
- `scripts/prototype/components/product-sheet.js`: mock add-to-cart/product option sheet and product-card-to-detail navigation.
- `scripts/prototype/components/seller-wishlist.js`: mock Best Sellers wishlist icon state.
- `scripts/prototype/data/editor-data.js`: static Editor's Pick sample data used by the home T.P Pick card and the Editor's Pick page.
- `scripts/components/editor-card-slider.js`: home T.P Pick editor card slider and editor note toggles.
- `scripts/components/magazine-slider.js`: mobile T.P Magazine drag slider and progress bar.
- `scripts/components/magazine-links.js`: magazine card keyboard/click links to article detail pages.
- `scripts/components/support-footer.js`: footer accordions, floating to-top button, and newsletter form helpers.
- `scripts/components/scroll-reveal.js`: home scroll reveal class setup and viewport activation.
- `scripts/components/deal-sliders.js`: Today's Pick and Time Deal card sliders.
- `scripts/components/hero-slider.js`: main hero carousel.
- `scripts/components/today-pick-panel.js`: desktop hero Today's Pick mini panel autoplay, collapse, and scroll-to-deal behavior.
- `scripts/components/section-tabs.js`: Best Sellers category rail filtering and VIEW ALL link wiring.
- `scripts/prototype/pages/`: static page controllers for cart, listings, brands, Editor's Pick, Real Trend, product detail, and My Page.
- `my-page/profile-birthday.js`: profile birthday calendar behavior.
- `my-page/help-topic-data.js`: static Help Center topic content.
- `my-page/help-topic.js`: Help Center topic rendering, search, and accordion behavior.

Keep presentation behavior in focused files under `scripts/components/`. Keep static data and
Firstmall-replaceable behavior under `scripts/prototype/`.

## Page Loading Rules

- Non-Real Trend pages should not load `realtrend/realtrend.css` directly.
- Shared product sheet styling comes from `styles/trend-product-sheet.css`; its current behavior is
  prototype-only in `scripts/prototype/components/product-sheet.js`.
- Every HTML script tag that loads `scripts/prototype/` must include `data-prototype`.
- If a stylesheet or script is shared by many pages, confirm every page path before changing relative URLs.

## Firstmall Integration Rules

When working on the live Firstmall skin or `firstmall-workskin/`:

- Original skin baseline (read-only, never edit):
  `C:\Users\user\Desktop\(DONT CHANGE-20260730)Firstmall-original\responsive_food_mealkit_gl`
  New vs modified is always that folder vs `firstmall-workskin/`. Do not use git add/commit
  status for that classification.
- Treat the public URL as the primary clue to the template path. Example:
  `https://trendy-picker.co.kr/goods/view?no=92915` maps to
  `/data/skin/[skin]/goods/view.html`.
- Complex pages load multiple smaller HTML modules into one entry template. Inspect the entry
  file and every included module before editing; do not collapse a multi-module page into one
  large HTML file.
- Before any work-skin HTML/JS edit: contrast the same path in the original skin. Keep includes
  (`#subpageLNB`, `{#…}`, layout modules), template tokens (`{members…}`), and form `name`/`id`
  fields. Edit shared chrome in its owning file only (My Account LNB → `mypage/mypage_lnb.html`).
  Match live routes (Saved posts → `/mypage/saved_posts`). Prefer skin-path
  `trendypicker-*.js` links. Details: `.agents/coding-rules.md` and
  `.cursor/rules/firstmall-workskin.mdc`.
- **HTML:** edit the existing Firstmall skin templates/modules that own the page.
- **CSS:** add new scoped redesign files (for example `css/redesign/trendypicker-*.css`) and link
  them from the HTML. Do **not** mix TrendyPicker styles into Firstmall
  `css/common.css` or `css/user.css`. Do not add `!important` unless a Firstmall ID or
  legacy rule cannot be beaten with a more specific page-scoped selector.
- Keep upload candidates under `firstmall-workskin/`. Prefer
  `npm run check:firstmall` for work-skin validation (includes the redesign style check).
- Do not add CSS/JS `?v=` query strings on Firstmall skin links.
- T.P Magazine Firstmall files: `css/redesign/trendypicker-magazine.css`,
  `app/javascript/js/trendypicker-magazine.js`, `main/magazine.html`,
  `board/magazine/gallery01/{index,view}.html`, plus magazine branches in
  `board/index.html` and `board/view.html`. Upload checklist:
  `firstmall-workskin/MAGAZINE-UPLOAD.md`. Do not replace `main/magazine.html`
  with a redirect stub.
- New Arrival Firstmall files: `css/redesign/trendypicker-new.css`,
  `app/javascript/js/trendypicker-new.js`, `goods/new_arrivals.html`.
  Live URL: `/goods/new_arrivals` (maps from prototype `listing/new.html`).
  Point header/mobile NEW links to `/goods/new_arrivals`.
- Shared listing cards: `css/redesign/trendypicker-listing-cards.css` (`.tp-listing-grid`).
  Link it before the page CSS on catalog / best / new / brand detail / timedeal. Page files
  keep grid columns, heroes, and badges only.
- Cart Firstmall files: `order/cart.html` (existing Firstmall template),
  `css/redesign/trendypicker-cart.css`, `app/javascript/js/trendypicker-cart.js`.
  Live URL: `/order/cart`. Promo uses `getPromotionJson?mode=cart`. Coupons are selected
  on cart and applied at checkout.
- Checkout Firstmall files: `order/settle.html` (existing Firstmall template),
 `order/_shipping_address.html`, `order/pop_delivery_address.html`,
 `css/redesign/trendypicker-checkout.css`, `app/javascript/js/trendypicker-checkout.js`.
 Live URL: `/order/settle` (cart `addsettle`). Match cart visual language. Keep
 Firstmall discount/coupon fields in the template for apply JS; do not show the
 Discount picker UI. Coupon comes from cart `tpCartCoupon`. Tax uses original
 `state_tax_input` + `/order/get_state_ajax` + `order_price_calculate`. Standard
 Shipping shows "Charged at customs"; Express (`ship_set_code=quick`) shows the
 calculated tax amount.
- Footer Firstmall files: `layout_footer/standard.html` (existing Firstmall
 template), `css/redesign/trendypicker-footer.css`. Link the redesign CSS from
 the footer module only. Keep Firstmall ids/classes (`logo_wrap`, `footer_a1`–
 `footer_d1`, `bottom_wrap`, floating menu, accordion click on `.title`). Do not
 put footer redesign rules in `css/common.css` or `css/user.css`.
- Home T.P Magazine Firstmall files: `main/index.html` (existing home template) and
  `css/redesign/trendypicker-main-magazine.css`. Keep the existing magazine post links and
  banner images in `.main_magazine`; the redesign file owns only their card layout and responsive
  presentation.
- Home T.P Magazine Firstmall files: `main/index.html` (existing home template) and
  `css/redesign/trendypicker-main-magazine.css`. Keep the existing magazine post links and
  banner images in `.main_magazine`; the redesign file owns only their card layout and responsive
  presentation.

## Design Rules

- The site and product brand is `TrendyPicker`. Do not reintroduce the legacy product name in
  visible copy, code identifiers, storage keys, query parameters, documentation, or filenames.
- Maintain Pretendard as the site font.
- Use existing color tokens, especially `--purple`, before introducing new colors.
- Avoid layout that only works at one fixed width.
- Keep hover, active, selected, and clicked states consistent across desktop and mobile where the UI supports them.
- When editing card layouts, verify text length changes do not move fixed controls unexpectedly.

## Validation

Run these before finishing structural or shared UI work:

```bash
npm run check
git diff --check
```

`npm run check` verifies JavaScript syntax, single-reference unused declarations, CSS brace balance,
unused CSS classes, local assets, HTML links, duplicate IDs, inline scripts, prototype markers,
and the redesign style check (`tools/check-css-style.mjs`). `git diff --check` catches trailing
whitespace and blank-line issues.

`npm run check:firstmall` runs the work-skin validator plus the same style check. The style check
only inspects `trendypicker-*.css` / `trendypicker-*.js` under `firstmall-workskin/`. It **fails**
on duplicate selectors in the same file/media context, and on files whose `!important` ratio
exceeds 25%. It **warns** when a file grows past its recorded size, when a new file crosses the
soft line limit, or when `!important` use rises past a recorded baseline / 10% on a new file.
Large page files are expected — do not split them just to silence a size warning. See
`.agents/coding-rules.md`.

`npm run audit:placeholders` reports unresolved `href="#"` links that must be mapped to Firstmall
categories, policies, social accounts, or member actions.

## Branch Note

The repository may currently use `master`. That is not a code issue, but new collaborative work should prefer `main` if the remote/project standard expects it.
