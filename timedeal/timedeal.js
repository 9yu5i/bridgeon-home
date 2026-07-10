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

  const initCountdown = () => {
    const hoursEl = document.querySelector("[data-timedeal-hours]");
    const minutesEl = document.querySelector("[data-timedeal-minutes]");
    const secondsEl = document.querySelector("[data-timedeal-seconds]");
    if (!hoursEl || !minutesEl || !secondsEl) return;

    const endAt = Date.now() + (6 * 60 * 60 + 42 * 60 + 18) * 1000;

    const tick = () => {
      const remainingMs = Math.max(0, endAt - Date.now());
      const totalSeconds = Math.floor(remainingMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      hoursEl.textContent = padTime(hours);
      minutesEl.textContent = padTime(minutes);
      secondsEl.textContent = padTime(seconds);
    };

    tick();
    window.setInterval(tick, 1000);
  };

  const initTabGroup = (selector, activeClass = "is-active", onActivate) => {
    document.querySelectorAll(selector).forEach((group) => {
      group.addEventListener("click", (event) => {
        const button = event.target.closest("button[role='tab']");
        if (!button || !group.contains(button)) return;

        group.querySelectorAll("button[role='tab']").forEach((tab) => {
          const isActive = tab === button;
          tab.classList.toggle(activeClass, isActive);
          tab.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        onActivate?.(button, group);
      });
    });
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

    const setActiveTab = (tab) => {
      tabs.forEach((item) => {
        const isActive = item === tab;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-selected", isActive ? "true" : "false");
      });
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

      pinnedTab = tab;
      setActiveTab(tab);
      scrollScheduleTabIntoView(tab);
    });
  };

  initCountdown();
  initScheduleTabs();
  initTabGroup(".timedeal-categories");

  const activeScheduleTab = document.querySelector(".timedeal-schedule-tab.is-active");
  if (activeScheduleTab && window.matchMedia("(max-width: 760px)").matches) {
    scrollScheduleTabIntoView(activeScheduleTab);
  }
})();
