# BridgeOn Project Spec

## Project Type

BridgeOn is a static responsive ecommerce frontend prototype.

The current implementation focuses on visual fidelity and interaction behavior across:

- Home page
- Listing pages
- Product detail pages
- Product detail page with color options
- Time Deal page
- Real Trend video page

## Primary Goals

- Preserve the current visual result.
- Keep all new UI responsive by default.
- Reduce legacy CSS and JavaScript concentration over time.
- Make shared UI behavior reusable across pages.
- Keep enough project context in files so future agents do not rely on chat memory.

## Responsive Expectations

All layout work should consider:

- Desktop: above `1120px`
- Tablet: `761px` to `1120px`
- Mobile: `760px` and below
- Narrow mobile: around `380px` and below

When the user asks for a visual change, assume it must work responsively unless they explicitly limit the scope.

## Core UI Areas

- Header, promo bar, search, desktop category mega menu, and mobile category menu
- Main hero carousel
- Real Trend reel cards
- Best Sellers cards
- Special Deals: Today's Pick and Time Deal
- T.P Pick and T.P Magazine
- Customer Real Picks
- Shared product option sheet and cart toast
- Product detail tabs, recommendations, inquiry modal, and mobile purchase actions
- Footer, newsletter, share pick, and floating actions

## Known Constraints

- `styles/base.css` still uses desktop `html { zoom: 0.9; }`.
- Do not remove that zoom without a dedicated visual calibration pass.
- `script.js` remains a legacy entry point and still loads extracted component scripts.
- Some repeated card HTML remains duplicated and should eventually move to data/templates.
- Existing static HTML page paths use relative asset URLs; verify all paths when moving shared code.

## Validation

Use:

```bash
npm run check
git diff --check
```

