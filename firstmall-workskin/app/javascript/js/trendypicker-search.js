/**
 * TrendyPicker search panel bridge.
 * Pairs with css/redesign/trendypicker-search.css.
 *
 * The header redesign put its own search field in .tp-header-search, while
 * Firstmall's search module (#searchVer2) keeps its own input and its own
 * opener (#btnSearchV2). Both of those collapse to 0x0 in this skin, so the
 * module — and with it the recent and trending lists — had no way to open.
 *
 * Rather than rebuild any of it, this drives the module from the visible field
 * on home and the compact magnifier on subpages. Focusing the field opens the
 * module's dropdown, typing is mirrored into #searchVer2InputBox so Firstmall's
 * own autocomplete still runs, and closing goes back through the skin's own
 * .searchModuleClose handler. Everything the panel shows is still
 * server-rendered by the skin.
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
  var MOBILE_NAV_RETURN_ATTRIBUTE = "data-tp-return-mobile-nav";

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

    /* showSearchRecent() can return saved keywords in a mixed order. Its
       recent_seq increases whenever a new keyword is stored, so sort only the
       rendered rows by that value and leave Firstmall's saved data untouched.
       Rows without a sequence are fallback/popular keywords and stay after the
       shopper's real history. */
    function sortRecentSearches() {
      var list = module.querySelector("#recentSearchedList");
      if (!list) return;

      var marker = null;
      var rows = [];

      Array.prototype.forEach.call(list.children, function (row, index) {
        if (row.classList.contains("no_data")) marker = row;
        if (row.classList.contains("recent_search_item")) {
          var remove = row.querySelector(".searching_item_close[data-value]");
          var sequence = remove
            ? parseInt(remove.getAttribute("data-value"), 10)
            : -1;

          rows.push({
            row: row,
            index: index,
            sequence: isNaN(sequence) ? -1 : sequence
          });
        }
      });

      rows.sort(function (a, b) {
        if (a.sequence !== b.sequence) return b.sequence - a.sequence;
        return a.index - b.index;
      });

      var seenKeywords = Object.create(null);
      rows = rows.filter(function (item) {
        var keywordElement = item.row.querySelector(".searched_item");
        var keyword = keywordElement
          ? (keywordElement.textContent || "").trim().toLocaleLowerCase()
          : "";

        if (!keyword || !seenKeywords[keyword]) {
          if (keyword) seenKeywords[keyword] = true;
          return true;
        }

        item.row.remove();
        return false;
      });

      rows.forEach(function (item) {
        list.insertBefore(item.row, marker);
      });
    }

    /* On the search-results request Firstmall can render the header before it
       commits that request's keyword to showSearchRecent(). Merge the current
       query into the rendered list immediately; the next request will receive
       the same row from Firstmall and the duplicate check below reuses it. */
    function syncCurrentSearchHistory() {
      if (window.location.pathname.indexOf("/goods/search") === -1) return;

      var params = new URLSearchParams(window.location.search);
      var keyword = (params.get("search_text") || "").trim();
      if (!keyword) return;

      var list = module.querySelector("#recentSearchedList");
      if (!list) return;

      var normalized = keyword.toLocaleLowerCase();
      var rows = list.querySelectorAll("li.recent_search_item");
      var currentRow = null;

      Array.prototype.some.call(rows, function (row) {
        var searchedItem = row.querySelector(".searched_item");
        var rowKeyword = searchedItem
          ? (searchedItem.textContent || "").trim().toLocaleLowerCase()
          : "";

        if (rowKeyword !== normalized) return false;
        currentRow = row;
        return true;
      });

      if (!currentRow) {
        currentRow = document.createElement("li");
        currentRow.className = "recent_search_item tp-current-search-history";

        var searchedItem = document.createElement("a");
        searchedItem.className = "searched_item";
        searchedItem.href = "javascript:void(0)";
        searchedItem.textContent = keyword;

        var remove = document.createElement("a");
        remove.className = "searching_item_close";
        remove.href = "javascript:void(0)";
        remove.title = "Remove";
        remove.textContent = "Remove";
        remove.addEventListener("click", function (event) {
          event.preventDefault();
          currentRow.remove();
        });

        currentRow.appendChild(searchedItem);
        currentRow.appendChild(remove);
      }

      list.insertBefore(currentRow, list.firstChild);

      var empty = list.querySelector("li.no_data");
      if (empty) empty.style.display = "none";
    }

    /* Firstmall sometimes returns older saved keywords without recent_seq.
       Those rows use the popular_search_item fallback branch in the header
       template, which does not include the stock remove link. Keep every
       visible history chip consistent by supplying a local remove control
       only when the server did not render one. */
    function ensureRecentSearchRemoveButtons() {
      var list = module.querySelector("#recentSearchedList");
      if (!list) return;

      var rows = list.querySelectorAll("li.recent_search_item");

      Array.prototype.forEach.call(rows, function (row) {
        var searchedItem = row.querySelector(".searched_item");
        var keyword = searchedItem
          ? (searchedItem.textContent || "").trim()
          : "";

        /* Do not leave an empty clock-only pill when Firstmall returns a
           fallback record without a keyword. */
        if (!keyword) {
          row.remove();
          return;
        }

        if (row.querySelector(".searching_item_close")) return;

        var remove = document.createElement("a");
        remove.className = "searching_item_close tp-local-search-history-remove";
        remove.href = "javascript:void(0)";
        remove.title = "Remove";
        remove.setAttribute("aria-label", "Remove " + keyword);
        remove.textContent = "Remove";
        remove.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          row.remove();

          var empty = list.querySelector("li.no_data");
          if (empty && !list.querySelector("li.recent_search_item")) {
            empty.style.display = "";
          }
        });

        row.appendChild(remove);
      });
    }

    sortRecentSearches();
    syncCurrentSearchHistory();
    ensureRecentSearchRemoveButtons();

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

    function visibleTrigger() {
      var triggers = header.querySelectorAll(".tp-header-search-trigger");

      for (var i = 0; i < triggers.length; i += 1) {
        var rect = triggers[i].getBoundingClientRect();
        if (rect.width && rect.height) return triggers[i];
      }

      return null;
    }

    function place() {
      var anchor = field;
      var f = anchor.getBoundingClientRect();
      var trigger = visibleTrigger();
      if (!f.width && !f.height && trigger) f = trigger.getBoundingClientRect();
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
      sortRecentSearches();
      syncCurrentSearchHistory();
      ensureRecentSearchRemoveButtons();
      if (open) return;
      open = true;

      if (isDesktop()) header.classList.add("tp-search-panel-active");

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

    /* The side menu can't be covered by the sheet: it lives in a fixed,
       z-index 2001 stacking context, while the sheet is trapped inside
       #layout_header (z-index 200), so no z-index on the sheet can rise above
       it. Instead of animating the menu closed and back open (which flickers),
       it is hidden instantly on open and shown instantly on return — its
       open state (position, scroll lock, close button) is left untouched, so
       restoring is just un-hiding. */
    var parkedNav = false;

    function parkMobileNav() {
      var side = document.getElementById("layout_side");
      if (!side || getComputedStyle(side).display === "none") {
        parkedNav = false;
        return;
      }
      var bg = document.getElementById("layout_side_background");
      parkedNav = true;
      side.style.display = "none";
      if (bg) bg.style.display = "none";
    }

    function restoreMobileNav() {
      if (!parkedNav) return;
      parkedNav = false;
      var side = document.getElementById("layout_side");
      var bg = document.getElementById("layout_side_background");
      if (side) side.style.display = "block";
      if (bg) bg.style.display = "block";
    }

    /* A parked menu that is not being returned to (a search was submitted, or
       a suggestion tapped — both navigate away) is closed out in Firstmall's
       terms so a later open animates in cleanly. The page usually reloads
       right after, but this keeps state sane if it does not. */
    function dismissParkedNav() {
      if (!parkedNav) return;
      parkedNav = false;
      var side = document.getElementById("layout_side");
      var bg = document.getElementById("layout_side_background");
      var sideCloseBtn = document.getElementById("side_close");
      if (side) {
        side.style.display = "none";
        side.style.left = "";
      }
      if (bg) bg.style.display = "none";
      if (sideCloseBtn) sideCloseBtn.classList.remove("on");
      if (window.jQuery) window.jQuery("html, body").css("overflow", "");
      try {
        window.layout_side_opened = false;
      } catch (e) {}
    }

    /* restoreNav: true (default) brings a parked side menu straight back —
       the shopper came from it, so any close returns there. Pass false only on
       the navigating closes (submit, suggestion tap) so the menu is dismissed
       instead. */
    function hide(restoreNav) {
      module.removeAttribute(MOBILE_NAV_RETURN_ATTRIBUTE);
      if (!open) return;
      open = false;

      setStacked(false);
      unlockScroll();

      if (parkedNav) {
        if (restoreNav === false) dismissParkedNav();
        else restoreMobileNav();
      }

      if (isDesktop()) {
        /*
         * Keep the module's open classes and current geometry until the fade-out
         * completes. Removing them first lets Firstmall/CSS collapse the panel
         * before opacity can animate.
         */
        hideDesktopPanel(function () {
          module.classList.remove("on");
          module.classList.remove("tp-search-open");
          header.classList.remove("tp-search-panel-active");
          clearPlacement(true);
          pane.style.display = "none";
        });
        return;
      }

      module.classList.remove("on");
      module.classList.remove("tp-search-open");
      header.classList.remove("tp-search-panel-active");
      setMobileSheetUi(false);
      clearPlacement();
    }

    field.addEventListener("focus", show);
    field.addEventListener("click", show);

    Array.prototype.forEach.call(
      header.querySelectorAll(".tp-header-search-trigger"),
      function (trigger) {
        trigger.addEventListener("click", function (event) {
          event.preventDefault();
          show();
        });
      }
    );

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

        /* Park the side menu instantly (it outranks the sheet on z-index and
           cannot be covered) and mark the origin so the back button restores
           it just as instantly. */
        parkMobileNav();
        if (parkedNav) module.setAttribute(MOBILE_NAV_RETURN_ATTRIBUTE, "1");
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

        hide(false);

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
            var returnToMobileNav =
              isMobileTablet() &&
              target.classList.contains("tp-search-back") &&
              module.getAttribute(MOBILE_NAV_RETURN_ATTRIBUTE) === "1";

            if (isDesktop() || returnToMobileNav) {
              event.preventDefault();
              event.stopImmediatePropagation();
            }

            /* The back arrow returns to the parked menu; the footer "Close"
               (and any other close control) dismisses everything, the menu
               included. returnToMobileNav is already false for those. */
            hide(returnToMobileNav);
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
          hide(false);
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
        /* Test the whole module, not just .contetns_area. The sheet's top bar
           — including the back button — lives in .input_area, a sibling of the
           pane; checking only the pane treated a mousedown on the back button
           as an outside click and closed here first, so the button's own
           click never ran its return-to-menu path (it just closed). */
        if (module.contains(event.target) || field.contains(event.target)) return;
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
        header.classList.add("tp-search-panel-active");
        setMobileSheetUi(false);
        setStacked(false);
        place();
        return;
      }
      header.classList.remove("tp-search-panel-active");
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
