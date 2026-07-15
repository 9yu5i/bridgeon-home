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
- `my-page/my-page.css` should stay scoped to the My Page dashboard.
- `my-page/orders.css` should stay scoped to the My Page orders page while reusing `my-page/my-page.css` sidebar, header, and footer styling.
- `my-page/reviews.css` should stay scoped to the My Reviews page while reusing `my-page/my-page.css` sidebar, header, and footer styling.
- `my-page/coupons.css` should stay scoped to the Coupons page while reusing `my-page/my-page.css` sidebar, header, and footer styling.
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

- `script.js` remains the root legacy script for now because it depends on `document.currentScript` paths and shared page behavior.
- New behavior should go into focused files under `scripts/components/` or `scripts/pages/`.
- `scripts/components/header-navigation.js` now owns search, mobile menu, category link wiring, mobile category browsing, and the desktop mega menu.
- `scripts/components/loop-rail.js` now owns generic `data-scroll` buttons and the loop rails for Real Trend, Best Sellers, and Customer Real Picks.
- `scripts/components/product-sheet.js` now owns the shared add-to-cart/product option sheet and product-card-to-detail navigation.
- `scripts/components/seller-wishlist.js` now owns Best Sellers wishlist icon state.
- `scripts/components/magazine-slider.js` now owns the mobile T.P Magazine drag slider and progress bar.
- `scripts/components/deal-sliders.js` now owns Today's Pick and Time Deal card sliders.
- `scripts/components/hero-slider.js` now owns the main hero carousel.
- Existing code should be extracted next in this order: today's pick toggle, footer/newsletter helpers, scroll reveal setup.

Suggested next files:

```text
scripts/
  components/
    header-navigation.js
    deal-sliders.js
    hero-slider.js
    loop-rail.js
    magazine-slider.js
    product-sheet.js
    seller-wishlist.js
  pages/
    home.js
```

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

This currently checks JavaScript syntax, CSS brace balance, and local CSS asset paths without requiring external packages.
