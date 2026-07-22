(() => {
  const page = document.body;
  if (!page.classList.contains("listing-page--search")) return;

  const grid = document.querySelector("[data-search-grid]");
  const emptyState = document.querySelector("[data-search-empty]");
  const queryNode = document.querySelector("[data-search-query]");
  const countNode = document.querySelector("[data-search-count]");
  const countMobileNode = document.querySelector("[data-search-count-mobile]");
  if (!grid || !queryNode) return;

  const searchQuery = String(new URLSearchParams(window.location.search).get("q") || "")
    .replace(/\s+/g, " ")
    .trim();

  const products = [
    {
      category: "beauty",
      brand: "Anua",
      name: "PDRN Hyaluronic Acid Hydrating Capsule Mist 100ml",
      rating: "4.8",
      reviews: "1,256",
      price: "US$18.40",
      originalPrice: "US$24.00",
      tone: "green",
      tags: ["mist", "hydration", "serum"],
    },
    {
      category: "beauty",
      brand: "numbuzin",
      name: "No.3 PHA Skin Prep Bubble Mask 90ml",
      rating: "4.9",
      reviews: "842",
      price: "US$22.00",
      originalPrice: "US$31.00",
      tone: "pink",
      tags: ["mask", "numbuzin serum", "serum"],
    },
    {
      category: "beauty",
      brand: "numbuzin",
      name: "No.5 Vitamin Spotlight Serum 30ml",
      rating: "4.8",
      reviews: "1,088",
      price: "US$19.20",
      originalPrice: "US$27.00",
      tone: "cream",
      tags: ["vitamin c serum", "serum", "brightening"],
    },
    {
      category: "beauty",
      brand: "Celimax",
      name: "Retinal Shot Tightening Booster 15ml",
      rating: "4.7",
      reviews: "635",
      price: "US$18.48",
      originalPrice: "US$26.00",
      tone: "blue",
      tags: ["serum", "anti-aging"],
    },
    {
      category: "beauty",
      brand: "medicube",
      name: "PDRN Pink Collagen Capsule Cream 55g",
      rating: "4.8",
      reviews: "1,104",
      price: "US$28.00",
      originalPrice: "US$36.00",
      tone: "skin",
      tags: ["collagen cream", "collagen", "cream", "mediube"],
    },
    {
      category: "beauty",
      brand: "medicube",
      name: "Zero Pore Pad 2.0 70 sheets",
      rating: "4.7",
      reviews: "532",
      price: "US$19.90",
      originalPrice: "US$28.00",
      tone: "mint",
      tags: ["toning pads", "pads", "pore", "mediube"],
    },
    {
      category: "beauty",
      brand: "COSRX",
      name: "Advanced Snail 96 Mucin Power Essence 100ml",
      rating: "4.9",
      reviews: "2,104",
      price: "US$21.00",
      originalPrice: "US$29.00",
      tone: "mint",
      tags: ["essence", "serum"],
    },
    {
      category: "beauty",
      brand: "Anua",
      name: "Heartleaf 77% Soothing Toner 250ml",
      rating: "4.8",
      reviews: "986",
      price: "US$18.50",
      originalPrice: "US$26.00",
      tone: "lavender",
      tags: ["anua toner", "toner", "soothing"],
    },
    {
      category: "beauty",
      brand: "Torriden",
      name: "Dive-In Serum 50ml",
      rating: "4.9",
      reviews: "1,492",
      price: "US$15.50",
      originalPrice: "US$24.00",
      tone: "aqua",
      tags: ["serum", "hydration"],
    },
    {
      category: "beauty",
      brand: "Beauty of Joseon",
      name: "Relief Sun Rice + Probiotics SPF50+ 50ml",
      rating: "4.8",
      reviews: "1,879",
      price: "US$16.80",
      originalPrice: "US$24.00",
      tone: "cream",
      tags: ["sunscreen", "sun", "spf"],
    },
    {
      category: "beauty",
      brand: "Isntree",
      name: "Hyaluronic Acid Watery Sun Gel SPF50+ 50ml",
      rating: "4.9",
      reviews: "2,241",
      price: "US$17.40",
      originalPrice: "US$25.00",
      tone: "aqua",
      tags: ["sunscreen", "sun", "spf"],
    },
    {
      category: "beauty",
      brand: "rom&nd",
      name: "Juicy Lasting Tint 5.5g",
      rating: "4.8",
      reviews: "3,012",
      price: "US$12.80",
      originalPrice: "US$18.00",
      tone: "pink",
      tags: ["lip tint", "tint", "lip"],
    },
    {
      category: "beauty",
      brand: "Peripera",
      name: "Ink Mood Glowy Tint 4g",
      rating: "4.7",
      reviews: "1,564",
      price: "US$11.50",
      originalPrice: "US$16.00",
      tone: "skin",
      tags: ["lip tint", "tint", "lip"],
    },
    {
      category: "beauty",
      brand: "mediheal",
      name: "Madecassoside Blemish Pad 100 sheets",
      rating: "4.8",
      reviews: "1,220",
      price: "US$18.90",
      originalPrice: "US$26.00",
      tone: "green",
      tags: ["toning pads", "pads"],
    },
    {
      category: "k-food",
      brand: "Samyang",
      name: "Buldak Carbonara Hot Chicken Ramen 5 Pack",
      rating: "4.9",
      reviews: "3,412",
      price: "US$9.80",
      originalPrice: "US$14.00",
      tone: "pink",
      tags: ["ramen", "spicy", "snack"],
    },
    {
      category: "k-food",
      brand: "Binggrae",
      name: "Banana Flavored Milk Drink 200ml",
      rating: "4.8",
      reviews: "1,732",
      price: "US$2.20",
      originalPrice: "US$3.00",
      tone: "cream",
      tags: ["milk", "drink"],
    },
    {
      category: "lifestyle",
      brand: "Romane",
      name: "Brunch Brother Desk Organizer",
      rating: "4.7",
      reviews: "514",
      price: "US$12.40",
      originalPrice: "US$18.00",
      tone: "lavender",
      tags: ["desk", "stationery"],
    },
    {
      category: "lifestyle",
      brand: "Monami",
      name: "Plus Pen 3000 Color Set",
      rating: "4.8",
      reviews: "806",
      price: "US$7.90",
      originalPrice: "US$11.00",
      tone: "green",
      tags: ["pen", "stationery"],
    },
    {
      category: "k-pop",
      brand: "BTS",
      name: "Official Photocard Binder",
      rating: "4.9",
      reviews: "2,018",
      price: "US$18.00",
      originalPrice: "US$25.00",
      tone: "blue",
      tags: ["photocard", "album", "goods"],
    },
    {
      category: "k-pop",
      brand: "NewJeans",
      name: "Album Bag Charm Goods",
      rating: "4.8",
      reviews: "1,184",
      price: "US$16.50",
      originalPrice: "US$24.00",
      tone: "skin",
      tags: ["charm", "album", "goods"],
    },
    {
      category: "k-traditional",
      brand: "K-Heritage",
      name: "Mother of Pearl Bookmark Set",
      rating: "4.8",
      reviews: "689",
      price: "US$11.20",
      originalPrice: "US$16.00",
      tone: "mint",
      tags: ["gift", "traditional"],
    },
    {
      category: "k-traditional",
      brand: "Seoul Craft",
      name: "Traditional Palace Miniature Ornament",
      rating: "4.9",
      reviews: "927",
      price: "US$28.00",
      originalPrice: "US$39.00",
      tone: "aqua",
      tags: ["ornament", "traditional", "gift"],
    },
  ];

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const normalize = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const getSearchTerms = (query) => normalize(query).split(" ").filter(Boolean);

  const productMatches = (product, terms) => {
    if (!terms.length) return false;
    const haystack = normalize(
      [product.brand, product.name, product.category, ...(product.tags || [])].join(" ")
    );
    return terms.every((term) => haystack.includes(term));
  };

  const matchedProducts = (() => {
    const terms = getSearchTerms(searchQuery);
    if (!terms.length) return [];
    return products.filter((product) => productMatches(product, terms));
  })();

  const createCard = (product) => {
    const article = document.createElement("article");
    article.className = "listing-card";
    article.innerHTML = `
      <div class="listing-card-media">
        <div class="listing-card-image listing-card-image--${escapeHtml(product.tone)}" aria-hidden="true"></div>
        <button type="button" class="listing-card-wish" aria-label="Add to wishlist" aria-pressed="false"></button>
      </div>
      <div class="listing-card-body">
        <p class="listing-card-brand">${escapeHtml(product.brand)}</p>
        <h3 class="listing-card-title">${escapeHtml(product.name)}</h3>
        <p class="listing-card-rating"><img src="../img/listing/star.png" alt="" aria-hidden="true" class="listing-card-rating-star" width="12" height="12"> ${escapeHtml(product.rating)} <span>(${escapeHtml(product.reviews)})</span></p>
        <p class="listing-card-price"><strong>${escapeHtml(product.price)}</strong> <del>${escapeHtml(product.originalPrice)}</del></p>
      </div>
      <div class="listing-card-actions listing-card-actions--desktop">
        <button type="button" aria-label="Add to cart"></button>
        <button type="button" class="listing-card-wish-inline" aria-label="Add to wishlist" aria-pressed="false"></button>
      </div>
      <button type="button" class="listing-card-cart mobile-only" aria-label="Add to cart"></button>
    `;
    return article;
  };

  const parsePrice = (value) => Number(String(value || "").replace(/[^0-9.]/g, "")) || 0;
  const parseRating = (value) => Number(value) || 0;

  const sortProducts = (items, sortLabel) => {
    const next = items.slice();
    switch (sortLabel) {
      case "Price: Low to High":
        next.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        break;
      case "Price: High to Low":
        next.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        break;
      case "Top Rated":
        next.sort((a, b) => parseRating(b.rating) - parseRating(a.rating));
        break;
      case "Newest":
        next.reverse();
        break;
      default:
        break;
    }
    return next;
  };

  const renderProducts = (items) => {
    grid.replaceChildren(...items.map(createCard));
    window.BridgeOn?.wishlist?.syncButtons?.(grid);
  };

  const displayQuery = searchQuery || "Search";
  const hasResults = matchedProducts.length > 0;

  queryNode.textContent = displayQuery;
  document.title = hasResults ? `${displayQuery} | BridgeOn` : `No results for ${displayQuery} | BridgeOn`;
  page.classList.toggle("is-search-empty", !hasResults);

  document.querySelectorAll("#site-search, #mobile-site-search").forEach((input) => {
    input.value = searchQuery;
  });
  document.querySelectorAll(".search-mobile-input").forEach((wrap) => {
    wrap.classList.toggle("is-filled", Boolean(searchQuery));
  });

  const countLabel = `(${matchedProducts.length.toLocaleString("en-US")})`;
  if (countNode) countNode.textContent = countLabel;
  if (countMobileNode) countMobileNode.textContent = String(matchedProducts.length);

  renderProducts(matchedProducts);

  const sortSelect = document.querySelector("[data-search-sort]");
  sortSelect?.addEventListener("change", () => {
    renderProducts(sortProducts(matchedProducts, sortSelect.value));
  });

  if (emptyState) {
    emptyState.hidden = hasResults;
    const emptyQuery = emptyState.querySelector("[data-search-empty-query]");
    if (emptyQuery) emptyQuery.textContent = `“${displayQuery}”`;
  }

  document.querySelector("[data-search-empty-retry]")?.addEventListener("click", () => {
    const trigger =
      document.querySelector(".header-actions .icon-button.is-header-search-trigger") ||
      document.querySelector("[data-mobile-search-open]");
    if (trigger) {
      trigger.click();
      return;
    }
    document.querySelector("#site-search")?.focus({ preventScroll: true });
  });
})();
