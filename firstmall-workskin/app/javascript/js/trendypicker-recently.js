/**
 * TrendyPicker Recently Viewed
 * /goods/recently → goods/recently.html
 * Same structure/behavior as mypage/wish.html (trendypicker-wishlist.js) —
 * mirrored here under recently-scoped classes and native endpoints.
 *
 * 1. Guard: .bo-recently-page
 * 2. Category tabs via seed + product-page breadcrumbs/codes
 * 3. Brand hydrate from get_brand_list / goods view
 */
(() => {
  const page = document.querySelector(".bo-recently-page");
  if (!page) return;

  const CATEGORY_KEYS = ["beauty", "k-food", "lifestyle", "k-pop", "k-traditional"];
  const FETCH_CONCURRENCY = 4;

  // The recently-viewed record carries no category or brand, and Firstmall
  // exposes no lookup for them, so the only source is the product page
  // breadcrumb (see readCategoryFromPage below) — one ~200 kB document per
  // card. Two things keep that cost off the shopper's back: this cache, and
  // the partial read in fetchProductPage.
  //
  // localStorage rather than sessionStorage on purpose: a product's category
  // and brand are the same on every visit, so the fetch should be paid once
  // per product per browser, not once per tab. Shared with
  // trendypicker-wishlist.js — same product catalog either way.
  const PRODUCT_FACTS_KEY = "bo-product-facts-v1";
  const PRODUCT_FACTS_LIMIT = 600;

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
        // Oldest-first trim: insertion order is resolve order.
        keys.slice(0, Math.max(0, keys.length - PRODUCT_FACTS_LIMIT)).forEach((key) => {
          delete productFacts[key];
        });
        localStorage.setItem(PRODUCT_FACTS_KEY, JSON.stringify(productFacts));
      } catch {
        // Storage full/unavailable — the cache is a nice-to-have, not required.
      }
    }, 200);
  };

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

  const cards = Array.from(page.querySelectorAll(".bo-recently-card"));
  const tabs = page.querySelector(".bo-recently-tabs");
  const listWrap =
    page.querySelector(".bo-recently-list-wrap") ||
    page.querySelector(".bo-recently-grid")?.parentElement;
  let activeFilter = tabs?.querySelector("button.is-active")?.dataset.recentlyFilter || "all";
  let categoriesReady = false;

  const emptyResult = document.createElement("div");
  emptyResult.className = "bo-recently-filter-empty";
  emptyResult.textContent = "No matching recently viewed items.";
  emptyResult.hidden = true;
  if (listWrap && !listWrap.querySelector(".bo-recently-filter-empty")) {
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
      const category = resolveCategory(card.dataset.recentlyCategory);
      // Only show a card once its category is actually known and matches —
      // showing not-yet-hydrated cards by default (old behavior) meant
      // clicking e.g. "Beauty" briefly showed every other category too,
      // until each card's product page finished loading and it got hidden.
      const show = activeFilter === "all" || category === activeFilter;

      setCardVisibility(card, show);
      if (show) visibleCount += 1;
    });

    if (!categoriesReady && activeFilter !== "all") {
      emptyResult.textContent = "Loading categories...";
      emptyResult.hidden = visibleCount > 0;
      return;
    }

    emptyResult.textContent = "No matching recently viewed items.";
    emptyResult.hidden = visibleCount > 0 || cards.length === 0;
  };

  const syncTabs = () => {
    tabs?.querySelectorAll("button[data-recently-filter]").forEach((tab) => {
      const isActive = (tab.dataset.recentlyFilter || "all") === activeFilter;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-pressed", String(isActive));
    });
  };

  tabs?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-recently-filter]");
    if (!button || !tabs.contains(button)) return;
    event.preventDefault();
    activeFilter = button.dataset.recentlyFilter || "all";
    syncTabs();
    applyFilters();
    if (activeFilter !== "all") void ensureCardsHydrated();
  });

  const productRequests = new Map();

  // Everything this file reads from a product page — the breadcrumb and the
  // product name — sits in roughly the first half of the document, so the
  // response is read as a stream and cancelled once both have arrived instead
  // of downloading the tail (product description, reviews, related items).
  const BREADCRUMB_MARKER = "navi_linemap";
  const NAME_CLOSE_MARKER = "</h3>";
  const PARTIAL_READ_LIMIT = 160000;

  const readProductHtml = async (url, signal) => {
    const response = await fetch(url, {
      credentials: "same-origin",
      headers: { Accept: "text/html" },
      signal,
    });
    if (!response.ok) return "";
    if (!response.body?.getReader) return response.text();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let html = "";
    let breadcrumbAt = -1;

    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
        if (breadcrumbAt < 0) breadcrumbAt = html.indexOf(BREADCRUMB_MARKER);
        // The product name closes after the breadcrumb, so its closing tag is
        // the point where nothing useful is left to read.
        const complete = breadcrumbAt >= 0 && html.indexOf(NAME_CLOSE_MARKER, breadcrumbAt) >= 0;
        if (complete || html.length > PARTIAL_READ_LIMIT) break;
      }
    } finally {
      reader.cancel().catch(() => {});
    }

    return html;
  };

  const fetchProductPage = (url) => {
    if (!url) return Promise.resolve(null);
    if (productRequests.has(url)) return productRequests.get(url);
    const controller = new AbortController();
    const request = readProductHtml(url, controller.signal)
      .then((html) => (html ? new DOMParser().parseFromString(html, "text/html") : null))
      .catch(() => null)
      .finally(() => controller.abort());
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

    // An exact top-level category name anywhere in the trail wins outright,
    // before any fuzzy guessing. Otherwise a leaf label reused under more
    // than one top-level tree (e.g. "Stationery" exists under both
    // Lifestyle and K-Traditional; "Kitchen"/"Health"/"Supplements" the
    // same way) can out-vote the trail's own unambiguous top-level crumb —
    // that's how "K-Traditional > Stationery" was landing in Lifestyle.
    for (const crumb of crumbs) {
      const exact = normalizeCategory(crumb);
      if (exact) return exact;
    }

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
      card.querySelector(".bo-recently-card__category-seed")?.textContent ||
      card.dataset.recentlyCategory ||
      "";
    const category = resolveCategory(seedText);
    card.dataset.recentlyCategory = category || "";
  };

  const hydrateCards = async () => {
    const brandElements = cards
      .map((card) => card.querySelector(".bo-recently-card__brand"))
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

      const brand = card.querySelector(".bo-recently-card__brand");
      const goodsSeq = card.dataset.goodsSeq || "";
      const cached = (goodsSeq && productFacts[goodsSeq]) || null;
      let needsBrand = Boolean(brand && !brand.textContent.trim());

      if (cached?.brand && needsBrand) {
        brand.textContent = cached.brand;
        needsBrand = false;
      }

      // Already resolved this goods_seq on an earlier visit and don't need
      // brand text either — skip the fetch entirely.
      if (cached?.category && !needsBrand) {
        card.dataset.recentlyCategory = cached.category;
        applyFilters();
        return;
      }

      const productUrl =
        card.querySelector(".bo-recently-card__media > a")?.href ||
        card.querySelector('a[href*="/goods/view"]')?.href ||
        (goodsSeq ? `/goods/view?no=${encodeURIComponent(goodsSeq)}` : "");
      if (!productUrl) return;

      const documentPage = await fetchProductPage(productUrl);
      if (!documentPage) return;

      const facts = goodsSeq ? productFacts[goodsSeq] || (productFacts[goodsSeq] = {}) : {};

      if (needsBrand) {
        const brandName = readBrandFromPage(documentPage);
        if (brandName) {
          brand.textContent = brandName;
          facts.brand = brandName;
        }
      }

      // Prefer product breadcrumbs/codes over seed keyword guesses (avoids Beauty false positives).
      const pageCategory =
        cached?.category || readCategoryFromPage(documentPage) || readCategoryFromCodes(documentPage);
      if (pageCategory) {
        card.dataset.recentlyCategory = pageCategory;
        facts.category = pageCategory;
        applyFilters();
      }

      if (goodsSeq) writeProductFacts();
    });

    categoriesReady = true;
    applyFilters();
  };

  // Thumbnails come first. Product-page reads are heavy enough that starting
  // them mid-load leaves the grid showing empty image boxes, so hold them
  // until the page has finished loading its own assets.
  const afterPageLoad = () =>
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));

  let cardsHydrationPromise = null;
  const ensureCardsHydrated = () => {
    if (!cardsHydrationPromise) cardsHydrationPromise = afterPageLoad().then(hydrateCards);
    return cardsHydrationPromise;
  };

  cards.forEach(seedCardCategory);
  syncTabs();
  applyFilters();
  // Keep the server-rendered "All" list immediately usable. Product pages are
  // fetched only if the shopper asks for category filtering; eager N-page
  // hydration competed with thumbnails and made the page feel slow.
})();
