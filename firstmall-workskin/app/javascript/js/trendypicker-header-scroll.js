/**
 * Direction-aware TrendyPicker header for mobile and tablet pages.
 * The full logo/search row returns on upward scroll; downward scroll keeps
 * only the category navigation visible.
 */
(function () {
  "use strict";

  var BREAKPOINT = 1120;
  var DIRECTION_THRESHOLD = 6;

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
    var frame = 0;
    var logoHidden = false;
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
    }

    function restoreDesktopState() {
      header.classList.remove(
        "tp-mobile-scrolled",
        "tp-mobile-scroll-logo-hidden"
      );
      if (addedFlyingClass) header.classList.remove("flying");
      addedFlyingClass = false;
      logoHidden = false;
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

      if (currentY <= 2) {
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
   * hamburger becomes a back button. The icons themselves are swapped in CSS;
   * this only rewires what the two controls do when tapped.
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
      backButton.setAttribute("aria-label", "Back");
      backButton.addEventListener("click", function (event) {
        event.preventDefault();
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = "/main/index";
        }
      });
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
