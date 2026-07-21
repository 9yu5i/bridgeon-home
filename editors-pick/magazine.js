(() => {
  const filterButtons = Array.from(document.querySelectorAll("[data-magazine-filter]"));
  const cards = Array.from(document.querySelectorAll(".magazine-post-card[data-magazine-category]"));
  const postGrid = document.querySelector("[data-magazine-grid]");
  const leadGrid = document.querySelector(".magazine-lead-grid");
  const popularSection = document.querySelector(".magazine-popular");
  const categoryResults = document.querySelector("[data-magazine-category-results]");
  const categoryGrid = document.querySelector("[data-magazine-category-grid]");
  const categoryPagination = document.querySelector("[data-magazine-category-pagination]");
  const popularControls = document.querySelector("[data-magazine-popular-controls]");
  const popularPrev = document.querySelector("[data-magazine-popular-prev]");
  const popularNext = document.querySelector("[data-magazine-popular-next]");
  const desktopQuery = window.matchMedia("(min-width: 1121px)");
  const tabletQuery = window.matchMedia("(min-width: 761px)");
  const compactTabsQuery = window.matchMedia("(max-width: 1120px)");
  const topicTabs = document.querySelector(".magazine-topic-tabs");
  const categoryPageSize = 15;
  const createMagazineSlug = (value, fallback = "magazine-story") =>
    String(value || fallback)
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback;
  const getMagazineSlug = (card) =>
    card?.dataset.magazineSlug ||
    createMagazineSlug(card?.querySelector("h2, h3")?.textContent, "magazine-story");
  const getCategoryFromCard = (card) => {
    if (!card) return "";

    if (card.dataset.magazineCategory) return card.dataset.magazineCategory;

    const categoryLabel =
      card.querySelector(".magazine-copy > p")?.textContent?.trim()
      || card.querySelector(":scope > div > p")?.textContent?.trim()
      || card.querySelector("p")?.textContent?.trim();

    return categoryLabel || "";
  };
  const getMagazineDetailHref = (card) => {
    const detailUrl = new URL("./magazine-detail.html", document.currentScript?.src || window.location.href);
    detailUrl.searchParams.set("article", getMagazineSlug(card));
    const category = getCategoryFromCard(card);
    if (category) detailUrl.searchParams.set("category", category);
    return detailUrl.href;
  };
  let activeFilter = "all";
  let popularIndex = 0;
  let categoryPage = 0;
  let categoryItems = [];

  if (!filterButtons.length || !cards.length) return;

  document
    .querySelectorAll(".magazine-feature-card a, .magazine-side-card a, .magazine-post-card a")
    .forEach((link) => {
      const card = link.closest(".magazine-feature-card, .magazine-side-card, .magazine-post-card");
      if (link.getAttribute("href") === "#") link.href = getMagazineDetailHref(card);
    });

  const openMagazineDetail = (card) => {
    if (!card) return;
    const href = getMagazineDetailHref(card);
    if (window.BridgeOn?.navigateWithPageTransition) {
      window.BridgeOn.navigateWithPageTransition(href);
      return;
    }
    window.location.href = href;
  };

  document.addEventListener("click", (event) => {
    if (event.target.closest("a, button")) return;

    const copy = event.target.closest(".magazine-copy");
    if (copy) {
      openMagazineDetail(copy.closest(".magazine-feature-card"));
      return;
    }

    const popularCard = event.target.closest(".magazine-post-card.is-popular-visible");
    if (popularCard) openMagazineDetail(popularCard);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (event.target.closest("a, button")) return;

    const copy = event.target.closest(".magazine-copy");
    if (copy) {
      event.preventDefault();
      openMagazineDetail(copy.closest(".magazine-feature-card"));
      return;
    }

    const popularCard = event.target.closest(".magazine-post-card.is-popular-visible");
    if (popularCard && event.target === popularCard) {
      event.preventDefault();
      openMagazineDetail(popularCard);
    }
  });

  document.querySelectorAll(".magazine-copy").forEach((copy) => {
    copy.tabIndex = 0;
    copy.setAttribute("role", "link");
    const title = copy.querySelector("h2")?.textContent?.trim();
    if (title) copy.setAttribute("aria-label", `Read ${title}`);
  });

  const syncPopularCardLinks = () => {
    cards.forEach((card) => {
      const isVisible = card.classList.contains("is-popular-visible");
      if (isVisible) {
        card.tabIndex = 0;
        card.setAttribute("role", "link");
        const title = card.querySelector("h3")?.textContent?.trim();
        if (title) card.setAttribute("aria-label", `Read ${title}`);
        return;
      }

      card.removeAttribute("tabindex");
      card.removeAttribute("role");
      card.removeAttribute("aria-label");
    });
  };

  const getVisibleCards = () => cards;
  const getPopularViewSize = () => {
    if (desktopQuery.matches) return 3;
    if (tabletQuery.matches) return 2;
    return 1;
  };

  const clearPopularState = () => {
    cards.forEach((card) => {
      card.classList.remove("is-popular-visible", "is-featured");
    });
  };

  const syncPopularControls = () => {
    if (!popularControls || !popularPrev || !popularNext) return;

    const visibleCards = getVisibleCards();
    const viewSize = getPopularViewSize();
    const canSlide = visibleCards.length > viewSize;

    popularControls.hidden = !canSlide;

    if (!canSlide) {
      popularIndex = 0;
      popularPrev.disabled = true;
      popularNext.disabled = true;
      return;
    }

    const maxIndex = Math.max(0, visibleCards.length - viewSize);
    popularIndex = Math.min(popularIndex, maxIndex);
    popularPrev.disabled = popularIndex <= 0;
    popularNext.disabled = popularIndex >= maxIndex;
  };

  const syncPopularLayout = () => {
    clearPopularState();

    if (!postGrid) {
      syncPopularCardLinks();
      syncPopularControls();
      return;
    }

    const visibleCards = getVisibleCards();
    const viewSize = getPopularViewSize();
    const maxIndex = Math.max(0, visibleCards.length - viewSize);
    popularIndex = Math.min(popularIndex, maxIndex);

    visibleCards.slice(popularIndex, popularIndex + viewSize).forEach((card) => {
      card.classList.add("is-popular-visible");
    });

    syncPopularCardLinks();
    syncPopularControls();
  };

  const setPopularIndex = (nextIndex) => {
    const visibleCards = getVisibleCards();
    const maxIndex = Math.max(0, visibleCards.length - getPopularViewSize());
    popularIndex = Math.max(0, Math.min(nextIndex, maxIndex));
    syncPopularLayout();
  };

  const syncCategoryPagination = () => {
    if (!categoryPagination) return;

    const totalPages = Math.max(1, Math.ceil(categoryItems.length / categoryPageSize));
    categoryPagination.textContent = "";
    categoryPagination.hidden = activeFilter === "all" || totalPages <= 1;

    if (categoryPagination.hidden) return;

    const createButton = (label, options = {}) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.className = options.className || "magazine-category-page";
      if (options.label) button.setAttribute("aria-label", options.label);
      if (options.current) button.setAttribute("aria-current", "page");
      if (options.disabled) button.disabled = true;
      button.addEventListener("click", options.onClick);
      return button;
    };

    categoryPagination.append(
      createButton("<", {
        className: "magazine-category-page magazine-category-page-arrow",
        label: "Previous category page",
        disabled: categoryPage <= 0,
        onClick: () => renderCategoryPage(categoryPage - 1),
      }),
    );

    for (let page = 0; page < totalPages; page += 1) {
      categoryPagination.append(
        createButton(String(page + 1), {
          current: page === categoryPage,
          className: `magazine-category-page${page === categoryPage ? " is-active" : ""}`,
          label: `Category page ${page + 1}`,
          onClick: () => renderCategoryPage(page),
        }),
      );
    }

    categoryPagination.append(
      createButton(">", {
        className: "magazine-category-page magazine-category-page-arrow",
        label: "Next category page",
        disabled: categoryPage >= totalPages - 1,
        onClick: () => renderCategoryPage(categoryPage + 1),
      }),
    );
  };

  function renderCategoryPage(nextPage = 0) {
    if (!categoryGrid) return;

    const totalPages = Math.max(1, Math.ceil(categoryItems.length / categoryPageSize));
    const fragment = document.createDocumentFragment();
    categoryPage = Math.max(0, Math.min(nextPage, totalPages - 1));
    categoryGrid.textContent = "";

    categoryItems
      .slice(categoryPage * categoryPageSize, (categoryPage + 1) * categoryPageSize)
      .forEach((sourceCard) => {
        const clone = sourceCard.cloneNode(true);
        clone.removeAttribute("hidden");
        clone.classList.remove("is-popular-visible", "is-featured");
        clone.classList.add("is-category-result");
        fragment.append(clone);
      });

    categoryGrid.append(fragment);
    syncCategoryPagination();
  }

  const buildCategoryCards = (filter) => {
    if (!categoryGrid) return;

    const sourceCards = cards.filter((card) => card.dataset.magazineCategory === filter);
    const cardsToRender = sourceCards.length ? sourceCards : cards;
    const cardCount = categoryPageSize * 2;
    categoryItems = Array.from({ length: cardCount }, (_, index) => cardsToRender[index % cardsToRender.length]);
    renderCategoryPage(0);
  };

  const setCategoryMode = (isCategoryMode) => {
    if (leadGrid) leadGrid.hidden = isCategoryMode;
    if (popularSection) popularSection.hidden = isCategoryMode;
    if (categoryResults) categoryResults.hidden = !isCategoryMode;
    if (!isCategoryMode) {
      categoryItems = [];
      categoryPage = 0;
      if (categoryGrid) categoryGrid.textContent = "";
      syncCategoryPagination();
    }
  };

  const setActiveFilter = (filter) => {
    activeFilter = filter || "all";

    filterButtons.forEach((button) => {
      const isActive = button.dataset.magazineFilter === activeFilter;
      button.classList.toggle("is-active", isActive);
      if (isActive) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    const isCategoryMode = activeFilter !== "all";
    setCategoryMode(isCategoryMode);

    if (isCategoryMode) {
      buildCategoryCards(activeFilter);
    }

    popularIndex = 0;
    syncPopularLayout();
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      setActiveFilter(button.dataset.magazineFilter || "all");
    });
  });

  popularPrev?.addEventListener("click", () => {
    setPopularIndex(popularIndex - 1);
  });

  popularNext?.addEventListener("click", () => {
    setPopularIndex(popularIndex + 1);
  });

  const syncTopicTabsOverflow = () => {
    if (!topicTabs) return;

    if (!compactTabsQuery.matches) {
      topicTabs.classList.remove("is-fade-left", "is-fade-right");
      return;
    }

    const maxScroll = Math.max(0, topicTabs.scrollWidth - topicTabs.clientWidth);
    const scrollLeft = topicTabs.scrollLeft;
    const canScrollLeft = scrollLeft > 2;
    const canScrollRight = scrollLeft < maxScroll - 2;

    topicTabs.classList.toggle("is-fade-left", canScrollLeft);
    topicTabs.classList.toggle("is-fade-right", canScrollRight);
  };

  const nudgeTopicTabsOnce = () => {
    if (!topicTabs || !compactTabsQuery.matches) return;
    if (topicTabs.dataset.scrollHintPlayed === "true") return;

    const maxScroll = topicTabs.scrollWidth - topicTabs.clientWidth;
    if (maxScroll <= 8) return;

    topicTabs.dataset.scrollHintPlayed = "true";
    const hintDistance = Math.min(48, maxScroll);

    topicTabs.scrollTo({ left: hintDistance, behavior: "smooth" });
    window.setTimeout(() => {
      topicTabs.scrollTo({ left: 0, behavior: "smooth" });
    }, 420);
  };

  topicTabs?.addEventListener("scroll", syncTopicTabsOverflow, { passive: true });

  desktopQuery.addEventListener("change", () => {
    popularIndex = 0;
    syncPopularLayout();
    syncTopicTabsOverflow();
  });

  tabletQuery.addEventListener("change", () => {
    popularIndex = 0;
    syncPopularLayout();
  });

  compactTabsQuery.addEventListener("change", () => {
    syncTopicTabsOverflow();
    nudgeTopicTabsOnce();
  });

  window.addEventListener("resize", () => {
    syncPopularLayout();
    syncTopicTabsOverflow();
  });

  syncPopularLayout();
  syncTopicTabsOverflow();
  window.requestAnimationFrame(() => {
    syncTopicTabsOverflow();
    nudgeTopicTabsOnce();
  });
})();
