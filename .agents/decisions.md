# BridgeOn Decisions

## 2026-07-30: Preserve Firstmall HTML Modules And Add Separate BridgeOn CSS

Decision:

- Use the storefront URL to locate the owning Firstmall HTML entry file.
- Modify existing entry and module HTML files in place within the work-skin package.
- Preserve Firstmall's modular template structure for complex pages such as goods view.
- Add new scoped BridgeOn CSS files and link them from the modified HTML.
- Do not mix BridgeOn rules into Firstmall `css/common.css` or `css/user.css`.

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
- Limit the first upload to `mypage/dashboard.html` and `css/bridgeon-mypage.css`; preserve the
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
