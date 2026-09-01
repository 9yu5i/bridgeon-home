/**
Editor's Pick JS
 **/

(() => {
  if (!document.querySelector(".editors-main")) return;

  const editorsData = Array.isArray(window.__EDITORS_PICK_DATA__) ? window.__EDITORS_PICK_DATA__ : [];
  if (!editorsData.length) {
    console.warn("[editors_pick] window.__EDITORS_PICK_DATA__ is missing or empty ? editor switching is disabled.");
  }

  const compactPicksQuery = window.matchMedia("(max-width: 1120px)");
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const editorTabs = document.querySelector(".editor-tabs");
  const editorButtons = Array.from(document.querySelectorAll("[data-editor-tab]"));
  const profileTrack = document.querySelector("[data-editor-profile-track]");
  const profileDotsWrap = document.querySelector(".editor-profile-dots");
  const categoryTabsWrap = document.querySelector(".editor-category-tabs");
  const pickList = document.querySelector("[data-editor-pick-list]");
  const pickMeter = document.querySelector("[data-pick-meter]");
  const pickMeterFill = document.querySelector("[data-pick-meter-fill]");
  const pickMeterLabel = document.querySelector("[data-pick-meter-label]");
  const picksTitle = document.querySelector("#editor-picks-title");
  const magazineTitle = document.querySelector("#editor-mag-title");
  const magazineGrid = document.querySelector("[data-editor-magazine]");
  const magazineDotsWrap = document.querySelector(".editor-magazine-dots");

  let currentTabOrder = [];
  let categoryTitleByCode = new Map();
  let activePickFilter = "";
  let isProfileScrollSyncing = false;
  let profileScrollSettleTimer = 0;
  let isPickScrollSyncing = false;
  let pickScrollSettleTimer = 0;
  let desktopEmptyMessage = null;

  const escapeHtml = (value) =>
    String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const findEditorBySeq = (seq) => editorsData.find((editor) => String(editor.editor_seq) === String(seq));

  const getCategoryTitle = (code) => categoryTitleByCode.get(code) || code;

  const getPickTabButtons = () =>
    categoryTabsWrap ? Array.from(categoryTabsWrap.querySelectorAll("[data-pick-filter]")) : [];

  const buildCategoryTabs = () => {
    if (!categoryTabsWrap) return;
    categoryTabsWrap.innerHTML = "";
    currentTabOrder.forEach((code) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.pickFilter = code;
      button.setAttribute("aria-selected", "false");
      button.textContent = getCategoryTitle(code);
      categoryTabsWrap.appendChild(button);
    });
  };

  /* ---------- Current editor state, seeded from what the server rendered. ---------- */
  const initialActiveCard = profileTrack?.querySelector(".editor-profile.is-active:not([data-editor-clone])");
  let currentEditor = findEditorBySeq(initialActiveCard?.dataset.editorIndex) || editorsData[0] || null;

  {
    const categories = Array.isArray(currentEditor?.pick_categories) ? currentEditor.pick_categories : [];
    currentTabOrder = categories.map((cat) => cat.code);
    categoryTitleByCode = new Map(categories.map((cat) => [cat.code, cat.title || cat.code]));
  }
  activePickFilter = currentTabOrder[0] || "";
  buildCategoryTabs();

  let currentPickCards = pickList ? Array.from(pickList.querySelectorAll(".editor-pick-card")) : [];

  /* ---------- Shared drag-scroll helper (tabs row + profile carousel). ---------- */
  const enableHorizontalDragScroll = (scroller, { mouseDrag = true } = {}) => {
    if (!scroller) return;
    let dragState = null;
    let suppressClick = false;

    scroller.addEventListener("pointerdown", (event) => {
      if (event.button && event.button !== 0) return;
      if (!mouseDrag && event.pointerType === "mouse") return;
      if (scroller.scrollWidth <= scroller.clientWidth + 2) return;
      dragState = { id: event.pointerId, startX: event.clientX, scrollLeft: scroller.scrollLeft, moved: false };
      scroller.setPointerCapture?.(event.pointerId);
    });

    scroller.addEventListener("pointermove", (event) => {
      if (!dragState || dragState.id !== event.pointerId) return;
      const deltaX = event.clientX - dragState.startX;
      if (Math.abs(deltaX) > 8) {
        dragState.moved = true;
        suppressClick = true;
      }
      if (!dragState.moved) return;
      scroller.scrollLeft = dragState.scrollLeft - deltaX;
    });

    const endDrag = (event) => {
      if (!dragState || dragState.id !== event.pointerId) return;
      const moved = dragState.moved;
      scroller.releasePointerCapture?.(event.pointerId);
      dragState = null;
      if (moved) window.setTimeout(() => { suppressClick = false; }, 180);
    };

    scroller.addEventListener("pointerup", endDrag);
    scroller.addEventListener("pointercancel", endDrag);
    scroller.addEventListener(
      "click",
      (event) => {
        if (!suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
      },
      true
    );
  };

  /* ---------- Profile carousel: loop by cloning the real first/last cards. ---------- */
  const setupProfileLoop = () => {
    if (!profileTrack) return null;
    const realCards = Array.from(profileTrack.querySelectorAll(".editor-profile:not([data-editor-clone])"));
    if (realCards.length < 2) return { realCards };

    const firstClone = realCards[0].cloneNode(true);
    const lastClone = realCards[realCards.length - 1].cloneNode(true);
    firstClone.setAttribute("data-editor-clone", "true");
    lastClone.setAttribute("data-editor-clone", "true");
    profileTrack.insertBefore(lastClone, realCards[0]);
    profileTrack.appendChild(firstClone);

    return { realCards, firstClone, lastClone };
  };

  const profileLoop = setupProfileLoop();

  const getScrollLeftForCard = (card) =>
    Math.max(0, card.offsetLeft - (profileTrack.clientWidth - card.offsetWidth) / 2);

  const getRealIndexBySeq = (seq) =>
    (profileLoop?.realCards || []).findIndex((card) => card.dataset.editorIndex === String(seq));

  const computeWrapDirection = (fromSeq, toSeq) => {
    const realCards = profileLoop?.realCards;
    if (!realCards || realCards.length < 2) return "";
    const fromIndex = getRealIndexBySeq(fromSeq);
    const toIndex = getRealIndexBySeq(toSeq);
    if (fromIndex < 0 || toIndex < 0) return "";
    const lastIndex = realCards.length - 1;
    if (fromIndex === lastIndex && toIndex === 0) return "forward";
    if (fromIndex === 0 && toIndex === lastIndex) return "backward";
    return "";
  };

  const runScrollWithRelease = (targetLeft, onDone) => {
    isProfileScrollSyncing = true;
    let releaseTimer = 0;
    const finish = () => {
      profileTrack.removeEventListener("scrollend", onScrollEnd);
      window.clearTimeout(releaseTimer);
      onDone();
    };
    const onScrollEnd = finish;
    profileTrack.addEventListener("scrollend", onScrollEnd, { once: true });
    releaseTimer = window.setTimeout(finish, 600);
    profileTrack.scrollTo({ left: targetLeft, behavior: reduceMotionQuery.matches ? "auto" : "smooth" });
  };

  const snapInstantTo = (targetLeft) => {
    profileTrack.style.scrollBehavior = "auto";
    profileTrack.scrollLeft = targetLeft;
    void profileTrack.offsetHeight;
    profileTrack.style.scrollBehavior = "";
  };

  const scrollCarouselToEditor = (seq, { instant = false, wrapDirection = "" } = {}) => {
    if (!profileTrack) return;

    const cloneCard = wrapDirection === "forward" ? profileLoop?.firstClone
      : wrapDirection === "backward" ? profileLoop?.lastClone
      : null;

    if (cloneCard && !instant) {
      const hopLeft = getScrollLeftForCard(cloneCard);
      runScrollWithRelease(hopLeft, () => {
        const realCard = profileTrack.querySelector(`.editor-profile[data-editor-index="${seq}"]:not([data-editor-clone])`);
        if (realCard) snapInstantTo(getScrollLeftForCard(realCard));
        window.requestAnimationFrame(() => { isProfileScrollSyncing = false; });
      });
      return;
    }

    const card = profileTrack.querySelector(`.editor-profile[data-editor-index="${seq}"]:not([data-editor-clone])`);
    if (!card) return;

    const targetLeft = getScrollLeftForCard(card);
    if (Math.abs(profileTrack.scrollLeft - targetLeft) < 1) return;

    const useInstant = instant || reduceMotionQuery.matches;
    if (useInstant) {
      isProfileScrollSyncing = true;
      snapInstantTo(targetLeft);
      window.requestAnimationFrame(() => { isProfileScrollSyncing = false; });
      return;
    }

    runScrollWithRelease(targetLeft, () => { isProfileScrollSyncing = false; });
  };

  const updateActiveVisualState = (seq) => {
    profileTrack?.querySelectorAll(".editor-profile").forEach((card) => {
      card.classList.toggle("is-active", card.dataset.editorIndex === String(seq));
    });
    if (profileDotsWrap) {
      const realIndex = editorsData.findIndex((editor) => String(editor.editor_seq) === String(seq));
      Array.from(profileDotsWrap.children).forEach((dot, index) => {
        dot.classList.toggle("is-active", index === realIndex);
      });
    }
    editorButtons.forEach((button) => {
      const isActive = String(button.dataset.seq || button.dataset.editorTab) === String(seq);
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  };

  const updateUrlSeq = (seq) => {
    if (!window.history?.pushState) return;
    const url = new URL(window.location.href);
    url.searchParams.set("seq", seq);
    window.history.pushState({ seq }, "", url.toString());
  };

  /* ---------- Wishlist toggle for pick cards. ---------- */
  const toggleEditorWish = (button, goodsSeq) => {
    const nextActive = !button.classList.contains("is-active");
    const url = nextActive
      ? `/mypage/wish_add?seqs[]=${encodeURIComponent(goodsSeq)}`
      : `/mypage/wish_del?seqs=${encodeURIComponent(goodsSeq)}`;

    fetch(url, { credentials: "same-origin" })
      .then((res) => {
        if (!res.ok) return;
        button.classList.toggle("is-active", nextActive);
        button.setAttribute("aria-pressed", nextActive ? "true" : "false");
        button.setAttribute("aria-label", nextActive ? "Remove from wishlist" : "Add to wishlist");
      })
      .catch(() => {});
  };

  /* ---------- Pick card rendering (client-side, for any editor's data). ---------- */
  const renderPickCardElement = (pick) => {
    const article = document.createElement("article");
    article.className = "editor-pick-card";
    article.dataset.pickCategory = pick.category || "";
    const goodsUrl = `/goods/view?no=${encodeURIComponent(pick.goods_seq)}`;
    article.innerHTML = `
      <div class="editor-pick-image" aria-hidden="true">
        <a href="${goodsUrl}"><img src="${escapeHtml(pick.goods_img || pick.image || "")}" alt="${escapeHtml(pick.goods_name)}" loading="lazy"></a>
      </div>
      <div class="editor-pick-product">
        <p>${pick.brand}</p>
        <h3><a href="${goodsUrl}">${escapeHtml(pick.goods_name_display || pick.goods_name || "")}</a></h3>
        <div class="editor-price"><strong>${pick.price_display != null ? pick.price_display : escapeHtml(String(pick.price ?? ""))}</strong></div>
        <div class="editor-pick-actions">
          <button type="button" class="editor-cart" aria-label="Add to cart"><img src="/data/skin/responsive_food_mealkit_gl/images/icon/icon-cart-white.png" alt="" aria-hidden="true"></button>
          <button type="button" class="editor-wish${pick.wish == 1 ? " is-active" : ""}" aria-label="${pick.wish == 1 ? "Remove from wishlist" : "Add to wishlist"}" aria-pressed="${pick.wish == 1 ? "true" : "false"}" data-goods-seq="${escapeHtml(pick.goods_seq)}"></button>
        </div>
      </div>
      <aside class="editor-pick-note">
        <div class="editor-pick-note-copy">
          <h4><span aria-hidden="true"></span> Why I Picked It!</h4>
          <p>${escapeHtml(pick.pick_reason)}</p>
          <div class="editor-pick-tags">${pick.tags_html || ""}</div>
        </div>
      </aside>
    `;

    const cartButton = article.querySelector(".editor-cart");
    cartButton?.addEventListener("click", (event) => {
      event.preventDefault();
      if (typeof parent !== "undefined" && typeof parent.displayAddToCartQuickview === "function") {
        parent.displayAddToCartQuickview(cartButton, pick.goods_seq, event);
      }
      cartButton.blur();
    });

    const wishButton = article.querySelector(".editor-wish");
    wishButton?.addEventListener("click", (event) => {
      event.preventDefault();
      toggleEditorWish(wishButton, pick.goods_seq);
      wishButton.blur();
    });

    return article;
  };

  /* ---------- Pick category filtering (operates on `currentPickCards`). ---------- */
  const isCompactPicks = () => compactPicksQuery.matches;

  const buildMobilePanels = () => {
    if (!pickList) return;
    const byCategory = new Map(currentTabOrder.map((tab) => [tab, []]));
    currentPickCards.forEach((card) => {
      const category = card.dataset.pickCategory;
      if (byCategory.has(category)) byCategory.get(category).push(card);
    });

    pickList.innerHTML = "";
    currentTabOrder.forEach((tab) => {
      const panel = document.createElement("div");
      panel.className = "editor-pick-panel";
      panel.dataset.pickPanel = tab;
      const cards = byCategory.get(tab);
      if (cards.length) {
        cards.forEach((card) => {
          card.style.display = "";
          panel.appendChild(card);
        });
      } else {
        const empty = document.createElement("p");
        empty.className = "editor-empty-message";
        empty.textContent = `No ${getCategoryTitle(tab)} picks yet.`;
        panel.appendChild(empty);
      }
      pickList.appendChild(panel);
    });
  };

  const applyDesktopFilter = () => {
    if (!pickList) return;
    pickList.innerHTML = "";
    currentPickCards.forEach((card) => {
      card.style.display = card.dataset.pickCategory === activePickFilter ? "" : "none";
      pickList.appendChild(card);
    });

    const anyVisible = currentPickCards.some((card) => card.dataset.pickCategory === activePickFilter);
    if (!anyVisible) {
      desktopEmptyMessage = document.createElement("p");
      desktopEmptyMessage.className = "editor-empty-message";
      desktopEmptyMessage.textContent = `No ${getCategoryTitle(activePickFilter)} picks yet.`;
      pickList.appendChild(desktopEmptyMessage);
    } else {
      desktopEmptyMessage = null;
    }
  };

  const updatePickTabState = () => {
    getPickTabButtons().forEach((tab) => {
      const isActive = tab.dataset.pickFilter === activePickFilter;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  };

  const scrollPickPanelIntoView = (filter, { instant = false } = {}) => {
    if (!pickList || !isCompactPicks()) return;
    const panel = pickList.querySelector(`[data-pick-panel="${filter}"]`);
    if (!panel) return;
    isPickScrollSyncing = true;
    pickList.scrollTo({ left: panel.offsetLeft, behavior: instant || reduceMotionQuery.matches ? "auto" : "smooth" });
    window.setTimeout(() => { isPickScrollSyncing = false; }, instant ? 0 : 450);
  };

  const scrollCategoryTabIntoView = () => {
    if (!isCompactPicks() || !categoryTabsWrap) return;
    const activeTab = getPickTabButtons().find((tab) => tab.dataset.pickFilter === activePickFilter);
    if (!activeTab) return;
    const targetLeft = activeTab.offsetLeft - (categoryTabsWrap.clientWidth - activeTab.offsetWidth) / 2;
    categoryTabsWrap.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: reduceMotionQuery.matches ? "auto" : "smooth",
    });
  };

  const scrollEditorTabsToTop = () => {
    if (!editorTabs) return;
    const HEADER_OFFSET = 154;
    const targetTop = editorTabs.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top: targetTop, behavior: reduceMotionQuery.matches ? "auto" : "smooth" });
  };

  const syncPickListHeight = () => {
    if (!pickList || !isCompactPicks()) return;
    const activePanel = pickList.querySelector(`[data-pick-panel="${activePickFilter}"]`);
    if (!activePanel) return;
    pickList.style.height = `${activePanel.scrollHeight}px`;

    Array.from(activePanel.querySelectorAll("img"))
      .filter((img) => !img.complete)
      .forEach((img) => {
        img.addEventListener(
          "load",
          () => {
            if (activePanel.dataset.pickPanel === activePickFilter) {
              pickList.style.height = `${activePanel.scrollHeight}px`;
            }
          },
          { once: true }
        );
      });
  };

  const updatePickMeter = () => {
    if (!pickMeter) return;
    if (!isCompactPicks()) {
      pickMeter.style.display = "none";
      return;
    }
    pickMeter.style.display = "";
    const tabIndex = Math.max(0, currentTabOrder.indexOf(activePickFilter));
    if (pickMeterFill) {
      const progress = currentTabOrder.length > 1 ? (tabIndex + 1) / currentTabOrder.length : 1;
      pickMeterFill.style.transform = `scaleX(${progress})`;
    }
    if (pickMeterLabel) {
      pickMeterLabel.textContent = `${getCategoryTitle(activePickFilter)} \u00B7 ${tabIndex + 1} / ${currentTabOrder.length}`;
    }
  };

  const setActivePickFilter = (filter, { fromScroll = false, instant = false } = {}) => {
    activePickFilter = filter || currentTabOrder[0] || "";
    updatePickTabState();
    updatePickMeter();
    scrollCategoryTabIntoView();
    syncPickListHeight();

    if (fromScroll) return;

    if (isCompactPicks()) {
      scrollPickPanelIntoView(activePickFilter, { instant });
    } else {
      applyDesktopFilter();
    }
  };

  const syncPickFilterFromScroll = () => {
    if (!pickList || !isCompactPicks() || isPickScrollSyncing) return;
    const panels = Array.from(pickList.querySelectorAll("[data-pick-panel]"));
    if (!panels.length) return;
    const midpoint = pickList.scrollLeft + pickList.clientWidth / 2;
    let closest = panels[0];
    let closestDist = Infinity;
    panels.forEach((panel) => {
      const dist = Math.abs(panel.offsetLeft + panel.offsetWidth / 2 - midpoint);
      if (dist < closestDist) {
        closestDist = dist;
        closest = panel;
      }
    });
    const filter = closest.dataset.pickPanel;
    if (filter && filter !== activePickFilter) setActivePickFilter(filter, { fromScroll: true });
  };

  // Delegated on the wrapper rather than bound per-button - one listener
  // covers all tabs regardless of how many the server rendered.
  categoryTabsWrap?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-pick-filter]");
    if (!button) return;
    setActivePickFilter(button.dataset.pickFilter);
  });

  pickList?.addEventListener(
    "scroll",
    () => {
      if (!isCompactPicks() || isPickScrollSyncing) return;
      window.clearTimeout(pickScrollSettleTimer);
      pickScrollSettleTimer = window.setTimeout(syncPickFilterFromScroll, 80);
    },
    { passive: true }
  );

  const handleCompactPicksChange = () => {
    if (isCompactPicks()) {
      buildMobilePanels();
      scrollPickPanelIntoView(activePickFilter, { instant: true });
      syncPickListHeight();
    } else {
      pickList.style.height = "";
      applyDesktopFilter();
    }
    updatePickMeter();
  };

  if (typeof compactPicksQuery.addEventListener === "function") {
    compactPicksQuery.addEventListener("change", handleCompactPicksChange);
  } else if (typeof compactPicksQuery.addListener === "function") {
    compactPicksQuery.addListener(handleCompactPicksChange);
  }

  /* ---------- Picks/Magazine headings + full re-render on editor switch. ---------- */
  const updatePicksHeading = () => {
    if (!picksTitle || !currentEditor) return;
    const count = currentEditor.pick_cnt ?? (currentEditor.linked_picks ? currentEditor.linked_picks.length : 0);
    const suffix = count === 1 ? "item" : "items";
    picksTitle.innerHTML = `${escapeHtml(currentEditor.name)}&rsquo;s Picks <span>(${count} ${suffix})</span>`;
  };

  const updateMagazineHeading = () => {
    if (!magazineTitle || !currentEditor) return;
    magazineTitle.innerHTML = `From ${escapeHtml(currentEditor.name)}&rsquo;s Magazine`;
  };

  const renderPicksForCurrentEditor = () => {
    if (!pickList || !currentEditor) return;
    currentPickCards = (currentEditor.linked_picks || []).map(renderPickCardElement);
    desktopEmptyMessage = null;
    updatePicksHeading();

    if (isCompactPicks()) {
      buildMobilePanels();
      scrollPickPanelIntoView(activePickFilter, { instant: true });
      syncPickListHeight();
    } else {
      pickList.style.height = "";
      applyDesktopFilter();
    }
    updatePickMeter();
  };

  const renderMagazineCardElement = (article) => {
    const card = document.createElement("article");
    card.className = "editor-magazine-card";
    card.dataset.magazineSeq = article.seq;
    card.innerHTML = `
      <div class="editor-magazine-image" style="background-image:url('${escapeHtml(article.thumbnail || "")}')" aria-hidden="true"></div>
      <h3>${escapeHtml(article.title)}</h3>
      <p>${escapeHtml(article.excerpt)}</p>
      <small>${escapeHtml(article.date)} &middot; ${escapeHtml(article.category)}</small>
    `;
    card.addEventListener("click", () => { location.href = article.url; });
    return card;
  };

  const renderMagazineForCurrentEditor = () => {
    if (!magazineGrid || !currentEditor) return;
    magazineGrid.innerHTML = "";
    const articles = currentEditor.magazine_articles || [];
    if (!articles.length) {
      const empty = document.createElement("p");
      empty.className = "editor-empty-message";
      empty.textContent = "No magazine articles yet.";
      magazineGrid.appendChild(empty);
      return;
    }
    articles.forEach((article) => magazineGrid.appendChild(renderMagazineCardElement(article)));
  };


  /* ---------- The one function every selection path (click or scroll) goes through. ---------- */
  const selectEditor = (seq, { instant = false } = {}) => {
    const editor = findEditorBySeq(seq);
    if (!editor) return;

    const changed = !currentEditor || String(currentEditor.editor_seq) !== String(editor.editor_seq);
    const wrapDirection = currentEditor ? computeWrapDirection(currentEditor.editor_seq, editor.editor_seq) : "";

    updateActiveVisualState(editor.editor_seq);
    scrollCarouselToEditor(editor.editor_seq, { instant, wrapDirection });

    if (!changed) return;

    currentEditor = editor;
    activePickFilter = currentTabOrder[0] || "";
    updatePickTabState();
    scrollCategoryTabIntoView();
    scrollEditorTabsToTop();
    renderPicksForCurrentEditor();
    updateMagazineHeading();
    renderMagazineForCurrentEditor();
    updateMagazineDots();
    updateUrlSeq(editor.editor_seq);
  };

  /* ---------- Wire up selection: tab click, card click, and free scroll/drag. ---------- */
  editorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectEditor(button.dataset.seq || button.dataset.editorTab);
    });
  });

  profileTrack?.addEventListener("click", (event) => {
    const card = event.target.closest(".editor-profile");
    if (!card) return;
    selectEditor(card.dataset.editorIndex);
  });

  const handleProfileScrollSettle = () => {
    if (!profileTrack) return;
    const cards = Array.from(profileTrack.querySelectorAll(".editor-profile"));
    const midpoint = profileTrack.scrollLeft + profileTrack.clientWidth / 2;
    let closest = null;
    let closestDistance = Infinity;
    cards.forEach((card) => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - midpoint);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = card;
      }
    });
    if (!closest) return;

    // Landing on a clone (the infinite-loop illusion) snaps back to the real
    // card instantly via selectEditor -> scrollCarouselToEditor, which always
    // targets the non-clone element for that seq.
    selectEditor(closest.dataset.editorIndex, { instant: closest.hasAttribute("data-editor-clone") });
  };

  profileTrack?.addEventListener(
    "scroll",
    () => {
      if (isProfileScrollSyncing) return;
      window.clearTimeout(profileScrollSettleTimer);
      profileScrollSettleTimer = window.setTimeout(handleProfileScrollSettle, 120);
    },
    { passive: true }
  );

  enableHorizontalDragScroll(editorTabs);
  enableHorizontalDragScroll(profileTrack, { mouseDrag: false });

  // Open already centered on the server-selected editor. Pick cards are
  // rebuilt from the JSON payload rather than trusted from the server HTML -
  // the skin compiler's per-pick {.category} interpolation is unreliable
  // (same bug class as the category tabs), which is why a reload could show
  // "no picks" for a category the editor actually has picks in.
  if (currentEditor) {
    updateActiveVisualState(currentEditor.editor_seq);
    window.requestAnimationFrame(() => scrollCarouselToEditor(currentEditor.editor_seq, { instant: true }));
  }
  updatePickTabState();
  renderPicksForCurrentEditor();
  renderMagazineForCurrentEditor();
  updateMagazineHeading();

  const updateMagazineDots = () => {
    if (!magazineGrid || !magazineDotsWrap) return;
    const dots = Array.from(magazineDotsWrap.querySelectorAll("span"));
    if (!dots.length) return;
    const maxScrollLeft = Math.max(1, magazineGrid.scrollWidth - magazineGrid.clientWidth);
    const progress = magazineGrid.scrollLeft / maxScrollLeft;
    const activeIndex = Math.min(dots.length - 1, Math.round(progress * (dots.length - 1)));
    dots.forEach((dot, index) => dot.classList.toggle("is-active", index === activeIndex));
  };



  magazineGrid?.addEventListener(
    "scroll",
    () => {
      window.requestAnimationFrame(updateMagazineDots);
    },
    { passive: true }
  );
})();