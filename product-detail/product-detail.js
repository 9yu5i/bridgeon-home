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
  const dealDialog = document.getElementById("product-deal-dialog");
  const dealOpenButton = document.querySelector(".product-deal-strip");
  const dealBackdrop = dealDialog?.querySelector(".product-deal-backdrop");
  const dealCloseButtons = dealDialog?.querySelectorAll(".product-deal-close, [data-product-deal-close]");
  const dealAddButton = dealDialog?.querySelector("[data-product-deal-add]");
  const dealTierButtons = dealDialog?.querySelectorAll(".product-deal-benefits article[data-deal-qty]");
  const productInfoPanel = document.querySelector(".product-info-panel");
  const recommendationsWrap = document.querySelector(".product-recommendations-wrap");
  const recommendationsCard = document.querySelector(".product-recommendations");
  const mobileBackButton = document.querySelector("[data-product-mobile-back]");
  const recommendationsStickyQuery = window.matchMedia("(min-width: 1121px)");
  const CART_TOAST_RING_MS = 5000;
  let cartToastTimer = null;
  let stickyMeasureFrame = 0;
  let lastInquiryTrigger = null;
  let lastDealTrigger = null;

  const parsePriceValue = (value) => {
    const parsed = Number.parseFloat(String(value || "").replace(/[^\d.]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatPriceValue = (value) => `US$${Number(value || 0).toFixed(2)}`;

  const getSelectedDealTier = () =>
    dealDialog?.querySelector(".product-deal-benefits article.is-active[data-deal-qty]") ||
    dealTierButtons?.[0] ||
    null;

  const getDealUnitPrice = (tier) => {
    const basePrice = parsePriceValue(
      document.querySelector(".product-price-current strong")?.textContent || "US$22.00",
    );
    const discount = Math.max(0, Number(tier?.dataset.dealDiscount || 0));
    return basePrice * (1 - discount / 100);
  };

  const setActiveDealTier = (tier) => {
    if (!tier || !dealTierButtons?.length) return;

    dealTierButtons.forEach((button) => {
      const isActive = button === tier;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-checked", isActive ? "true" : "false");
      button.tabIndex = isActive ? 0 : -1;
    });
  };

  const syncDealTierPrices = () => {
    dealTierButtons?.forEach((tier) => {
      const priceNode = tier.querySelector("[data-deal-tier-price]");
      if (!priceNode) return;
      priceNode.textContent = `${formatPriceValue(getDealUnitPrice(tier))} / ea`;
    });
  };

  const getCartToastProductName = () =>
    productNameEl?.textContent?.trim() || "This product";

  const getProductBundleTiers = () =>
    Array.from(dealTierButtons || []).map((tier) => ({
      qty: Number(tier.dataset.dealQty || 0),
      discount: Number(tier.dataset.dealDiscount || 0),
    }));

  const syncDealDialogThumb = () => {
    const thumb = dealDialog?.querySelector(".product-deal-modal-thumb");
    const firstThumbnail = document.querySelector(".product-thumbnails button, .product-thumbnails [data-detail-thumb]");
    if (!thumb || !firstThumbnail) return;

    const styles = getComputedStyle(firstThumbnail);
    thumb.textContent = "";
    thumb.style.backgroundImage = styles.backgroundImage;
    thumb.style.backgroundSize = styles.backgroundSize || "cover";
    thumb.style.backgroundPosition = styles.backgroundPosition || "center";
    thumb.style.backgroundRepeat = styles.backgroundRepeat || "no-repeat";
  };

  const getProductCartPayload = () => {
    const selectedColor = document.querySelector("[data-color-option].is-active")?.dataset.colorOption || "";
    const colorChoices = Array.from(colorOptionButtons)
      .map((button) => button.dataset.colorOption?.trim())
      .filter(Boolean);
    const quantity = Number(qtyValue?.textContent || 1) || 1;
    const brandLink = document.querySelector(".product-brand");
    const salePrice = document.querySelector(".product-price-current strong")?.textContent?.trim() || "US$22.00";
    const bundleTiers = getProductBundleTiers();

    return {
      brand: brandLink?.textContent?.trim() || "BridgeOn",
      name: productNameEl?.textContent?.trim() || "Product",
      option: selectedColor,
      optionChoices: colorChoices,
      price: salePrice,
      basePrice: salePrice,
      originalPrice: document.querySelector(".product-price del")?.textContent?.trim() || "",
      tone: selectedColor ? "pink" : "green",
      quantity,
      detailUrl: window.location.href.split(/[?#]/)[0],
      brandUrl: brandLink?.href || new URL("../brand/detail.html", window.location.href).href,
      hasBundleDeal: bundleTiers.length > 0,
      bundleTiers,
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

  const syncDealDialogProduct = () => {
    if (!dealDialog) return;
    const brand = document.querySelector(".product-brand")?.textContent?.trim() || "BridgeOn";
    const name = productNameEl?.textContent?.trim() || "Product";
    const price = document.querySelector(".product-price-current strong")?.textContent?.trim() || "US$22.00";

    const brandNode = dealDialog.querySelector(".product-deal-modal-product p");
    const nameNode = dealDialog.querySelector(".product-deal-modal-product strong");
    const priceNode = dealDialog.querySelector(".product-deal-modal-product small b");

    if (brandNode) brandNode.textContent = brand;
    if (nameNode) nameNode.textContent = name;
    if (priceNode) priceNode.textContent = price;
    syncDealDialogThumb();
    syncDealTierPrices();
  };

  const openDealDialog = (trigger) => {
    if (!dealDialog) return;
    lastDealTrigger = trigger || document.activeElement;
    if (!getSelectedDealTier() && dealTierButtons?.[0]) setActiveDealTier(dealTierButtons[0]);
    syncDealDialogProduct();
    dealDialog.hidden = false;
    dealDialog.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-product-deal-open");
    requestAnimationFrame(() => dealDialog.querySelector(".product-deal-close")?.focus({ preventScroll: true }));
  };

  const closeDealDialog = () => {
    if (!dealDialog || dealDialog.hidden) return;
    dealDialog.hidden = true;
    dealDialog.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-product-deal-open");
    lastDealTrigger?.focus?.({ preventScroll: true });
    lastDealTrigger = null;
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
    if (event.key !== "Escape") return;
    closeInquiryDialog();
    closeDealDialog();
  });

  dealOpenButton?.addEventListener("click", () => openDealDialog(dealOpenButton));
  dealBackdrop?.addEventListener("click", closeDealDialog);
  dealCloseButtons?.forEach((button) => {
    button.addEventListener("click", closeDealDialog);
  });

  dealTierButtons?.forEach((tier, index) => {
    tier.addEventListener("click", () => setActiveDealTier(tier));
    tier.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActiveDealTier(tier);
        return;
      }

      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "ArrowDown" && event.key !== "ArrowUp") {
        return;
      }

      event.preventDefault();
      const offset = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (index + offset + dealTierButtons.length) % dealTierButtons.length;
      const nextTier = dealTierButtons[nextIndex];
      setActiveDealTier(nextTier);
      nextTier.focus({ preventScroll: true });
    });
  });

  dealAddButton?.addEventListener("click", () => {
    const tier = getSelectedDealTier();
    if (!tier) return;

    const payload = getProductCartPayload();
    const quantity = Math.max(2, Number(tier.dataset.dealQty || 2));
    const basePrice = document.querySelector(".product-price-current strong")?.textContent?.trim() || payload.price;
    const listPrice = document.querySelector(".product-price del")?.textContent?.trim() || "";

    payload.quantity = quantity;
    payload.basePrice = basePrice;
    payload.price = basePrice;
    payload.originalPrice = listPrice || payload.originalPrice;
    payload.bundleTiers = getProductBundleTiers();

    window.BridgeOn?.cart?.add(payload);
    showCartToast();
    closeDealDialog();
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
  const recommendationMobileQuery = window.matchMedia("(max-width: 760px)");
  let recDragActive = false;
  let recDragStartX = 0;
  let recDragScrollLeft = 0;
  let recDragMoved = false;
  let suppressRecommendationClick = false;

  const getRecommendationStride = () => {
    if (!recommendationList) return 1;
    const card = recommendationList.querySelector(".product-rec-card");
    if (!card) return recommendationList.clientWidth || 1;
    const styles = getComputedStyle(recommendationList);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const snapRecommendationList = () => {
    if (!recommendationList || !recommendationMobileQuery.matches) return;
    const stride = getRecommendationStride();
    const nearestCard = Math.round(recommendationList.scrollLeft / stride);
    recommendationList.scrollTo({
      left: nearestCard * stride,
      behavior: "smooth",
    });
  };

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

    if (recommendationMobileQuery.matches) {
      snapRecommendationList();
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

    window.BridgeOn?.wishlist?.syncButtons?.();

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

  const qaList = document.querySelector(".product-qa-list");
  const qaMoreButton = document.querySelector("[data-qa-more]");
  const qaMoreWrap = qaMoreButton?.closest(".product-qa-more-wrap");
  const QA_BATCH = 2;
  const QA_TOTAL = 6;
  let qaVisibleCount = QA_BATCH;

  const syncQaVisibility = () => {
    if (!qaList) return;

    const total = qaList.children.length;
    qaVisibleCount = Math.min(Math.max(qaVisibleCount, 0), total);

    Array.from(qaList.children).forEach((item, index) => {
      const isVisible = index < qaVisibleCount;
      item.hidden = !isVisible;

      if (!isVisible) {
        const question = item.querySelector(".product-qa-question[aria-controls]");
        const answer = question
          ? document.getElementById(question.getAttribute("aria-controls"))
          : null;
        if (question) question.setAttribute("aria-expanded", "false");
        if (answer) answer.hidden = true;
      }
    });

    const hasMore = qaVisibleCount < total;
    if (qaMoreWrap) qaMoreWrap.hidden = !hasMore;
    if (qaMoreButton) {
      qaMoreButton.hidden = !hasMore;
      qaMoreButton.disabled = !hasMore;
    }

    queueRecommendationsStickyTop();
  };

  if (qaList) {
    const seeds = Array.from(qaList.querySelectorAll(".product-qa-item"));
    let seedIndex = 0;
    while (qaList.children.length < QA_TOTAL && seeds.length) {
      const seed = seeds[seedIndex % seeds.length];
      const clone = seed.cloneNode(true);
      const question = clone.querySelector(".product-qa-question[aria-controls]");
      const answer = clone.querySelector(".product-qa-answer");
      if (question && answer) {
        const nextId = `product-qa-answer-${qaList.children.length + 1}`;
        answer.id = nextId;
        answer.hidden = true;
        question.setAttribute("aria-controls", nextId);
        question.setAttribute("aria-expanded", "false");
      }
      qaList.appendChild(clone);
      seedIndex += 1;
    }

    qaList.addEventListener("click", (event) => {
      const button = event.target.closest(".product-qa-question[aria-controls]");
      if (!button || !qaList.contains(button)) return;

      const answer = document.getElementById(button.getAttribute("aria-controls"));
      if (!answer) return;
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", isExpanded ? "false" : "true");
      answer.hidden = isExpanded;
      queueRecommendationsStickyTop();
    });

    qaVisibleCount = Math.min(QA_BATCH, qaList.children.length);
    syncQaVisibility();
  }

  qaMoreButton?.addEventListener("click", () => {
    if (!qaList) return;
    qaVisibleCount = Math.min(qaVisibleCount + QA_BATCH, qaList.children.length);
    syncQaVisibility();
  });

  const reviewsList = document.querySelector(".product-reviews-list");
  const reviewsMoreButton = document.querySelector("[data-reviews-more]");
  const reviewsMoreWrap = reviewsMoreButton?.closest(".product-reviews-more-wrap");
  const REVIEWS_BATCH = 6;
  let reviewsVisibleCount = REVIEWS_BATCH;

  const syncReviewsVisibility = () => {
    if (!reviewsList) return;

    const total = reviewsList.children.length;
    reviewsVisibleCount = Math.min(Math.max(reviewsVisibleCount, 0), total);

    Array.from(reviewsList.children).forEach((item, index) => {
      const isVisible = index < reviewsVisibleCount;
      item.hidden = !isVisible;

      if (!isVisible) {
        item.classList.remove("is-photo-expanded");
        const photoButton = item.querySelector(".product-review-photo");
        photoButton?.setAttribute("aria-expanded", "false");
        photoButton?.setAttribute("aria-label", "Expand review photo");
      }
    });

    const hasMore = reviewsVisibleCount < total;
    if (reviewsMoreWrap) reviewsMoreWrap.hidden = !hasMore;
    if (reviewsMoreButton) {
      reviewsMoreButton.hidden = !hasMore;
      reviewsMoreButton.disabled = !hasMore;
    }

    queueRecommendationsStickyTop();
  };

  if (reviewsList) {
    const seedItem = reviewsList.querySelector(".product-review-item");
    if (seedItem) {
      while (reviewsList.children.length < 12) {
        reviewsList.appendChild(seedItem.cloneNode(true));
      }
    }
    reviewsVisibleCount = Math.min(REVIEWS_BATCH, reviewsList.children.length);
    syncReviewsVisibility();

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

  reviewsMoreButton?.addEventListener("click", () => {
    if (!reviewsList) return;
    reviewsVisibleCount = Math.min(
      reviewsVisibleCount + REVIEWS_BATCH,
      reviewsList.children.length
    );
    syncReviewsVisibility();
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

  let shareDialog = null;
  let shareTrigger = null;
  let shareCopyTimer = null;

  const ensureShareDialog = () => {
    if (shareDialog) return shareDialog;

    shareDialog = document.createElement("div");
    shareDialog.className = "deal-share-dialog";
    shareDialog.id = "product-share-dialog";
    shareDialog.hidden = true;
    shareDialog.setAttribute("aria-hidden", "true");
    shareDialog.innerHTML = `
      <button type="button" class="deal-share-backdrop" data-deal-share-close aria-label="Close share dialog"></button>
      <section class="deal-share-modal" role="dialog" aria-modal="true" aria-labelledby="product-share-title">
        <button type="button" class="deal-share-close" data-deal-share-close aria-label="Close share dialog">&times;</button>
        <p class="deal-share-eyebrow">Share</p>
        <h2 id="product-share-title">Share this product</h2>
        <p class="deal-share-product" data-deal-share-name></p>
        <label class="deal-share-link-field">
          <span class="sr-only">Product link</span>
          <input type="text" data-deal-share-input readonly>
          <button type="button" class="deal-share-copy" data-deal-share-copy>Copy Link</button>
        </label>
        <div class="deal-share-social" aria-label="Share on social">
          <button type="button" class="deal-share-social-button" data-deal-share-channel="sms" aria-label="Share via Messages">
            <img src="../img/Menu/chat.png" alt="" aria-hidden="true">
            <span>Messages</span>
          </button>
          <button type="button" class="deal-share-social-button" data-deal-share-channel="instagram" aria-label="Share on Instagram">
            <img src="../img/mobile-icon/menu/insta.png" alt="" aria-hidden="true">
            <span>Instagram</span>
          </button>
          <button type="button" class="deal-share-social-button" data-deal-share-channel="facebook" aria-label="Share on Facebook">
            <img src="../img/mobile-icon/menu/facebook.png" alt="" aria-hidden="true">
            <span>Facebook</span>
          </button>
          <button type="button" class="deal-share-social-button" data-deal-share-channel="twitter" aria-label="Share on X">
            <img src="../img/mobile-icon/menu/twitter.png" alt="" aria-hidden="true">
            <span>X</span>
          </button>
        </div>
        <p class="deal-share-status" data-deal-share-status aria-live="polite"></p>
      </section>
    `;
    document.body.appendChild(shareDialog);

    const closeShareDialog = () => {
      shareDialog.hidden = true;
      shareDialog.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-deal-share-open");
      if (shareTrigger && typeof shareTrigger.focus === "function") {
        shareTrigger.focus();
      }
      shareTrigger = null;
    };

    const setStatus = (message, isSuccess = false) => {
      const status = shareDialog.querySelector("[data-deal-share-status]");
      if (!status) return;
      status.textContent = message;
      status.classList.toggle("is-success", isSuccess);
      window.clearTimeout(shareCopyTimer);
      if (message) {
        shareCopyTimer = window.setTimeout(() => {
          status.textContent = "";
          status.classList.remove("is-success");
        }, 2200);
      }
    };

    const copyShareLink = async () => {
      const input = shareDialog.querySelector("[data-deal-share-input]");
      const value = input?.value || "";
      if (!value) return;

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
        } else {
          input.focus();
          input.select();
          document.execCommand("copy");
        }
        setStatus("Link copied!", true);
      } catch {
        setStatus("Could not copy the link.");
      }
    };

    shareDialog.querySelectorAll("[data-deal-share-close]").forEach((button) => {
      button.addEventListener("click", closeShareDialog);
    });

    shareDialog.querySelector("[data-deal-share-copy]")?.addEventListener("click", copyShareLink);

    shareDialog.querySelectorAll("[data-deal-share-channel]").forEach((button) => {
      button.addEventListener("click", async () => {
        const channel = button.dataset.dealShareChannel;
        const input = shareDialog.querySelector("[data-deal-share-input]");
        const name =
          shareDialog.querySelector("[data-deal-share-name]")?.textContent || "BridgeOn product";
        const url = input?.value || window.location.href;
        const shareText = `Check out ${name} on BridgeOn`;
        const encodedUrl = encodeURIComponent(url);
        const encodedText = encodeURIComponent(`${shareText}\n${url}`);

        if (channel === "sms") {
          window.location.href = `sms:?&body=${encodedText}`;
          return;
        }

        if (channel === "facebook") {
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            "_blank",
            "noopener,noreferrer"
          );
          return;
        }

        if (channel === "twitter") {
          window.open(
            `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(shareText)}`,
            "_blank",
            "noopener,noreferrer"
          );
          return;
        }

        if (channel === "instagram") {
          try {
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(url);
            } else if (input) {
              input.focus();
              input.select();
              document.execCommand("copy");
            }
            setStatus("Link copied. Paste it in Instagram.", true);
          } catch {
            setStatus("Copy the link, then open Instagram.");
          }
          window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && shareDialog && !shareDialog.hidden) {
        closeShareDialog();
      }
    });

    shareDialog._close = closeShareDialog;
    shareDialog._setStatus = setStatus;
    return shareDialog;
  };

  const openShareDialog = (trigger) => {
    const dialog = ensureShareDialog();
    const nameEl = dialog.querySelector("[data-deal-share-name]");
    const input = dialog.querySelector("[data-deal-share-input]");
    const productName =
      productNameEl?.textContent?.trim() ||
      document.querySelector(".product-summary h1")?.textContent?.trim() ||
      "BridgeOn product";

    shareTrigger = trigger || null;
    if (nameEl) nameEl.textContent = productName;
    if (input) input.value = window.location.href;
    dialog._setStatus?.("");

    dialog.hidden = false;
    dialog.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-deal-share-open");
    dialog.querySelector(".deal-share-copy")?.focus();
  };

  document.querySelectorAll(".product-share").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openShareDialog(button);
    });
  });
})();
