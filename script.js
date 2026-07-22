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
window.BridgeOn.cartPageUrl = new URL("cart/cart.html", BRIDGEON_ROOT_URL).href;

document.addEventListener("click", (event) => {
  if (event.target.closest(".realtrend-cart-toast-close")) return;

  const toast = event.target.closest(".realtrend-cart-toast.is-visible");
  if (!toast) return;

  event.preventDefault();
  navigateWithPageTransition(window.BridgeOn.cartPageUrl);
});

const CART_STORAGE_KEY = "bridgeon-cart-items";

const parseCartNumber = (value, fallback = 0) => {
  const parsed = Number.parseFloat(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatCartPrice = (value) => `US$${parseCartNumber(value).toFixed(2)}`;

const normalizeCartOptionChoices = (choices, selectedOption = "") => {
  const normalizedChoices = Array.isArray(choices)
    ? choices.map((choice) => String(choice || "").trim()).filter(Boolean)
    : [];
  const uniqueChoices = [];

  normalizedChoices.forEach((choice) => {
    if (!uniqueChoices.includes(choice)) uniqueChoices.push(choice);
  });

  return uniqueChoices;
};

const createCartItemId = ({ brand, name, option }) =>
  [brand, name, option].join("|").toLowerCase().replace(/\s+/g, "-");

const stripCartBundleOptionSuffix = (option) =>
  String(option || "")
    .replace(/\s*·\s*\d+\s*PCS Deal$/i, "")
    .replace(/^\d+\s*PCS Deal$/i, "")
    .trim();

const DEFAULT_PRODUCT_DEAL_BUNDLE_TIERS = [
  { qty: 2, discount: 5 },
  { qty: 3, discount: 10 },
  { qty: 4, discount: 15 },
];

const normalizeCartBundleTiers = (tiers) => {
  if (!Array.isArray(tiers)) return [];

  return tiers
    .map((tier) => ({
      qty: Math.max(2, Number.parseInt(tier?.qty, 10) || 0),
      discount: Math.max(0, Number(tier?.discount) || 0),
    }))
    .filter((tier) => tier.qty >= 2 && tier.discount > 0)
    .sort((a, b) => a.qty - b.qty);
};

const getActiveCartBundleTier = (tiers, quantity) => {
  let active = null;
  normalizeCartBundleTiers(tiers).forEach((tier) => {
    if (quantity >= tier.qty) active = tier;
  });
  return active;
};

const itemHasProductDealBundle = (item = {}) => {
  if (item.hasBundleDeal) return true;
  if (normalizeCartBundleTiers(item.bundleTiers).length) return true;
  if (/PCS Deal/i.test(String(item.option || ""))) return true;

  const detailUrl = String(item.detailUrl || "");
  return /product-detail(?:-options)?\.html/i.test(detailUrl);
};

const resolveCartBundleTiers = (item = {}) => {
  const fromItem = normalizeCartBundleTiers(item.bundleTiers);
  if (fromItem.length) return fromItem;

  if (/PCS Deal/i.test(String(item.option || "")) || itemHasProductDealBundle(item)) {
    return normalizeCartBundleTiers(DEFAULT_PRODUCT_DEAL_BUNDLE_TIERS);
  }

  return [];
};

const normalizeCartItem = (item = {}) => {
  const brand = String(item.brand || "BridgeOn").trim();
  const name = String(item.name || "Product").trim();
  const option = stripCartBundleOptionSuffix(item.option);
  const tone = String(item.tone || "green").trim();
  const quantity = Math.max(1, Number.parseInt(item.quantity, 10) || 1);
  const optionChoices = normalizeCartOptionChoices(
    (Array.isArray(item.optionChoices) ? item.optionChoices : []).map(stripCartBundleOptionSuffix),
    option,
  ).filter((choice) => choice && !/PCS Deal/i.test(choice));
  const detailUrl = String(item.detailUrl || "").trim();
  const brandUrl = String(item.brandUrl || "").trim();
  const hasBundleDeal = itemHasProductDealBundle(item);
  const bundleTiers = resolveCartBundleTiers(item);
  const originalPrice = item.originalPrice ? formatCartPrice(item.originalPrice) : "";
  const inferredBasePrice =
    item.basePrice ||
    (bundleTiers.length && item.originalPrice ? item.originalPrice : item.price) ||
    "US$22.00";
  const basePrice = formatCartPrice(inferredBasePrice);
  const activeBundle = getActiveCartBundleTier(bundleTiers, quantity);
  const price = activeBundle
    ? formatCartPrice(parseCartNumber(basePrice) * (1 - activeBundle.discount / 100))
    : basePrice;
  const bundleLabel = activeBundle
    ? `Bundle ${activeBundle.qty}+ · ${activeBundle.discount}% OFF`
    : "";
  const id = item.id || createCartItemId({ brand, name, option });

  return {
    id,
    brand,
    name,
    option,
    optionChoices,
    price,
    basePrice,
    originalPrice,
    tone,
    quantity,
    detailUrl,
    brandUrl,
    hasBundleDeal: hasBundleDeal || bundleTiers.length > 0,
    bundleTiers,
    bundleLabel,
    isBundle: Boolean(activeBundle),
  };
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
  defaultBundleTiers: DEFAULT_PRODUCT_DEAL_BUNDLE_TIERS,
  getActiveBundleTier: getActiveCartBundleTier,
  setItems: writeCartItems,
  add(item) {
    const nextItem = normalizeCartItem(item);
    const items = readCartItems();
    const existingIndex = items.findIndex((cartItem) => cartItem.id === nextItem.id);

    if (existingIndex >= 0) {
      const existing = items[existingIndex];
      items[existingIndex] = normalizeCartItem({
        ...existing,
        ...nextItem,
        quantity: existing.quantity + nextItem.quantity,
        bundleTiers: nextItem.bundleTiers?.length ? nextItem.bundleTiers : existing.bundleTiers,
        hasBundleDeal: Boolean(nextItem.hasBundleDeal || existing.hasBundleDeal),
        basePrice: existing.basePrice || nextItem.basePrice,
        originalPrice: existing.originalPrice || nextItem.originalPrice,
        detailUrl: existing.detailUrl || nextItem.detailUrl,
        brandUrl: existing.brandUrl || nextItem.brandUrl,
        optionChoices: normalizeCartOptionChoices(
          [...(existing.optionChoices || []), ...(nextItem.optionChoices || [])],
          existing.option || nextItem.option,
        ),
      });
    } else {
      items.push(nextItem);
    }

    writeCartItems(items);
    updateCartBadges();
    return nextItem;
  },
  updateQuantity(id, quantity) {
    const items = readCartItems().map((item) =>
      item.id === id
        ? normalizeCartItem({
            ...item,
            quantity: Math.max(1, quantity),
          })
        : item,
    );
    writeCartItems(items);
    updateCartBadges();
  },
  updateOption(id, option, optionChoices = null) {
    const items = readCartItems();
    const itemIndex = items.findIndex((item) => item.id === id);
    if (itemIndex < 0) return null;

    const nextItem = normalizeCartItem({
      ...items[itemIndex],
      id: "",
      option,
      optionChoices: optionChoices || items[itemIndex].optionChoices,
    });
    const existingIndex = items.findIndex((item, index) => index !== itemIndex && item.id === nextItem.id);

    if (existingIndex >= 0) {
      items[existingIndex] = {
        ...items[existingIndex],
        quantity: items[existingIndex].quantity + nextItem.quantity,
        optionChoices: normalizeCartOptionChoices(
          [...(items[existingIndex].optionChoices || []), ...(nextItem.optionChoices || [])],
          items[existingIndex].option,
        ),
      };
      items.splice(itemIndex, 1);
    } else {
      items[itemIndex] = nextItem;
    }

    writeCartItems(items);
    updateCartBadges();
    return nextItem;
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

const WISHLIST_STORAGE_KEY = "bridgeon-wishlist-items";
const WISHLIST_BUTTON_SELECTOR = [
  ".product-card .card-actions button:last-child",
  ".listing-card-wish",
  ".listing-card-wish-inline",
  ".product-wish",
  ".realtrend-wish",
  ".editor-wish",
  ".mypage-wish",
  ".deal-share-button",
].join(", ");

const normalizeWishlistText = (value, fallback = "") =>
  String(value || fallback).replace(/\s+/g, " ").trim();

const sellerWishlistIcons = {
  desktop: new URL("img/main-img/heart2.png", BRIDGEON_ROOT_URL).href,
  dark: new URL("img/mobile-icon/menu/wishlist.png", BRIDGEON_ROOT_URL).href,
  light: new URL("img/mobile-icon/menu/wishlist2.png", BRIDGEON_ROOT_URL).href,
  active: new URL("img/mobile-icon/menu/wishlist-hover.png", BRIDGEON_ROOT_URL).href,
};

const sellerWishlistQuery = window.matchMedia("(max-width: 1120px)");

const getProductCardRank = (card) => {
  const rankNode = Array.from(card?.children || []).find((child) => child.tagName === "B");
  return Number(rankNode?.textContent.trim() || 0);
};

const getListingCardRank = (card) => {
  const rank = card?.dataset.rank || card?.querySelector(".listing-card-rank")?.textContent?.trim();
  return rank ? String(rank) : "";
};

const getProductCardWishlistDefaultIcon = (button) => {
  const icon = button.querySelector("img");
  const card = button.closest(".product-card");

  if (card?.closest(".seller-section")) {
    if (!sellerWishlistQuery.matches) return sellerWishlistIcons.desktop;
    return getProductCardRank(card) <= 3 ? sellerWishlistIcons.light : sellerWishlistIcons.dark;
  }

  if (icon && !icon.dataset.wishlistDefaultSrc) {
    const currentSrc = icon.getAttribute("src") || "";
    const currentHref = currentSrc ? new URL(currentSrc, window.location.href).href : "";
    if (currentHref !== sellerWishlistIcons.active) {
      icon.dataset.wishlistDefaultSrc = currentSrc;
    }
  }

  return icon?.dataset.wishlistDefaultSrc || sellerWishlistIcons.desktop;
};

const createWishlistId = ({ brand, name, option = "" }) =>
  [brand, name, option]
    .map((part) => normalizeWishlistText(part).toLowerCase())
    .filter(Boolean)
    .join("|");

const normalizeWishlistItem = (item = {}) => {
  const brand = normalizeWishlistText(item.brand, "BridgeOn");
  const name = normalizeWishlistText(item.name, "Product");
  const option = normalizeWishlistText(item.option);
  const price = normalizeWishlistText(item.price);
  const originalPrice = normalizeWishlistText(item.originalPrice);
  const detailUrl = normalizeWishlistText(item.detailUrl);
  const id = item.id || createWishlistId({ brand, name, option });

  return { id, brand, name, option, price, originalPrice, detailUrl };
};

const readWishlistItems = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.map(normalizeWishlistItem).filter((item) => item.id) : [];
  } catch {
    return [];
  }
};

const writeWishlistItems = (items) => {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items.map(normalizeWishlistItem)));
  window.dispatchEvent(new CustomEvent("bridgeon:wishlistchange", { detail: { items: readWishlistItems() } }));
};

const getDirectText = (node) =>
  Array.from(node?.childNodes || [])
    .filter((child) => child.nodeType === Node.TEXT_NODE)
    .map((child) => child.textContent.trim())
    .join("");

const getWishlistPayloadFromButton = (button) => {
  const listingCard = button.closest(".listing-card");
  if (listingCard) {
    const rank = getListingCardRank(listingCard);
    return normalizeWishlistItem({
      brand: listingCard.querySelector(".listing-card-brand")?.textContent,
      name: listingCard.querySelector(".listing-card-title")?.textContent,
      price: listingCard.querySelector(".listing-card-price strong")?.textContent,
      originalPrice: listingCard.querySelector(".listing-card-price del")?.textContent,
      detailUrl: listingCard.dataset.productDetailLink || PRODUCT_DETAIL_URL,
      option: rank ? `rank-${rank}` : "",
    });
  }

  const productCard = button.closest(".product-card");
  if (productCard) {
    const priceNode =
      productCard.querySelector(".sale-price") ||
      productCard.querySelector("small strong") ||
      productCard.querySelector("small span");
    const rank = getProductCardRank(productCard);

    return normalizeWishlistItem({
      brand: productCard.querySelector(":scope > p")?.textContent || productCard.querySelector("p")?.textContent,
      name: productCard.querySelector("h3")?.textContent,
      price: priceNode?.textContent,
      originalPrice: productCard.querySelector("small del")?.textContent || productCard.querySelector("del")?.textContent,
      detailUrl: productCard.dataset.productDetailLink || PRODUCT_DETAIL_URL,
      option: rank ? `rank-${rank}` : "",
    });
  }

  const editorCard = button.closest(".editor-pick-card");
  if (editorCard) {
    return normalizeWishlistItem({
      brand: editorCard.querySelector(".editor-pick-product p")?.textContent,
      name: editorCard.querySelector(".editor-pick-product h3")?.textContent,
      price: editorCard.querySelector(".editor-price strong")?.textContent,
      originalPrice: editorCard.querySelector(".editor-price del")?.textContent,
      detailUrl: PRODUCT_DETAIL_URL,
    });
  }

  const mypageCard = button.closest(".mypage-product-card");
  if (mypageCard) {
    const priceNode = mypageCard.querySelector(".mypage-product-body strong") || mypageCard.querySelector("strong");
    return normalizeWishlistItem({
      brand: mypageCard.querySelector(".mypage-product-body p")?.textContent,
      name: mypageCard.querySelector(".mypage-product-body h3")?.textContent,
      price: getDirectText(priceNode) || priceNode?.textContent,
      originalPrice: priceNode?.querySelector("del")?.textContent,
      detailUrl: mypageCard.dataset.productDetailLink || PRODUCT_DETAIL_URL,
    });
  }

  const sheetCard = button.closest(".realtrend-product-card");
  if (sheetCard) {
    return normalizeWishlistItem({
      brand: sheetCard.querySelector(".realtrend-brand")?.textContent,
      name: sheetCard.querySelector(".realtrend-product-name")?.textContent,
      option: sheetCard.querySelector(".realtrend-select-native")?.selectedOptions?.[0]?.textContent,
      price: sheetCard.querySelector(".realtrend-price strong")?.textContent,
      originalPrice: sheetCard.querySelector(".realtrend-price del")?.textContent,
      detailUrl: PRODUCT_DETAIL_URL,
    });
  }

  const dealCard = button.closest(".deal-card");
  if (dealCard) {
    const priceNode = dealCard.querySelector(".deal-copy strong");
    return normalizeWishlistItem({
      brand: "BridgeOn",
      name: dealCard.querySelector(".deal-copy h3")?.textContent,
      price: getDirectText(priceNode) || priceNode?.childNodes?.[0]?.textContent,
      originalPrice: priceNode?.querySelector("del")?.textContent,
      detailUrl: dealCard.dataset.productDetailLink || PRODUCT_DETAIL_URL,
      option: dealCard.dataset.dealSlider || "",
    });
  }

  if (button.classList.contains("product-wish")) {
    return normalizeWishlistItem({
      brand: document.querySelector(".product-brand")?.textContent,
      name: document.querySelector(".product-summary h1")?.textContent,
      option: document.querySelector("[data-color-option].is-active")?.dataset.colorOption || "",
      price: document.querySelector(".product-price-current strong")?.textContent,
      originalPrice: document.querySelector(".product-price del")?.textContent,
      detailUrl: window.location.href,
    });
  }

  return null;
};

const setWishlistButtonState = (button, isActive) => {
  button.classList.toggle("is-active", isActive);
  if (isActive) button.classList.remove("is-hover-suppressed");
  button.setAttribute("aria-pressed", isActive ? "true" : "false");
  button.setAttribute("aria-label", isActive ? "Remove from wishlist" : "Add to wishlist");

  if (button.matches(".product-card .card-actions button:last-child")) {
    const icon = button.querySelector("img");
    if (icon) icon.src = isActive ? sellerWishlistIcons.active : getProductCardWishlistDefaultIcon(button);
  }
};

const syncWishlistButtons = (root = document) => {
  const scope = root && typeof root.querySelectorAll === "function" ? root : document;
  const activeIds = new Set(readWishlistItems().map((item) => item.id));

  scope.querySelectorAll(WISHLIST_BUTTON_SELECTOR).forEach((button) => {
    const item = getWishlistPayloadFromButton(button);
    if (!item?.id) return;
    setWishlistButtonState(button, activeIds.has(item.id));
  });
};

window.BridgeOn.wishlist = {
  getItems: readWishlistItems,
  setItems: writeWishlistItems,
  isActive(item) {
    const normalized = normalizeWishlistItem(item);
    return readWishlistItems().some((wishlistItem) => wishlistItem.id === normalized.id);
  },
  toggle(item) {
    const normalized = normalizeWishlistItem(item);
    if (!normalized.id) return false;

    const items = readWishlistItems();
    const existingIndex = items.findIndex((wishlistItem) => wishlistItem.id === normalized.id);
    const isActive = existingIndex < 0;

    if (isActive) items.push(normalized);
    else items.splice(existingIndex, 1);

    writeWishlistItems(items);
    syncWishlistButtons();
    return isActive;
  },
  syncButtons: syncWishlistButtons,
};

document.addEventListener(
  "click",
  (event) => {
    const button = event.target.closest?.(WISHLIST_BUTTON_SELECTOR);
    if (!button) return;

    const wishlistCard = button.closest(".wishlist-content .mypage-product-card");
    if (wishlistCard) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const item = getWishlistPayloadFromButton(button);
      if (item?.id && window.BridgeOn.wishlist.isActive(item)) {
        window.BridgeOn.wishlist.toggle(item);
      }

      const content = wishlistCard.closest(".wishlist-content");
      const grid = content?.querySelector(".wishlist-grid");
      const countEl = content?.querySelector(".account-collection-head strong");
      wishlistCard.remove();

      if (countEl && grid) {
        const count = grid.querySelectorAll(".mypage-product-card").length;
        countEl.textContent = `${count} item${count === 1 ? "" : "s"}`;
      }
      return;
    }

    const item = getWishlistPayloadFromButton(button);
    if (!item?.id) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const isActive = window.BridgeOn.wishlist.toggle(item);
    button.classList.toggle("is-hover-suppressed", !isActive);
  },
  true,
);

document.addEventListener(
  "pointerleave",
  (event) => {
    const button = event.target.closest?.(WISHLIST_BUTTON_SELECTOR);
    button?.classList.remove("is-hover-suppressed");
  },
  true,
);

window.addEventListener("storage", (event) => {
  if (event.key === WISHLIST_STORAGE_KEY) syncWishlistButtons();
});

syncWishlistButtons();

if (typeof MutationObserver === "function") {
  let wishlistSyncFrame = 0;
  const scheduleWishlistSync = () => {
    window.cancelAnimationFrame(wishlistSyncFrame);
    wishlistSyncFrame = window.requestAnimationFrame(() => syncWishlistButtons());
  };

  new MutationObserver(scheduleWishlistSync).observe(document.body, {
    childList: true,
    subtree: true,
  });
}

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

const initMagazineDetailLinks = () => {
  const homeMagazineSlugs = ["korean-sunscreens", "editor-beauty-cart", "korean-summer-snacks"];
  const editorMagazineSlugs = ["summer-fruit-desserts", "rescene-kpop-style", "bts-anniversary-busan"];
  const cardSelector = ".magazine-card, .editor-magazine-card";
  const createMagazineSlug = (value, fallback = "magazine-story") =>
    String(value || fallback)
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback;

  const getMagazineSlug = (card, index = 0) => {
    if (card.dataset.magazineSlug) return card.dataset.magazineSlug;

    const cardList = Array.from(card.parentElement?.querySelectorAll(cardSelector) || []);
    const cardIndex = cardList.includes(card) ? cardList.indexOf(card) : index;

    if (card.closest(".magazine-grid")) return homeMagazineSlugs[cardIndex] || `home-magazine-${cardIndex + 1}`;
    if (card.closest(".editor-magazine-grid")) {
      return editorMagazineSlugs[cardIndex] || `editor-magazine-${cardIndex + 1}`;
    }

    return createMagazineSlug(card.querySelector("h3")?.textContent, `magazine-story-${cardIndex + 1}`);
  };

  const getMagazineDetailHref = (card) => {
    const detailUrl = new URL("editors-pick/magazine-detail.html", BRIDGEON_ROOT_URL);
    detailUrl.searchParams.set("article", getMagazineSlug(card));
    return detailUrl.href;
  };

  document.querySelectorAll(cardSelector).forEach((card, index) => {
    card.dataset.magazineSlug = getMagazineSlug(card, index);
    if (!card.hasAttribute("tabindex")) card.tabIndex = 0;
    card.setAttribute("role", "link");
  });

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented) return;
    if (event.target.closest("a, button, input, select, textarea, label")) return;

    const card = event.target.closest(cardSelector);
    if (!card) return;

    event.preventDefault();
    navigateWithPageTransition(getMagazineDetailHref(card));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(cardSelector);
    if (!card) return;

    event.preventDefault();
    navigateWithPageTransition(getMagazineDetailHref(card));
  });
};

initMagazineDetailLinks();

const initEditorCardProductRotator = () => {
  const rotators = document.querySelectorAll(".editor-card-products");
  if (!rotators.length) return;

  rotators.forEach((rotator) => {
    const cards = Array.from(rotator.querySelectorAll(".editor-card-product"));
    if (!cards.length) return;

    let activeIndex = Math.max(0, cards.findIndex((card) => card.classList.contains("is-active")));
    let timerId = null;
    let isPaused = false;

    const syncCardState = () => {
      cards.forEach((card, index) => {
        const isActive = index === activeIndex;
        card.classList.toggle("is-active", isActive);
        card.setAttribute("aria-hidden", isActive ? "false" : "true");
        card.tabIndex = isActive ? 0 : -1;
      });
    };

    rotator.classList.add("is-rotator-ready");
    cards.forEach((card) => {
      card.classList.remove("is-exiting");
    });
    syncCardState();

    const setActiveCard = (nextIndex) => {
      if (nextIndex === activeIndex || !cards[nextIndex]) return;

      const currentCard = cards[activeIndex];
      const nextCard = cards[nextIndex];

      currentCard.classList.remove("is-active");
      currentCard.classList.add("is-exiting");
      nextCard.classList.remove("is-exiting");
      nextCard.classList.add("is-active");
      activeIndex = nextIndex;
      syncCardState();

      window.setTimeout(() => {
        currentCard.classList.remove("is-exiting");
      }, 720);
    };

    const goNext = () => {
      setActiveCard((activeIndex + 1) % cards.length);
    };

    const stop = () => {
      if (!timerId) return;
      window.clearInterval(timerId);
      timerId = null;
    };

    const start = () => {
      stop();
      if (cards.length < 2 || isPaused || document.hidden) return;
      timerId = window.setInterval(goNext, 4200);
    };

    rotator.addEventListener("mouseenter", () => {
      isPaused = true;
      stop();
    });

    rotator.addEventListener("mouseleave", () => {
      isPaused = false;
      start();
    });

    rotator.addEventListener("focusin", () => {
      isPaused = true;
      stop();
    });

    rotator.addEventListener("focusout", () => {
      isPaused = false;
      start();
    });

    document.addEventListener("visibilitychange", start);
    start();
  });
};

initEditorCardProductRotator();

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
    addLineReveal(editorialSection);
    const editorCard = editorialSection.querySelector(".editor-card");
    if (editorCard) {
      editorCard.classList.add("scroll-reveal-soft");
      editorCard.querySelector(".editor-card-copy")?.classList.add("scroll-reveal-split-left");
    }
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

loadBridgeOnComponent("scripts/components/section-tabs.js");

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
