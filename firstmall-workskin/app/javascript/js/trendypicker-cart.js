/**
 * TrendyPicker Cart
 * /order/cart → order/cart.html
 *
 * 1. Free-shipping meter
 * 2. Promo code via Firstmall getPromotionJson?mode=cart
 * 3. Coupon picker from /mypage/coupon (applied at checkout)
 */
(function () {
  "use strict";

  var page = document.querySelector(".cart-page");
  if (!page) return;

  document.documentElement.classList.add("is-cart-page");
  if (document.body) document.body.classList.add("is-cart-page");
  try {
    if (sessionStorage.getItem("tpCartSilentDelete")) window._tpCartSilentDelete = true;
  } catch (err) {}
  if (page.classList.contains("is-cart-empty") && document.body) {
    document.body.classList.add("is-cart-empty");
  }

  var FREE_SHIPPING = 48;
  var COUPON_KEY = "tpCartCoupon";
  var SELECTION_KEY = "tpCartUnselected";

  function text(el) {
    return el ? String(el.textContent || "").replace(/\s+/g, " ").trim() : "";
  }

  function parseMoney(value) {
    var raw = String(value || "").replace(/[^0-9.]/g, "");
    var num = parseFloat(raw);
    return isNaN(num) ? 0 : num;
  }

  function formatMoney(value) {
    return "US$" + Number(value || 0).toFixed(2);
  }

  function rewriteCurrencyElement(el) {
    if (!el) return;
    var numEl = el.querySelector && el.querySelector(".num");
    var raw = numEl ? text(numEl) : text(el);
    if (!raw || !/\d/.test(raw)) return;

    var prefix = "";
    var matched = String(el.textContent || "").match(
      /^\s*(-|\+|−)\s*(?=US\$|\d)/i
    );
    if (matched) prefix = matched[1] === "+" ? "+ " : "- ";

    var amount = parseMoney(raw);
    el.textContent = prefix + formatMoney(amount);
  }

  function normalizeCartCurrency() {
    var selectors = [
      ".cart-item-price del",
      ".cart-item-price strong",
      ".cart-item-total",
      "#totalGoodsPrice",
      "#totalPrice",
      "#shippingTotalPrice",
      "#total_shipping_price",
      "#saleTotalPrice",
      "#mobile_total_sale",
      "[data-cart-save]",
      "[data-cart-summary-promo-discount]",
      "[data-cart-summary-coupon-discount]",
      "[data-cart-coupon-selected-discount]",
      ".cart-rec-card strong",
      ".cart-rec-link strong",
    ];
    selectors.forEach(function (selector) {
      page.querySelectorAll(selector).forEach(rewriteCurrencyElement);
    });
  }

  function eachSelectedRow(fn) {
    Array.prototype.forEach.call(
      page.querySelectorAll('input[name="cart_option_seq[]"]'),
      function (cb) {
        if (!cb.checked) return;
        var row = cb.closest("li.cart_goods, .cart-item");
        if (!row || row.style.display === "none") return;
        fn(row, cb);
      }
    );
  }

  function readRowTotals(row) {
    var ea = parseInt(row.getAttribute("data-cart-ea"), 10) || 0;
    if (!ea) {
      var qtyOut = row.querySelector("[data-cart-qty-value]");
      ea = parseInt(String(text(qtyOut) || "1").replace(/[^\d]/g, ""), 10) || 1;
    }
    var unit = parseMoney(row.getAttribute("data-cart-unit-price"));
    var compare = parseMoney(row.getAttribute("data-cart-unit-compare"));
    var priceEl = row.querySelector(".cart-item-price");
    var del = priceEl && priceEl.querySelector("del");
    var strong = priceEl && priceEl.querySelector("strong");
    if (!(unit > 0) && strong) unit = parseMoney(strong.textContent);
    if (del) {
      var fromDel = parseMoney(del.textContent);
      if (fromDel > unit) compare = fromDel;
    }
    var line =
      unit > 0
        ? unit * ea
        : parseMoney(text(row.querySelector("[data-cart-line-total], .cart-item-total")));
    var discount = compare > unit && unit > 0 ? (compare - unit) * ea : 0;
    return { ea: ea, unit: unit, compare: compare, line: line, discount: discount };
  }

  function syncProductDiscount() {
    var total = 0;
    eachSelectedRow(function (row) {
      total += readRowTotals(row).discount;
    });
    total = Math.round(total * 100) / 100;
    var saleDd = document.getElementById("saleTotalPrice");
    var saleSpan = document.getElementById("mobile_total_sale");
    var saveEl = document.querySelector("[data-cart-save]");
    var saleWrap = saleDd && saleDd.closest("div");

    if (saleDd) {
      saleDd.innerHTML =
        (total > 0 ? "- " : "") +
        '<span id="mobile_total_sale">' +
        formatMoney(total) +
        "</span>";
    } else if (saleSpan) {
      saleSpan.textContent = formatMoney(total);
    }
    if (saleWrap) {
      if (total > 0) {
        saleWrap.hidden = false;
        saleWrap.removeAttribute("hidden");
      } else {
        saleWrap.hidden = true;
      }
    }
    if (saveEl) saveEl.textContent = formatMoney(total);
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }
    fn();
  }

  function getSelectedSubtotal() {
    var subtotal = 0;
    var anyChecked = false;
    eachSelectedRow(function (row) {
      anyChecked = true;
      subtotal += readRowTotals(row).line;
    });
    if (anyChecked) return Math.round(subtotal * 100) / 100;
    if (page.querySelectorAll('input[name="cart_option_seq[]"]').length) return 0;
    var totalEl = document.getElementById("totalGoodsPrice") || document.getElementById("totalPrice");
    return parseMoney(text(totalEl));
  }

  function paintSelectionSummary() {
    var subtotal = 0;
    var discount = 0;
    var items = 0;
    eachSelectedRow(function (row) {
      var info = readRowTotals(row);
      subtotal += info.line;
      discount += info.discount;
      items += info.ea;
    });
    subtotal = Math.round(subtotal * 100) / 100;
    discount = Math.round(discount * 100) / 100;

    syncPromoSummary();
    var coupon = readStoredCoupon();
    var promoAmt =
      parseMoney(text(document.querySelector("[data-cart-summary-promo-discount]"))) ||
      parseMoney(text(document.getElementById("total_promotion_goods_sale")));
    var couponAmt = coupon ? estimateCouponDiscount(coupon) : 0;
    var shippingAmt = parseMoney(text(document.getElementById("total_shipping_price")));
    // Subtotal is already sale-price (unit × qty). Product Discount is
    // list−sale info only — do not subtract it again from Total.
    var grand = Math.max(0, subtotal - promoAmt - couponAmt + shippingAmt);
    grand = Math.round(grand * 100) / 100;

    var goods = document.getElementById("totalGoodsPrice");
    var totalEl = document.getElementById("totalPrice");
    var countEl = document.querySelector("[data-cart-subtotal-count]");
    var saleDd = document.getElementById("saleTotalPrice");
    var saleWrap = saleDd && saleDd.closest("div");
    var saveEl = document.querySelector("[data-cart-save]");
    var shippingEl = document.getElementById("total_shipping_price");
    var shippingWrap = document.getElementById("shippingTotalPrice");

    if (countEl) {
      countEl.textContent = "(" + items + " item" + (items === 1 ? "" : "s") + ")";
    }
    if (goods) goods.textContent = formatMoney(subtotal);
    if (totalEl) totalEl.textContent = formatMoney(grand);

    if (saleDd) {
      saleDd.innerHTML =
        (discount > 0 ? "- " : "") +
        '<span id="mobile_total_sale">' +
        formatMoney(discount) +
        "</span>";
    }
    if (saleWrap) {
      if (discount > 0) {
        saleWrap.hidden = false;
        saleWrap.removeAttribute("hidden");
      } else {
        saleWrap.hidden = true;
      }
    }
    if (saveEl) saveEl.textContent = formatMoney(discount + promoAmt + couponAmt);
    if (!items) {
      if (shippingEl) shippingEl.textContent = formatMoney(0);
      if (shippingWrap) shippingWrap.classList.add("cart-free");
    }

    syncShippingMeter();
    paintSelectedCoupon(readStoredCoupon());
    normalizeCartCurrency();
  }

  // Checking/unchecking an item can trigger paintSelectionSummary from up to
  // three independent places at once (the wrapped native setPriceInfoCheck,
  // the ajaxStop follow-up below, and bindShippingMeter's own change/click
  // listeners) — each one a full re-scan of the cart list. Routing them all
  // through a single coalesced timer means a click only ever pays for one
  // pass instead of two or three stacking up, which is what made toggling a
  // checkbox feel slow.
  var paintSelectionSummaryTimer = null;
  function schedulePaintSelectionSummary(delay) {
    window.clearTimeout(paintSelectionSummaryTimer);
    paintSelectionSummaryTimer = window.setTimeout(paintSelectionSummary, delay || 0);
  }

  // The native setPriceInfoCheck() (common-function.js, not ours to edit)
  // calls setPriceInfo(), which hits /order/cart_price with async:false —
  // a SYNCHRONOUS XHR that freezes the entire tab until the server
  // responds. That's the real reason toggling a checkbox felt slow, not
  // just extra client-side work. This replicates the same request and the
  // same setCartPriceInfo(data) success callback (so shipping/discount
  // detail HTML built server-side still stays accurate) but as a normal
  // async request, so it never blocks the page.
  function requestCartPriceInfo() {
    if (typeof window.jQuery === "undefined") return;
    var checkGoods = "";
    var checkCartSeqs = "";
    Array.prototype.forEach.call(
      page.querySelectorAll('input[name="cart_option_seq[]"]'),
      function (cb) {
        if (cb.checked) {
          checkGoods += (cb.getAttribute("rel") || "") + "||";
          checkCartSeqs += cb.value + "||";
        }
      }
    );
    var nationInput = document.querySelector('input[name="nation"]');
    window.jQuery.ajax({
      url: "/order/cart_price",
      dataType: "json",
      data: {
        goodsSeq: checkGoods,
        nation: nationInput ? nationInput.value : "",
        checkCartSeqs: checkCartSeqs,
      },
      type: "post",
      success: function (data) {
        if (typeof window.setCartPriceInfo === "function") {
          try {
            window.setCartPriceInfo(data);
          } catch (err) {}
        }
        // setCartPriceInfo() writes get_currency_price()'s raw server
        // format straight into #totalGoodsPrice/#shippingTotalPrice/
        // #totalPrice/#saleTotalPrice (e.g. plain KRW, no "US$"), since it
        // was written to be the last word on those elements. Re-run our
        // own formatting after it so those fields end up back in "US$"
        // instead of showing whatever the server just rendered.
        schedulePaintSelectionSummary(0);
      },
    });
  }

  function patchSetPriceInfoCheck() {
    var original = window.setPriceInfoCheck;
    if (typeof original !== "function" || original._tpCartPatched) {
      if (typeof original === "function" && original._tpCartPatched) return;
      if (!patchSetPriceInfoCheck.tries) patchSetPriceInfoCheck.tries = 0;
      if (patchSetPriceInfoCheck.tries < 40) {
        patchSetPriceInfoCheck.tries += 1;
        window.setTimeout(patchSetPriceInfoCheck, 100);
      }
      return;
    }

    // Deliberately does not call original() at all — that's the blocking
    // sync-XHR path. Instant client-side totals + the same request fired
    // async gets the identical end state without the freeze.
    function wrapped() {
      schedulePaintSelectionSummary(0);
      requestCartPriceInfo();
    }
    wrapped._tpCartPatched = true;
    window.setPriceInfoCheck = wrapped;
  }

  function resyncAllRowTotals() {
    collectCartRows().forEach(function (row) {
      var unit = parseMoney(row.getAttribute("data-cart-unit-price"));
      var compare = parseMoney(row.getAttribute("data-cart-unit-compare"));
      if (!(unit > 0)) return;
      var ea = readRowQty(row);
      row.setAttribute("data-cart-ea", String(ea));
      var total = row.querySelector("[data-cart-line-total], .cart-item-total");
      if (total) total.textContent = formatMoney(unit * ea);
    });
  }

  function patchSetCartPriceInfo() {
    var original = window.setCartPriceInfo;
    if (typeof original !== "function" || original._tpCartPatched) {
      if (typeof original === "function" && original._tpCartPatched) return;
      if (!patchSetCartPriceInfo.tries) patchSetCartPriceInfo.tries = 0;
      if (patchSetCartPriceInfo.tries < 40) {
        patchSetCartPriceInfo.tries += 1;
        window.setTimeout(patchSetCartPriceInfo, 100);
      }
      return;
    }
    function wrapped(data) {
      original.call(this, data);
      resyncAllRowTotals();
      paintSelectionSummary();
    }
    wrapped._tpCartPatched = true;
    window.setCartPriceInfo = wrapped;
  }

  var shippingMeterTransitionsEnabled = false;

  function enableShippingMeterTransitions() {
    if (shippingMeterTransitionsEnabled) return;
    shippingMeterTransitionsEnabled = true;
    var track = document.querySelector(".cart-shipping-meter");
    if (track) track.classList.add("is-ready");
  }

  function syncShippingMeter() {
    var track = document.querySelector(".cart-shipping-meter");
    var meter = document.querySelector("[data-cart-shipping-meter]");
    var progress = document.querySelector("[data-cart-shipping-progress]");
    var message = document.querySelector("[data-cart-shipping-message]");
    var freeLabel = document.querySelector(".cart-free-shipping > div:not(.cart-shipping-meter) > span");
    var subtotal = getSelectedSubtotal();
    var ratio = Math.max(0, Math.min(1, subtotal / FREE_SHIPPING));
    var pctValue = Math.round(ratio * 100);
    var pct = pctValue + "%";

    if (track) {
      track.style.setProperty("--cart-shipping-progress", pct);
    }
    if (meter) {
      meter.style.setProperty("--cart-shipping-progress", pct);
      meter.style.width = pct;
    }
    if (progress) {
      progress.max = 100;
      progress.value = pctValue;
    }
    if (freeLabel) {
      freeLabel.style.setProperty("--cart-shipping-progress", pct);
    }
    if (!message) {
      return;
    }
    if (subtotal >= FREE_SHIPPING) {
      message.innerHTML =
        'You\'ve unlocked <b class="cart-ship-free-word">FREE</b> shipping!';
    } else {
      message.innerHTML =
        "You're <b>" +
        formatMoney(FREE_SHIPPING - subtotal) +
        '</b> away from <b class="cart-ship-free-word">FREE</b> shipping!';
    }
  }

  function bindShippingMeter() {
    page.addEventListener("change", function (event) {
      var target = event.target;
      if (!target || !target.matches) return;
      if (
        target.matches('input[name="cart_option_seq[]"]') ||
        target.matches("input.btn_select_all") ||
        target.classList.contains("btn_select_all")
      ) {
        schedulePaintSelectionSummary(0);
      }
    });
    page.addEventListener("click", function (event) {
      if (event.target.closest(".btn_select_all, .checkbox_allselect, .cart-items-head label")) {
        schedulePaintSelectionSummary(0);
      }
    });
  }

  function initCartNewsletterReveal() {
    var newsletter = document.querySelector(".cart-newsletter.cart-scroll-reveal");
    if (!newsletter) return;

    function reveal() {
      newsletter.classList.add("is-inview");
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal();
      return;
    }

    if (!("IntersectionObserver" in window)) {
      reveal();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          reveal();
          observer.disconnect();
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    observer.observe(newsletter);
  }

  function showPromoError(on) {
    var error = document.querySelector("[data-cart-promo-error]");
    if (error) error.hidden = !on;
  }

  function promoFailed(data) {
    if (!data) return true;
    if (data.result === false || data.result === "fail" || data.success === false) return true;
    if (data.code === false) return true;
    var msg = String(data.msg || data.message || data.error || "");
    if (/invalid|fail|없|오류|error/i.test(msg) && data.result !== true) return true;
    return false;
  }

  function applyPromo(code) {
    var value = String(code || "").trim();
    if (!value || typeof window.jQuery === "undefined") {
      showPromoError(true);
      return;
    }
    showPromoError(false);
    window.jQuery.ajax({
      url: "../promotion/getPromotionJson?mode=cart",
      type: "post",
      dataType: "json",
      data: { cartpromotioncode: value },
    })
      .done(function (data) {
        if (promoFailed(data)) {
          showPromoError(true);
          return;
        }
        window.location.reload();
      })
      .fail(function () {
        showPromoError(true);
      });
  }

  function removePromo() {
    if (typeof window.getPromotionCartDel === "function") {
      window.getPromotionCartDel();
      return;
    }
    if (typeof window.jQuery === "undefined") return;
    window.jQuery.ajax({
      url: "../promotion/getPromotionJson?mode=cart",
      type: "post",
      dataType: "json",
      data: { cartpromotioncode: "" },
    }).always(function () {
      window.location.reload();
    });
  }

  function bindPromo() {
    var applyBtn = document.querySelector("[data-cart-promo-apply]");
    var input = document.getElementById("cartpromotioncode");
    var removeBtn = document.querySelector("[data-cart-promo-remove]");
    function submitPromo(event) {
      if (event) event.preventDefault();
      applyPromo(input ? input.value : "");
    }
    if (applyBtn) applyBtn.addEventListener("click", submitPromo);
    if (input) {
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") submitPromo(event);
      });
    }
    if (removeBtn) {
      removeBtn.addEventListener("click", removePromo);
    }
  }

  // #total_promotion_goods_sale is native Firstmall — populated
  // asynchronously by order_price_calculate()'s hidden-iframe response
  // (see getPromotionckloding() inline in cart.html) once a promo code is
  // active, not by any template expression. Mirror that real amount into
  // the ORDER SUMMARY card's promo row, same pattern as paintSelectedCoupon
  // does for the coupon row.
  function syncPromoSummary() {
    var row = document.querySelector("[data-cart-summary-promo]");
    var out = document.querySelector("[data-cart-summary-promo-discount]");
    var label = document.querySelector("[data-cart-summary-promo-label]");
    var srcEl = document.getElementById("total_promotion_goods_sale");
    var codeInput = document.getElementById("cartpromotioncode");
    var code = codeInput ? String(codeInput.value || "").trim() : "";
    if (!row || !out) return;

    var amount = parseMoney(srcEl ? srcEl.textContent : "");
    if (label) label.textContent = code ? "Promo code (" + code + ")" : "Promo code";
    if (!code || amount <= 0) {
      out.textContent = "";
      row.hidden = true;
      return;
    }
    out.textContent = "- " + formatMoney(amount);
    row.hidden = false;
    row.removeAttribute("hidden");
  }

  function bindPaypal() {
    var button = document.querySelector("[data-cart-paypal]");
    if (!button) return;
    button.addEventListener("click", function () {
      var checkout = document.querySelector(".btn_all_order");
      if (checkout) checkout.click();
    });
  }

  function readStoredCoupon() {
    try {
      return JSON.parse(sessionStorage.getItem(COUPON_KEY) || "null");
    } catch (err) {
      return null;
    }
  }

  function storeCoupon(coupon) {
    if (!coupon) {
      sessionStorage.removeItem(COUPON_KEY);
      return;
    }
    sessionStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
  }

  // Cart defaults every item to checked. We only ever need to remember the
  // items the user unchecked — anything not in this list (including items
  // added to the cart later) stays checked by default, which is the
  // behavior a fresh page load already has.
  function readUnselected() {
    try {
      var raw = JSON.parse(sessionStorage.getItem(SELECTION_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch (err) {
      return [];
    }
  }

  function writeUnselected(list) {
    try {
      if (list.length) {
        sessionStorage.setItem(SELECTION_KEY, JSON.stringify(list));
      } else {
        sessionStorage.removeItem(SELECTION_KEY);
      }
    } catch (err) {}
  }

  function persistSelectionState() {
    var boxes = page.querySelectorAll('input[name="cart_option_seq[]"]');
    var unselected = [];
    Array.prototype.forEach.call(boxes, function (cb) {
      if (!cb.checked) unselected.push(cb.value);
    });
    writeUnselected(unselected);
  }

  // Runs once on load, after the native inline script in cart.html has
  // already rendered every checkbox checked (its default). Un-checks
  // whichever ones the user deselected before navigating away, so the
  // selection survives a trip to a product page and back — previously it
  // silently reset to "everything selected" on every fresh load.
  function restoreSelectionState() {
    var unselected = readUnselected();
    if (!unselected.length) return;
    var unselectedSet = Object.create(null);
    unselected.forEach(function (value) {
      unselectedSet[value] = true;
    });

    var boxes = page.querySelectorAll('input[name="cart_option_seq[]"]');
    var anyRestored = false;
    Array.prototype.forEach.call(boxes, function (cb) {
      if (!unselectedSet[cb.value] || !cb.checked) return;
      cb.checked = false;
      anyRestored = true;
      var row = document.getElementById("cart_goods_" + cb.value);
      if (row) row.classList.remove("selected");
    });
    if (!anyRestored) return;

    var selectAll = document.querySelector(".btn_select_all");
    if (selectAll && boxes.length) {
      selectAll.checked = Array.prototype.every.call(boxes, function (cb) {
        return cb.checked;
      });
    }
    schedulePaintSelectionSummary(0);
  }

  function bindSelectionPersistence() {
    page.addEventListener("change", function (event) {
      var target = event.target;
      if (!target || !target.matches) return;
      if (
        target.matches('input[name="cart_option_seq[]"]') ||
        target.matches("input.btn_select_all") ||
        target.classList.contains("btn_select_all")
      ) {
        // The native select-all handler updates every checkbox's checked
        // state synchronously in its own change handler, but handler order
        // isn't guaranteed — defer a tick so we snapshot after it's done.
        window.setTimeout(persistSelectionState, 0);
      }
    });
  }

  function buildCouponTitle(coupon) {
    var sale = String((coupon && coupon.sale) || "").trim();
    var name = String((coupon && coupon.name) || "").trim();
    var blob = (sale + " " + name).replace(/\s+/g, " ").trim();
    var pct = blob.match(/(\d+(?:\.\d+)?)\s*%/);
    if (pct) {
      var pctNum = String(pct[1]).replace(/\.0+$/, "");
      return pctNum + "% OFF";
    }
    var offName = name.match(/^\$?\s*([\d.,]+)\s*Off$/i);
    if (offName) {
      return "$" + String(offName[1]).replace(/\.0+$/, "") + " Off";
    }
    var usd =
      sale.match(/(?:US\$|\$)\s*([\d.,]+)/i) ||
      sale.match(/([\d.,]+)\s*USD/i) ||
      blob.match(/(?:US\$|\$)\s*([\d.,]+)\s*Off/i);
    if (usd) {
      var amt = parseMoney(usd[1]);
      var neat = Number.isInteger(amt) ? String(amt) : amt.toFixed(2).replace(/\.00$/, "");
      return "$" + neat + " Off";
    }
    if (sale && !/of the selling price/i.test(sale)) return sale;
    if (name) return name;
    return "Coupon";
  }

  function buildCouponDisplayName(coupon, title) {
    var name = String((coupon && coupon.name) || "").trim();
    if (!name) return "";
    if (title && name.toLowerCase() === String(title).toLowerCase()) return "";
    if (/^\$?\s*[\d.,]+\s*Off$/i.test(name)) return "";
    if (/of the selling price/i.test(name)) return "";
    return name;
  }

  function parseCouponMinPurchase(coupon) {
    var blob = [
      coupon && coupon.terms,
      coupon && coupon.sale,
      coupon && coupon.name,
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (!blob) return 0;

    var patterns = [
      /([\d.,]+)\s*USD\s*or more/i,
      /(?:US\$|\$)\s*([\d.,]+)\s*or more/i,
      /min(?:imum)?\.?\s*purchase[^0-9$]*(?:US\$|\$)?\s*([\d.,]+)/i,
      /([\d.,]+)\s*(?:USD|US\$|\$)?\s*(?:이상(?:\s*구매)?|or more purchased)/i,
      /([\d.,]+)\s*(?:원|₩)\s*이상/,
    ];
    for (var i = 0; i < patterns.length; i += 1) {
      var match = blob.match(patterns[i]);
      if (match) return parseMoney(match[1]);
    }
    return 0;
  }

  function getCouponAvailability(coupon) {
    if (!coupon) {
      return { available: false, min: 0, reason: "" };
    }
    var min = parseCouponMinPurchase(coupon);
    var subtotal = getSelectedSubtotal();
    if (min > 0 && subtotal + 0.001 < min) {
      return {
        available: false,
        min: min,
        reason: "Available with selected items over " + formatMoney(min) + ".",
      };
    }
    return { available: true, min: min, reason: "" };
  }

  function showCouponMinError(message) {
    var note = document.querySelector("[data-cart-coupon-min-error]");
    if (!note) return;
    if (!message) {
      note.hidden = true;
      note.textContent = "";
      return;
    }
    note.hidden = false;
    note.textContent = message;
  }

  function trySelectCoupon(coupon) {
    var availability = getCouponAvailability(coupon);
    if (!availability.available) {
      showCouponMinError(availability.reason || "This coupon cannot be used with the current cart.");
      return false;
    }
    showCouponMinError("");
    storeCoupon(coupon);
    paintSelectedCoupon(coupon);
    closeCouponDialog();
    return true;
  }

  function syncCouponTicketState(ticket, coupon, activeId) {
    if (!ticket) return;
    var availability = getCouponAvailability(coupon);
    var applied = Boolean(
      activeId && coupon && coupon.id && String(coupon.id) === String(activeId)
    );
    ticket.classList.toggle("is-applied", applied);
    ticket.classList.toggle("is-unavailable", !availability.available);
    var btn = ticket.querySelector(".cart-coupon-apply, button");
    if (!btn) return;
    btn.textContent = applied ? "Applied" : "Use";
    btn.classList.toggle("is-applied", applied);
    btn.disabled = !availability.available;
    btn.setAttribute("aria-disabled", availability.available ? "false" : "true");
  }

  function estimateCouponDiscount(coupon) {
    if (!getCouponAvailability(coupon).available) return 0;
    var sale = String((coupon && coupon.sale) || "").trim();
    var name = String((coupon && coupon.name) || "").trim();
    var blob = (sale + " " + name).replace(/\s+/g, " ").trim();
    var subtotal = getSelectedSubtotal();
    var pct = blob.match(/(\d+(?:\.\d+)?)\s*%/);
    if (pct) {
      var amount = subtotal * (parseFloat(pct[1]) / 100);
      var maxMatch = String((coupon && coupon.terms) || "").match(
        /max[^0-9$]*\$?\s*([\d.,]+)|최대[^0-9]*([\d.,]+)/i
      );
      if (maxMatch) {
        var max = parseMoney(maxMatch[1] || maxMatch[2]);
        if (max > 0) amount = Math.min(amount, max);
      }
      return Math.max(0, amount);
    }
    var usd =
      sale.match(/(?:US\$|\$)\s*([\d.,]+)/i) ||
      sale.match(/([\d.,]+)\s*USD/i) ||
      name.match(/^\$?\s*([\d.,]+)\s*Off$/i);
    if (usd) {
      var fixed = parseMoney(usd[1]);
      if (fixed > 0) return subtotal > 0 ? Math.min(fixed, subtotal) : fixed;
    }
    return 0;
  }

  function paintSelectedCoupon(coupon) {
    var label = document.querySelector("[data-cart-selected-coupon]");
    var selected = document.querySelector("[data-cart-coupon-selected]");
    var codeEl = document.querySelector("[data-cart-coupon-selected-code]");
    var discountEl = document.querySelector("[data-cart-coupon-selected-discount]");
    var noteEl = document.querySelector("[data-cart-coupon-selected-note]");
    var openBtn = document.querySelector("[data-cart-coupon-open]");
    var summary = document.querySelector("[data-cart-summary-coupon]");
    var summaryLabel = document.querySelector("[data-cart-summary-coupon-label]");
    var summaryDiscount = document.querySelector("[data-cart-summary-coupon-discount]");
    if (!coupon) {
      if (label) label.textContent = "No coupon selected.";
      if (selected) selected.hidden = true;
      if (summary) summary.hidden = true;
      if (summaryLabel) summaryLabel.textContent = "Coupon";
      if (openBtn) openBtn.textContent = "Select Coupon";
      return;
    }

    var availability = getCouponAvailability(coupon);
    if (!availability.available) {
      storeCoupon(null);
      paintSelectedCoupon(null);
      refreshCouponListSelection();
      return;
    }

    var title = buildCouponTitle(coupon);
    var displayName = buildCouponDisplayName(coupon, title);
    var headline = [title, displayName].filter(Boolean).join(" ");
    var discount = estimateCouponDiscount(coupon);
    var discountText = "- " + formatMoney(discount);
    var messageEl = selected && selected.querySelector("p:first-child span");

    if (label) label.textContent = headline || "Coupon selected.";
    if (codeEl) codeEl.textContent = headline || title || "Coupon";
    if (discountEl) discountEl.textContent = discountText;
    if (messageEl) messageEl.textContent = "Coupon selected!";
    if (noteEl) noteEl.textContent = coupon.terms || "Applied at checkout.";
    if (selected) selected.hidden = false;
    if (summary) summary.hidden = discount <= 0;
    if (summaryLabel) summaryLabel.textContent = "Coupon (" + title + ")";
    if (summaryDiscount) summaryDiscount.textContent = discountText;
    if (openBtn) openBtn.textContent = "Change Coupon";
  }

  function couponBadgeFromTicket(ticket, name) {
    var el = ticket && ticket.querySelector(
      ".bo-coupon-ticket-top span, [data-coupon-badge], .cart-owned-coupon > div > span"
    );
    var fromTicket = text(el);
    if (fromTicket && !/^my$/i.test(fromTicket)) return fromTicket;
    var blob = String(name || "");
    if (/welcome/i.test(blob)) return "WELCOME";
    if (/special/i.test(blob)) return "SPECIAL";
    if (/surprise/i.test(blob)) return "SURPRISE";
    if (/\bnew\b/i.test(blob)) return "NEW";
    return "";
  }

  function couponDataFromTicket(ticket) {
    var name = text(ticket.querySelector(".bo-coupon-name, [data-coupon-name], p"));
    var sale = text(ticket.querySelector("[data-coupon-sale], h3"));
    var terms = text(ticket.querySelector(".bo-coupon-terms, small"));
    var expire = text(ticket.querySelector(".bo-coupon-expire-inline"));
    return {
      id:
        ticket.getAttribute("data-download-seq") ||
        ticket.getAttribute("data-coupon-seq") ||
        "",
      name: name,
      sale: sale,
      terms: terms,
      expire: expire,
      badge: couponBadgeFromTicket(ticket, name || sale),
    };
  }

  function couponCard(coupon, activeId) {
    var article = document.createElement("article");
    var title = buildCouponTitle(coupon);
    var displayName = buildCouponDisplayName(coupon, title) || coupon.name || "";
    var meta = [];
    if (coupon.terms) meta.push(escapeHtml(coupon.terms));
    if (coupon.expire) meta.push("Expires " + escapeHtml(coupon.expire));
    article.className = "cart-owned-coupon";
    article.setAttribute("data-coupon-ticket", "");
    if (coupon.id) article.setAttribute("data-download-seq", coupon.id);
    article.innerHTML =
      "<div>" +
      (coupon.badge ? "<span>" + escapeHtml(coupon.badge) + "</span>" : "") +
      "<h3>" +
      escapeHtml(title) +
      "</h3>" +
      (displayName ? "<p>" + escapeHtml(displayName) + "</p>" : "") +
      (meta.length ? "<small>" + meta.join("<br>") + "</small>" : "") +
      '</div><button type="button" class="cart-coupon-apply">Use</button>';
    article.querySelector("button").addEventListener("click", function () {
      trySelectCoupon(coupon);
    });
    syncCouponTicketState(article, coupon, activeId);
    return article;
  }

  function mountCouponTickets(list, doc, activeId) {
    var tickets = doc.querySelectorAll(
      "[data-coupon-ticket], .bo-coupon-ticket[data-coupon-ticket], .bo-coupon-ticket"
    );
    var mounted = 0;
    tickets.forEach(function (ticket) {
      var status = (ticket.getAttribute("data-use-status") || "unused").toLowerCase();
      if (status && status !== "unused" && status !== "n" && status !== "0") return;
      var coupon = couponDataFromTicket(ticket);
      if (!coupon.name && !coupon.sale) return;
      list.appendChild(couponCard(coupon, activeId));
      mounted += 1;
    });
    return mounted;
  }

  function parseCouponDoc(doc) {
    var tickets = doc.querySelectorAll("[data-coupon-ticket], .bo-coupon-ticket");
    var list = [];
    tickets.forEach(function (ticket) {
      var status = (ticket.getAttribute("data-use-status") || "unused").toLowerCase();
      if (status && status !== "unused" && status !== "n" && status !== "0") return;
      var coupon = couponDataFromTicket(ticket);
      if (!coupon.name && !coupon.sale) return;
      list.push(coupon);
    });
    if (list.length) return list;

    doc.querySelectorAll(".resp_coupon_list > li, .coupon_list li, .ul_coupon > li").forEach(function (row) {
      var name = text(row.querySelector(".title, .coupon_name, strong"));
      var sale = text(row.querySelector(".sales, .coupon_sale, .num"));
      if (!name && !sale) return;
      list.push({
        id: text(row.querySelector("[download_seq], [coupon_seq]")) || name,
        name: name,
        sale: sale,
        terms: text(row.querySelector(".descr, .coupon_date")),
        badge: couponBadgeFromTicket(row, name || sale),
      });
    });
    return list;
  }

  var couponLoadPromise = null;

  function extractCouponMarkup(html) {
    var raw = String(html || "");
    var tickets = raw.match(/<article\b[^>]*bo-coupon-ticket[\s\S]*?<\/article>/gi);
    if (tickets && tickets.length) return tickets.join("");
    if (/data-coupon-grid|bo-coupon-empty|You have no coupons/i.test(raw)) return "";
    return null;
  }

  function renderCouponList(html) {
    var list = document.querySelector("[data-cart-coupon-list]");
    if (!list) return;
    if (!html) {
      list.innerHTML = "<p class=\"cart-country-empty\">Sign in to use coupons.</p>";
      return;
    }
    var markup = extractCouponMarkup(html);
    if (markup === "") {
      list.innerHTML = "<p class=\"cart-country-empty\">You have no coupons.</p>";
      list.setAttribute("data-loaded", "1");
      return;
    }
    var doc = new DOMParser().parseFromString(
      markup
        ? "<div data-coupon-grid>" + markup + "</div>"
        : html,
      "text/html"
    );
    var active = readStoredCoupon();
    list.innerHTML = "";
    var mounted = mountCouponTickets(list, doc, active && active.id);
    if (mounted) {
      list.setAttribute("data-loaded", "1");
      return;
    }
    var coupons = parseCouponDoc(doc);
    if (!coupons.length) {
      list.innerHTML =
        /\/member\/login|name=["']userid["']/i.test(html)
          ? "<p class=\"cart-country-empty\">Sign in to use coupons.</p>"
          : "<p class=\"cart-country-empty\">You have no coupons.</p>";
      list.setAttribute("data-loaded", "1");
      return;
    }
    coupons.forEach(function (coupon) {
      list.appendChild(couponCard(coupon, active && active.id));
    });
    list.setAttribute("data-loaded", "1");
  }

  function loadCartCoupons() {
    var list = document.querySelector("[data-cart-coupon-list]");
    if (!list) return Promise.resolve();
    if (list.getAttribute("data-loaded") === "1") return Promise.resolve();
    if (couponLoadPromise) return couponLoadPromise;

    couponLoadPromise = fetch("/mypage/coupon?tab=1", {
      credentials: "same-origin",
      cache: "default",
    })
      .then(function (res) {
        return res.ok ? res.text() : "";
      })
      .then(function (html) {
        renderCouponList(html);
      })
      .catch(function () {
        couponLoadPromise = null;
        if (!list || list.getAttribute("data-loaded") === "1") return;
        list.innerHTML = "<p class=\"cart-country-empty\">Could not load coupons.</p>";
      });

    return couponLoadPromise;
  }

  function prefetchCartCoupons() {
    loadCartCoupons();
  }

  function refreshCouponListSelection() {
    var list = document.querySelector("[data-cart-coupon-list]");
    if (!list || list.getAttribute("data-loaded") !== "1") return;

    var active = readStoredCoupon();
    var activeId = active && active.id ? String(active.id) : "";

    list.querySelectorAll("[data-coupon-ticket], .cart-owned-coupon").forEach(function (ticket) {
      syncCouponTicketState(ticket, couponDataFromTicket(ticket), activeId);
    });
  }

  function openCouponDialog() {
    var dialog = document.getElementById("cart-coupon-dialog");
    if (!dialog) return;
    dialog.hidden = false;
    dialog.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-cart-coupon-open");
    showCouponMinError("");
    refreshCouponListSelection();
  }

  function closeCouponDialog() {
    var dialog = document.getElementById("cart-coupon-dialog");
    if (!dialog) return;
    dialog.hidden = true;
    dialog.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-cart-coupon-open");
  }

  function bindCoupon() {
    var openBtn = document.querySelector("[data-cart-coupon-open]");
    var list = document.querySelector("[data-cart-coupon-list]");
    var stored = readStoredCoupon();
    paintSelectedCoupon(stored);

    document.querySelectorAll("[data-cart-coupon-close]").forEach(function (btn) {
      btn.addEventListener("click", closeCouponDialog);
    });
    var removeCoupon = document.querySelector("[data-cart-coupon-remove]");
    if (removeCoupon) {
      removeCoupon.addEventListener("click", function () {
        storeCoupon(null);
        paintSelectedCoupon(null);
        refreshCouponListSelection();
      });
    }

    if (!openBtn || !list) return;
    openBtn.addEventListener("pointerenter", prefetchCartCoupons);
    openBtn.addEventListener("focus", prefetchCartCoupons);
    openBtn.addEventListener("click", function () {
      openCouponDialog();
      if (list.getAttribute("data-loaded") === "1") {
        refreshCouponListSelection();
        return;
      }
      if (!list.querySelector(".cart-owned-coupon")) {
        list.innerHTML = "<p class=\"cart-country-empty\">Loading coupons…</p>";
      }
      loadCartCoupons().then(function () {
        refreshCouponListSelection();
      });
    });
    if (window.requestIdleCallback) {
      window.requestIdleCallback(prefetchCartCoupons, { timeout: 1200 });
    } else {
      window.setTimeout(prefetchCartCoupons, 300);
    }

    page.addEventListener("change", function (event) {
      if (
        !event.target.matches(
          'input[name="cart_option_seq[]"], .btn_select_all, input.btn_select_all'
        )
      ) {
        return;
      }
      paintSelectedCoupon(readStoredCoupon());
    });
  }

  function normalizeCountryLabel(label) {
    var raw = String(label || "").replace(/\s+/g, " ").trim();
    if (!raw) return "";
    var key = raw.toUpperCase().replace(/\./g, "");
    if (
      key === "USA" ||
      key === "US" ||
      key === "U S A" ||
      key === "UNITED STATES" ||
      key === "UNITED STATES OF AMERICA" ||
      /^U\.?S\.?A\.?$/i.test(raw)
    ) {
      return "United States";
    }
    return raw;
  }

  function syncShipCountryLabel() {
    var label = document.querySelector("[data-cart-ship-country]");
    if (!label) return;
    var raw = text(label).replace(/^Shipping to\s+/i, "");
    var next = normalizeCountryLabel(raw);
    if (next) label.textContent = "Shipping to " + next;
  }

  function bindCountry() {
    var dialog = document.getElementById("cart-country-dialog");
    var list = document.querySelector("[data-cart-country-list]");
    var search = document.querySelector("[data-cart-country-search]");
    var openBtn = document.querySelector("[data-cart-ship-change]");
    var label = document.querySelector("[data-cart-ship-country]");
    if (!dialog || !list || !openBtn) return;

    var buttons = Array.prototype.slice.call(list.querySelectorAll("[data-cart-country]"));
    buttons.forEach(function (btn) {
      var normalized = normalizeCountryLabel(
        btn.getAttribute("data-cart-country-label") || btn.textContent || ""
      );
      if (!normalized) return;
      btn.setAttribute("data-cart-country-label", normalized);
      btn.textContent = normalized;
    });
    syncShipCountryLabel();

    function openDialog() {
      dialog.hidden = false;
      dialog.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-cart-country-open");
      if (search) {
        search.value = "";
        filterCountries("");
        search.focus();
      }
    }

    function closeDialog() {
      dialog.hidden = true;
      dialog.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-cart-country-open");
      openBtn.focus();
    }

    function filterCountries(query) {
      var q = String(query || "").trim().toLowerCase();
      var visible = 0;
      buttons.forEach(function (btn) {
        var textLabel = (btn.getAttribute("data-cart-country-label") || btn.textContent || "").toLowerCase();
        var code = (btn.getAttribute("data-cart-country") || "").toLowerCase();
        var show = !q || textLabel.indexOf(q) !== -1 || code.indexOf(q) !== -1;
        btn.parentElement.hidden = !show;
        if (show) visible += 1;
      });
      var empty = list.querySelector(".cart-country-empty");
      if (!visible) {
        if (!empty) {
          empty = document.createElement("li");
          empty.className = "cart-country-empty";
          empty.textContent = "No countries found.";
          list.appendChild(empty);
        }
        empty.hidden = false;
      } else if (empty) {
        empty.hidden = true;
      }
    }

    openBtn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      openDialog();
    });

    dialog.querySelectorAll("[data-cart-country-close]").forEach(function (btn) {
      btn.addEventListener("click", closeDialog);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !dialog.hidden) {
        closeDialog();
      }
    });

    if (search) {
      search.addEventListener("input", function () {
        filterCountries(search.value);
      });
    }

    list.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-cart-country]");
      if (!btn || !list.contains(btn)) return;
      var nation = btn.getAttribute("data-cart-country");
      var name = normalizeCountryLabel(
        btn.getAttribute("data-cart-country-label") || btn.textContent || nation
      );
      if (label) label.textContent = "Shipping to " + name;
      closeDialog();
      if (typeof window.chg_shipping_nation === "function" && nation) {
        window.chg_shipping_nation(nation);
      }
    });
  }

  function destroyRecSwiper(section) {
    section.querySelectorAll(".display_slide_class, .goods_display_slide_wrap, .swiper-container").forEach(function (el) {
      if (!el.swiper) return;
      try {
        if (el.swiper.autoplay && el.swiper.autoplay.stop) el.swiper.autoplay.stop();
        el.swiper.destroy(true, true);
      } catch (err) {}
    });
  }

  function collectRecommendationCards(section) {
    var wrapper =
      section.querySelector(".display_slide_class .swiper-wrapper") ||
      section.querySelector(".goods_display_slide_wrap .swiper-wrapper") ||
      section.querySelector(".swiper-wrapper");
    if (wrapper) {
      var slides = Array.prototype.filter.call(wrapper.children, function (el) {
        return el.classList && el.classList.contains("swiper-slide");
      });
      if (slides.length) return slides;
    }

    var goodsList = section.querySelector(".goods_list");
    if (goodsList) {
      return Array.prototype.filter.call(goodsList.children, function (el) {
        return el && el.tagName === "LI";
      });
    }

    return Array.prototype.slice.call(
      section.querySelectorAll(".display_slide_class .swiper-slide, .goods_display_slide_wrap .swiper-slide")
    );
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function firstText(root, selectors) {
    for (var i = 0; i < selectors.length; i += 1) {
      var el = root.querySelector(selectors[i]);
      var value = text(el);
      if (value) return value;
    }
    return "";
  }

  function readGoodsSeq(slide, href) {
    var match = String(href || "").match(/[?&]no=(\d+)/);
    if (match) return match[1];
    var attr =
      (slide.getAttribute &&
        (slide.getAttribute("goods_seq") ||
          slide.getAttribute("data-goods-seq") ||
          slide.getAttribute("data-goods_seq"))) ||
      "";
    if (attr) return String(attr);
    var native = slide.querySelector(
      "[onclick*='displayAddToCartQuickview'], [data-goods-seq], [goods_seq]"
    );
    if (native) {
      match = String(native.getAttribute("onclick") || "").match(
        /displayAddToCartQuickview2?\([^,]+,\s*(\d+)/
      );
      if (match) return match[1];
      attr =
        native.getAttribute("data-goods-seq") ||
        native.getAttribute("goods_seq") ||
        "";
      if (attr) return String(attr);
    }
    return "";
  }

  var recPriceCache = Object.create(null);
  var recPriceInflight = Object.create(null);

  function parsePriceFromGoodsHtml(html) {
    if (!html) return "";
    var patterns = [
      /class="[^"]*sale_price[^"]*"[^>]*>[\s\S]*?<b[^>]*class="num"[^>]*>([^<]+)</i,
      /class="[^"]*string_price[^"]*"[^>]*>[\s\S]*?<b[^>]*class="num"[^>]*>([^<]+)</i,
      /itemprop="price"[^>]*content="([^"]+)"/i,
      /id="price"[^>]*value="([^"]+)"/i,
      /<b[^>]*class="num"[^>]*>([0-9][0-9.,]*)</i,
    ];
    for (var i = 0; i < patterns.length; i += 1) {
      var match = html.match(patterns[i]);
      if (match && match[1] && /\d/.test(match[1])) {
        return formatMoney(parseMoney(match[1]));
      }
    }
    return "";
  }

  function applyRecPriceToCards(seq, price) {
    if (!price) return;
    page.querySelectorAll('.cart-rec-card[data-goods-seq="' + seq + '"]').forEach(function (card) {
      var strong = card.querySelector(".cart-rec-price, .cart-rec-link strong");
      if (strong && !text(strong)) strong.textContent = price;
    });
  }

  function prefetchRecGoods(seq) {
    if (!seq) return;
    fetchGoodsPrice(seq).then(function (price) {
      applyRecPriceToCards(seq, price);
    });
  }

  var cartQvGuard = {
    active: false,
    y: 0,
    timer: null,
    poll: null,
    nativeScrollTo: null,
    jqScrollTop: null,
    onScroll: null,
    closeBound: false,
    seenOpen: false,
  };

  function cartQvScrollY() {
    return (
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
  }

  function endCartQvGuard(restore) {
    if (cartQvGuard.timer) {
      window.clearTimeout(cartQvGuard.timer);
      cartQvGuard.timer = null;
    }
    if (cartQvGuard.poll) {
      window.clearInterval(cartQvGuard.poll);
      cartQvGuard.poll = null;
    }
    if (cartQvGuard.onScroll) {
      window.removeEventListener("scroll", cartQvGuard.onScroll);
      cartQvGuard.onScroll = null;
    }
    if (cartQvGuard.nativeScrollTo) {
      window.scrollTo = cartQvGuard.nativeScrollTo;
      cartQvGuard.nativeScrollTo = null;
    }
    if (cartQvGuard.jqScrollTop && window.jQuery && window.jQuery.fn) {
      window.jQuery.fn.scrollTop = cartQvGuard.jqScrollTop;
      cartQvGuard.jqScrollTop = null;
    }
    document.body.classList.remove("is-cart-qv-loading");
    var y = cartQvGuard.y;
    var shouldRestore = restore && y > 8 && cartQvScrollY() < 8;
    cartQvGuard.y = 0;
    cartQvGuard.active = false;
    cartQvGuard.seenOpen = false;
    if (shouldRestore && typeof window.scrollTo === "function") {
      window.scrollTo(0, y);
    }
  }

  function restoreCartQvScroll() {
    if (!cartQvGuard.active || cartQvGuard.y < 8) return;
    if (cartQvScrollY() >= 8) return;
    if (cartQvGuard.nativeScrollTo) {
      cartQvGuard.nativeScrollTo.call(window, 0, cartQvGuard.y);
      return;
    }
    window.scrollTo(0, cartQvGuard.y);
  }

  function beginCartQvGuard() {
    endCartQvGuard(false);
    var savedY = cartQvScrollY();
    if (!savedY) return;

    cartQvGuard.y = savedY;
    cartQvGuard.active = true;
    cartQvGuard.seenOpen = false;
    cartQvGuard.nativeScrollTo = window.scrollTo.bind(window);

    window.scrollTo = function (a, b) {
      var top =
        typeof a === "number"
          ? b
          : a && typeof a === "object"
            ? a.top
            : undefined;
      if (typeof top === "number" && top < 8 && savedY > 8) {
        return;
      }
      return cartQvGuard.nativeScrollTo.apply(window, arguments);
    };

    if (window.jQuery && window.jQuery.fn) {
      cartQvGuard.jqScrollTop = window.jQuery.fn.scrollTop;
      window.jQuery.fn.scrollTop = function (value) {
        if (typeof value !== "undefined" && Number(value) < 8 && savedY > 8) {
          return this;
        }
        return cartQvGuard.jqScrollTop.apply(this, arguments);
      };
    }

    cartQvGuard.onScroll = function () {
      if (cartQvGuard.active) restoreCartQvScroll();
    };
    window.addEventListener("scroll", cartQvGuard.onScroll, { passive: true });

    cartQvGuard.poll = window.setInterval(function () {
      if (!cartQvGuard.active) return;
      restoreCartQvScroll();
      if (isCartQuickviewOpen()) {
        cartQvGuard.seenOpen = true;
        document.body.classList.remove("is-cart-qv-loading");
        return;
      }
      if (cartQvGuard.seenOpen) {
        endCartQvGuard(true);
      }
    }, 120);

    cartQvGuard.timer = window.setTimeout(function () {
      endCartQvGuard(false);
    }, 15000);
  }

  function findCartQuickviewLayer() {
    // #quickviewModal (.qv-modal / .qv-modal-close / .qv-modal-dim) is the
    // add-to-cart quickview actually used on this page (built by
    // goods-display_mobile.js). .resp_layer_pop/.ui-dialog below are for
    // an older quickview layout kept as a fallback in case that changes.
    var modal = document.getElementById("quickviewModal");
    if (modal) return modal;
    var quickview =
      document.getElementById("goods_view_quickview") ||
      document.querySelector(".qv-product-card");
    if (!quickview) return null;
    return quickview.closest(".resp_layer_pop, .ui-dialog") || quickview;
  }

  function isCartQuickviewOpen() {
    var layer = findCartQuickviewLayer();
    if (!layer || layer.classList.contains("hide")) return false;
    if (layer.getAttribute("aria-hidden") === "true") return false;
    var style = window.getComputedStyle(layer);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  function attachCartQuickviewAfterOpen() {
    restoreCartQvScroll();
    if (isCartQuickviewOpen()) {
      document.body.classList.remove("is-cart-qv-loading");
    }
  }

  function bindCartQuickviewClose() {
    if (cartQvGuard.closeBound) return;
    cartQvGuard.closeBound = true;

    document.addEventListener(
      "click",
      function (event) {
        if (
          !event.target.closest(
            ".resp_layer_bg, .btn_pop_close, .viewerlay_close_btn, .qv-modal-dim, .qv-modal-close"
          )
        ) {
          return;
        }
        window.setTimeout(function () {
          endCartQvGuard(true);
        }, 0);
      },
      true
    );

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        window.setTimeout(function () {
          endCartQvGuard(true);
        }, 0);
      }
    });
  }

  // The floating action buttons (#floating_over: scroll-to-top, chat,
  // bottom nav) briefly flicker for a couple seconds right after the
  // add-to-cart quickview closes on mobile/tablet — the modal's own close
  // triggers a burst of resize/reflow events (images finishing layout,
  // scroll position settling) that some native show/hide-on-scroll logic
  // reacts to. Pin the floating buttons visible for a short settle window
  // after close so that burst doesn't visibly toggle them.
  function bindCartQvFloatingSettle() {
    if (!window.MutationObserver) return;
    var settleTimer = null;
    var wasOpen = document.body.classList.contains("qv-modal-open");

    new MutationObserver(function () {
      var isOpen = document.body.classList.contains("qv-modal-open");
      if (wasOpen && !isOpen) {
        document.body.classList.add("is-cart-qv-settling");
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(function () {
          document.body.classList.remove("is-cart-qv-settling");
        }, 1500);
      }
      wasOpen = isOpen;
    }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }

  function bindRecQuickviewClicks() {
    var section = document.querySelector(".cart-recommendations");
    if (!section || section.getAttribute("data-cart-rec-qv-bound") === "1") return;
    section.setAttribute("data-cart-rec-qv-bound", "1");

    section.addEventListener(
      "click",
      function (event) {
        var btn = event.target.closest(".cart-rec-add, .cart-rec-card > button");
        if (!btn || btn.closest(".cart-rec-card--clone")) return;
        var card = btn.closest(".cart-rec-card, .swiper-slide, li");
        if (!card) return;
        var href = "";
        var link = card.querySelector("a[href*='/goods/view']");
        if (link) href = link.getAttribute("href") || "";
        var goodsSeq =
          btn.getAttribute("data-goods-seq") ||
          card.getAttribute("data-goods-seq") ||
          readGoodsSeq(card, href);
        if (!goodsSeq) return;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (openRecQuickview(btn, goodsSeq, event)) return;
        if (href) window.location.href = href;
      },
      true
    );

    section.addEventListener(
      "pointerenter",
      function (event) {
        var card = event.target.closest(".cart-rec-card:not(.cart-rec-card--clone)");
        if (!card) return;
        var seq = card.getAttribute("data-goods-seq");
        if (seq) prefetchRecGoods(seq);
      },
      true
    );
  }

  function openRecQuickview(button, goodsSeq, event) {
    if (!goodsSeq) return false;
    beginCartQvGuard();
    document.body.classList.add("is-cart-qv-loading");

    var opened = false;
    if (typeof window.displayAddToCartQuickview2 === "function") {
      window.displayAddToCartQuickview2(button, goodsSeq, event);
      opened = true;
    } else if (typeof window.displayAddToCartQuickview === "function") {
      window.displayAddToCartQuickview(button, goodsSeq);
      opened = true;
    }

    if (!opened) {
      endCartQvGuard(false);
      return false;
    }

    window.requestAnimationFrame(restoreCartQvScroll);
    if (window.jQuery) {
      window.jQuery(document).one("ajaxStop", attachCartQuickviewAfterOpen);
    } else {
      window.setTimeout(attachCartQuickviewAfterOpen, 300);
    }
    return true;
  }

  function readRecPrice(slide) {
    var selectors = [
      ".sale_price .num",
      ".sale_price b.num",
      ".string_price .num",
      ".string_price",
      ".sale_price",
      ".listing-card-price strong .num",
      ".listing-card-price strong",
      ".goods_price_area .sale_price",
      ".goods_price_area .num",
      ".goods_price_area",
      ".price .num",
      ".price",
      ".goods_price",
      ".consumer_price .num",
      ".consumer_price",
      "[class*='string_price']",
      "[class*='sale_price']",
      "[class*='price'] .num",
    ];
    for (var i = 0; i < selectors.length; i += 1) {
      var nodes = slide.querySelectorAll(selectors[i]);
      for (var j = 0; j < nodes.length; j += 1) {
        var el = nodes[j];
        if (!el) continue;
        var value = text(el);
        if (!value || !/\d/.test(value)) continue;
        if (/users? recently|viewed|wishlist|review/i.test(value)) continue;
        var money = value.match(/(?:US\$\s*)?\d[\d,]*(?:\.\d+)?(?:\s*USD)?/i);
        if (money) {
          return formatMoney(parseMoney(money[0]));
        }
      }
    }
    var raw =
      slide.getAttribute("data-price") ||
      slide.getAttribute("data-sale-price") ||
      slide.getAttribute("price") ||
      "";
    if (raw && /\d/.test(raw)) {
      return formatMoney(parseMoney(raw));
    }
    return "";
  }

  function fetchGoodsPrice(goodsSeq) {
    if (recPriceCache[goodsSeq]) {
      return Promise.resolve(recPriceCache[goodsSeq]);
    }
    if (recPriceInflight[goodsSeq]) {
      return recPriceInflight[goodsSeq];
    }

    recPriceInflight[goodsSeq] = fetch("/goods/view?no=" + encodeURIComponent(goodsSeq), {
      credentials: "same-origin",
    })
      .then(function (res) {
        if (!res.ok) throw new Error("goods view failed");
        return res.text();
      })
      .then(function (html) {
        var price = parsePriceFromGoodsHtml(html);
        if (!price) {
          var doc = new DOMParser().parseFromString(html, "text/html");
          var el =
            doc.querySelector(".sale_price .num") ||
            doc.querySelector(".string_price .num") ||
            doc.querySelector(".sale_price") ||
            doc.querySelector(".goods_price .num") ||
            doc.querySelector(".price .num") ||
            doc.querySelector("#price") ||
            doc.querySelector("[itemprop='price']");
          if (el) {
            var attrPrice = el.getAttribute("content") || el.getAttribute("value") || "";
            var value = attrPrice || text(el);
            if (/\d/.test(value)) price = formatMoney(parseMoney(value));
          }
        }
        if (price) recPriceCache[goodsSeq] = price;
        return price || "";
      })
      .catch(function () {
        return "";
      })
      .then(function (price) {
        delete recPriceInflight[goodsSeq];
        return price;
      });

    return recPriceInflight[goodsSeq];
  }

  function fillMissingRecPrices(list) {
    if (!list) return;
    var pending = {};
    var seqs = [];

    list.querySelectorAll(".cart-rec-card:not(.cart-rec-card--clone)").forEach(function (card) {
      var strong = card.querySelector(".cart-rec-price, .cart-rec-link strong");
      if (strong && text(strong)) return;
      var seq = card.getAttribute("data-goods-seq");
      if (!seq) return;
      if (!pending[seq]) {
        pending[seq] = [];
        seqs.push(seq);
      }
      pending[seq].push(strong);
    });

    var index = 0;
    var active = 0;
    var limit = 4;

    function pump() {
      while (active < limit && index < seqs.length) {
        (function (seq) {
          active += 1;
          fetchGoodsPrice(seq).then(function (price) {
            if (!price) return;
            pending[seq].forEach(function (strong) {
              if (strong) strong.textContent = price;
            });
            applyRecPriceToCards(seq, price);
          }).finally(function () {
            active -= 1;
            pump();
          });
        })(seqs[index]);
        index += 1;
      }
    }

    pump();
  }

  function normalizeRecCard(slide, asClone) {
    var link =
      slide.querySelector('a[href*="goods/view"], a[href*="goods/view?"], a[href*="/goods/"]') ||
      slide.querySelector("a[href]");
    var href = link ? link.getAttribute("href") : "";
    var goodsSeq = readGoodsSeq(slide, href);
    var img = slide.querySelector("img");
    var src = img ? img.getAttribute("src") || "" : "";
    var alt = img ? img.getAttribute("alt") || "" : "";
    var brand = firstText(slide, [
      ".brand_name",
      ".brand_title",
      ".brand_name_area",
      ".brand",
      ".r_brand_name",
    ]);
    var name =
      firstText(slide, [
        ".goods_name",
        ".listing-card-title",
        ".goods_name_area .goods_name",
        ".name",
        ".item_name",
        "h3",
        "h2",
        ".title",
      ]) || alt || "Product";
    var price = readRecPrice(slide);

    var article = document.createElement("article");
    article.className = "cart-rec-card" + (asClone ? " cart-rec-card--clone" : "");
    if (asClone) article.setAttribute("aria-hidden", "true");
    if (goodsSeq) article.setAttribute("data-goods-seq", goodsSeq);

    var media =
      '<span class="cart-rec-img">' +
      (src
        ? '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(alt || name) + '" loading="lazy" />'
        : "") +
      "</span>";
    var body =
      (brand ? "<p>" + escapeHtml(brand) + "</p>" : "") +
      "<h3>" +
      escapeHtml(name) +
      "</h3>" +
      "<strong class=\"cart-rec-price\">" +
      escapeHtml(price) +
      "</strong>";

    article.innerHTML =
      '<button type="button" class="cart-rec-add" aria-label="Add product"' +
      (goodsSeq ? ' data-goods-seq="' + escapeHtml(goodsSeq) + '"' : "") +
      (asClone ? ' tabindex="-1"' : "") +
      ">+</button>" +
      (href
        ? '<a class="cart-rec-link" href="' + escapeHtml(href) + '">' + media + body + "</a>"
        : '<div class="cart-rec-link">' + media + body + "</div>");

    return article;
  }

  function bindRecommendations() {
    var section = document.querySelector(".cart-recommendations");
    if (!section || section.getAttribute("data-cart-rec-ready") === "1") return false;

    var track = section.querySelector(".cart-rec-track");
    if (!track) return false;

    destroyRecSwiper(section);

    var slides = collectRecommendationCards(section);
    if (!slides.length) return false;

    // Real cards once, plus two cloned sets for the desktop infinite
    // marquee (trendypicker-cart.css only shows the clones and only
    // animates at 1121px+). Mobile/tablet hides the clones and scrolls
    // the track natively, so the last REAL card sits flush against the
    // right edge there — see .cart-rec-card--clone in trendypicker-cart.css.
    var list = document.createElement("div");
    list.className = "cart-rec-list";
    var count = slides.length;

    function appendSet(asClone) {
      slides.forEach(function (slide) {
        list.appendChild(normalizeRecCard(slide, asClone));
      });
    }

    appendSet(false);
    appendSet(true);
    appendSet(true);

    track.innerHTML = "";
    track.appendChild(list);

    function measureLoopDistance() {
      // The marquee only shows/animates at 1121px+ (trendypicker-cart.css).
      // Below that, clones are display:none and don't count toward
      // scrollWidth, so this loop would otherwise keep appending up to
      // count*8 pointless hidden clones on every mobile/tablet load.
      if (window.innerWidth < 1121) return;
      var first = list.children[0];
      var pivot = list.children[count];
      if (!first || !pivot) return;
      var distance = pivot.offsetLeft - first.offsetLeft;
      if (distance < 1) {
        distance =
          count *
          (first.offsetWidth +
            (parseFloat(window.getComputedStyle(list).gap) || 20));
      }
      section.style.setProperty("--cart-rec-loop-distance", distance + "px");

      var trackWidth = track.clientWidth || 0;
      while (list.scrollWidth < trackWidth * 2 + distance && list.children.length < count * 8) {
        appendSet(true);
      }
    }

    measureLoopDistance();
    window.requestAnimationFrame(measureLoopDistance);
    window.setTimeout(measureLoopDistance, 200);
    window.requestAnimationFrame(function () {
      fillMissingRecPrices(list);
    });
    section.setAttribute("data-cart-rec-ready", "1");
    return true;
  }

  function tryBindRecommendations() {
    if (bindRecommendations()) return;

    var section = document.querySelector(".cart-recommendations");
    if (!section) return;

    if (section.getAttribute("data-cart-rec-watch") === "1") return;
    section.setAttribute("data-cart-rec-watch", "1");

    if (!window.MutationObserver) {
      window.setTimeout(tryBindRecommendations, 350);
      return;
    }

    var observer = new MutationObserver(function () {
      if (bindRecommendations()) observer.disconnect();
    });
    observer.observe(section, { childList: true, subtree: true });
    window.setTimeout(function () {
      observer.disconnect();
      bindRecommendations();
    }, 6000);
  }

  var optionalChangesCache = Object.create(null);
  var optionalChangesPending = Object.create(null);

  function openFirstmallOptionEdit(cartOptionSeq) {
    var editBtn = document.getElementById(String(cartOptionSeq));
    if (editBtn && editBtn.classList.contains("btn_option_modify")) {
      editBtn.click();
      return true;
    }
    return false;
  }

  function fetchOptionalChanges(seq) {
    seq = String(seq || "");
    if (!seq) return Promise.reject(new Error("missing seq"));
    if (optionalChangesCache[seq]) return Promise.resolve(optionalChangesCache[seq]);
    if (optionalChangesPending[seq]) return optionalChangesPending[seq];
    optionalChangesPending[seq] = fetch(
      "/order/optional_changes?no=" + encodeURIComponent(seq),
      { credentials: "same-origin", cache: "default" }
    )
      .then(function (res) {
        if (!res.ok) throw new Error("optional_changes failed");
        return res.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        optionalChangesCache[seq] = doc;
        return doc;
      })
      .catch(function (err) {
        delete optionalChangesPending[seq];
        throw err;
      });
    return optionalChangesPending[seq];
  }

  function prefetchOptionalChanges() {
    var seen = {};
    page.querySelectorAll("[data-cart-option-seq]").forEach(function (el) {
      var seq = el.getAttribute("data-cart-option-seq");
      if (!seq || seen[seq]) return;
      seen[seq] = true;
      fetchOptionalChanges(seq).catch(function () {});
    });
  }

  function getOptionalChangesForm(doc) {
    if (!doc) return null;
    return (
      doc.querySelector("#optional_changes_form") ||
      doc.querySelector("form[name='optional_changes_form']")
    );
  }

  function copyFormFields(sourceForm, targetForm) {
    Array.prototype.forEach.call(sourceForm.elements, function (el) {
      if (!el || !el.name || el.disabled) return;
      var type = String(el.type || "").toLowerCase();
      if ((type === "checkbox" || type === "radio") && !el.checked) return;
      if (type === "file" || type === "submit" || type === "button") return;
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = el.name;
      input.value = el.value;
      targetForm.appendChild(input);
    });
  }

  function submitOptionalModify(sourceForm) {
    if (!sourceForm) return false;
    var live = document.createElement("form");
    live.method = "post";
    live.action = sourceForm.getAttribute("action") || "/order/optional_modify";
    live.target = "actionFrame";
    live.enctype = sourceForm.getAttribute("enctype") || "application/x-www-form-urlencoded";
    live.style.display = "none";
    copyFormFields(sourceForm, live);
    document.body.appendChild(live);
    live.submit();
    window.setTimeout(function () {
      if (live.parentNode) live.parentNode.removeChild(live);
    }, 1500);
    return true;
  }

  function readRowQty(row) {
    if (!row) return 1;
    var qtyOut = row.querySelector("[data-cart-qty-value]");
    var ea = parseInt(String(text(qtyOut) || "").replace(/[^\d]/g, ""), 10);
    if (ea > 0) return ea;
    return parseInt(row.getAttribute("data-cart-ea"), 10) || 1;
  }

  function applyUnitPriceToRow(row, unit, compare) {
    if (!row || !(unit > 0)) return;
    var ea = readRowQty(row);
    row.setAttribute("data-cart-unit-price", String(unit));
    row.setAttribute("data-cart-ea", String(ea));
    row.setAttribute("data-cart-unit-compare", String(compare > unit ? compare : unit));

    var priceEl = row.querySelector(".cart-item-price");
    var strong = priceEl && priceEl.querySelector("strong");
    var del = priceEl && priceEl.querySelector("del");
    if (strong) strong.textContent = formatMoney(unit);
    if (compare > unit) {
      if (!del && priceEl) {
        del = document.createElement("del");
        priceEl.insertBefore(del, strong || null);
      }
      if (del) del.textContent = formatMoney(compare);
    } else if (del && del.parentNode) {
      del.parentNode.removeChild(del);
    }

    var total = row.querySelector("[data-cart-line-total], .cart-item-total");
    if (total) total.textContent = formatMoney(unit * ea);
    paintSelectionSummary();
  }

  var MERGE_DELETE_KEY = "tpCartOptionMergeDelete";
  var SILENT_DELETE_KEY = "tpCartSilentDelete";
  var SILENT_DELETE_FRAME = "tpCartSilentFrame";

  function collectCartRows() {
    return Array.prototype.slice.call(
      (page || document).querySelectorAll("li.cart_goods.cart-item, li.cart_goods")
    );
  }

  function getRowGoodsSeq(row) {
    if (!row) return "";
    var stored = row.getAttribute("data-cart-goods-seq");
    if (stored) return stored;
    var check = row.querySelector('input[name="cart_option_seq[]"]');
    var rel = check && check.getAttribute("rel");
    if (rel) {
      row.setAttribute("data-cart-goods-seq", rel);
      return rel;
    }
    var link = row.querySelector('a[href*="goods/view"]');
    var href = (link && link.getAttribute("href")) || "";
    var match = href.match(/[?&]no=(\d+)/i);
    if (match) {
      row.setAttribute("data-cart-goods-seq", match[1]);
      return match[1];
    }
    return "";
  }

  function getRowProductKey(row) {
    var seq = getRowGoodsSeq(row);
    if (seq) return "g:" + seq;
    var name = text(row.querySelector(".cart-item-name, .cart-item-info h2 a, .cart-item-info h2"));
    return name ? "n:" + normalizeOptionKey(name) : "";
  }

  function getRowOptionSeq(row) {
    if (!row) return "";
    var check = row.querySelector('input[name="cart_option_seq[]"]');
    return (check && check.value) || row.getAttribute("data-cart-option-seq") || "";
  }

  function getRowOptionLabel(row) {
    return text(row && row.querySelector(".realtrend-select-value"));
  }

  function normalizeOptionKey(value) {
    return String(value || "")
      .replace(/\(\s*\+?\s*(?:US\$|\$)?\s*[\d.,]+\s*\)/gi, "")
      .replace(/\s*\/\s*/g, "/")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function optionKeysMatch(left, right) {
    var a = normalizeOptionKey(left);
    var b = normalizeOptionKey(right);
    if (!a || !b) return false;
    if (a === b) return true;
    if (a.indexOf(b) !== -1 || b.indexOf(a) !== -1) return true;
    var aPart = a.split("/")[0].trim();
    var bPart = b.split("/")[0].trim();
    return Boolean(aPart && bPart && aPart === bPart);
  }

  function findMergeTargetRow(sourceRow, optionLabel, optionValue) {
    var sourceKey = getRowProductKey(sourceRow);
    var sourceSeq = getRowOptionSeq(sourceRow);
    if (!sourceKey || !sourceSeq) return null;
    var found = null;
    collectCartRows().forEach(function (row) {
      if (found || row === sourceRow) return;
      if (getRowProductKey(row) !== sourceKey) return;
      if (String(getRowOptionSeq(row)) === String(sourceSeq)) return;
      var label = getRowOptionLabel(row);
      if (
        optionKeysMatch(label, optionLabel) ||
        optionKeysMatch(label, optionValue)
      ) {
        found = row;
      }
    });
    return found;
  }

  function queueOptionMergeDelete(seq) {
    try {
      sessionStorage.setItem(MERGE_DELETE_KEY, String(seq || ""));
    } catch (err) {}
  }

  function clearOptionMergeDelete(seq) {
    try {
      var stored = sessionStorage.getItem(MERGE_DELETE_KEY) || "";
      if (!seq || stored === String(seq)) sessionStorage.removeItem(MERGE_DELETE_KEY);
    } catch (err) {}
  }

  function isCartDeleteAlertMessage(msg) {
    return /삭제\s*되었|deleted|removed from/i.test(
      String(msg || "").replace(/<[^>]+>/g, " ")
    );
  }

  function beginSilentCartDelete(seq) {
    window._tpCartSilentDelete = true;
    window._tpCartSilentDeleteSeq = String(seq || "");
    try {
      sessionStorage.setItem(SILENT_DELETE_KEY, String(seq || "1"));
    } catch (err) {}
  }

  function endSilentCartDelete() {
    window._tpCartSilentDelete = false;
    window._tpCartSilentDeleteSeq = "";
    try {
      sessionStorage.removeItem(SILENT_DELETE_KEY);
    } catch (err) {}
  }

  function shouldSilenceCartAlert(msg) {
    var silent = Boolean(window._tpCartSilentDelete);
    if (!silent) {
      try {
        silent = Boolean(sessionStorage.getItem(SILENT_DELETE_KEY));
      } catch (err) {}
    }
    return silent && isCartDeleteAlertMessage(msg);
  }

  function finishSilentCartDelete() {
    var seq = window._tpCartSilentDeleteSeq || "";
    try {
      seq = seq || sessionStorage.getItem(SILENT_DELETE_KEY) || "";
    } catch (err) {}
    endSilentCartDelete();
    removeCartRowBySeq(seq);
    dismissDeleteDialogs();
  }

  function dismissDeleteDialogs() {
    var matched = false;
    Array.prototype.forEach.call(document.querySelectorAll(".ui-dialog"), function (dialog) {
      if (!isCartDeleteAlertMessage(dialog.textContent || "")) return;
      matched = true;
      if (window.jQuery) {
        try {
          window.jQuery(dialog).find(".ui-dialog-content").dialog("destroy");
        } catch (err) {
          try {
            window.jQuery(dialog).remove();
          } catch (err2) {}
        }
      } else if (dialog.parentNode) {
        dialog.parentNode.removeChild(dialog);
      }
    });
    if (!matched) return;
    Array.prototype.forEach.call(document.querySelectorAll(".ui-widget-overlay"), function (overlay) {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    });
  }

  var alertPatchTries = 0;

  function wrapCartAlertFn(name) {
    var original = window[name];
    if (typeof original !== "function" || original._tpCartSilent) return false;
    window[name] = function (msg) {
      if (shouldSilenceCartAlert(msg)) {
        finishSilentCartDelete();
        return;
      }
      if (window._tpCartSilentDelete && name === "openDialogAlert") endSilentCartDelete();
      return original.apply(this, arguments);
    };
    window[name]._tpCartSilent = true;
    return true;
  }

  function patchCartAlertDialogs() {
    wrapCartAlertFn("openDialogAlert");
    wrapCartAlertFn("alert");
    if (typeof window.openDialogAlert !== "function" && alertPatchTries < 40) {
      alertPatchTries += 1;
      window.setTimeout(patchCartAlertDialogs, 80);
    }
  }

  function getSilentDeleteFrame() {
    var frame = document.querySelector('iframe[name="' + SILENT_DELETE_FRAME + '"]');
    if (frame) return frame;
    frame = document.createElement("iframe");
    frame.name = SILENT_DELETE_FRAME;
    frame.setAttribute("name", SILENT_DELETE_FRAME);
    frame.title = "cart merge";
    frame.style.cssText =
      "position:absolute;width:0;height:0;border:0;overflow:hidden;opacity:0;pointer-events:none;";
    frame.addEventListener("load", function () {
      if (!window._tpCartSilentDelete) return;
      var html = "";
      try {
        var doc = frame.contentDocument || (frame.contentWindow && frame.contentWindow.document);
        html = doc && doc.documentElement ? String(doc.documentElement.innerHTML || "") : "";
      } catch (err) {}
      if (isCartDeleteAlertMessage(html) || /openDialogAlert|location\.reload/i.test(html)) {
        window.setTimeout(function () {
          if (!window._tpCartSilentDelete) {
            dismissDeleteDialogs();
            return;
          }
          finishSilentCartDelete();
        }, 30);
      }
    });
    document.body.appendChild(frame);
    return frame;
  }

  function findCartRowBySeq(seq) {
    if (!seq) return null;
    var row = document.getElementById("cart_goods_" + seq);
    if (row) return row;
    var found = null;
    collectCartRows().forEach(function (item) {
      if (!found && String(getRowOptionSeq(item)) === String(seq)) found = item;
    });
    return found;
  }

  function removeCartRowBySeq(seq) {
    var row = findCartRowBySeq(seq);
    if (row && row.parentNode) row.parentNode.removeChild(row);
    if (typeof paintSelectionSummary === "function") paintSelectionSummary();
  }

  function restoreCartFormTarget(form, action, target) {
    if (!form) return;
    form.setAttribute("action", action || "order");
    form.setAttribute("target", target || "actionFrame");
  }

  function deleteCartOptionSeq(seq, useFrame, silent) {
    var form = document.getElementById("cart_form");
    if (!form || !seq) return Promise.reject(new Error("missing cart form"));

    if (silent) {
      patchCartAlertDialogs();
      getSilentDeleteFrame();
      beginSilentCartDelete(seq);
    }

    if (useFrame) {
      var found = false;
      Array.prototype.forEach.call(form.querySelectorAll('input[name="cart_option_seq[]"]'), function (box) {
        var match = String(box.value) === String(seq);
        box.checked = match;
        if (match) {
          found = true;
          box.setAttribute("checked", "checked");
        } else {
          box.removeAttribute("checked");
        }
      });
      if (!found) {
        var extra = document.createElement("input");
        extra.type = "hidden";
        extra.name = "cart_option_seq[]";
        extra.value = String(seq);
        form.appendChild(extra);
      }
      var prevAction = form.getAttribute("action");
      var prevTarget = form.getAttribute("target");
      form.setAttribute("action", "del");
      form.setAttribute("target", silent ? SILENT_DELETE_FRAME : "actionFrame");
      form.submit();
      window.setTimeout(function () {
        restoreCartFormTarget(form, prevAction, prevTarget);
      }, 0);
      return Promise.resolve();
    }

    var body = new URLSearchParams();
    Array.prototype.forEach.call(form.querySelectorAll("input[type='hidden']"), function (el) {
      if (el && el.name) body.append(el.name, el.value);
    });
    body.append("cart_option_seq[]", String(seq));
    return fetch("/order/del", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: body.toString(),
    }).then(function (res) {
      if (!res.ok) throw new Error("delete failed");
      return res;
    });
  }

  function silentDeleteCartOptionSeq(seq) {
    if (!seq) return Promise.resolve();
    return deleteCartOptionSeq(seq, true, true);
  }

  function flushQueuedOptionMergeDelete() {
    var seq = "";
    try {
      seq = sessionStorage.getItem(MERGE_DELETE_KEY) || "";
    } catch (err) {}
    if (!seq) return;
    if (!findCartRowBySeq(seq)) {
      clearOptionMergeDelete(seq);
      return;
    }
    clearOptionMergeDelete(seq);
    silentDeleteCartOptionSeq(seq);
  }

  function mergeCartOptionRows(sourceRow, targetRow) {
    var sourceSeq = getRowOptionSeq(sourceRow);
    var targetSeq = getRowOptionSeq(targetRow);
    if (!sourceSeq || !targetSeq || sourceSeq === targetSeq) return Promise.resolve();
    var nextEa = readRowQty(sourceRow) + readRowQty(targetRow);
    var unit = parseMoney(targetRow.getAttribute("data-cart-unit-price"));
    var compare = parseMoney(targetRow.getAttribute("data-cart-unit-compare"));
    queueOptionMergeDelete(sourceSeq);
    if (sourceRow) sourceRow.style.display = "none";
    var qtyOut = targetRow.querySelector("[data-cart-qty-value]");
    if (qtyOut) qtyOut.textContent = String(nextEa);
    targetRow.setAttribute("data-cart-ea", String(nextEa));
    if (unit > 0) applyUnitPriceToRow(targetRow, unit, compare);
    else paintSelectionSummary();

    return fetchOptionalChanges(targetSeq)
      .then(function (doc) {
        var form = getOptionalChangesForm(doc);
        if (!form) throw new Error("optional_changes form missing");
        var eaInputs = form.querySelectorAll("input[name^='optionEa']");
        if (!eaInputs.length) eaInputs = form.querySelectorAll("input.ea_change");
        if (!eaInputs.length) throw new Error("quantity input missing");
        eaInputs[0].value = String(nextEa);
        submitOptionalModify(form);
        window.setTimeout(function () {
          if (!findCartRowBySeq(sourceSeq)) {
            clearOptionMergeDelete(sourceSeq);
            return;
          }
          silentDeleteCartOptionSeq(sourceSeq);
        }, 900);
      })
      .catch(function () {
        silentDeleteCartOptionSeq(sourceSeq);
      });
  }

  function mergeDuplicateCartRowsOnLoad() {
    var rows = collectCartRows().filter(function (row) {
      return row && row.style.display !== "none";
    });
    var i;
    var j;
    for (i = 0; i < rows.length; i += 1) {
      for (j = i + 1; j < rows.length; j += 1) {
        if (getRowProductKey(rows[i]) !== getRowProductKey(rows[j])) continue;
        if (!getRowProductKey(rows[i])) continue;
        if (!optionKeysMatch(getRowOptionLabel(rows[i]), getRowOptionLabel(rows[j]))) continue;
        mergeCartOptionRows(rows[j], rows[i]);
        return true;
      }
    }
    return false;
  }

  function applySelectedOptionToForm(form, optionEl, ea) {
    if (!form || !optionEl) return;
    var value = optionEl.value;
    var opts = [
      optionEl.getAttribute("opt1"),
      optionEl.getAttribute("opt2"),
      optionEl.getAttribute("opt3"),
      optionEl.getAttribute("opt4"),
      optionEl.getAttribute("opt5"),
    ];
    var hasOptAttrs = opts.some(function (part) {
      return !!part;
    });

    Array.prototype.forEach.call(
      form.querySelectorAll('select[name="viewOptions[]"], select[name^="viewOptions"]'),
      function (select) {
        if (!select.options || select.options.length < 2) return;
        var match = Array.prototype.some.call(select.options, function (opt) {
          return String(opt.value) === String(value);
        });
        if (match) select.value = value;
      }
    );

    Array.prototype.forEach.call(
      form.querySelectorAll("input.selected_options[name^='option['], input[name^='option[']"),
      function (input) {
        if (/optionTitle/i.test(input.name || "")) return;
        var seq = parseInt(input.getAttribute("opt_seq"), 10);
        if (isNaN(seq)) {
          var match = String(input.name || "").match(/option\[\d+\]\[(\d+)\]/);
          if (match) seq = parseInt(match[1], 10);
        }
        if (isNaN(seq)) return;
        if (hasOptAttrs) {
          if (opts[seq] != null && String(opts[seq]) !== "") input.value = opts[seq];
        } else if (seq === 0) {
          input.value = value;
        }
      }
    );

    if (ea > 0) {
      Array.prototype.forEach.call(
        form.querySelectorAll("input[name^='optionEa'], input.ea_change"),
        function (input) {
          input.value = String(ea);
        }
      );
    }
  }

  function findOptionElement(form, optionValue) {
    if (!form || optionValue == null || optionValue === "") return null;
    var found = null;
    Array.prototype.forEach.call(
      form.querySelectorAll(
        'select[name="viewOptions[]"] option, select[name^="viewOptions"] option'
      ),
      function (opt) {
        if (found) return;
        if (String(opt.value) === String(optionValue)) found = opt;
      }
    );
    return found;
  }

  function parseOptionPrice(opt, label) {
    var price = parseMoney(opt && opt.getAttribute && opt.getAttribute("price"));
    if (price > 0) return price;
    var extra = String(label || "").match(/\(\s*\+?\s*(?:US\$|\$)?\s*([\d.,]+)\s*\)/i);
    return extra ? parseMoney(extra[1]) : 0;
  }

  function bindOptionSelects() {
    function closeAll(except) {
      page.querySelectorAll("[data-cart-option-select].is-open").forEach(function (wrap) {
        if (wrap === except) return;
        wrap.classList.remove("is-open");
        var trigger = wrap.querySelector(".realtrend-select-trigger");
        var menu = wrap.querySelector(".realtrend-select-menu");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
        if (menu) menu.classList.remove("is-open");
      });
    }

    function setMenuItems(menu, items, currentLabel) {
      menu.innerHTML = "";
      var current = String(currentLabel || "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
      items.forEach(function (item) {
        var li = document.createElement("li");
        li.setAttribute("role", "option");
        li.textContent = item.label;
        li.setAttribute("data-option-label", item.label);
        if (item.value != null) li.setAttribute("data-option-value", item.value);
        if (item.price > 0) li.setAttribute("data-option-price", String(item.price));
        if (item.compare > 0) li.setAttribute("data-option-compare", String(item.compare));
        if (item.disabled) {
          li.setAttribute("aria-disabled", "true");
          li.classList.add("is-disabled");
        }
        var selected =
          current &&
          (String(item.label).replace(/\s+/g, " ").trim().toLowerCase() === current ||
            String(item.value || "").replace(/\s+/g, " ").trim().toLowerCase() === current);
        if (selected) {
          li.classList.add("is-selected");
          li.setAttribute("aria-selected", "true");
        }
        menu.appendChild(li);
      });
    }

    function parseOptionChoices(doc) {
      var choices = [];
      var seen = {};
      var selects = doc.querySelectorAll(
        'select[name="viewOptions[]"], select[name^="viewOptions"], .goods_option_table select, #optional_changes_form select'
      );
      var best = null;

      Array.prototype.forEach.call(selects, function (el) {
        var count = 0;
        Array.prototype.forEach.call(el.options || [], function (opt) {
          var label = String(opt.textContent || "").replace(/\s+/g, " ").trim();
          if (opt.value && label && !/^-\s*select/i.test(label)) count += 1;
        });
        if (!best || count > best.count) best = { el: el, count: count };
      });

      if (best && best.el && best.count > 0) {
        Array.prototype.forEach.call(best.el.options, function (opt) {
          var label = String(opt.textContent || "").replace(/\s+/g, " ").trim();
          var value = opt.value;
          if (!value || !label || seen[label]) return;
          if (/^-\s*select/i.test(label)) return;
          seen[label] = true;
          choices.push({
            label: label,
            value: value,
            disabled: !!opt.disabled,
            price: parseOptionPrice(opt, label),
            compare: parseMoney(opt.getAttribute("consumer_price")),
          });
        });
      }

      if (!choices.length) {
        doc.querySelectorAll(".goods_quantity_table .option_text, .goods_quantity_table .option_col_text").forEach(function (cell) {
          var label = String(cell.textContent || "").replace(/\s+/g, " ").trim();
          if (!label || seen[label]) return;
          seen[label] = true;
          choices.push({ label: label, value: label, price: 0, compare: 0 });
        });
      }

      return choices;
    }

    function paintOptions(wrap, doc) {
      var menu = wrap.querySelector(".realtrend-select-menu");
      var valueEl = wrap.querySelector(".realtrend-select-value");
      if (!menu) return;
      wrap._cartOptionDoc = doc;
      var choices = parseOptionChoices(doc);
      var current = text(valueEl);
      if (!choices.length && current) {
        choices = [{ label: current, value: "", price: 0, compare: 0 }];
      }
      setMenuItems(menu, choices, current);
      wrap.setAttribute("data-options-loaded", "1");
    }

    function loadOptions(wrap) {
      var seq = wrap.getAttribute("data-cart-option-seq");
      var menu = wrap.querySelector(".realtrend-select-menu");
      if (!seq || !menu) return Promise.resolve();
      if (wrap.getAttribute("data-options-loaded") === "1") return Promise.resolve();

      if (optionalChangesCache[seq]) {
        paintOptions(wrap, optionalChangesCache[seq]);
        return Promise.resolve();
      }

      menu.innerHTML = "<li role=\"option\" aria-disabled=\"true\">Loading options…</li>";
      return fetchOptionalChanges(seq)
        .then(function (doc) {
          paintOptions(wrap, doc);
        })
        .catch(function () {
          var current = text(wrap.querySelector(".realtrend-select-value"));
          setMenuItems(menu, current ? [{ label: current, value: "" }] : [], current);
          wrap.setAttribute("data-options-loaded", "1");
        });
    }

    function submitSelectedOption(wrap, optionValue, optionPrice, optionCompare) {
      var seq = wrap.getAttribute("data-cart-option-seq");
      var row = wrap.closest("li.cart_goods, .cart-item");
      var optionLabel =
        text(wrap.querySelector(".realtrend-select-value")) || optionValue;
      var mergeRow = findMergeTargetRow(row, optionLabel, optionValue);
      if (mergeRow) {
        mergeCartOptionRows(row, mergeRow);
        return;
      }
      if (optionPrice > 0) applyUnitPriceToRow(row, optionPrice, optionCompare);

      fetchOptionalChanges(seq)
        .then(function (doc) {
          var source = getOptionalChangesForm(doc);
          var optionEl = findOptionElement(source, optionValue);
          if (!source || !optionEl) {
            openFirstmallOptionEdit(seq);
            return;
          }
          applySelectedOptionToForm(source, optionEl, readRowQty(row));
          if (!(optionPrice > 0)) {
            var price = parseOptionPrice(optionEl, optionEl.textContent);
            var compare = parseMoney(optionEl.getAttribute("consumer_price"));
            if (price > 0) applyUnitPriceToRow(row, price, compare);
          }
          submitOptionalModify(source);
        })
        .catch(function () {
          openFirstmallOptionEdit(seq);
        });
    }

    page.addEventListener("pointerenter", function (event) {
      var wrap = event.target.closest("[data-cart-option-select]");
      if (!wrap || !page.contains(wrap)) return;
      var seq = wrap.getAttribute("data-cart-option-seq");
      if (seq) fetchOptionalChanges(seq).catch(function () {});
    }, true);

    page.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-cart-option-select] .realtrend-select-trigger");
      if (trigger && page.contains(trigger)) {
        event.preventDefault();
        event.stopPropagation();
        var wrap = trigger.closest("[data-cart-option-select]");
        var menu = wrap.querySelector(".realtrend-select-menu");
        var willOpen = !wrap.classList.contains("is-open");
        closeAll(willOpen ? wrap : null);
        if (!willOpen) {
          wrap.classList.remove("is-open");
          trigger.setAttribute("aria-expanded", "false");
          if (menu) menu.classList.remove("is-open");
          return;
        }
        wrap.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        if (menu) menu.classList.add("is-open");
        loadOptions(wrap);
        return;
      }

      var optionItem = event.target.closest("[data-cart-option-select] .realtrend-select-menu [role='option']");
      if (optionItem && page.contains(optionItem)) {
        event.preventDefault();
        event.stopPropagation();
        if (optionItem.getAttribute("aria-disabled") === "true") return;
        var optionWrap = optionItem.closest("[data-cart-option-select]");
        var optionValue = optionItem.getAttribute("data-option-value");
        var valueNode = optionWrap.querySelector(".realtrend-select-value");
        closeAll();
        if (!optionValue) return;
        if (valueNode) {
          valueNode.textContent =
            optionItem.getAttribute("data-option-label") || text(optionItem);
        }
        submitSelectedOption(
          optionWrap,
          optionValue,
          parseMoney(optionItem.getAttribute("data-option-price")),
          parseMoney(optionItem.getAttribute("data-option-compare"))
        );
        return;
      }

      if (!event.target.closest("[data-cart-option-select]")) {
        closeAll();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeAll();
    });
  }

  function bindQty() {
    // seq -> pending debounce timer. Clicking +/- repeatedly (or typing then
    // pressing Enter again) restarts the timer instead of firing a network
    // request per click — only the last value in a burst gets submitted.
    var pendingTimers = Object.create(null);
    var actionFrameSynced = false;

    function readQty(wrap) {
      var input = wrap.querySelector("[data-cart-qty-input]");
      if (input && (wrap.classList.contains("is-editing") || document.activeElement === input)) {
        var typed = parseInt(String(input.value).replace(/[^\d]/g, ""), 10);
        if (typed > 0) return typed;
      }
      var out = wrap.querySelector("[data-cart-qty-value]") || wrap.querySelector("output");
      return Math.max(1, parseInt(text(out).replace(/,/g, ""), 10) || 1);
    }

    function writeQty(wrap, value) {
      var out = wrap.querySelector("[data-cart-qty-value]") || wrap.querySelector("output");
      if (out) out.textContent = String(value);
      var input = wrap.querySelector("[data-cart-qty-input]");
      if (input) input.value = String(value);
    }

    // The native /order/optional_modify response (loaded into the hidden
    // actionFrame) has been seen writing the cart-wide total into this
    // row's own line-total element instead of leaving it alone. Once the
    // frame finishes loading, reassert this row's real total (unit * qty,
    // which we already know is correct) so it wins over whatever the
    // native response just wrote.
    function resyncRowTotal(row) {
      if (!row) return;
      var unit = parseMoney(row.getAttribute("data-cart-unit-price"));
      var compare = parseMoney(row.getAttribute("data-cart-unit-compare"));
      if (unit > 0) applyUnitPriceToRow(row, unit, compare);
    }

    function bindActionFrameResync() {
      if (actionFrameSynced) return;
      var frame = document.querySelector("iframe[name='actionFrame']");
      if (!frame) return;
      actionFrameSynced = true;
      frame.addEventListener("load", function () {
        window.setTimeout(function () {
          resyncAllRowTotals();
          page.querySelectorAll("li.cart_goods, .cart-item").forEach(resyncRowTotal);
          paintSelectionSummary();
        }, 50);
      });
    }

    function submitQty(cartOptionSeq, nextEa) {
      return fetchOptionalChanges(cartOptionSeq)
        .then(function (doc) {
          var source = getOptionalChangesForm(doc);
          if (!source) throw new Error("optional_changes form missing");

          var eaInputs = source.querySelectorAll("input[name^='optionEa']");
          if (!eaInputs.length) {
            eaInputs = source.querySelectorAll("input.ea_change");
          }
          if (!eaInputs.length) throw new Error("quantity input missing");
          eaInputs[0].value = String(nextEa);
          submitOptionalModify(source);
          bindActionFrameResync();
        })
        .catch(function () {
          openFirstmallOptionEdit(cartOptionSeq);
        });
    }

    function scheduleSubmit(seq, next) {
      window.clearTimeout(pendingTimers[seq]);
      pendingTimers[seq] = window.setTimeout(function () {
        delete pendingTimers[seq];
        submitQty(seq, next);
      }, 180);
    }

    // Shared by +/-, typing a number, and blur/Enter: paints the new
    // quantity and this row's total immediately (no network wait), then
    // debounces the actual save.
    function changeQty(wrap, row, seq, next) {
      writeQty(wrap, next);
      if (row) {
        row.setAttribute("data-cart-ea", String(next));
        var unit = parseMoney(row.getAttribute("data-cart-unit-price"));
        var compare = parseMoney(row.getAttribute("data-cart-unit-compare"));
        if (!(unit > 0)) {
          var strong = row.querySelector(".cart-item-price strong");
          unit = parseMoney(strong && strong.textContent);
        }
        if (unit > 0) applyUnitPriceToRow(row, unit, compare);
      }
      scheduleSubmit(seq, next);
    }

    function seqFor(wrap, row) {
      var seq = wrap.getAttribute("data-cart-option-seq");
      if (!seq && row && row.id) seq = String(row.id).replace(/^cart_goods_/, "");
      return seq;
    }

    function enterEditMode(wrap) {
      if (!wrap || wrap.classList.contains("is-editing")) return;
      var out = wrap.querySelector("[data-cart-qty-value]") || wrap.querySelector("output");
      var input = wrap.querySelector("[data-cart-qty-input]");
      if (!out || !input) return;
      input.value = text(out).replace(/,/g, "") || "1";
      wrap.classList.add("is-editing");
      input.focus();
      input.select();
    }

    function commitEditMode(wrap) {
      var out = wrap.querySelector("[data-cart-qty-value]") || wrap.querySelector("output");
      var input = wrap.querySelector("[data-cart-qty-input]");
      if (!out || !input || !wrap.classList.contains("is-editing")) return;
      wrap.classList.remove("is-editing");

      var row = wrap.closest("li.cart_goods, .cart-item");
      var seq = seqFor(wrap, row);
      if (!seq) {
        writeQty(wrap, text(out).replace(/,/g, "") || "1");
        return;
      }

      var current = Math.max(1, parseInt(text(out).replace(/,/g, ""), 10) || 1);
      var next = Math.max(1, parseInt(String(input.value).replace(/[^\d]/g, ""), 10) || current);
      if (next === current) {
        writeQty(wrap, current);
        return;
      }
      changeQty(wrap, row, seq, next);
    }

    page.addEventListener("focusin", function (event) {
      var input = event.target.closest && event.target.closest("[data-cart-qty-input]");
      if (!input || !page.contains(input)) return;
      enterEditMode(input.closest("[data-cart-qty]"));
    });

    page.addEventListener("input", function (event) {
      var input = event.target.closest && event.target.closest("[data-cart-qty-input]");
      if (!input || !page.contains(input)) return;
      var cleaned = String(input.value).replace(/[^\d]/g, "");
      if (cleaned !== input.value) input.value = cleaned;
    });

    page.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-cart-qty-change]");
      if (!btn || !page.contains(btn)) return;
      event.preventDefault();

      var wrap = btn.closest("[data-cart-qty]");
      if (!wrap) return;
      var row = wrap.closest("li.cart_goods, .cart-item");
      var seq = seqFor(wrap, row);
      if (!seq) return;

      var delta = parseInt(btn.getAttribute("data-cart-qty-change"), 10) || 0;
      var current = readQty(wrap);
      var next = Math.max(1, current + delta);
      if (next === current) return;

      wrap.classList.remove("is-editing");
      changeQty(wrap, row, seq, next);
    });

    page.addEventListener("pointerenter", function (event) {
      var wrap = event.target && event.target.closest && event.target.closest("[data-cart-qty]");
      if (!wrap || !page.contains(wrap)) return;
      var row = wrap.closest("li.cart_goods, .cart-item");
      var seq = seqFor(wrap, row);
      if (seq) fetchOptionalChanges(seq).catch(function () {});
    }, true);

    page.addEventListener(
      "blur",
      function (event) {
        var input = event.target.closest && event.target.closest("[data-cart-qty-input]");
        if (!input) return;
        var wrap = input.closest("[data-cart-qty]");
        if (wrap) commitEditMode(wrap);
      },
      true
    );

    page.addEventListener("keydown", function (event) {
      var input = event.target.closest && event.target.closest("[data-cart-qty-input]");
      if (!input) return;
      if (event.key === "Enter") {
        event.preventDefault();
        input.blur();
      } else if (event.key === "Escape") {
        var wrap = input.closest("[data-cart-qty]");
        if (!wrap) return;
        var out = wrap.querySelector("[data-cart-qty-value]") || wrap.querySelector("output");
        wrap.classList.remove("is-editing");
        writeQty(wrap, text(out).replace(/,/g, "") || "1");
        input.blur();
      }
    });
  }

  window.tpCartPaintSelectionSummary = paintSelectionSummary;
  patchSetPriceInfoCheck();
  patchSetCartPriceInfo();

  ready(function () {
    patchCartAlertDialogs();
    endCartQvGuard(false);
    bindCartQuickviewClose();
    patchSetPriceInfoCheck();
    patchSetCartPriceInfo();
    // After the inline script in cart.html sets its default (everything
    // checked), so this only overrides what the user actually unchecked
    // before navigating away.
    restoreSelectionState();
    bindSelectionPersistence();
    normalizeCartCurrency();
    paintSelectionSummary();
    bindShippingMeter();
    bindPromo();
    bindCoupon();

    var promoSaleEl = document.getElementById("total_promotion_goods_sale");
    if (promoSaleEl && window.MutationObserver) {
      new MutationObserver(syncPromoSummary).observe(promoSaleEl, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }
    bindPaypal();
    bindCountry();
    flushQueuedOptionMergeDelete();
    bindOptionSelects();
    bindQty();
    window.setTimeout(mergeDuplicateCartRowsOnLoad, 80);
    if (window.requestIdleCallback) {
      window.requestIdleCallback(prefetchOptionalChanges, { timeout: 1200 });
    } else {
      window.setTimeout(prefetchOptionalChanges, 200);
    }
    initCartNewsletterReveal();
    bindRecQuickviewClicks();
    bindCartQvFloatingSettle();
    window.requestAnimationFrame(function () {
      tryBindRecommendations();
    });
    window.requestAnimationFrame(function () {
      normalizeCartCurrency();
      paintSelectionSummary();
      window.requestAnimationFrame(enableShippingMeterTransitions);
    });
  });
})();
