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
  if (page.classList.contains("is-cart-empty") && document.body) {
    document.body.classList.add("is-cart-empty");
  }

  var FREE_SHIPPING = 48;
  var COUPON_KEY = "tpCartCoupon";

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

  function syncProductDiscount() {
    var total = 0;
    page.querySelectorAll("li.cart_goods.cart-item, .cart-item").forEach(function (row) {
      var compare = parseMoney(row.getAttribute("data-cart-unit-compare"));
      var unit = parseMoney(row.getAttribute("data-cart-unit-price"));
      var ea = parseInt(row.getAttribute("data-cart-ea"), 10) || 0;
      if (!ea) {
        var qtyOut = row.querySelector("[data-cart-qty-value]");
        ea = parseInt(String(text(qtyOut) || "1").replace(/[^\d]/g, ""), 10) || 1;
      }
      if (!(compare > unit)) {
        var priceEl = row.querySelector(".cart-item-price");
        var del = priceEl && priceEl.querySelector("del");
        var strong = priceEl && priceEl.querySelector("strong");
        if (del && strong) {
          compare = parseMoney(del.textContent);
          unit = parseMoney(strong.textContent);
        }
      }
      if (compare > unit && ea > 0) total += (compare - unit) * ea;
    });

    total = Math.round(total * 100) / 100;
    var saleDd = document.getElementById("saleTotalPrice");
    var saleSpan = document.getElementById("mobile_total_sale");
    var saveEl = document.querySelector("[data-cart-save]");

    if (saleDd) {
      saleDd.innerHTML =
        (total > 0 ? "- " : "") +
        '<span id="mobile_total_sale">' +
        formatMoney(total) +
        "</span>";
    } else if (saleSpan) {
      saleSpan.textContent = formatMoney(total);
    }
    if (saveEl) saveEl.textContent = formatMoney(total);
    normalizeCartCurrency();
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }
    fn();
  }

  function getSelectedSubtotal() {
    var boxes = page.querySelectorAll('input[name="cart_option_seq[]"]');
    if (!boxes.length) {
      var totalEl = document.getElementById("totalGoodsPrice") || document.getElementById("totalPrice");
      return parseMoney(text(totalEl));
    }

    var checkedTotal = 0;
    var allTotal = 0;
    var anyChecked = false;
    Array.prototype.forEach.call(boxes, function (cb) {
      var row = cb.closest("li.cart_goods, .cart-item");
      if (!row) return;
      var line = parseMoney(text(row.querySelector(".cart-item-total")));
      if (!line) {
        var unit = parseMoney(row.getAttribute("data-cart-unit-price"));
        var ea = parseInt(row.getAttribute("data-cart-ea"), 10) || 1;
        line = unit * ea;
      }
      allTotal += line;
      if (!cb.checked) return;
      anyChecked = true;
      checkedTotal += line;
    });

    if (anyChecked) return checkedTotal;
    if (allTotal > 0) return allTotal;

    var totalEl = document.getElementById("totalGoodsPrice") || document.getElementById("totalPrice");
    return parseMoney(text(totalEl));
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
        syncShippingMeter();
      }
    });
    page.addEventListener("click", function (event) {
      if (event.target.closest(".btn_select_all, .checkbox_allselect, .cart-items-head label")) {
        window.requestAnimationFrame(syncShippingMeter);
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

  function getCartSaleSubtotal() {
    var total = 0;
    var rows = page.querySelectorAll("li.cart_goods.cart-item, .cart-item");
    rows.forEach(function (row) {
      var check = row.querySelector('input[name="cart_option_seq[]"]');
      if (check && !check.checked) return;
      var line = parseMoney(text(row.querySelector(".cart-item-total")));
      if (line > 0) {
        total += line;
        return;
      }
      var unit = parseMoney(row.getAttribute("data-cart-unit-price"));
      var ea = parseInt(row.getAttribute("data-cart-ea"), 10) || 1;
      total += unit * ea;
    });
    if (total > 0) return total;
    return parseMoney(text(document.getElementById("totalGoodsPrice")));
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

  function estimateCouponDiscount(coupon) {
    var sale = String((coupon && coupon.sale) || "").trim();
    var name = String((coupon && coupon.name) || "").trim();
    var blob = (sale + " " + name).replace(/\s+/g, " ").trim();
    var subtotal = getCartSaleSubtotal();
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

    var title = buildCouponTitle(coupon);
    var displayName = buildCouponDisplayName(coupon, title);
    var headline = [title, displayName].filter(Boolean).join(" ");
    var discountText = "- " + formatMoney(estimateCouponDiscount(coupon));

    if (label) label.textContent = headline || "Coupon selected.";
    if (codeEl) codeEl.textContent = headline || title || "Coupon";
    if (discountEl) discountEl.textContent = discountText;
    if (noteEl) {
      noteEl.textContent = coupon.terms || "Applied at checkout.";
    }
    if (selected) selected.hidden = false;
    if (summary) summary.hidden = false;
    if (summaryLabel) summaryLabel.textContent = "Coupon (" + title + ")";
    if (summaryDiscount) summaryDiscount.textContent = discountText;
    if (openBtn) openBtn.textContent = "Change Coupon";
  }

  function formatCouponSale(sale) {
    var raw = String(sale || "").trim();
    if (!raw) return "";
    if (/<strong/i.test(raw)) return raw;
    var match = raw.match(/^([\d.,]+)\s*(%|원|₩|\$|USD|US\$)?(.*)$/i);
    if (!match) return raw;
    return (
      "<strong>" +
      match[1] +
      "</strong>" +
      (match[2] || "") +
      (match[3] || "")
    );
  }

  function couponDataFromTicket(ticket) {
    return {
      id:
        ticket.getAttribute("data-download-seq") ||
        ticket.getAttribute("data-coupon-seq") ||
        "",
      name: text(ticket.querySelector(".bo-coupon-name, [data-coupon-name]")),
      sale: text(ticket.querySelector("[data-coupon-sale], h3")),
      terms: text(
        ticket.querySelector(".bo-coupon-terms, .bo-coupon-expire-inline")
      ),
      badge: "MY",
    };
  }

  function couponCard(coupon, activeId) {
    var article = document.createElement("article");
    var applied = String(coupon.id) === String(activeId || "");
    article.className = "bo-coupon-ticket" + (applied ? " is-applied" : "");
    article.setAttribute("data-coupon-ticket", "");
    if (coupon.id) article.setAttribute("data-download-seq", coupon.id);
    article.innerHTML =
      '<div class="bo-coupon-ticket-top"><span>' +
      (coupon.badge || "MY") +
      "</span></div><h3 data-coupon-sale>" +
      formatCouponSale(coupon.sale || "") +
      '</h3><p class="bo-coupon-name">' +
      (coupon.name || "") +
      "</p>" +
      (coupon.terms
        ? '<p class="bo-coupon-terms">' + coupon.terms + "</p>"
        : "") +
      '<div class="bo-coupon-ticket-actions"><button type="button" class="bo-coupon-action cart-coupon-apply">' +
      (applied ? "Selected" : "Select") +
      "</button></div>";
    article.querySelector("button").addEventListener("click", function () {
      storeCoupon(coupon);
      paintSelectedCoupon(coupon);
      closeCouponDialog();
    });
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

      var clone = ticket.cloneNode(true);
      var coupon = couponDataFromTicket(clone);
      if (!coupon.name && !coupon.sale) return;

      var actions = clone.querySelector(".bo-coupon-ticket-actions");
      if (!actions) {
        actions = document.createElement("div");
        actions.className = "bo-coupon-ticket-actions";
        clone.appendChild(actions);
      }
      actions.innerHTML = "";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "bo-coupon-action cart-coupon-apply";
      var applied = String(coupon.id) === String(activeId || "");
      btn.textContent = applied ? "Selected" : "Select";
      if (applied) clone.classList.add("is-applied");
      btn.addEventListener("click", function () {
        storeCoupon(coupon);
        paintSelectedCoupon(coupon);
        closeCouponDialog();
      });
      actions.appendChild(btn);
      list.appendChild(clone);
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
        badge: "MY",
      });
    });
    return list;
  }

  function getCouponTicketId(ticket) {
    if (!ticket) return "";
    return (
      ticket.getAttribute("data-download-seq") ||
      ticket.getAttribute("data-coupon-seq") ||
      ""
    );
  }

  function refreshCouponListSelection() {
    var list = document.querySelector("[data-cart-coupon-list]");
    if (!list || list.getAttribute("data-loaded") !== "1") return;

    var active = readStoredCoupon();
    var activeId = active && active.id ? String(active.id) : "";

    list.querySelectorAll("[data-coupon-ticket], .bo-coupon-ticket").forEach(function (ticket) {
      var ticketId = getCouponTicketId(ticket);
      var applied = Boolean(activeId && ticketId && String(ticketId) === activeId);
      ticket.classList.toggle("is-applied", applied);
      var btn = ticket.querySelector(".cart-coupon-apply, .bo-coupon-action");
      if (btn) btn.textContent = applied ? "Selected" : "Select";
    });
  }

  function openCouponDialog() {
    var dialog = document.getElementById("cart-coupon-dialog");
    if (!dialog) return;
    dialog.hidden = false;
    dialog.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-cart-coupon-open");
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
    openBtn.addEventListener("click", function () {
      openCouponDialog();
      if (list.getAttribute("data-loaded") === "1") {
        refreshCouponListSelection();
        return;
      }
      list.innerHTML = "<p class=\"cart-country-empty\">Loading coupons…</p>";
      fetch("/mypage/coupon?tab=1", { credentials: "same-origin" })
        .then(function (res) {
          return res.ok ? res.text() : "";
        })
        .then(function (html) {
          if (!html) {
            list.innerHTML = "<p class=\"cart-country-empty\">Sign in to use coupons.</p>";
            return;
          }
          var doc = new DOMParser().parseFromString(html, "text/html");
          var active = readStoredCoupon();
          list.innerHTML = "";
          var mounted = mountCouponTickets(list, doc, active && active.id);
          if (mounted) {
            list.setAttribute("data-loaded", "1");
            return;
          }
          var coupons = parseCouponDoc(doc);
          if (!coupons.length) {
            list.innerHTML = "<p class=\"cart-country-empty\">You have no coupons.</p>";
            return;
          }
          coupons.forEach(function (coupon) {
            list.appendChild(couponCard(coupon, active && active.id));
          });
          list.setAttribute("data-loaded", "1");
        })
        .catch(function () {
          list.innerHTML = "<p class=\"cart-country-empty\">Could not load coupons.</p>";
        });
    });

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
    layerObserver: null,
    nativeScrollTo: null,
    jqScrollTop: null,
    onScroll: null,
    closeBound: false,
  };

  function endCartQvGuard(restore) {
    if (cartQvGuard.timer) {
      window.clearTimeout(cartQvGuard.timer);
      cartQvGuard.timer = null;
    }
    if (cartQvGuard.layerObserver) {
      cartQvGuard.layerObserver.disconnect();
      cartQvGuard.layerObserver = null;
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
    cartQvGuard.y = 0;
    cartQvGuard.active = false;
    if (restore && y && typeof window.scrollTo === "function") {
      window.scrollTo(0, y);
    }
  }

  function restoreCartQvScroll() {
    if (!cartQvGuard.active || !cartQvGuard.y) return;
    if (cartQvGuard.nativeScrollTo) {
      cartQvGuard.nativeScrollTo.call(window, 0, cartQvGuard.y);
      return;
    }
    window.scrollTo(0, cartQvGuard.y);
  }

  function beginCartQvGuard() {
    endCartQvGuard(false);
    var savedY =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    if (!savedY) return;

    cartQvGuard.y = savedY;
    cartQvGuard.active = true;
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
      if (cartQvGuard.active && savedY > 8 && window.pageYOffset < 8) {
        restoreCartQvScroll();
      }
    };
    window.addEventListener("scroll", cartQvGuard.onScroll, { passive: true });
    cartQvGuard.timer = window.setTimeout(function () {
      endCartQvGuard(true);
    }, 4000);
  }

  function findCartQuickviewLayer() {
    var quickview =
      document.getElementById("goods_view_quickview") ||
      document.querySelector(".qv-product-card");
    if (!quickview) return null;
    return quickview.closest(".resp_layer_pop, .ui-dialog");
  }

  function watchCartQuickviewLayerClose(layer) {
    if (!layer || !window.MutationObserver) return;
    if (cartQvGuard.layerObserver) cartQvGuard.layerObserver.disconnect();
    cartQvGuard.layerObserver = new MutationObserver(function () {
      if (layer.classList.contains("hide") || !document.body.contains(layer)) {
        endCartQvGuard(true);
      }
    });
    cartQvGuard.layerObserver.observe(layer, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  function attachCartQuickviewAfterOpen() {
    var layer = findCartQuickviewLayer();
    if (layer && !layer.classList.contains("hide")) {
      document.body.classList.remove("is-cart-qv-loading");
      watchCartQuickviewLayerClose(layer);
      restoreCartQvScroll();
      return;
    }
    window.setTimeout(function () {
      var retryLayer = findCartQuickviewLayer();
      if (retryLayer && !retryLayer.classList.contains("hide")) {
        document.body.classList.remove("is-cart-qv-loading");
        watchCartQuickviewLayerClose(retryLayer);
      }
      restoreCartQvScroll();
    }, 0);
    window.setTimeout(restoreCartQvScroll, 80);
    window.setTimeout(restoreCartQvScroll, 200);
  }

  function bindCartQuickviewClose() {
    if (cartQvGuard.closeBound) return;
    cartQvGuard.closeBound = true;

    document.addEventListener(
      "click",
      function (event) {
        if (
          !event.target.closest(
            ".resp_layer_bg, .btn_pop_close, .viewerlay_close_btn"
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

  function openFirstmallOptionEdit(cartOptionSeq) {
    var editBtn = document.getElementById(String(cartOptionSeq));
    if (editBtn && editBtn.classList.contains("btn_option_modify")) {
      editBtn.click();
      return true;
    }
    return false;
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
      items.forEach(function (item) {
        var li = document.createElement("li");
        li.setAttribute("role", "option");
        li.textContent = item.label;
        if (item.value != null) li.setAttribute("data-option-value", item.value);
        if (item.disabled) {
          li.setAttribute("aria-disabled", "true");
          li.classList.add("is-disabled");
        }
        var selected =
          currentLabel &&
          String(item.label).replace(/\s+/g, " ").trim().toLowerCase() ===
            String(currentLabel).replace(/\s+/g, " ").trim().toLowerCase();
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
          });
        });
      }

      if (!choices.length) {
        doc.querySelectorAll(".goods_quantity_table .option_text, .goods_quantity_table .option_col_text").forEach(function (cell) {
          var label = String(cell.textContent || "").replace(/\s+/g, " ").trim();
          if (!label || seen[label]) return;
          seen[label] = true;
          choices.push({ label: label, value: label });
        });
      }

      return choices;
    }

    function loadOptions(wrap) {
      var seq = wrap.getAttribute("data-cart-option-seq");
      var menu = wrap.querySelector(".realtrend-select-menu");
      var valueEl = wrap.querySelector(".realtrend-select-value");
      if (!seq || !menu) return Promise.resolve();
      if (wrap.getAttribute("data-options-loaded") === "1") return Promise.resolve();

      menu.innerHTML = "<li role=\"option\" aria-disabled=\"true\">Loading options…</li>";
      var url =
        "/order/optional_changes?no=" + encodeURIComponent(seq) + "&t=" + Date.now();

      return fetch(url, { credentials: "same-origin" })
        .then(function (res) {
          if (!res.ok) throw new Error("load failed");
          return res.text();
        })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, "text/html");
          wrap._cartOptionDoc = doc;
          var choices = parseOptionChoices(doc);
          var current = text(valueEl);
          if (!choices.length && current) {
            choices = [{ label: current, value: "" }];
          }
          setMenuItems(menu, choices, current);
          wrap.setAttribute("data-options-loaded", "1");
        })
        .catch(function () {
          var current = text(valueEl);
          setMenuItems(menu, current ? [{ label: current, value: "" }] : [], current);
          wrap.setAttribute("data-options-loaded", "1");
        });
    }

    function submitSelectedOption(wrap, optionValue) {
      var doc = wrap._cartOptionDoc;
      var seq = wrap.getAttribute("data-cart-option-seq");
      if (!doc || !seq) {
        openFirstmallOptionEdit(seq);
        return;
      }
      var source =
        doc.querySelector("#optional_changes_form") ||
        doc.querySelector("form[name='optional_changes_form']");
      if (!source) {
        openFirstmallOptionEdit(seq);
        return;
      }

      var selects = source.querySelectorAll('select[name="viewOptions[]"]');
      var target = null;
      Array.prototype.forEach.call(selects, function (el) {
        if (el.options && el.options.length > 1) target = el;
      });
      if (!target) {
        openFirstmallOptionEdit(seq);
        return;
      }
      target.value = optionValue;
      if (target.value !== optionValue) {
        openFirstmallOptionEdit(seq);
        return;
      }

      var live = document.createElement("form");
      live.method = "post";
      live.action = source.getAttribute("action") || "/order/optional_modify";
      live.target = "actionFrame";
      live.enctype = source.getAttribute("enctype") || "application/x-www-form-urlencoded";
      live.style.display = "none";
      Array.prototype.forEach.call(source.elements, function (el) {
        if (!el || !el.name || el.disabled) return;
        var type = String(el.type || "").toLowerCase();
        if ((type === "checkbox" || type === "radio") && !el.checked) return;
        if (type === "file" || type === "submit" || type === "button") return;
        var input = document.createElement("input");
        input.type = "hidden";
        input.name = el.name;
        input.value = el === target ? optionValue : el.value;
        live.appendChild(input);
      });
      document.body.appendChild(live);
      live.submit();
      window.setTimeout(function () {
        if (live.parentNode) live.parentNode.removeChild(live);
      }, 1500);
    }

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
        if (valueNode) valueNode.textContent = text(optionItem);
        submitSelectedOption(optionWrap, optionValue);
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
    var busy = false;

    function readQty(wrap) {
      var out = wrap.querySelector("[data-cart-qty-value]") || wrap.querySelector("output");
      return Math.max(1, parseInt(text(out).replace(/,/g, ""), 10) || 1);
    }

    function writeQty(wrap, value) {
      var out = wrap.querySelector("[data-cart-qty-value]") || wrap.querySelector("output");
      if (out) out.textContent = String(value);
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

    function submitQty(cartOptionSeq, nextEa) {
      var url =
        "/order/optional_changes?no=" +
        encodeURIComponent(cartOptionSeq) +
        "&t=" +
        Date.now();
      busy = true;
      return fetch(url, { credentials: "same-origin" })
        .then(function (res) {
          if (!res.ok) throw new Error("optional_changes failed");
          return res.text();
        })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, "text/html");
          var source =
            doc.querySelector("#optional_changes_form") ||
            doc.querySelector("form[name='optional_changes_form']");
          if (!source) throw new Error("optional_changes form missing");

          var eaInputs = source.querySelectorAll("input[name^='optionEa']");
          if (!eaInputs.length) {
            eaInputs = source.querySelectorAll("input.ea_change");
          }
          if (!eaInputs.length) throw new Error("quantity input missing");
          eaInputs[0].value = String(nextEa);

          var live = document.createElement("form");
          live.method = "post";
          live.action = source.getAttribute("action") || "/order/optional_modify";
          live.target = "actionFrame";
          live.enctype =
            source.getAttribute("enctype") || "application/x-www-form-urlencoded";
          live.style.display = "none";
          copyFormFields(source, live);
          document.body.appendChild(live);
          live.submit();
          window.setTimeout(function () {
            if (live.parentNode) live.parentNode.removeChild(live);
            busy = false;
          }, 1500);
        })
        .catch(function () {
          busy = false;
          var editBtn = document.getElementById(String(cartOptionSeq));
          if (editBtn && editBtn.classList.contains("btn_option_modify")) {
            editBtn.click();
          }
        });
    }

    page.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-cart-qty-change]");
      if (!btn || !page.contains(btn)) return;
      event.preventDefault();
      if (busy) return;

      var wrap = btn.closest("[data-cart-qty]");
      if (!wrap) return;
      var seq = wrap.getAttribute("data-cart-option-seq");
      if (!seq) {
        var row = wrap.closest("li.cart_goods, .cart-item");
        if (row && row.id) seq = String(row.id).replace(/^cart_goods_/, "");
      }
      if (!seq) return;

      var delta = parseInt(btn.getAttribute("data-cart-qty-change"), 10) || 0;
      var current = readQty(wrap);
      var next = Math.max(1, current + delta);
      if (next === current) return;

      writeQty(wrap, next);
      submitQty(seq, next);
    });
  }

  ready(function () {
    endCartQvGuard(false);
    bindCartQuickviewClose();
    normalizeCartCurrency();
    syncShippingMeter();
    syncProductDiscount();
    bindShippingMeter();
    bindPromo();
    bindCoupon();
    bindPaypal();
    bindCountry();
    bindOptionSelects();
    bindQty();
    initCartNewsletterReveal();
    bindRecQuickviewClicks();
    window.requestAnimationFrame(function () {
      tryBindRecommendations();
    });
    window.requestAnimationFrame(function () {
      normalizeCartCurrency();
      syncShippingMeter();
      syncProductDiscount();
      window.requestAnimationFrame(enableShippingMeterTransitions);
    });
  });
})();
