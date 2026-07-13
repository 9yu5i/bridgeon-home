(() => {
  const page = document.body;
  const filters = document.getElementById("listing-filters");
  const filterOpen = document.querySelector("[data-listing-filter-open]");
  const filterCloseTargets = document.querySelectorAll("[data-listing-filter-close]");
  const clearButtons = document.querySelectorAll("[data-listing-clear-filters]");
  const chipsContainer = document.querySelector(".listing-chips");
  const filterCheckboxes = document.querySelectorAll(".listing-filters input[type='checkbox']");

  const getChipLabel = (input) => {
    if (input.dataset.chipLabel) return input.dataset.chipLabel;
    return input.closest("label")?.textContent.trim() || "";
  };

  const buildChip = (input) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "listing-chip";
    chip.role = "listitem";
    chip.dataset.filterInputId = input.id;
    chip.append(`${getChipLabel(input)} `);

    const close = document.createElement("span");
    close.setAttribute("aria-hidden", "true");
    close.textContent = "×";
    chip.append(close);

    chip.addEventListener("click", () => {
      input.checked = false;
      renderFilterChips();
    });
    return chip;
  };

  const ensureFilterInputId = (input, index) => {
    if (!input.id) input.id = `listing-filter-input-${index}`;
    return input.id;
  };

  const renderFilterChips = () => {
    if (!chipsContainer) return;
    chipsContainer.replaceChildren();
    filterCheckboxes.forEach((input, index) => {
      ensureFilterInputId(input, index);
      if (!input.checked) return;
      chipsContainer.appendChild(buildChip(input));
    });
  };

  filterCheckboxes.forEach((input, index) => {
    ensureFilterInputId(input, index);
    input.addEventListener("change", renderFilterChips);
  });

  renderFilterChips();

  const setFilterOpen = (isOpen) => {
    page.classList.toggle("is-filter-open", isOpen);
    filterOpen?.setAttribute("aria-expanded", isOpen ? "true" : "false");
    filterCloseTargets.forEach((node) => {
      if (isOpen) {
        node.removeAttribute("hidden");
      } else {
        node.hidden = true;
      }
    });
  };

  filterOpen?.addEventListener("click", () => setFilterOpen(true));

  filterCloseTargets.forEach((node) => {
    node.addEventListener("click", () => setFilterOpen(false));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && page.classList.contains("is-filter-open")) {
      setFilterOpen(false);
    }
  });

  clearButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterCheckboxes.forEach((input) => {
        input.checked = false;
      });
      renderFilterChips();
    });
  });

  document.querySelectorAll(".listing-filter-group").forEach((group) => {
    const list = group.querySelector(".listing-filter-list");
    const moreButton = group.querySelector(".listing-filter-more");
    if (!list || !moreButton) return;

    const itemCount = list.querySelectorAll(":scope > li").length;
    if (itemCount <= 4) {
      moreButton.hidden = true;
      return;
    }

    const lessButton = document.createElement("button");
    lessButton.type = "button";
    lessButton.className = "listing-filter-less";
    lessButton.textContent = "Show less";
    lessButton.hidden = true;
    moreButton.insertAdjacentElement("afterend", lessButton);

    const expandList = () => {
      list.classList.remove("is-collapsed");
      list.classList.add("is-expanded");
      moreButton.hidden = true;
      lessButton.hidden = false;
      moreButton.setAttribute("aria-expanded", "true");
    };

    const collapseList = () => {
      list.classList.add("is-collapsed");
      list.classList.remove("is-expanded");
      moreButton.hidden = false;
      lessButton.hidden = true;
      moreButton.setAttribute("aria-expanded", "false");
    };

    list.classList.add("is-collapsed");
    moreButton.setAttribute("aria-expanded", "false");

    moreButton.addEventListener("click", expandList);
    lessButton.addEventListener("click", collapseList);
  });

  document.querySelectorAll(".listing-price-range").forEach((range) => {
    const minInput = range.querySelector(".listing-price-range-input--min");
    const maxInput = range.querySelector(".listing-price-range-input--max");
    const fill = range.querySelector(".listing-price-range-fill");
    const minValue = range.querySelector(".listing-price-range-value--min");
    const maxValue = range.querySelector(".listing-price-range-value--max");
    if (!minInput || !maxInput || !fill || !minValue || !maxValue) return;

    const priceMax = Number(range.dataset.priceMax || maxInput.max || 200);

    const formatPrice = (value) => {
      const amount = Number(value);
      if (amount >= priceMax) return `US$${priceMax}+`;
      return `US$${amount}`;
    };

    const getPercent = (value) => (Number(value) / priceMax) * 100;

    const updateRange = (activeInput) => {
      let min = Number(minInput.value);
      let max = Number(maxInput.value);

      if (min > max) {
        if (activeInput === minInput) {
          max = min;
          maxInput.value = String(min);
        } else {
          min = max;
          minInput.value = String(max);
        }
      }

      const minPercent = getPercent(min);
      const maxPercent = getPercent(max);

      fill.style.left = `${minPercent}%`;
      fill.style.width = `${maxPercent - minPercent}%`;
      minValue.style.left = `${minPercent}%`;
      maxValue.style.left = `${maxPercent}%`;
      minValue.textContent = formatPrice(min);
      maxValue.textContent = formatPrice(max);

      minInput.style.zIndex = activeInput === minInput ? "5" : "4";
      maxInput.style.zIndex = activeInput === maxInput ? "5" : "4";
    };

    minInput.addEventListener("input", () => updateRange(minInput));
    maxInput.addEventListener("input", () => updateRange(maxInput));
    updateRange(maxInput);
  });

  const syncCardWish = (card, isActive) => {
    card.querySelectorAll(".listing-card-wish, .listing-card-wish-inline").forEach((button) => {
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      button.setAttribute("aria-label", isActive ? "Remove from wishlist" : "Add to wishlist");
    });
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".listing-card-wish, .listing-card-wish-inline");
    if (!button) return;

    const card = button.closest(".listing-card");
    if (!card) return;

    event.preventDefault();
    event.stopPropagation();
    const isActive = !button.classList.contains("is-active");
    syncCardWish(card, isActive);
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
})();
