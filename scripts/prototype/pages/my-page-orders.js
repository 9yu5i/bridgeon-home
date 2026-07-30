(() => {
  const orderFilterTabs = document.querySelector(".orders-filter-tabs");
  const orderCards = document.querySelectorAll(".orders-list > .orders-card");
  const orderStatusSelect = document.querySelector(
    ".orders-select-row > .listing-sort:first-child .realtrend-select-native"
  );
  
  const statusKey = (value) => {
    const text = String(value || "")
      .trim()
      .toLowerCase();
    if (!text) return "";
    if (text === "all" || text.includes("all status") || text.includes("all order")) return "all";
    if (text.includes("cancel") || text.includes("refund")) return "cancel";
    if (text.includes("deliver")) return "delivered";
    if (text.includes("ship")) return "shipped";
    if (text.includes("process") || text.includes("prepar")) return "processing";
    if (text.includes("pend")) return "pending";
    return text;
  };
  
  const syncOrderFilterTabs = (filter) => {
    if (!orderFilterTabs) return;
    orderFilterTabs.querySelectorAll("button[data-orders-filter]").forEach((tab) => {
      tab.classList.toggle("is-active", (tab.getAttribute("data-orders-filter") || "all") === filter);
    });
  };
  
  const syncOrderStatusSelect = (filter) => {
    if (!orderStatusSelect) return;
    const option = Array.from(orderStatusSelect.options).find((selectOption) =>
      statusKey(selectOption.textContent) === filter
    );
    if (!option) return;
  
    orderStatusSelect.selectedIndex = option.index;
    const wrap = orderStatusSelect.closest(".realtrend-select-wrap");
    wrap?.querySelector(".realtrend-select-value")?.replaceChildren(option.textContent.trim());
    wrap?.querySelectorAll('[role="option"]').forEach((menuItem) => {
      const isSelected = Number(menuItem.dataset.index) === option.index;
      menuItem.classList.toggle("is-selected", isSelected);
      menuItem.setAttribute("aria-selected", isSelected ? "true" : "false");
    });
  };
  
  const applyOrderFilter = (filter, { syncTabs = true, syncSelect = false } = {}) => {
    if (!orderCards.length) return;
    const normalizedFilter = filter || "all";
    orderCards.forEach((card) => {
      const mark = card.querySelector(".orders-card-head mark");
      const cardStatus = statusKey(mark?.textContent);
      const show = normalizedFilter === "all" || cardStatus === normalizedFilter;
      card.hidden = !show;
    });
  
    if (syncTabs) syncOrderFilterTabs(normalizedFilter);
    if (syncSelect) syncOrderStatusSelect(normalizedFilter);
  };
  
  if (orderFilterTabs && orderCards.length) {
    orderFilterTabs.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-orders-filter]");
      if (!button || !orderFilterTabs.contains(button)) return;
  
      applyOrderFilter(button.getAttribute("data-orders-filter") || "all", { syncSelect: true });
    });
  }
  
  orderStatusSelect?.addEventListener("change", () => {
    applyOrderFilter(statusKey(orderStatusSelect.selectedOptions[0]?.textContent), { syncTabs: true });
  });
  
  const ordersModalLayer = document.querySelector("[data-orders-modal-layer]");
  const ordersList = document.querySelector(".orders-list");
  const mypageOrderPreview = document.querySelector(".mypage-order-preview");
  
  if (ordersModalLayer && (ordersList || mypageOrderPreview)) {
    const reviewDialog = ordersModalLayer.querySelector('[data-orders-dialog="review"]');
    const trackDialog = ordersModalLayer.querySelector('[data-orders-dialog="track"]');
    const reviewRating = ordersModalLayer.querySelector(".orders-review-rating");
    const reviewUploadButton = ordersModalLayer.querySelector("[data-orders-review-upload]");
    const reviewFileInput = ordersModalLayer.querySelector("[data-orders-review-files]");
    const reviewUploadStatus = ordersModalLayer.querySelector("[data-orders-review-upload-status]");
    const reviewPreview = ordersModalLayer.querySelector("[data-orders-review-preview]");
    let ordersModalTrigger = null;
    let reviewPhotoUrls = [];
  
    const updateReviewUploadStatus = () => {
      if (!reviewUploadStatus) return;
      reviewUploadStatus.textContent = reviewPhotoUrls.length
        ? `${reviewPhotoUrls.length} photo${reviewPhotoUrls.length > 1 ? "s" : ""} selected`
        : "Up to 5 photos";
    };
  
    const resetReviewUpload = () => {
      reviewPhotoUrls.forEach((url) => URL.revokeObjectURL(url));
      reviewPhotoUrls = [];
      if (reviewFileInput) reviewFileInput.value = "";
      if (reviewPreview) reviewPreview.replaceChildren();
      updateReviewUploadStatus();
    };
  
    const closeOrdersModal = () => {
      ordersModalLayer.hidden = true;
      ordersModalLayer.setAttribute("aria-hidden", "true");
      if (reviewDialog) reviewDialog.hidden = true;
      if (trackDialog) trackDialog.hidden = true;
      document.body.classList.remove("is-orders-modal-open");
      resetReviewUpload();
      if (ordersModalTrigger && typeof ordersModalTrigger.focus === "function") {
        ordersModalTrigger.focus();
      }
      ordersModalTrigger = null;
    };
  
    const getOrderModalData = (button) => {
      const item = button.closest(".orders-mobile-item");
      const card = button.closest(".orders-card");
      const preview = button.closest(".mypage-order-preview");
      const thumb =
        item?.querySelector(".orders-mobile-thumb") ||
        card?.querySelector(".orders-thumb") ||
        preview?.querySelector(".mypage-order-preview-image");
      const orderTitle =
        card?.querySelector(".orders-card-head h2")?.textContent?.trim() ||
        preview?.querySelector(".mypage-order-preview-copy p span")?.textContent?.trim() ||
        preview?.querySelector(".mypage-order-preview-copy p")?.textContent?.trim() ||
        "Order #nnnnnnnnn";
      const status =
        card?.querySelector(".orders-card-head mark")?.textContent?.trim() ||
        preview?.dataset.orderStatus ||
        preview?.querySelector(".mypage-order-timeline .is-current b")?.textContent?.trim() ||
        "Shipped";
      const date =
        card?.querySelector(".orders-card-head time")?.textContent?.trim() ||
        preview?.dataset.orderDate ||
        "";
      const name =
        item?.querySelector("h3")?.textContent?.trim() ||
        preview?.querySelector(".mypage-order-preview-copy h3")?.textContent?.trim() ||
        "Selected items";
      const price =
        item?.querySelector("strong")?.textContent?.trim() ||
        card?.querySelector(".orders-card-head > strong")?.textContent?.trim() ||
        preview?.dataset.orderPrice ||
        "";
      const toneClass = Array.from(thumb?.classList || []).find((className) =>
        className.includes("--")
      );
  
      return { orderTitle, status, date, name, price, toneClass };
    };
  
    const setModalThumb = (target, toneClass) => {
      if (!target) return;
      target.className = "orders-dialog-thumb";
      if (toneClass) target.classList.add(toneClass);
    };
  
    const fillOrderModal = (type, data) => {
      const nameTarget = type === "review"
        ? ordersModalLayer.querySelector("[data-orders-modal-name]")
        : ordersModalLayer.querySelector("[data-orders-track-name]");
      const priceTarget = type === "review"
        ? ordersModalLayer.querySelector("[data-orders-modal-price]")
        : ordersModalLayer.querySelector("[data-orders-track-price]");
      const thumbTarget = type === "review"
        ? ordersModalLayer.querySelector("[data-orders-modal-thumb]")
        : ordersModalLayer.querySelector("[data-orders-track-thumb]");
  
      if (nameTarget) nameTarget.textContent = data.name;
      if (priceTarget) priceTarget.textContent = data.price;
      setModalThumb(thumbTarget, data.toneClass);
  
      if (type === "track") {
        const orderTarget = ordersModalLayer.querySelector("[data-orders-track-order]");
        const dateTarget = ordersModalLayer.querySelector("[data-orders-track-date]");
        const statusTarget = ordersModalLayer.querySelector("[data-orders-track-status]");
        if (orderTarget) orderTarget.textContent = data.orderTitle;
        if (dateTarget) dateTarget.textContent = data.date;
        if (statusTarget) statusTarget.textContent = data.status;
      }
    };
  
    const openOrdersModal = (type, button) => {
      ordersModalTrigger = button;
      const data = getOrderModalData(button);
      fillOrderModal(type, data);
      if (type === "review") resetReviewUpload();
      if (reviewDialog) reviewDialog.hidden = type !== "review";
      if (trackDialog) trackDialog.hidden = type !== "track";
      ordersModalLayer.hidden = false;
      ordersModalLayer.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-orders-modal-open");
      window.requestAnimationFrame(() => {
        const activeDialog = type === "review" ? reviewDialog : trackDialog;
        if (!activeDialog) return;
        activeDialog.scrollTop = 0;
        activeDialog.setAttribute("tabindex", "-1");
        activeDialog.focus({ preventScroll: true });
      });
    };
  
    ordersList?.addEventListener("click", (event) => {
      const button = event.target.closest(".orders-mobile-item button, .orders-card-actions button");
      if (!button || !ordersList.contains(button)) return;
  
      const label = button.textContent.trim().toLowerCase();
      if (label.includes("review")) {
        openOrdersModal("review", button);
      } else if (label.includes("track")) {
        openOrdersModal("track", button);
      }
    });
  
    mypageOrderPreview?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-mypage-order-track]");
      if (!button || !mypageOrderPreview.contains(button)) return;
      openOrdersModal("track", button);
    });
  
    ordersModalLayer.querySelectorAll("[data-orders-modal-close]").forEach((button) => {
      button.addEventListener("click", closeOrdersModal);
    });
  
    reviewRating?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-review-rating]");
      if (!button) return;
      const rating = Number(button.dataset.reviewRating || 0);
      reviewRating.querySelectorAll("button[data-review-rating]").forEach((star) => {
        star.classList.toggle("is-active", Number(star.dataset.reviewRating || 0) <= rating);
      });
    });
  
    reviewUploadButton?.addEventListener("click", () => {
      reviewFileInput?.click();
    });
  
    reviewFileInput?.addEventListener("change", () => {
      const selectedFiles = Array.from(reviewFileInput.files || []);
      resetReviewUpload();
      const files = selectedFiles
        .filter((file) => file.type.startsWith("image/"))
        .slice(0, 5);
  
      files.forEach((file) => {
        const url = URL.createObjectURL(file);
        reviewPhotoUrls.push(url);
        const item = document.createElement("span");
        item.className = "orders-review-preview-item";
        item.dataset.photoUrl = url;
        const image = document.createElement("img");
        image.src = url;
        image.alt = file.name;
        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "orders-review-photo-remove";
        removeButton.dataset.ordersReviewPhotoRemove = "true";
        removeButton.setAttribute("aria-label", `Remove ${file.name}`);
        removeButton.textContent = "횞";
        item.append(image, removeButton);
        reviewPreview?.appendChild(item);
      });
  
      updateReviewUploadStatus();
    });
  
    reviewPreview?.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-orders-review-photo-remove]");
      if (!removeButton || !reviewPreview.contains(removeButton)) return;
      const item = removeButton.closest(".orders-review-preview-item");
      const url = item?.dataset.photoUrl;
      if (url) {
        URL.revokeObjectURL(url);
        reviewPhotoUrls = reviewPhotoUrls.filter((photoUrl) => photoUrl !== url);
      }
      item?.remove();
      if (!reviewPhotoUrls.length && reviewFileInput) reviewFileInput.value = "";
      updateReviewUploadStatus();
    });
  
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !ordersModalLayer.hidden) {
        closeOrdersModal();
      }
    });
  }
  
})();
