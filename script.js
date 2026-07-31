const PAGE_TRANSITION_KEY = "trendypicker-page-transition";
const SCROLL_TOP_ON_NAV_KEY = "trendypicker-scroll-top";
const PAGE_TRANSITION_MS = 320;
const TRENDYPICKER_ROOT_URL = new URL("./", document.currentScript?.src || window.location.href);
const PRODUCT_DETAIL_URL = new URL("product-detail/product-detail.html", TRENDYPICKER_ROOT_URL).href;

const shouldAnimatePageTransition = () =>
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const hasNativeCrossDocTransitions = () => "PageRevealEvent" in window;

const resolveSameOriginUrl = (href) => {
  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin ? url : null;
  } catch {
    return null;
  }
};

const isHashOnlyNavigation = (url) =>
  url.pathname === window.location.pathname &&
  url.search === window.location.search &&
  Boolean(url.hash);

const markScrollTopOnNextPage = (url) => {
  try {
    sessionStorage.setItem(SCROLL_TOP_ON_NAV_KEY, url.href);
  } catch {
    /* ignore quota / private mode failures */
  }
};

const forceScrollToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

const consumeScrollTopOnLoad = () => {
  let requestedUrl = "";

  try {
    requestedUrl = sessionStorage.getItem(SCROLL_TOP_ON_NAV_KEY) || "";
  } catch {
    return false;
  }

  const currentUrl = new URL(window.location.href);
  currentUrl.hash = "";

  const targetUrl = requestedUrl ? resolveSameOriginUrl(requestedUrl) : null;
  if (targetUrl) targetUrl.hash = "";

  const shouldScrollTop =
    requestedUrl === "1" ||
    Boolean(targetUrl && targetUrl.href === currentUrl.href);

  if (!shouldScrollTop) return false;

  try {
    sessionStorage.removeItem(SCROLL_TOP_ON_NAV_KEY);
  } catch {
    /* ignore private mode failures */
  }

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
    window.addEventListener(
      "pagehide",
      () => {
        history.scrollRestoration = "auto";
      },
      { once: true },
    );
  }

  forceScrollToTop();
  window.requestAnimationFrame(() => {
    forceScrollToTop();
    window.requestAnimationFrame(forceScrollToTop);
  });

  if (document.readyState === "complete") {
    window.setTimeout(forceScrollToTop, 0);
  } else {
    window.addEventListener("load", forceScrollToTop, { once: true });
  }

  return true;
};

window.addEventListener("pageshow", () => {
  if (consumeScrollTopOnLoad()) {
    window.requestAnimationFrame(() => {
      forceScrollToTop();
    });
  }
});

consumeScrollTopOnLoad();

const navigateWithPageTransition = (href) => {
  const url = resolveSameOriginUrl(href);
  if (!url || isHashOnlyNavigation(url)) {
    window.location.href = href;
    return;
  }

  markScrollTopOnNextPage(url);

  if (!shouldAnimatePageTransition() || hasNativeCrossDocTransitions()) {
    window.location.href = url.href;
    return;
  }

  sessionStorage.setItem(PAGE_TRANSITION_KEY, "1");
  document.documentElement.classList.add("is-page-leaving");

  window.setTimeout(() => {
    window.location.href = url.href;
  }, PAGE_TRANSITION_MS);
};

window.TrendyPicker = window.TrendyPicker || {};
window.TrendyPicker.navigateWithPageTransition = navigateWithPageTransition;
window.TrendyPicker.productDetailUrl = PRODUCT_DETAIL_URL;
window.TrendyPicker.cartPageUrl = new URL("cart/cart.html", TRENDYPICKER_ROOT_URL).href;

document.addEventListener("click", (event) => {
  if (event.target.closest(".realtrend-cart-toast-close")) return;

  const toast = event.target.closest(".realtrend-cart-toast.is-visible");
  if (!toast) return;

  event.preventDefault();
  navigateWithPageTransition(window.TrendyPicker.cartPageUrl);
});

const isForwardPageLink = (link, event) => {
  if (!link || link.target === "_blank" || link.hasAttribute("download")) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

  const href = link.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("javascript:")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;

  const url = resolveSameOriginUrl(href);
  return Boolean(url && !isHashOnlyNavigation(url));
};

const initPageTransitions = () => {
  // Capture phase so logo / native view-transition navigations also reset scroll.
  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest("a[href]");
      if (!link) return;

      // Home logo on the main page uses href="#"; send the user to the top.
      if (link.classList.contains("logo")) {
        const href = link.getAttribute("href") || "";
        if (href === "#" || href === "") {
          event.preventDefault();
          forceScrollToTop();
          return;
        }
      }

      if (!isForwardPageLink(link, event)) return;
      markScrollTopOnNextPage(resolveSameOriginUrl(link.getAttribute("href")));
    },
    true,
  );

  if (!shouldAnimatePageTransition()) return;

  if (!hasNativeCrossDocTransitions()) {
    if (sessionStorage.getItem(PAGE_TRANSITION_KEY)) {
      sessionStorage.removeItem(PAGE_TRANSITION_KEY);
      document.documentElement.classList.add("is-page-entering");
      window.setTimeout(() => {
        document.documentElement.classList.remove("is-page-entering");
      }, PAGE_TRANSITION_MS);
    }

    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!isForwardPageLink(link, event)) return;
      if (event.defaultPrevented) return;

      event.preventDefault();
      navigateWithPageTransition(resolveSameOriginUrl(link.getAttribute("href")).href);
    });
  }

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    document.documentElement.classList.remove("is-page-leaving", "is-page-entering");
    document.body.style.opacity = "";
  });
};

initPageTransitions();
