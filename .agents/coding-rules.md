# TrendyPicker Coding Rules

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
- Keep Firstmall-replaceable product detail behavior in
  `scripts/prototype/pages/product-detail.js`.
- Avoid duplicating the current mock sheet behavior in
  `scripts/prototype/components/product-sheet.js`.
- Keep Firstmall-replaceable sample state and data under `scripts/prototype/`.
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

## Firstmall Work-Skin Rules

- Treat the public URL as the primary route-to-template clue. For example,
  `/goods/view?no=...` maps to `[skin]/goods/view.html`.
- Inspect the entry template and every loaded module before changing a complex page.
- Preserve Firstmall's existing template/module split instead of consolidating a complex page into
  one large HTML file.
- Modify the existing Firstmall HTML files that own the page or module.
- Put TrendyPicker styles in new, page- or component-scoped CSS files and link them from the owning
  HTML.
- Do not add TrendyPicker rules to Firstmall's large `css/common.css` or `css/user.css`.
- Keep upload candidates under `firstmall-workskin/` using the same relative paths as the target
  skin.
