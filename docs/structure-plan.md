# BridgeOn Structure Plan

## Current Direction

This project remains a static frontend for now. The first goal is to preserve the current visual result while preventing `styles.css` and `script.js` from growing into larger legacy files.

## CSS

- `styles.css` is now the root CSS entry file.
- `common.css` now imports shared CSS layers from `styles/`.
- `styles/tokens.css` owns shared custom properties.
- `styles/base.css` owns document defaults and shell helpers.
- `styles/utilities.css` owns global utility classes.
- `styles/page-transitions.css` owns cross-page transition styles.
- `styles/header-navigation.css` owns the promo bar, header, search panel, and category navigation.
- `styles/hero.css` owns the main hero carousel and desktop hero Today's Pick panel.
- `styles/sections.css` owns the page shell, section headings, tabs, and generic rail wrappers.
- `styles/rails.css` owns shared rail movement affordances and arrow controls.
- `styles/reels.css` owns Real Trend reel cards.
- `styles/product-cards.css` owns Best Sellers product card base styles.
- `styles/deal-cards.css` owns Today's Pick and Time Deal card base styles.
- `styles/editorial.css` owns T.P Pick and T.P Magazine base styles.
- `styles/reviews.css` owns Customer Real Picks review cards.
- `styles/support-footer.css` owns Share Pick, newsletter, footer, and floating action buttons.
- `styles/responsive-header-navigation.css` owns responsive header, search, category, and mobile menu overrides.
- `styles/responsive-hero.css` owns responsive main hero and mobile category shortcuts.
- `styles/responsive-sections.css` owns responsive page shell, headings, and section-level layout.
- `styles/responsive-rails.css` owns responsive generic rail controls.
- `styles/responsive-reels.css` owns responsive Real Trend cards.
- `styles/responsive-product-cards.css` owns responsive Best Sellers cards.
- `styles/responsive-deal-cards.css` owns responsive Today's Pick and Time Deal cards.
- `styles/responsive-editorial.css` owns responsive T.P Pick and T.P Magazine layout.
- `styles/responsive-reviews.css` owns responsive Customer Real Picks cards.
- `styles/responsive-support-footer.css` owns responsive Share Pick, newsletter, footer, and floating actions.
- `styles/scroll-reveal.css` owns scroll reveal state and animation classes.
- `styles/trend-product-sheet.css` owns the shared Real Trend product sheet popup, option controls, add-to-cart CTA, wishlist state, reviews, and cart toast.
- `realtrend/realtrend.css` should stay scoped to the Real Trend video page.
- `my-page/my-page.css` should stay shared by the My Page dashboard and account subpages.
- `my-page/orders.css`, `my-page/reviews.css`, `my-page/coupons.css`, `my-page/profile.css`, `my-page/points.css`, `my-page/membership.css`, `my-page/account-collections.css`, `my-page/wishlist.css`, and `my-page/saved-posts.css` should stay scoped to their matching account page additions while reusing `my-page/my-page.css`.
- New home CSS should be added as focused files under `styles/`, then imported from `styles.css` in ownership order.
- Do not add new page-end patch blocks; place changes in the owning CSS file instead.
- Known layout debt: `styles/base.css` still applies desktop `html { zoom: 0.9; }`. Remove it only in a visual calibration pass that adjusts desktop max width, section padding, card widths, gaps, and type sizes together.

Suggested next files:

```text
styles/
  listing-shared.css
  product-detail-shared.css
```

## JavaScript

- `script.js` is the small root entry for page transitions and shared BridgeOn URLs.
- `scripts/components/bootstrap.js` loads shared presentation components.
- `scripts/prototype/` contains every controller and data source expected to be removed or replaced
  when Firstmall becomes the source of truth.
- Prototype script tags use `data-prototype`, making the discard boundary machine-checkable.
- New presentation behavior should go into focused files under `scripts/components/`.
- Static data and Firstmall-replaceable behavior must go under `scripts/prototype/`.
- `scripts/components/header-navigation.js` now owns search, mobile menu, category link wiring, mobile category browsing, and the desktop mega menu.
- `scripts/components/loop-rail.js` now owns generic `data-scroll` buttons and the loop rails for Real Trend, Best Sellers, and Customer Real Picks.
- `scripts/components/editor-card-slider.js` now owns the home T.P Pick editor card slider and editor note toggles.
- `scripts/components/magazine-slider.js` now owns the mobile T.P Magazine drag slider and progress bar.
- `scripts/components/magazine-links.js` now owns magazine card keyboard/click links to article detail pages.
- `scripts/components/support-footer.js` now owns footer accordions, the floating to-top button, and newsletter form helpers.
- `scripts/components/scroll-reveal.js` now owns home scroll reveal class setup and viewport activation.
- `scripts/components/deal-sliders.js` now owns Today's Pick and Time Deal card sliders.
- `scripts/components/hero-slider.js` now owns the main hero carousel.
- `scripts/components/today-pick-panel.js` now owns the desktop hero Today's Pick mini panel autoplay, collapse, and scroll-to-deal behavior.
- `scripts/components/section-tabs.js` now owns shared category/tab filtering for home sections.
- `my-page/profile-birthday.js` owns the birthday calendar.
- `my-page/help-topic-data.js` owns static Help Center topic content.
- `my-page/help-topic.js` owns Help Center topic rendering and interaction instead of using an
  inline script.

## Data

Repeated cards should move from copied HTML into data first, then into templates. The first targets are:

- Best Sellers
- Real Trend cards
- Customer Real Picks
- Listing cards
- Category menu data

## Validation

Run this before and after structural changes:

```bash
npm run check
```

This checks JavaScript syntax, single-reference unused declarations, CSS brace balance, unused CSS
classes, local CSS/HTML asset paths, local page links, duplicate HTML IDs, executable inline
scripts, and prototype markers without requiring external packages.

Run `npm run audit:placeholders` to inventory unresolved placeholder links before Firstmall URL
mapping. The audit is informational because those URLs cannot be finalized without the work skin.

Firstmall integration readiness and the prototype/commerce boundary are documented in
`docs/firstmall-integration-readiness.md`.
