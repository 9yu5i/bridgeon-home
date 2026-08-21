/**
 * TrendyPicker search panel bridge.
 * Pairs with css/redesign/trendypicker-search.css.
 *
 * The header redesign put its own search field in .tp-header-search, while
 * Firstmall's search module (#searchVer2) keeps its own input and its own
 * opener (#btnSearchV2). Both of those collapse to 0x0 in this skin, so the
 * module — and with it the recent and trending lists — had no way to open.
 *
 * Rather than rebuild any of it, this drives the module from the visible
 * field: focusing it opens the module's dropdown, typing is mirrored into
 * #searchVer2InputBox so Firstmall's own autocomplete still runs, and closing
 * goes back through the skin's own .searchModuleClose handler. Everything the
 * panel shows is still server-rendered by the skin.
 */
(function () {
  "use strict";

  /* Above this the module is a dropdown anchored under the header field;
     below it the prototype turns the same module into a full-screen sheet,
     which trendypicker-search.css lays out. */
  var MIN_WIDTH = 1121;

  /* Gap between the header field and the panel below it, from the prototype. */
  var OFFSET = 23;

  function isDesktop() {
    /* clientWidth so this agrees with the CSS media queries, which do not
       count the scrollbar either. */
    return document.documentElement.clientWidth >= MIN_WIDTH;
  }

  function init() {
    var header = document.getElementById("layout_header");
    var module = document.getElementById("searchVer2");
    if (!header || !module) return;

    var field = header.querySelector("input.tp-header-search-input");
    var pane = module.querySelector(".contetns_area");
    var proxy = document.getElementById("searchVer2InputBox");
    var recent = module.querySelector("#recentArea");
    var auto = module.querySelector("#autoCompleteArea");
    if (!field || !pane || !proxy) return;

    var open = false;

    /* The prototype's panel: centred, held off both edges, and capped. */
    var SIDE_GUTTER = 144;
    var MAX_WIDTH = 1160;

    /* The module sits elsewhere in the header, so the panel is placed against
       the field rather than inheriting its position.

       Coordinates are worked out against the module rather than the viewport:
       the skin leaves a transform on #searchVer2, and a transformed element
       becomes the containing block for fixed descendants — so `fixed` here
       would silently anchor to the module anyway. Measuring from it directly
       is correct whatever the skin does with that transform. */
    /* Drop the dropdown's inline coordinates. The sheet is laid out entirely
       in CSS, and leftovers from a desktop open would drag it off-screen. */
    function clearPlacement() {
      ["display", "position", "top", "left", "right", "width"].forEach(
        function (prop) {
          pane.style[prop] = "";
        }
      );
    }

    function place() {
      pane.style.position = "absolute";

      /* Read the containing block back from the browser rather than assuming
         it: several nodes between here and the module are positioned, and
         offsetParent is the one the offsets will actually be measured from. */
      var host = pane.offsetParent || module;
      var base = host.getBoundingClientRect();
      var f = field.getBoundingClientRect();

      /* clientWidth, not innerWidth: the latter counts the scrollbar, which
         sized the panel ~15px too wide and pushed it off centre — far enough
         at the narrow end of desktop to overflow the page sideways. */
      var viewport = document.documentElement.clientWidth;
      var width = Math.min(viewport - SIDE_GUTTER, MAX_WIDTH);
      var left = (viewport - width) / 2;

      pane.style.top = Math.round(f.bottom - base.top + OFFSET) + "px";
      pane.style.left = Math.round(left - base.left) + "px";
      pane.style.right = "auto";
      pane.style.width = Math.round(width) + "px";
    }

    /* On the sheet both lists show at once, so the tab script's inline
       display:none has to be cleared — and put back when the dropdown takes
       over again, or the desktop tabs would all be open together. */
    function setStacked(stacked) {
      var lists = module.querySelectorAll(
        "#recent-searched-list, #trending-searched-list"
      );

      Array.prototype.forEach.call(lists, function (node) {
        if (stacked) {
          node.style.display = "block";
          return;
        }
        node.style.display = node.parentNode
          .querySelector(".tab_btns > li.on > a[href='#" + node.id + "']")
          ? ""
          : "none";
      });
    }

    function show() {
      if (open) return;
      open = true;

      module.classList.add("on");
      module.classList.add("tp-search-open");
      pane.style.display = "block";
      if (recent) recent.style.display = "";
      if (auto) auto.style.display = "none";

      if (isDesktop()) {
        setStacked(false);
        place();
        return;
      }

      /* Sheet mode: the module carries its own field, so hand focus over. */
      clearPlacement();
      pane.style.display = "block";
      setStacked(true);
      if (window.jQuery) window.jQuery("#layout_wrap").addClass("no_scroll");
      window.setTimeout(function () {
        proxy.focus();
      }, 0);
    }

    function hide() {
      if (!open) return;
      open = false;

      module.classList.remove("on");
      module.classList.remove("tp-search-open");
      clearPlacement();
      setStacked(false);

      /* Hand the rest back to the skin so its own state stays consistent. */
      if (window.jQuery) window.jQuery("#layout_wrap").removeClass("no_scroll");
    }

    field.addEventListener("focus", show);
    field.addEventListener("click", show);

    /* The side menu carries its own search field. It is built after this
       runs — and rebuilt whenever Firstmall refetches the panel — so the
       listener is delegated rather than bound to that input directly. */
    document.addEventListener(
      "focusin",
      function (event) {
        var input = event.target;
        if (!input.closest || !input.closest(".tp-mnav-search")) return;

        /* Close the side menu first: the sheet replaces it rather than
           stacking on top. */
        var close = document.getElementById("side_close");
        if (close && close.classList.contains("on")) close.click();

        show();
      },
      true
    );

    /* Mirror what the shopper types into the module's own input and replay the
       event, so Firstmall's autocomplete and its recent/auto swap both run
       exactly as they do for the stock field. */
    field.addEventListener("input", function () {
      if (!open) show();
      proxy.value = field.value;
      if (window.jQuery) window.jQuery(proxy).trigger("keyup");
    });

    /* The skin's own close button lives inside the panel. */
    module.addEventListener("click", function (event) {
      var target = event.target;
      while (target && target !== module) {
        if (
          target.classList &&
          (target.classList.contains("searchModuleClose") ||
            target.classList.contains("search_close"))
        ) {
          hide();
          return;
        }
        target = target.parentElement;
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") hide();
    });

    document.addEventListener(
      "mousedown",
      function (event) {
        if (!open) return;
        if (pane.contains(event.target) || field.contains(event.target)) return;
        hide();
      },
      true
    );

    window.addEventListener("resize", function () {
      if (!open) return;
      if (isDesktop()) {
        setStacked(false);
        place();
        return;
      }
      setStacked(true);
    });
  }

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  /* The skin binds its own search handlers on DOM ready; running after them
     keeps this a layer on top rather than a replacement. */
  ready(function () {
    window.setTimeout(init, 0);
  });
})();
