/*
 * TrendyPicker - Time Deal ("on sale now") badge for product listings.
 *
 * A normal Category / Search / Best / New / Brand query can NOT tell whether a
 * product is actually on Time Deal right now: the only discount field the card
 * template receives (.sale_per) is true for ANY discounted product, so gating
 * the badge on it marks ordinary sale items too. This script instead asks the
 * authoritative source - the live "on sale now" Time Deal listing
 * (searchMode=timedeal, display_mode=current) - and adds the pink "% OFF"
 * time-deal badge ONLY to cards whose goods_seq is in that set. It is loaded
 * from listing_style_discount.html, so it runs on every page that uses that
 * listing style, and re-runs on each pagination / sort / filter (the listing
 * style HTML, and this script tag with it, are re-injected by the AJAX reload).
 */
(function () {
  var CLOCK = "/data/skin/responsive_food_mealkit_gl/images/timedeal/clock_pink.png";
  var CACHE_MS = 5 * 60 * 1000;

  function fetchOnSaleNow() {
    var now = Date.now();
    if (window.__tpOnSaleNow && (now - window.__tpOnSaleNow.at) < CACHE_MS) {
      return Promise.resolve(window.__tpOnSaleNow.map);
    }
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
          if (!m || map[m[1]]) return;
          var card = a.closest(".listing-card, li");
          var rate = card
            ? card.querySelector(".timedeal-card-deal-rate, .discount_rate")
            : null;
          map[m[1]] = rate ? rate.textContent.replace(/\s+/g, " ").trim() : "";
        });
        window.__tpOnSaleNow = { at: now, map: map };
        return map;
      });
  }

  function normalizeRate(rate) {
    if (!rate) return "";
    if (/OFF/i.test(rate)) return rate;
    var digits = rate.replace(/[^0-9]/g, "");
    return digits ? digits + "% OFF" : "";
  }

  function makeBadge(rate) {
    var wrap = document.createElement("div");
    wrap.className = "timedeal-card-deal";
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

  function mark(map) {
    var cards = document.querySelectorAll(".listing-card");
    Array.prototype.forEach.call(cards, function (card) {
      var a = card.querySelector("a[href*='/goods/view']");
      if (!a) return;
      var m = (a.getAttribute("href") || "").match(/no=(\d+)/);
      if (!m) return;
      var no = m[1];
      var media = card.querySelector(".listing-card-media");
      if (!media) return;
      var existing = media.querySelector(".timedeal-card-deal");
      if (map[no] !== undefined) {
        if (!existing) media.appendChild(makeBadge(normalizeRate(map[no])));
      } else if (existing) {
        existing.remove();
      }
    });
  }

  function run() {
    fetchOnSaleNow()
      .then(mark)
      .catch(function () {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
