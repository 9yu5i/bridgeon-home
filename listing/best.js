(() => {
  const page = document.body;
  if (!page.classList.contains("listing-page--best")) return;

  const grid = document.querySelector("[data-best-grid]");
  const sentinel = document.querySelector("[data-best-sentinel]");
  const tabs = document.querySelector("[data-best-tabs]");
  if (!grid || !sentinel) return;

  const TOTAL_PRODUCTS = 100;
  const LOAD_SIZE = 20;
  let activeCategory = "all";
  let observer = null;

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
    },
  ];

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const getCategoryProducts = () => {
    if (activeCategory === "all") return products;
    return products.filter((product) => product.category === activeCategory);
  };

  const getProduct = (index) => {
    const categoryProducts = getCategoryProducts();
    const base = categoryProducts[index % categoryProducts.length] || products[index % products.length];
    return {
      ...base,
      rank: index + 1,
    };
  };

  const PRODUCT_DETAIL_OPTIONS_HREF = "../product-detail/product-detail-options.html";

  const createCard = (product) => {
    const article = document.createElement("article");
    article.className = "listing-card listing-card--ranked";
    article.dataset.rank = String(product.rank);
    if (product.rank === 2) {
      article.dataset.productDetailLink = PRODUCT_DETAIL_OPTIONS_HREF;
    }
    article.innerHTML = `
      <div class="listing-card-media">
        <span class="listing-card-rank" aria-label="Rank ${product.rank}">${product.rank}</span>
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

  let loaded = 0;
  let isLoading = false;

  const updateStatus = () => {
    sentinel.hidden = loaded >= TOTAL_PRODUCTS;
  };

  const loadNextProducts = () => {
    if (isLoading || loaded >= TOTAL_PRODUCTS) return;
    isLoading = true;

    const nextCount = Math.min(LOAD_SIZE, TOTAL_PRODUCTS - loaded);
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < nextCount; i += 1) {
      fragment.appendChild(createCard(getProduct(loaded + i)));
    }

    grid.appendChild(fragment);
    loaded += nextCount;
    updateStatus();
    isLoading = false;
  };

  const createObserver = () => {
    if (!("IntersectionObserver" in window)) return null;

    return new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadNextProducts();
        if (loaded >= TOTAL_PRODUCTS) observer.disconnect();
      },
      { rootMargin: "600px 0px" },
    );
  };

  const resetProducts = () => {
    loaded = 0;
    isLoading = false;
    grid.replaceChildren();
    loadNextProducts();
    observer?.disconnect();
    observer = createObserver();
    observer?.observe(sentinel);
  };

  tabs?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-best-category]");
    if (!button || !tabs.contains(button)) return;

    activeCategory = button.dataset.bestCategory || "all";
    tabs.querySelectorAll("[data-best-category]").forEach((tab) => {
      const isActive = tab === button;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    resetProducts();
  });

  resetProducts();

  if (!("IntersectionObserver" in window)) {
    const onScroll = () => {
      const distanceToBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      if (distanceToBottom < 700) loadNextProducts();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
