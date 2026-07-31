# Firstmall Integration Readiness

## Current Status

TrendyPicker is a visually complete static storefront prototype. Its HTML, CSS, responsive layouts,
and presentation-only interactions can be used as the design source for a Firstmall skin.

The full storefront is not a drop-in Firstmall skin yet. The first isolated integration package
now exists under `firstmall-workskin/` for the My Page dashboard. Other commerce data and account
actions still use static HTML or browser storage and must be replaced by Firstmall templates,
display codes, forms, and server-provided values.

## First Work-Skin Package

`firstmall-workskin/` currently provides:

- `mypage/dashboard.html`: active dashboard route using live-confirmed member and collection data
- `css/trendypicker-mypage.css`: scoped responsive dashboard styles
- `README.md`: upload targets and signed-in test checklist

The downloaded Firstmall skin remains unchanged. Signed-in checks confirmed that the custom
`mypage/dashboard.html` receives `member.*`, `wishlist_count`, `wishlist_list`,
`recently_viewed_list`, and `shortform_summary.*` values. Its custom `order_summary.*` values did
not match the account's real order history and are intentionally excluded. The work-skin
dashboard uses the standard `{orders}` collection with an explicit empty state and no static
sample products. The first safe rollout does not replace the Firstmall header, footer, LNB, index,
or account subpages.

## Reusable As-Is

- Design tokens, base styles, and responsive component CSS
- Header, category navigation, footer, section, card, modal, and rail markup as visual references
- Hero, rail, tab, accordion, and presentation-only interaction patterns
- Local images and icons after uploading them into the Firstmall work skin
- Page-specific layouts for home, listing, product detail, cart, brand, editorial, and My Page

## Must Be Connected To Firstmall

| Prototype area | Current implementation | Firstmall replacement |
| --- | --- | --- |
| Product lists and prices | Repeated/static HTML and page JavaScript | Product display/list template data |
| Product detail | Static product values | Goods detail template values and option controls |
| Cart | `localStorage` via `trendypicker-cart-items` | Firstmall cart forms, totals, stock, and option data |
| Wishlist | `localStorage` via `trendypicker-wishlist-items` | Firstmall wishlist actions and member state |
| Search | Client-side prototype behavior | Firstmall search form and result template |
| Login/logout | Navigation and prototype dialog | Firstmall authentication URLs and session state |
| My Page | Static sample account data | Member, order, review, coupon, point, and address templates |
| Checkout/payment | Visual prototype only | Existing Firstmall order and payment flow |
| Reviews/inquiries | Static cards and dialogs | Firstmall boards and goods review/inquiry actions |

## Do Not Port As Commerce Logic

The following files are useful for previewing the design, but their data-changing behavior should
not be copied into the production skin as the source of truth:

- `scripts/prototype/cart-store.js`: local cart storage
- `scripts/prototype/wishlist-store.js`: local wishlist storage
- `scripts/prototype/pages/cart.js`: prototype cart editing
- `scripts/prototype/components/product-sheet.js`: prototype option and add-to-cart flow
- `scripts/prototype/pages/my-page*.js`: prototype profile, order, address, payment, and account interactions
- `scripts/prototype/pages/product-detail.js`: prototype purchase and detail interactions

During integration, keep only presentation behavior that does not duplicate Firstmall commerce
logic.

## Recommended Skin Mapping

The My Page paths below are confirmed from the exported active skin. Other paths still require
page-by-page confirmation.

| TrendyPicker source | Firstmall target area |
| --- | --- |
| `index.html` | Main page |
| `styles/` and shared portions of `styles.css` | Work skin shared/user CSS |
| Header and footer markup repeated in pages | Firstmall shared layout/modules |
| `listing/*.html` | Category, best, new, and search templates |
| `product-detail/*.html` | Goods view template |
| `cart/cart.html` | Cart template |
| `my-page/*.html` | Member and My Page templates |
| `editors-pick/`, `realtrend/`, `timedeal/` | Custom pages or Firstmall event/content pages |

## Work-Skin Editing Policy

- Start from the requested storefront URL and map it to the matching skin-relative HTML path.
- For complex pages, trace the entry template's loaded modules and modify the owning module rather
  than moving all markup into one file.
- Modify existing HTML templates in the work-skin package.
- Add new TrendyPicker CSS files under the work skin's `css/` directory and link them from the owning
  HTML.
- Do not add new TrendyPicker styles to Firstmall `css/common.css` or `css/user.css`.

## Integration Order

1. Export and preserve the current Firstmall production skin.
2. Duplicate it as a work skin.
3. Compare its shared layout, main page, goods list, goods view, cart, and member templates.
4. Port TrendyPicker tokens, base CSS, header, and footer into the work skin.
5. Preview and validate the isolated My Page dashboard package.
6. Integrate the home page and one real product display.
7. Integrate listing and product detail while retaining Firstmall forms and template codes.
8. Integrate cart and the remaining member pages.
9. Test guest/member, options, stock, discounts, coupons, shipping, mobile layouts, and payment.

## Validation

Before handing prototype changes to the integration stage, run:

```bash
npm run check
git diff --check
```

The project check covers JavaScript syntax, CSS structure and assets, local HTML assets, page
links, duplicate IDs, and a dedicated Firstmall work-skin template audit.
