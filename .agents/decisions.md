# TrendyPicker Decisions

## 2026-08-12: Firstmall New vs Modified Uses The 2026-07-30 Original Skin

Decision:

- The read-only original skin is
  `C:\Users\user\Desktop\(DONT CHANGE-20260730)Firstmall-original\responsive_food_mealkit_gl`.
- New vs modified for `firstmall-workskin/` is always that folder, never git status.
- Do not edit the original folder.

Why:

- `firstmall-workskin/` is an upload package copied into this repo. Git "added" does not mean
  the live Firstmall skin lacked the file. The 2026-07-30 dump is the homepage/skin source of
  truth.

## 2026-08-05: Firstmall Redesign Uses Existing HTML + New CSS Files Only

Decision:

- Map Firstmall page URLs to skin templates by path (for example `/goods/view` →
  `[skin]/goods/view.html`).
- Keep complex pages as multi-module HTML instead of merging every include into one file.
- Edit existing Firstmall HTML templates/modules for structure and markup.
- Add TrendyPicker presentation in new scoped CSS files under `css/redesign/` and link them from
  the HTML.
- Do not add redesign styles to Firstmall `css/common.css` or `css/user.css`.

Why:

- The live skin already owns commerce markup, includes, and actions.
- `common.css` and `user.css` are large and shared; mixing redesign there makes ownership and
  uploads harder and increases regression risk.

## 2026-08-05: Remove Production Order Fixtures and Connect the Native Help Center

Decision:

- The Firstmall dashboard and order catalog no longer accept query parameters that inject sample
  orders. Production templates render only Firstmall order data or native empty states.
- `/service/cs` mirrors the static Help Center hero and directory while linking each entry to
  Firstmall's native notice, FAQ, inquiry, guide, policy, and company routes.
- Help Center destinations share one scoped Help Topic stylesheet. Native Firstmall board and
  service templates remain the data and action owners.
- Static Help Center prototype content remains outside the Firstmall integration path.

## 2026-08-04: Connect Orders Through Firstmall's Native Order Catalog

Decision:

- Use the active skin's `mypage/order_catalog.html` and its `record`, `items`, and `options`
  collections as the order-history source of truth.
- Preserve Firstmall's date filtering, order detail, cancellation, refund, exchange/return
  inquiry, review, purchase confirmation, coupon-use, and carrier-tracking actions.
- Open the summary card's Order Details action in a responsive modal. Render the catalog's complete
  item collection immediately, then read payment and shipping metadata from Firstmall's native
  order-detail page through one cached same-origin request.
- Add the responsive TrendyPicker presentation in
  `css/redesign/trendypicker-orders.css` without loading prototype order data or scripts.
- Remove the unused duplicate hidden order table and the inactive selectbox plugin from the work
  skin copy.
- Pass the live EMS `custom_tracking_number` through unchanged instead of substituting a sample
  tracking number.

Why:

- Order and delivery actions must remain controlled by Firstmall's authenticated commerce flow.
- The original template already exposes the required order and item data; a scoped visual layer
  is safer than rebuilding those actions in browser-only JavaScript.

## 2026-07-31: Reuse Firstmall Member Icon Upload On The Dashboard

Decision:

- Start the dashboard with a plain `#fff8ff` avatar and do not render a prototype face, icon, or
  sample image source.
- Open the TrendyPicker profile-photo modal from Edit Profile instead of navigating to
  `/mypage/myinfo`.
- Submit the selected `membericonFile` to Firstmall's existing
  `../member_process/membericonsave` handler through `actionFrame`.
- Keep general member-information editing on Firstmall's `/mypage/myinfo` page.

Why:

- The previous dashboard fallback was a prototype illustration rather than an account asset.
- Reusing Firstmall's existing member-icon handler preserves its authenticated upload behavior
  without introducing browser storage or a second profile-photo backend.

## 2026-07-31: Map Dashboard Orders To Four Stages And Preserve Carrier Tracking

Decision:

- Present Firstmall order steps as Payment Pending/Confirmed, Preparing, Shipped, and Delivered.
- Present the tracking dialog separately as Order Placed, Shipped, Out for Delivery, and Delivered,
  using steps 50-55 for Shipped and 60-70 for Out for Delivery.
- Open the TrendyPicker tracking dialog from a shipped dashboard order before leaving the site.
- Send View Tracking Detail to UPS for `quick` shipments and to Korea Post EMS for `delivery`
  shipments using the order's actual `custom_tracking_number`.
- Do not fabricate estimated-delivery dates or tracking history when Firstmall does not provide
  those values.

Why:

- The dashboard design requires four stable visual positions even though Firstmall has more
  internal order step values.
- Carrier tracking must remain the source of truth for detailed parcel movement.

## 2026-07-30: Preserve Firstmall HTML Modules And Add Separate TrendyPicker CSS

Decision:

- Use the storefront URL to locate the owning Firstmall HTML entry file.
- Modify existing entry and module HTML files in place within the work-skin package.
- Preserve Firstmall's modular template structure for complex pages such as goods view.
- Add new scoped TrendyPicker CSS files and link them from the modified HTML.
- Store work-skin CSS under the active skin's `css/redesign/` directory and shared account
  JavaScript under Firstmall's `/app/javascript/js/` directory.
- Do not mix TrendyPicker rules into Firstmall `css/common.css` or `css/user.css`.

Why:

- Firstmall routes usually correspond directly to skin-relative HTML paths.
- Existing modules carry platform behavior and are safer to retain than replacing a complex page
  with one monolithic template.
- The current shared CSS files are already large; isolated CSS makes review, rollback, and future
  maintenance safer.

## 2026-07-30: Start Firstmall Integration With An Isolated My Page Work Skin

Decision:

- Keep the downloaded production skin outside the project unchanged.
- Put upload candidates under `firstmall-workskin/` using their eventual skin-relative paths.
- Use variables verified in the active Firstmall `mypage/index.html` and the live
  `/mypage/dashboard` page.
- Keep `/mypage/dashboard` as the active dashboard entry point and retain Firstmall account/order
  pages as the source of truth for actions.
- Limit the first upload to `mypage/dashboard.html` and `css/trendypicker-mypage.css`; preserve the
  existing global header, footer, LNB, index, and account subpages.
- Validate the server template with `tools/check-firstmall-workskin.mjs` instead of treating its
  runtime routes and `{skin}` values as local static files.

Why:

- A live signed-in screenshot confirmed that `mypage/dashboard.html` receives member, wishlist,
  recently viewed, and shortform data.
- A later signed-in check showed that its custom `order_summary.*` values do not match the
  account's real order history. The work skin must use the standard `{orders}` collection and an
  explicit empty state instead.
- Restricting the first change to the active dashboard makes rollback possible without altering
  shared navigation or unrelated pages.
- A separate work-skin package prevents accidental edits to the downloaded or active skin and
  allows previewing the redesign before production upload.

## 2026-07-30: Sync Real Trend Saves To Saved Posts

Decision:

- Store Real Trend save state in `scripts/prototype/saved-posts-store.js`.
- Render My Page Saved Posts and the dashboard saved-reels count from that store.
- Keep the Real Trend save button and Saved Posts remove button on the same product-level id.

Why:

- Saved posts should behave like wishlist: save once anywhere, show and remove everywhere.

## 2026-07-30: Key Wishlist State By Product

Decision:

- Identify a wishlist entry by brand and product name only, in `scripts/prototype/wishlist-store.js`.
- Do not include card rank, deal slider, or the selected product option in the id.
- Do not store or display selected options on My Page wishlist cards.
- Let `scripts/prototype/wishlist-store.js` own every wishlist toggle instead of per-page handlers.
- Render the My Page dashboard preview and dedicated Wishlist page from the same prototype store.

Why:

- One product must show one wishlist state across listing cards, the quick cart sheet, and product
  detail, and changing an option must not clear it.
- Local per-page toggles produced state that was never stored and could disagree with the store.
- Rendering account wishlist cards from that store keeps add and remove actions synchronized in
  both directions.

## 2026-07-30: Isolate Firstmall-Replaced Prototype Runtime

Decision:

- Keep presentation-only behavior under `scripts/components/`.
- Move static data, browser storage, mock commerce, generated catalog, and account mutation
  controllers under `scripts/prototype/`.
- Mark every prototype script tag with `data-prototype`.
- Fail validation when a prototype script tag is not marked.

Why:

- The production Firstmall skin must use Firstmall goods, cart, wishlist, member, order, review,
  coupon, address, payment, and content data as the source of truth.
- A visible file and markup boundary makes replaceable code easy to audit and remove without
  discarding reusable presentation behavior.

## 2026-07-15: Add My Page Coupons Page

Decision:

- Add `my-page/coupons.html` and `my-page/coupons.css`.
- Reuse the My Page header, sidebar icon system, footer, floating buttons, bottom navigation, and product sheet.
- Keep coupon registration and ticket layout rules page-specific.

Why:

- Coupons has distinct register form, expiring coupon tickets, owned coupon tickets, and mobile single-column layout.
- Page-specific ownership avoids leaking coupon ticket styling into dashboard, orders, or reviews pages.

## 2026-07-15: Add My Page Reviews Page

Decision:

- Add `my-page/reviews.html` and `my-page/reviews.css`.
- Reuse the My Page header, sidebar icon system, footer, floating buttons, bottom navigation, and product sheet.
- Keep review-list layout rules page-specific because desktop review rows and mobile review cards have different structures.

Why:

- My Reviews has distinct search/filter controls, product review cards, gallery thumbnails, and pagination.
- Page-specific ownership avoids leaking review-card spacing and responsive rules into the dashboard or orders page.

## 2026-07-15: Add My Page Orders Page

Decision:

- Add `my-page/orders.html` and `my-page/orders.css`.
- Reuse the My Page header, sidebar icon system, footer, floating buttons, and bottom navigation.
- Keep order-list layout rules page-specific because desktop and mobile order cards have different structures.

Why:

- Orders has a distinct status summary, search/filter controls, and order card layout.
- Page-specific ownership avoids leaking order-card spacing and responsive rules into the dashboard page.

## 2026-07-15: Add My Page Dashboard

Decision:

- Add `my-page/my-page.html` and `my-page/my-page.css`.
- Keep the dashboard layout page-specific while reusing the shared header, category navigation, footer, floating buttons, and bottom navigation.
- Link bottom navigation My entries and desktop account buttons to the new page.

Why:

- My Page has a distinct account dashboard layout and mobile/tablet flow.
- Page-specific CSS prevents account card layout rules from leaking into listing, cart, or product detail pages.

## 2026-07-13: Add Editor's Pick Page

- Added `editors-pick/editors-pick.html` as a dedicated T.P Pick / Editor's Pick page.
- Kept page-specific layout and behavior in `editors-pick/editors-pick.css` and `editors-pick/editors-pick.js`.
- Wired T.P Pick navigation to the new page while keeping Real Trend as a separate T.P Pick subpage.

## 2026-07-13: Add Cart Page

Decision:

- Add `cart/cart.html`, `cart/cart.css`, and `cart/cart.js`.
- Link top cart icons, product detail mobile cart icons, and bottom navigation cart links to the new cart page.
- Keep cart page styling page-specific instead of adding it to the home CSS bundle.

Why:

- Cart has a distinct checkout layout and mobile flow.
- Page-specific ownership keeps cart layout changes from affecting listing or product detail pages.

## 2026-07-13: Add Best Products Listing Page

Decision:

- Add `listing/best.html` for the BEST navigation item.
- Use the existing listing page structure and add ranked product cards.
- Load products in scroll-triggered batches until 100 products are visible.

Why:

- The page should match the existing category product page structure.
- The only requested structural differences are visible ranking and one-page scroll loading.

## 2026-07-13: Add Agent Context Folder

Decision:

- Add `.agents/` as durable project context for future human and AI agents.

Why:

- Long chat threads increase the risk of false assumptions.
- New chats should be able to recover project context by reading files.
- `AGENTS.md` works best as the entry point, while `.agents/` holds detailed context.

## 2026-07-13: Keep Real Trend Page CSS Scoped

Decision:

- Keep `realtrend/realtrend.css` loaded only by `realtrend/realtrend.html`.
- Move shared product sheet styles to `styles/trend-product-sheet.css`.

Why:

- Home, listing, detail, and time deal pages use the product sheet but do not need Real Trend video page styles.
- This reduces unnecessary CSS loading and ownership confusion.

## 2026-07-13: Do Not Remove Desktop Zoom Yet

Decision:

- Keep desktop `html { zoom: 0.9; }` in `styles/base.css` for now.

Why:

- Removing it changes the entire desktop scale.
- It should be replaced only during a dedicated visual calibration pass.

## 2026-07-13: Keep Structural Docs In Repo

Decision:

- Keep `docs/structure-plan.md` for active code structure.
- Keep `.agents/` for agent-facing project memory.

Why:

- `docs/` can describe implementation structure.
- `.agents/` can tell future agents how to reason about and maintain the project.

## 2026-07-31: Connect Profile Through Firstmall's Native Member Form

Decision:

- Use the active skin's `mypage/myinfo.html` and `{# form_member}` include as the functional source
  of truth.
- Add TrendyPicker layout wrappers to that template and keep its visual rules in the separate
  `firstmall-workskin/css/redesign/trendypicker-profile.css`.
- Preserve Firstmall's member-update, validation, password, phone verification, SNS, member-icon,
  and withdrawal handlers.
- Render only SNS providers supplied by Firstmall and proxy the TrendyPicker Connect/Manage controls
  to the existing native SNS connection and disconnection handlers.
- Do not copy the static prototype's sample payment methods, shipping address, or member values
  into the work skin.

Why:

- The generated member fields and enabled features vary with Firstmall administration settings.
- Rebuilding those controls as static HTML would disconnect validation and account behavior.
- A scoped stylesheet gives the native form the TrendyPicker visual language without making
  `common.css`, `user.css`, or `member/register_form.html` more complicated.

## 2026-08-12: Shared Listing Cards + Dead Redesign Classes

Decision:

- Delete redesign BEM classes that are not present in work-skin HTML or JS. Keep Firstmall-native
  class overrides (`visual_title`, `sale_price`, `btn_resp`, …) even when they are absent from
  static templates, because Firstmall can inject them at runtime.
- Extract copied listing-card / wish / cart CSS into
  `css/redesign/trendypicker-listing-cards.css`, scoped to `.tp-listing-grid`. Link it before the
  page CSS on catalog, best, new, brand detail, and timedeal. Page files keep lattice columns,
  heroes, badges, and page-specific chrome (catalog 18px/`US$`, timedeal deal badge).

Why:

- `npm run check` unused-class scans the whole repo, so prototype HTML can mask Firstmall-dead
  classes. A work-skin HTML/JS audit is a separate pass.
- Wish/cart/heart rules were copied five times. One shared file is the owner; page files should
  not grow another copy.

## 2026-08-12: Redesign Style Check Is Required

Decision:

- Run `tools/check-css-style.mjs` as part of `npm run check` and `npm run check:firstmall`.
- Fail on duplicate selectors in the same `trendypicker-*` CSS file/media context, and on
  files whose `!important` ratio exceeds 25%.
- Warn on file growth past a recorded baseline, and on `!important` rising past a recorded
  baseline or 10% on a new file.
- Do not treat large page CSS/JS as a defect. Do not split My Page, Orders, Profile,
  Magazine, or Time Deal files just to silence a size warning.

Why:

- Multiple agents keep appending leftover selector blocks and extra `!important` instead of
  editing the existing rule.
- A standing 1200-line warning on every large page taught agents to ignore the check.
- `!important` should stay exceptional: Firstmall ID/legacy overrides only.

## 2026-07-31: Use TrendyPicker As The Only Product Brand

Decision:

- Replace visible legacy branding with `TrendyPicker`.
- Rename explicit legacy-branded work-skin files and their references to `trendypicker-*`.
- Rename explicit code globals, storage keys, data attributes, query parameters, documentation,
  and package metadata that used the previous product name.
- Keep the established `bo-` CSS class namespace because it is an internal compatibility prefix,
  not visible brand copy.

Why:

- The live site name is TrendyPicker.
- Keeping one explicit brand name avoids shipping stale prototype naming into Firstmall.
