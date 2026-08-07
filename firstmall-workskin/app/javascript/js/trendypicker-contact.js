(() => {
  const nativeSelect = document.querySelector(".help-topic-shell .help-topic-form select[name='contact_reason']");
  if (!nativeSelect) return;

  const existingWrap = nativeSelect.closest(".realtrend-select-wrap");
  if (existingWrap) {
    existingWrap.querySelector(".realtrend-select-menu")?.addEventListener(
      "click",
      (event) => {
        if (!event.target.closest("li")) return;
        existingWrap.classList.remove("is-open");
        const existingMenu = existingWrap.querySelector(".realtrend-select-menu");
        existingMenu?.classList.remove("is-open");
        existingMenu?.style.setProperty("display", "none", "important");
        existingWrap.querySelector(".realtrend-select-trigger")?.setAttribute("aria-expanded", "false");
      },
      true
    );
    return;
  }

  nativeSelect.classList.add("realtrend-select-native");
  nativeSelect.tabIndex = -1;
  nativeSelect.setAttribute("aria-hidden", "true");

  const wrap = document.createElement("span");
  wrap.className = "realtrend-select-wrap help-board-select";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "realtrend-select-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-label", "Reason");

  const value = document.createElement("span");
  value.className = "realtrend-select-value";

  const menu = document.createElement("ul");
  menu.className = "realtrend-select-menu";
  menu.setAttribute("role", "listbox");

  const closeMenu = () => {
    wrap.classList.remove("is-open");
    menu.classList.remove("is-open");
    menu.style.setProperty("display", "none", "important");
    trigger.setAttribute("aria-expanded", "false");
  };

  const syncSelection = () => {
    const selectedOption = nativeSelect.options[nativeSelect.selectedIndex];
    value.textContent = selectedOption?.textContent || "Order support";
    menu.querySelectorAll("li").forEach((item) => {
      const isSelected = item.dataset.value === nativeSelect.value;
      item.classList.toggle("is-selected", isSelected);
      item.setAttribute("aria-selected", String(isSelected));
    });
  };

  Array.from(nativeSelect.options).forEach((option) => {
    const item = document.createElement("li");
    item.textContent = option.textContent;
    item.dataset.value = option.value;
    item.setAttribute("role", "option");
    item.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      nativeSelect.value = option.value;
      nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
      syncSelection();
      closeMenu();
      trigger.focus();
    });
    menu.append(item);
  });

  trigger.append(value);
  wrap.append(trigger, menu);
  nativeSelect.parentNode.insertBefore(wrap, nativeSelect);
  wrap.append(nativeSelect);

  trigger.addEventListener("click", () => {
    const willOpen = !wrap.classList.contains("is-open");
    if (willOpen) {
      menu.style.removeProperty("display");
    } else {
      menu.style.setProperty("display", "none", "important");
    }
    wrap.classList.toggle("is-open", willOpen);
    menu.classList.toggle("is-open", willOpen);
    trigger.setAttribute("aria-expanded", String(willOpen));
  });

  document.addEventListener("pointerdown", (event) => {
    if (!wrap.contains(event.target)) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && wrap.classList.contains("is-open")) {
      closeMenu();
      trigger.focus();
    }
  });

  syncSelection();
})();
