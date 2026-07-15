# BridgeOn Agent Notes

This file is the first stop for any human or AI agent working on this project.
Keep it current when project structure, ownership, or validation rules change.

## Project Goal

BridgeOn is a static responsive ecommerce frontend prototype. The current priority is to preserve the visual result while making the codebase easier to maintain.

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
- `my-page/my-page.css` is only for the My Page dashboard; `my-page/orders.css` is only for the My Page orders page; `my-page/reviews.css` is only for the My Reviews page; `my-page/coupons.css` is only for the Coupons page.

## JavaScript Ownership

The active extraction plan is documented in `docs/structure-plan.md`.

Current component scripts:

- `scripts/components/header-navigation.js`: search, mobile menu, category link wiring, mobile category browsing, and desktop mega menu.
- `scripts/components/loop-rail.js`: generic rail buttons and loop rails.
- `scripts/components/product-sheet.js`: shared add-to-cart/product option sheet and product-card-to-detail navigation.
- `scripts/components/seller-wishlist.js`: Best Sellers wishlist icon state.
- `scripts/components/magazine-slider.js`: mobile T.P Magazine drag slider and progress bar.
- `scripts/components/deal-sliders.js`: Today's Pick and Time Deal card sliders.
- `scripts/components/hero-slider.js`: main hero carousel.
- `editors-pick/editors-pick.js`: Editor's Pick page editor selection, pick filters, wishlist state, and magazine dots.

Keep new behavior in focused files under `scripts/components/` or `scripts/pages/` when possible.

## Page Loading Rules

- Non-Real Trend pages should not load `realtrend/realtrend.css` directly.
- Shared product sheet behavior should come from `styles/trend-product-sheet.css` and `scripts/components/product-sheet.js`.
- If a stylesheet or script is shared by many pages, confirm every page path before changing relative URLs.

## Design Rules

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

`npm run check` verifies JavaScript syntax, CSS brace balance, and local CSS asset paths. `git diff --check` catches trailing whitespace and blank-line issues.

## Branch Note

The repository may currently use `master`. That is not a code issue, but new collaborative work should prefer `main` if the remote/project standard expects it.
