# BridgeOn Firstmall My Page Work Skin

This folder is an upload-ready **work-skin package**, not a replacement for the downloaded
Firstmall original.

## Included files

```text
firstmall-workskin/
├─ css/
│  └─ bridgeon-mypage.css
├─ images/
│  └─ mypage/
│     └─ *.png
├─ js/
│  └─ bridgeon-mypage.js
└─ mypage/
   └─ dashboard.html
```

## Upload targets

Upload each file to the matching path inside a **copied/test skin**:

```text
[test skin]/css/bridgeon-mypage.css
[test skin]/images/mypage/*.png
[test skin]/js/bridgeon-mypage.js
[test skin]/mypage/dashboard.html
```

Do not upload to the active production skin first.

## Variables preserved from the active Firstmall skin

- `{member.name}`: member name
- `{member.current_level.group_name}`: member grade
- `{=number_format(showMypageTop('emoney'))}`: the current balance shown as Points by this
  skin's existing `/mypage/emoney` account page
- The coupon stat keeps `{=number_format(member.coupon_count)}` as a server fallback, then
  `js/bridgeon-mypage.js` reads the signed-in account's owned-coupon count from `/mypage/coupon?tab=1`.
- `{wishlist_count}` and `{wishlist_list}`: wishlist count and products
- `{orders}`: actual recent order collection
- `{recently_viewed_list}`: actual recently viewed products
- `{shortform_summary.saved_count}`: saved Real Trend count

The live screenshot confirmed that `/mypage/dashboard` is the active dashboard route and that its
member, wishlist, recently viewed, and shortform variables are populated. The previous custom
`order_summary.*` values did not match the signed-in account and are not used. The order card now
uses Firstmall's real `{orders}` collection and shows an empty state when that collection is empty.
For safety, this package changes only the dashboard template and its scoped stylesheet. The
existing Firstmall header, footer, LNB template, `mypage/index.html`, and account subpages remain
untouched.

## Responsive dashboard behavior

- Desktop above 1120px keeps the Firstmall LNB, compact invite card, wishlist, recently viewed,
  and Real Trend dashboard cards.
- Tablet and mobile at 1120px and below replace the desktop LNB and product previews with My
  Activity, Service Hub, a full-width invite card, and a logout action.
- Mobile at 720px and below stacks the profile progress and account stats and changes Service Hub
  to two columns.
- The desktop newsletter uses `js/bridgeon-mypage.js` to apply the same intersection-based soft
  reveal timing as the static BridgeOn prototype.
- Wishlist and saved-post counts use Firstmall data. The dashboard does not expose a verified
  member review-count variable, so the mobile My Reviews card uses a `View` action instead of a
  fabricated number.

## Corrected routes

- Dashboard: `/mypage/dashboard`
- Orders: `/mypage/order_catalog`
- Wishlist: `/mypage/wish`
- Profile: `/mypage/myinfo`
- Reviews: `/mypage/mygdreview_catalog`
- Logout: `/login_process/logout`

## First test checklist

1. Duplicate the current skin in Firstmall.
2. Upload the two files to the duplicate skin.
3. Preview the duplicate skin while signed in.
4. Verify member name, grade, points, coupon count, and wishlist count.
5. Verify that an account without orders shows the empty state and an account with orders shows
   its latest real order.
6. Open an order detail, wishlist, profile, coupon, and logout link.
7. Check desktop and a mobile width around 375px.
8. Only after these checks, decide whether to make the work skin active.

## Known scope

This first integration covers the My Page dashboard only. Product wishlist mutation, review
writing, profile editing forms, order cancellation/return actions, and other commerce behaviors
continue to use their existing Firstmall pages.
