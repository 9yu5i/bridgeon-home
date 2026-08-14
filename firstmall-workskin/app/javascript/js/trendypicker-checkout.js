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
    if (discountEl) {
      discountEl.textContent = total > 0 ? "- " + formatMoney(total) : formatMoney(0);
    }
    if (discountRow) {
      discountRow.hidden = total <= 0;
      if (total > 0) discountRow.removeAttribute("hidden");
    }
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

  function mileageCard() {
    return document.querySelector(".checkout-mileage-card");
  }

  function mileageErrorEl() {
    return document.querySelector(".checkout-mileage-error");
  }

  function availableMileage() {
    var card = mileageCard();
    if (card && card.getAttribute("data-available-emoney") != null) {
      var fromData = parseMoney(card.getAttribute("data-available-emoney"));
      if (fromData > 0) return fromData;
    }
    var label = document.querySelector(".checkout-mileage-available .trendy-01");
    return parseMoney(textOf(label));
  }

  function setMileageError(message) {
    var card = mileageCard();
    var err = mileageErrorEl();
    if (card) card.classList.toggle("is-error", !!message);
    if (!err) return;
    if (message) {
      err.textContent = message;
      err.hidden = false;
      err.removeAttribute("hidden");
      return;
    }
    err.textContent = "";
    err.hidden = true;
  }

  function keepMileageButtonsVisible() {
    document
      .querySelectorAll(
        ".checkout_mileage-row .emoney_input_button, .checkout_mileage-row .emoney_all_input_button"
      )
      .forEach(function (btn) {
        btn.classList.remove("hide", "dn");
        btn.hidden = false;
        btn.style.setProperty("display", "inline-flex", "important");
        btn.style.removeProperty("visibility");
        btn.style.removeProperty("opacity");
      });
  }

  function showMileageClear(show) {
    var clearBtn = document.querySelector(
      ".checkout_mileage-row .emoney_cancel_button"
    );
    if (!clearBtn) return;
    if (show) {
      clearBtn.classList.remove("hide", "dn");
      clearBtn.hidden = false;
      clearBtn.style.setProperty("display", "inline-flex", "important");
      return;
    }
    clearBtn.style.setProperty("display", "none", "important");
  }

  function watchMileageButtons() {
    var row = document.querySelector(".checkout_mileage-row");
    if (!row || row._tpMileageWatch) return;
    row._tpMileageWatch = true;
    if (!window.MutationObserver) return;
    new MutationObserver(function () {
      keepMileageButtonsVisible();
    }).observe(row, {
      attributes: true,
      subtree: true,
      attributeFilter: ["style", "class", "hidden"],
    });
  }

  function validateMileageInput(showError) {
    var view = document.querySelector(
      ".checkout-mileage-card input[name='emoney_view']"
    );
    var amount = parseMoney(view && view.value);
    var available = availableMileage();
    if (!(amount > 0)) {
      if (showError) {
        var emptyMsg =
          typeof window.getAlert === "function"
            ? window.getAlert("os040")
            : "Please enter the mileage amount.";
        setMileageError(emptyMsg || "Please enter the mileage amount.");
      } else {
        setMileageError("");
      }
      return false;
    }
    if (amount > available + 0.0001) {
      var overMsg =
        "You can use up to " + formatMoney(available) + " of your available mileage.";
      setMileageError(overMsg);
      return false;
    }
    setMileageError("");
    return true;
  }

  function alertMileage(message) {
    if (typeof window.openDialogAlert === "function") {
      try {
        window.openDialogAlert(message, "400", "140");
        return;
      } catch (err) {}
    }
    window.alert(message);
  }

  function patchMileageActions() {
    function runCalculate() {
      if (typeof window.order_price_calculate === "function") {
        try {
          window.order_price_calculate();
        } catch (err) {}
      }
    }

    function wrappedUse() {
      keepMileageButtonsVisible();
      if (!validateMileageInput(true)) {
        var err = mileageErrorEl();
        alertMileage(
          (err && err.textContent) || "Please check the mileage amount."
        );
        keepMileageButtonsVisible();
        return false;
      }
      var view = document.querySelector(
        ".checkout-mileage-card input[name='emoney_view']"
      );
      var hidden = document.querySelector(
        ".checkout-mileage-card input[name='emoney']"
      );
      var amount = parseMoney(view && view.value);
      if (hidden) hidden.value = String(amount);
      keepMileageButtonsVisible();
      showMileageClear(true);
      runCalculate();
      setTimeout(function () {
        keepMileageButtonsVisible();
        syncMileageSummary();
        refreshSummary();
      }, 80);
      setTimeout(keepMileageButtonsVisible, 300);
      return false;
    }

    function wrappedUseAll() {
      setMileageError("");
      var available = availableMileage();
      if (!(available > 0)) {
        var emptyMsg = "No mileage available to use.";
        setMileageError(emptyMsg);
        alertMileage(emptyMsg);
        keepMileageButtonsVisible();
        return false;
      }
      var view = document.querySelector(
        ".checkout-mileage-card input[name='emoney_view']"
      );
      var hidden = document.querySelector(
        ".checkout-mileage-card input[name='emoney']"
      );
      var allFlag = document.querySelector(
        ".checkout-mileage-card input[name='emoney_all']"
      );
      if (view) view.value = available.toFixed(2);
      if (hidden) hidden.value = String(available);
      if (allFlag) allFlag.value = "y";
      keepMileageButtonsVisible();
      showMileageClear(true);
      runCalculate();
      setTimeout(function () {
        keepMileageButtonsVisible();
        syncMileageSummary();
        refreshSummary();
      }, 80);
      setTimeout(keepMileageButtonsVisible, 300);
      return false;
    }

    function wrappedCancel() {
      setMileageError("");
      var view = document.querySelector(
        ".checkout-mileage-card input[name='emoney_view']"
      );
      var hidden = document.querySelector(
        ".checkout-mileage-card input[name='emoney']"
      );
      var allFlag = document.querySelector(
        ".checkout-mileage-card input[name='emoney_all']"
      );
      if (view) view.value = "0";
      if (hidden) hidden.value = "0";
      if (allFlag) allFlag.value = "";
      keepMileageButtonsVisible();
      showMileageClear(false);
      runCalculate();
      setTimeout(function () {
        keepMileageButtonsVisible();
        syncMileageSummary();
        refreshSummary();
      }, 80);
      return false;
    }

    wrappedUse._tpMileage = true;
    wrappedUseAll._tpMileage = true;
    wrappedCancel._tpMileage = true;
    window.use_emoney = wrappedUse;
    window.use_all_emoney = wrappedUseAll;
    window.cancel_emoney = wrappedCancel;

    document
      .querySelectorAll(
        ".checkout_mileage-row .emoney_input_button, .checkout_mileage-row .emoney_all_input_button, .checkout_mileage-row .emoney_cancel_button"
      )
      .forEach(function (btn) {
        btn.setAttribute("onclick", "return false;");
        if (btn._tpMileageClick) return;
        btn._tpMileageClick = true;
        btn.addEventListener(
          "click",
          function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (btn.classList.contains("emoney_input_button")) wrappedUse();
            else if (btn.classList.contains("emoney_all_input_button"))
              wrappedUseAll();
            else if (btn.classList.contains("emoney_cancel_button"))
              wrappedCancel();
            keepMileageButtonsVisible();
          },
          true
        );
      });
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

  // "You save" combines every discount source shown in the summary card:
  // product discount, promo code, coupon, and mileage applied.
  function syncCartSave() {
    var saveEl = document.querySelector("[data-checkout-save]");
    if (!saveEl) return;
    var product =
      parseMoney(textOf(document.getElementById("checkoutProductDiscount"))) ||
      parseMoney(textOf(document.querySelector(".checkout-summary-discount .total_sales_price")));
    var promo =
      parseMoney(textOf(document.getElementById("checkoutPromoDiscount"))) ||
      parseMoney(textOf(document.getElementById("total_promotion_goods_sale")));
    var coupon =
      parseMoney(textOf(document.getElementById("checkoutCouponDiscount"))) ||
      parseMoney(textOf(document.getElementById("total_coupon_sale")));
    var mileage = parseMoney(textOf(document.getElementById("use_emoney")));
    var total = Math.round((product + promo + coupon + mileage) * 100) / 100;
    saveEl.textContent = formatMoney(total);
  }

  function setSettleTab(tab) {
    var tabs = document.querySelectorAll(".settle_tab.delivery_choice > li");
    if (!tabs.length || !tab) return;
    tabs.forEach(function (item) {
      item.classList.remove("current", "on");
    });
    tab.classList.add("current");
    var index = Array.prototype.indexOf.call(tabs, tab);
    document.querySelectorAll(".delivery_selecter .settle_tab_contents").forEach(function (box, i) {
      box.style.display = i === index ? "block" : "none";
    });
    window.setTimeout(bindCheckoutCountrySelect, 0);
    window.setTimeout(bindCheckoutStateSelect, 0);
    window.setTimeout(bindDeliveryMessageToggle, 0);
  }

  var savedTabTimers = [];

  function clearSavedTabTimers() {
    while (savedTabTimers.length) {
      window.clearTimeout(savedTabTimers.pop());
    }
  }

  function activateSavedAddressTab() {
    var tabs = document.querySelectorAll(".settle_tab.delivery_choice > li");
    if (!tabs.length) return;
    setSettleTab(tabs[0]);
  }

  function scheduleSavedAddressTab() {
    clearSavedTabTimers();
    activateSavedAddressTab();
    savedTabTimers.push(window.setTimeout(activateSavedAddressTab, 0));
    savedTabTimers.push(window.setTimeout(activateSavedAddressTab, 80));
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

  function bindAddressNameSync() {
    var visible = document.querySelector(
      ".delivery_input input[name='address_description']"
    );
    var hidden = document.querySelector(
      ".delivery_input input[name='address_description_input']"
    );
    if (!visible || !hidden || visible._tpAddressNameSync) return;
    visible._tpAddressNameSync = true;
    var sync = function () {
      hidden.value = visible.value;
    };
    visible.addEventListener("input", sync);
    visible.addEventListener("change", sync);
    sync();
  }

  var ADDRESS_REGION_OPTIONS = {
    australia: [
      "Australian Capital Territory",
      "New South Wales",
      "Northern Territory",
      "Queensland",
      "South Australia",
      "Tasmania",
      "Victoria",
      "Western Australia",
    ],
    canada: [
      "Alberta",
      "British Columbia",
      "Manitoba",
      "New Brunswick",
      "Newfoundland and Labrador",
      "Northwest Territories",
      "Nova Scotia",
      "Nunavut",
      "Ontario",
      "Prince Edward Island",
      "Quebec",
      "Saskatchewan",
      "Yukon",
    ],
    "south korea": [
      "Busan",
      "Chungcheongbuk-do",
      "Chungcheongnam-do",
      "Daegu",
      "Daejeon",
      "Gangwon-do",
      "Gwangju",
      "Gyeonggi-do",
      "Gyeongsangbuk-do",
      "Gyeongsangnam-do",
      "Incheon",
      "Jeju-do",
      "Jeollabuk-do",
      "Jeollanam-do",
      "Sejong",
      "Seoul",
      "Ulsan",
    ],
    "united kingdom": ["England", "Northern Ireland", "Scotland", "Wales"],
    "united states": [
      "Alabama",
      "Alaska",
      "Arizona",
      "Arkansas",
      "California",
      "Colorado",
      "Connecticut",
      "Delaware",
      "District of Columbia",
      "Florida",
      "Georgia",
      "Hawaii",
      "Idaho",
      "Illinois",
      "Indiana",
      "Iowa",
      "Kansas",
      "Kentucky",
      "Louisiana",
      "Maine",
      "Maryland",
      "Massachusetts",
      "Michigan",
      "Minnesota",
      "Mississippi",
      "Missouri",
      "Montana",
      "Nebraska",
      "Nevada",
      "New Hampshire",
      "New Jersey",
      "New Mexico",
      "New York",
      "North Carolina",
      "North Dakota",
      "Ohio",
      "Oklahoma",
      "Oregon",
      "Pennsylvania",
      "Rhode Island",
      "South Carolina",
      "South Dakota",
      "Tennessee",
      "Texas",
      "Utah",
      "Vermont",
      "Virginia",
      "Washington",
      "West Virginia",
      "Wisconsin",
      "Wyoming",
    ],
  };

  function resolveCheckoutRegionKey(countryValue) {
    var value = String(countryValue || "")
      .replace(/[\[\].,]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    if (
      /^(u s a|usa|us|u s)$/.test(value) ||
      value.indexOf("united states") !== -1 ||
      value === "america"
    ) {
      return "united states";
    }
    if (
      /^(uk|u k|gb|gbr|england)$/.test(value) ||
      value.indexOf("united kingdom") !== -1
    ) {
      return "united kingdom";
    }
    if (
      value.indexOf("south korea") !== -1 ||
      value === "korea" ||
      value === "kor"
    ) {
      return "south korea";
    }
    if (value.indexOf("australia") !== -1 || value === "aus") return "australia";
    if (value.indexOf("canada") !== -1 || value === "can") return "canada";
    return value;
  }

  function bindCheckoutCountrySelect() {
    var wrap = document.querySelector(
      ".delivery_input .country-select-wrapper, .checkout-consignee-card .country-select-wrapper"
    );
    var input = document.getElementById("countrySearchInput");
    var hidden = document.getElementById("countrySearchInputHidden");
    var list = document.getElementById("countryOptionsList");
    if (!wrap || !input || !list) return;

    var legacyTrigger = wrap.querySelector(".checkout-native-select-trigger");
    if (legacyTrigger) legacyTrigger.parentNode.removeChild(legacyTrigger);
    wrap.classList.remove("checkout-native-select", "checkout-country-select");
    input.classList.remove("checkout-country-source");
    list.classList.remove("checkout-native-select-menu");
    input.readOnly = true;
    input.classList.remove("complete");

    var chevron = wrap.querySelector(".checkout-select-chevron");
    if (!chevron) {
      chevron = document.createElement("span");
      chevron.className = "checkout-select-chevron";
      chevron.setAttribute("aria-hidden", "true");
      wrap.appendChild(chevron);
    }

    if (input._tpCountryBound) return;
    input._tpCountryBound = true;

    if (window.jQuery) {
      window.jQuery(input).off();
      window.jQuery(list).off();
      window.jQuery(list).find("li").off();
      window.jQuery(document).off("click", "#countryOptionsList li");
      window.jQuery(document).off("mousedown", "#countryOptionsList li");
      window.jQuery(document).off("focus", "#countrySearchInput");
      window.jQuery(document).off("blur", "#countrySearchInput");
      window.jQuery(document).off("click", "#countrySearchInput");
      window.jQuery(document).off("mousedown", "#countrySearchInput");
      window.jQuery(document).off("keyup", "#countrySearchInput");
      window.jQuery(document).off("input", "#countrySearchInput");
    }

    list.setAttribute("role", "listbox");
    input.setAttribute("aria-haspopup", "listbox");
    input.setAttribute("autocomplete", "off");

    function labelOf(item) {
      if (!item) return "";
      var name = item.getAttribute("data-name");
      if (name) return String(name).trim();
      var span = item.querySelector("span");
      if (span) return String(span.textContent || "").trim();
      return String(item.textContent || "").replace(/\s+/g, " ").trim();
    }

    function isOpen() {
      if (wrap.classList.contains("is-open")) return true;
      if (!list.classList.contains("country-options-hidden")) return true;
      try {
        return window.getComputedStyle(list).display !== "none";
      } catch (err) {
        return false;
      }
    }

    function syncChevron(open) {
      if (!chevron) return;
      chevron.style.setProperty(
        "transform",
        open
          ? "translateY(-50%) rotate(180deg)"
          : "translateY(-50%) rotate(0deg)",
        "important"
      );
    }

    function setOpen(open) {
      open = !!open;
      wrap.classList.toggle("is-open", open);
      input.classList.toggle("is-dropdown-open", open);
      list.classList.toggle("country-options-hidden", !open);
      if (open) list.style.setProperty("display", "block", "important");
      else list.style.setProperty("display", "none", "important");
      input.setAttribute("aria-expanded", open ? "true" : "false");
      syncChevron(open);

      if (open) {
        document
          .querySelectorAll(".checkout-native-select.is-open")
          .forEach(function (openWrap) {
            openWrap.classList.remove("is-open");
          });
        var shipRoot = document.getElementById("shipMessage");
        if (shipRoot) {
          shipRoot.classList.remove("is-open");
          var shipField = shipRoot.querySelector(".checkout-select-field");
          if (shipField) shipField.classList.remove("is-open");
          var shipList = shipRoot.querySelector(".add_message");
          if (shipList) shipList.style.setProperty("display", "none", "important");
        }
      }
    }

    function syncValue(label, item, silent) {
      var next = String(label || "").trim();
      var code = item
        ? item.getAttribute("data-key") ||
          item.getAttribute("data-nation") ||
          next
        : next;
      input.value = next;
      if (hidden) hidden.value = code;
      var countryHidden = document.querySelector(
        ".delivery_input input[name='international_country']"
      );
      if (countryHidden) countryHidden.value = next;
      list.querySelectorAll("li").forEach(function (li) {
        var selected = li === item || labelOf(li) === next;
        li.classList.toggle("is-selected", selected);
        li.setAttribute("aria-selected", selected ? "true" : "false");
      });
      if (!silent) {
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        if (window.jQuery) {
          window.jQuery(input).trigger("input").trigger("change");
        }
      }
    }

    var current = String(input.value || "").trim();
    var matched = null;
    list.querySelectorAll("li").forEach(function (li) {
      if (labelOf(li).toLowerCase() === current.toLowerCase()) matched = li;
    });
    syncValue(current, matched, true);
    setOpen(false);

    // Toggle on pointerdown so a second press always closes.
    input.addEventListener(
      "pointerdown",
      function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === "function") {
          event.stopImmediatePropagation();
        }
        setOpen(!isOpen());
      },
      true
    );

    input.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === "function") {
          event.stopImmediatePropagation();
        }
      },
      true
    );

    input.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
          return;
        }
        if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setOpen(true);
        }
      },
      true
    );

    input.addEventListener(
      "focus",
      function (event) {
        if (typeof event.stopImmediatePropagation === "function") {
          event.stopImmediatePropagation();
        }
      },
      true
    );
    input.addEventListener(
      "blur",
      function (event) {
        if (typeof event.stopImmediatePropagation === "function") {
          event.stopImmediatePropagation();
        }
      },
      true
    );

    list.addEventListener(
      "mousedown",
      function (event) {
        event.preventDefault();
      },
      true
    );

    list.addEventListener(
      "click",
      function (event) {
        var item =
          event.target && event.target.closest && event.target.closest("li");
        if (!item || !list.contains(item)) return;
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === "function") {
          event.stopImmediatePropagation();
        }
        syncValue(labelOf(item), item, false);
        setOpen(false);
        window.setTimeout(function () {
          setOpen(false);
        }, 0);
        window.setTimeout(function () {
          setOpen(false);
        }, 80);
      },
      true
    );

    document.addEventListener(
      "pointerdown",
      function (event) {
        if (!wrap.contains(event.target)) setOpen(false);
      },
      true
    );

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) {
        setOpen(false);
        input.focus();
      }
    });
  }

  function bindDeliveryMessageToggle() {
    var root = document.getElementById("shipMessage");
    var field = root && root.querySelector(".checkout-select-field");
    var input = root && root.querySelector(".ship_message_txt");
    var list = root && root.querySelector(".add_message");
    if (!root || !input || !list || input._tpDeliveryMessage) return;
    input._tpDeliveryMessage = true;

    var wasOpenOnPointerDown = false;

    function isOpen() {
      return root.classList.contains("is-open");
    }

    function setOpen(open) {
      root.classList.toggle("is-open", !!open);
      if (field) field.classList.toggle("is-open", !!open);
      if (open) list.style.setProperty("display", "block", "important");
      else list.style.setProperty("display", "none", "important");
      input.setAttribute("aria-expanded", open ? "true" : "false");
    }

    if (window.jQuery) {
      window.jQuery(input).off();
      window.jQuery(list).off();
      window.jQuery(list).find("li").off();
      window.jQuery(document).off("focus", "#shipMessage .ship_message_txt");
      window.jQuery(document).off("blur", "#shipMessage .ship_message_txt");
      window.jQuery(document).off("mousedown", ".add_message>li");
      window.jQuery(document).off("click", ".add_message li");
    }

    input.setAttribute("aria-haspopup", "listbox");
    setOpen(false);

    input.addEventListener(
      "pointerdown",
      function () {
        wasOpenOnPointerDown = isOpen();
      },
      true
    );

    input.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        event.stopPropagation();
        setOpen(!wasOpenOnPointerDown);
      },
      true
    );

    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        setOpen(true);
      }
    });

    list.addEventListener(
      "mousedown",
      function (e) {
        var item = e.target && e.target.closest && e.target.closest("li");
        if (!item || !list.contains(item)) return;
        e.preventDefault();
        e.stopPropagation();
        var html = item.innerHTML || "";
        var cleaned = html.replace(
          /^\s*<span class="lately desc">[^<]*<\/span>\s*/i,
          ""
        );
        var tmp = document.createElement("div");
        tmp.innerHTML = cleaned;
        input.value = String(tmp.textContent || "")
          .replace(/\s+/g, " ")
          .trim();
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        setOpen(false);
      },
      true
    );

    document.addEventListener(
      "pointerdown",
      function (e) {
        if (!isOpen()) return;
        if (root.contains(e.target)) return;
        setOpen(false);
      },
      true
    );
  }

  function forceShowCheckoutStateField() {
    var row = document.querySelector(".checkout-state-zip-row");
    var field = document.querySelector(".checkout-state-field");
    var wrap = document.querySelector("[data-checkout-state-wrap]");
    var trigger = wrap && wrap.querySelector(".realtrend-select-trigger");
    [row, field, wrap].forEach(function (el) {
      if (!el) return;
      el.classList.remove("hide");
      if (el.style) {
        el.style.removeProperty("visibility");
        el.style.removeProperty("opacity");
      }
    });
    if (field) {
      field.style.setProperty("display", "grid", "important");
    }
    if (wrap) {
      wrap.style.setProperty("display", "block", "important");
    }
    if (trigger && !wrap.classList.contains("is-text-mode")) {
      trigger.hidden = false;
      trigger.style.setProperty("display", "flex", "important");
      trigger.style.setProperty("pointer-events", "auto", "important");
      trigger.style.setProperty("visibility", "visible", "important");
    }
  }

  function bindCheckoutStateSelect() {
    forceShowCheckoutStateField();
    var field = document.querySelector(".checkout-state-field");
    var wrap = document.querySelector("[data-checkout-state-wrap]");
    var stateInput = document.getElementById("stateSearchInput");
    var stateCode = document.getElementById("searchInputHidden");
    var textInput = document.querySelector(
      ".delivery_input input[name='international_county_text_input']"
    );
    var countryInput = document.getElementById("countrySearchInput");
    var countryList = document.getElementById("countryOptionsList");
    var legacyList = document.getElementById("stateOptionsList");
    if (!wrap || !stateInput) return;

    var trigger = wrap.querySelector(".realtrend-select-trigger");
    var valueEl = wrap.querySelector(".realtrend-select-value");
    var menu = wrap.querySelector("ul.realtrend-select-menu");

    if (!trigger) {
      trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "realtrend-select-trigger";
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");
      valueEl = document.createElement("span");
      valueEl.className = "realtrend-select-value";
      valueEl.textContent = "Select state / province";
      trigger.appendChild(valueEl);
      wrap.insertBefore(trigger, wrap.firstChild);
    }
    if (!valueEl) {
      valueEl = trigger.querySelector(".realtrend-select-value");
      if (!valueEl) {
        valueEl = document.createElement("span");
        valueEl.className = "realtrend-select-value";
        valueEl.textContent = "Select state / province";
        trigger.appendChild(valueEl);
      }
    }
    if (!menu) {
      menu = document.createElement("ul");
      menu.className = "realtrend-select-menu state-options";
      menu.setAttribute("role", "listbox");
      wrap.insertBefore(menu, trigger.nextSibling);
    }

    wrap.classList.add("checkout-native-select", "realtrend-select-wrap");
    stateInput.classList.add("checkout-state-source", "realtrend-select-native");
    stateInput.readOnly = true;
    stateInput.tabIndex = -1;
    stateInput.setAttribute("aria-hidden", "true");
    if (legacyList) {
      legacyList.classList.add("options-hidden");
      legacyList.hidden = true;
      legacyList.style.setProperty("display", "none", "important");
    }

    function hideMirrorInputs() {
      stateInput.classList.add("hide", "checkout-state-source", "realtrend-select-native");
      stateInput.style.setProperty("position", "absolute", "important");
      stateInput.style.setProperty("width", "1px", "important");
      stateInput.style.setProperty("height", "1px", "important");
      stateInput.style.setProperty("opacity", "0", "important");
      stateInput.style.setProperty("pointer-events", "none", "important");
      stateInput.style.setProperty("border", "0", "important");
      stateInput.style.setProperty("display", "none", "important");
      if (textInput && !wrap.classList.contains("is-text-mode")) {
        textInput.classList.add("hide");
        textInput.style.setProperty("display", "none", "important");
        textInput.style.setProperty("pointer-events", "none", "important");
      }
    }

    function closeMenu() {
      wrap.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      menu.hidden = true;
      menu.style.setProperty("display", "none", "important");
    }

    function setOpen(open) {
      if (wrap.classList.contains("is-text-mode")) return;
      open = !!open;
      wrap.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      menu.hidden = !open;
      if (open) {
        menu.style.setProperty("display", "block", "important");
        menu.style.setProperty("visibility", "visible", "important");
        menu.style.setProperty("z-index", "80", "important");
      } else {
        menu.style.setProperty("display", "none", "important");
      }
    }

    function setStateValue(nextValue, silent) {
      var value = String(nextValue || "").trim();
      stateInput.value = value;
      if (stateCode) stateCode.value = value;
      if (textInput) textInput.value = value;
      valueEl.textContent = value || "Select state / province";
      menu.querySelectorAll("li").forEach(function (item) {
        var selected = item.getAttribute("data-value") === value;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-selected", selected ? "true" : "false");
      });
      if (!silent) {
        stateInput.dispatchEvent(new Event("input", { bubbles: true }));
        stateInput.dispatchEvent(new Event("change", { bubbles: true }));
        refreshStateTax();
      }
    }

    function buildMenu(regions, current) {
      while (menu.firstChild) menu.removeChild(menu.firstChild);
      regions.forEach(function (region) {
        var item = document.createElement("li");
        item.setAttribute("role", "option");
        item.setAttribute("data-value", region);
        item.textContent = region;
        item.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          setStateValue(region);
          setOpen(false);
          trigger.focus();
        });
        menu.appendChild(item);
      });
      setStateValue(current, true);
    }

    function normalizeStateLabel(value) {
      return String(value || "")
        .replace(/\s*\([^)]*\)\s*$/, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    }

    // The country list renders {kr_nation} as each option's label, which is
    // the localized name, not the English one resolveCheckoutRegionKey()
    // matches on — so the visible value alone never resolves to a region
    // list. data-nation carries Firstmall's canonical nation_str (the same
    // value chg_shipping_nation() takes, e.g. KOREA), so use it as a fallback.
    function selectedCountryCode() {
      if (!countryList) return "";
      var selected = countryList.querySelector("li.is-selected");
      if (!selected) return "";
      return String(selected.getAttribute("data-nation") || "").trim();
    }

    function refreshStateField() {
      forceShowCheckoutStateField();
      var countryValue = countryInput ? countryInput.value : "";
      var countryCode = selectedCountryCode();
      var regions =
        ADDRESS_REGION_OPTIONS[resolveCheckoutRegionKey(countryValue)] ||
        ADDRESS_REGION_OPTIONS[resolveCheckoutRegionKey(countryCode)] ||
        [];
      var current = String(
        stateInput.value || (textInput && textInput.value) || ""
      ).trim();
      if (regions.length) {
        wrap.classList.remove("is-text-mode");
        if (field) field.classList.remove("is-text-mode");
        trigger.hidden = false;
        trigger.style.setProperty("display", "flex", "important");
        trigger.style.setProperty("pointer-events", "auto", "important");
        hideMirrorInputs();
        var currentKey = normalizeStateLabel(current);
        var matched = regions.filter(function (region) {
          return normalizeStateLabel(region) === currentKey;
        })[0];
        var cleaned = current.replace(/\s*\([^)]*\)\s*$/, "").trim();
        buildMenu(regions, matched || cleaned || "");
        if (matched) setStateValue(matched, true);
        else if (cleaned) {
          var soft = regions.filter(function (region) {
            return normalizeStateLabel(region) === normalizeStateLabel(cleaned);
          })[0];
          setStateValue(soft || cleaned, true);
        }
        return;
      }
      wrap.classList.add("is-text-mode");
      if (field) field.classList.add("is-text-mode");
      closeMenu();
      trigger.hidden = true;
      trigger.style.setProperty("display", "none", "important");
      if (textInput) {
        textInput.classList.remove("hide");
        textInput.style.removeProperty("display");
        textInput.style.removeProperty("pointer-events");
        // Country decides whether this is a picker or a free-text box, so
        // when nothing is chosen yet say that rather than showing an empty
        // field with no hint about why there is no list.
        textInput.placeholder =
          countryValue || countryCode
            ? "State / Province"
            : "Select a country first";
        if (!textInput.value && current) textInput.value = current;
      }
      setStateValue(textInput ? textInput.value : current, true);
    }

    // Expose the opener on the element so the delegated listener below can
    // drive whichever wrapper was actually clicked.
    wrap._tpSetOpen = setOpen;

    // Delegated on document in the CAPTURE phase, registered once. An
    // onclick property on the button itself is lost whenever anything
    // re-renders the consignee form, and a bubble-phase listener can be
    // killed by any handler in between that calls stopPropagation. Capturing
    // at the document root runs before both, so the trigger stays clickable
    // no matter what else the page does to this subtree.
    if (!window._tpStateTriggerDelegated) {
      window._tpStateTriggerDelegated = true;
      document.addEventListener(
        "click",
        function (event) {
          var target = event.target;
          if (!target || !target.closest) return;
          var btn = target.closest(
            ".checkout-state-field .realtrend-select-trigger"
          );
          if (!btn) return;
          var clicked = btn.closest("[data-checkout-state-wrap]");
          if (!clicked || typeof clicked._tpSetOpen !== "function") return;
          event.preventDefault();
          event.stopPropagation();
          if (clicked.classList.contains("is-text-mode")) return;
          var willOpen = !clicked.classList.contains("is-open");
          document
            .querySelectorAll(
              ".country-select-wrapper.is-open, #shipMessage.is-open"
            )
            .forEach(function (openEl) {
              openEl.classList.remove("is-open");
            });
          document
            .querySelectorAll(".checkout-native-select.is-open")
            .forEach(function (other) {
              if (other !== clicked) other.classList.remove("is-open");
            });
          clicked._tpSetOpen(willOpen);
        },
        true
      );
    }

    if (wrap._tpStateBound) {
      forceShowCheckoutStateField();
      hideMirrorInputs();
      wrap._tpRefreshState = refreshStateField;
      refreshStateField();
      return;
    }
    wrap._tpStateBound = true;
    wrap._tpRefreshState = refreshStateField;

    if (textInput && !textInput._tpStateTextBound) {
      textInput._tpStateTextBound = true;
      textInput.addEventListener("input", function () {
        setStateValue(textInput.value);
      });
      textInput.addEventListener("change", function () {
        setStateValue(textInput.value);
      });
    }

    if (countryInput && !countryInput._tpStateCountryBound) {
      countryInput._tpStateCountryBound = true;
      countryInput.addEventListener("change", refreshStateField);
      countryInput.addEventListener("input", refreshStateField);
    }
    if (countryList && !countryList._tpStateCountryBound) {
      countryList._tpStateCountryBound = true;
      countryList.addEventListener("click", function () {
        window.setTimeout(refreshStateField, 0);
        window.setTimeout(refreshStateField, 80);
      });
    }

    if (!window._tpStateOutsideClose) {
      window._tpStateOutsideClose = true;
      document.addEventListener("click", function (event) {
        var openWrap = document.querySelector(
          "[data-checkout-state-wrap].is-open"
        );
        if (!openWrap) return;
        if (openWrap.contains(event.target)) return;
        openWrap.classList.remove("is-open");
        var openMenu = openWrap.querySelector("ul.realtrend-select-menu");
        var openTrigger = openWrap.querySelector(".realtrend-select-trigger");
        if (openMenu) {
          openMenu.hidden = true;
          openMenu.style.setProperty("display", "none", "important");
        }
        if (openTrigger) openTrigger.setAttribute("aria-expanded", "false");
      });
      document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") return;
        var openWrap = document.querySelector(
          "[data-checkout-state-wrap].is-open"
        );
        if (!openWrap) return;
        openWrap.classList.remove("is-open");
        var openMenu = openWrap.querySelector("ul.realtrend-select-menu");
        if (openMenu) {
          openMenu.hidden = true;
          openMenu.style.setProperty("display", "none", "important");
        }
      });
    }

    hideMirrorInputs();
    refreshStateField();
    window.setTimeout(refreshStateField, 0);
    window.setTimeout(refreshStateField, 400);
    window.setTimeout(refreshStateField, 1000);
  }

  function resetNewAddressForm() {
    var form = document.querySelector(".delivery_selecter .delivery_input");
    if (!form) return;

    form.querySelectorAll("input").forEach(function (input) {
      // These hidden orderer fields are source data for "Same as orderer",
      // not values belonging to the new shipping address form.
      if (input.closest(".order_user_info")) return;
      // Page-level shipping config consumed by chg_shipping_nation.
      if (input.name === "default_address_nation") return;

      if (input.type === "checkbox" || input.type === "radio") {
        input.checked = false;
        return;
      }

      input.value = "";
    });

    // This is a checkout contract value, not user-entered address data.
    var taxBillingMethod = form.querySelector("input[name='tax_billing_method']");
    if (taxBillingMethod) taxBillingMethod.value = "ddu";

    form.querySelectorAll(
      ".country-options li.is-selected, .state-options li.is-selected"
    ).forEach(function (item) {
      item.classList.remove("is-selected");
      item.removeAttribute("aria-selected");
    });

    var stateValue = form.querySelector(".realtrend-select-value");
    if (stateValue) stateValue.textContent = "Select state / province";

    var sameAsOrderer = document.getElementById("same_as_ordered_checkbox");
    if (sameAsOrderer) sameAsOrderer.checked = false;
  }

  var newAddressResetTimers = [];

  // Stop the deferred resets as soon as the shopper actually types, so a slow
  // legacy callback never wipes real input.
  function bindNewAddressResetGuard() {
    var form = document.querySelector(".delivery_selecter .delivery_input");
    if (!form || form._tpResetGuard) return;
    form._tpResetGuard = true;
    ["input", "change"].forEach(function (name) {
      form.addEventListener(name, function (event) {
        if (!event.isTrusted) return;
        clearNewAddressResetTimers();
      });
    });
  }

  // The original Firstmall tab handler refills the form from the default
  // address after our capture-phase listener, so repeat the reset once the
  // legacy handlers and their deferred callbacks have settled.
  function clearNewAddressResetTimers() {
    while (newAddressResetTimers.length) {
      window.clearTimeout(newAddressResetTimers.pop());
    }
  }

  function scheduleNewAddressReset() {
    clearNewAddressResetTimers();
    bindNewAddressResetGuard();
    resetNewAddressForm();
    [0, 60, 200, 500].forEach(function (delay) {
      newAddressResetTimers.push(
        window.setTimeout(resetNewAddressForm, delay)
      );
    });
  }

  // The saved-address list is re-rendered by ajax, so delegate from document
  // instead of binding to the cards themselves.
  function bindSavedAddressCards() {
    if (window._tpSavedAddressCards) return;
    window._tpSavedAddressCards = true;
    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || !target.closest) return;
      var card = target.closest(".ul_delivery > li");
      if (!card) return;
      // Edit and Delete keep their own actions.
      if (target.closest("a, button, .btn_x1")) return;
      // A label or the radio itself already reaches the input natively.
      if (target.closest("label, input")) return;

      var radio = card.querySelector("input[name='select_address']");
      if (!radio || radio.checked) return;
      radio.click();
    });
  }

  function bindSettleTabs() {
    var tabs = document.querySelectorAll(".settle_tab.delivery_choice > li");
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener(
        "click",
        function () {
          clearSavedTabTimers();
          if (Array.prototype.indexOf.call(tabs, tab) === 1) {
            scheduleNewAddressReset();
          }
          setSettleTab(tab);
          window.setTimeout(function () {
            setSettleTab(tab);
          }, 0);
        },
        true
      );
    });
  }

  function refreshSummary() {
    syncProductDiscount();
    syncPromoCoupon();
    syncMileageSummary();
    syncCartSave();
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
    patchMileageActions();
    keepMileageButtonsVisible();
    watchMileageButtons();
    patchAddressModify();
    bindSettleTabs();
    bindSavedAddressCards();
    bindAddressNameSync();
    bindCheckoutCountrySelect();
    bindCheckoutStateSelect();
    bindDeliveryMessageToggle();
    scheduleSavedAddressTab();
    window.setTimeout(patchMileageActions, 300);
    window.setTimeout(keepMileageButtonsVisible, 300);
    window.setTimeout(watchMileageButtons, 300);
    window.setTimeout(patchAddressModify, 300);
    window.setTimeout(bindAddressNameSync, 400);
    window.setTimeout(bindCheckoutCountrySelect, 400);
    window.setTimeout(bindCheckoutStateSelect, 400);
    window.setTimeout(bindDeliveryMessageToggle, 400);
    window.setTimeout(refreshSummary, 400);
    window.setTimeout(function () {
      if (!window.jQuery) return;
      window.jQuery("#shipMessage .ship_message_txt").off("focus blur click mousedown");
      window.jQuery(document).off("focus", "#shipMessage .ship_message_txt");
      window.jQuery(document).off("blur", "#shipMessage .ship_message_txt");
      window.jQuery(document).off("mousedown", ".add_message>li");
      window.jQuery(document).off("click", ".add_message li");
      window.jQuery("#countrySearchInput").off();
      window.jQuery(document).off("focus", "#countrySearchInput");
      window.jQuery(document).off("blur", "#countrySearchInput");
      window.jQuery(document).off("click", "#countrySearchInput");
      window.jQuery(document).off("mousedown", "#countrySearchInput");
      window.jQuery(document).off("keyup", "#countrySearchInput");
      window.jQuery(document).off("input", "#countrySearchInput");
      window.jQuery("#countryOptionsList").off();
      window.jQuery("#countryOptionsList li").off();
      window.jQuery(document).off("click", "#countryOptionsList li");
      window.jQuery(document).off("mousedown", "#countryOptionsList li");
      bindCheckoutCountrySelect();
      patchMileageActions();
      keepMileageButtonsVisible();
    }, 1000);
    window.setTimeout(function () {
      if (!window.jQuery) return;
      window.jQuery("#countrySearchInput").off();
      window.jQuery(document).off("focus blur click mousedown keyup input", "#countrySearchInput");
      bindCheckoutCountrySelect();
    }, 2000);

    var viewInput = document.querySelector(
      ".checkout-mileage-card input[name='emoney_view']"
    );
    if (viewInput) {
      viewInput.addEventListener("input", function () {
        validateMileageInput(false);
      });
      viewInput.addEventListener("change", function () {
        validateMileageInput(true);
      });
    }

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
        syncCartSave();
        normalizeCheckoutCurrency();
      }).observe(emoneyEl, { childList: true, characterData: true, subtree: true });
    }

    var summary = document.querySelector(".checkout-summary-card .order_price_total");
    if (summary && window.MutationObserver) {
      var timer = null;
      new MutationObserver(function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          syncCartSave();
          normalizeCheckoutCurrency();
        }, 30);
      }).observe(summary, { childList: true, characterData: true, subtree: true });
    }

    ["total_coupon_sale", "total_promotion_goods_sale"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || !window.MutationObserver) return;
      new MutationObserver(function () {
        setTimeout(refreshSummary, 30);
      }).observe(el, { childList: true, characterData: true, subtree: true });
    });
  });
})();
