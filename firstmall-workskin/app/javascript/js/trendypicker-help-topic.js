/**
 * TrendyPicker Help Topic / Board
 * Guide, FAQ, Notice, Q&A, policies, company/contact
 *
 * 1. Custom selects (board filter, QnA write, contact form)
 * 2. FAQ category alias + list label restore
 * 3. Notice/FAQ article heading cleanup
 * 4. FAQ accordion (neutralize Firstmall call_faq_view)
 */
(() => {
  if (!document.querySelector(".help-topic-shell")) return;

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
      menu.style.setProperty("display", "none", "important");
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
  };

  document.addEventListener(
    "click",
    (event) => {
      const option = event.target.closest(".help-topic-shell .realtrend-select-menu li");
      if (!option) return;
      const wrap = option.closest(".realtrend-select-wrap");
      wrap?.classList.remove("is-open");
      const menu = wrap?.querySelector(".realtrend-select-menu");
      menu?.classList.remove("is-open");
      menu?.style.setProperty("display", "none", "important");
      wrap?.querySelector(".realtrend-select-trigger")?.setAttribute("aria-expanded", "false");
    },
    true
  );

  /* FAQ posts were saved under a shorter category key than the current master
     label, so the filter option value must submit the stored key while the UI
     keeps showing the full name. */
  const categoryFilterAliases = {
    "Cancellation & Exchange/Refund": "Cancellation & Exchange/Re",
  };

  const categoryParams = new URLSearchParams(window.location.search);
  const selectedCategory = categoryParams.get("category");
  if (selectedCategory && categoryFilterAliases[selectedCategory]) {
    categoryParams.set("category", categoryFilterAliases[selectedCategory]);
    window.location.replace(
      `${window.location.pathname}?${categoryParams.toString()}${window.location.hash}`
    );
    return;
  }

  document.querySelectorAll(".help-topic-shell #searchcategory option").forEach((option) => {
    const value = (option.value || "").trim();
    const alias = categoryFilterAliases[value];
    if (!alias) return;
    option.value = alias;
    if (!(option.textContent || "").trim()) {
      option.textContent = value;
    }
  });

  /* List rows still show the shorter stored key, so restore the full label from
     the filter option text when the short text is an exact prefix. */
  const fullCategoryLabels = Array.from(
    document.querySelectorAll(".help-topic-shell #searchcategory option")
  )
    .map((option) => (option.textContent || "").trim())
    .filter((label) => label && !label.startsWith("-") && !/^All /i.test(label));

  if (fullCategoryLabels.length) {
    document
      .querySelectorAll(
        ".help-topic-shell .help-faq-category, .help-topic-shell .help-board-row > li.cat span.cat, .help-topic-shell .res_table .tbody > li.cat span.cat"
      )
      .forEach((el) => {
        const text = (el.textContent || "").replace(/\s+/g, " ").trim();
        if (!text) return;
        const matches = fullCategoryLabels.filter(
          (label) => label.length > text.length && label.startsWith(text)
        );
        if (matches.length === 1) {
          el.textContent = matches[0];
        }
      });
  }

  document
    .querySelectorAll(
      ".help-topic-shell .bbs_top_wrap select, .help-topic-shell .help-board-filter select, .help-topic-shell .help-faq-filter select, .help-topic-shell .bo-qna-write-table select, .help-topic-shell .help-topic-form select"
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

  /* FAQ accordion: closed by default; exact max-height for smooth slide. */
  const faqList = document.querySelector(".help-topic-shell .faq_new");
  if (faqList) {
    const reduceMotion = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const prepareFaqAnswer = (answer) => {
      if (!answer || answer.dataset.faqMotionReady === "1") return;
      answer.dataset.faqMotionReady = "1";
      answer.classList.remove("hide");
      answer.style.removeProperty("display");
      answer.style.removeProperty("height");
      answer.style.removeProperty("overflow");
      answer.style.removeProperty("opacity");
      if (!answer.querySelector(".help-faq-answer-inner")) {
        const inner = document.createElement("div");
        inner.className = "help-faq-answer-inner";
        while (answer.firstChild) {
          inner.appendChild(answer.firstChild);
        }
        answer.appendChild(inner);
      }
    };

    const clearFaqAnim = (answer) => {
      if (!answer?._faqOnEnd) return;
      answer.removeEventListener("transitionend", answer._faqOnEnd);
      answer._faqOnEnd = null;
    };

    const setAnswerOpen = (item, open, animate) => {
      const answer = item.querySelector(".answer");
      const question = item.querySelector(".question");
      if (!answer) return;
      prepareFaqAnswer(answer);
      clearFaqAnim(answer);
      item.classList.toggle("is-open", open);
      question?.setAttribute("aria-expanded", open ? "true" : "false");

      if (reduceMotion() || !animate) {
        answer.style.maxHeight = open ? "none" : "0px";
        return;
      }

      if (open) {
        answer.style.maxHeight = "0px";
        void answer.offsetHeight;
        answer.style.maxHeight = `${answer.scrollHeight}px`;
        const onEnd = (event) => {
          if (event.target !== answer || event.propertyName !== "max-height") return;
          if (item.classList.contains("is-open")) {
            answer.style.maxHeight = "none";
          }
          clearFaqAnim(answer);
        };
        answer._faqOnEnd = onEnd;
        answer.addEventListener("transitionend", onEnd);
        return;
      }

      answer.style.maxHeight = `${answer.scrollHeight}px`;
      void answer.offsetHeight;
      answer.style.maxHeight = "0px";
    };

    const toggleFaqItem = (item) => {
      if (!item || !faqList.contains(item)) return;
      if (!item.querySelector(".answer")) return;
      setAnswerOpen(item, !item.classList.contains("is-open"), true);
    };

    /* Firstmall board.js still calls this — no-op so it cannot fight us. */
    window.call_faq_view = () => {};

    Array.from(faqList.children).forEach((item) => {
      if (!(item instanceof HTMLElement)) return;
      const answer = item.querySelector(".answer");
      if (!answer) return;
      const shouldOpen = item.classList.contains("is-open");
      setAnswerOpen(item, shouldOpen, false);
    });

    faqList.addEventListener(
      "click",
      (event) => {
        if (event.target.closest(".answer")) return;
        const question = event.target.closest(".question");
        if (!question || !faqList.contains(question)) return;
        const realLink = event.target.closest("a[href], button[type], .realfilelist");
        if (realLink) return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        toggleFaqItem(question.closest(".help-faq-item, .faq_new > li"));
      },
      true
    );

    faqList.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const question = event.target.closest(".question");
      if (!question || !faqList.contains(question)) return;
      event.preventDefault();
      toggleFaqItem(question.closest(".help-faq-item, .faq_new > li"));
    });
  }
})();
