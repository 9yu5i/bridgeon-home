/**
 * Direction-aware TrendyPicker header for mobile and tablet pages.
 * The full logo/search row returns on upward scroll; downward scroll keeps
 * only the category navigation visible.
 */
(function () {
  "use strict";

  var BREAKPOINT = 1120;
  var DIRECTION_THRESHOLD = 6;
  var TOP_ACTIVATION_Y = 24;
  var TOP_RESET_Y = 2;
  var MAIN_HERO_HOLD_RATIO = 0.35;

  function isMobileOrTablet() {
    return window.innerWidth <= BREAKPOINT;
  }

  function bindDirectionalHeader() {
    var header = document.getElementById("layout_header");
    var logo = header && header.querySelector(".logo_wrap");
    var categoryNav = header && header.querySelector("#cateSwiper.nav_wrap");
    if (!header || !logo || !categoryNav) return;

    var layoutBody = document.getElementById("layout_body");
    var promo = header.querySelector(".top_header_banner");
    var mainHero = document.getElementById("main-slide-mo");
    var isMainPage =
      !header.classList.contains("tp-header-subpage") && !!mainHero;
    var initialBodyPadding = layoutBody ? layoutBody.style.paddingTop : "";
    var initialLogoDisplay = logo.style.getPropertyValue("display");
    var initialLogoDisplayPriority = logo.style.getPropertyPriority("display");
    var initialPromoDisplay = promo
      ? promo.style.getPropertyValue("display")
      : "";
    var initialPromoDisplayPriority = promo
      ? promo.style.getPropertyPriority("display")
      : "";
    var directionAnchor = window.scrollY || window.pageYOffset || 0;
    var expandedHeaderHeight = 0;
    var mainHeroHoldY = 0;
    var frame = 0;
    var logoHidden = false;
    var scrollActivated = false;
    var addedFlyingClass = false;

    function restoreInlineDisplay(node, value, priority) {
      if (!node) return;
      if (value) {
        node.style.setProperty("display", value, priority);
      } else {
        node.style.removeProperty("display");
      }
    }

    function syncHeaderRows(scrolled, hideLogo) {
      if (scrolled && promo) {
        promo.style.setProperty("display", "none", "important");
      } else {
        restoreInlineDisplay(
          promo,
          initialPromoDisplay,
          initialPromoDisplayPriority
        );
      }

      if (hideLogo) {
        logo.style.setProperty("display", "none", "important");
      } else {
        restoreInlineDisplay(
          logo,
          initialLogoDisplay,
          initialLogoDisplayPriority
        );
      }
    }

    function measureExpandedHeader() {
      var hadScrolledClass = header.classList.contains("tp-mobile-scrolled");
      var hadHiddenClass = header.classList.contains(
        "tp-mobile-scroll-logo-hidden"
      );
      var promoDisplay = promo ? promo.style.display : "";

      header.classList.remove(
        "tp-mobile-scrolled",
        "tp-mobile-scroll-logo-hidden"
      );
      syncHeaderRows(false, false);
      expandedHeaderHeight = Math.ceil(header.getBoundingClientRect().height);
      if (promo) promo.style.display = promoDisplay;
      if (hadScrolledClass) header.classList.add("tp-mobile-scrolled");
      if (hadHiddenClass) {
        header.classList.add("tp-mobile-scroll-logo-hidden");
      }
      syncHeaderRows(hadScrolledClass, hadHiddenClass);

      if (isMainPage) {
        var heroHeight = Math.ceil(mainHero.getBoundingClientRect().height);
        mainHeroHoldY = Math.max(
          120,
          Math.min(240, Math.round(heroHeight * MAIN_HERO_HOLD_RATIO))
        );
      }
    }

    function restoreDesktopState() {
      header.classList.remove(
        "tp-mobile-scrolled",
        "tp-mobile-scroll-logo-hidden"
      );
      if (addedFlyingClass) header.classList.remove("flying");
      addedFlyingClass = false;
      logoHidden = false;
      scrollActivated = false;
      syncHeaderRows(false, false);
      if (layoutBody) layoutBody.style.paddingTop = initialBodyPadding;
    }

    function update() {
      frame = 0;

      if (!isMobileOrTablet()) {
        restoreDesktopState();
        return;
      }

      var currentY = Math.max(0, window.scrollY || window.pageYOffset || 0);

      if (
        currentY <= TOP_RESET_Y ||
        (!scrollActivated && currentY <= TOP_ACTIVATION_Y)
      ) {
        if (currentY <= TOP_RESET_Y) scrollActivated = false;
        logoHidden = false;
        directionAnchor = 0;
        header.classList.remove(
          "tp-mobile-scrolled",
          "tp-mobile-scroll-logo-hidden"
        );
        if (addedFlyingClass) header.classList.remove("flying");
        addedFlyingClass = false;
        syncHeaderRows(false, false);
        if (layoutBody) layoutBody.style.paddingTop = initialBodyPadding;
        return;
      }

      scrollActivated = true;

      /* Keep the complete home header visible through the opening portion of
         the hero. This avoids exposing the expanded-header spacer as a blank
         band when an iPhone reports its first small scroll movement. */
      if (isMainPage && currentY < mainHeroHoldY) {
        logoHidden = false;
        directionAnchor = currentY;
        header.classList.remove(
          "tp-mobile-scrolled",
          "tp-mobile-scroll-logo-hidden"
        );
        syncHeaderRows(false, false);

        if (!header.classList.contains("flying")) {
          header.classList.add("flying");
          addedFlyingClass = true;
        }

        if (layoutBody && expandedHeaderHeight > 0) {
          layoutBody.style.paddingTop = expandedHeaderHeight + "px";
        }
        return;
      }

      if (currentY >= directionAnchor + DIRECTION_THRESHOLD) {
        logoHidden = true;
        directionAnchor = currentY;
      } else if (currentY <= directionAnchor - DIRECTION_THRESHOLD) {
        logoHidden = false;
        directionAnchor = currentY;
      }

      header.classList.add("tp-mobile-scrolled");
      header.classList.toggle(
        "tp-mobile-scroll-logo-hidden",
        logoHidden
      );
      syncHeaderRows(true, logoHidden);

      if (!header.classList.contains("flying")) {
        header.classList.add("flying");
        addedFlyingClass = true;
      }

      if (layoutBody && expandedHeaderHeight > 0) {
        layoutBody.style.paddingTop = expandedHeaderHeight + "px";
      }
    }

    function requestUpdate() {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    }

    measureExpandedHeader();
    update();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", function () {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      measureExpandedHeader();
      directionAnchor = window.scrollY || window.pageYOffset || 0;
      update();
    });
  }

  /**
   * On every page except the main page the header carries the
   * `tp-header-subpage` class (added inline in layout_header/standard.html).
   * There the mobile/tablet My Page icon becomes a search trigger and the
   * left control becomes Back. The Back listener runs in the capture phase and
   * stops Firstmall's category drawer handler before it can open the panel.
   */
  function bindSubpageControls() {
    var header = document.getElementById("layout_header");
    if (!header || !header.classList.contains("tp-header-subpage")) return;

    var searchIcon = header.querySelector(".resp_top_mypge");
    if (searchIcon) {
      searchIcon.setAttribute("aria-label", "Search");
      searchIcon.addEventListener("click", function (event) {
        event.preventDefault();
        var trigger = document.getElementById("btnSearchV2");
        if (trigger) {
          trigger.click();
        } else {
          window.location.href = "/goods/search";
        }
      });
    }

    var backButton = header.querySelector(
      ".resp_wrap .logo_wrap .resp_top_hamburger > a"
    );
    if (backButton) {
      backButton.setAttribute("href", "/main/index");
      backButton.setAttribute("aria-label", "Back");
      backButton.addEventListener(
        "click",
        function (event) {
          event.preventDefault();
          event.stopImmediatePropagation();

          if (document.referrer && window.history.length > 1) {
            window.history.back();
          } else {
            window.location.href = "/main/index";
          }
        },
        true
      );
    }
  }

  function init() {
    bindDirectionalHeader();
    bindSubpageControls();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
