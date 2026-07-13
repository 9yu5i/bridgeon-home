(() => {
  const navigateWithPageTransition = window.BridgeOn?.navigateWithPageTransition || ((href) => {
    window.location.href = href;
  });
  const PRODUCT_DETAIL_URL =
    window.BridgeOn?.productDetailUrl ||
    new URL("../../product-detail/product-detail.html", document.currentScript?.src || window.location.href).href;

const initTrendProductSheet = () => {
  const productPanel = document.getElementById("trend-product-sheet");
  const trendRail = document.getElementById("trend-rail");
  const reviewRail = document.getElementById("review-rail");
  const sellerRail = document.getElementById("seller-rail");
  if (!productPanel) return;

  const productCard = productPanel.querySelector(".realtrend-product-card");
  const closeButton = productPanel.querySelector(".realtrend-product-sheet-close");
  const qtyEl = productPanel.querySelector("#trend-product-qty");
  const productSelect = productCard?.querySelector(".realtrend-select-native");
  const productNameEl = productCard?.querySelector(".realtrend-product-name");
  const cartToast =
    document.getElementById("trend-cart-toast") || document.getElementById("product-detail-cart-toast");
  const cartToastMessage =
    document.getElementById("trend-cart-toast-message") ||
    document.getElementById("product-detail-cart-toast-message");
  const cartToastClose = cartToast?.querySelector(".realtrend-cart-toast-close");
  const cartToastRing = cartToast?.querySelector(".realtrend-cart-toast-ring circle");
  const CART_TOAST_RING_MS = 5000;
  const selectRebuilders = [];
  let selectClickLock = false;
  let cartToastTimer = null;

  const preventTrendSheetBackdropScroll = (event) => {
    if (!document.body.classList.contains("is-trend-product-sheet-open")) return;
    if (event.target.closest(".realtrend-product-card")) return;
    event.preventDefault();
  };

  const slugifyBrand = (brand) =>
    brand
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const getProductInfoFromSource = (source) => {
    if (!source) return { brand: "", name: "", rawPrice: "", originalPrice: "" };

    if (source.classList.contains("listing-card")) {
      return {
        brand: source.querySelector(".listing-card-brand")?.textContent?.trim() || "",
        name: source.querySelector(".listing-card-title")?.textContent?.trim() || "",
        rawPrice: source.querySelector(".listing-card-price strong")?.textContent?.trim() || "",
        originalPrice: source.querySelector(".listing-card-price del")?.textContent?.trim() || "",
      };
    }

    if (source.classList.contains("reel-card")) {
      return {
        brand: source.querySelector(".reel-product p b")?.textContent?.trim() || "",
        name: source.querySelector(".reel-product p span")?.textContent?.trim() || "",
        rawPrice: source.querySelector(".reel-price")?.textContent?.trim() || "",
      };
    }

    if (source.classList.contains("review-card")) {
      const footerText = source.querySelector("footer p")?.innerText?.trim() || "";
      const [brandLine, ...nameParts] = footerText.split("\n");
      return {
        brand: brandLine?.trim() || "",
        name: nameParts.join(" ").trim() || brandLine?.trim() || "",
        rawPrice: "",
      };
    }

    if (source.classList.contains("product-card")) {
      return {
        brand: source.querySelector(":scope > p")?.textContent?.trim() || "",
        name: source.querySelector("h3")?.textContent?.trim() || "",
        rawPrice: source.querySelector(".sale-price")?.textContent?.trim() || "",
      };
    }

    if (source.classList.contains("product-rec-card")) {
      return {
        brand: source.querySelector(":scope > p")?.textContent?.trim() || "",
        name: source.querySelector("h3")?.textContent?.trim() || "",
        rawPrice: source.querySelector(":scope > strong")?.textContent?.trim() || "",
        originalPrice: "",
      };
    }

    return { brand: "", name: "", rawPrice: "", originalPrice: "" };
  };

  const replaySheetAnimation = () => {
    if (!productCard) return;
    productCard.style.animation = "none";
    void productCard.offsetHeight;
    productCard.style.animation = "";
  };

  const getCartToastProductName = () => {
    const selectedOption = productSelect?.selectedOptions?.[0]?.textContent?.trim();
    if (selectedOption) return selectedOption;
    return productNameEl?.textContent?.trim() || "This product";
  };

  const hideCartToast = () => {
    if (!cartToast?.classList.contains("is-visible")) return;
    window.clearTimeout(cartToastTimer);
    cartToastTimer = null;
    cartToast.classList.add("is-leaving");
    cartToast.classList.remove("is-visible");
    window.setTimeout(() => {
      cartToast.hidden = true;
      cartToast.setAttribute("aria-hidden", "true");
      cartToast.classList.remove("is-leaving");
      cartToastRing?.classList.remove("is-animating");
    }, 280);
  };

  const showCartToast = () => {
    if (!cartToast || !cartToastMessage) return;

    window.clearTimeout(cartToastTimer);
    cartToastTimer = null;
    cartToast.classList.remove("is-visible", "is-leaving");
    cartToastRing?.classList.remove("is-animating");
    void cartToastRing?.getBoundingClientRect();
    cartToastMessage.innerHTML = `<span class="realtrend-cart-toast-product">${getCartToastProductName()}</span> has been added to your cart.`;
    cartToast.hidden = false;
    cartToast.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      cartToast.classList.add("is-visible");
      cartToastRing?.classList.add("is-animating");
    });
    cartToastTimer = window.setTimeout(hideCartToast, CART_TOAST_RING_MS);
  };

  const closeTrendProductSheet = ({ keepCartToast = false } = {}) => {
    if (!document.body.classList.contains("is-trend-product-sheet-open")) return;
    if (!keepCartToast) hideCartToast();
    productPanel.querySelectorAll(".realtrend-select-wrap.is-open").forEach((wrap) => {
      wrap.classList.remove("is-open");
      wrap.querySelector(".realtrend-select-trigger")?.setAttribute("aria-expanded", "false");
      wrap.querySelector(".realtrend-select-menu")?.classList.remove("is-open");
    });
    productCard?.classList.remove("is-select-open");
    productPanel.classList.remove("is-select-open");
    document.body.classList.remove("is-trend-product-sheet-open");
    productPanel.hidden = true;
    productPanel.setAttribute("aria-hidden", "true");
  };

  const openTrendProductSheet = (source) => {
    if (!productCard || !source) return;

    const { brand, name, rawPrice, originalPrice = "" } = getProductInfoFromSource(source);
    const brandPathPrefix =
      document.body.classList.contains("listing-page") ||
      document.body.classList.contains("timedeal-page") ||
      document.body.classList.contains("product-detail-page")
        ? "../"
        : "";

    const brandEl = productCard.querySelector(".realtrend-brand");
    const nameEl = productCard.querySelector(".realtrend-product-name");
    const priceStrong = productCard.querySelector(".realtrend-price strong");
    const priceDel = productCard.querySelector(".realtrend-price del");
    const priceMark = productCard.querySelector(".realtrend-price mark");
    const select = productCard.querySelector(".realtrend-select-native");
    const selectValue = productCard.querySelector(".realtrend-select-value");
    const wishBtn = productCard.querySelector(".realtrend-wish");

    if (brandEl) {
      brandEl.textContent = brand;
      if (brandEl instanceof HTMLAnchorElement) {
        brandEl.href = `${brandPathPrefix}brand/${slugifyBrand(brand)}.html`;
      }
    }

    if (nameEl) nameEl.textContent = name;

    const saleText = rawPrice.startsWith("$") ? `US${rawPrice}` : rawPrice || "US$22.00";
    const sale = Number.parseFloat(saleText.replace(/[^\d.]/g, "") || "22");

    if (priceStrong) priceStrong.textContent = saleText;

    if (originalPrice) {
      if (priceDel) priceDel.textContent = originalPrice;
      const original = Number.parseFloat(originalPrice.replace(/[^\d.]/g, "") || "0");
      if (priceMark && original > sale) {
        priceMark.textContent = `${Math.round((1 - sale / original) * 100)}% OFF`;
      }
    } else {
      const original = Math.round((sale / 0.7) * 100) / 100;
      if (priceDel) priceDel.textContent = `US$${original.toFixed(2)}`;
      if (priceMark && original > sale) {
        priceMark.textContent = `${Math.round((1 - sale / original) * 100)}% OFF`;
      }
    }

    if (select && name) {
      if (select.options[0]) select.options[0].textContent = `${name} 50ml`;
      if (select.options[1]) select.options[1].textContent = `${name} 100ml`;
      select.selectedIndex = 0;
      if (selectValue) selectValue.textContent = select.options[0]?.textContent || "";
      selectRebuilders.forEach((rebuild) => rebuild());
    }

    if (qtyEl) qtyEl.textContent = "1";
    wishBtn?.classList.remove("is-active");
    wishBtn?.setAttribute("aria-pressed", "false");
    wishBtn?.setAttribute("aria-label", "Add to wishlist");

    productPanel.hidden = false;
    productPanel.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-trend-product-sheet-open");
    replaySheetAnimation();
  };

  const initTrendProductSelect = (wrap) => {
    const select = wrap.querySelector(".realtrend-select-native");
    const trigger = wrap.querySelector(".realtrend-select-trigger");
    const valueEl = wrap.querySelector(".realtrend-select-value");
    const menu = wrap.querySelector(".realtrend-select-menu");
    if (!select || !trigger || !valueEl || !menu) return;

    const syncSelectOverflow = () => {
      const isOpen = Boolean(productCard?.querySelector(".realtrend-select-wrap.is-open"));
      productCard?.classList.toggle("is-select-open", isOpen);
      productPanel?.classList.toggle("is-select-open", isOpen);
    };

    const buildMenu = () => {
      menu.innerHTML = "";
      Array.from(select.options).forEach((option, index) => {
        const item = document.createElement("li");
        const isSelected = index === select.selectedIndex;
        item.setAttribute("role", "option");
        item.dataset.index = String(index);
        item.textContent = option.textContent;
        item.classList.toggle("is-selected", isSelected);
        item.setAttribute("aria-selected", isSelected ? "true" : "false");
        menu.appendChild(item);
      });
      valueEl.textContent = select.selectedOptions[0]?.textContent?.trim() || "";
    };

    const closeMenu = () => {
      wrap.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      syncSelectOverflow();
    };

    const openMenu = () => {
      productPanel.querySelectorAll(".realtrend-select-wrap.is-open").forEach((otherWrap) => {
        if (otherWrap === wrap) return;
        otherWrap.classList.remove("is-open");
        otherWrap.querySelector(".realtrend-select-trigger")?.setAttribute("aria-expanded", "false");
        otherWrap.querySelector(".realtrend-select-menu")?.classList.remove("is-open");
      });
      wrap.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      menu.classList.add("is-open");
      syncSelectOverflow();
    };

    const selectIndex = (index) => {
      if (index < 0 || index >= select.options.length) return;
      select.selectedIndex = index;
      buildMenu();
      closeMenu();
    };

    buildMenu();
    selectRebuilders.push(buildMenu);

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (wrap.classList.contains("is-open")) closeMenu();
      else openMenu();
    });

    menu.addEventListener("pointerdown", (event) => event.stopPropagation());

    menu.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const item = event.target.closest('[role="option"]');
      if (!item) return;
      selectClickLock = true;
      window.setTimeout(() => {
        selectClickLock = false;
      }, 400);
      selectIndex(Number(item.dataset.index));
    });

    document.addEventListener("click", (event) => {
      if (!wrap.classList.contains("is-open")) return;
      if (wrap.contains(event.target)) return;
      closeMenu();
    });
  };

  productPanel.querySelectorAll(".realtrend-select-wrap").forEach(initTrendProductSelect);

  productCard?.querySelectorAll(".realtrend-qty button").forEach((button) => {
    button.addEventListener("click", () => {
      if (!qtyEl) return;
      const delta = Number(button.dataset.qty || 0);
      const next = Math.max(1, Number(qtyEl.textContent || 1) + delta);
      qtyEl.textContent = String(next);
    });
  });

  productCard?.querySelector(".realtrend-wish")?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    const isActive = button.classList.toggle("is-active");
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
    button.setAttribute("aria-label", isActive ? "Remove from wishlist" : "Add to wishlist");
  });

  productCard?.querySelector(".realtrend-add-cart")?.addEventListener("click", (event) => {
    if (selectClickLock) {
      event.preventDefault();
      return;
    }
    if (productCard.classList.contains("is-select-open")) {
      event.preventDefault();
      return;
    }
    showCartToast();
    closeTrendProductSheet({ keepCartToast: true });
  });

  cartToastClose?.addEventListener("click", hideCartToast);

  trendRail?.addEventListener(
    "pointerdown",
    (event) => {
      if (event.target.closest(".reel-product em")) event.stopPropagation();
    },
    true,
  );

  trendRail?.addEventListener("click", (event) => {
    const cartButton = event.target.closest(".reel-product em");
    if (!cartButton || !trendRail.contains(cartButton)) return;
    event.preventDefault();
    event.stopPropagation();
    openTrendProductSheet(cartButton.closest(".reel-card"));
  });

  reviewRail?.addEventListener("click", (event) => {
    const reviewCartButton = event.target.closest(".review-card footer .review-cart-button");
    if (!reviewCartButton || !reviewRail.contains(reviewCartButton)) return;
    event.preventDefault();
    event.stopPropagation();
    openTrendProductSheet(reviewCartButton.closest(".review-card"));
  });

  sellerRail?.addEventListener(
    "pointerdown",
    (event) => {
      if (event.target.closest('.card-actions button[aria-label="Add to cart"]')) event.stopPropagation();
    },
    true,
  );

  sellerRail?.addEventListener("click", (event) => {
    const cartButton = event.target.closest('.card-actions button[aria-label="Add to cart"]');
    if (!cartButton || !sellerRail.contains(cartButton)) return;
    event.preventDefault();
    event.stopPropagation();
    openTrendProductSheet(cartButton.closest(".product-card"));
  });

  const listingGrid = document.querySelector(".listing-grid");

  listingGrid?.addEventListener("click", (event) => {
    const cartButton =
      event.target.closest('.listing-card-actions--desktop button[aria-label="Add to cart"]') ||
      event.target.closest(".listing-card-cart");
    if (!cartButton) return;

    const card = cartButton.closest(".listing-card");
    if (!card || !listingGrid.contains(card)) return;

    event.preventDefault();
    event.stopPropagation();
    openTrendProductSheet(card);
  });

  const recommendationList = document.querySelector(".product-recommendation-list");

  recommendationList?.addEventListener("click", (event) => {
    const cartButton = event.target.closest(".product-rec-card button");
    if (!cartButton || !recommendationList.contains(cartButton)) return;

    event.preventDefault();
    event.stopPropagation();
    openTrendProductSheet(cartButton.closest(".product-rec-card"));
  });

  closeButton?.addEventListener("click", closeTrendProductSheet);

  productPanel.addEventListener("click", (event) => {
    if (event.target.closest(".realtrend-product-card")) return;
    closeTrendProductSheet();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTrendProductSheet();
  });

  document.addEventListener("touchmove", preventTrendSheetBackdropScroll, { passive: false });
};

initTrendProductSheet();

const initProductDetailCardLinks = () => {
  document.querySelectorAll(".listing-grid, .seller-rail").forEach((container) => {
    container.addEventListener("click", (event) => {
      if (event.defaultPrevented) return;
      if (event.target.closest("a, button, input, select, textarea, label")) return;

      const card = event.target.closest(".listing-card, .product-card");
      if (!card || !container.contains(card)) return;

      navigateWithPageTransition(PRODUCT_DETAIL_URL);
    });
  });
};

initProductDetailCardLinks();
})();
