# BridgeOn Roadmap

## Immediate

- Keep `AGENTS.md` and `.agents/` in sync with structural changes.
- Continue moving CSS and JavaScript into focused ownership files.
- Preserve current visual behavior while reducing legacy file weight.

## Next Cleanup Targets

- Extract remaining home behavior from `script.js`:
  - Today's Pick toggle
  - Footer and newsletter helpers
  - Scroll reveal setup
- Add shared CSS files when listing and product detail styles are ready:
  - `styles/listing-shared.css`
  - `styles/product-detail-shared.css`
- Continue reducing repeated `@media` blocks in focused files with visual checks.

## Data And Template Targets

- Move Best Sellers cards into data.
- Move Real Trend cards into data.
- Move Customer Real Picks cards into data.
- Move listing product cards into data.
- Move category menu contents into structured data.

## Visual Debt

- Replace desktop `html { zoom: 0.9; }` with calibrated layout values.
- This requires coordinated adjustment of:
  - `--max-width`
  - section padding
  - desktop gaps
  - card widths
  - major type sizes
  - fixed and sticky elements

## Collaboration

- Prefer `main` for future shared branches if the remote expects it.
- Keep structural refactors and visual changes in separate commits when possible.

