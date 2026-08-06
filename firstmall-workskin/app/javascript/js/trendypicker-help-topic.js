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
        const hiddenCategory = document.getElementById("category");
        if (hiddenCategory && nativeSelect.name === "category") {
          hiddenCategory.value = option.value;
        }
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
    .querySelectorAll(
      ".help-topic-shell .bbs_top_wrap select, .help-topic-shell .help-board-filter select, .help-topic-shell .help-faq-filter select"
    )
    .forEach(enhanceBoardSelect);

  document.querySelectorAll(".help-board-view-meta .cat").forEach((el) => {
    const text = (el.textContent || "").trim();
    if (!text || text === "Array" || text.includes("is_array") || text.includes("preg_replace")) {
      el.textContent = "";
    }
  });

  document.querySelectorAll(".help-board-article-body p, .board_detail_contents p").forEach((p) => {
    if (p.querySelector("img, video, iframe, table")) return;
    const text = (p.textContent || "").replace(/\u00a0/g, " ").trim();
    const onlyBreak = p.childElementCount === 1 && p.firstElementChild?.tagName === "BR";
    if (!text || onlyBreak) {
      p.remove();
    }
  });

  function isHeavyWeightEl(el) {
    if (!el) return false;
    const tag = el.tagName;
    const text = (el.textContent || "").replace(/\u00a0/g, " ").trim();
    if ((tag === "B" || tag === "STRONG") && text) return true;
    const style = el.getAttribute("style") || "";
    return /font-weight\s*:\s*(bold|[6-9]00|1?000)\b/i.test(style) && !!text;
  }

  document.querySelectorAll(".help-board-article-body p, .board_detail_contents p").forEach((p) => {
    if (p.querySelector("img, video, iframe, table, a")) return;
    const text = (p.textContent || "").replace(/\u00a0/g, " ").trim();
    if (!text || text.length >= 80) return;
    const heavies = [...p.querySelectorAll("b, strong, span, font")].filter(isHeavyWeightEl);
    if (!heavies.length) return;
    const heavyText = heavies
      .map((el) => (el.textContent || "").replace(/\u00a0/g, " ").trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)[0];
    if (heavyText === text || heavyText.length >= text.length * 0.9) {
      p.classList.add("help-article-heading");
    }
  });

  document.querySelectorAll(".help-board-article-body p.help-article-heading, .board_detail_contents p.help-article-heading").forEach((p) => {
    const prev = p.previousElementSibling;
    if (
      prev &&
      (prev.classList.contains("help-article-heading") ||
        prev.classList.contains("help-article-subheading"))
    ) {
      p.classList.remove("help-article-heading");
      p.classList.add("help-article-subheading");
    }
  });

  document.querySelectorAll(".faq_new .question .subject .cat, .faq_new .help-faq-question .cat").forEach((cat) => {
    cat.remove();
  });

  /* Topics nav uses CSS position:sticky. Avoid JS fixed pinning — it fights
     scroll at the bottom of long notice/FAQ articles and causes jump/errors. */
  document.querySelectorAll(".help-topic-nav.is-pinned").forEach((nav) => {
    nav.classList.remove("is-pinned");
    nav.style.position = "";
    nav.style.top = "";
    nav.style.left = "";
    nav.style.width = "";
    nav.style.zIndex = "";
  });
  document.querySelectorAll(".help-topic-nav-placeholder").forEach((node) => node.remove());
})();
