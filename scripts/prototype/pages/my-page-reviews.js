(() => {
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
  
})();
