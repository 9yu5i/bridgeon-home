(() => {
  const CART_STORAGE_KEY = "trendypicker-cart-items";
  
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
      .replace(/\s*(?:·|-)\s*\d+\s*PCS Deal$/i, "")
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
    const brand = String(item.brand || "TrendyPicker").trim();
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
      ? `Bundle ${activeBundle.qty}+ - ${activeBundle.discount}% OFF`
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
    window.dispatchEvent(new CustomEvent("trendypicker:cartchange", { detail: { items: readCartItems() } }));
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
  
  window.TrendyPicker.cart = {
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
  

  updateCartBadges();
  window.addEventListener("storage", (event) => {
    if (event.key === CART_STORAGE_KEY) updateCartBadges();
  });
})();
