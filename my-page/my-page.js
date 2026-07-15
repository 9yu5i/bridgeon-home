(() => {
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

  if (orderFilterTabs && orderCards.length) {
    const statusKey = (value) => {
      const text = String(value || "")
        .trim()
        .toLowerCase();
      if (!text) return "";
      if (text.includes("cancel") || text.includes("refund")) return "cancel";
      if (text.includes("deliver")) return "delivered";
      if (text.includes("ship")) return "shipped";
      if (text.includes("process") || text.includes("prepar")) return "processing";
      if (text.includes("pend")) return "pending";
      return text;
    };

    const applyOrderFilter = (filter) => {
      orderCards.forEach((card) => {
        const mark = card.querySelector(".orders-card-head mark");
        const cardStatus = statusKey(mark?.textContent);
        const show = filter === "all" || cardStatus === filter;
        card.hidden = !show;
      });
    };

    orderFilterTabs.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-orders-filter]");
      if (!button || !orderFilterTabs.contains(button)) return;

      orderFilterTabs.querySelectorAll("button[data-orders-filter]").forEach((tab) => {
        tab.classList.toggle("is-active", tab === button);
      });

      applyOrderFilter(button.getAttribute("data-orders-filter") || "all");
    });
  }
})();
