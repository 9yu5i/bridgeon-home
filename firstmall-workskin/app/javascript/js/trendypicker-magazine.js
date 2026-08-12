/**
 * TrendyPicker T.P Magazine
 * /main/magazine, /board/?id=magazine, /board/view?id=magazine
 * Upload: firstmall-workskin/MAGAZINE-UPLOAD.md
 *
 * 1. Home iframe height sync + bfcache list reset
 * 2. Open article detail in the top window (never inside the iframe)
 * 3. Popular Posts carousel (hit top 10 of loaded page)
 * 4. Detail Related Posts (3 cards)
 * 5. Scroll reveal (below-fold). Lead/Latest animate in CSS on first paint.
 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }
    fn();
  }

  function isIframeDoc() {
    return (
      (document.documentElement &&
        document.documentElement.classList.contains("bo-magazine-iframe")) ||
      /(?:^|[?&])iframe=1(?:&|$)/.test(window.location.search || "")
    );
  }

  function unlockIframeChrome() {
    if (!isIframeDoc()) return;

    document.documentElement.classList.add("bo-magazine-iframe");

    ["#layout_header", "#layout_footer", "#subpageLNB", "#subAllButton"].forEach(
      function (selector) {
        var node = document.querySelector(selector);
        if (node) node.style.setProperty("display", "none", "important");
      }
    );

    [
      "#layout_wrap",
      "#layout_body",
      "#boardlayout",
      ".subpage_wrap",
      ".subpage_container",
      "#bbslist",
    ].forEach(function (selector) {
      var node = document.querySelector(selector);
      if (!node) return;
      node.style.setProperty("width", "100%", "important");
      node.style.setProperty("max-width", "100%", "important");
      node.style.setProperty("min-width", "0", "important");
      node.style.setProperty("height", "auto", "important");
      node.style.setProperty("min-height", "0", "important");
      node.style.setProperty("margin", "0", "important");
      node.style.setProperty("float", "none", "important");
      node.style.setProperty("overflow", "visible", "important");
    });

    if (document.documentElement) {
      document.documentElement.style.setProperty("width", "100%", "important");
      document.documentElement.style.setProperty("max-width", "100%", "important");
      document.documentElement.style.setProperty("min-width", "0", "important");
      document.documentElement.style.setProperty("height", "auto", "important");
      document.documentElement.style.setProperty("min-height", "0", "important");
      document.documentElement.style.setProperty("overflow", "hidden", "important");
    }
    if (document.body) {
      document.body.style.setProperty("width", "100%", "important");
      document.body.style.setProperty("max-width", "100%", "important");
      document.body.style.setProperty("min-width", "0", "important");
      document.body.style.setProperty("height", "auto", "important");
      document.body.style.setProperty("min-height", "0", "important");
      document.body.style.setProperty("overflow", "hidden", "important");
      document.body.style.setProperty("padding", "0 32px 56px", "important");
      document.body.style.setProperty("box-sizing", "border-box", "important");
    }
  }

  /* Measure only magazine board content — never Firstmall body/layout min-heights. */
  function measureMagazineHeight(doc) {
    var root = doc || document;
    var view = root.defaultView;
    var board = root.querySelector(".bo-magazine-board");
    var popular = root.querySelector(".bo-magazine-popular");
    var list = root.querySelector("#bbslist");
    var target = board || list;
    if (!target) return 600;

    var scrollY = view ? view.scrollY || view.pageYOffset || 0 : 0;
    var bottom = target.getBoundingClientRect().bottom + scrollY;

    if (popular) {
      bottom = Math.max(bottom, popular.getBoundingClientRect().bottom + scrollY);
    }

    /* Include body padding (shadow gutter) under the board. */
    var bodyPad = 0;
    if (root.body && view) {
      bodyPad = parseFloat(view.getComputedStyle(root.body).paddingBottom) || 0;
    }

    var next = Math.ceil(bottom + bodyPad + 8);
    if (next < 400) next = 400;
    if (next > 12000) next = 12000;
    return next;
  }

  function postMagazineHeight() {
    if (window.parent === window) return;
    unlockIframeChrome();
    window.parent.postMessage(
      { type: "magazine-frame-height", height: measureMagazineHeight(document) },
      "*"
    );
  }

  function unlockParentLayout() {
    if (document.body) {
      document.body.classList.add("is-magazine-page");
      document.body.style.setProperty("background", "#202020", "important");
      document.body.style.setProperty("overflow-x", "hidden", "important");
      document.body.style.setProperty("overflow-y", "auto", "important");
    }

    ["#layout_wrap", "#layout_body"].forEach(function (selector) {
      var el = document.querySelector(selector);
      if (!el) return;
      el.style.setProperty("width", "100%", "important");
      el.style.setProperty("max-width", "none", "important");
      el.style.setProperty("min-width", "0", "important");
      el.style.setProperty("height", "auto", "important");
      el.style.setProperty("min-height", "0", "important");
      el.style.setProperty("margin", "0", "important");
      el.style.setProperty("padding-left", "0", "important");
      el.style.setProperty("padding-right", "0", "important");
      el.style.setProperty("overflow", "visible", "important");
      el.style.setProperty("float", "none", "important");
      el.style.setProperty("background", "#202020", "important");
    });
  }

  function resetShellInlineBox(shell) {
    if (!shell) return;
    shell.style.removeProperty("padding");
    shell.style.removeProperty("padding-top");
    shell.style.removeProperty("padding-right");
    shell.style.removeProperty("padding-bottom");
    shell.style.removeProperty("padding-left");
    shell.style.removeProperty("height");
    shell.style.removeProperty("min-height");
    shell.style.removeProperty("flex");
  }

  function centerMagazinePage() {
    var main = document.querySelector(".magazine-main");
    if (!main || isIframeDoc()) return;

    unlockParentLayout();

    main.style.setProperty("box-sizing", "border-box", "important");
    main.style.setProperty("display", "flex", "important");
    main.style.setProperty("flex-direction", "column", "important");
    main.style.setProperty("align-items", "center", "important");
    main.style.setProperty("max-width", "none", "important");
    main.style.setProperty("padding", "0", "important");
    main.style.setProperty("float", "none", "important");
    main.style.setProperty("position", "relative", "important");
    main.style.setProperty("left", "auto", "important");
    main.style.setProperty("transform", "none", "important");
    main.style.setProperty("background", "#202020", "important");
    main.style.setProperty("margin-left", "0px", "important");
    main.style.setProperty("width", window.innerWidth + "px", "important");

    var shift = -Math.round(main.getBoundingClientRect().left);
    main.style.setProperty("margin-left", shift + "px", "important");
    main.style.setProperty("width", window.innerWidth + "px", "important");

    var shell = main.querySelector(".magazine-shell, .magazine-detail-shell");
    if (!shell) return;

    resetShellInlineBox(shell);

    var shellWidth = Math.min(1350, Math.max(280, window.innerWidth - 80));
    shell.style.setProperty("box-sizing", "border-box", "important");
    shell.style.setProperty("display", "block", "important");
    shell.style.setProperty("flex", "0 0 auto", "important");
    shell.style.setProperty("width", shellWidth + "px", "important");
    shell.style.setProperty("max-width", "100%", "important");
    shell.style.setProperty("height", "auto", "important");
    shell.style.setProperty("min-height", "0", "important");
    shell.style.setProperty("margin-left", "auto", "important");
    shell.style.setProperty("margin-right", "auto", "important");
    shell.style.setProperty("margin-bottom", "0", "important");
    shell.style.setProperty("overflow", "visible", "important");
    shell.style.setProperty("position", "relative", "important");
    shell.style.setProperty("left", "auto", "important");
    shell.style.setProperty("transform", "none", "important");
  }

  function getMagazineListSrc(frame) {
    return (
      (frame && frame.getAttribute("data-list-src")) ||
      "/board/?id=magazine&iframe=1&perpage=12"
    );
  }

  function isMagazineBoardListHref(href) {
    try {
      var url = new URL(href, window.location.origin);
      var path = url.pathname || "";
      if (/\/board\/view/i.test(path)) return false;
      if (url.searchParams.get("seq")) return false;
      if (url.searchParams.get("mode") === "view") return false;
      if (url.searchParams.get("id") && url.searchParams.get("id") !== "magazine") {
        return false;
      }
      return /\/board\/?$/i.test(path) || path.indexOf("/board") !== -1;
    } catch (_error) {
      return false;
    }
  }

  /* Back/bfcache can leave the iframe on a post view inside /main/magazine. */
  function resetMagazineFrameToList(frame) {
    if (!frame) return;
    var listSrc = getMagazineListSrc(frame);
    try {
      var current = frame.contentWindow && frame.contentWindow.location.href;
      if (current && isMagazineBoardListHref(current) && !/\/board\/view/i.test(current)) {
        return;
      }
      frame.contentWindow.location.replace(listSrc);
    } catch (_error) {
      frame.src = listSrc;
    }
  }

  function toTopMagazineViewUrl(viewlink) {
    try {
      var url = new URL(viewlink, window.location.origin);
      url.searchParams.delete("iframe");
      url.searchParams.delete("popup");
      return url.pathname + url.search + url.hash;
    } catch (_error) {
      return String(viewlink || "")
        .replace(/([?&])iframe=1(?=&|$)/g, "$1")
        .replace(/([?&])popup=1(?=&|$)/g, "$1")
        .replace(/[?&]$/, "")
        .replace(/\?&/, "?");
    }
  }

  function findMagazineViewButton(target) {
    var node = target;
    while (node && node !== document && node !== window) {
      if (node.getAttribute && node.getAttribute("viewlink")) {
        var className = String(node.className || "");
        if (className.indexOf("boad_view_btn") !== -1) return node;
      }
      node = node.parentNode;
    }
    return null;
  }

  /* Open post detail in the top window — never navigate the magazine iframe. */
  function bindMagazineOpenInTop() {
    document.addEventListener(
      "click",
      function (event) {
        var btn = findMagazineViewButton(event.target);
        if (!btn) return;

        var viewlink = btn.getAttribute("viewlink");
        if (!viewlink) return;

        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();

        var targetUrl = toTopMagazineViewUrl(viewlink);
        if (window.top && window.top !== window) {
          window.top.location.assign(targetUrl);
        } else {
          window.location.assign(targetUrl);
        }
      },
      true
    );
  }

  function bindMagazineFrame() {
    var frame = document.getElementById("magazine_home_frame");
    if (!frame) return;

    frame.setAttribute("scrolling", "no");
    frame.style.setProperty("width", "100%", "important");
    frame.style.setProperty("max-width", "100%", "important");
    frame.style.setProperty("display", "block", "important");
    frame.style.setProperty("margin", "0", "important");
    frame.style.setProperty("overflow", "hidden", "important");

    var lastHeight = 0;

    function applyHeight(height) {
      var next = Math.ceil(Number(height) || 0);
      if (next < 400) next = 400;
      if (next > 12000) next = lastHeight > 0 ? lastHeight : 1200;
      if (Math.abs(next - lastHeight) < 2) return;
      lastHeight = next;
      frame.style.height = next + "px";
    }

    function resizeFrame() {
      try {
        var doc = frame.contentDocument || frame.contentWindow.document;
        if (!doc || !doc.body) return;
        applyHeight(measureMagazineHeight(doc));
      } catch (_error) {
        /* ignore */
      }
    }

    window.addEventListener("message", function (event) {
      var data = event && event.data;
      if (!data || data.type !== "magazine-frame-height") return;
      applyHeight(data.height);
    });

    frame.addEventListener("load", function () {
      lastHeight = 0;
      resizeFrame();
      window.setTimeout(resizeFrame, 80);
      centerMagazinePage();
    });

    window.addEventListener("resize", function () {
      centerMagazinePage();
      resizeFrame();
    });

    window.addEventListener("pageshow", function () {
      resetMagazineFrameToList(frame);
      window.setTimeout(function () {
        resetMagazineFrameToList(frame);
        resizeFrame();
        centerMagazinePage();
      }, 0);
    });

    resetMagazineFrameToList(frame);
  }

  /* When post title is a single line, allow excerpt up to 3 lines. */
  function syncPostCardExcerptLines() {
    var cards = document.querySelectorAll(".bo-magazine-post-card");
    if (!cards.length) return;

    Array.prototype.forEach.call(cards, function (card) {
      var titleBtn = card.querySelector("h3 button");
      if (!titleBtn) {
        card.classList.remove("is-title-one-line");
        return;
      }

      var titleBox = titleBtn.closest("h3") || titleBtn;
      var style = window.getComputedStyle(titleBtn);
      var lineHeight = parseFloat(style.lineHeight);
      if (!lineHeight || isNaN(lineHeight)) {
        lineHeight = parseFloat(style.fontSize) * 1.25;
      }

      var isOneLine = titleBox.getBoundingClientRect().height <= lineHeight * 1.5;
      card.classList.toggle("is-title-one-line", isOneLine);
    });
  }

  /* Category grid: always show 12 posts per page (4 rows x 3 columns). */
  function ensureCategoryPerpageTwelve() {
    var board = document.querySelector(".bo-magazine-board.is-category");
    if (!board) return false;

    var url = new URL(window.location.href);
    var per = parseInt(url.searchParams.get("perpage") || "0", 10);
    if (per === 12) return false;

    url.searchParams.set("perpage", "12");
    window.location.replace(url.toString());
    return true;
  }

  function bindMagazinePopular() {
    var section = document.querySelector("[data-magazine-popular]");
    if (!section) return;

    var track = section.querySelector("[data-magazine-popular-track]");
    var controls = section.querySelector("[data-magazine-popular-controls]");
    var prevBtn = section.querySelector("[data-magazine-popular-prev]");
    var nextBtn = section.querySelector("[data-magazine-popular-next]");
    if (!track || !controls || !prevBtn || !nextBtn) return;

    var desktopQuery = window.matchMedia("(min-width: 1121px)");
    var tabletQuery = window.matchMedia("(min-width: 761px)");
    var popularIndex = 0;
    var cards = [];

    function getHit(card) {
      return parseInt(card.getAttribute("data-hit") || "0", 10) || 0;
    }

    function getPopularViewSize() {
      if (desktopQuery.matches) return 3;
      if (tabletQuery.matches) return 2;
      return 1;
    }

    function prepareTopCards() {
      var all = Array.prototype.slice.call(
        track.querySelectorAll(".bo-magazine-post-card")
      );
      all.sort(function (a, b) {
        var hitDiff = getHit(b) - getHit(a);
        if (hitDiff !== 0) return hitDiff;
        return String(b.getAttribute("data-seq") || "").localeCompare(
          String(a.getAttribute("data-seq") || "")
        );
      });

      cards = all.slice(0, 10);
      all.slice(10).forEach(function (card) {
        if (card.parentNode) card.parentNode.removeChild(card);
      });
      cards.forEach(function (card) {
        track.appendChild(card);
      });

      if (!cards.length) section.setAttribute("hidden", "");
    }

    function syncPopularControls() {
      var viewSize = getPopularViewSize();
      var canSlide = cards.length > viewSize;
      controls.hidden = !canSlide;

      if (!canSlide) {
        popularIndex = 0;
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
      }

      var maxIndex = Math.max(0, cards.length - viewSize);
      popularIndex = Math.min(popularIndex, maxIndex);
      prevBtn.disabled = popularIndex <= 0;
      nextBtn.disabled = popularIndex >= maxIndex;
    }

    function syncPopularLayout() {
      var viewSize = getPopularViewSize();
      var maxIndex = Math.max(0, cards.length - viewSize);
      popularIndex = Math.min(popularIndex, maxIndex);

      cards.forEach(function (card, index) {
        var visible = index >= popularIndex && index < popularIndex + viewSize;
        card.classList.toggle("is-popular-visible", visible);
        if (visible) card.removeAttribute("hidden");
        else card.setAttribute("hidden", "");
      });

      syncPopularControls();
      syncPostCardExcerptLines();
      refreshMagazineScrollReveal();
      if (isIframeDoc()) postMagazineHeight();
    }

    function setPopularIndex(nextIndex) {
      var maxIndex = Math.max(0, cards.length - getPopularViewSize());
      popularIndex = Math.max(0, Math.min(nextIndex, maxIndex));
      syncPopularLayout();
    }

    prepareTopCards();
    syncPopularLayout();

    prevBtn.addEventListener("click", function () {
      setPopularIndex(popularIndex - 1);
    });
    nextBtn.addEventListener("click", function () {
      setPopularIndex(popularIndex + 1);
    });

    window.addEventListener("resize", syncPopularLayout);
    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener("change", syncPopularLayout);
      tabletQuery.addEventListener("change", syncPopularLayout);
    } else if (desktopQuery.addListener) {
      desktopQuery.addListener(syncPopularLayout);
      tabletQuery.addListener(syncPopularLayout);
    }
  }

  function applyMagazineImageBackground(el) {
    if (!el) return;
    var img = el.querySelector("img");
    var src = "";
    if (img) src = img.currentSrc || img.src || "";
    if (!src) {
      var styleBg = el.style.backgroundImage || "";
      if (styleBg) el.classList.add("has-image-bg");
      return;
    }
    el.style.backgroundImage = 'url("' + src.replace(/"/g, '\\"') + '")';
    el.classList.add("has-image-bg");
  }

  function syncMagazineImageHover() {
    Array.prototype.forEach.call(
      document.querySelectorAll(".magazine-image"),
      function (el) {
        /* Detail article/hero: no hover wrap. Related grid cards: allow zoom. */
        if (
          el.closest(".magazine-detail-shell") &&
          !el.closest(".magazine-related-grid")
        ) {
          return;
        }
        var img = el.querySelector("img");
        applyMagazineImageBackground(el);
        if (!img || img.complete) return;
        img.addEventListener("load", function () {
          applyMagazineImageBackground(el);
        });
      }
    );
  }

  function revealMagazineTarget(el) {
    if (!el || el.classList.contains("is-inview") || el.getAttribute("data-magazine-revealing") === "1") {
      return;
    }
    el.setAttribute("data-magazine-revealing", "1");
    window.setTimeout(function () {
      el.classList.add("is-inview");
      el.removeAttribute("data-magazine-revealing");
    }, 80);
  }

  function prepareMagazineScrollTarget(el, delay) {
    if (!el) return null;
    el.classList.add("magazine-scroll-reveal");
    if (typeof delay === "number") {
      el.style.setProperty("--magazine-reveal-delay", delay + "s");
    }
    /* Force starting transform/opacity to apply before any reveal. */
    void el.offsetWidth;
    return el;
  }

  function isMagazineDetailPage() {
    return !!(
      document.querySelector(".magazine-detail-main") ||
      document.querySelector(".magazine-detail-shell")
    );
  }

  function isRevealTargetActive(el) {
    if (!el) return false;
    if (el.hasAttribute("hidden")) return false;
    if (el.closest && el.closest("[hidden]")) return false;
    var style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    return true;
  }

  function collectMagazineScrollTargets() {
    var targets = [];

    function add(el, delay) {
      if (!el) return;
      prepareMagazineScrollTarget(el, delay);
      if (targets.indexOf(el) === -1) targets.push(el);
    }

    /* Detail: Related + newsletter only */
    if (isMagazineDetailPage()) {
      add(document.querySelector(".magazine-related"), 0);
      add(document.querySelector(".magazine-newsletter"), 0.06);
      return targets;
    }

    /* Magazine home parent shell */
    if (document.querySelector(".magazine-main") && !isIframeDoc()) {
      add(document.querySelector(".magazine-hero-copy"), 0);
      add(document.querySelector(".magazine-topic-tabs"), 0.05);
      add(document.querySelector(".magazine-newsletter"), 0.08);
    }

    /* Iframe home: lead/latest/side cards animate in CSS. JS only below-fold. */
    if (document.querySelector(".bo-magazine-board") || isIframeDoc()) {
      add(document.querySelector(".bo-magazine-popular"), 0.04);

      Array.prototype.forEach.call(
        document.querySelectorAll(
          ".bo-magazine-category-grid .bo-magazine-post-card, .bo-magazine-popular-grid .bo-magazine-post-card.is-popular-visible"
        ),
        function (card, index) {
          add(card, Math.min(index, 5) * 0.07);
        }
      );
    }

    return targets;
  }

  function getRevealViewportBox(el) {
    var rect = el.getBoundingClientRect();
    var top = rect.top;
    var bottom = rect.bottom;
    if (isIframeDoc()) {
      try {
        var frame = window.frameElement;
        if (frame) {
          var frameRect = frame.getBoundingClientRect();
          top = frameRect.top + rect.top;
          bottom = frameRect.top + rect.bottom;
        }
      } catch (_error) {
        /* keep local rect */
      }
    }
    return { top: top, bottom: bottom };
  }

  function getRevealViewportHeight() {
    if (isIframeDoc()) {
      try {
        return (
          window.parent.innerHeight ||
          (window.parent.document &&
            window.parent.document.documentElement &&
            window.parent.document.documentElement.clientHeight) ||
          window.innerHeight
        );
      } catch (_error) {
        return window.innerHeight;
      }
    }
    return (
      window.innerHeight ||
      (document.documentElement && document.documentElement.clientHeight) ||
      800
    );
  }

  function bindRevealScrollListeners(handler) {
    var roots = [{ win: window, doc: document }];
    if (isIframeDoc()) {
      try {
        if (window.parent && window.parent !== window) {
          roots.push({ win: window.parent, doc: window.parent.document });
        }
      } catch (_error) {
        /* cross-origin parent */
      }
    }

    roots.forEach(function (root) {
      try {
        /* Capture: Firstmall often scrolls #layout_body / wrappers, not window. */
        root.win.addEventListener("scroll", handler, true);
        root.win.addEventListener("resize", handler);
        if (root.doc) {
          root.doc.addEventListener("scroll", handler, true);
        }
      } catch (_error) {
        /* ignore */
      }
    });
  }

  var magazineScrollReveal = {
    bound: false,
    targets: [],
    sync: null,
    observer: null,
  };

  function bindMagazineScrollReveal() {
    document.documentElement.classList.add("is-magazine-reveal-ready");
    magazineScrollReveal.targets = collectMagazineScrollTargets();
    if (!magazineScrollReveal.targets.length) return;

    function revealAll() {
      magazineScrollReveal.targets.forEach(function (el) {
        if (isRevealTargetActive(el)) revealMagazineTarget(el);
      });
    }

    function syncReveal() {
      var viewHeight = getRevealViewportHeight();
      var line = viewHeight * 0.92;
      magazineScrollReveal.targets.forEach(function (el) {
        if (!isRevealTargetActive(el) || el.classList.contains("is-inview")) return;
        var box = getRevealViewportBox(el);
        /* Reveal when any part enters the lower viewport band. */
        if (box.top < line && box.bottom > 24) revealMagazineTarget(el);
      });
    }

    magazineScrollReveal.sync = syncReveal;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealAll();
      magazineScrollReveal.bound = true;
      return;
    }

    if ("IntersectionObserver" in window && !isIframeDoc()) {
      if (magazineScrollReveal.observer) magazineScrollReveal.observer.disconnect();
      magazineScrollReveal.observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            revealMagazineTarget(entry.target);
            if (magazineScrollReveal.observer) {
              magazineScrollReveal.observer.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          /* threshold 0: fire as soon as 1px enters (tall related sections). */
          rootMargin: "0px 0px -8% 0px",
          threshold: 0,
        }
      );
      magazineScrollReveal.targets.forEach(function (el) {
        if (!isRevealTargetActive(el) || el.classList.contains("is-inview")) return;
        magazineScrollReveal.observer.observe(el);
      });
    }

    /* Defer first sync so lead feature can paint opacity:0 first. */
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(syncReveal);
    });

    if (!magazineScrollReveal.bound) {
      bindRevealScrollListeners(syncReveal);
      window.setTimeout(syncReveal, 120);
      magazineScrollReveal.bound = true;
    }
  }

  function refreshMagazineScrollReveal() {
    if (!magazineScrollReveal.bound && !magazineScrollReveal.sync) {
      bindMagazineScrollReveal();
      return;
    }
    magazineScrollReveal.targets = collectMagazineScrollTargets();
    if (magazineScrollReveal.observer) {
      magazineScrollReveal.observer.disconnect();
      magazineScrollReveal.targets.forEach(function (el) {
        if (!isRevealTargetActive(el) || el.classList.contains("is-inview")) return;
        magazineScrollReveal.observer.observe(el);
      });
    }
    if (typeof magazineScrollReveal.sync === "function") magazineScrollReveal.sync();
  }

  function cardSeq(card) {
    if (!card) return "";
    var fromData = card.getAttribute("data-seq");
    if (fromData) return String(fromData);
    var btn = card.querySelector("[board_seq]");
    return btn ? String(btn.getAttribute("board_seq") || "") : "";
  }

  function collectRelatedCards(doc, currentSeq, limit) {
    var seen = {};
    var picked = [];
    var nodes = doc.querySelectorAll(
      ".bo-magazine-category-grid .bo-magazine-post-card, .bo-magazine-popular-grid .bo-magazine-post-card, .bo-magazine-post-card"
    );

    Array.prototype.forEach.call(nodes, function (card) {
      if (picked.length >= limit) return;
      var seq = cardSeq(card);
      if (!seq || seq === currentSeq || seen[seq]) return;
      seen[seq] = true;
      picked.push(card);
    });

    return picked;
  }

  function fetchMagazineListDoc(url) {
    return fetch(url, { credentials: "same-origin" }).then(function (response) {
      if (!response || !response.ok) throw new Error("magazine-related-fetch");
      return response.text();
    }).then(function (html) {
      return new DOMParser().parseFromString(html, "text/html");
    });
  }

  function bindMagazineRelated() {
    var grid = document.querySelector("[data-magazine-related]");
    if (!grid || !window.fetch || !window.DOMParser) return;

    var section = grid.closest(".magazine-related");
    var currentSeq = String(grid.getAttribute("data-current-seq") || "");
    var category = String(grid.getAttribute("data-category") || "").trim();
    var limit = 3;
    var urls = [];

    if (category) {
      urls.push(
        "/board/?id=magazine&iframe=1&perpage=12&category=" +
          encodeURIComponent(category)
      );
    }
    urls.push("/board/?id=magazine&iframe=1&perpage=12");

    function finish(cards) {
      grid.innerHTML = "";
      cards.slice(0, limit).forEach(function (card) {
        var clone = document.importNode(card, true);
        clone.removeAttribute("hidden");
        clone.classList.remove("is-popular-visible");
        clone.removeAttribute("data-hit");
        grid.appendChild(clone);
      });

      if (!grid.children.length) {
        if (section) section.setAttribute("hidden", "");
        return;
      }

      if (section) section.removeAttribute("hidden");
      syncPostCardExcerptLines();
      syncMagazineImageHover();
      refreshMagazineScrollReveal();
    }

    function loadNext(index, collected) {
      if (collected.length >= limit || index >= urls.length) {
        finish(collected);
        return;
      }

      fetchMagazineListDoc(urls[index])
        .then(function (doc) {
          var next = collectRelatedCards(doc, currentSeq, limit);
          var merged = collected.slice();
          var seen = {};
          merged.forEach(function (card) {
            seen[cardSeq(card)] = true;
          });
          next.forEach(function (card) {
            var seq = cardSeq(card);
            if (!seq || seen[seq] || merged.length >= limit) return;
            seen[seq] = true;
            merged.push(card);
          });
          loadNext(index + 1, merged);
        })
        .catch(function () {
          loadNext(index + 1, collected);
        });
    }

    loadNext(0, []);
  }

  ready(function () {
    if (
      !isIframeDoc() &&
      !document.querySelector(".magazine-main, .magazine-detail-main, .bo-magazine-board")
    ) {
      return;
    }
    if (ensureCategoryPerpageTwelve()) return;

    bindMagazineOpenInTop();
    bindMagazinePopular();
    bindMagazineRelated();
    syncPostCardExcerptLines();
    syncMagazineImageHover();
    bindMagazineScrollReveal();
    window.addEventListener("resize", syncPostCardExcerptLines);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        syncPostCardExcerptLines();
        syncMagazineImageHover();
        if (isIframeDoc()) postMagazineHeight();
      });
    }

    if (isIframeDoc()) {
      unlockIframeChrome();
      postMagazineHeight();
      window.addEventListener("resize", postMagazineHeight);

      if (typeof ResizeObserver === "function") {
        var heightFrame = 0;
        var heightObserver = new ResizeObserver(function () {
          if (heightFrame) return;
          heightFrame = window.requestAnimationFrame(function () {
            heightFrame = 0;
            postMagazineHeight();
          });
        });
        [".bo-magazine-board", ".bo-magazine-popular", "#bbslist"].forEach(function (selector) {
          var node = document.querySelector(selector);
          if (node) heightObserver.observe(node);
        });
      }

      window.addEventListener("load", function () {
        unlockIframeChrome();
        postMagazineHeight();
      });
      return;
    }

    centerMagazinePage();
    window.setTimeout(centerMagazinePage, 50);
    window.addEventListener("load", function () {
      centerMagazinePage();
    });
    window.addEventListener("resize", centerMagazinePage);
    bindMagazineFrame();
  });
})();
