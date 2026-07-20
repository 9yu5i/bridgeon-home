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
    let reviewPhotosDirty = false;
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

    const updateReviewEditUploadStatus = (fallbackText) => {
      if (!photoUploadStatus) return;
      const count = photoPreview?.querySelectorAll(".review-edit-preview-item").length || 0;
      if (count) {
        photoUploadStatus.textContent = `${count} photo${count > 1 ? "s" : ""} selected`;
        return;
      }
      photoUploadStatus.textContent = fallbackText || "Up to 5 photos";
    };

    const createReviewEditPreviewItem = (media, { photoUrl, label } = {}) => {
      const item = document.createElement("div");
      item.className = "review-edit-preview-item";
      if (photoUrl) item.dataset.photoUrl = photoUrl;

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "review-edit-photo-remove";
      removeButton.dataset.reviewEditPhotoRemove = "true";
      removeButton.setAttribute("aria-label", label || "Remove photo");
      removeButton.textContent = "\u00D7";

      item.append(media, removeButton);
      return item;
    };

    const clearReviewDraftPhotos = (revoke = true) => {
      if (revoke) reviewDraftPhotoUrls.forEach((url) => URL.revokeObjectURL(url));
      reviewDraftPhotoUrls = [];
      if (photoFileInput) photoFileInput.value = "";
    };

    const renderReviewPhotoPreview = (card) => {
      if (!photoPreview) return;
      photoPreview.replaceChildren();
      reviewPhotosDirty = false;
      const savedUrls = reviewSavedPhotoUrls.get(card);

      if (savedUrls?.length) {
        savedUrls.forEach((url, index) => {
          const image = document.createElement("img");
          image.src = url;
          image.alt = "Selected review photo";
          photoPreview.appendChild(
            createReviewEditPreviewItem(image, {
              photoUrl: url,
              label: `Remove photo ${index + 1}`,
            })
          );
        });
        updateReviewEditUploadStatus();
        return;
      }

      const currentThumbs = Array.from(card.querySelectorAll(".review-gallery-thumb")).slice(0, 5);
      currentThumbs.forEach((thumb, index) => {
        const swatch = document.createElement("span");
        swatch.className = thumb.className;
        swatch.style.cssText = thumb.getAttribute("style") || "";
        photoPreview.appendChild(
          createReviewEditPreviewItem(swatch, {
            label: `Remove photo ${index + 1}`,
          })
        );
      });
      if (photoUploadStatus) {
        photoUploadStatus.textContent = currentThumbs.length ? "Current photos" : "Up to 5 photos";
      }
    };

    const renderSelectedReviewPhotos = (files) => {
      if (!photoPreview) return;
      photoPreview.replaceChildren();
      clearReviewDraftPhotos();
      reviewPhotosDirty = true;

      files.slice(0, 5).forEach((file) => {
        const url = URL.createObjectURL(file);
        reviewDraftPhotoUrls.push(url);
        const image = document.createElement("img");
        image.src = url;
        image.alt = file.name;
        photoPreview.appendChild(
          createReviewEditPreviewItem(image, {
            photoUrl: url,
            label: `Remove ${file.name}`,
          })
        );
      });

      updateReviewEditUploadStatus();
    };

    const closeReviewEdit = () => {
      reviewEditLayer.hidden = true;
      reviewEditLayer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-review-edit-open");
      clearReviewDraftPhotos();
      reviewPhotosDirty = false;
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

    photoPreview?.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-review-edit-photo-remove]");
      if (!removeButton || !photoPreview.contains(removeButton)) return;

      event.preventDefault();
      event.stopPropagation();

      const item = removeButton.closest(".review-edit-preview-item");
      if (!item) return;

      const url = item.dataset.photoUrl;
      if (url) {
        const draftIndex = reviewDraftPhotoUrls.indexOf(url);
        if (draftIndex !== -1) {
          URL.revokeObjectURL(url);
          reviewDraftPhotoUrls.splice(draftIndex, 1);
        }
      }

      item.remove();
      reviewPhotosDirty = true;
      if (photoFileInput) photoFileInput.value = "";
      updateReviewEditUploadStatus();
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

      if (reviewDraftPhotoUrls.length || reviewPhotosDirty) {
        const previousSavedUrls = reviewSavedPhotoUrls.get(activeReviewCard) || [];
        const gallery = activeReviewCard.querySelector(".review-gallery");
        const previewItems = Array.from(photoPreview?.querySelectorAll(".review-edit-preview-item") || []);
        const nextSavedUrls = [];

        gallery?.replaceChildren(
          ...previewItems.map((item) => {
            const image = item.querySelector("img");
            const swatch = item.querySelector("span");
            const thumb = document.createElement("span");

            if (image?.src) {
              const url = item.dataset.photoUrl || image.src;
              thumb.className = "review-gallery-thumb review-gallery-thumb--uploaded";
              thumb.style.backgroundImage = `url("${url}")`;
              if (url.startsWith("blob:")) nextSavedUrls.push(url);
              return thumb;
            }

            thumb.className = swatch?.className || "review-gallery-thumb";
            thumb.style.cssText = swatch?.getAttribute("style") || "";
            return thumb;
          })
        );

        previousSavedUrls.forEach((url) => {
          if (!nextSavedUrls.includes(url)) URL.revokeObjectURL(url);
        });

        if (nextSavedUrls.length) {
          reviewSavedPhotoUrls.set(activeReviewCard, nextSavedUrls);
        } else {
          reviewSavedPhotoUrls.delete(activeReviewCard);
        }

        reviewDraftPhotoUrls = [];
        reviewPhotosDirty = false;
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

  const profileCallingCodeByCountry = new Map(
    [
      ["United States", "+1 US"],
      ["Canada", "+1 CA"],
      ["United Kingdom", "+44 UK"],
      ["Australia", "+61 AU"],
      ["New Zealand", "+64 NZ"],
      ["Japan", "+81 JP"],
      ["South Korea", "+82 KR"],
      ["Singapore", "+65 SG"],
      ["Hong Kong", "+852 HK"],
      ["Taiwan", "+886 TW"],
      ["Germany", "+49 DE"],
      ["France", "+33 FR"],
      ["Italy", "+39 IT"],
      ["Spain", "+34 ES"],
      ["Netherlands", "+31 NL"],
      ["Belgium", "+32 BE"],
      ["Sweden", "+46 SE"],
      ["Norway", "+47 NO"],
      ["Denmark", "+45 DK"],
      ["Finland", "+358 FI"],
      ["Ireland", "+353 IE"],
      ["Switzerland", "+41 CH"],
      ["Austria", "+43 AT"],
      ["Portugal", "+351 PT"],
      ["Poland", "+48 PL"],
      ["Czech Republic", "+420 CZ"],
      ["Hungary", "+36 HU"],
      ["Romania", "+40 RO"],
      ["Greece", "+30 GR"],
      ["Luxembourg", "+352 LU"],
      ["Iceland", "+354 IS"],
      ["Mexico", "+52 MX"],
      ["Brazil", "+55 BR"],
      ["Chile", "+56 CL"],
      ["Colombia", "+57 CO"],
      ["Argentina", "+54 AR"],
      ["Peru", "+51 PE"],
      ["United Arab Emirates", "+971 AE"],
      ["Saudi Arabia", "+966 SA"],
      ["Israel", "+972 IL"],
      ["Turkey", "+90 TR"],
      ["India", "+91 IN"],
      ["Indonesia", "+62 ID"],
      ["Malaysia", "+60 MY"],
      ["Thailand", "+66 TH"],
      ["Vietnam", "+84 VN"],
      ["Philippines", "+63 PH"],
      ["China", "+86 CN"],
      ["South Africa", "+27 ZA"],
      ["Egypt", "+20 EG"],
      ["Nigeria", "+234 NG"],
      ["Kenya", "+254 KE"],
      ["Morocco", "+212 MA"],
      ["Russia", "+7 RU"],
      ["Ukraine", "+380 UA"],
      ["Croatia", "+385 HR"],
      ["Slovakia", "+421 SK"],
      ["Slovenia", "+386 SI"],
      ["Bulgaria", "+359 BG"],
      ["Estonia", "+372 EE"],
      ["Latvia", "+371 LV"],
      ["Lithuania", "+370 LT"],
      ["Malta", "+356 MT"],
      ["Cyprus", "+357 CY"],
      ["Qatar", "+974 QA"],
      ["Kuwait", "+965 KW"],
      ["Bahrain", "+973 BH"],
      ["Oman", "+968 OM"],
      ["Jordan", "+962 JO"],
      ["Lebanon", "+961 LB"],
      ["Costa Rica", "+506 CR"],
      ["Panama", "+507 PA"],
      ["Dominican Republic", "+1 DO"],
      ["Puerto Rico", "+1 PR"],
      ["Guatemala", "+502 GT"],
      ["Uruguay", "+598 UY"],
      ["Ecuador", "+593 EC"],
      ["Pakistan", "+92 PK"],
      ["Bangladesh", "+880 BD"],
      ["Sri Lanka", "+94 LK"],
      ["Cambodia", "+855 KH"],
      ["Laos", "+856 LA"],
      ["Myanmar", "+95 MM"],
      ["Macao", "+853 MO"],
      ["Mongolia", "+976 MN"],
      ["Kazakhstan", "+7 KZ"],
      ["Georgia", "+995 GE"],
      ["Armenia", "+374 AM"],
      ["Azerbaijan", "+994 AZ"],
      ["Serbia", "+381 RS"],
      ["Bosnia and Herzegovina", "+387 BA"],
      ["North Macedonia", "+389 MK"],
      ["Albania", "+355 AL"],
      ["Moldova", "+373 MD"],
      ["Belarus", "+375 BY"],
      ["Ghana", "+233 GH"],
      ["Tanzania", "+255 TZ"],
      ["Uganda", "+256 UG"],
      ["Tunisia", "+216 TN"],
      ["Algeria", "+213 DZ"],
      ["Mauritius", "+230 MU"],
      ["Reunion", "+262 RE"],
      ["Guadeloupe", "+590 GP"],
      ["Martinique", "+596 MQ"],
      ["French Guiana", "+594 GF"],
      ["New Caledonia", "+687 NC"],
      ["Fiji", "+679 FJ"],
      ["Papua New Guinea", "+675 PG"],
      ["Samoa", "+685 WS"],
      ["Tonga", "+676 TO"],
      ["Brunei", "+673 BN"],
      ["Maldives", "+960 MV"],
      ["Nepal", "+977 NP"],
      ["Bhutan", "+975 BT"],
      ["Trinidad and Tobago", "+1 TT"],
      ["Jamaica", "+1 JM"],
      ["Bahamas", "+1 BS"],
      ["Barbados", "+1 BB"],
      ["Belize", "+501 BZ"],
      ["El Salvador", "+503 SV"],
      ["Honduras", "+504 HN"],
      ["Nicaragua", "+505 NI"],
      ["Paraguay", "+595 PY"],
      ["Bolivia", "+591 BO"],
      ["Venezuela", "+58 VE"],
    ].map(([country, code]) => [country.toLowerCase(), code])
  );

  const getProfileCallingCode = (country) => {
    const countryName = String(country || "").trim();
    const asciiName = countryName.replace(/[^\x00-\x7F]/g, "");
    if (/^r.*nion$/i.test(asciiName)) return "+262 RE";
    return profileCallingCodeByCountry.get(countryName.toLowerCase()) || "+1 US";
  };

  const syncProfilePhoneCodes = () => {
    const countrySelect = document.querySelector(
      '.profile-select-control .realtrend-select-native[aria-label="Country or region"]'
    );
    const phoneSelect = document.querySelector(
      '.profile-phone-code .realtrend-select-native[aria-label="Country calling code"]'
    );
    if (!countrySelect || !phoneSelect) return;

    const previousValue = phoneSelect.value || phoneSelect.selectedOptions[0]?.textContent?.trim();
    const options = Array.from(countrySelect.options).map((countryOption) => {
      const option = document.createElement("option");
      const label = getProfileCallingCode(countryOption.textContent);
      option.value = label;
      option.textContent = label;
      option.selected = label === previousValue;
      return option;
    });

    phoneSelect.replaceChildren(...options);
    if (!Array.from(phoneSelect.options).some((option) => option.value === previousValue)) {
      phoneSelect.value = "+1 US";
    }
  };

  syncProfilePhoneCodes();

  const getProfileCountryNames = () => {
    const countrySelect = document.querySelector(
      '.profile-select-control .realtrend-select-native[aria-label="Country or region"]'
    );
    return Array.from(countrySelect?.options || [])
      .map((option) => option.textContent.trim())
      .filter(Boolean);
  };

  const populateProfileAddressModalSelects = () => {
    const countryNames = getProfileCountryNames();
    const addressCountrySelect = document.querySelector(
      '.profile-address-country .realtrend-select-native[aria-label="Address country or region"]'
    );
    const addressPhoneSelect = document.querySelector(
      '.profile-address-phone-code .realtrend-select-native[aria-label="Address country calling code"]'
    );

    if (addressCountrySelect) {
      const globalOption = document.createElement("option");
      globalOption.value = "Global";
      globalOption.textContent = "Global";
      globalOption.selected = true;

      const countryOptions = countryNames.map((country) => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        return option;
      });

      addressCountrySelect.replaceChildren(globalOption, ...countryOptions);
      addressCountrySelect.value = "Global";
    }

    if (addressPhoneSelect) {
      const codes = Array.from(
        new Set(countryNames.map((country) => getProfileCallingCode(country)))
      );
      const options = codes.map((code) => {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = code;
        option.selected = code === "+1 US";
        return option;
      });

      addressPhoneSelect.replaceChildren(...options);
      addressPhoneSelect.value = codes.includes("+1 US") ? "+1 US" : codes[0] || "";
    }
  };

  populateProfileAddressModalSelects();

  const clearProfileSampleInputValue = (field) => {
    if (!field) return;
    const value = field.value.trim();
    const samples = new Set(["Name", "000 000 0000", "name@email.com", field.placeholder?.trim()].filter(Boolean));
    if (samples.has(value)) field.value = "";
  };

  document.querySelectorAll("[data-profile-clear-sample]").forEach((field) => {
    field.addEventListener("focus", () => clearProfileSampleInputValue(field));
    field.addEventListener("pointerdown", () => clearProfileSampleInputValue(field));
  });

  const pageSortSelectRoot =
    ".orders-select-row .realtrend-select-wrap, .reviews-select-row .realtrend-select-wrap, .profile-field .realtrend-select-wrap";

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
        wrap.closest(".profile-field") ||
        (wrap.closest(".orders-select-row, .reviews-select-row") &&
          window.matchMedia("(max-width: 1120px)").matches)
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

  const normalizeAccountFilter = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  document.querySelectorAll(".account-collection-tabs").forEach((tabs) => {
    const content = tabs.closest(".account-collection-content");
    if (!content) return;

    const buttons = Array.from(tabs.querySelectorAll("button"));
    const items = Array.from(content.querySelectorAll("[data-account-category]"));
    if (!buttons.length || !items.length) return;

    const applyFilter = (filter) => {
      const activeFilter = filter || "all";

      buttons.forEach((button) => {
        const buttonFilter = normalizeAccountFilter(button.dataset.accountFilter || button.textContent);
        const isActive = buttonFilter === activeFilter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      items.forEach((item) => {
        const itemFilter = normalizeAccountFilter(item.dataset.accountCategory);
        item.hidden = activeFilter !== "all" && itemFilter !== activeFilter;
      });
    };

    buttons.forEach((button) => {
      button.dataset.accountFilter = normalizeAccountFilter(button.dataset.accountFilter || button.textContent);
      button.addEventListener("click", () => applyFilter(button.dataset.accountFilter));
    });

    const initialButton = buttons.find((button) => button.classList.contains("is-active")) || buttons[0];
    applyFilter(normalizeAccountFilter(initialButton?.dataset.accountFilter || initialButton?.textContent || "all"));
  });

  document.querySelectorAll(".points-history-tabs").forEach((tabs) => {
    const history = tabs.closest(".points-history");
    const buttons = Array.from(tabs.querySelectorAll("[data-point-filter]"));
    const rows = Array.from(history?.querySelectorAll("[data-point-type]") || []);
    if (!buttons.length || !rows.length) return;

    const applyPointFilter = (filter) => {
      buttons.forEach((button) => {
        const isActive = button.dataset.pointFilter === filter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      rows.forEach((row) => {
        row.hidden = filter !== "all" && row.dataset.pointType !== filter;
      });
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => applyPointFilter(button.dataset.pointFilter || "all"));
    });

    const initialButton = buttons.find((button) => button.classList.contains("is-active")) || buttons[0];
    applyPointFilter(initialButton.dataset.pointFilter || "all");
  });

  document.querySelectorAll("[data-coupon-register-form]").forEach((form) => {
    const input = form.querySelector("#coupon-code");
    const message = form.querySelector("[data-coupon-register-message]");
    const grid = document.querySelector("[data-coupon-grid]");
    const count = document.querySelector("[data-coupon-count]");
    const validCode = "COUPONTEST";

    if (!input || !message || !grid) return;

    const setCouponMessage = (text, type = "error") => {
      message.textContent = text;
      message.classList.toggle("is-success", type === "success");
      input.setAttribute("aria-invalid", type === "error" ? "true" : "false");
    };

    const updateCouponCount = () => {
      if (!count) return;
      count.textContent = `(${grid.querySelectorAll(".coupon-ticket").length})`;
    };

    const createTestCoupon = () => {
      const coupon = document.createElement("article");
      coupon.className = "coupon-ticket";
      coupon.dataset.couponCode = validCode;
      coupon.innerHTML = `
        <div class="coupon-ticket-top">
          <span>NEW</span>
          <p><b>Expires on</b>2026-07-16 23:59 (KST)</p>
        </div>
        <h3><strong>5%</strong> OFF</h3>
        <p class="coupon-name">Surprise Coupon</p>
        <p class="coupon-terms">Min. Purchase US$30&nbsp; | &nbsp;Max. Discount US$10</p>
      `;
      return coupon;
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const code = input.value.trim().toUpperCase();

      if (code !== validCode) {
        setCouponMessage("Invalid coupon code. Please check the code and try again.");
        return;
      }

      if (!grid.querySelector(`[data-coupon-code="${validCode}"]`)) {
        grid.prepend(createTestCoupon());
        updateCouponCount();
      }

      input.value = "";
      setCouponMessage("COUPONTEST has been added to My Coupons.", "success");
    });

    input.addEventListener("input", () => {
      if (!message.textContent) return;
      message.textContent = "";
      message.classList.remove("is-success");
      input.removeAttribute("aria-invalid");
    });
  });

  const addressDialog = document.getElementById("profile-address-dialog");
  const addressForm = addressDialog?.querySelector("[data-profile-address-form]");
  const addressSearchInput = addressForm?.querySelector("[data-profile-address-search]");
  const addressSuggestionList = addressForm?.querySelector("[data-profile-address-suggestions]");
  const addressSubmitButton = addressForm?.querySelector("[data-profile-address-submit]");
  let activeAddressCard = null;

  if (addressDialog && addressForm) {
    const addressSuggestions = [
      { address: "350 5th Ave", city: "New York", state: "NY", zip: "10118", country: "United States" },
      { address: "1600 Amphitheatre Pkwy", city: "Mountain View", state: "CA", zip: "94043", country: "United States" },
      { address: "290 Bremner Blvd", city: "Toronto", state: "ON", zip: "M5V 3L9", country: "Canada" },
      { address: "100 Queen St W", city: "Toronto", state: "ON", zip: "M5H 2N2", country: "Canada" },
      { address: "300 Olympic-ro", city: "Seoul", state: "Songpa-gu", zip: "05551", country: "South Korea" },
      { address: "12 Haneul-gil", city: "Seoul", state: "Gangseo-gu", zip: "07505", country: "South Korea" },
      { address: "4-2-8 Shibakoen", city: "Minato City", state: "Tokyo", zip: "105-0011", country: "Japan" },
      { address: "1-1 Maihama", city: "Urayasu", state: "Chiba", zip: "279-0031", country: "Japan" },
      { address: "Westminster Bridge Road", city: "London", state: "England", zip: "SE1 7PB", country: "United Kingdom" },
      { address: "1 New Change", city: "London", state: "England", zip: "EC4M 9AF", country: "United Kingdom" },
      { address: "Bennelong Point", city: "Sydney", state: "NSW", zip: "2000", country: "Australia" },
      { address: "Federation Square", city: "Melbourne", state: "VIC", zip: "3000", country: "Australia" },
      { address: "10 Bayfront Avenue", city: "Singapore", state: "Singapore", zip: "018956", country: "Singapore" },
      { address: "93 Stamford Road", city: "Singapore", state: "Singapore", zip: "178897", country: "Singapore" },
      { address: "Pariser Platz", city: "Berlin", state: "BE", zip: "10117", country: "Germany" },
      { address: "Potsdamer Platz 1", city: "Berlin", state: "BE", zip: "10785", country: "Germany" },
      { address: "Champ de Mars", city: "Paris", state: "Ile-de-France", zip: "75007", country: "France" },
      { address: "6 Parvis Notre-Dame", city: "Paris", state: "Ile-de-France", zip: "75004", country: "France" },
    ];

    const addressFields = {
      mode: addressForm.elements.mode,
      country: addressForm.elements.country,
      address: addressForm.elements.address,
      apt: addressForm.elements.apt,
      city: addressForm.elements.city,
      state: addressForm.elements.state,
      zip: addressForm.elements.zip,
      phoneCode: addressForm.elements.phoneCode,
      phone: addressForm.elements.phone,
      email: addressForm.elements.email,
    };

    const setFieldValue = (field, value) => {
      if (field) field.value = value || "";
    };

    const clearAddressSampleValue = (field) => {
      if (!field) return;
      const value = field.value.trim();
      const samples = new Set(["000 000 0000", "name@email.com", field.placeholder?.trim()].filter(Boolean));
      if (samples.has(value)) field.value = "";
    };

    const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const getDialingCode = (value) => String(value || "").trim().match(/^\+\d+/)?.[0] || "";

    const stripAddressPhoneCountryCode = (phoneNumber) => {
      let value = String(phoneNumber || "").trim();
      const selectedCode = addressFields.phoneCode?.value || "";
      const codeCandidates = [
        selectedCode,
        getDialingCode(selectedCode),
        ...Array.from(addressFields.phoneCode?.options || []).flatMap((option) => [
          option.value,
          option.textContent.trim(),
          getDialingCode(option.value),
          getDialingCode(option.textContent),
        ]),
      ]
        .filter(Boolean)
        .sort((a, b) => b.length - a.length);

      const matchedCode = codeCandidates.find((code) =>
        new RegExp(`^${escapeRegExp(code)}(?:\\s|-|(?=\\d)|$)`).test(value)
      );
      if (matchedCode) value = value.replace(new RegExp(`^${escapeRegExp(matchedCode)}(?:\\s|-)*`), "").trim();
      return value;
    };

    const rebuildAddressSelect = (select) => {
      const wrap = select?.closest(".realtrend-select-wrap");
      const api = wrap ? ordersSortSelectApis.get(wrap) : null;
      if (api) api.buildMenu();
    };

    const setAddressSelectValue = (select, value) => {
      if (!select) return;
      const option = Array.from(select.options).find(
        (selectOption) => selectOption.value === value || selectOption.textContent.trim() === value
      );
      if (option) {
        select.value = option.value;
      } else {
        select.value = select.options[0]?.value || "";
      }
      rebuildAddressSelect(select);
    };

    const splitAddressPhone = (phone) => {
      const value = String(phone || "").trim();
      const codes = Array.from(addressFields.phoneCode?.options || [])
        .map((option) => option.value || option.textContent.trim())
        .sort((a, b) => b.length - a.length);
      const matchedCode = codes.find((code) => value === code || value.startsWith(`${code} `));

      return {
        code: matchedCode || "+1 US",
        number: matchedCode ? value.slice(matchedCode.length).trim() : value,
      };
    };

    const getAddressData = () => {
      const phoneNumber = stripAddressPhoneCountryCode(addressFields.phone?.value);
      setFieldValue(addressFields.phone, phoneNumber);
      return {
        country: addressFields.country?.value || "Global",
        addressLine: addressFields.address?.value.trim() || "",
        apt: addressFields.apt?.value.trim() || "",
        city: addressFields.city?.value.trim() || "",
        state: addressFields.state?.value.trim() || "",
        zip: addressFields.zip?.value.trim() || "",
        phone: phoneNumber ? `${addressFields.phoneCode?.value || "+1 US"} ${phoneNumber}` : "",
        email: addressFields.email?.value.trim() || "",
      };
    };

    const applySuggestion = (suggestion) => {
      setAddressSelectValue(addressFields.country, suggestion.country);
      setAddressSelectValue(addressFields.phoneCode, getProfileCallingCode(suggestion.country));
      setFieldValue(addressFields.address, suggestion.address);
      setFieldValue(addressFields.city, suggestion.city);
      setFieldValue(addressFields.state, suggestion.state);
      setFieldValue(addressFields.zip, suggestion.zip);
      if (addressSuggestionList) addressSuggestionList.hidden = true;
    };

    const getCountryAddressSuggestions = () => {
      const country = addressFields.country?.value || "Global";
      if (country === "Global") return addressSuggestions;
      const countryMatches = addressSuggestions.filter((suggestion) => suggestion.country === country);
      return countryMatches.length ? countryMatches : addressSuggestions;
    };

    const updateAddressPlaceholder = () => {
      if (!addressSearchInput) return;
      const firstSuggestion = getCountryAddressSuggestions()[0];
      addressSearchInput.placeholder = firstSuggestion
        ? addressFields.country?.value === "Global"
          ? "Search addresses worldwide"
          : `Try ${firstSuggestion.address}`
        : "Start typing your street address";
    };

    const renderAddressSuggestions = () => {
      if (!addressSuggestionList || !addressSearchInput) return;
      const query = addressSearchInput.value.trim().toLowerCase();
      addressSuggestionList.replaceChildren();
      const countrySuggestions = getCountryAddressSuggestions();

      if (!query) {
        addressSuggestionList.hidden = true;
        return;
      }

      const matches = countrySuggestions.filter((suggestion) =>
        `${suggestion.address} ${suggestion.city} ${suggestion.state} ${suggestion.zip} ${suggestion.country}`
          .toLowerCase()
          .includes(query)
      );

      (matches.length ? matches : countrySuggestions).slice(0, 4).forEach((suggestion) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.innerHTML = `<strong></strong><small></small>`;
        button.querySelector("strong").textContent = suggestion.address;
        button.querySelector("small").textContent =
          `${suggestion.city}, ${suggestion.state} ${suggestion.zip} - ${suggestion.country}`;
        button.addEventListener("click", () => applySuggestion(suggestion));
        item.appendChild(button);
        addressSuggestionList.appendChild(item);
      });

      addressSuggestionList.hidden = false;
    };

    const setAddressCardContent = (card, data) => {
      card.dataset.country = data.country;
      card.dataset.addressLine = data.addressLine;
      card.dataset.apt = data.apt;
      card.dataset.city = data.city;
      card.dataset.state = data.state;
      card.dataset.zip = data.zip;
      card.dataset.phone = data.phone;
      card.dataset.email = data.email;

      const info = card.querySelector("div");
      const title = info?.querySelector("strong");
      const address = info?.querySelector("p");
      const contact = info?.querySelector("small");
      const editButton = card.querySelector("[data-profile-edit-address]");
      const addressLine = [data.addressLine, data.apt].filter(Boolean).join(", ");
      const regionLine = [data.city, data.state].filter(Boolean).join(", ");

      if (title) title.textContent = "Name";
      if (address) {
        address.replaceChildren(
          document.createTextNode(addressLine || "Enter your shipping address."),
          document.createElement("br"),
          document.createTextNode(`${regionLine}${regionLine && data.zip ? " " : ""}${data.zip}`)
        );
      }
      if (contact) {
        contact.replaceChildren(
          document.createTextNode(data.phone || "Add phone number"),
          ...(data.email ? [document.createElement("br"), document.createTextNode(data.email)] : [])
        );
      }
      if (editButton) editButton.textContent = "Edit";
    };

    const updateDefaultAddress = (selectedCard) => {
      document.querySelectorAll("[data-profile-address-card]").forEach((card) => {
        const isDefault = card === selectedCard;
        const mark = card.querySelector("mark");
        const button = card.querySelector("[data-profile-set-default-address]");
        if (mark) {
          mark.textContent = "Default";
          mark.hidden = !isDefault;
        }
        if (button) {
          button.textContent = isDefault ? "Default" : "Set Default";
          button.disabled = isDefault;
        }
      });
    };

    const createAddressCard = (data) => {
      const card = document.createElement("article");
      card.className = "profile-address-card";
      card.dataset.profileAddressCard = "";

      const info = document.createElement("div");
      info.appendChild(document.createElement("strong"));
      info.appendChild(document.createElement("p"));
      info.appendChild(document.createElement("small"));

      const mark = document.createElement("mark");
      mark.textContent = "Default";
      mark.hidden = true;

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.dataset.profileEditAddress = "";
      editButton.textContent = "Edit";

      const defaultButton = document.createElement("button");
      defaultButton.type = "button";
      defaultButton.dataset.profileSetDefaultAddress = "";
      defaultButton.textContent = "Set Default";

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "profile-address-delete";
      deleteButton.dataset.profileDeleteAddress = "";
      deleteButton.textContent = "Delete";

      const actions = document.createElement("div");
      actions.className = "profile-address-actions";
      actions.append(editButton, defaultButton, deleteButton);

      card.append(info, mark, actions);
      setAddressCardContent(card, data);
      return card;
    };

    const fillAddressForm = (card) => {
      const defaults = {
        country: "Global",
        addressLine: "",
        apt: "",
        city: "",
        state: "",
        zip: "",
        phoneCode: "+1 US",
        phone: "",
        email: "",
      };
      const data = card ? { ...defaults, ...card.dataset } : defaults;
      const phoneParts = splitAddressPhone(data.phone);

      setFieldValue(addressFields.mode, card ? "edit" : "add");
      setAddressSelectValue(addressFields.country, data.country || "Global");
      setFieldValue(addressFields.address, data.addressLine);
      setFieldValue(addressFields.apt, data.apt);
      setFieldValue(addressFields.city, data.city);
      setFieldValue(addressFields.state, data.state);
      setFieldValue(addressFields.zip, data.zip);
      setAddressSelectValue(addressFields.phoneCode, phoneParts.code || data.phoneCode || "+1 US");
      setFieldValue(addressFields.phone, phoneParts.number);
      setFieldValue(addressFields.email, data.email);
      updateAddressPlaceholder();
      if (addressSuggestionList) addressSuggestionList.hidden = true;
    };

    const closeAddressDialog = () => {
      addressDialog.hidden = true;
      addressDialog.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-profile-address-open");
      activeAddressCard = null;
      if (addressSubmitButton) {
        addressSubmitButton.textContent = "Save";
        addressSubmitButton.disabled = false;
      }
    };

    const openAddressDialog = (card = null) => {
      activeAddressCard = card;
      fillAddressForm(card);
      addressDialog.hidden = false;
      addressDialog.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-profile-address-open");
      window.setTimeout(() => {
        addressFields.country
          ?.closest(".realtrend-select-wrap")
          ?.querySelector(".realtrend-select-trigger")
          ?.focus();
      }, 0);
    };

    document.querySelectorAll("[data-profile-add-address]").forEach((button) => {
      button.addEventListener("click", () => openAddressDialog());
    });

    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-profile-edit-address]");
      if (!button) return;
      const card = button.closest("[data-profile-address-card]");
      if (card) openAddressDialog(card);
    });

    document.addEventListener("click", (event) => {
      const defaultButton = event.target.closest("[data-profile-set-default-address]");
      if (defaultButton) {
        const card = defaultButton.closest("[data-profile-address-card]");
        if (card) updateDefaultAddress(card);
        return;
      }

      const deleteButton = event.target.closest("[data-profile-delete-address]");
      if (!deleteButton) return;
      const card = deleteButton.closest("[data-profile-address-card]");
      if (!card) return;
      const wasDefault = card.querySelector("[data-profile-set-default-address]")?.disabled;
      card.remove();
      if (wasDefault) {
        const nextCard = document.querySelector("[data-profile-address-card]");
        if (nextCard) updateDefaultAddress(nextCard);
      }
    });

    addressDialog.querySelectorAll("[data-profile-address-close]").forEach((button) => {
      button.addEventListener("click", closeAddressDialog);
    });

    addressFields.country?.addEventListener("change", () => {
      const selectedCountry = addressFields.country?.value || "Global";
      if (selectedCountry !== "Global") {
        setAddressSelectValue(addressFields.phoneCode, getProfileCallingCode(selectedCountry));
      }
      setFieldValue(addressFields.address, "");
      setFieldValue(addressFields.city, "");
      setFieldValue(addressFields.state, "");
      setFieldValue(addressFields.zip, "");
      updateAddressPlaceholder();
      if (addressSuggestionList) addressSuggestionList.hidden = true;
    });

    addressForm.querySelectorAll("[data-profile-clear-sample]").forEach((field) => {
      field.addEventListener("focus", () => clearAddressSampleValue(field));
    });

    addressFields.phone?.addEventListener("blur", () => {
      setFieldValue(addressFields.phone, stripAddressPhoneCountryCode(addressFields.phone.value));
    });

    updateAddressPlaceholder();
    addressSearchInput?.addEventListener("input", renderAddressSuggestions);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !addressDialog.hidden) closeAddressDialog();
    });

    addressForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = getAddressData();
      if (!data.addressLine || !data.city || !data.state || !data.zip) {
        renderAddressSuggestions();
        addressFields.address?.focus();
        return;
      }

      if (activeAddressCard) {
        setAddressCardContent(activeAddressCard, data);
      } else {
        const addressCardSection = document.querySelector("[data-profile-add-address]")?.closest(".profile-card");
        const hadAddressCard = Boolean(document.querySelector("[data-profile-address-card]"));
        const newCard = createAddressCard(data);
        addressCardSection?.appendChild(newCard);
        if (!hadAddressCard) updateDefaultAddress(newCard);
      }

      if (addressSubmitButton) {
        addressSubmitButton.textContent = "Saved";
        addressSubmitButton.disabled = true;
      }

      window.setTimeout(closeAddressDialog, 650);
    });
  }

  const paymentDialog = document.getElementById("profile-payment-dialog");
  const paymentForm = paymentDialog?.querySelector("[data-profile-payment-form]");
  const paymentList = document.querySelector("[data-profile-payment-list]");
  const paymentSubmitButton = paymentForm?.querySelector("[data-profile-payment-submit]");
  const paymentMessage = paymentForm?.querySelector("[data-profile-payment-message]");
  let activePaymentCard = null;

  if (paymentDialog && paymentForm && paymentList) {
    const paymentFields = {
      mode: paymentForm.elements.mode,
      type: paymentForm.elements.type,
      cardName: paymentForm.elements.cardName,
      cardNumber: paymentForm.elements.cardNumber,
      expiryMonth: paymentForm.elements.expiryMonth,
      expiryYear: paymentForm.elements.expiryYear,
      paypalEmail: paymentForm.elements.paypalEmail,
    };
    const cardFieldRows = Array.from(paymentForm.querySelectorAll("[data-profile-payment-card-field]"));
    const paypalFieldRows = Array.from(paymentForm.querySelectorAll("[data-profile-payment-paypal-field]"));

    const setPaymentMessage = (text = "", type = "error") => {
      if (!paymentMessage) return;
      paymentMessage.textContent = text;
      paymentMessage.classList.toggle("is-success", type === "success");
    };

    const setPaymentFieldValue = (field, value) => {
      if (field) field.value = value || "";
    };

    const getPaymentInfoNode = (card) =>
      Array.from(card.children).find(
        (child) => child.tagName === "DIV" && !child.classList.contains("profile-payment-actions")
      );

    const getPaymentBrand = (digits) => {
      if (/^4/.test(digits)) return "VISA";
      if (/^3[47]/.test(digits)) return "AMEX";
      if (/^(5[1-5]|2[2-7])/.test(digits)) return "MASTER";
      return "CARD";
    };

    const normalizePaymentDigits = (value) => String(value || "").replace(/\D/g, "");

    const formatPaymentCardNumber = (value) =>
      normalizePaymentDigits(value)
        .slice(0, 19)
        .replace(/(.{4})/g, "$1 ")
        .trim();

    const splitPaymentExpiry = (value) => {
      const [month = "", year = ""] = String(value || "").split("/");
      return {
        month: month.padStart(2, "0").slice(-2),
        year: year.slice(-2),
      };
    };

    const rebuildPaymentSelect = (select) => {
      const wrap = select?.closest(".realtrend-select-wrap");
      const api = wrap ? ordersSortSelectApis.get(wrap) : null;
      if (api) api.buildMenu();
    };

    const setPaymentSelectValue = (select, value) => {
      if (!select) return;
      const option = Array.from(select.options).find(
        (selectOption) => selectOption.value === value || selectOption.textContent.trim() === value
      );
      select.value = option ? option.value : select.options[0]?.value || "";
      rebuildPaymentSelect(select);
    };

    const renderPaymentTypeFields = () => {
      const isPaypal = paymentFields.type?.value === "paypal";
      cardFieldRows.forEach((row) => {
        row.hidden = isPaypal;
      });
      paypalFieldRows.forEach((row) => {
        row.hidden = !isPaypal;
      });
      setPaymentMessage();
    };

    const setPaymentCardContent = (card, data) => {
      card.dataset.paymentType = data.type;
      card.dataset.paymentLabel = data.label;
      card.dataset.paymentDetail = data.detail;
      card.dataset.paymentBrand = data.brand;
      card.dataset.paymentCardName = data.cardName || "";
      card.dataset.paymentCardNumber = data.cardNumber || "";
      card.dataset.paymentExpiry = data.expiry || "";
      card.dataset.paymentPaypalEmail = data.paypalEmail || "";

      const brand = card.querySelector(".profile-payment-brand");
      if (brand) {
        brand.className =
          data.type === "paypal"
            ? "profile-payment-brand profile-payment-brand--paypal"
            : "profile-payment-brand";
        brand.replaceChildren();
        if (data.type === "paypal") {
          const image = document.createElement("img");
          image.src = "../cart/img/paypal.png";
          image.alt = "";
          brand.appendChild(image);
        } else {
          brand.textContent = data.brand || "CARD";
        }
      }

      const info = getPaymentInfoNode(card);
      const title = info?.querySelector("strong");
      const detail = info?.querySelector("p");
      if (title) title.textContent = data.label;
      if (detail) detail.textContent = data.detail;
    };

    const updateDefaultPayment = (selectedCard) => {
      document.querySelectorAll("[data-profile-payment-card]").forEach((card) => {
        const isDefault = card === selectedCard;
        let mark = card.querySelector("mark");
        const button = card.querySelector("[data-profile-set-default-payment]");
        card.dataset.paymentDefault = isDefault ? "true" : "false";
        if (!mark) {
          mark = document.createElement("mark");
          mark.textContent = "Default";
          card.insertBefore(mark, card.querySelector(".profile-payment-actions"));
        }
        if (mark) {
          mark.textContent = "Default";
          mark.hidden = !isDefault;
        }
        if (button) {
          button.textContent = isDefault ? "Default" : "Set Default";
          button.disabled = isDefault;
        }
      });
    };

    const createPaymentCard = (data) => {
      const card = document.createElement("article");
      card.className = "profile-payment-card";
      card.dataset.profilePaymentCard = "";
      card.dataset.paymentDefault = "false";

      const brand = document.createElement("span");
      brand.className = "profile-payment-brand";
      brand.setAttribute("aria-hidden", "true");

      const info = document.createElement("div");
      info.appendChild(document.createElement("strong"));
      info.appendChild(document.createElement("p"));

      const mark = document.createElement("mark");
      mark.textContent = "Default";
      mark.hidden = true;

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.dataset.profileEditPayment = "";
      editButton.textContent = "Edit";

      const defaultButton = document.createElement("button");
      defaultButton.type = "button";
      defaultButton.dataset.profileSetDefaultPayment = "";
      defaultButton.textContent = "Set Default";

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.dataset.profileDeletePayment = "";
      deleteButton.textContent = "Delete";

      const actions = document.createElement("div");
      actions.className = "profile-payment-actions";
      actions.append(editButton, defaultButton, deleteButton);

      card.append(brand, info, mark, actions);
      setPaymentCardContent(card, data);
      return card;
    };

    const getPaymentFormData = () => {
      const type = paymentFields.type?.value || "card";
      const cardNumber = normalizePaymentDigits(paymentFields.cardNumber?.value);
      const cardName = paymentFields.cardName?.value.trim() || "";
      const expiryMonth = paymentFields.expiryMonth?.value || "";
      const expiryYear = paymentFields.expiryYear?.value || "";
      const expiry = expiryMonth && expiryYear ? `${expiryMonth}/${expiryYear}` : "";
      const paypalEmail = paymentFields.paypalEmail?.value.trim() || "";

      if (type === "paypal") {
        return {
          type,
          brand: "PayPal",
          label: "PayPal",
          detail: paypalEmail,
          paypalEmail,
        };
      }

      const brand = getPaymentBrand(cardNumber);
      const lastFour = cardNumber.slice(-4);
      return {
        type,
        brand,
        label: lastFour ? `${brand} ending in ${lastFour}` : brand,
        detail: expiry ? `Expires ${expiry}` : "",
        cardName,
        cardNumber,
        expiryMonth,
        expiryYear,
        expiry,
      };
    };

    const validatePaymentData = (data) => {
      if (data.type === "paypal") {
        if (!data.paypalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.paypalEmail)) {
          return "Enter a valid PayPal email.";
        }
        return "";
      }

      if (!data.cardName) return "Enter the cardholder name.";
      if (!data.cardNumber || data.cardNumber.length < 4) return "Enter a valid card number.";
      if (!data.expiry) return "Enter the card expiration date.";
      return "";
    };

    const fillPaymentForm = (card) => {
      const data = card?.dataset || {};
      const type = data.paymentType || "card";
      const expiry = splitPaymentExpiry(data.paymentExpiry || "");
      setPaymentFieldValue(paymentFields.mode, card ? "edit" : "add");
      setPaymentSelectValue(paymentFields.type, type);
      setPaymentFieldValue(paymentFields.cardName, data.paymentCardName || "");
      setPaymentFieldValue(paymentFields.cardNumber, formatPaymentCardNumber(data.paymentCardNumber || ""));
      setPaymentSelectValue(paymentFields.expiryMonth, expiry.month);
      setPaymentSelectValue(paymentFields.expiryYear, expiry.year);
      setPaymentFieldValue(paymentFields.paypalEmail, data.paymentPaypalEmail || data.paymentDetail || "");
      renderPaymentTypeFields();
      setPaymentMessage();
      if (paymentSubmitButton) {
        paymentSubmitButton.textContent = "Save";
        paymentSubmitButton.disabled = false;
      }
    };

    const closePaymentDialog = () => {
      paymentDialog.hidden = true;
      paymentDialog.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-profile-payment-open");
      activePaymentCard = null;
    };

    const openPaymentDialog = (card = null) => {
      activePaymentCard = card;
      fillPaymentForm(card);
      paymentDialog.hidden = false;
      paymentDialog.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-profile-payment-open");
      window.setTimeout(() => {
        paymentFields.type
          ?.closest(".realtrend-select-wrap")
          ?.querySelector(".realtrend-select-trigger")
          ?.focus();
      }, 0);
    };

    document.querySelectorAll("[data-profile-add-payment]").forEach((button) => {
      button.addEventListener("click", () => openPaymentDialog());
    });

    document.addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-profile-edit-payment]");
      if (editButton) {
        const card = editButton.closest("[data-profile-payment-card]");
        if (card) openPaymentDialog(card);
        return;
      }

      const defaultButton = event.target.closest("[data-profile-set-default-payment]");
      if (defaultButton) {
        const card = defaultButton.closest("[data-profile-payment-card]");
        if (card) updateDefaultPayment(card);
        return;
      }

      const deleteButton = event.target.closest("[data-profile-delete-payment]");
      if (!deleteButton) return;
      const card = deleteButton.closest("[data-profile-payment-card]");
      if (!card) return;
      const wasDefault = card.dataset.paymentDefault === "true";
      card.remove();
      if (wasDefault) {
        const nextCard = document.querySelector("[data-profile-payment-card]");
        if (nextCard) updateDefaultPayment(nextCard);
      }
    });

    paymentDialog.querySelectorAll("[data-profile-payment-close]").forEach((button) => {
      button.addEventListener("click", closePaymentDialog);
    });

    paymentFields.type?.addEventListener("change", renderPaymentTypeFields);

    paymentFields.cardNumber?.addEventListener("input", () => {
      const cursorAtEnd = paymentFields.cardNumber.selectionStart === paymentFields.cardNumber.value.length;
      paymentFields.cardNumber.value = formatPaymentCardNumber(paymentFields.cardNumber.value);
      if (cursorAtEnd) {
        const end = paymentFields.cardNumber.value.length;
        paymentFields.cardNumber.setSelectionRange(end, end);
      }
    });

    paymentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = getPaymentFormData();
      const error = validatePaymentData(data);

      if (error) {
        setPaymentMessage(error);
        return;
      }

      if (activePaymentCard) {
        setPaymentCardContent(activePaymentCard, data);
      } else {
        const hadPaymentCard = Boolean(paymentList.querySelector("[data-profile-payment-card]"));
        const newCard = createPaymentCard(data);
        paymentList.appendChild(newCard);
        if (!hadPaymentCard) updateDefaultPayment(newCard);
      }

      if (paymentSubmitButton) {
        paymentSubmitButton.textContent = "Saved";
        paymentSubmitButton.disabled = true;
      }
      setPaymentMessage("Payment method saved.", "success");
      window.setTimeout(closePaymentDialog, 650);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !paymentDialog.hidden) closePaymentDialog();
    });

    updateDefaultPayment(
      document.querySelector('[data-profile-payment-card][data-payment-default="true"]') ||
        document.querySelector("[data-profile-payment-card]")
    );
  }

  document.querySelectorAll("[data-profile-save]").forEach((button) => {
    button.addEventListener("click", () => {
      const originalText = button.textContent;
      button.textContent = "Saved";
      button.disabled = true;
      window.setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 1400);
    });
  });

  const profileBirthdayInput = document.querySelector("[data-profile-birthday]");

  if (profileBirthdayInput) {
    const parseDateValue = (value) => {
      const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!match) return null;
      const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      return Number.isNaN(date.getTime()) ? null : date;
    };

    const formatDateValue = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const sameDate = (a, b) =>
      a &&
      b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const calendar = document.createElement("div");
    calendar.className = "profile-birthday-dialog";
    calendar.hidden = true;
    calendar.setAttribute("aria-hidden", "true");
    calendar.innerHTML = `
      <button type="button" class="profile-birthday-backdrop" data-profile-birthday-close aria-label="Close birthday calendar"></button>
      <section class="profile-birthday-panel" role="dialog" aria-modal="true" aria-label="Choose birthday">
        <div class="profile-birthday-head">
          <button type="button" data-profile-birthday-prev aria-label="Previous month">&#8249;</button>
          <div class="profile-birthday-selects">
            <select data-profile-birthday-month aria-label="Select month"></select>
            <select data-profile-birthday-year aria-label="Select year"></select>
          </div>
          <button type="button" data-profile-birthday-next aria-label="Next month">&#8250;</button>
        </div>
        <div class="profile-birthday-weekdays" aria-hidden="true">
          <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>
        <div class="profile-birthday-days" role="grid" aria-label="Choose birthday"></div>
        <div class="profile-birthday-actions">
          <button type="button" data-profile-birthday-today>Today</button>
          <button type="button" data-profile-birthday-close>Done</button>
        </div>
      </section>
    `;
    document.body.appendChild(calendar);

    const monthSelect = calendar.querySelector("[data-profile-birthday-month]");
    const yearSelect = calendar.querySelector("[data-profile-birthday-year]");
    const days = calendar.querySelector(".profile-birthday-days");
    let selectedDate = parseDateValue(profileBirthdayInput.value) || new Date(2001, 4, 6);
    let viewYear = selectedDate.getFullYear();
    let viewMonth = selectedDate.getMonth();

    monthSelect?.replaceChildren(
      ...monthNames.map((month, index) => {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = month;
        return option;
      })
    );

    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let year = currentYear; year >= 1900; year -= 1) {
      const option = document.createElement("option");
      option.value = String(year);
      option.textContent = String(year);
      yearOptions.push(option);
    }
    yearSelect?.replaceChildren(...yearOptions);

    const positionCalendar = () => {};

    const renderBirthdayCalendar = () => {
      if (monthSelect) monthSelect.value = String(viewMonth);
      if (yearSelect) yearSelect.value = String(viewYear);
      days.innerHTML = "";

      const firstDay = new Date(viewYear, viewMonth, 1).getDay();
      const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
      const today = new Date();

      for (let index = 0; index < firstDay; index += 1) {
        days.appendChild(document.createElement("span"));
      }

      for (let day = 1; day <= totalDays; day += 1) {
        const date = new Date(viewYear, viewMonth, day);
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = String(day);
        button.dataset.profileBirthdayDay = formatDateValue(date);
        button.setAttribute("role", "gridcell");
        button.classList.toggle("is-today", sameDate(date, today));
        button.classList.toggle("is-selected", sameDate(date, selectedDate));
        days.appendChild(button);
      }

      positionCalendar();
    };

    const closeBirthdayCalendar = ({ restoreFocus = false } = {}) => {
      calendar.hidden = true;
      calendar.setAttribute("aria-hidden", "true");
      profileBirthdayInput.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-profile-birthday-open");
      if (restoreFocus) profileBirthdayInput.focus();
    };

    const openBirthdayCalendar = () => {
      selectedDate = parseDateValue(profileBirthdayInput.value) || selectedDate;
      viewYear = selectedDate.getFullYear();
      viewMonth = selectedDate.getMonth();
      calendar.hidden = false;
      calendar.setAttribute("aria-hidden", "false");
      profileBirthdayInput.setAttribute("aria-expanded", "true");
      document.body.classList.add("is-profile-birthday-open");
      renderBirthdayCalendar();
      window.setTimeout(() => {
        calendar.querySelector(".profile-birthday-days .is-selected")?.focus();
      }, 0);
    };

    profileBirthdayInput.addEventListener("click", openBirthdayCalendar);
    profileBirthdayInput.addEventListener("keydown", (event) => {
      if (["Enter", " ", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        openBirthdayCalendar();
      }
    });

    monthSelect?.addEventListener("change", () => {
      viewMonth = Number(monthSelect.value);
      renderBirthdayCalendar();
    });

    yearSelect?.addEventListener("change", () => {
      viewYear = Number(yearSelect.value);
      renderBirthdayCalendar();
    });

    calendar.addEventListener("click", (event) => {
      if (event.target.closest("[data-profile-birthday-close]")) {
        closeBirthdayCalendar({ restoreFocus: true });
        return;
      }

      if (event.target.closest("[data-profile-birthday-prev]")) {
        viewMonth -= 1;
        if (viewMonth < 0) {
          viewMonth = 11;
          viewYear -= 1;
        }
        renderBirthdayCalendar();
        return;
      }

      if (event.target.closest("[data-profile-birthday-next]")) {
        viewMonth += 1;
        if (viewMonth > 11) {
          viewMonth = 0;
          viewYear += 1;
        }
        renderBirthdayCalendar();
        return;
      }

      if (event.target.closest("[data-profile-birthday-today]")) {
        selectedDate = new Date();
        profileBirthdayInput.value = formatDateValue(selectedDate);
        closeBirthdayCalendar({ restoreFocus: true });
        return;
      }

      const dayButton = event.target.closest("[data-profile-birthday-day]");
      if (!dayButton) return;
      selectedDate = parseDateValue(dayButton.dataset.profileBirthdayDay) || selectedDate;
      profileBirthdayInput.value = formatDateValue(selectedDate);
      closeBirthdayCalendar({ restoreFocus: true });
    });

    document.addEventListener("pointerdown", (event) => {
      if (
        calendar.hidden ||
        event.target.closest(".profile-birthday-panel") ||
        event.target === profileBirthdayInput
      ) {
        return;
      }
      closeBirthdayCalendar();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !calendar.hidden) {
        closeBirthdayCalendar({ restoreFocus: true });
      }
    });

    window.addEventListener("resize", positionCalendar);
    window.addEventListener("scroll", positionCalendar, true);
  }
})();
