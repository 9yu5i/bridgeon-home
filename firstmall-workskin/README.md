# TrendyPicker Firstmall My Page Work Skin

This folder is an upload-ready **work-skin package**, not a replacement for the downloaded
Firstmall original.

## Redesign approach

- **URL → HTML:** a page like `https://trendy-picker.co.kr/goods/view?no=92915` usually maps to
  `[skin]/goods/view.html`. Complex pages may load additional smaller HTML modules into that
  entry file; edit those modules instead of collapsing everything into one file.
- **HTML:** edit the existing Firstmall skin templates copied into this package.
- **CSS:** add new scoped files under `css/redesign/trendypicker-*.css` and link them from the HTML.
  Do not mix redesign rules into Firstmall `css/common.css` or `css/user.css`.
- **JS:** add redesign-specific scripts as `app/javascript/js/trendypicker-*.js` when needed.

## Included files

```text
firstmall-workskin/
├─ app/
│  └─ javascript/
│     └─ js/
│        ├─ trendypicker-mypage.js
│        ├─ trendypicker-orders.js
│        ├─ trendypicker-wishlist.js
│        ├─ trendypicker-profile.js
│        └─ trendypicker-profile-birthday.js
├─ css/
│  └─ redesign/
│     ├─ trendypicker-mypage.css
│     ├─ trendypicker-profile.css
│     ├─ trendypicker-orders.css
│     ├─ trendypicker-wishlist.css
│     ├─ trendypicker-help.css
│     └─ trendypicker-help-topic.css
├─ images/
│  └─ mypage/
│     └─ *.png
├─ mypage/
│  ├─ dashboard.html
│  ├─ myinfo.html
│  ├─ order_catalog.html
│  ├─ wish.html
│  ├─ mypage_lnb.html
│  └─ myqna_catalog.html
├─ board/
│  ├─ index.html
│  ├─ notice/default01/index.html
│  └─ faq/_faq/index.html
└─ service/
   ├─ cs.html
   ├─ guide.html
   ├─ cancellation.html
   ├─ company.html
   ├─ agreement.html
   └─ privacy.html
```

Customer Service topic pages (Notice, FAQ, Q&A, Guide, Returns) use the My Page account
sidebar plus the shared `.help-topic-shell` layout from the prototype Help Center detail page.
## Upload targets

Upload the CSS, images, and HTML to a **copied/test skin**. Upload the JavaScript files to
Firstmall's shared application JavaScript directory:

```text
[test skin]/css/redesign/trendypicker-mypage.css
[test skin]/css/redesign/trendypicker-profile.css
[test skin]/css/redesign/trendypicker-orders.css
[test skin]/css/redesign/trendypicker-wishlist.css
[test skin]/css/redesign/trendypicker-help.css
[test skin]/css/redesign/trendypicker-help-topic.css
[test skin]/images/mypage/*.png
[test skin]/mypage/dashboard.html
[test skin]/mypage/myinfo.html
[test skin]/mypage/order_catalog.html
[test skin]/mypage/wish.html
[test skin]/mypage/mypage_lnb.html
[test skin]/mypage/myqna_catalog.html
[test skin]/board/index.html
[test skin]/board/notice/default01/index.html
[test skin]/board/faq/_faq/index.html
[test skin]/service/cs.html
[test skin]/service/guide.html
[test skin]/service/cancellation.html
[test skin]/service/company.html
[test skin]/service/agreement.html
[test skin]/service/privacy.html
/app/javascript/js/trendypicker-mypage.js
/app/javascript/js/trendypicker-orders.js
/app/javascript/js/trendypicker-wishlist.js
/app/javascript/js/trendypicker-profile.js
/app/javascript/js/trendypicker-profile-birthday.js
```

Do not upload to the active production skin first.
Do not add CSS/JS `?v=` query strings on Firstmall skin links; use a hard refresh after upload.

`service/cs.html` maps the local `my-page/help-center.html` hero and directory design onto
Firstmall's native customer-service routes. Its responsive presentation is isolated in
`css/redesign/trendypicker-help.css`; the directory needs no extra page script.

The linked Customer Service destinations (Notice, FAQ, Q&A, Guide, Returns) use the account
sidebar plus `.help-topic-shell` (breadcrumb, topic title, Topics nav, native board/content body).
About Us / Contact / Terms / Privacy still use the earlier Help Topic head treatment and can be
shelled next. Shared presentation lives in `css/redesign/trendypicker-help-topic.css`.

`mypage/order_catalog.html` keeps Firstmall's real `record`, `items`, and `options` collections,
the native date search, order detail, cancellation, refund, exchange/return inquiry, review, and
carrier-tracking actions. `css/redesign/trendypicker-orders.css` only changes the presentation and
responsive layout. `app/javascript/js/trendypicker-orders.js` styles the native Firstmall date
filter, filters the rendered order cards by status, and searches order numbers and product names on
the currently loaded result page. It also opens Order Details in a responsive modal, renders every
item already supplied by the order catalog immediately, and reuses one cached request to the native
order-detail page for payment and shipping metadata. The EMS helper passes the order's actual
`custom_tracking_number`; it does not substitute a sample tracking number.

Orders entry links should use `/mypage/order_catalog?sc_date=0`. When `sc_date` is missing or empty,
`trendypicker-orders.js` replaces the URL with `sc_date=0` once so Firstmall returns the full period.
`trendypicker-mypage.js` also rewrites any in-page Orders links that omit `sc_date`, and
`mypage/mypage_lnb.html` points native LNB pages at the same All-period URL.

Cancel/Refund history is fetched immediately on page load from `/mypage/refund_catalog` and
`/mypage/return_catalog` and merged into the All Orders list.

`mypage/wish.html` keeps Firstmall's real wishlist `record` collection, delete, and wish-to-cart
actions. `css/redesign/trendypicker-wishlist.css` owns the Favorites presentation.
`app/javascript/js/trendypicker-wishlist.js` powers category tabs, brand hydration, and
client-side filtering. Upload `images/mypage/cart.png` and `images/mypage/wish_liked.png` with the
wishlist CSS.

The production work-skin does not inject query-based sample orders. Both `/mypage/order_catalog`
and `/mypage/dashboard` render only Firstmall's real order collections or their native empty states.

The order page uses one status-filter row instead of the original secondary Order History,
Cancellations, and Returns navigation. Each rendered Firstmall order is classified from its numeric
step and status label into All Orders, Payment Confirmed, Shipped, Delivered, and Cancel/Refund.
When Cancel/Refund is selected or All Orders is active, the script reads the signed-in member's native
`/mypage/refund_catalog` and `/mypage/return_catalog` results and merges those records into the
current card list. Korean cancellation, refund, return, and exchange labels are included in that
mapping. The regular cards continue to render the native `record`, `items`, and `options`
order-history data and retain Firstmall's paging output.

## Variables preserved from the active Firstmall skin

- `{member.name}`: member name
- `{member.current_level.group_name}`: member grade
- `{=number_format(showMypageTop('emoney'))}`: the current balance shown as Points by this
  skin's existing `/mypage/emoney` account page
- The coupon stat keeps `{=number_format(member.coupon_count)}` as a server fallback, then
  `app/javascript/js/trendypicker-mypage.js` reads the signed-in account's owned-coupon count from `/mypage/coupon?tab=1`.
- `{wishlist_count}` and `{wishlist_list}`: wishlist count and products
- `{orders}`: actual recent order collection
- `{recently_viewed_list}`: actual recently viewed products
- `{shortform_summary.saved_count}`: saved Real Trend count

The live screenshot confirmed that `/mypage/dashboard` is the active dashboard route and that its
member, wishlist, recently viewed, and shortform variables are populated. The previous custom
`order_summary.*` values did not match the signed-in account and are not used. The order card now
uses Firstmall's real `{orders}` collection and shows an empty state when that collection is empty.
The profile connection also preserves Firstmall's existing `{# form_member}` include, update
endpoint, validation, phone verification, SNS account handling, and member-icon upload handler.
It changes the existing `mypage/myinfo.html` markup only where a TrendyPicker page shell and cards are
needed, then applies the design through the separate `css/redesign/trendypicker-profile.css` file. Prototype
payment cards, sample addresses, and sample member values are intentionally excluded.

## Responsive dashboard behavior

- Desktop above 1120px keeps the Firstmall LNB, compact invite card, wishlist, recently viewed,
  and Real Trend dashboard cards.
- Tablet and mobile at 1120px and below replace the desktop LNB and product previews with My
  Activity, Service Hub (including Log Out), and a full-width invite card.
- Mobile at 760px and below stacks the profile progress and account stats and changes Service Hub
  to two columns.
- The Service Hub Log Out item opens a confirmation modal; its confirm button uses Firstmall's
  `/login_process/logout` route, while Cancel, the close button, the backdrop, and Escape close it.
- The profile card starts with a plain `#fff8ff` avatar; no sample face, icon, or sample image
  source is rendered. Edit Profile opens the dashboard photo modal instead of leaving for
  `/mypage/myinfo`; Save submits
  `membericonFile` to Firstmall's existing `../member_process/membericonsave` handler through
  `actionFrame`, then displays the uploaded image returned by Firstmall.
- `app/javascript/js/trendypicker-mypage.js` starts the dashboard's soft entrance sequence as soon as the page is
  rendered; it does not wait for individual cards to enter the viewport.
- Wishlist and saved-post counts use Firstmall data. The mobile My Reviews count is read from the
  member's `/mypage/mygdreview_catalog` summary after the dashboard loads.
- The dashboard contains no sample-order fixture. It displays only the real `{orders}` collection or
  its empty state.
- Dashboard order progress maps Firstmall's order step to four customer-facing stages: Payment
  Pending/Confirmed, Preparing, Shipped, and Delivered. The current stage and completed connector
  line are synchronized from each order's actual `step` value.
- Track Order is available after shipping starts when Firstmall supplies a tracking number. It
  opens the TrendyPicker tracking dialog first; View Tracking Detail then opens UPS tracking for
  `quick` shipments or submits the actual number to Korea Post EMS for `delivery` shipments.
- The tracking dialog keeps the prototype's order, product, progress, carrier, tracking-number,
  estimated-arrival, and shipping-address information structure. It reads the real shipping
  address from `/mypage/order_view?no=...`; fields Firstmall does not provide, such as a standard
  estimated-arrival date, display `Not provided` instead of sample data.
- Inside the tracking dialog, Firstmall's shipping steps are grouped into Order Placed, Shipped,
  Out for Delivery, and Delivered. Steps 50-55 map to Shipped, 60-70 map to Out for Delivery, and
  step 75 maps to Delivered.

## Corrected routes

- Dashboard: `/mypage/dashboard`
- Orders: `/mypage/order_catalog`
- Wishlist: `/mypage/wish`
- Profile: `/mypage/myinfo`
- Reviews: `/mypage/mygdreview_catalog`
- Logout: `/login_process/logout`

## Profile page behavior

- `/mypage/myinfo` now uses the same account sidebar and responsive page spacing as the dashboard.
- On desktop, every My Page content container starts on the dashboard card line. Wider account
  pages keep that left edge and use any additional width only on the right, so changing one page's
  form width cannot recenter or shift the other account pages.
- The desktop My Page shell uses a 36px top inset. The tablet and mobile inset remains controlled
  by the existing 1120px responsive rule and is not changed by the desktop adjustment.
- Dashboard and account subpage content use the same 909px desktop content width. Account links
  use the source design's 320ms cross-document fade transition, with a non-native fallback, and
  respect reduced-motion preferences.
- The purple gradient belongs to the dashboard only. Profile and orders replace it with a white
  canvas. Their desktop headings and the shared account sidebar use the same 60px start line.
- Dashboard and account subpage content use the same 909px desktop content width. Account links
  use the shared 320ms page fade transition and respect reduced-motion preferences.
- The first profile card follows the source design's two-part structure: the actual member name
  and uploaded member icon appear in the left identity panel. Only First Name, Last Name,
  Country, Phone Number, Email, and Birthday are moved into the personal-information grid on the
  right in that order. ID, password, address, gender, referral, and other enabled fields remain editable in the
  following Account & Security card. On mobile the identity panel stacks above the form.
- Firstmall's default member form has no standard Country field. If the active member configuration
  supplies a Country or Nation custom field it is moved into the first card; otherwise the card
  shows a non-editable `Not provided` value instead of saving fabricated account data.
- The avatar edit button is always rendered instead of depending on `joinform.user_icon`. It opens
  a dedicated `membericonFile` picker and submits through Firstmall's existing `membericonsave`
  handler; a successful response updates the visible profile preview.
- First Name and Last Name remove the original skin's existing-member `readonly` attribute on this
  page, while retaining the native field names used by `myinfo_modify`.
- Birthday uses the source design's `profile-birthday-panel`; the selected `YYYY-MM-DD` value is
  written back to Firstmall's native `birthday` input before the member form is submitted. When
  the editable value is cleared, the calendar opens on today's date. Its month and year controls
  use the same `realtrend-select-menu` presentation as Country.
- Phone Number is presented as one calling-code selector and one readable phone input. Its number
  is synchronized back to Firstmall's original three `cellphone[]` or `phone[]` controls before
  submission. The selected calling code is submitted separately as `country_calling_code`.
- Email is presented as one email input and synchronized back to Firstmall's original local-part
  and domain controls so the existing member update and validation handlers continue to work.
- Existing personal-field values clear once when the member first focuses each input. Newly entered
  values are not cleared on later clicks.
- Country uses the source design's `profile-field .realtrend-select-menu`. When Firstmall supplies
  a configured Country/Nation field, the selector updates that native field. The generated fallback
  selector can display and submit `country`, but persistent storage still requires a matching
  member field to be configured in Firstmall.
- The actual Firstmall member form is still rendered by `{# form_member}` and submits to
  `../member_process/myinfo_modify`; field visibility and required rules therefore remain controlled
  by Firstmall administration settings.
- The Login & Security card moves Firstmall's actual `old_password` and `new_password` controls
  into the source design. Confirm Password is a client-side equality check; the existing
  `myinfo_modify` handler remains responsible for changing the password.
- The Default Shipping Address card reads the signed-in member's real default entry from
  `/mypage/delivery_address?tab=1`. Address creation, editing, deletion, and default selection stay
  on Firstmall's Address Book page instead of duplicating its private handlers.
- Preferences uses the actual `mailing` and `sms` checkboxes supplied by `{# form_member}`.
  Transactional order updates remain always on because Firstmall does not expose them as an
  optional member preference. The shared Save Changes button submits these values through
  `myinfo_modify`.
- The downloaded skin contains no saved-card or PayPal account-management controller. Its only
  “Card Profiles” reference is a commented menu label, so no Payment Method card is rendered and
  no sample payment data is introduced.
- Password, email, phone verification, marketing consent, SNS connections, and the member icon
  continue to use the original Firstmall handlers and dialogs where those controls are available.
- Social providers enabled in Firstmall's `joinform.use_sns` data are rendered as TrendyPicker account
  cards. Connect proxies to Firstmall's existing Google, Wechat, Weibo, Facebook, or other enabled
  provider control; Manage opens the original linked-account disconnection dialog. Disabled
  providers are not fabricated.
- `css/redesign/trendypicker-profile.css` scopes the new card, form-control, save-button, and close-account
  styling to this page. It does not modify `common.css`, `user.css`, or the shared
  `member/register_form.html`.
- Desktop uses a two-column member-field layout where the generated fields allow it. Tablet and
  mobile hide the sidebar and collapse the generated form to one column on the `#faf7fc`
  page background.

## First test checklist

1. Duplicate the current skin in Firstmall.
2. Upload the dashboard and profile HTML files, both TrendyPicker CSS files, and the
   `images/mypage` assets to their matching paths in the duplicate skin. Upload
   `trendypicker-mypage.js`, `trendypicker-profile.js`, and
   `trendypicker-profile-birthday.js` to `/app/javascript/js/`.
3. Preview the duplicate skin while signed in.
4. Verify member name, grade, points, coupon count, and wishlist count.
5. Verify that an account without orders shows the empty state and an account with orders shows
   its latest real order.
6. Open Edit Profile, choose an image, save it, and reload the dashboard to verify that Firstmall
   retained it. For a shipped order, also verify that View Tracking Detail opens the correct
   carrier with the same tracking number.
7. Check desktop and a mobile width around 375px.
8. Open `/mypage/myinfo`; verify every enabled member field, Save Changes, password update, phone
   verification, SNS connection controls, member-icon upload, and Close Account.
9. Verify that every SNS provider enabled in Firstmall shows the correct Connected/Not connected
   state, and test both Connect and Manage with a non-production account.
10. Confirm that validation errors stay inside the profile card and that no field is clipped at
   desktop, tablet, or mobile widths.
11. Only after these checks, decide whether to make the work skin active.

## Known scope

This integration covers the My Page dashboard, its profile-photo upload, and the existing Firstmall
member-information form at `/mypage/myinfo`. Product wishlist mutation, review writing, saved
addresses/payment management, order cancellation/return actions, and other commerce behaviors
continue to use their existing Firstmall pages.
