(() => {
  const qtyValue = document.querySelector("[data-product-qty-value]");
  const addCartButton = document.querySelector(".product-add-cart");
  const wishButton = document.querySelector(".product-wish");
  const stage = document.querySelector("[data-detail-stage]");
  const thumbnailButtons = document.querySelectorAll("[data-detail-thumb]");
  const tabButtons = document.querySelectorAll("[data-detail-tab]");
  const panels = document.querySelectorAll("[data-detail-panel]");
  const productTabs = document.querySelector(".product-tabs");
  const productTabPanels = document.querySelector(".product-tab-panels");
  const colorOptionButtons = document.querySelectorAll("[data-color-option]");
  const productOptionLabel = document.querySelector("[data-product-option-label]");
  const productNameEl = document.querySelector(".product-summary h1");
  const cartToast = document.getElementById("product-detail-cart-toast");
  const cartToastMessage = document.getElementById("product-detail-cart-toast-message");
  const cartToastClose = cartToast?.querySelector(".realtrend-cart-toast-close");
  const cartToastRing = cartToast?.querySelector(".realtrend-cart-toast-ring circle");
  const inquiryDialog = document.getElementById("product-inquiry-dialog");
  const inquiryOpenButtons = document.querySelectorAll(".product-inquiry-open");
  const inquiryBackdrop = inquiryDialog?.querySelector(".product-inquiry-backdrop");
  const inquiryCloseButton = inquiryDialog?.querySelector(".product-inquiry-close");
  const inquiryForm = inquiryDialog?.querySelector(".product-inquiry-modal");
  const inquiryTextarea = inquiryDialog?.querySelector("textarea");
  const productInfoPanel = document.querySelector(".product-info-panel");
  const recommendationsWrap = document.querySelector(".product-recommendations-wrap");
  const recommendationsCard = document.querySelector(".product-recommendations");
  const mobileBackButton = document.querySelector("[data-product-mobile-back]");
  const recommendationsStickyQuery = window.matchMedia("(min-width: 1121px)");
  const CART_TOAST_RING_MS = 5000;
  let cartToastTimer = null;
  let stickyMeasureFrame = 0;
  let lastInquiryTrigger = null;

  const getCartToastProductName = () =>
    productNameEl?.textContent?.trim() || "This product";

  const getProductCartPayload = () => {
    const selectedColor = document.querySelector("[data-color-option].is-active")?.dataset.colorOption || "";
    const quantity = Number(qtyValue?.textContent || 1) || 1;

    return {
      brand: document.querySelector(".product-brand")?.textContent?.trim() || "BridgeOn",
      name: productNameEl?.textContent?.trim() || "Product",
      option: selectedColor,
      price: document.querySelector(".product-price-current strong")?.textContent?.trim() || "US$22.00",
      originalPrice: document.querySelector(".product-price del")?.textContent?.trim() || "",
      tone: selectedColor ? "pink" : "green",
      quantity,
    };
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

  const updateRecommendationsStickyTop = () => {
    if (!recommendationsCard) return;
    recommendationsCard.style.removeProperty("--product-recommendations-sticky-top");

    if (!recommendationsWrap || !productInfoPanel) return;

    if (!recommendationsStickyQuery.matches) {
      recommendationsWrap.style.removeProperty("--product-recommendations-follow-height");
      return;
    }

    const activePanel = Array.from(panels).find((panel) => !panel.hidden);
    const tabsHeight = productTabs?.getBoundingClientRect().height || 0;
    const tabPanelsBoxHeight = productTabPanels?.getBoundingClientRect().height || 0;
    const tabPanelsStyle = productTabPanels ? getComputedStyle(productTabPanels) : null;
    const tabPanelsPadding =
      (parseFloat(tabPanelsStyle?.paddingTop || "0") || 0) +
      (parseFloat(tabPanelsStyle?.paddingBottom || "0") || 0);
    const activePanelHeight = activePanel?.getBoundingClientRect().height || 0;
    const activeTabAreaHeight = Math.max(tabPanelsBoxHeight, activePanelHeight + tabPanelsPadding);
    const infoHeight = productInfoPanel.getBoundingClientRect().height;
    const followHeight = Math.ceil(Math.max(infoHeight, tabsHeight + activeTabAreaHeight));

    recommendationsWrap.style.setProperty("--product-recommendations-follow-height", `${followHeight}px`);
  };

  const queueRecommendationsStickyTop = () => {
    window.cancelAnimationFrame(stickyMeasureFrame);
    stickyMeasureFrame = window.requestAnimationFrame(updateRecommendationsStickyTop);
  };

  queueRecommendationsStickyTop();
  window.addEventListener("load", queueRecommendationsStickyTop);
  window.addEventListener("resize", queueRecommendationsStickyTop);
  recommendationsStickyQuery.addEventListener?.("change", queueRecommendationsStickyTop);

  mobileBackButton?.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = new URL("../index.html", window.location.href).href;
  });

  if (typeof ResizeObserver === "function" && productInfoPanel) {
    const recommendationsResizeObserver = new ResizeObserver(queueRecommendationsStickyTop);
    recommendationsResizeObserver.observe(productInfoPanel);
    if (productTabPanels) recommendationsResizeObserver.observe(productTabPanels);
    panels.forEach((panel) => recommendationsResizeObserver.observe(panel));
  }

  document.querySelectorAll("[data-product-qty]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!qtyValue) return;
      const delta = Number(button.dataset.productQty || 0);
      const next = Math.max(1, Number(qtyValue.textContent || 1) + delta);
      qtyValue.textContent = String(next);
    });
  });

  wishButton?.addEventListener("click", () => {
    const isActive = wishButton.classList.toggle("is-active");
    wishButton.classList.toggle("is-hover-suppressed", !isActive);
    wishButton.setAttribute("aria-pressed", isActive ? "true" : "false");
    wishButton.setAttribute("aria-label", isActive ? "Remove from wishlist" : "Add to wishlist");
  });

  wishButton?.addEventListener("pointerleave", () => {
    wishButton.classList.remove("is-hover-suppressed");
  });

  const openInquiryDialog = (trigger) => {
    if (!inquiryDialog) return;
    lastInquiryTrigger = trigger || document.activeElement;
    inquiryDialog.hidden = false;
    inquiryDialog.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-product-inquiry-open");
    requestAnimationFrame(() => inquiryTextarea?.focus({ preventScroll: true }));
  };

  const closeInquiryDialog = () => {
    if (!inquiryDialog || inquiryDialog.hidden) return;
    inquiryDialog.hidden = true;
    inquiryDialog.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-product-inquiry-open");
    lastInquiryTrigger?.focus?.({ preventScroll: true });
    lastInquiryTrigger = null;
  };

  inquiryOpenButtons.forEach((button) => {
    button.addEventListener("click", () => openInquiryDialog(button));
  });

  inquiryBackdrop?.addEventListener("click", closeInquiryDialog);
  inquiryCloseButton?.addEventListener("click", closeInquiryDialog);

  inquiryForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    inquiryTextarea.value = "";
    closeInquiryDialog();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeInquiryDialog();
  });

  addCartButton?.addEventListener("click", () => {
    const label = addCartButton.querySelector(".product-add-cart-label");
    const originalText = "Add to Cart";
    window.BridgeOn?.cart?.add(getProductCartPayload());
    addCartButton.classList.add("is-added");
    if (label) label.textContent = "Added";
    showCartToast();

    window.setTimeout(() => {
      addCartButton.classList.remove("is-added");
      if (label) label.textContent = originalText;
    }, 1200);
  });

  cartToastClose?.addEventListener("click", hideCartToast);

  const recommendationList = document.querySelector(".product-recommendation-list");
  let recDragActive = false;
  let recDragStartX = 0;
  let recDragScrollLeft = 0;
  let recDragMoved = false;
  let suppressRecommendationClick = false;

  recommendationList?.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.target.closest("button")) return;

    recDragActive = true;
    recDragMoved = false;
    suppressRecommendationClick = false;
    recDragStartX = event.clientX;
    recDragScrollLeft = recommendationList.scrollLeft;
    recommendationList.setPointerCapture(event.pointerId);
    recommendationList.classList.add("is-dragging");
  });

  recommendationList?.addEventListener("pointermove", (event) => {
    if (!recDragActive) return;
    const dragOffset = event.clientX - recDragStartX;
    if (Math.abs(dragOffset) > 6) {
      recDragMoved = true;
      suppressRecommendationClick = true;
    }
    recommendationList.scrollLeft = recDragScrollLeft - dragOffset;
  });

  const endRecDrag = (event) => {
    if (!recDragActive) return;
    recDragActive = false;
    recommendationList.classList.remove("is-dragging");
    if (recommendationList.hasPointerCapture(event.pointerId)) {
      recommendationList.releasePointerCapture(event.pointerId);
    }
    if (recDragMoved) {
      window.setTimeout(() => {
        suppressRecommendationClick = false;
      }, 0);
    }
  };

  recommendationList?.addEventListener("pointerup", endRecDrag);
  recommendationList?.addEventListener("pointercancel", endRecDrag);

  recommendationList?.querySelectorAll(".product-rec-card").forEach((card) => {
    const title = card.querySelector("h3")?.textContent?.trim();
    card.tabIndex = 0;
    card.setAttribute("role", "link");
    if (title) card.setAttribute("aria-label", `View product detail: ${title}`);
  });

  const openRecommendedProduct = (card) => {
    const targetUrl = card.dataset.productDetailLink || "product-detail.html";
    window.location.href = new URL(targetUrl, window.location.href).href;
  };

  recommendationList?.addEventListener("click", (event) => {
    const card = event.target.closest(".product-rec-card");
    if (!card || !recommendationList.contains(card)) return;
    if (event.target.closest("button") || suppressRecommendationClick) return;
    openRecommendedProduct(card);
  });

  recommendationList?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(".product-rec-card");
    if (!card || !recommendationList.contains(card)) return;
    if (event.target.closest("button")) return;
    event.preventDefault();
    openRecommendedProduct(card);
  });

  const selectColorOption = (button, shouldFocus = false) => {
    if (!button) return;

    colorOptionButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-checked", isActive ? "true" : "false");
    });

    if (productOptionLabel) {
      productOptionLabel.textContent = button.dataset.colorOption || "";
    }

    if (stage) {
      const optionColor = button.style.getPropertyValue("--option-color").trim();
      if (optionColor) stage.style.setProperty("--selected-option-color", optionColor);
      stage.dataset.optionVariant = button.dataset.stageVariant || "0";
    }

    if (shouldFocus) button.focus({ preventScroll: true });
  };

  colorOptionButtons.forEach((button, index) => {
    button.addEventListener("click", () => selectColorOption(button));

    button.addEventListener("keydown", (event) => {
      const keyMap = {
        ArrowRight: 1,
        ArrowDown: 1,
        ArrowLeft: -1,
        ArrowUp: -1,
      };
      const direction = keyMap[event.key];
      if (!direction) return;

      event.preventDefault();
      const nextIndex = (index + direction + colorOptionButtons.length) % colorOptionButtons.length;
      selectColorOption(colorOptionButtons[nextIndex], true);
    });
  });

  selectColorOption(document.querySelector(".product-color-option.is-active"));

  const thumbnailList = document.querySelector(".product-thumbnails");
  const thumbnailBackgroundProps = [
    "backgroundImage",
    "backgroundColor",
    "backgroundPosition",
    "backgroundSize",
    "backgroundRepeat",
  ];
  let activeThumbnail = document.querySelector("[data-detail-thumb].is-active") || thumbnailButtons[0];

  const setStageVariant = (button) => {
    if (!stage || !button) return;

    const variant = button.dataset.detailThumb || "0";
    if (variant === "0") {
      stage.removeAttribute("data-variant");
    } else {
      stage.dataset.variant = variant;
    }
  };

  const setStageImageFromThumbnail = (button) => {
    if (!stage || !button) return;

    const thumbnailImage = button.querySelector("img");
    const thumbnailImageSrc = thumbnailImage?.currentSrc || thumbnailImage?.src || "";

    setStageVariant(button);

    if (thumbnailImageSrc) {
      stage.style.backgroundImage = `url("${thumbnailImageSrc}")`;
      stage.style.backgroundColor = "transparent";
      stage.style.backgroundPosition = "center";
      stage.style.backgroundSize = "cover";
      stage.style.backgroundRepeat = "no-repeat";
      return;
    }

    const thumbnailStyle = window.getComputedStyle(button);
    thumbnailBackgroundProps.forEach((property) => {
      stage.style[property] = thumbnailStyle[property];
    });
  };

  const restoreActiveThumbnail = () => {
    if (!activeThumbnail) return;
    setStageImageFromThumbnail(activeThumbnail);
  };

  thumbnailButtons.forEach((button) => {
    button.addEventListener("pointerenter", () => setStageImageFromThumbnail(button));
    button.addEventListener("focus", () => setStageImageFromThumbnail(button));

    button.addEventListener("click", () => {
      activeThumbnail = button;
      thumbnailButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      setStageImageFromThumbnail(button);
    });
  });

  thumbnailList?.addEventListener("pointerleave", restoreActiveThumbnail);
  thumbnailList?.addEventListener("focusout", () => {
    window.requestAnimationFrame(() => {
      if (!thumbnailList.contains(document.activeElement)) restoreActiveThumbnail();
    });
  });

  const reviewsBars = document.querySelector(".product-reviews-bars");
  const animateReviewsBars = () => {
    if (!reviewsBars) return;

    reviewsBars.classList.remove("is-animating");
    void reviewsBars.offsetWidth;
    window.requestAnimationFrame(() => {
      reviewsBars.classList.add("is-animating");
    });
  };

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.detailTab;

      tabButtons.forEach((tab) => {
        const isActive = tab === button;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      panels.forEach((panel) => {
        panel.hidden = panel.dataset.detailPanel !== key;
      });

      if (key === "reviews") animateReviewsBars();

      queueRecommendationsStickyTop();
    });
  });

  document.querySelectorAll(".product-qa-question[aria-controls]").forEach((button) => {
    button.addEventListener("click", () => {
      const answer = document.getElementById(button.getAttribute("aria-controls"));
      if (!answer) return;
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", isExpanded ? "false" : "true");
      answer.hidden = isExpanded;
      queueRecommendationsStickyTop();
    });
  });

  const reviewsList = document.querySelector(".product-reviews-list");
  const reviewsPagination = document.querySelector(".product-reviews-pagination");
  const REVIEWS_PER_PAGE = 6;
  let reviewsCurrentPage = 1;

  const getReviewsTotalPages = () => {
    if (!reviewsList) return 1;
    return Math.max(1, Math.ceil(reviewsList.children.length / REVIEWS_PER_PAGE));
  };

  const setReviewPage = (page) => {
    if (!reviewsList) return;

    const totalPages = getReviewsTotalPages();
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    reviewsCurrentPage = nextPage;

    Array.from(reviewsList.children).forEach((item, index) => {
      const itemPage = Math.floor(index / REVIEWS_PER_PAGE) + 1;
      const isVisible = itemPage === nextPage;
      item.hidden = !isVisible;

      if (!isVisible) {
        item.classList.remove("is-photo-expanded");
        const photoButton = item.querySelector(".product-review-photo");
        photoButton?.setAttribute("aria-expanded", "false");
        photoButton?.setAttribute("aria-label", "Expand review photo");
      }
    });

    reviewsPagination?.querySelectorAll("[data-review-page]").forEach((button) => {
      const value = button.dataset.reviewPage;
      if (value === "prev" || value === "next") return;
      const pageNumber = Number(value);
      const isActive = pageNumber === nextPage;
      button.classList.toggle("is-active", isActive);
      button.toggleAttribute("aria-current", isActive);
    });

    queueRecommendationsStickyTop();
  };

  if (reviewsList) {
    const seedItem = reviewsList.querySelector(".product-review-item");
    if (seedItem) {
      while (reviewsList.children.length < 12) {
        reviewsList.appendChild(seedItem.cloneNode(true));
      }
    }
    setReviewPage(1);

    reviewsList.addEventListener("click", (event) => {
      const button = event.target.closest(".product-review-photo");
      if (!button || !reviewsList.contains(button)) return;

      const item = button.closest(".product-review-item");
      if (!item) return;

      const willExpand = !item.classList.contains("is-photo-expanded");

      reviewsList.querySelectorAll(".product-review-item.is-photo-expanded").forEach((openItem) => {
        if (openItem === item) return;
        openItem.classList.remove("is-photo-expanded");
        const openButton = openItem.querySelector(".product-review-photo");
        openButton?.setAttribute("aria-expanded", "false");
        openButton?.setAttribute("aria-label", "Expand review photo");
      });

      item.classList.toggle("is-photo-expanded", willExpand);
      button.setAttribute("aria-expanded", willExpand ? "true" : "false");
      button.setAttribute("aria-label", willExpand ? "Collapse review photo" : "Expand review photo");
      queueRecommendationsStickyTop();
    });
  }

  reviewsPagination?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-review-page]");
    if (!button) return;

    const action = button.dataset.reviewPage;
    if (action === "prev") {
      setReviewPage(reviewsCurrentPage - 1);
      return;
    }
    if (action === "next") {
      setReviewPage(reviewsCurrentPage + 1);
      return;
    }

    const pageNumber = Number(action);
    if (!Number.isNaN(pageNumber)) setReviewPage(pageNumber);
  });

  const initReviewsSortSelect = (wrap) => {
    const select = wrap.querySelector(".realtrend-select-native");
    const trigger = wrap.querySelector(".realtrend-select-trigger");
    const valueEl = wrap.querySelector(".realtrend-select-value");
    const menu = wrap.querySelector(".realtrend-select-menu");
    if (!select || !trigger || !valueEl || !menu) return null;

    const syncTriggerWidth = () => {
      const styles = getComputedStyle(trigger);
      const probe = document.createElement("span");
      probe.style.cssText =
        "position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none;height:0;overflow:hidden;";
      probe.style.font = styles.font;
      document.body.appendChild(probe);

      let maxTextWidth = 0;
      menu.querySelectorAll('[role="option"]').forEach((item) => {
        probe.textContent = item.textContent.trim();
        maxTextWidth = Math.max(maxTextWidth, probe.offsetWidth);
      });
      probe.remove();

      const horizontalBox =
        parseFloat(styles.paddingLeft) +
        parseFloat(styles.paddingRight) +
        parseFloat(styles.borderLeftWidth) +
        parseFloat(styles.borderRightWidth);

      wrap.style.width = `${Math.max(132, Math.ceil(maxTextWidth + horizontalBox))}px`;
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
      syncTriggerWidth();
    };

    const closeMenu = () => {
      wrap.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
    };

    const openMenu = () => {
      document.querySelectorAll(".product-reviews-sort .realtrend-select-wrap.is-open").forEach((otherWrap) => {
        if (otherWrap === wrap) return;
        otherWrap.classList.remove("is-open");
        otherWrap.querySelector(".realtrend-select-trigger")?.setAttribute("aria-expanded", "false");
        otherWrap.querySelector(".realtrend-select-menu")?.classList.remove("is-open");
      });
      wrap.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      menu.classList.add("is-open");
    };

    const selectIndex = (index) => {
      if (index < 0 || index >= select.options.length) return;
      select.selectedIndex = index;
      buildMenu();
      closeMenu();
    };

    buildMenu();

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (wrap.classList.contains("is-open")) closeMenu();
      else openMenu();
    });

    menu.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });

    menu.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const item = event.target.closest('[role="option"]');
      if (!item) return;
      selectIndex(Number(item.dataset.index));
    });

    return { closeMenu };
  };

  const reviewsSortSelectApis = new Map();
  document.querySelectorAll(".product-reviews-sort .realtrend-select-wrap").forEach((wrap) => {
    const api = initReviewsSortSelect(wrap);
    if (api) reviewsSortSelectApis.set(wrap, api);
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".product-reviews-sort .realtrend-select-wrap")) return;
    reviewsSortSelectApis.forEach((api) => api.closeMenu());
  });
})();
