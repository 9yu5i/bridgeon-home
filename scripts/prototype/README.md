# Prototype Runtime

Everything in this directory exists only to make the static BridgeOn prototype behave like a
storefront before Firstmall is connected.

Do not copy these files into the production Firstmall skin as commerce logic.

## Replace With Firstmall

- `cart-store.js`: cart state and item normalization
- `wishlist-store.js`: wishlist state and card synchronization
- `saved-posts-store.js`: Real Trend save state and Saved Posts page synchronization
- `components/product-sheet.js`: mock product options, pricing, and add-to-cart sheet behavior
- `data/editor-data.js`: static Editor's Pick data
- `pages/cart.js`: cart totals, coupons, shipping country, and item mutation
- `pages/product-detail.js`: static product options, deal pricing, cart, inquiry, and review samples
- `pages/listing-*.js`: generated product-list samples
- `pages/brand*.js`: static brand catalog behavior
- `pages/editors-pick.js`: static editor catalog and wishlist behavior
- `pages/realtrend.js`: static reel product and social state
- `pages/my-page*.js`: static member, order, review, address, and payment state

## Keep Outside This Directory

Files under `scripts/components/` are presentation behavior that can be retained if it does not
conflict with Firstmall's own scripts. Examples include navigation, rails, sliders, tabs, footer
accordions, scroll reveal, and card navigation.

All HTML script tags that load this directory must carry the `data-prototype` attribute. This
makes the discard boundary searchable and machine-checkable.
