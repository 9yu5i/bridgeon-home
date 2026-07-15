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
