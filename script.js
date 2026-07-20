const PAGE_TRANSITION_KEY = "bridgeon-page-transition";
const PAGE_TRANSITION_MS = 320;
const BRIDGEON_ROOT_URL = new URL("./", document.currentScript?.src || window.location.href);
const PRODUCT_DETAIL_URL = new URL("product-detail/product-detail.html", BRIDGEON_ROOT_URL).href;

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

const navigateWithPageTransition = (href) => {
  const url = resolveSameOriginUrl(href);
  if (!url || isHashOnlyNavigation(url)) {
    window.location.href = href;
    return;
  }

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

window.BridgeOn = window.BridgeOn || {};
window.BridgeOn.navigateWithPageTransition = navigateWithPageTransition;
window.BridgeOn.productDetailUrl = PRODUCT_DETAIL_URL;

const CART_STORAGE_KEY = "bridgeon-cart-items";

const parseCartNumber = (value, fallback = 0) => {
  const parsed = Number.parseFloat(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatCartPrice = (value) => `US$${parseCartNumber(value).toFixed(2)}`;

const normalizeCartItem = (item = {}) => {
  const brand = String(item.brand || "BridgeOn").trim();
  const name = String(item.name || "Product").trim();
  const option = String(item.option || "").trim();
  const price = formatCartPrice(item.price || "US$22.00");
  const originalPrice = item.originalPrice ? formatCartPrice(item.originalPrice) : "";
  const tone = String(item.tone || "green").trim();
  const quantity = Math.max(1, Number.parseInt(item.quantity, 10) || 1);
  const id = item.id || [brand, name, option, price].join("|").toLowerCase().replace(/\s+/g, "-");

  return { id, brand, name, option, price, originalPrice, tone, quantity };
};

const readCartItems = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.map(normalizeCartItem) : [];
  } catch {
    return [];
  }
};

const writeCartItems = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.map(normalizeCartItem)));
  window.dispatchEvent(new CustomEvent("bridgeon:cartchange", { detail: { items: readCartItems() } }));
};

const getCartCount = () =>
  readCartItems().reduce((sum, item) => sum + item.quantity, 0);

const updateCartBadges = () => {
  const count = getCartCount();
  document.querySelectorAll(".cart-badge, .cart-link b").forEach((badge) => {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  });

  document.querySelectorAll(".cart-icon-button, .product-mobile-gnb-cart").forEach((link) => {
    link.setAttribute("aria-label", `Cart, ${count} item${count === 1 ? "" : "s"}`);
  });
};

window.BridgeOn.cart = {
  getItems: readCartItems,
  getCount: getCartCount,
  formatPrice: formatCartPrice,
  parsePrice: parseCartNumber,
  setItems: writeCartItems,
  add(item) {
    const nextItem = normalizeCartItem(item);
    const items = readCartItems();
    const existing = items.find((cartItem) => cartItem.id === nextItem.id);

    if (existing) existing.quantity += nextItem.quantity;
    else items.push(nextItem);

    writeCartItems(items);
    updateCartBadges();
    return nextItem;
  },
  updateQuantity(id, quantity) {
    const items = readCartItems()
      .map((item) => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item);
    writeCartItems(items);
    updateCartBadges();
  },
  remove(id) {
    writeCartItems(readCartItems().filter((item) => item.id !== id));
    updateCartBadges();
  },
  clearSelected(ids) {
    const removeIds = new Set(ids);
    writeCartItems(readCartItems().filter((item) => !removeIds.has(item.id)));
    updateCartBadges();
  },
  updateBadges: updateCartBadges,
};

const loadBridgeOnComponent = (path) => {
  const componentScript = document.createElement("script");
  componentScript.async = false;
  componentScript.src = new URL(path, BRIDGEON_ROOT_URL).href;
  document.head.append(componentScript);
};

const initPageTransitions = () => {
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
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const url = resolveSameOriginUrl(href);
      if (!url || isHashOnlyNavigation(url)) return;

      event.preventDefault();
      navigateWithPageTransition(url.href);
    });
  }

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    document.documentElement.classList.remove("is-page-leaving", "is-page-entering");
    document.body.style.opacity = "";
  });
};

initPageTransitions();
loadBridgeOnComponent("scripts/components/header-navigation.js");
updateCartBadges();
window.addEventListener("storage", (event) => {
  if (event.key === CART_STORAGE_KEY) updateCartBadges();
});

const initScrollReveals = () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.remove("scroll-reveal-pending");
    return;
  }

  const addLineReveal = (root) => {
    root.querySelectorAll(
      ".section-heading h2, .inline-heading h2, .mobile-section-title, .editor-card-title",
    ).forEach((heading) => {
      heading.classList.add("scroll-reveal-line");
    });
  };

  const addStaggerItems = (container, selector, staggerStep = 0.08) => {
    if (!container) return;
    container.classList.add("scroll-reveal-stagger");
    container.querySelectorAll(selector).forEach((item, index) => {
      item.classList.add("scroll-reveal-item");
      item.style.setProperty("--reveal-index", String(index));
      item.style.setProperty("--reveal-stagger", `${staggerStep}s`);
    });
  };

  const initRailSectionReveal = (section, { cardSelector, autoPlayOnLoad = false }) => {
    if (!section) return null;
    section.classList.add("scroll-reveal-rail");
    addLineReveal(section);
    addStaggerItems(section.querySelector(".card-rail"), cardSelector, 0.06);
    if (autoPlayOnLoad) {
      window.setTimeout(() => activateRevealSection(section), 420);
    }
    return section;
  };

  const activateRevealSection = (section) => {
    if (!section || section.classList.contains("is-inview")) return;
    section.classList.add("is-inview");
    section.querySelectorAll(
      ".scroll-reveal-soft, .scroll-reveal-stagger, .scroll-reveal-line, .scroll-reveal-split-left, .scroll-reveal-split-right",
    ).forEach((el) => el.classList.add("is-inview"));
  };

const hero = document.querySelector(".hero");
  if (hero) {
    hero.classList.add("scroll-reveal-hero");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => hero.classList.add("is-inview"));
    });
  }

  document.querySelector(".mobile-cats")?.classList.add("scroll-reveal-soft");

  initRailSectionReveal(document.querySelector(".trend-section"), {
    cardSelector: ".reel-card",
    autoPlayOnLoad: true,
  });

  initRailSectionReveal(document.querySelector(".seller-section"), {
    cardSelector: ".product-card",
  });

  const dealsSection = document.querySelector(".deals-section");
  if (dealsSection) {
    addLineReveal(dealsSection);
    dealsSection.querySelector(".mobile-section-title")?.classList.add("scroll-reveal-line");
    const dealGrid = dealsSection.querySelector(".deal-grid");
    if (dealGrid) {
      dealGrid.classList.add("scroll-reveal-stagger");
      dealGrid.querySelectorAll(".deal-card").forEach((item, index) => {
        item.classList.add("scroll-reveal-pop-item");
        item.style.setProperty("--reveal-index", String(index));
        item.style.setProperty("--reveal-stagger", "0.1s");
      });
    }
  }

  const editorialSection = document.querySelector(".editorial-section");
  if (editorialSection) {
    const editorCard = editorialSection.querySelector(".editor-card");
    editorCard?.querySelector(":scope > span")?.classList.add("scroll-reveal-split-left");
    editorCard?.querySelectorAll(":scope > div h2, :scope > div h3, :scope > div p").forEach((el) => {
      el.classList.add("scroll-reveal-split-right");
    });
    editorCard?.querySelector(":scope > button")?.classList.add("scroll-reveal-split-right");
    editorCard?.querySelector(":scope > a")?.classList.add("scroll-reveal-split-right");
    editorialSection.querySelector(".magazine-block")?.classList.add("scroll-reveal-soft");
    addStaggerItems(editorialSection.querySelector(".magazine-grid"), ".magazine-card", 0.08);
  }

  const reviewsSection = document.querySelector(".reviews-section");
  if (reviewsSection) {
    addLineReveal(reviewsSection);
    reviewsSection.querySelector(".section-heading")?.classList.add("scroll-reveal-soft", "scroll-reveal-slow");
    const reviewRail = reviewsSection.querySelector(".review-rail");
    if (reviewRail) {
      reviewRail.classList.add("scroll-reveal-stagger");
      reviewRail.querySelectorAll(".review-card").forEach((item, index) => {
        item.classList.add("scroll-reveal-item", "scroll-reveal-slow-item");
        item.style.setProperty("--reveal-index", String(index));
        item.style.setProperty("--reveal-stagger", "0.1s");
      });
    }
  }

  document.querySelector(".share-pick")?.classList.add("scroll-reveal-soft");
  document.querySelector(".newsletter")?.classList.add("scroll-reveal-soft");

  document.documentElement.classList.remove("scroll-reveal-pending");

  const revealSections = document.querySelectorAll(
    ".mobile-cats, .content-section:not(.trend-section), .share-pick, .newsletter",
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        activateRevealSection(entry.target);
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -6% 0px",
    },
  );

  revealSections.forEach((section) => revealObserver.observe(section));
};

initScrollReveals();
loadBridgeOnComponent("scripts/components/loop-rail.js");

loadBridgeOnComponent("scripts/components/deal-sliders.js");
loadBridgeOnComponent("scripts/components/hero-slider.js");

const todayPick = document.querySelector(".today-pick");
const todayPickTrack = document.querySelector(".today-pick-track");
const todayPickToggle = document.querySelector(".today-pick-toggle");
const todayPickSoldCount = document.querySelector(".today-pick-sold-count");
const todayPickProgress = document.querySelectorAll(".today-pick-progress button");

if (todayPick && todayPickTrack) {
  const todayPickSold = ["3,215", "2,108", "1,890", "4,502"];
  const todayPickTotal = todayPickTrack.children.length;
  let todayPickIndex = 0;
  let todayPickTimer;
  let todayPickHoverPaused = false;
  let todayPickCollapsed = false;
  let todayPickAutoplayEnabled = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const updateTodayPick = () => {
    todayPickTrack.style.transform = `translateX(-${todayPickIndex * 100}%)`;
    if (todayPickSoldCount) todayPickSoldCount.textContent = todayPickSold[todayPickIndex];

    todayPickProgress.forEach((button, index) => {
      const isActive = index === todayPickIndex;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  };

  const goToTodayPick = (index) => {
    todayPickIndex = (index + todayPickTotal) % todayPickTotal;
    updateTodayPick();
  };

  const stopTodayPickAutoplay = () => {
    window.clearInterval(todayPickTimer);
  };

  const startTodayPickAutoplay = () => {
    stopTodayPickAutoplay();
    if (!todayPickAutoplayEnabled || todayPickHoverPaused || todayPickCollapsed || todayPickTotal <= 1) return;
    todayPickTimer = window.setInterval(() => goToTodayPick(todayPickIndex + 1), 5000);
  };

  const resetTodayPickAutoplay = () => {
    if (todayPickAutoplayEnabled && !todayPickCollapsed) startTodayPickAutoplay();
  };

  const measureTodayPickHeight = () => {
    const wasCollapsed = todayPickCollapsed;
    if (wasCollapsed) todayPick.classList.remove("is-collapsed");

    const previousInlineHeight = todayPick.style.height;
    todayPick.style.height = "auto";
    todayPick.style.setProperty("--today-pick-height", `${todayPick.offsetHeight}px`);
    todayPick.style.height = previousInlineHeight;

    if (wasCollapsed) todayPick.classList.add("is-collapsed");
  };

  const setTodayPickCollapsed = (collapsed) => {
    if (collapsed && !todayPickCollapsed) measureTodayPickHeight();

    todayPickCollapsed = collapsed;
    todayPick.classList.toggle("is-collapsed", collapsed);
    todayPickToggle?.setAttribute("aria-expanded", collapsed ? "false" : "true");
    todayPickToggle?.setAttribute("aria-label", collapsed ? "Expand today's pick" : "Collapse today's pick");

    if (collapsed) {
      stopTodayPickAutoplay();
    } else {
      todayPick.style.removeProperty("height");
      startTodayPickAutoplay();
    }
  };

  todayPickToggle?.addEventListener("click", () => {
    setTodayPickCollapsed(!todayPickCollapsed);
  });

  todayPickProgress.forEach((button, index) => {
    button.addEventListener("click", () => {
      goToTodayPick(index);
      resetTodayPickAutoplay();
    });
  });

  todayPick.addEventListener("mouseenter", () => {
    todayPickHoverPaused = true;
    stopTodayPickAutoplay();
  });

  todayPick.addEventListener("mouseleave", () => {
    todayPickHoverPaused = false;
    startTodayPickAutoplay();
  });

  todayPick.addEventListener("focusin", () => {
    todayPickHoverPaused = true;
    stopTodayPickAutoplay();
  });

  todayPick.addEventListener("focusout", () => {
    todayPickHoverPaused = false;
    startTodayPickAutoplay();
  });

  todayPick.addEventListener("click", (event) => {
    if (!window.matchMedia("(min-width: 761px)").matches) return;
    if (event.target.closest("button, a")) return;

    const target = document.querySelector(".deal-card.special .deal-copy");
    if (!target) return;

    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center",
    });
  });

  updateTodayPick();
  measureTodayPickHeight();
  window.addEventListener("resize", measureTodayPickHeight);
  startTodayPickAutoplay();
}

document.querySelectorAll(".tab-row button, .tag-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.parentElement;
    group.querySelectorAll("button").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
  });
});

loadBridgeOnComponent("scripts/components/seller-wishlist.js");

loadBridgeOnComponent("scripts/components/magazine-slider.js");

document.querySelectorAll(".footer-toggle").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const group = toggle.closest(".footer-group");
    if (!group || window.matchMedia("(min-width: 761px)").matches) return;
    group.classList.toggle("is-open");
  });
});

document.querySelector(".to-top")?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelector(".newsletter form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = event.currentTarget.querySelector("input");
  if (input) input.value = "";
});

loadBridgeOnComponent("scripts/components/product-sheet.js");
