(() => {
  const enhanceBoardSelect = (nativeSelect) => {
    if (!nativeSelect || nativeSelect.dataset.helpSelectReady === "1") return;
    if (nativeSelect.closest(".realtrend-select-wrap")) {
      nativeSelect.dataset.helpSelectReady = "1";
      return;
    }

    nativeSelect.dataset.helpSelectReady = "1";
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
    trigger.setAttribute("aria-label", nativeSelect.getAttribute("aria-label") || "Category");
    const value = document.createElement("span");
    value.className = "realtrend-select-value";
    const menu = document.createElement("ul");
    menu.className = "realtrend-select-menu";
    menu.setAttribute("role", "listbox");

    const closeMenu = () => {
      wrap.classList.remove("is-open");
      menu.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    };

    const syncSelection = () => {
      const selectedOption = nativeSelect.options[nativeSelect.selectedIndex];
      value.textContent = selectedOption?.textContent || "- ALL -";
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
      item.addEventListener("click", () => {
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
      document.querySelectorAll(".help-topic-shell .realtrend-select-wrap.is-open").forEach((openWrap) => {
        if (openWrap === wrap) return;
        openWrap.classList.remove("is-open");
        openWrap.querySelector(".realtrend-select-menu")?.classList.remove("is-open");
        openWrap.querySelector(".realtrend-select-trigger")?.setAttribute("aria-expanded", "false");
      });
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
  };

  document
    .querySelectorAll(".help-topic-shell .bbs_top_wrap select, .help-topic-shell .help-board-filter select, .help-topic-shell .help-faq-filter select")
    .forEach(enhanceBoardSelect);

  const nav = document.querySelector(".help-topic-nav");
  const layout = document.querySelector(".help-topic-layout");
  if (!nav || !layout) return;

  const mq = window.matchMedia("(min-width: 1121px)");
  const TOP = 96;
  let placeholder = null;
  let pinned = false;
  let frame = 0;

  const getScrollParent = (node) => {
    let parent = node.parentElement;
    while (parent && parent !== document.documentElement) {
      const style = window.getComputedStyle(parent);
      const overflowY = style.overflowY;
      if (
        (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
        parent.scrollHeight > parent.clientHeight + 1
      ) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return window;
  };

  const scrollParent = getScrollParent(layout);

  const unpin = () => {
    if (!pinned) return;
    pinned = false;
    nav.classList.remove("is-pinned");
    nav.style.position = "";
    nav.style.top = "";
    nav.style.left = "";
    nav.style.width = "";
    nav.style.zIndex = "";
    if (placeholder) {
      placeholder.remove();
      placeholder = null;
    }
  };

  const ensurePlaceholder = () => {
    if (placeholder) return;
    placeholder = document.createElement("div");
    placeholder.className = "help-topic-nav-placeholder";
    placeholder.setAttribute("aria-hidden", "true");
    placeholder.style.width = `${nav.offsetWidth}px`;
    placeholder.style.height = `${nav.offsetHeight}px`;
    placeholder.style.flex = "0 0 auto";
    nav.parentNode.insertBefore(placeholder, nav);
  };

  const update = () => {
    frame = 0;
    if (!mq.matches) {
      unpin();
      return;
    }

    const layoutRect = layout.getBoundingClientRect();
    const navHeight = pinned && placeholder ? placeholder.offsetHeight : nav.offsetHeight;
    const navWidth = pinned && placeholder ? placeholder.offsetWidth : nav.offsetWidth;
    const start = layoutRect.top;
    const stop = layoutRect.bottom - navHeight;
    const pinTop = Math.min(TOP, Math.max(0, stop));

    if (start > TOP || stop <= 0) {
      unpin();
      return;
    }

    ensurePlaceholder();
    const left = placeholder.getBoundingClientRect().left;
    pinned = true;
    nav.classList.add("is-pinned");
    nav.style.position = "fixed";
    nav.style.top = `${pinTop}px`;
    nav.style.left = `${left}px`;
    nav.style.width = `${navWidth}px`;
    nav.style.zIndex = "40";
  };

  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(update);
  };

  const onMqChange = () => {
    unpin();
    schedule();
  };

  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onMqChange);
  } else if (typeof mq.addListener === "function") {
    mq.addListener(onMqChange);
  }

  window.addEventListener("resize", schedule, { passive: true });
  if (scrollParent === window) {
    window.addEventListener("scroll", schedule, { passive: true });
  } else {
    scrollParent.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
  }

  schedule();
})();
