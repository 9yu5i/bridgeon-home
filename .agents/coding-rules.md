# BridgeOn Coding Rules

## Before Editing

- Read the owning file and nearby selectors first.
- Search for the class across the project before changing shared class names.
- Check desktop, tablet, and mobile implications.
- Avoid relying on prior chat memory when a project file can answer the question.

## CSS Rules

- Put new rules in the owning CSS file.
- Avoid adding new page-end patch blocks.
- Keep responsive rules in the matching `responsive-*.css` file.
- Merge repeated media queries only when order can be preserved safely.
- Use existing tokens such as `--purple`, `--page`, `--line`, and `--max-width` before adding new values.
- Do not reintroduce `styles/responsive-home.css` or `styles/legacy-home.css`.
- Keep `realtrend/realtrend.css` scoped to the Real Trend video page.

## JavaScript Rules

- Prefer focused files under `scripts/components/` or `scripts/pages/`.
- Keep page-specific product detail behavior in `product-detail/product-detail.js`.
- Avoid duplicating shared behavior already handled by `scripts/components/product-sheet.js`.
- Do not remove old behavior from `script.js` until the replacement component is verified.

## Asset Rules

- Verify relative paths after moving CSS or HTML.
- Use existing image assets when the user provides them.
- Keep icon alignment and click targets consistent across breakpoints.

## Editing Discipline

- Keep changes scoped to the request.
- Do not revert unrelated user changes.
- Prefer small structural moves with validation between steps.
- Document major ownership changes in `.agents/` and `docs/structure-plan.md`.

## Required Checks

Run before finishing shared or structural work:

```bash
npm run check
git diff --check
```

