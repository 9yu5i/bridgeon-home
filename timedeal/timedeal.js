(() => {
  const syncCardWish = (card, isActive) => {
    card.querySelectorAll(".listing-card-wish, .listing-card-wish-inline").forEach((button) => {
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      button.setAttribute("aria-label", isActive ? "Remove from wishlist" : "Add to wishlist");
    });
  };

  document.querySelectorAll(".listing-card").forEach((card) => {
    card.querySelectorAll(".listing-card-wish, .listing-card-wish-inline").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const isActive = !button.classList.contains("is-active");
        syncCardWish(card, isActive);
      });
    });
  });

  const initListingSortSelect = (wrap) => {
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
      const minWidth = 132;

      wrap.style.width = `${Math.max(minWidth, Math.ceil(maxTextWidth + horizontalBox))}px`;
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
      document.querySelectorAll(".listing-sort .realtrend-select-wrap.is-open").forEach((otherWrap) => {
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

    return { closeMenu };
  };

  const listingSortSelectApis = new Map();
  document.querySelectorAll(".listing-sort .realtrend-select-wrap").forEach((wrap) => {
    const api = initListingSortSelect(wrap);
    if (api) listingSortSelectApis.set(wrap, api);
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".listing-sort .realtrend-select-wrap")) return;
    listingSortSelectApis.forEach((api) => api.closeMenu());
  });

  const padTime = (value) => String(Math.max(0, value)).padStart(2, "0");

  const scheduleMeta = {
    now: {
      label: "Deal Ends In",
      durationMs: (6 * 60 * 60 + 42 * 60 + 18) * 1000,
    },
    "upcoming-1": {
      label: "Next Deal Starts In",
      durationMs: (2 * 60 * 60 + 15 * 60 + 40) * 1000,
    },
    "upcoming-2": {
      label: "Next Deal Starts In",
      durationMs: (8 * 60 * 60 + 5 * 60 + 12) * 1000,
    },
    tomorrow: {
      label: "Opens Tomorrow In",
      durationMs: (18 * 60 * 60 + 22 * 60 + 8) * 1000,
    },
  };

  const scheduleSets = {
    now: [0, 1, 2, 3, 4, 5, 6, 7],
    "upcoming-1": [4, 5, 6, 7, 8, 9, 10, 11],
    "upcoming-2": [2, 3, 8, 9, 10, 11, 12, 13],
    tomorrow: [0, 1, 12, 13, 14, 15],
  };

  const categoryCycle = ["beauty", "beauty", "k-food", "lifestyle", "k-pop", "k-traditional", "beauty", "beauty"];

  const cards = [...document.querySelectorAll(".listing-results .listing-grid > .listing-card")];
  const countdownLabel = document.querySelector(".timedeal-countdown-label");
  const hoursEl = document.querySelector("[data-timedeal-hours]");
  const minutesEl = document.querySelector("[data-timedeal-minutes]");
  const secondsEl = document.querySelector("[data-timedeal-seconds]");
  const countDesktop = document.querySelector(".timedeal-toolbar .listing-count strong");
  const countMobile = document.querySelector(".timedeal-toolbar .listing-count .mobile-only");

  cards.forEach((card, index) => {
    card.dataset.timedealIndex = String(index);
    card.dataset.timedealCategory = categoryCycle[index % categoryCycle.length];
  });

  let activeSchedule = "now";
  let activeCategory = "all";
  let countdownEndAt = Date.now() + scheduleMeta.now.durationMs;
  let countdownTimerId = 0;

  const updateCountdownDisplay = () => {
    if (!hoursEl || !minutesEl || !secondsEl) return;
    const remainingMs = Math.max(0, countdownEndAt - Date.now());
    const totalSeconds = Math.floor(remainingMs / 1000);
    hoursEl.textContent = padTime(Math.floor(totalSeconds / 3600));
    minutesEl.textContent = padTime(Math.floor((totalSeconds % 3600) / 60));
    secondsEl.textContent = padTime(totalSeconds % 60);
  };

  const setCountdownForSchedule = (scheduleKey) => {
    const meta = scheduleMeta[scheduleKey] || scheduleMeta.now;
    if (countdownLabel) countdownLabel.textContent = meta.label;
    countdownEndAt = Date.now() + meta.durationMs;
    updateCountdownDisplay();
  };

  const updateProductCount = (visibleCount) => {
    const label = visibleCount.toLocaleString("en-US");
    if (countDesktop) countDesktop.textContent = `(${label})`;
    if (countMobile) countMobile.textContent = `All Products (${label} Items)`;
  };

  const renderDealCards = () => {
    const indexes = new Set(scheduleSets[activeSchedule] || scheduleSets.now);
    let visibleCount = 0;

    cards.forEach((card, index) => {
      const matchesSchedule = indexes.has(index);
      const matchesCategory =
        activeCategory === "all" || card.dataset.timedealCategory === activeCategory;
      const isVisible = matchesSchedule && matchesCategory;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    updateProductCount(visibleCount);
  };

  const initCountdown = () => {
    if (!hoursEl || !minutesEl || !secondsEl) return;
    setCountdownForSchedule(activeSchedule);
    window.clearInterval(countdownTimerId);
    countdownTimerId = window.setInterval(updateCountdownDisplay, 1000);
  };

  const scrollScheduleTabIntoView = (tab) => {
    if (!window.matchMedia("(max-width: 760px)").matches) return;
    const schedule = tab.closest(".timedeal-schedule");
    if (!schedule) return;

    const tabs = [...schedule.querySelectorAll(".timedeal-schedule-tab[role='tab']")];
    const tabIndex = tabs.indexOf(tab);
    const maxScrollLeft = Math.max(0, schedule.scrollWidth - schedule.clientWidth);
    let targetLeft = tab.offsetLeft - (schedule.clientWidth - tab.offsetWidth) / 2;

    if (tabIndex <= 0) targetLeft = 0;
    if (tabIndex === tabs.length - 1) targetLeft = maxScrollLeft;

    schedule.scrollTo({
      left: Math.max(0, Math.min(maxScrollLeft, targetLeft)),
      behavior: "smooth",
    });
  };

  const initScheduleTabs = () => {
    const schedule = document.querySelector(".timedeal-schedule");
    if (!schedule) return;

    const tabs = [...schedule.querySelectorAll(".timedeal-schedule-tab[role='tab']")];
    if (!tabs.length) return;

    let pinnedTab = tabs.find((tab) => tab.classList.contains("is-active")) || tabs[0];
    let isPointerInside = false;
    const hoverFollowQuery = window.matchMedia("(min-width: 761px) and (pointer: fine)");

    const setActiveTab = (tab, { commit = false } = {}) => {
      tabs.forEach((item) => {
        const isActive = item === tab;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      if (!commit) return;

      pinnedTab = tab;
      activeSchedule = tab.dataset.timedealSchedule || "now";
      setCountdownForSchedule(activeSchedule);
      renderDealCards();
      scrollScheduleTabIntoView(tab);
    };

    const tabFromPointer = (clientX) => {
      const hitTab = tabs.find((tab) => {
        const rect = tab.getBoundingClientRect();
        return clientX >= rect.left && clientX <= rect.right;
      });
      if (hitTab) return hitTab;

      const scheduleRect = schedule.getBoundingClientRect();
      const padding = 6;
      const innerWidth = schedule.clientWidth - padding * 2;
      const innerLeft = scheduleRect.left + padding;
      const ratio = Math.max(0, Math.min(1, (clientX - innerLeft) / Math.max(1, innerWidth)));
      const index = Math.min(
        tabs.length - 1,
        Math.max(0, Math.round(ratio * (tabs.length - 1))),
      );
      return tabs[index];
    };

    schedule.addEventListener("pointerenter", () => {
      isPointerInside = true;
      pinnedTab = tabs.find((tab) => tab.classList.contains("is-active")) || pinnedTab;
    });

    schedule.addEventListener("pointermove", (event) => {
      if (!isPointerInside || !hoverFollowQuery.matches) return;
      const tab = tabFromPointer(event.clientX);
      if (tab) setActiveTab(tab);
    });

    schedule.addEventListener("pointerleave", () => {
      isPointerInside = false;
      if (hoverFollowQuery.matches) setActiveTab(pinnedTab);
    });

    schedule.addEventListener("click", (event) => {
      const tab = event.target.closest(".timedeal-schedule-tab[role='tab']");
      if (!tab || !schedule.contains(tab)) return;
      setActiveTab(tab, { commit: true });
    });

    activeSchedule = pinnedTab.dataset.timedealSchedule || "now";
    setActiveTab(pinnedTab, { commit: true });
  };

  const initCategoryTabs = () => {
    const group = document.querySelector(".timedeal-categories");
    if (!group) return;

    group.addEventListener("click", (event) => {
      const button = event.target.closest("button[role='tab']");
      if (!button || !group.contains(button)) return;

      group.querySelectorAll("button[role='tab']").forEach((tab) => {
        const isActive = tab === button;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      activeCategory = button.dataset.timedealCategory || "all";
      renderDealCards();
    });
  };

  initCountdown();
  initCategoryTabs();
  initScheduleTabs();

  const activeScheduleTab = document.querySelector(".timedeal-schedule-tab.is-active");
  if (activeScheduleTab && window.matchMedia("(max-width: 760px)").matches) {
    scrollScheduleTabIntoView(activeScheduleTab);
  }
})();
