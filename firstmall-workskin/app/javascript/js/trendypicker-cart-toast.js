/**
 * TrendyPicker global add-to-cart toast
 * Loaded from layout_footer/standard.html, so it runs on every page.
 *
 * Every add-to-cart path in this skin submits <form name="goodsForm">
 * to /order/add with target="actionFrame" — product view, quickview,
 * recently-viewed option layer, wishlist-to-cart, and the shared
 * _modules/common/goods_order_form.html. Hooking the submit plus the
 * hidden iframe's load therefore covers all of them without having to
 * patch each entry point separately.
 */
(function () {
  "use strict";

  var TOAST_ID = "trend-cart-toast";
  var VISIBLE_MS = 5000;
  var LEAVE_MS = 280;
  var STORAGE_KEY = "tpCartToast";

  // The add-to-cart reload drops the shopper back at the top of the page.
  // Remember where they were reading and put them back after the reload.
  var SCROLL_KEY = "tpCartScroll";

  function persistScroll() {
    try {
      sessionStorage.setItem(
        SCROLL_KEY,
        JSON.stringify({ y: window.pageYOffset || 0, path: window.location.pathname, ts: Date.now() })
      );
    } catch (err) {}
  }

  function restoreScroll() {
    var data = null;
    try {
      var raw = sessionStorage.getItem(SCROLL_KEY);
      if (raw) sessionStorage.removeItem(SCROLL_KEY);
      if (raw) data = JSON.parse(raw);
    } catch (err) {
      return;
    }
    if (!data || !data.y) return;
    if (data.path !== window.location.pathname) return;
    if (Date.now() - data.ts > 8000) return;

    var jump = function () {
      window.scrollTo(0, data.y);
    };
    jump();
    window.requestAnimationFrame(jump);
    window.setTimeout(jump, 60);
    window.addEventListener("load", jump, { once: true });
  }

  // Some add-to-cart paths reload the page right after the item lands (to
  // refresh the header cart count), which wipes a toast that was only shown
  // in memory — it flashes for an instant and is gone. Hand the toast to
  // sessionStorage as well so the next document can pick it up. If no reload
  // happens the entry is dropped again a moment later.
  function persistToast(info) {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          info: info || null,
          path: window.location.pathname + window.location.search,
          ts: Date.now(),
        })
      );
    } catch (err) {}
    window.setTimeout(function () {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (err) {}
    }, 1500);
  }

  function isReloadNavigation() {
    if (window.performance && typeof window.performance.getEntriesByType === "function") {
      var entries = window.performance.getEntriesByType("navigation");
      if (entries && entries[0]) return entries[0].type === "reload";
    }
    return Boolean(
      window.performance &&
        window.performance.navigation &&
        window.performance.navigation.type === 1
    );
  }

  function consumePersistedToast() {
    var raw = null;
    try {
      raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) sessionStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      return;
    }
    if (!raw) return;

    var data = null;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      return;
    }
    if (!data || Date.now() - data.ts > 8000) return;
    if (data.path !== window.location.pathname + window.location.search) return;
    if (!isReloadNavigation()) return;
    showToast(data.info);
  }

  var toast = null;
  var messageEl = null;
  var thumbEl = null;
  var ringEl = null;
  var hideTimer = null;
  var removeTimer = null;
  var pending = null;
  var pendingTimer = null;
  var lastShownAt = 0;

  // Native validation can abort the submit (no option chosen, sold out, …)
  // without ever loading actionFrame. Drop the armed toast after a short
  // window so an unrelated later iframe load cannot fire a false "added".
  function armPending(info) {
    pending = info;
    window.clearTimeout(pendingTimer);
    pendingTimer = window.setTimeout(function () {
      pending = null;
    }, 15000);
  }

  function clearPending() {
    pending = null;
    window.clearTimeout(pendingTimer);
    pendingTimer = null;
  }

  // Firstmall confirms every successful add with a native dialog
  // ("The product has been added to the Shopping Cart ... view it?").
  // That call is the one reliable success signal across all entry points,
  // so swallow it and show the toast instead. Returning false keeps the
  // shopper on the page; the toast itself links through to the cart.
  var CART_ADDED_MESSAGE = /(shopping cart|장바구니)/i;

  function wrapConfirm() {
    var native = window.confirm;
    if (typeof native !== "function" || native._tpCartToast) return;

    function wrapped(message) {
      var text = String(message == null ? "" : message);
      if (CART_ADDED_MESSAGE.test(text) && /(added|담)/i.test(text)) {
        var info = pending;
        clearPending();
        persistToast(info);
        showToast(info);
        return false;
      }
      return native.apply(window, arguments);
    }

    wrapped._tpCartToast = true;
    window.confirm = wrapped;
  }

  function text(el) {
    return el ? String(el.textContent || "").replace(/\s+/g, " ").trim() : "";
  }

  function buildToast() {
    if (document.getElementById(TOAST_ID)) return document.getElementById(TOAST_ID);

    var el = document.createElement("div");
    el.className = "realtrend-cart-toast";
    el.id = TOAST_ID;
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-hidden", "true");
    el.hidden = true;
    // Check mark is inline SVG on purpose: an <img> would need the resolved
    // /data/skin/<name>/ prefix, and getting that wrong is a silent 404.
    el.innerHTML =
      '<button type="button" class="realtrend-cart-toast-close" aria-label="Close notification">&times;</button>' +
      '<div class="realtrend-cart-toast-icon" aria-hidden="true">' +
      '<svg class="realtrend-cart-toast-ring" viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" /></svg>' +
      '<svg class="realtrend-cart-toast-check" viewBox="0 0 30 30" aria-hidden="true">' +
      '<circle cx="15" cy="15" r="15" fill="currentColor" />' +
      '<path d="M9 15.4 13.3 19.7 21 12" fill="none" stroke="#fff" stroke-width="2.4" ' +
      'stroke-linecap="round" stroke-linejoin="round" /></svg>' +
      "</div>" +
      '<div class="realtrend-cart-toast-copy">' +
      "<strong>Add to cart!</strong>" +
      '<p id="trend-cart-toast-message"></p>' +
      "</div>" +
      '<div class="realtrend-cart-toast-thumb" aria-hidden="true"></div>';

    document.body.appendChild(el);
    return el;
  }

  function cacheRefs() {
    toast = buildToast();
    messageEl = toast.querySelector("#trend-cart-toast-message");
    thumbEl = toast.querySelector(".realtrend-cart-toast-thumb");
    ringEl = toast.querySelector(".realtrend-cart-toast-ring circle");
  }

  function hideToast() {
    if (!toast || !toast.classList.contains("is-visible")) return;
    window.clearTimeout(hideTimer);
    hideTimer = null;
    toast.classList.add("is-leaving");
    toast.classList.remove("is-visible");
    removeTimer = window.setTimeout(function () {
      toast.hidden = true;
      toast.setAttribute("aria-hidden", "true");
      toast.classList.remove("is-leaving");
      if (ringEl) ringEl.classList.remove("is-animating");
    }, LEAVE_MS);
  }

  function showToast(info) {
    if (!toast) cacheRefs();
    if (!toast) return;

    // The confirm hook and the actionFrame fallback can both fire for one
    // add; collapse those into a single toast.
    var now = Date.now();
    if (now - lastShownAt < 1500) return;
    lastShownAt = now;

    window.clearTimeout(hideTimer);
    window.clearTimeout(removeTimer);

    // Same shape as the prototype: product name in its own span, followed by
    // the sentence. Built with DOM nodes so a product name can never inject
    // markup.
    if (messageEl) {
      messageEl.textContent = "";
      var name = info && info.name ? String(info.name).trim() : "";
      if (name) {
        var strong = document.createElement("span");
        strong.className = "realtrend-cart-toast-product";
        strong.textContent = name;
        messageEl.appendChild(strong);
        messageEl.appendChild(document.createTextNode(" has been added to your cart."));
      } else {
        messageEl.textContent = "This item has been added to your cart.";
      }
    }

    if (thumbEl) {
      thumbEl.innerHTML = "";
      if (info && info.image) {
        var img = document.createElement("img");
        img.src = info.image;
        img.alt = "";
        thumbEl.appendChild(img);
      }
    }

    toast.hidden = false;
    toast.setAttribute("aria-hidden", "false");
    toast.classList.remove("is-visible", "is-leaving");

    // Reflow so the ring animation restarts on a repeated add.
    if (ringEl) {
      ringEl.classList.remove("is-animating");
      void ringEl.getBoundingClientRect();
      ringEl.classList.add("is-animating");
    }

    window.requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });

    hideTimer = window.setTimeout(hideToast, VISIBLE_MS);
  }

  // Pull whatever the submitting context knows about the product. Each
  // add-to-cart surface lays this out differently, so try the specific
  // containers first and fall back to page-level metadata.
  function readProductInfo(form, trigger) {
    var name = "";
    var image = "";

    if (trigger) {
      name = String(trigger.getAttribute("data-product-name") || "").trim();
    }

    // Listing / quickview cards: the button that was pressed sits inside the
    // card, so read the product straight off it. This is the only source on
    // category and Real Trend pages, where there is no product-page form.
    var card =
      trigger && trigger.closest
        ? trigger.closest(
            ".qv-product-card, .listing-card, .realtrend-product-card, " +
              ".goods_list_style1, .goods_list_style4, .goods_list_style5, " +
              ".goods_list li, .item_box"
          )
        : null;
    if (card) {
      name = name ||
        text(
          card.querySelector(
            ".listing-card-title, .qv-product-name, .goods_name_area .name, .goods_name"
          )
        ) ||
        text(card.querySelector("h3, h2")) ||
        String((card.querySelector(".listing-card-title") || {}).title || "").trim();
      var cardImg = card.querySelector("img");
      if (cardImg) image = cardImg.getAttribute("src") || "";
    }

    if (form) {
      var formName =
        text(form.querySelector(".cart_dialog_img .name")) ||
        text(form.querySelector(".goods_name")) ||
        "";
      if (formName) name = formName;
      var formImg =
        form.querySelector(".cart_dialog_img img") || form.querySelector("img.goods_thumb");
      if (formImg) image = formImg.getAttribute("src") || "";
    }

    if (!name) {
      name =
        text(document.querySelector(".goods_view .goods_name")) ||
        text(document.querySelector(".goods_name")) ||
        text(document.querySelector('meta[property="og:title"]')) ||
        "";
    }
    if (!name) {
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) name = String(ogTitle.getAttribute("content") || "").trim();
    }

    // Quickview: the layer that is open right now owns the product, so read
    // its image and title before falling back to page-level metadata.
    if (!image || !name) {
      var layer = document.querySelector(
        "#quickviewModal, .qv-product-card, #goods_view_quickview"
      );
      if (layer) {
        if (!image) {
          var layerImg = layer.querySelector(
            ".qv-product-image img, .qv-thumb img, .goods_thumb, img"
          );
          if (layerImg) image = layerImg.getAttribute("src") || "";
        }
        if (!name) {
          name =
            text(layer.querySelector(".qv-product-name, .goods_name, h2, h3")) || name;
        }
      }
    }

    if (!image) {
      var ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) image = String(ogImage.getAttribute("content") || "").trim();
    }

    return { name: name, image: image };
  }

  function isCartAddForm(form) {
    if (!form || typeof form.getAttribute !== "function") return false;
    var action = form.getAttribute("action") || "";
    return /(^|\/)order\/add(\?|$)/.test(action.split("?")[0].replace(/^\.\.?/, ""));
  }

  function bindActionFrame() {
    var frame = document.querySelector("iframe[name='actionFrame']");
    if (!frame || frame._tpCartToast) return;
    frame._tpCartToast = true;
    frame.addEventListener("load", function () {
      if (!pending) return;
      var info = pending;
      clearPending();
      persistToast(info);
      showToast(info);
    });
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }
    fn();
  }

  // Patch before DOM ready: the native confirm can fire from an inline
  // script as soon as the add-to-cart response lands.
  wrapConfirm();

  ready(function () {
    cacheRefs();
    wrapConfirm();
    bindActionFrame();
    // A persisted toast is accepted only after a same-URL reload caused by
    // an actual add. Header badge hydration is deliberately not a trigger:
    // its timing differs between pages and produced false toasts on normal
    // navigation.
    restoreScroll();
    consumePersistedToast();
    try {
      sessionStorage.removeItem("tpCartCount");
    } catch (err) {}

    // The iframe is often written into the page by Firstmall after load.
    if (window.MutationObserver) {
      new MutationObserver(bindActionFrame).observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    }

    // Capture phase: native handlers call form.submit() themselves, which
    // does not fire a submit event, so also watch the buttons that trigger it.
    document.addEventListener(
      "submit",
      function (event) {
        var form = event.target;
        if (!isCartAddForm(form)) return;
        armPending(readProductInfo(form));
        persistScroll();
        wrapConfirm();
        bindActionFrame();
      },
      true
    );

    // form.submit() bypasses the submit event entirely; the stock skin's
    // add-to-cart buttons take that path, so arm the toast on their click
    // and let the actionFrame load decide when to show it.
    document.addEventListener(
      "click",
      function (event) {
        var target = event.target;
        if (!target || !target.closest) return;
        var trigger = target.closest(
          "#addCart, #addCart_option, [name='addCart'], [onclick*='displayAddToCartQuickview']"
        );
        if (!trigger) return;
        var form =
          document.querySelector("form[name='goodsForm']") ||
          trigger.closest("form");
        armPending(readProductInfo(isCartAddForm(form) ? form : null, trigger));
        persistScroll();
        wrapConfirm();
        bindActionFrame();
      },
      true
    );

    document.addEventListener("click", function (event) {
      if (!toast) return;
      if (event.target.closest(".realtrend-cart-toast-close")) {
        hideToast();
        return;
      }
      var hit = event.target.closest(".realtrend-cart-toast.is-visible");
      if (!hit) return;
      event.preventDefault();
      window.location.href = "/order/cart";
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") hideToast();
    });

    // A document restored from the back/forward cache keeps its JavaScript
    // variables. Never let an add intent from the previous visit survive a
    // page transition and pair with an unrelated actionFrame load.
    window.addEventListener("pagehide", clearPending);
  });

  window.tpShowCartToast = showToast;
})();
