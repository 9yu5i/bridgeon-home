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
  var MIN_WIDTH = 1125;

  /* Gap between the header field and the panel below it, from the prototype. */
  var OFFSET = 25;

  var DESKTOP_FADE_DURATION = 240;
  var desktopFadeTimer = null;

  var MOBILE_TABLET_MAX = 1124;
  var mobileSheetUiApplied = false;

  var floatingObserver = null;



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
    var SIDE_GUTTER = 284;
    var MAX_WIDTH = 1020;

    /* The module sits elsewhere in the header, so the panel is placed against
       the field rather than inheriting its position.

       Coordinates are worked out against the module rather than the viewport:
       the skin leaves a transform on #searchVer2, and a transformed element
       becomes the containing block for fixed descendants — so `fixed` here
       would silently anchor to the module anyway. Measuring from it directly
       is correct whatever the skin does with that transform. */
    /* Drop the dropdown's inline coordinates. The sheet is laid out entirely
       in CSS, and leftovers from a desktop open would drag it off-screen. */
    function clearPlacement(keepDisplay) {
      ["position", "top", "left", "right", "width"].forEach(
        function (prop) {
          pane.style[prop] = "";
        }
      );

      if (!keepDisplay) {
        pane.style.display = "";
      }
    }

    /* One-off restructuring the sheet needs and CSS cannot express:
       - the magnifier and the field become one pill, with the close button
         left outside it;
       - each list gets a real heading row, so Recent can carry the skin's own
         "Clear All" link beside its title instead of hiding it in a footer
         the sheet does not show.
       Nothing is created from scratch — the Clear All anchor is moved, so its
       handler and its data-value keep working. */
    function dressSheet() {
      if (module.getAttribute("data-tp-sheet") === "1") return;
      module.setAttribute("data-tp-sheet", "1");

      var cont = module.querySelector(".input_area .cont");
      var box = cont && cont.querySelector("label.search_box");
      var magnifier = cont && cont.querySelector("button.search");

      if (cont && box && magnifier) {
        var pill = document.createElement("div");
        pill.className = "tp-search-pill";
        cont.insertBefore(pill, box);
        pill.appendChild(box);
        /* Magnifier belongs inside the pill, at its right end — the skin's
           absolutely-positioned close button used to land on top of it. */
        pill.appendChild(magnifier);
      }

      /* Left of the pill: the prototype's back arrow. The skin's own close
         button (searchModuleClose) becomes it — moved to the front and
         restyled — so tapping it still dismisses the panel through the skin's
         handler, and no second control overlaps the magnifier. */
      if (cont) {
        var back = cont.querySelector("button.close, .searchModuleClose");
        if (back) {
          back.classList.add("tp-search-back");
          cont.insertBefore(back, cont.firstChild);
        }
      }

      heading("#recent-searched-list", "Recent Searches", "recent");
      heading("#trending-searched-list", "Trending Searches 🔥", "trending");
    }

    function heading(selector, text, kind) {
      var list = module.querySelector(selector);
      if (!list || list.querySelector(".tp-search-heading")) return;

      var row = document.createElement("div");
      row.className = "tp-search-heading";
      row.setAttribute("data-tp-heading", kind);

      var icon = document.createElement("span");
      icon.className = "tp-search-heading-icon";
      icon.setAttribute("aria-hidden", "true");

      var title = document.createElement("h3");
      title.className = "tp-search-heading-text";
      title.textContent = text;

      row.appendChild(icon);
      row.appendChild(title);

      /* Recent keeps a clear-all control; trending has nothing to clear. */
      if (kind === "recent") {
        var clear = module.querySelector(
          "#recent-searched-list .tab_foot_menu a[data-value='all']"
        );
        if (clear) {
          clear.classList.add("tp-search-clear");
          row.appendChild(clear);
        }
      }

      list.insertBefore(row, list.firstChild);
    }

    function place() {
      var f = field.getBoundingClientRect();
      var host = pane.offsetParent || module;
      var base = host.getBoundingClientRect();
      var viewport = document.documentElement.clientWidth;
      var width = Math.min(viewport - SIDE_GUTTER, MAX_WIDTH);

      /*
       * The panel is position:absolute on desktop. getBoundingClientRect()
       * returns viewport coordinates, so convert the field position into the
       * panel's actual offsetParent coordinate system. This keeps the panel at
       * the same relative position under the search bar even after scrolling.
       */
      pane.style.top = Math.round(f.bottom - base.top + OFFSET) + "px";
      pane.style.left = "50%";
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

    /* Freeze the page behind the sheet on phone and tablet, where the sheet is
       a full-screen overlay. Pinning <body> to its scroll offset is what stops
       a touch scroll bleeding through to the page underneath; only a fixed
       body does that on mobile browsers. The sheet is itself position:fixed,
       so moving the body does not disturb it, and the offset is restored on
       close so the shopper lands back where they were.

       The desktop dropdown is left alone — the page stays scrollable there,
       and locking it would drag the non-sticky header off screen. */
    var lockedY = 0;
    var lockedFixed = false;

    function isMobileTablet() {
      return document.documentElement.clientWidth <= MOBILE_TABLET_MAX;
    }

    function enforceFloatingHidden() {
      if (!open || !isMobileTablet()) {
        return;
      }

      var floating = document.querySelectorAll(
        "#floating_over .ico_floating_top, #floating_over .ico_floating_talk"
      );

      Array.prototype.forEach.call(floating, function (node) {
        if (!node.hasAttribute("data-tp-prev-display")) {
          node.setAttribute(
            "data-tp-prev-display",
            node.style.display || ""
          );
        }

        if (node.style.display !== "none") {
          node.style.display = "none";
        }
      });
    }

    function startFloatingObserver() {
      if (floatingObserver) {
        enforceFloatingHidden();
        return;
      }

      var target = document.body || document.documentElement;
      if (!target) {
        return;
      }

      floatingObserver = new MutationObserver(function (mutations) {
        if (!open || !isMobileTablet()) {
          return;
        }

        var relevant = mutations.some(function (mutation) {
          if (mutation.type === "childList") {
            return true;
          }

          if (
            mutation.type === "attributes" &&
            mutation.target &&
            mutation.target.closest &&
            mutation.target.closest("#floating_over")
          ) {
            return true;
          }

          return false;
        });

        if (relevant) {
          enforceFloatingHidden();
        }
      });

      floatingObserver.observe(target, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"]
      });

      enforceFloatingHidden();
    }

    function stopFloatingObserver() {
      if (!floatingObserver) {
        return;
      }

      floatingObserver.disconnect();
      floatingObserver = null;
    }

    function setMobileSheetUi(active) {
      var rows = module.querySelectorAll(
        "ul.trending_list > li.trending_item"
      );
      var floating = document.querySelectorAll(
        "#floating_over .ico_floating_top, #floating_over .ico_floating_talk"
      );

      if (active && isMobileTablet()) {
        Array.prototype.forEach.call(rows, function (row, index) {
          if (index >= 5) {
            if (!row.hasAttribute("data-tp-prev-display")) {
              row.setAttribute(
                "data-tp-prev-display",
                row.style.display || ""
              );
            }
            row.style.display = "none";
          }
        });

        startFloatingObserver();
        enforceFloatingHidden();

        mobileSheetUiApplied = true;
        return;
      }

      if (!mobileSheetUiApplied) {
        stopFloatingObserver();
        return;
      }

      stopFloatingObserver();

      Array.prototype.forEach.call(rows, function (row) {
        if (!row.hasAttribute("data-tp-prev-display")) {
          return;
        }
        row.style.display = row.getAttribute("data-tp-prev-display");
        row.removeAttribute("data-tp-prev-display");
      });

      Array.prototype.forEach.call(floating, function (node) {
        if (!node.hasAttribute("data-tp-prev-display")) {
          return;
        }
        node.style.display = node.getAttribute("data-tp-prev-display");
        node.removeAttribute("data-tp-prev-display");
      });

      mobileSheetUiApplied = false;
    }

    function lockScroll() {
      if (isDesktop()) return;

      lockedY = window.pageYOffset || document.documentElement.scrollTop || 0;
      lockedFixed = true;
      document.body.style.position = "fixed";
      document.body.style.top = -lockedY + "px";
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    }

    function unlockScroll() {
      if (!lockedFixed) return;
      lockedFixed = false;

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, lockedY);
    }

    function showDesktopPanel() {
      window.clearTimeout(desktopFadeTimer);

      pane.style.display = "block";
      pane.classList.remove("tp-search-panel-closing");
      pane.classList.remove("tp-search-panel-visible");

      /* Commit the hidden state first so every open gets a fresh transition. */
      void pane.offsetHeight;

      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          pane.classList.add("tp-search-panel-visible");
        });
      });
    }

    function hideDesktopPanel(done) {
      window.clearTimeout(desktopFadeTimer);

      pane.style.display = "block";
      pane.classList.remove("tp-search-panel-visible");
      pane.classList.add("tp-search-panel-closing");

      desktopFadeTimer = window.setTimeout(function () {
        pane.classList.remove("tp-search-panel-closing");
        pane.style.display = "none";
        if (typeof done === "function") done();
      }, DESKTOP_FADE_DURATION);
    }

    function show() {
      if (open) return;
      open = true;

      lockScroll();

      module.classList.add("on");
      module.classList.add("tp-search-open");
      if (recent) recent.style.display = "";
      if (auto) auto.style.display = "none";

      if (isDesktop()) {
        setStacked(false);
        place();
        showDesktopPanel();
        return;
      }

      pane.style.display = "block";

      /* Sheet mode: the module carries its own field, so hand focus over. */
      clearPlacement();
      pane.style.display = "block";
      dressSheet();
      setStacked(true);
      setMobileSheetUi(true);
      window.setTimeout(function () {
        setMobileSheetUi(true);
        proxy.focus();
      }, 0);
    }

    function hide() {
      if (!open) return;
      open = false;

      setStacked(false);
      unlockScroll();

      if (isDesktop()) {
        /*
         * Keep the module's open classes and current geometry until the fade-out
         * completes. Removing them first lets Firstmall/CSS collapse the panel
         * before opacity can animate.
         */
        hideDesktopPanel(function () {
          module.classList.remove("on");
          module.classList.remove("tp-search-open");
          clearPlacement(true);
          pane.style.display = "none";
        });
        return;
      }

      module.classList.remove("on");
      module.classList.remove("tp-search-open");
      setMobileSheetUi(false);
      clearPlacement();
    }

    field.addEventListener("focus", show);
    field.addEventListener("click", show);

    window.setTimeout(function () {
      if (
        isMobileTablet() &&
        (
          module.classList.contains("tp-search-open") ||
          module.classList.contains("on")
        )
      ) {
        open = true;
        setMobileSheetUi(true);
      }
    }, 250);

    window.addEventListener("pageshow", function () {
      if (!isMobileTablet()) {
        return;
      }

      if (
        open ||
        module.classList.contains("tp-search-open") ||
        module.classList.contains("on")
      ) {
        open = true;
        setMobileSheetUi(true);
      }
    });

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

    /* A whole recent-search chip or trending row is one search action: click
       anywhere on it (but not its remove ×) to run that keyword and dismiss
       the panel. Capture phase and stopImmediatePropagation keep this the sole
       handler, so the skin's own .searched_item click cannot also fire and
       submit a second time. The panel is closed first — restoring scroll —
       then the search is submitted, which navigates away. */
    module.addEventListener(
      "click",
      function (event) {
        var target = event.target;
        if (target.closest && target.closest(".searching_item_close")) return;

        var row =
          target.closest &&
          target.closest(".recent_search_item, .trending_item");
        if (!row) return;

        var keywordEl = row.querySelector(".searched_item, .trending_keyword");
        var keyword = keywordEl ? (keywordEl.textContent || "").trim() : "";
        if (!keyword) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        hide();

        proxy.value = keyword;
        var form = document.getElementById("topSearchForm");
        if (form) {
          if (window.jQuery) window.jQuery(form).trigger("submit");
          else form.submit();
        }
      },
      true
    );

    /* The skin's own close controls live inside the panel. On desktop capture
       the click before Firstmall's stock handler can immediately set display:none;
       otherwise the fade-out has no frame in which to run. */
    module.addEventListener(
      "click",
      function (event) {
        var target = event.target;
        while (target && target !== module) {
          if (
            target.classList &&
            (target.classList.contains("searchModuleClose") ||
              target.classList.contains("search_close"))
          ) {
            if (isDesktop()) {
              event.preventDefault();
              event.stopImmediatePropagation();
            }
            hide();
            return;
          }
          target = target.parentElement;
        }
      },
      true
    );

    /* Any search — Enter in the field, the magnifier button, or a suggestion —
       submits a form and navigates. Collapse the panel first, or the skin's
       full-height .search_ver2.on overlay stays painted white over the page
       for the whole load. The submit is left to proceed, so navigation still
       happens; only the overlay is dismissed. */
    document.addEventListener(
      "submit",
      function (event) {
        if (!open) return;
        var form = event.target;
        if (!form || !form.getAttribute) return;

        var action = form.getAttribute("action") || "";
        if (
          form.id === "topSearchForm" ||
          form.classList.contains("tp-header-search") ||
          action.indexOf("/goods/search") !== -1
        ) {
          hide();
        }
      },
      true
    );

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") hide();
    });

    var trendingObserver = new MutationObserver(function (mutations) {
      if (!open || !isMobileTablet()) {
        return;
      }

      var changed = mutations.some(function (mutation) {
        return mutation.type === "childList";
      });

      if (changed) {
        setMobileSheetUi(true);
      }
    });

    var trendingList = module.querySelector("ul.trending_list");
    if (trendingList) {
      trendingObserver.observe(trendingList, {
        childList: true,
        subtree: false
      });
    }

    document.addEventListener(
      "mousedown",
      function (event) {
        if (!open) return;
        if (pane.contains(event.target) || field.contains(event.target)) return;
        /* The hamburger opens the side menu, which manages the panel on its
           own — closing here as well would fight it, so it is left alone. */
        if (event.target.closest && event.target.closest(".resp_top_hamburger")) {
          return;
        }
        hide();
      },
      true
    );

    window.addEventListener("resize", function () {
      if (!open) return;
      if (isDesktop()) {
        setMobileSheetUi(false);
        setStacked(false);
        place();
        return;
      }
      setStacked(true);
      setMobileSheetUi(true);
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
