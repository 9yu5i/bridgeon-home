(() => {
  const PRODUCT_DETAIL_URL = window.BridgeOn.productDetailUrl;
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
  const SAVED_WISHLIST_CARD_SELECTOR = ".wishlist-content .mypage-product-card, .mypage-wishlist .mypage-product-card";
  
  const normalizeWishlistText = (value, fallback = "") =>
    String(value || fallback).replace(/\s+/g, " ").trim();

  const normalizeWishlistCategory = (value) => {
    const category = normalizeWishlistText(value)
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return ["beauty", "k-food", "lifestyle", "k-pop", "k-traditional"].includes(category)
      ? category
      : "beauty";
  };

  const getPageWishlistCategory = () => {
    const className = Array.from(document.body.classList).find((name) =>
      name.startsWith("listing-page--"),
    );
    return normalizeWishlistCategory(className?.replace("listing-page--", ""));
  };

  const getCardWishlistCategory = (card) =>
    normalizeWishlistCategory(
      card?.dataset.accountCategory ||
        card?.dataset.category ||
        card?.dataset.timedealCategory ||
        card?.dataset.wishlistCategory ||
        getPageWishlistCategory(),
    );
  
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
  
  /* Identity is the product itself — options do not create separate wishlist entries. */
  const createWishlistId = ({ brand, name }) =>
    [brand, name]
      .map((part) => normalizeWishlistText(part).toLowerCase())
      .filter(Boolean)
      .join("|");
  
  const normalizeWishlistItem = (item = {}) => {
    const brand = normalizeWishlistText(item.brand, "BridgeOn");
    const name = normalizeWishlistText(item.name, "Product");
    const price = normalizeWishlistText(item.price);
    const originalPrice = normalizeWishlistText(item.originalPrice);
    const detailUrl = normalizeWishlistText(item.detailUrl);
    const category = normalizeWishlistCategory(item.category);
  
    return {
      id: createWishlistId({ brand, name }),
      brand,
      name,
      price,
      originalPrice,
      detailUrl,
      category,
    };
  };
  
  const readWishlistItems = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
  
      /* Entries saved before product-level ids can collapse into one, so keep the first of each id. */
      const byId = new Map();
      parsed.map(normalizeWishlistItem).forEach((item) => {
        if (item.id && !byId.has(item.id)) byId.set(item.id, item);
      });
      return [...byId.values()];
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
  
  /*
   * Every surface must resolve the same product to the same id, so a wishlist item is keyed by
   * brand and name only. Ranking and slider state are presentation-only.
   */
  const getWishlistPayloadFromButton = (button) => {
    const listingCard = button.closest(".listing-card");
    if (listingCard) {
      return normalizeWishlistItem({
        brand: listingCard.querySelector(".listing-card-brand")?.textContent,
        name: listingCard.querySelector(".listing-card-title")?.textContent,
        price: listingCard.querySelector(".listing-card-price strong")?.textContent,
        originalPrice: listingCard.querySelector(".listing-card-price del")?.textContent,
        detailUrl: listingCard.dataset.productDetailLink || PRODUCT_DETAIL_URL,
        category: getCardWishlistCategory(listingCard),
      });
    }

    const productCard = button.closest(".product-card");
    if (productCard) {
      const priceNode =
        productCard.querySelector(".sale-price") ||
        productCard.querySelector("small strong") ||
        productCard.querySelector("small span");

      return normalizeWishlistItem({
        brand: productCard.querySelector(":scope > p")?.textContent || productCard.querySelector("p")?.textContent,
        name: productCard.querySelector("h3")?.textContent,
        price: priceNode?.textContent,
        originalPrice: productCard.querySelector("small del")?.textContent || productCard.querySelector("del")?.textContent,
        detailUrl: productCard.dataset.productDetailLink || PRODUCT_DETAIL_URL,
        category: getCardWishlistCategory(productCard),
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
        category: getCardWishlistCategory(editorCard),
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
        category: getCardWishlistCategory(mypageCard),
      });
    }
  
    const sheetCard = button.closest(".realtrend-product-card");
    if (sheetCard) {
      return normalizeWishlistItem({
        brand: sheetCard.querySelector(".realtrend-brand")?.textContent,
        name: sheetCard.querySelector(".realtrend-product-name")?.textContent,
        price: sheetCard.querySelector(".realtrend-price strong")?.textContent,
        originalPrice: sheetCard.querySelector(".realtrend-price del")?.textContent,
        detailUrl: sheetCard.dataset.wishlistDetailUrl || PRODUCT_DETAIL_URL,
        category: getCardWishlistCategory(sheetCard),
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
        category: getCardWishlistCategory(dealCard),
      });
    }
  
    if (button.classList.contains("product-wish")) {
      return normalizeWishlistItem({
        brand: document.querySelector(".product-brand")?.textContent,
        name: document.querySelector(".product-summary h1")?.textContent,
        price: document.querySelector(".product-price-current strong")?.textContent,
        originalPrice: document.querySelector(".product-price del")?.textContent,
        detailUrl: window.location.href,
        category: "beauty",
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
  
  const WISHLIST_CARD_TONES = ["green", "peach", "blue", "tan", "mint"];

  const getWishlistCardTone = (item) => {
    const seed = item.id.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
    return WISHLIST_CARD_TONES[seed % WISHLIST_CARD_TONES.length];
  };

  const createWishlistPageCard = (item) => {
    const card = document.createElement("article");
    card.className = `mypage-product-card mypage-product-card--${getWishlistCardTone(item)}`;
    card.dataset.accountCategory = item.category;
    card.dataset.productDetailLink = item.detailUrl || PRODUCT_DETAIL_URL;
    card.dataset.wishlistId = item.id;

    const image = document.createElement("div");
    image.className = "mypage-product-image";
    image.setAttribute("aria-hidden", "true");

    const body = document.createElement("div");
    body.className = "mypage-product-body";

    const brand = document.createElement("p");
    brand.textContent = item.brand;

    const name = document.createElement("h3");
    name.textContent = item.name;

    const price = document.createElement("strong");
    price.append(document.createTextNode(item.price || "Price available on product page"));
    if (item.originalPrice) {
      const originalPrice = document.createElement("del");
      originalPrice.textContent = item.originalPrice;
      price.append(" ", originalPrice);
    }

    const actions = document.createElement("div");
    actions.className = "mypage-product-actions";

    const cartButton = document.createElement("button");
    cartButton.type = "button";
    cartButton.className = "mypage-cart";
    cartButton.setAttribute("aria-label", `Add ${item.name} to cart`);
    const cartIcon = document.createElement("img");
    cartIcon.src = "./img/cart.png";
    cartIcon.alt = "";
    cartIcon.setAttribute("aria-hidden", "true");
    cartButton.append(cartIcon);

    const wishButton = document.createElement("button");
    wishButton.type = "button";
    wishButton.className = "mypage-wish is-active";
    wishButton.setAttribute("aria-label", `Remove ${item.name} from wishlist`);
    wishButton.setAttribute("aria-pressed", "true");

    actions.append(cartButton, wishButton);
    body.append(brand, name, price, actions);
    card.append(image, body);
    return card;
  };

  const applyWishlistPageFilter = (content) => {
    const activeFilter =
      content.querySelector(".account-collection-tabs button.is-active")?.dataset.accountFilter ||
      "all";
    content.querySelectorAll(".wishlist-grid .mypage-product-card").forEach((card) => {
      card.hidden =
        activeFilter !== "all" && normalizeWishlistCategory(card.dataset.accountCategory) !== activeFilter;
    });
  };

  const renderWishlistCollection = (content, items) => {
    const grid = content.querySelector(".mypage-product-grid");
    if (!grid) return;

    const isFullPage = content.classList.contains("wishlist-content");
    const visibleItems = isFullPage ? items : items.slice(0, 5);
    grid.replaceChildren(...visibleItems.map(createWishlistPageCard));

    if (!visibleItems.length) {
      const empty = document.createElement("p");
      empty.className = "wishlist-empty";
      empty.textContent = "Your wishlist is empty.";
      grid.append(empty);
    }

    if (isFullPage) {
      const countEl = content.querySelector(".account-collection-head strong");
      if (countEl) countEl.textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;
      applyWishlistPageFilter(content);
    }
  };

  const syncWishlistPageCards = (root = document) => {
    const scope = root && typeof root.querySelectorAll === "function" ? root : document;
    const items = readWishlistItems();

    scope.querySelectorAll(".wishlist-content, .mypage-wishlist").forEach((content) => {
      renderWishlistCollection(content, items);
    });
  };
  
  const syncWishlistButtons = (root = document) => {
    const scope = root && typeof root.querySelectorAll === "function" ? root : document;
    const activeIds = new Set(readWishlistItems().map((item) => item.id));
  
    scope.querySelectorAll(WISHLIST_BUTTON_SELECTOR).forEach((button) => {
      if (button.closest(SAVED_WISHLIST_CARD_SELECTOR)) {
        setWishlistButtonState(button, true);
        return;
      }
  
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
  
      const wishlistCard = button.closest(SAVED_WISHLIST_CARD_SELECTOR);
      if (wishlistCard) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
  
        const item = getWishlistPayloadFromButton(button);
        if (item?.id && window.BridgeOn.wishlist.isActive(item)) {
          window.BridgeOn.wishlist.toggle(item);
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
    if (event.key !== WISHLIST_STORAGE_KEY) return;
    syncWishlistPageCards();
    syncWishlistButtons();
  });

  window.addEventListener("bridgeon:wishlistchange", () => {
    syncWishlistPageCards();
    syncWishlistButtons();
  });
  
  syncWishlistButtons();
  syncWishlistPageCards();
  
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
  
})();
