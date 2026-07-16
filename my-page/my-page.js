(() => {
  document.querySelectorAll(".mypage-mobile-back").forEach((button) => {
    button.addEventListener("click", () => {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      window.location.href = "../index.html";
    });
  });

  const dialog = document.getElementById("mypage-avatar-dialog");

  if (dialog) {
    const avatarPhoto = document.querySelector(".mypage-avatar-photo");
    const previewPhoto = document.querySelector(".mypage-avatar-preview-photo");
    const fileInput = dialog.querySelector("[data-mypage-avatar-input]");
    const removeButton = dialog.querySelector("[data-mypage-avatar-remove]");
    const openButtons = document.querySelectorAll(
      ".mypage-edit-fab, .mypage-edit-desktop"
    );

    const storageKey = "bridgeon-mypage-avatar";
    let draftUrl = null;
    let openTrigger = null;

    const setPhoto = (img, url) => {
      if (!img) return;
      if (url) {
        img.src = url;
        img.hidden = false;
        return;
      }
      img.removeAttribute("src");
      img.hidden = true;
    };

    const syncRemoveVisibility = () => {
      if (!removeButton) return;
      removeButton.hidden = !draftUrl;
    };

    const applySaved = () => {
      let saved = null;
      try {
        saved = localStorage.getItem(storageKey);
      } catch {
        saved = null;
      }
      setPhoto(avatarPhoto, saved);
    };

    const openDialog = (trigger) => {
      openTrigger = trigger || null;
      let saved = null;
      try {
        saved = localStorage.getItem(storageKey);
      } catch {
        saved = null;
      }
      draftUrl = saved;
      setPhoto(previewPhoto, draftUrl);
      syncRemoveVisibility();
      if (fileInput) fileInput.value = "";
      dialog.hidden = false;
      dialog.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-mypage-avatar-open");
      dialog.querySelector(".mypage-avatar-close")?.focus();
    };

    const closeDialog = () => {
      dialog.hidden = true;
      dialog.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-mypage-avatar-open");
      if (fileInput) fileInput.value = "";
      if (openTrigger && typeof openTrigger.focus === "function") {
        openTrigger.focus();
      }
      openTrigger = null;
    };

    openButtons.forEach((button) => {
      button.addEventListener("click", () => openDialog(button));
    });

    dialog.querySelectorAll("[data-mypage-avatar-close]").forEach((button) => {
      button.addEventListener("click", closeDialog);
    });

    fileInput?.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file || !file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = () => {
        draftUrl = typeof reader.result === "string" ? reader.result : null;
        setPhoto(previewPhoto, draftUrl);
        syncRemoveVisibility();
      };
      reader.readAsDataURL(file);
    });

    removeButton?.addEventListener("click", () => {
      draftUrl = null;
      setPhoto(previewPhoto, null);
      if (fileInput) fileInput.value = "";
      syncRemoveVisibility();
    });

    dialog.querySelector("[data-mypage-avatar-save]")?.addEventListener("click", () => {
      try {
        if (draftUrl) {
          localStorage.setItem(storageKey, draftUrl);
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch {
        /* storage may be unavailable in private mode */
      }
      setPhoto(avatarPhoto, draftUrl);
      closeDialog();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !dialog.hidden) {
        closeDialog();
      }
    });

    applySaved();
  }

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

  if (ordersModalLayer && ordersList) {
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
      reviewDialog.hidden = true;
      trackDialog.hidden = true;
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
      const thumb = item?.querySelector(".orders-mobile-thumb") || card?.querySelector(".orders-thumb");
      const orderTitle = card?.querySelector(".orders-card-head h2")?.textContent?.trim() || "Order #nnnnnnnnn";
      const status = card?.querySelector(".orders-card-head mark")?.textContent?.trim() || "Shipped";
      const date = card?.querySelector(".orders-card-head time")?.textContent?.trim() || "";
      const name = item?.querySelector("h3")?.textContent?.trim() || "Selected items";
      const price = item?.querySelector("strong")?.textContent?.trim() || card?.querySelector(".orders-card-head > strong")?.textContent?.trim() || "";
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
      reviewDialog.hidden = type !== "review";
      trackDialog.hidden = type !== "track";
      ordersModalLayer.hidden = false;
      ordersModalLayer.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-orders-modal-open");
      window.requestAnimationFrame(() => {
        const activeDialog = type === "review" ? reviewDialog : trackDialog;
        activeDialog.querySelector("input, textarea, button")?.focus();
      });
    };

    ordersList.addEventListener("click", (event) => {
      const button = event.target.closest(".orders-mobile-item button, .orders-card-actions button");
      if (!button || !ordersList.contains(button)) return;

      const label = button.textContent.trim().toLowerCase();
      if (label.includes("review")) {
        openOrdersModal("review", button);
      } else if (label.includes("track")) {
        openOrdersModal("track", button);
      }
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
        removeButton.textContent = "×";
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

  const reviewEditLayer = document.querySelector("[data-review-edit-layer]");
  const reviewsList = document.querySelector(".reviews-list");

  if (reviewEditLayer && reviewsList) {
    const ratingGroup = reviewEditLayer.querySelector(".review-edit-rating");
    const headingInput = reviewEditLayer.querySelector("[data-review-edit-heading]");
    const copyInput = reviewEditLayer.querySelector("[data-review-edit-copy]");
    const brandTarget = reviewEditLayer.querySelector("[data-review-edit-brand]");
    const nameTarget = reviewEditLayer.querySelector("[data-review-edit-name]");
    const priceTarget = reviewEditLayer.querySelector("[data-review-edit-price]");
    const thumbTarget = reviewEditLayer.querySelector("[data-review-edit-thumb]");
    const photoUploadButton = reviewEditLayer.querySelector("[data-review-edit-upload]");
    const photoFileInput = reviewEditLayer.querySelector("[data-review-edit-files]");
    const photoUploadStatus = reviewEditLayer.querySelector("[data-review-edit-upload-status]");
    const photoPreview = reviewEditLayer.querySelector("[data-review-edit-preview]");
    let activeReviewCard = null;
    let activeReviewTrigger = null;
    let activeReviewRating = 5;
    let reviewDraftPhotoUrls = [];
    const reviewSavedPhotoUrls = new WeakMap();

    const setReviewEditRating = (rating) => {
      activeReviewRating = Math.max(1, Math.min(5, Number(rating) || 5));
      ratingGroup?.querySelectorAll("button[data-review-edit-rating]").forEach((button) => {
        button.classList.toggle(
          "is-active",
          Number(button.dataset.reviewEditRating || 0) <= activeReviewRating
        );
      });
    };

    const clearReviewDraftPhotos = (revoke = true) => {
      if (revoke) reviewDraftPhotoUrls.forEach((url) => URL.revokeObjectURL(url));
      reviewDraftPhotoUrls = [];
      if (photoFileInput) photoFileInput.value = "";
    };

    const renderReviewPhotoPreview = (card) => {
      if (!photoPreview) return;
      photoPreview.replaceChildren();
      const savedUrls = reviewSavedPhotoUrls.get(card);

      if (savedUrls?.length) {
        savedUrls.forEach((url) => {
          const image = document.createElement("img");
          image.src = url;
          image.alt = "Selected review photo";
          photoPreview.appendChild(image);
        });
        if (photoUploadStatus) photoUploadStatus.textContent = `${savedUrls.length} photos selected`;
        return;
      }

      const currentThumbs = Array.from(card.querySelectorAll(".review-gallery-thumb")).slice(0, 5);
      currentThumbs.forEach((thumb) => {
        const swatch = document.createElement("span");
        swatch.className = thumb.className;
        swatch.style.cssText = thumb.getAttribute("style") || "";
        photoPreview.appendChild(swatch);
      });
      if (photoUploadStatus) {
        photoUploadStatus.textContent = currentThumbs.length ? "Current photos" : "Up to 5 photos";
      }
    };

    const renderSelectedReviewPhotos = (files) => {
      if (!photoPreview) return;
      photoPreview.replaceChildren();
      clearReviewDraftPhotos();

      files.slice(0, 5).forEach((file) => {
        const url = URL.createObjectURL(file);
        reviewDraftPhotoUrls.push(url);
        const image = document.createElement("img");
        image.src = url;
        image.alt = file.name;
        photoPreview.appendChild(image);
      });

      if (photoUploadStatus) {
        photoUploadStatus.textContent = reviewDraftPhotoUrls.length
          ? `${reviewDraftPhotoUrls.length} photo${reviewDraftPhotoUrls.length > 1 ? "s" : ""} selected`
          : "Up to 5 photos";
      }
    };

    const closeReviewEdit = () => {
      reviewEditLayer.hidden = true;
      reviewEditLayer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-review-edit-open");
      clearReviewDraftPhotos();
      if (activeReviewTrigger && typeof activeReviewTrigger.focus === "function") {
        activeReviewTrigger.focus();
      }
      activeReviewCard = null;
      activeReviewTrigger = null;
    };

    const openReviewEdit = (button) => {
      const card = button.closest(".review-history-card");
      if (!card) return;

      activeReviewCard = card;
      activeReviewTrigger = button;
      const productArt = card.querySelector(".review-product-art");
      const productTone = Array.from(productArt?.classList || []).find((className) =>
        className.includes("--")
      );
      const rating = Math.round(Number(card.querySelector(".review-score b")?.textContent) || 5);

      if (brandTarget) brandTarget.textContent = card.querySelector(".review-product-copy p")?.textContent?.trim() || "";
      if (nameTarget) nameTarget.textContent = card.querySelector(".review-product-copy h2")?.textContent?.trim() || "";
      if (priceTarget) priceTarget.textContent = card.querySelector(".review-product-copy strong")?.textContent?.trim() || "";
      if (headingInput) headingInput.value = card.querySelector(".review-copy h3")?.textContent?.trim() || "";
      if (copyInput) copyInput.value = card.querySelector(".review-copy p")?.textContent?.trim() || "";
      if (thumbTarget) {
        thumbTarget.className = "review-edit-thumb";
        if (productTone) thumbTarget.classList.add(productTone);
      }
      setReviewEditRating(rating);
      clearReviewDraftPhotos();
      renderReviewPhotoPreview(card);

      reviewEditLayer.hidden = false;
      reviewEditLayer.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-review-edit-open");
      window.requestAnimationFrame(() => headingInput?.focus());
    };

    reviewsList.addEventListener("click", (event) => {
      const button = event.target.closest(".review-actions button");
      if (!button || !reviewsList.contains(button)) return;
      openReviewEdit(button);
    });

    ratingGroup?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-review-edit-rating]");
      if (!button) return;
      setReviewEditRating(button.dataset.reviewEditRating);
    });

    photoUploadButton?.addEventListener("click", () => {
      photoFileInput?.click();
    });

    photoFileInput?.addEventListener("change", () => {
      const files = Array.from(photoFileInput.files || []).filter((file) => file.type.startsWith("image/"));
      renderSelectedReviewPhotos(files);
    });

    reviewEditLayer.querySelector("[data-review-edit-save]")?.addEventListener("click", () => {
      if (!activeReviewCard) return;
      const reviewTitle = headingInput?.value.trim();
      const reviewCopy = copyInput?.value.trim();
      if (reviewTitle) activeReviewCard.querySelector(".review-copy h3").textContent = reviewTitle;
      if (reviewCopy) activeReviewCard.querySelector(".review-copy p").textContent = reviewCopy;
      const scoreText = activeReviewCard.querySelector(".review-score span");
      const scoreValue = activeReviewCard.querySelector(".review-score b");
      if (scoreText) {
        scoreText.textContent =
          `${String.fromCharCode(9733).repeat(activeReviewRating)}${String.fromCharCode(9734).repeat(5 - activeReviewRating)}`;
      }
      if (scoreValue) scoreValue.textContent = `${activeReviewRating}.0`;

      if (reviewDraftPhotoUrls.length) {
        const previousSavedUrls = reviewSavedPhotoUrls.get(activeReviewCard) || [];
        previousSavedUrls.forEach((url) => URL.revokeObjectURL(url));

        const gallery = activeReviewCard.querySelector(".review-gallery");
        gallery?.replaceChildren(
          ...reviewDraftPhotoUrls.map((url) => {
            const thumb = document.createElement("span");
            thumb.className = "review-gallery-thumb review-gallery-thumb--uploaded";
            thumb.style.backgroundImage = `url("${url}")`;
            return thumb;
          })
        );
        reviewSavedPhotoUrls.set(activeReviewCard, reviewDraftPhotoUrls);
        reviewDraftPhotoUrls = [];
        if (photoFileInput) photoFileInput.value = "";
      }

      closeReviewEdit();
    });

    reviewEditLayer.querySelectorAll("[data-review-edit-close]").forEach((button) => {
      button.addEventListener("click", closeReviewEdit);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !reviewEditLayer.hidden) {
        closeReviewEdit();
      }
    });
  }

  const pageSortSelectRoot = ".orders-select-row .realtrend-select-wrap, .reviews-select-row .realtrend-select-wrap";

  const initOrdersSortSelect = (wrap) => {
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
      if (
        wrap.closest(".orders-select-row, .reviews-select-row") &&
        window.matchMedia("(max-width: 1120px)").matches
      ) {
        wrap.style.width = "100%";
      } else {
        syncTriggerWidth();
      }
    };

    const closeMenu = () => {
      wrap.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
    };

    const openMenu = () => {
      document.querySelectorAll(pageSortSelectRoot).forEach((otherWrap) => {
        if (otherWrap === wrap || !otherWrap.classList.contains("is-open")) return;
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
      select.dispatchEvent(new Event("change", { bubbles: true }));
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

    return { closeMenu, buildMenu };
  };

  const ordersSortSelectApis = new Map();
  document.querySelectorAll(pageSortSelectRoot).forEach((wrap) => {
    const api = initOrdersSortSelect(wrap);
    if (api) ordersSortSelectApis.set(wrap, api);
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(pageSortSelectRoot)) return;
    ordersSortSelectApis.forEach((api) => api.closeMenu());
  });

  window.addEventListener("resize", () => {
    ordersSortSelectApis.forEach((api) => api.buildMenu());
  });
})();
