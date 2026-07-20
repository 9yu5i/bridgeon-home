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
  const categoryPageSize = 15;
  let activeFilter = "all";
  let popularIndex = 0;
  let categoryPage = 0;
  let categoryItems = [];

  if (!filterButtons.length || !cards.length) return;

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

  desktopQuery.addEventListener("change", () => {
    popularIndex = 0;
    syncPopularLayout();
  });

  tabletQuery.addEventListener("change", () => {
    popularIndex = 0;
    syncPopularLayout();
  });

  window.addEventListener("resize", () => {
    syncPopularLayout();
  });

  syncPopularLayout();
})();
