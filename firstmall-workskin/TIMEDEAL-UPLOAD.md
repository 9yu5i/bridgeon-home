# Time Deal upload checklist

Prototype: `timedeal/timedeal.html`  
Live URL: `/promotion/timedeal`  
Skin entry: `promotion/timedeal.html`

## Files to upload

```text
/data/design_list/timedeal_listing_style.html
[test skin]/promotion/timedeal.html
[test skin]/css/redesign/trendypicker-listing-cards.css
[test skin]/css/redesign/trendypicker-timedeal.css
[test skin]/app/javascript/js/trendypicker-timedeal.js
[test skin]/images/timedeal/clock_pink.png
[test skin]/images/listing/wish_pink.png
```

Do **not** add `?v=` query strings on skin CSS/JS links.

## Admin: assign the new listing style

Time Deal must **not** use `goods_list_style5`. After uploading the HTML:

1. Open Firstmall Admin → goods display / design_list decorations.
2. Confirm `timedeal_listing_style` appears.
3. Set `/promotion/timedeal` (Time Deal search/event list) to **timedeal_listing_style**.
4. Leave catalog/best/new on their existing listing style.

Until this Admin setting is changed, the live page will still render style5.

## Smoke test

1. Open `/promotion/timedeal` — dark hero, countdown, schedule tabs, white product shell.
2. Switch **ON SALE NOW** / **UPCOMING** / event tabs — URL `display_mode` / `event` updates and products reload.
3. Sort dropdown still drives Firstmall `#filteredItemSorting`.
4. Product cards show pink `% OFF` badge when a discount rate exists.
5. Desktop + mobile layout both readable; Best page files unchanged.
