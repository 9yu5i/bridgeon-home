/**
 * TrendyPicker Checkout
 * /order/settle → order/settle.html
 *
 * Applies the coupon selected on cart and keeps checkout chrome in sync.
 */
(function () {
  "use strict";

  document.documentElement.classList.add("is-checkout-page");
  if (document.body) document.body.classList.add("is-checkout-page");

  var COUPON_KEY = "tpCartCoupon";

  function parseMoney(value) {
    var raw = String(value || "").replace(/[^0-9.]/g, "");
    var num = parseFloat(raw);
    return isNaN(num) ? 0 : num;
  }

  function formatMoney(value) {
    return "US$" + Number(value || 0).toFixed(2);
  }

  function textOf(el) {
    return el ? String(el.textContent || "").replace(/\s+/g, " ").trim() : "";
  }

  function stripUsdSuffix(root) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    var node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(function (textNode) {
      if (!textNode.nodeValue || !/USD/i.test(textNode.nodeValue)) return;
      textNode.nodeValue = textNode.nodeValue.replace(/\s*USD\s*/gi, "");
    });
  }

  function previousText(el) {
    var node = el && el.previousSibling;
    while (node && node.nodeType === 3 && !String(node.nodeValue || "").trim()) {
      node = node.previousSibling;
    }
    return node && node.nodeType === 3 ? node : null;
  }

  function ensureUsDollarBefore(el) {
    if (!el || !el.parentNode) return;
    var prev = previousText(el);
    if (prev && /US\$/.test(prev.nodeValue)) return;
    if (prev && /USD/i.test(prev.nodeValue) && !/\d/.test(prev.nodeValue)) {
      prev.nodeValue = String(prev.nodeValue).replace(/USD/gi, "");
      if (!String(prev.nodeValue).trim()) el.parentNode.removeChild(prev);
    }
    el.parentNode.insertBefore(document.createTextNode("US$"), el);
  }

  function prefixUsDollars(el) {
    if (!el) return;
    if (el.matches && el.matches("li.td")) {
      var hook = el.querySelector(
        "#total_goods_price, .total_delivery_shipping_price, .total_tax, .settle_price"
      );
      if (hook) {
        prefixUsDollars(hook);
        return;
      }
    }

    var rawText = textOf(el);
    if (/customs/i.test(rawText) || !/\d/.test(rawText)) return;

    var numEl = el.querySelector && el.querySelector(".num");
    if (numEl) {
      var digits = parseMoney(numEl.textContent).toFixed(2);
      if (textOf(numEl) !== digits) numEl.textContent = digits;
      ensureUsDollarBefore(el);
      return;
    }

    if (/US\$/i.test(rawText)) return;
    if (
      el.id === "checkoutProductDiscount" ||
      el.id === "checkoutPromoDiscount" ||
      el.id === "checkoutCouponDiscount"
    ) {
      return;
    }
    el.textContent = parseMoney(rawText).toFixed(2);
    ensureUsDollarBefore(el);
  }

  function formatItemMoney(el) {
    if (!el) return;
    var rawText = textOf(el);
    if (!/\d/.test(rawText)) return;
    var numEl = el.querySelector && el.querySelector(".num");
    if (numEl) {
      if (!/^US\$/i.test(textOf(numEl))) {
        numEl.textContent = formatMoney(parseMoney(numEl.textContent));
      }
      return;
    }
    if (/^US\$/i.test(rawText) && !/USD/i.test(rawText)) return;
    el.textContent = formatMoney(parseMoney(rawText));
  }

  function normalizeCheckoutCurrency() {
    var card = document.querySelector(".checkout-summary-card");
    if (card) {
      stripUsdSuffix(card);
      card.querySelectorAll(
        "#total_goods_price, .total_delivery_shipping_price, .total_tax, .settle_price, #use_emoney"
      ).forEach(prefixUsDollars);
    }
    document.querySelectorAll(
      "#orderPaymentLayout .checkout-list-compare, #orderPaymentLayout .cart_list .total_p"
    ).forEach(function (el) {
      stripUsdSuffix(el);
      formatItemMoney(el);
    });
  }

  function readCartCoupon() {
    try {
      return JSON.parse(sessionStorage.getItem(COUPON_KEY) || "null");
    } catch (err) {
      return null;
    }
  }

  function buildCouponTitle(coupon) {
    var sale = String((coupon && coupon.sale) || "").trim();
    var name = String((coupon && coupon.name) || "").trim();
    var blob = (sale + " " + name).replace(/\s+/g, " ").trim();
    var pct = blob.match(/(\d+(?:\.\d+)?)\s*%/);
    if (pct) return String(pct[1]).replace(/\.0+$/, "") + "% OFF";
    var offName = name.match(/^\$?\s*([\d.,]+)\s*Off$/i);
    if (offName) {
      return "$" + String(offName[1]).replace(/\.0+$/, "") + " Off";
    }
    var usd =
      sale.match(/(?:US\$|\$)\s*([\d.,]+)/i) ||
      sale.match(/([\d.,]+)\s*USD/i);
    if (usd) {
      var amt = parseMoney(usd[1]);
      var neat = Number.isInteger(amt) ? String(amt) : amt.toFixed(2).replace(/\.00$/, "");
      return "$" + neat + " Off";
    }
    return sale || name || "Coupon";
  }

  function syncProductDiscount() {
    var total = 0;
    var rows = document.querySelectorAll("#orderPaymentLayout li.cart_goods");
    Array.prototype.forEach.call(rows, function (row) {
      var compare = parseMoney(row.getAttribute("data-cart-unit-compare"));
      var unit = parseMoney(row.getAttribute("data-cart-unit-price"));
      var ea = parseInt(row.getAttribute("data-cart-ea"), 10) || 0;
      if (compare > unit && ea > 0) {
        total += (compare - unit) * ea;
        return;
      }
      var del = row.querySelector(".checkout-list-compare");
      var sale = row.querySelector(".total_p");
      if (!del || !sale) return;
      var compareLine = parseMoney(del.textContent);
      var saleLine = parseMoney(sale.textContent);
      if (compareLine > saleLine) total += compareLine - saleLine;
    });

    total = Math.round(total * 100) / 100;
    var discountRow = document.querySelector(".checkout-summary-discount");
    var discountEl = document.getElementById("checkoutProductDiscount");
    var saveEl = document.querySelector("[data-checkout-save]");
    if (discountEl) {
      discountEl.textContent = total > 0 ? "- " + formatMoney(total) : formatMoney(0);
    }
    if (discountRow) {
      discountRow.hidden = total <= 0;
      if (total > 0) discountRow.removeAttribute("hidden");
    }
    if (saveEl) saveEl.textContent = formatMoney(total);
  }

  // #use_emoney is native Firstmall — populated by the Mileage card's
  // use_emoney()/use_all_emoney() buttons (order_subsection above the
  // summary), not by any template expression. Mirror the real amount into
  // the ORDER SUMMARY card's own Mileage Applied row, same pattern as
  // syncPromoCoupon does for promo/coupon.
  function syncMileageSummary() {
    var row = document.querySelector(".checkout-summary-mileage");
    var srcEl = document.getElementById("use_emoney");
    if (!row || !srcEl) return;
    var amount = parseMoney(textOf(srcEl));
    row.hidden = amount <= 0;
    if (amount > 0) row.removeAttribute("hidden");
  }

  function requestStateTax(name, code) {
    if (window.jQuery) {
      return window.jQuery.ajax({
        url: "/order/get_state_ajax",
        type: "GET",
        dataType: "json",
        data: { name: name || "", code: code || "" },
      });
    }
    return fetch(
      "/order/get_state_ajax?name=" +
        encodeURIComponent(name || "") +
        "&code=" +
        encodeURIComponent(code || "")
    ).then(function (res) {
      return res.json();
    });
  }

  function refreshStateTax() {
    var taxInput =
      document.getElementById("stateTax") ||
      document.querySelector("input[name='state_tax_input']");
    if (!taxInput) return;
    var nameEl =
      document.getElementById("stateSearchInput") ||
      document.querySelector("input[name='international_county_input']");
    var codeEl =
      document.getElementById("searchInputHidden") ||
      document.querySelector("input[name='international_county_code_input']");
    var name = nameEl ? String(nameEl.value || "").trim() : "";
    var code = codeEl ? String(codeEl.value || "").trim() : "";
    var match = name.match(/\(([^)]+)\)/);
    if (!code && match) code = match[1];
    if (!name && !code) return;
    requestStateTax(name, code)
      .then(function (res) {
        var tax = res && res[0] && res[0].tax != null ? res[0].tax : 0;
        taxInput.value = tax;
        if (typeof window.order_price_calculate === "function") {
          try {
            window.order_price_calculate();
          } catch (err) {}
        }
        setTimeout(refreshSummary, 80);
      })
      .catch(function () {});
  }

  function setSummaryRow(row, out, amount) {
    if (!row || !out) return;
    if (amount > 0) {
      out.textContent = "- " + formatMoney(amount);
      row.hidden = false;
      row.removeAttribute("hidden");
      return;
    }
    out.textContent = "";
    row.hidden = true;
  }

  function syncPromoCoupon() {
    var promoRow = document.querySelector(".checkout-summary-promo");
    var couponRow = document.querySelector(".checkout-summary-coupon");
    var promoOut = document.getElementById("checkoutPromoDiscount");
    var couponOut = document.getElementById("checkoutCouponDiscount");
    var promoLabel = document.querySelector("[data-checkout-promo-label]");
    var couponLabel = document.querySelector("[data-checkout-coupon-label]");
    var promoSrc = document.getElementById("total_promotion_goods_sale");
    var couponSrc = document.getElementById("total_coupon_sale");
    var promoInput = document.getElementById("cartpromotioncode");
    var coupon = readCartCoupon();
    var promoCode = promoInput ? String(promoInput.value || "").trim() : "";

    var promoAmt = parseMoney(textOf(promoSrc));
    var couponAmt = parseMoney(textOf(couponSrc));
    if (!couponAmt && coupon && coupon.sale) couponAmt = parseMoney(coupon.sale);

    if (promoLabel) {
      promoLabel.textContent = promoCode ? "Promo code (" + promoCode + ")" : "Promo code";
    }
    if (couponLabel) {
      couponLabel.textContent = coupon ? "Coupon (" + buildCouponTitle(coupon) + ")" : "Coupon";
    }

    setSummaryRow(promoRow, promoOut, promoAmt);
    if (promoCode && promoRow && promoAmt <= 0) {
      promoRow.hidden = false;
      promoRow.removeAttribute("hidden");
      if (promoOut && !promoOut.textContent) promoOut.textContent = formatMoney(0);
    }

    setSummaryRow(couponRow, couponOut, couponAmt);
    if (coupon && coupon.id && couponRow && couponAmt <= 0) {
      couponRow.hidden = false;
      couponRow.removeAttribute("hidden");
      if (couponOut && !couponOut.textContent) couponOut.textContent = formatMoney(0);
    }
  }

  function applyCartCoupon() {
    var coupon = readCartCoupon();
    if (!coupon || !coupon.id) return;
    var download = document.getElementById("download_seq");
    if (!download) return;
    if (!download.value) download.value = String(coupon.id);
  }

  function paintShippingFromSelectedMethod() {
    var selected =
      document.querySelector(".shipping_radio input[name='ship_set_list']:checked");
    if (!selected) return;
    var li = selected.closest("li");
    var priceEl = li && li.querySelector(".checkout-ship-price, span");
    var out = document.querySelector(
      ".checkout-summary-card .total_delivery_shipping_price"
    );
    if (!out || !priceEl) return;
    var amount = parseMoney(textOf(priceEl));
    var numEl = out.querySelector(".num");
    if (numEl) {
      numEl.textContent = amount.toFixed(2);
      ensureUsDollarBefore(out);
      return;
    }
    out.textContent = amount.toFixed(2);
    ensureUsDollarBefore(out);
  }

  function refreshSummary() {
    syncProductDiscount();
    syncPromoCoupon();
    syncMileageSummary();
    normalizeCheckoutCurrency();
  }

  function calculateWhenReady(tries) {
    tries = tries || 0;
    if (typeof window.order_price_calculate === "function") {
      try {
        window.order_price_calculate();
      } catch (err) {}
      setTimeout(refreshSummary, 80);
      return;
    }
    if (tries < 20) {
      setTimeout(function () {
        calculateWhenReady(tries + 1);
      }, 150);
    }
  }

  function paintSavedAddressTab() {
    var tabs = document.querySelectorAll(".settle_tab.delivery_choice > li");
    if (!tabs.length) return;
    tabs.forEach(function (tab, index) {
      tab.classList.toggle("current", index === 0);
      tab.classList.toggle("on", index === 0);
    });
    document.querySelectorAll(".delivery_selecter .settle_tab_contents").forEach(function (box, index) {
      box.style.display = index === 0 ? "block" : "none";
    });
  }

  function activateSavedAddressTab() {
    var tabs = document.querySelectorAll(".settle_tab.delivery_choice > li");
    if (!tabs.length) return;
    if (window.jQuery) {
      window.jQuery(tabs[0]).trigger("click");
      return;
    }
    paintSavedAddressTab();
  }

  function scheduleSavedAddressTab() {
    paintSavedAddressTab();
    window.setTimeout(activateSavedAddressTab, 0);
    window.setTimeout(paintSavedAddressTab, 50);
  }

  function patchAddressModify() {
    var original = window.address_modify;
    if (typeof original !== "function" || original._tpSavedTab) return;
    function wrapped(type) {
      original.apply(this, arguments);
      if (!type || type === "delivery") scheduleSavedAddressTab();
    }
    wrapped._tpSavedTab = true;
    window.address_modify = wrapped;
  }

  window.tpActivateSavedAddressTab = scheduleSavedAddressTab;
  patchAddressModify();

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }
    fn();
  }

  ready(function () {
    refreshSummary();
    applyCartCoupon();
    refreshStateTax();
    calculateWhenReady(0);
    patchAddressModify();
    paintSavedAddressTab();

    document.addEventListener("click", function (e) {
      var item = e.target && e.target.closest && e.target.closest(".payment_method_select > li");
      if (!item || e.target.closest("input, a, button")) return;
      var radio = item.querySelector("input[name='payment']");
      if (!radio || radio.disabled || radio.checked) return;
      radio.click();
    });

    document.addEventListener("change", function (e) {
      var input = e.target;
      if (!input) return;
      if (input.name === "ship_set_list") {
        paintShippingFromSelectedMethod();
        if (typeof window.order_price_calculate === "function") {
          try {
            window.order_price_calculate();
          } catch (err) {}
        }
        setTimeout(refreshSummary, 80);
        return;
      }
      if (
        input.id === "stateSearchInput" ||
        input.id === "searchInputHidden" ||
        input.id === "countrySearchInput" ||
        input.name === "international_county_input" ||
        input.name === "international_county_code_input"
      ) {
        refreshStateTax();
      }
    });

    var frame = document.querySelector("iframe[name='actionFrame']");
    if (frame) {
      frame.addEventListener("load", function () {
        if (typeof window.order_price_calculate === "function") {
          try {
            window.order_price_calculate();
          } catch (err) {}
        }
        setTimeout(refreshSummary, 50);
      });
    }

    var taxEl = document.querySelector(".checkout-summary-card .total_tax");
    if (taxEl && window.MutationObserver) {
      new MutationObserver(normalizeCheckoutCurrency).observe(taxEl, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    var emoneyEl = document.getElementById("use_emoney");
    if (emoneyEl && window.MutationObserver) {
      new MutationObserver(function () {
        syncMileageSummary();
        normalizeCheckoutCurrency();
      }).observe(emoneyEl, { childList: true, characterData: true, subtree: true });
    }

    var summary = document.querySelector(".checkout-summary-card .order_price_total");
    if (summary && window.MutationObserver) {
      var timer = null;
      new MutationObserver(function () {
        clearTimeout(timer);
        timer = setTimeout(normalizeCheckoutCurrency, 30);
      }).observe(summary, { childList: true, characterData: true, subtree: true });
    }
  });
})();
