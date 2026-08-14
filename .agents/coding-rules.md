# TrendyPicker Coding Rules

## Firstmall Original Baseline

When classifying or comparing Firstmall work-skin files, use only:

`C:\Users\user\Desktop\(DONT CHANGE-20260730)Firstmall-original\responsive_food_mealkit_gl`

Never edit that folder. A path that exists there is **수정**; a path that does not is **신규**.
Do not use git status for that classification.

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
- Before adding a new rule, check whether the same selector already has one nearby — a second block
  for the same selector in the same file/media context is a leftover, not a fix. Merge into the
  existing rule instead of appending a duplicate.
- Do not add `!important` by default. Prefer a more specific page-scoped selector. Use
  `!important` only to beat a Firstmall ID or legacy rule that cannot be overridden otherwise.
- Listing/product card visuals are shared. Card shell, price prefix, wish/cart/zzim, and
  desktop actions live in `firstmall-workskin/css/redesign/trendypicker-listing-cards.css`
  (`.tp-listing-grid`). Page files keep lattice columns, heroes, badges, and chrome.
  Do not copy wish/cart rules into `trendypicker-{catalog,best,new,brand,timedeal}.css`.

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

`npm run check` and `npm run check:firstmall` both run `tools/check-css-style.mjs` (also available
as `npm run check:css-style`). It only inspects `firstmall-workskin` files named
`trendypicker-*.css` / `trendypicker-*.js` — not Firstmall `common.css` / `user.css`.

Hard failures (must fix):

- Duplicate selector in the same file and media/`@`-rule context, including equivalent lists
  such as `.a, .b` vs `.b,.a`. Merge into the existing rule. Do not append a second block.
- `!important` on more than 25% of declarations in a file.

Warnings (non-fatal):

- A recorded file grew by more than 150 CSS / 100 JS lines, or a new file crossed 1200 CSS /
  700 JS lines. Audit for dead or leftover rules. Do **not** split a page file just to silence
  this — My Page, Orders, Profile, Magazine, and Time Deal are legitimately large.
- `!important` rose past that file's recorded baseline, or a new file is over 10%. Do not add
  more; prefer specificity. Known-high listing/help files are baselined so they do not warn on
  every run until they get worse.

After a legitimate file-size change or an `!important` cleanup, update the matching baseline
in `tools/check-css-style.mjs`. Do not raise a baseline just to silence leftover dumps.

## Firstmall Work-Skin Rules

- Treat the public URL as the primary route-to-template clue. For example,
  `https://trendy-picker.co.kr/goods/view?no=92915` maps to
  `/data/skin/[skin]/goods/view.html` (and likewise `/mypage/wish` → `mypage/wish.html`).
- Inspect the entry template and every loaded module before changing a complex page such as
  product view. Prefer editing the owning module over consolidating everything into one HTML file.
- Preserve Firstmall's existing template/module split. Do not rewrite a multi-module page into a
  single large HTML file just to make redesign easier.
- **HTML:** modify the existing Firstmall HTML files that own the page or module.
- **CSS:** add new page- or component-scoped redesign files (for example
  `css/redesign/trendypicker-orders.css`, `trendypicker-wishlist.css`) and link them from the
  owning HTML. Do not mix redesign rules into Firstmall's large `css/common.css` or `css/user.css`.
- **JS:** add redesign-specific behavior in focused `trendypicker-*.js` files under
  `app/javascript/js/` when needed, instead of expanding legacy Firstmall scripts. Prefer skin-path
  script tags (`/data/skin/{skin}/app/javascript/js/…`) so uploads are not masked by a stale
  shared `/app/javascript/…` file.
- Do not add CSS/JS `?v=` query strings on Firstmall skin links.
- Keep upload candidates under `firstmall-workskin/`. Mirror skin-owned HTML, CSS, and images by
  their skin-relative paths, and mirror shared JavaScript under `app/javascript/js/` for upload to
  Firstmall's application directory.
- Validate with `npm run check:firstmall` (prefer this over full `npm run check` when only the
  work-skin changed). That command includes the redesign style check.

### Pre-edit original contrast (required)

Before editing any `firstmall-workskin/` HTML or page JS, open the same relative path in
`C:\Users\user\Desktop\(DONT CHANGE-20260730)Firstmall-original\responsive_food_mealkit_gl`
and verify:

1. **Includes** — Keep `#subpageLNB` / `{#…}` / `<!-- [스킨폴더]/… -->` slots. Edit the owning
   module (`mypage/mypage_lnb.html`, `_modules/common/board_lnb.html`, `layout_footer/…`,
   `order/_shipping_address.html`, etc.). Do not paste shared chrome into every page.
2. **Tokens** — Preserve `{members…}`, `{member…}`, `{#paging}`, `{=…}`. Never clear them to
   empty `value=""` for markup cleanup.
3. **Form contract** — Keep Firstmall `name` / `id` / required hiddens. Add classes/wrappers only.
4. **URLs** — Match live Firstmall routes (Saved posts → `/mypage/saved_posts`, not
   `/mypage/myshortform` or static-prototype paths).
5. **My Account LNB** — Single source: `mypage/mypage_lnb.html`. Do not inline
   `#mypageLnbBasic` on each My Page (or Help page) unless product explicitly overrides board LNB.
