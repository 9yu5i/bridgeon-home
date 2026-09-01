/**
 * TrendyPicker mobile side navigation.
 * Pairs with css/redesign/trendypicker-mobile-nav.css.
 *
 * Firstmall builds #layout_side lazily: the element ships empty, and the first
 * hamburger tap fetches /common/ajax_mobile_layout_side. The skin decides
 * whether to fetch by testing $("#layout_side").html()=='' — so nothing may be
 * written into the panel before that fetch, or the categories never load.
 * Everything here therefore waits for the fetched markup to appear.
 *
 * That markup is a flat list of
 *   li.mitem.category    — a 1st-level category
 *   li.mitem_subcontents — its children, nested as .category2 / .category3
 *
 * It gets reshaped into the prototype's browser: a search bar, a row of quick
 * links, then 1st-level categories in a left rail with the selected one's
 * 2nd-level children as a grid on the right. The category markup is reused
 * rather than rebuilt, so anything added in the Firstmall admin shows up here
 * without further work.
 */
(function () {
  "use strict";

  var BREAKPOINT = 1120;

  /* "<Section> Trendy Pick" rows are a desktop shortcut rather than a real
     category, so they are left out of this grid. Only this panel is affected:
     the desktop mega menu is server-rendered in layout_header/standard.html
     and never passes through here. */
  var SKIP_LABEL = /trendy\s*pick$/i;

  /* Quick links across the top. Kept in step with the desktop nav in
     layout_header/standard.html. */
  var QUICK_LINKS = [
    { label: "Brand", href: "/goods/brand_main" },
    { label: "Best Seller", href: "/goods/best" },
    { label: "New Arrival", href: "/goods/new_arrivals" },
    { label: "Time Deal", href: "/promotion/timedeal" }
  ];

  function isMobile() {
    return window.innerWidth <= BREAKPOINT;
  }

  function firstLevelItems(menu) {
    return Array.prototype.filter.call(menu.children, function (node) {
      return node.classList.contains("mitem") && node.classList.contains("category");
    });
  }

  function subContentsFor(item) {
    var next = item.nextElementSibling;
    return next && next.classList.contains("mitem_subcontents") ? next : null;
  }

  function textOf(node) {
    return node ? (node.textContent || "").replace(/\s+/g, " ").trim() : "";
  }

  function labelOf(item) {
    return textOf(item.querySelector("a.mitem_goodsview"));
  }

  /* Cell artwork is looked up in trendypicker-mobile-nav.css by
     "<rail slug>-<category slug>" — the stylesheet sits beside the image
     folder, so the paths resolve there rather than from this script. A name
     with no matching rule just keeps the plain circle. */
  function slug(text) {
    return text
      .toLowerCase()
      /* Apostrophes drop out rather than becoming separators, so "Men's"
         keys as "mens" and not "men-s". */
      .replace(/['‘’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function hrefOf(item) {
    var link = item.querySelector("a.mitem_goodsview");
    return link ? link.getAttribute("href") || "#" : "#";
  }

  /* Second-level entries only: .category2 nodes directly inside the sub list.
     Their own .category3 children are left out — this pane is a grid of
     2nd-level categories, and the 3rd level lives on the listing page. */
  function secondLevel(sub) {
    if (!sub) return [];
    var list = sub.querySelector("ul.submenu");
    if (!list) return [];
    return Array.prototype.filter
      .call(list.children, function (node) {
        return node.classList.contains("category2");
      })
      .map(function (node) {
        var link = node.querySelector("a.mitem_goodsview");
        return {
          label: textOf(link),
          href: link ? link.getAttribute("href") || "#" : "#"
        };
      })
      .filter(function (entry) {
        return entry.label && !SKIP_LABEL.test(entry.label);
      });
  }

  function buildTopBar() {
    var bar = document.createElement("div");
    bar.className = "tp-mnav-top";

    var form = document.createElement("form");
    form.className = "tp-mnav-search";
    form.setAttribute("action", "/goods/search");
    form.setAttribute("method", "get");
    form.setAttribute("role", "search");

    var input = document.createElement("input");
    input.type = "text";
    input.name = "search_text";
    input.autocomplete = "off";
    input.placeholder = "Search by Keyword or Item Name";
    input.setAttribute("aria-label", "Search");

    var submit = document.createElement("button");
    submit.type = "submit";
    submit.setAttribute("aria-label", "Search");

    form.appendChild(input);
    form.appendChild(submit);

    bar.appendChild(form);

    /* Adopt the skin's own close button into the bar. It keeps its id and its
       click handler — jQuery bound that to the node itself at page load, and
       moving a node does not detach listeners — but as a child of the panel
       it now slides in with the menu instead of sitting fixed against the
       viewport, with no animation of ours to keep in step. */
    var close = document.getElementById("side_close");
    if (close) bar.appendChild(close);

    return bar;
  }

  /* Plain links, with no current-page highlight: the row is a shortcut bar,
     not a set of tabs, so marking one of them reads as a selected state the
     panel does not actually have. */
  function buildQuickLinks() {
    var nav = document.createElement("nav");
    nav.className = "tp-mnav-quick";
    nav.setAttribute("aria-label", "Quick links");

    QUICK_LINKS.forEach(function (entry) {
      var link = document.createElement("a");
      link.href = entry.href;
      link.textContent = entry.label;
      nav.appendChild(link);
    });

    return nav;
  }

  /* Grid cells are about 74px wide on a phone, and a label such as
     "Fashion&Accessories" joins two words with no space, so the line has
     nowhere to break and spills over its neighbours. Offer a break right
     after the joining character — "Fashion&" / "Accessories". A separator
     that already has a space after it needs nothing. */
  function appendLabel(parent, label) {
    var buffer = "";

    for (var i = 0; i < label.length; i++) {
      var ch = label.charAt(i);
      buffer += ch;

      var joins = ch === "&" || ch === "/";
      var nextChar = label.charAt(i + 1);
      if (!joins || !nextChar || nextChar === " ") continue;

      parent.appendChild(document.createTextNode(buffer));
      parent.appendChild(document.createElement("wbr"));
      buffer = "";
    }

    if (buffer) parent.appendChild(document.createTextNode(buffer));
  }

  function renderContent(pane, item) {
    pane.innerHTML = "";
    /* A new category starts at its own top, not wherever the last one was
       scrolled to. */
    pane.scrollTop = 0;

    var head = document.createElement("a");
    head.className = "tp-mnav-content-head";
    head.href = hrefOf(item);
    head.appendChild(document.createTextNode(labelOf(item)));
    var chevron = document.createElement("span");
    chevron.setAttribute("aria-hidden", "true");
    chevron.textContent = ">";
    head.appendChild(chevron);
    pane.appendChild(head);

    /* Read the captured list, not the DOM: the sub row is detached while the
       rail is assembled, so looking it up again here would find nothing. */
    var entries = item.tpSecondLevel || [];
    if (!entries.length) return;

    var grid = document.createElement("ul");
    grid.className = "tp-mnav-grid";

    var group = slug(labelOf(item));

    entries.forEach(function (entry) {
      var cell = document.createElement("li");
      var link = document.createElement("a");
      link.href = entry.href;

      var thumb = document.createElement("span");
      thumb.className = "tp-mnav-thumb";
      thumb.setAttribute("aria-hidden", "true");
      thumb.setAttribute("data-tp-thumb", group + "-" + slug(entry.label));

      /* The link is a grid container, so the label needs its own element:
         loose text plus <wbr> would each become separate grid items. */
      var text = document.createElement("span");
      text.className = "tp-mnav-label";
      appendLabel(text, entry.label);

      link.appendChild(thumb);
      link.appendChild(text);
      cell.appendChild(link);
      grid.appendChild(cell);
    });

    pane.appendChild(grid);
  }

  /* Keep the selected row in view. The rail scrolls separately from the page,
     so this nudges it only when the row has actually fallen outside. */
  function revealInRail(rail, item) {
    var top = item.offsetTop;
    var bottom = top + item.offsetHeight;

    if (top < rail.scrollTop) rail.scrollTop = top;
    else if (bottom > rail.scrollTop + rail.clientHeight) {
      rail.scrollTop = bottom - rail.clientHeight;
    }
  }

  /* `direction` is +1 for a step towards the next category and -1 for the
     previous one; it feeds the CSS that slides the new pane in from that
     side. A plain click passes nothing and just fades. */
  function activate(rail, pane, items, item, direction) {
    items.forEach(function (node) {
      node.classList.toggle("is-active", node === item);
    });

    pane.style.setProperty(
      "--tp-mnav-shift",
      direction > 0 ? "16px" : direction < 0 ? "-16px" : "0px"
    );

    renderContent(pane, item);
    revealInRail(rail, item);
  }

  function activeIndex(items) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].classList.contains("is-active")) return i;
    }
    return -1;
  }

  /* A vertical drag across the grid steps to the neighbouring category: up
     for the next one, down for the previous. That is also the scroll gesture,
     so the drag has to be long enough, clearly more up-and-down than
     sideways, and start from a grid that has nowhere left to scroll that way
     — a long list scrolls to its end first and only then steps across. */
  var SWIPE_MIN_Y = 45;
  var SWIPE_Y_OVER_X = 1.2;

  function bindSwipe(pane, step) {
    var startX = 0;
    var startY = 0;
    var tracking = false;

    pane.addEventListener(
      "touchstart",
      function (event) {
        tracking = event.touches.length === 1;
        if (!tracking) return;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
      },
      { passive: true }
    );

    pane.addEventListener(
      "touchend",
      function (event) {
        if (!tracking) return;
        tracking = false;

        var touch = event.changedTouches[0];
        if (!touch) return;

        var dx = touch.clientX - startX;
        var dy = touch.clientY - startY;
        if (Math.abs(dy) < SWIPE_MIN_Y) return;
        if (Math.abs(dy) < Math.abs(dx) * SWIPE_Y_OVER_X) return;

        /* scrollTop is read after the drag, so anything the grid could absorb
           it already has: still short of an edge means the gesture was a
           scroll, not a step. */
        var slack = pane.scrollHeight - pane.clientHeight;
        if (dy < 0 && pane.scrollTop < slack - 1) return;
        if (dy > 0 && pane.scrollTop > 1) return;

        step(dy < 0 ? 1 : -1);
      },
      { passive: true }
    );

    pane.addEventListener(
      "touchcancel",
      function () {
        tracking = false;
      },
      { passive: true }
    );
  }

  function build(side) {
    var menu = side.querySelector("#categorySideMenu");
    if (!menu || menu.getAttribute("data-tp-mnav") === "1") return false;

    var items = firstLevelItems(menu);
    if (!items.length) return false;

    /* Capture each category's children before anything is detached, and keep
       only the categories that have some. The flat links (PROMOTION,
       MAGAZINE …) are covered by the quick-link row and the desktop nav, so
       they are left out rather than shown as empty panes. */
    var withChildren = items.filter(function (item) {
      item.tpSecondLevel = secondLevel(subContentsFor(item));
      return item.tpSecondLevel.length > 0;
    });
    if (!withChildren.length) return false;

    /* Claim the menu first: moving nodes below fires the observer that called
       us, and this is what stops it recursing. */
    menu.setAttribute("data-tp-mnav", "1");

    var rail = document.createElement("div");
    rail.className = "tp-mnav-rail";

    var pane = document.createElement("div");
    pane.className = "tp-mnav-content";

    withChildren.forEach(function (item) {
      var sub = subContentsFor(item);
      if (sub && sub.parentNode) sub.parentNode.removeChild(sub);
      rail.appendChild(item);

      item.addEventListener("click", function (event) {
        /* The rail selects; it does not navigate. The category's own page is
           still reachable from the heading link in the right pane. */
        event.preventDefault();
        activate(rail, pane, withChildren, item);
      });
    });

    /* Swiping the grid walks the rail. It stops at either end rather than
       wrapping, so the first and last category stay recognisable as such. */
    bindSwipe(pane, function (offset) {
      var next = activeIndex(withChildren) + offset;
      if (next < 0 || next >= withChildren.length) return;
      activate(rail, pane, withChildren, withChildren[next], offset);
    });

    /* Drop whatever is left (the flat links and their empty sub rows). */
    while (menu.firstChild) menu.removeChild(menu.firstChild);

    /* The two panes sit in a wrapper rather than directly in the menu: the
       panel's own script calls jQuery .show() on ul.menu, and the inline
       display:block that leaves behind would beat any flex rule aimed at the
       menu itself. Nothing writes inline styles to this wrapper. */
    var body = document.createElement("div");
    body.className = "tp-mnav-body";
    body.appendChild(rail);
    body.appendChild(pane);
    menu.appendChild(body);

    /* The panel scrolls as one column: a fixed head, then a body that takes
       the rest. #layout_side itself keeps the skin's own display value, which
       jQuery toggles inline when the panel slides in and out. */
    var shell = document.createElement("div");
    shell.className = "tp-mnav-shell";
    shell.appendChild(buildTopBar());
    shell.appendChild(buildQuickLinks());

    shell.appendChild(side.querySelector(".aside_navigation_wrap") || menu);

    side.appendChild(shell);

    activate(rail, pane, withChildren, withChildren[0]);
    return true;
  }

  function tryBuild() {
    if (!isMobile()) return false;
    var side = document.getElementById("layout_side");
    /* Empty until the first hamburger tap fetches the markup — leave it that
       way, or the skin's html()=='' test stops the fetch from happening. */
    if (!side || !side.querySelector("#categorySideMenu")) return false;
    return build(side);
  }

  function bindHamburgerLink() {
    var hamburger = document.querySelector(
      "#layout_header.layout_header .resp_wrap .logo_wrap .resp_top_hamburger > a"
    );
    if (!hamburger || hamburger.dataset.tpMobileNavHashBound === "true") return;

    hamburger.dataset.tpMobileNavHashBound = "true";
    hamburger.addEventListener(
      "click",
      function (event) {
        var header = document.getElementById("layout_header");
        if (header && header.classList.contains("tp-header-subpage")) return;

        // Firstmall opens the side panel from this click. Its #category href
        // must not also trigger a fragment jump, which briefly shifts the page
        // horizontally before the panel animation returns it.
        if (isMobile()) event.preventDefault();
      },
      true
    );
  }

  function watch() {
    var side = document.getElementById("layout_side");
    if (!side) return;

    if (tryBuild()) return;

    if (typeof window.MutationObserver !== "function") {
      /* No observer: fall back to a few checks after the likely fetch. */
      [600, 1400, 2600].forEach(function (delay) {
        window.setTimeout(tryBuild, delay);
      });
      return;
    }

    var observer = new window.MutationObserver(function () {
      if (tryBuild()) observer.disconnect();
    });
    observer.observe(side, { childList: true });
  }

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  ready(function () {
    bindHamburgerLink();
    watch();
  });
})();
