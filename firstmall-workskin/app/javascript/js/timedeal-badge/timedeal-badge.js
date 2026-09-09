/*
 * TrendyPicker - "On Sale Now" Time Deal badge for product listings.
 *
 * WHY THIS EXISTS
 * A normal Best / New / Category / Search / Brand query (listing_style_basic)
 * and the "You may also love" related-goods module can NOT tell whether a card
 * is on Time Deal right now: the only discount field the card template receives
 * is .sale_per, which is true for ANY discounted product. Gating a badge on it
 * marks ordinary sale items too. So this script asks the authoritative source -
 * the live "on sale now" Time Deal listing - builds a { goods_seq -> rate } map,
 * and adds the pink clock "% OFF" badge ONLY to cards whose goods_seq is in that
 * set (using the rate from the Time Deal list, not the card's own sale_per).
 *
 * SCOPE
 *   - Runs on any page that loads it.
 *   - Re-runs on AJAX re-render (pagination / sort / filter) via MutationObserver.
 *   - Session-cached so the Time Deal list is fetched at most once per few minutes.
 *
 * The badge markup + CSS class (.timedeal-card-deal) are reused from
 * listing-cards-style.css, so no extra CSS is needed.
 */
(function () {
  "use strict";

  if (window.__tpTimedealBadgeInit) return;
  window.__tpTimedealBadgeInit = true;

  var SKIN = "responsive_food_mealkit_gl";
  var CLOCK = "/data/skin/" + SKIN + "/images/timedeal/clock_pink.png";
  var CACHE_MS = 5 * 60 * 1000;
  var CACHE_KEY = "tpOnSaleNow";

  // Cards to badge:
  //  - .listing-card    : Best / New / Category / Search / Brand grids
  //  - .product-rec-card: the "You may also love" module on the product page
  var CARD_SELECTOR = ".listing-card, .product-rec-card";

  /* ---- data: the authoritative "on sale now" set -------------------------- */

  function readCache() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || (Date.now() - obj.at) > CACHE_MS) return null;
      return obj.map;
    } catch (e) {
      return null;
    }
  }

  function writeCache(map) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), map: map }));
    } catch (e) {}
  }

  function fetchOnSaleNow() {
    var cached = readCache();
    if (cached) return Promise.resolve(cached);

    var qs =
      "page=1&searchMode=timedeal&per=200&sorting=ranking&filter_display=lattice&display_mode=current";
    return fetch("/goods/search_list?" + qs, { credentials: "same-origin" })
      .then(function (r) {
        return r.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var map = {};
        var links = doc.querySelectorAll("a[href*='/goods/view']");
        Array.prototype.forEach.call(links, function (a) {
          var m = (a.getAttribute("href") || "").match(/no=(\d+)/);
          if (!m || map[m[1]] !== undefined) return;
          var card = a.closest(".listing-card, li");
          var rate = card
            ? card.querySelector(".timedeal-card-deal-rate, .discount_rate")
            : null;
          map[m[1]] = rate ? rate.textContent.replace(/\s+/g, " ").trim() : "";
        });
        writeCache(map);
        return map;
      });
  }

  /* ---- badge injection ---------------------------------------------------- */

  function normalizeRate(rate) {
    if (!rate) return "";
    if (/OFF/i.test(rate)) return rate;
    var digits = rate.replace(/[^0-9]/g, "");
    return digits ? digits + "% OFF" : "";
  }

  function makeBadge(rate) {
    var wrap = document.createElement("div");
    wrap.className = "timedeal-card-deal";
    // Tag our own badge so we only ever remove ones this script added, never a
    // template badge (e.g. the Time Deal listing pages render their own).
    wrap.dataset.tpAuto = "1";
    wrap.setAttribute("aria-label", (rate || "") + " time deal");

    var img = document.createElement("img");
    img.className = "timedeal-card-deal-clock";
    img.src = CLOCK;
    img.width = 22;
    img.height = 22;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");

    var span = document.createElement("span");
    span.className = "timedeal-card-deal-rate";
    span.textContent = rate || "";

    wrap.appendChild(img);
    wrap.appendChild(span);
    return wrap;
  }

  function goodsSeqOf(card) {
    var a = card.querySelector("a[href*='/goods/view']");
    if (!a) return null;
    var m = (a.getAttribute("href") || "").match(/no=(\d+)/);
    return m ? m[1] : null;
  }

  function mark(map) {
    var cards = document.querySelectorAll(CARD_SELECTOR);
    Array.prototype.forEach.call(cards, function (card) {
      var no = goodsSeqOf(card);
      if (!no) return;
      // Prefer the media box; fall back to the card so related-goods modules
      // with a different inner structure still get the badge.
      var host = card.querySelector(".listing-card-media") || card;
      var existing = host.querySelector(":scope > .timedeal-card-deal");
      if (map[no] !== undefined) {
        // In the set: add our badge only if none is present (template or ours).
        if (!existing) host.appendChild(makeBadge(normalizeRate(map[no])));
      } else if (existing && existing.dataset.tpAuto) {
        // Not in the current set: remove only a badge we added ourselves.
        existing.remove();
      }
    });
  }

  /* ---- run + re-run on AJAX re-render ------------------------------------- */

  var pending = false;
  function run() {
    if (pending) return;
    // Nothing to badge on this page (yet). The observer re-runs when cards
    // appear, so we skip the Time Deal fetch on pages with no product cards.
    if (!document.querySelector(CARD_SELECTOR)) return;
    pending = true;
    fetchOnSaleNow()
      .then(mark)
      .catch(function () {})
      .then(function () {
        pending = false;
      });
  }

  function watch() {
    if (!window.MutationObserver) return;
    var scheduled = false;
    var obs = new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;
      // Debounce: listing grids re-render in bursts during AJAX reloads.
      setTimeout(function () {
        scheduled = false;
        run();
      }, 120);
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function start() {
    run();
    watch();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
