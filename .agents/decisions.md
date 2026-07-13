# BridgeOn Decisions

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
