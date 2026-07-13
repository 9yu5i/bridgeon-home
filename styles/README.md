# Styles

The stylesheet is being split from the old single-file home CSS into focused layers.

- `tokens.css`: shared colors, sizing tokens, and reusable custom properties.
- `base.css`: document defaults, typography inheritance, and page shell helpers.
- `utilities.css`: small global utility classes.
- `page-transitions.css`: cross-page transition styles.
- `header-navigation.css`: promo bar, header, search panel, and category navigation.
- `hero.css`: main hero carousel and the desktop hero Today's Pick panel.
- `sections.css`: page shell, section headings, tabs, and generic rail wrappers.
- `rails.css`: shared rail movement affordances and arrow controls.
- `reels.css`: Real Trend reel cards.
- `product-cards.css`: Best Sellers product card base styles.
- `deal-cards.css`: Today's Pick and Time Deal card base styles.
- `editorial.css`: T.P Pick and T.P Magazine base styles.
- `reviews.css`: Customer Real Picks review cards.
- `support-footer.css`: Share Pick, newsletter, footer, and floating action buttons.
- `responsive-header-navigation.css`: responsive header, search, category, and mobile menu overrides.
- `responsive-hero.css`: responsive main hero and mobile category shortcuts.
- `responsive-sections.css`: responsive page shell, headings, and section-level layout.
- `responsive-rails.css`: responsive generic rail controls.
- `responsive-reels.css`: responsive Real Trend cards.
- `responsive-product-cards.css`: responsive Best Sellers cards.
- `responsive-deal-cards.css`: responsive Today's Pick and Time Deal cards.
- `responsive-editorial.css`: responsive T.P Pick and T.P Magazine layout.
- `responsive-reviews.css`: responsive Customer Real Picks cards.
- `responsive-support-footer.css`: responsive Share Pick, newsletter, footer, and floating actions.
- `scroll-reveal.css`: scroll reveal state and animation classes.
- `trend-product-sheet.css`: shared Real Trend product sheet popup, option controls, add-to-cart CTA, wishlist state, reviews, and cart toast.

Import shared files from `../common.css`. Import home-specific files from the root `../styles.css` file. Keep `realtrend/realtrend.css` scoped to the Real Trend video page only.
