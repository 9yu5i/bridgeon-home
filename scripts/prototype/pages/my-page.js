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

  const membershipTierRail = document.querySelector(".membership-tier-grid");

  if (membershipTierRail) {
    const currentTier = membershipTierRail.querySelector(".membership-tier.is-current");
    const mobileTierMedia = window.matchMedia("(max-width: 760px)");

    const showCurrentTierFirst = () => {
      if (!currentTier || !mobileTierMedia.matches) return;

      window.requestAnimationFrame(() => {
        const railBox = membershipTierRail.getBoundingClientRect();
        const tierBox = currentTier.getBoundingClientRect();
        const railStyles = window.getComputedStyle(membershipTierRail);
        const railPadding = parseFloat(railStyles.paddingLeft) || 0;
        const nextLeft = tierBox.left - railBox.left + membershipTierRail.scrollLeft - railPadding;

        membershipTierRail.scrollTo({
          left: Math.max(0, nextLeft),
          behavior: "auto",
        });
      });
    };

    showCurrentTierFirst();
    window.addEventListener("load", showCurrentTierFirst, { once: true });

    if (typeof mobileTierMedia.addEventListener === "function") {
      mobileTierMedia.addEventListener("change", showCurrentTierFirst);
    } else if (typeof mobileTierMedia.addListener === "function") {
      mobileTierMedia.addListener(showCurrentTierFirst);
    }
  }

  const logoutLinks = Array.from(
    document.querySelectorAll(
      ".mypage-side-card a, .mypage-mobile-menu a, .mypage-mobile-logout a"
    )
  ).filter((link) => link.querySelector(".mypage-side-icon--logout"));

  if (logoutLinks.length) {
    let logoutDialog = document.getElementById("mypage-logout-dialog");

    if (!logoutDialog) {
      logoutDialog = document.createElement("div");
      logoutDialog.className = "mypage-logout-dialog";
      logoutDialog.id = "mypage-logout-dialog";
      logoutDialog.hidden = true;
      logoutDialog.setAttribute("aria-hidden", "true");
      logoutDialog.innerHTML = `
        <button type="button" class="mypage-logout-backdrop" data-mypage-logout-close aria-label="Close logout dialog"></button>
        <section class="mypage-logout-modal" role="dialog" aria-modal="true" aria-labelledby="mypage-logout-title">
          <button type="button" class="mypage-logout-close" data-mypage-logout-close aria-label="Close logout dialog">&times;</button>
          <span class="mypage-logout-icon" aria-hidden="true"></span>
          <h2 id="mypage-logout-title">Log out?</h2>
          <p>Are you sure you want to log out? You'll need to sign in again to access your account.</p>
          <div class="mypage-logout-actions">
            <button type="button" class="mypage-logout-cancel" data-mypage-logout-close>Cancel</button>
            <button type="button" class="mypage-logout-confirm" data-mypage-logout-confirm>Log Out</button>
          </div>
        </section>
      `;
      document.body.appendChild(logoutDialog);
    }

    let logoutTrigger = null;

    const closeLogoutDialog = () => {
      logoutDialog.hidden = true;
      logoutDialog.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-mypage-logout-open");
      if (logoutTrigger && typeof logoutTrigger.focus === "function") {
        logoutTrigger.focus();
      }
      logoutTrigger = null;
    };

    const openLogoutDialog = (trigger) => {
      logoutTrigger = trigger;
      logoutDialog.hidden = false;
      logoutDialog.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-mypage-logout-open");
      logoutDialog.querySelector("[data-mypage-logout-confirm]")?.focus();
    };

    const goToHome = () => {
      const homeHref = new URL("../index.html", window.location.href).href;
      if (window.TrendyPicker?.navigateWithPageTransition) {
        window.TrendyPicker.navigateWithPageTransition(homeHref);
        return;
      }
      window.location.href = homeHref;
    };

    logoutLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        openLogoutDialog(link);
      });
    });

    logoutDialog.querySelectorAll("[data-mypage-logout-close]").forEach((button) => {
      button.addEventListener("click", closeLogoutDialog);
    });

    logoutDialog.querySelector("[data-mypage-logout-confirm]")?.addEventListener("click", () => {
      closeLogoutDialog();
      goToHome();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !logoutDialog.hidden) {
        closeLogoutDialog();
      }
    });
  }

  const dialog = document.getElementById("mypage-avatar-dialog");

  if (dialog) {
    const avatarPhoto = document.querySelector(".mypage-avatar-photo");
    const previewPhoto = document.querySelector(".mypage-avatar-preview-photo");
    const fileInput = dialog.querySelector("[data-mypage-avatar-input]");
    const removeButton = dialog.querySelector("[data-mypage-avatar-remove]");
    const openButtons = document.querySelectorAll(
      ".mypage-edit-fab, .mypage-edit-desktop"
    );

    const storageKey = "trendypicker-mypage-avatar";
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

  const pageSortSelectRoot =
    ".orders-select-row .realtrend-select-wrap, .reviews-select-row .realtrend-select-wrap, .profile-field .realtrend-select-wrap, .help-board-filter .realtrend-select-wrap, .help-faq-filter .realtrend-select-wrap, .help-topic-form .realtrend-select-wrap";

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
        wrap.closest(".profile-field, .help-board-filter, .help-faq-filter, .help-topic-form") ||
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
  window.TrendyPicker = window.TrendyPicker || {};
  window.TrendyPicker.myPage = window.TrendyPicker.myPage || {};
  window.TrendyPicker.myPage.selectApis = ordersSortSelectApis;

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
    if (!buttons.length) return;

    const applyFilter = (filter) => {
      const activeFilter = filter || "all";
      const items = Array.from(content.querySelectorAll("[data-account-category]"));

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

  window.TrendyPicker?.savedPosts?.syncPage?.();

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

})();
