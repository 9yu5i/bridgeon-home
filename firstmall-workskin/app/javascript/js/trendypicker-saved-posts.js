(function () {
  "use strict";

  const root = document.querySelector(".bo-saved-posts-page");
  if (!root) return;

  const grid = root.querySelector("[data-saved-posts-grid]");
  const countLabel = root.querySelector("[data-saved-posts-count]");
  const status = root.querySelector("[data-saved-posts-status]");
  const tabs = root.querySelector("[data-saved-posts-tabs]");
  const filterButtons = [...root.querySelectorAll("[data-saved-posts-filter]")];
  const pagination = root.querySelector("[data-saved-posts-pagination]");
  const PRODUCT_FACTS_KEY = "bo-product-facts-v2";
  const FETCH_CONCURRENCY = 8;
  const CLIENT_PAGE_CAPACITY = 15;
  let activeFilter = "all";
  let activePage = 1;
  let cards = [];
  let categoriesReady = false;
  let usesClientPagination = false;
  let cardsReadyPromise = Promise.resolve();
  let hydrationPromise = null;

  const setStatus = (message) => {
    if (status) status.textContent = message;
  };

  const readProductFacts = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(PRODUCT_FACTS_KEY) || "{}");
      return stored && typeof stored === "object" ? stored : {};
    } catch {
      return {};
    }
  };

  const productFacts = readProductFacts();
  let productFactsWrite = 0;

  const writeProductFacts = () => {
    window.clearTimeout(productFactsWrite);
    productFactsWrite = window.setTimeout(() => {
      try {
        const keys = Object.keys(productFacts);
        keys.slice(0, Math.max(0, keys.length - 600)).forEach((key) => {
          delete productFacts[key];
        });
        localStorage.setItem(PRODUCT_FACTS_KEY, JSON.stringify(productFacts));
      } catch {
        // Category caching is optional when storage is unavailable.
      }
    }, 200);
  };

  const refreshCards = () => {
    cards = [...root.querySelectorAll("[data-saved-post-card]")];
  };

  refreshCards();

  const normalizeCategory = (value) => {
    const text = String(value || "").trim().toLowerCase();
    if (!text) return "";
    if (/^(beauty|k-beauty)$/.test(text)) return "beauty";
    if (/^(k-food|kfood|food)$/.test(text)) return "k-food";
    if (/^(lifestyle|life-style|living)$/.test(text)) return "lifestyle";
    if (/^(k-pop|kpop)$/.test(text)) return "k-pop";
    if (/^(k-traditional|ktraditional|traditional)$/.test(text)) return "k-traditional";
    return "";
  };

  // Firstmall's current Saved Posts `record` does not expose a verified,
  // stable category field in this template. If the backend later supplies one
  // as a data attribute it wins; otherwise this restores the former client-side
  // title classification used by the category tabs.
  const inferCategoryFromText = (value) => {
    const text = String(value || "").toLowerCase();

    if (
      /k-?\s*traditional|traditional|heritage|hanbok|tea\s*ceremony|전통|한복|도자기|공예/.test(text)
    ) {
      return "k-traditional";
    }

    if (
      /k-?\s*pop|kpop|idol|photocard|photo\s*card|album|light\s*stick|merch|응원봉|아이돌|앨범/.test(text)
    ) {
      return "k-pop";
    }

    if (
      /k-?\s*food|\bfood\b|buldak|ramen|ramyeon|tteokbokki|kimchi|snack|grocery|sauce|rice|noodle|meal|식품|라면|김치|간식|떡볶이/.test(text)
    ) {
      return "k-food";
    }

    if (
      /lifestyle|home\s*living|\bliving\b|home\s*decor|stationery|kitchen|interior|tableware|라이프|리빙|생활|문구|주방/.test(text)
    ) {
      return "lifestyle";
    }

    if (
      /k-?\s*beauty|\bbeauty\b|glass\s*skin|skincare|skin\s*care|cosmetic|makeup|serum|ampoule|toner|toner\s*pad|cream|cleanser|sunscreen|sun\s*cream|lip|tint|ceramide|hyaluron|pore|mask|hair\s*care|body\s*care|fragrance|뷰티|스킨케어|화장품/.test(text)
    ) {
      return "beauty";
    }

    return "";
  };

  const getCardCategory = (card) => {
    const explicit = normalizeCategory(
      card.dataset.savedPostCategory ||
        card.dataset.category ||
        card.getAttribute("data-shortform-category"),
    );
    if (explicit) return explicit;

    return inferCategoryFromText(
      `${card.querySelector(".bo-saved-post-card__category-seed")?.textContent || ""} ${
        card.querySelector(".bo-saved-post-card__copy b")?.textContent || ""
      }`,
    );
  };

  const updateCountLabel = (count, loading = false) => {
    if (!countLabel) return;
    if (loading) {
      countLabel.textContent = "Loading…";
      return;
    }
    countLabel.textContent = `${count} ${count === 1 ? "reel" : "reels"}`;
  };

  const ensureFilterEmptyState = () => {
    let empty = root.querySelector("[data-saved-posts-filter-empty]");
    if (empty) return empty;

    empty = document.createElement("div");
    empty.className = "bo-saved-posts-filter-empty";
    empty.dataset.savedPostsFilterEmpty = "";
    empty.hidden = true;
    empty.textContent = "No saved posts in this category.";
    grid?.insertAdjacentElement("afterend", empty);
    return empty;
  };

  const renderPagination = (matchingCards) => {
    if (!pagination || !usesClientPagination) return;
    const pageCount = Math.ceil(matchingCards.length / CLIENT_PAGE_CAPACITY);
    activePage = Math.min(activePage, Math.max(1, pageCount));
    pagination.replaceChildren();
    pagination.hidden = pageCount <= 1;

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      const link = document.createElement("a");
      link.href = "#";
      link.dataset.savedPostsPage = String(pageNumber);
      link.textContent = String(pageNumber);
      if (pageNumber === activePage) {
        link.className = "on";
        link.setAttribute("aria-current", "page");
      }
      pagination.appendChild(link);
    }
  };

  const applyFilter = (filter = activeFilter) => {
    activeFilter = filter;
    const matchingCards = cards.filter((card) => {
      const category = getCardCategory(card);
      return filter === "all" || category === filter;
    });
    const pageStart = (activePage - 1) * CLIENT_PAGE_CAPACITY;
    const visibleCards = usesClientPagination
      ? new Set(matchingCards.slice(pageStart, pageStart + CLIENT_PAGE_CAPACITY))
      : new Set(matchingCards);

    cards.forEach((card) => {
      card.hidden = !visibleCards.has(card);
    });

    filterButtons.forEach((button) => {
      const active = button.dataset.savedPostsFilter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const empty = ensureFilterEmptyState();
    const isLoading = filter !== "all" && !categoriesReady;
    empty.textContent = isLoading
      ? "Loading saved reel categories…"
      : "No saved posts in this category.";
    empty.hidden = filter === "all" || matchingCards.length > 0 || cards.length === 0;
    updateCountLabel(matchingCards.length, isLoading && matchingCards.length === 0);
    renderPagination(matchingCards);

    return matchingCards.length;
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activePage = 1;
      applyFilter(button.dataset.savedPostsFilter || "all");
      if (activeFilter !== "all") void ensureCardsHydrated();
    });
  });

  const updateCount = () => {
    refreshCards();
    const count = cards.length;
    updateCountLabel(count);
    return count;
  };

  const renderEmptyState = () => {
    const empty = document.createElement("div");
    empty.className = "bo-saved-posts-empty";
    empty.dataset.savedPostsEmpty = "";

    const copy = document.createElement("p");
    copy.textContent = "No saved Real Trend posts yet.";

    empty.append(copy);
    grid?.replaceWith(empty);
    root.querySelector("[data-saved-posts-pagination]")?.remove();
  };

  const removeSavedPost = async (button) => {
    const shortformSeq = button.dataset.shortformSeq;
    const card = button.closest("[data-saved-post-card]");
    if (!shortformSeq || !card || button.disabled) return;

    button.disabled = true;
    setStatus("Removing saved reel…");

    try {
      const response = await fetch("/shortform/toggle_save", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: new URLSearchParams({ shortform_seq: shortformSeq }),
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      const result = await response.json().catch(() => null);
      if (!result) throw new Error("The server returned an invalid response.");
      if (!result.success) {
        if (result.need_login) {
          const returnUrl = `${window.location.pathname}${window.location.search}`;
          window.location.href = `/member/login?return_url=${encodeURIComponent(returnUrl)}`;
          return;
        }
        throw new Error(result.message || "Unable to update saved posts.");
      }

      if (result.saved) {
        button.disabled = false;
        setStatus("This reel is still saved.");
        return;
      }

      card.classList.add("is-removing");
      window.setTimeout(() => {
        card.remove();
        const count = updateCount();
        if (count === 0) {
          renderEmptyState();
          return;
        }
        applyFilter(activeFilter);
      }, 200);
      setStatus("Removed from your saved posts.");
    } catch (error) {
      button.disabled = false;
      setStatus(error.message || "Failed to update saved posts.");
    }
  };

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-saved-post-remove]");
    if (!button || !root.contains(button)) return;
    event.preventDefault();
    event.stopPropagation();
    removeSavedPost(button);
  });

  pagination?.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-saved-posts-page]");
    if (!link || !pagination.contains(link)) return;
    event.preventDefault();
    activePage = Number(link.dataset.savedPostsPage || 1);
    applyFilter();
  });

  const mapLimit = async (items, limit, mapper) => {
    let nextIndex = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex;
        nextIndex += 1;
        await mapper(items[index]);
      }
    });
    await Promise.all(workers);
  };

  const readCategoryFromProduct = (documentPage) => {
    if (!documentPage) return "";
    const primary = documentPage.querySelector(
      "[data-tp-primary-category], #tp-primary-category, .qv-kbeauty-tag",
    );
    const direct =
      normalizeCategory(primary?.textContent) || inferCategoryFromText(primary?.textContent);
    if (direct) return direct;

    const breadcrumbText = [...documentPage.querySelectorAll(
      ".navi_linemap a, .navi_linemap2 a, .structure_nav a, .breadcrumb a, .category_path a",
    )]
      .map((item) => item.textContent.trim())
      .join(" > ");
    return inferCategoryFromText(breadcrumbText);
  };

  const hydrateCategories = async () => {
    await cardsReadyPromise;

    await mapLimit(cards, FETCH_CONCURRENCY, async (card) => {
      const goodsSeq = card.dataset.goodsSeq || "";
      const explicit = normalizeCategory(card.dataset.savedPostCategory);
      if (explicit) return;

      const cached = goodsSeq && normalizeCategory(productFacts[goodsSeq]?.category);
      if (cached) {
        card.dataset.savedPostCategory = cached;
        return;
      }

      if (goodsSeq) {
        try {
          const response = await fetch(`/goods/quickview?no=${encodeURIComponent(goodsSeq)}`, {
            credentials: "same-origin",
            headers: { Accept: "text/html" },
          });
          if (response.ok) {
            const html = await response.text();
            const documentPage = new DOMParser().parseFromString(html, "text/html");
            const category = readCategoryFromProduct(documentPage);
            if (category) {
              card.dataset.savedPostCategory = category;
              productFacts[goodsSeq] = { ...(productFacts[goodsSeq] || {}), category };
              writeProductFacts();
              return;
            }
          }
        } catch {
          // Use the card's product/reel text as a final fallback.
        }
      }

      card.dataset.savedPostCategory = getCardCategory(card);
    });

    categoriesReady = true;
    applyFilter();
  };

  const ensureCardsHydrated = () => {
    if (!hydrationPromise) hydrationPromise = hydrateCategories();
    return hydrationPromise;
  };

  const mergeSavedPostPages = async () => {
    const totalCount = Number(root.dataset.savedPostsTotal || 0);
    if (!grid || !pagination || !totalCount) return;

    const currentUrl = new URL(window.location.href);
    const pageUrls = [...pagination.querySelectorAll("a[href]")]
      .map((link) => new URL(link.getAttribute("href"), currentUrl).href)
      .filter((url, index, urls) => url !== currentUrl.href && urls.indexOf(url) === index);

    if (pageUrls.length) {
      const documents = await Promise.all(
        pageUrls.map((url) =>
          fetch(url, { credentials: "same-origin", headers: { Accept: "text/html" } })
            .then((response) => (response.ok ? response.text() : ""))
            .then((html) => (html ? new DOMParser().parseFromString(html, "text/html") : null))
            .catch(() => null),
        ),
      );
      const knownSeqs = new Set(cards.map((card) => card.dataset.shortformSeq || ""));

      documents.forEach((documentPage) => {
        documentPage?.querySelectorAll("[data-saved-post-card]").forEach((card) => {
          const shortformSeq = card.dataset.shortformSeq || "";
          if (!shortformSeq || knownSeqs.has(shortformSeq)) return;
          knownSeqs.add(shortformSeq);
          grid.appendChild(document.importNode(card, true));
        });
      });
      refreshCards();
    }

    usesClientPagination = cards.length >= totalCount;
    applyFilter();
  };

  if (tabs && filterButtons.length) {
    applyFilter("all");
    cardsReadyPromise = mergeSavedPostPages();
    cardsReadyPromise.then(() => {
      const preload = () => void ensureCardsHydrated();
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(preload, { timeout: 500 });
      } else {
        window.setTimeout(preload, 100);
      }
    });
  }
})();
