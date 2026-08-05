(() => {
  const page = document.querySelector(".bo-wishlist-page");
  if (!page) return;

  const CATEGORY_KEYS = ["beauty", "k-food", "lifestyle", "k-pop", "k-traditional"];
  const FETCH_CONCURRENCY = 4;

  // Primary labels beat keyword guesses. Order only matters for equal scores.
  const CATEGORY_PATTERNS = [
    {
      key: "k-traditional",
      patterns: [
        { re: /k-?\s*traditional/i, weight: 120 },
        { re: /전통/, weight: 120 },
        { re: /hanbok/i, weight: 90 },
        { re: /한복/, weight: 90 },
        { re: /heritage/i, weight: 70 },
        { re: /tea\s*ceremony/i, weight: 70 },
      ],
    },
    {
      key: "k-pop",
      patterns: [
        { re: /k-?\s*pop/i, weight: 120 },
        { re: /케이\s*팝/, weight: 120 },
        { re: /idol/i, weight: 80 },
        { re: /photocard/i, weight: 80 },
        { re: /album/i, weight: 70 },
        { re: /merchandise/i, weight: 60 },
        { re: /\bmd\b/i, weight: 50 },
        { re: /응원봉/, weight: 80 },
      ],
    },
    {
      key: "k-food",
      patterns: [
        { re: /k-?\s*food/i, weight: 120 },
        { re: /식품/, weight: 110 },
        { re: /\bfood\b/i, weight: 80 },
        { re: /snack/i, weight: 70 },
        { re: /ramen/i, weight: 70 },
        { re: /grocery/i, weight: 70 },
        { re: /sauce/i, weight: 60 },
        { re: /김치/, weight: 70 },
        { re: /라면/, weight: 70 },
        { re: /간식/, weight: 70 },
      ],
    },
    {
      key: "lifestyle",
      patterns: [
        { re: /lifestyle/i, weight: 120 },
        { re: /라이프/, weight: 120 },
        { re: /home\s*living/i, weight: 100 },
        { re: /kitchen\s*(?:and|&)?\s*living/i, weight: 100 },
        { re: /\bliving\b/i, weight: 85 },
        { re: /home\s*decor/i, weight: 80 },
        { re: /stationery/i, weight: 80 },
        { re: /\bkitchen\b/i, weight: 70 },
        { re: /생활/, weight: 90 },
      ],
    },
    {
      key: "beauty",
      patterns: [
        { re: /k-?\s*beauty/i, weight: 120 },
        { re: /\bbeauty\b/i, weight: 110 },
        { re: /뷰티/, weight: 110 },
        { re: /skincare/i, weight: 80 },
        { re: /skin\s*care/i, weight: 80 },
        { re: /cosmetic/i, weight: 80 },
        { re: /makeup/i, weight: 80 },
        { re: /메이크업/, weight: 80 },
        { re: /스킨케어/, weight: 80 },
        { re: /serum/i, weight: 55 },
        { re: /ampoule/i, weight: 55 },
        { re: /toner/i, weight: 55 },
        { re: /moisturizer/i, weight: 55 },
        { re: /cleanser/i, weight: 55 },
        { re: /sunscreen/i, weight: 55 },
        { re: /suncare/i, weight: 55 },
        { re: /hair\s*care/i, weight: 55 },
        { re: /body\s*care/i, weight: 50 },
        { re: /fragrance/i, weight: 50 },
      ],
    },
  ];

  const normalize = (value) =>
    String(value || "")
      .toLocaleLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const normalizeCategory = (value) => {
    const key = normalize(value)
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return CATEGORY_KEYS.includes(key) ? key : "";
  };

  const matchCategory = (text) => {
    const source = String(text || "");
    if (!source.trim()) return "";

    const exact = normalizeCategory(source);
    if (exact) return exact;

    let bestKey = "";
    let bestScore = 0;

    CATEGORY_PATTERNS.forEach((entry) => {
      entry.patterns.forEach(({ re, weight }) => {
        const matched = source.match(re);
        if (!matched) return;
        const score = weight + matched[0].length;
        if (score > bestScore) {
          bestScore = score;
          bestKey = entry.key;
        }
      });
    });

    return bestKey;
  };

  const resolveCategory = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (CATEGORY_KEYS.includes(raw)) return raw;
    return matchCategory(raw) || normalizeCategory(raw);
  };

  const mapLimit = async (items, limit, mapper) => {
    const results = new Array(items.length);
    let nextIndex = 0;

    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await mapper(items[index], index);
      }
    });

    await Promise.all(workers);
    return results;
  };

  const cards = Array.from(page.querySelectorAll(".bo-wish-card"));
  const tabs = page.querySelector(".bo-wishlist-tabs");
  const listWrap =
    page.querySelector(".bo-wishlist-list-wrap") ||
    page.querySelector(".bo-wishlist-grid")?.parentElement;
  let activeFilter = tabs?.querySelector("button.is-active")?.dataset.wishFilter || "all";
  let categoriesReady = false;

  const emptyResult = document.createElement("div");
  emptyResult.className = "bo-wishlist-filter-empty";
  emptyResult.textContent = "No matching wishlist items.";
  emptyResult.hidden = true;
  if (listWrap && !listWrap.querySelector(".bo-wishlist-filter-empty")) {
    listWrap.append(emptyResult);
  }

  const setCardVisibility = (card, isVisible) => {
    card.classList.toggle("is-filtered-out", !isVisible);
    if (isVisible) card.removeAttribute("hidden");
    else card.setAttribute("hidden", "");
  };

  const applyFilters = () => {
    let visibleCount = 0;

    cards.forEach((card) => {
      const category = resolveCategory(card.dataset.wishCategory);
      const show =
        activeFilter === "all" ||
        (!categoriesReady && !category) ||
        category === activeFilter;

      setCardVisibility(card, show);
      if (show) visibleCount += 1;
    });

    if (!categoriesReady && activeFilter !== "all") {
      emptyResult.textContent = "Loading wishlist categories...";
      emptyResult.hidden = visibleCount > 0;
      return;
    }

    emptyResult.textContent = "No matching wishlist items.";
    emptyResult.hidden = visibleCount > 0 || cards.length === 0;
  };

  const syncTabs = () => {
    tabs?.querySelectorAll("button[data-wish-filter]").forEach((tab) => {
      const isActive = (tab.dataset.wishFilter || "all") === activeFilter;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-pressed", String(isActive));
    });
  };

  tabs?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-wish-filter]");
    if (!button || !tabs.contains(button)) return;
    event.preventDefault();
    activeFilter = button.dataset.wishFilter || "all";
    syncTabs();
    applyFilters();
  });

  const productRequests = new Map();

  const fetchProductPage = (url) => {
    if (!url) return Promise.resolve(null);
    if (productRequests.has(url)) return productRequests.get(url);
    const request = fetch(url, {
      credentials: "same-origin",
      headers: { Accept: "text/html" },
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return new DOMParser().parseFromString(await response.text(), "text/html");
      })
      .catch(() => null);
    productRequests.set(url, request);
    return request;
  };

  const readBrandFromPage = (documentPage) => {
    if (!documentPage) return "";
    const metaBrand = documentPage.querySelector('meta[property$=":brand"]')?.content?.trim();
    if (metaBrand) return metaBrand;
    const brandLink = documentPage.querySelector('a[href*="/goods/brand?code="]');
    if (brandLink?.textContent.trim()) return brandLink.textContent.trim();
    const productName = documentPage.querySelector("h3.name")?.textContent?.trim() || "";
    const bracketBrand = productName.match(/^\[([^\]]+)\]/);
    return bracketBrand ? bracketBrand[1].trim() : "";
  };

  const cleanCrumbText = (text) =>
    String(text || "")
      .replace(/\s+/g, " ")
      .trim();

  const isNoiseCrumb = (text) =>
    /^(home|홈|main|shop|store|wishlist|cart|my\s*page|account)$/i.test(text);

  // Prefer product breadcrumbs over global header/mega-menu catalog links.
  const collectBreadcrumbTexts = (documentPage) => {
    if (!documentPage) return [];
    const selectors = [
      ".navi_linemap a",
      ".navi_linemap2 a",
      ".navi_linemap2 .selected_cate",
      ".structure_nav a",
      ".goods_category a",
      ".category_path a",
      ".breadcrumb a",
      ".location a",
      ".goods_nav a",
      ".linemap_area a",
    ];
    const seen = new Set();
    const crumbs = [];

    selectors.forEach((selector) => {
      documentPage.querySelectorAll(selector).forEach((element) => {
        const text = cleanCrumbText(element.textContent);
        if (!text || isNoiseCrumb(text) || seen.has(text)) return;
        seen.add(text);
        crumbs.push(text);
      });
    });

    return crumbs;
  };

  const readCategoryFromPage = (documentPage) => {
    const crumbs = collectBreadcrumbTexts(documentPage);
    // Deepest crumb first (usually the leaf category).
    for (let index = crumbs.length - 1; index >= 0; index -= 1) {
      const matched = matchCategory(crumbs[index]);
      if (matched) return matched;
    }
    if (crumbs.length) {
      const joined = matchCategory(crumbs.join(" > "));
      if (joined) return joined;
    }
    return "";
  };

  const buildHeaderCategoryCodeMap = () => {
    const map = new Map();
    document.querySelectorAll(".category-nav a[href*='/goods/catalog'], .category-menu a[href*='/goods/catalog'], #category a[href*='/goods/catalog'], .gnb a[href*='/goods/catalog']").forEach((link) => {
      try {
        const url = new URL(link.href, window.location.origin);
        const code = url.searchParams.get("code") || "";
        const key = matchCategory(link.textContent);
        if (code && key) map.set(code, key);
      } catch {
        // Ignore invalid header links.
      }
    });

    // Fallback: top-level nav labels only (avoid mega-menu leaf noise).
    if (!map.size) {
      document.querySelectorAll('a[href*="/goods/catalog"]').forEach((link) => {
        try {
          const label = cleanCrumbText(link.textContent);
          const key = normalizeCategory(label) || matchCategory(label);
          const url = new URL(link.href, window.location.origin);
          const code = url.searchParams.get("code") || "";
          if (!code || !key) return;
          if (!CATEGORY_KEYS.includes(key)) return;
          if (
            /^(beauty|k-?food|lifestyle|k-?pop|k-?traditional)$/i.test(label) ||
            /뷰티|식품|라이프|케이\s*팝|전통/.test(label)
          ) {
            map.set(code, key);
          }
        } catch {
          // Ignore invalid header links.
        }
      });
    }

    return map;
  };

  const headerCategoryCodes = buildHeaderCategoryCodeMap();

  const readCategoryFromCodes = (documentPage) => {
    if (!documentPage || !headerCategoryCodes.size) return "";

    const candidates = [];
    documentPage
      .querySelectorAll(
        ".navi_linemap a[href*='/goods/catalog'], .navi_linemap2 a[href*='/goods/catalog'], .structure_nav a[href*='/goods/catalog'], .breadcrumb a[href*='/goods/catalog'], .category_path a[href*='/goods/catalog']",
      )
      .forEach((link) => {
        try {
          const url = new URL(link.href, window.location.origin);
          const code = url.searchParams.get("code") || "";
          if (code) candidates.push(code);
        } catch {
          // Ignore invalid catalog links.
        }
      });

    for (const code of candidates) {
      if (headerCategoryCodes.has(code)) return headerCategoryCodes.get(code);
    }

    for (const code of candidates) {
      let bestKey = "";
      let bestLen = 0;
      headerCategoryCodes.forEach((key, mappedCode) => {
        if (!mappedCode || mappedCode.length <= bestLen) return;
        if (code === mappedCode || code.startsWith(mappedCode)) {
          bestKey = key;
          bestLen = mappedCode.length;
        }
      });
      if (bestKey) return bestKey;
    }

    return "";
  };

  const seedCardCategory = (card) => {
    const seedText =
      card.querySelector(".bo-wish-card__category-seed")?.textContent ||
      card.dataset.wishCategory ||
      "";
    const category = resolveCategory(seedText);
    card.dataset.wishCategory = category || "";
  };

  const hydrateCards = async () => {
    const brandElements = cards
      .map((card) => card.querySelector(".bo-wish-card__brand"))
      .filter(Boolean);

    const elementsByCode = new Map();
    brandElements.forEach((element) => {
      if (element.textContent.trim()) return;
      const code = element.dataset.brandCode || element.dataset.brand;
      if (!code) return;
      const list = elementsByCode.get(String(code)) || [];
      list.push(element);
      elementsByCode.set(String(code), list);
    });

    if (elementsByCode.size) {
      try {
        const response = await fetch("/goods/get_brand_list", {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        });
        if (response.ok) {
          const brands = await response.json();
          if (Array.isArray(brands)) {
            brands.forEach((brand) => {
              const elements = elementsByCode.get(String(brand.brand_code || ""));
              if (!elements || !brand.brand_name) return;
              elements.forEach((element) => {
                element.textContent = brand.brand_name;
              });
            });
          }
        }
      } catch {
        // Fall through to product-page lookup.
      }
    }

    await mapLimit(cards, FETCH_CONCURRENCY, async (card) => {
      seedCardCategory(card);

      const brand = card.querySelector(".bo-wish-card__brand");
      const needsBrand = Boolean(brand && !brand.textContent.trim());
      const goodsSeq = card.dataset.goodsSeq || "";
      const productUrl =
        card.querySelector(".bo-wish-card__media > a")?.href ||
        card.querySelector('a[href*="/goods/view"]')?.href ||
        (goodsSeq ? `/goods/view?no=${encodeURIComponent(goodsSeq)}` : "");
      if (!productUrl) return;

      const documentPage = await fetchProductPage(productUrl);
      if (!documentPage) return;

      if (needsBrand) {
        const brandName = readBrandFromPage(documentPage);
        if (brandName) brand.textContent = brandName;
      }

      // Prefer product breadcrumbs/codes over seed keyword guesses (avoids Beauty false positives).
      const pageCategory =
        readCategoryFromPage(documentPage) || readCategoryFromCodes(documentPage);
      if (pageCategory) card.dataset.wishCategory = pageCategory;
    });

    categoriesReady = true;
    applyFilters();
  };

  cards.forEach(seedCardCategory);
  syncTabs();
  applyFilters();
  hydrateCards();
})();
