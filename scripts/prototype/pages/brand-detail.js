(() => {
  const page = document.body;
  if (!page.classList.contains("brand-detail-page")) return;

  const nameNode = document.querySelector("[data-brand-name]");
  const taglineNode = document.querySelector("[data-brand-tagline]");
  const introNode = document.querySelector("[data-brand-intro]");
  const breadcrumbNode = document.querySelector("[data-brand-breadcrumb]");
  const heroMedia = document.querySelector("[data-brand-hero]");
  const aboutImage = document.querySelector("[data-brand-image]");
  const tabsRoot = document.querySelector("[data-brand-category-tabs]");
  const gridRoot = document.querySelector("[data-brand-grid]");
  const emptyState = document.querySelector("[data-brand-empty]");
  const countNode = document.querySelector("[data-brand-count]");
  const countMobileNode = document.querySelector("[data-brand-count-mobile]");
  const sortSelect = document.querySelector("[data-brand-sort]");

  if (!nameNode || !gridRoot || !tabsRoot) return;

  const slugify = (name) =>
    String(name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const brandProfiles = {
    anua: {
      name: "Anua",
      tagline: "Gentle routines for sensitive, stressed skin.",
      intro:
        "Anua focuses on calming K-beauty essentials built around heartleaf and barrier care. Soft textures, clear routines, and everyday soothing formulas make it a favorite for sensitive-skin shoppers.",
      tone: "green",
    },
    numbuzin: {
      name: "numbuzin",
      tagline: "Numbered solutions for every skin moment.",
      intro:
        "numbuzin organizes skincare by clear numbered steps, so shoppers can build routines with less guesswork. From prep masks to spotlight serums, each formula targets a specific skin need.",
      tone: "pink",
    },
    medicube: {
      name: "medicube",
      tagline: "Clinic-inspired care for visible glow.",
      intro:
        "medicube blends dermatology-inspired textures with trend-forward K-beauty design. Expect collagen-rich creams, pore-care pads, and high-impact formulas made for daily glow routines.",
      tone: "pink",
    },
    cosrx: {
      name: "COSRX",
      tagline: "Simple, effective, no-nonsense skincare.",
      intro:
        "COSRX is known for clean ingredient stories and cult essentials. From snail mucin to calming toners, the brand keeps routines minimal while delivering reliable results.",
      tone: "mint",
    },
    "beauty-of-joseon": {
      name: "Beauty of Joseon",
      tagline: "Heritage beauty, modern textures.",
      intro:
        "Beauty of Joseon mixes traditional Korean ingredients with modern sunscreen and serum formats. Soft packaging and wearable daily formulas define the brand mood.",
      tone: "cream",
    },
    celimax: {
      name: "Celimax",
      tagline: "Targeted boosters for refined skin.",
      intro:
        "Celimax builds compact, high-performance skincare for shoppers who want clear benefits in a few steps. Lightweight textures and focused actives sit at the center of the line.",
      tone: "blue",
    },
    torriden: {
      name: "Torriden",
      tagline: "Dive into deep, lightweight hydration.",
      intro:
        "Torriden specializes in watery hydration that still feels fresh on skin. Serums and gels in the Dive-In family are designed for plump moisture without heaviness.",
      tone: "blue",
    },
    "rom-nd": {
      name: "rom&nd",
      tagline: "Playful color with lasting tint payoffs.",
      intro:
        "rom&nd is a color-beauty favorite for juicy tints, soft blush moments, and wearable everyday makeup. The mood is fresh, youthful, and trend-aware.",
      tone: "pink",
    },
    isntree: {
      name: "Isntree",
      tagline: "Hydration-first sun and skincare.",
      intro:
        "Isntree leans into hyaluronic care and watery sun gels that fit easily into K-beauty routines. Lightweight protection and moisture are the brand signature.",
      tone: "mint",
    },
    peripera: {
      name: "Peripera",
      tagline: "Cheerful makeup for everyday color play.",
      intro:
        "Peripera brings fun lip and cheek color with easy application. Soft glossy finishes and vibrant everyday shades make it a go-to for quick glam.",
      tone: "pink",
    },
  };

  const catalog = [
    {
      brand: "Anua",
      category: "Skincare",
      name: "Heartleaf 77% Soothing Toner 250ml",
      rating: "4.8",
      reviews: "986",
      price: "US$18.50",
      originalPrice: "US$26.00",
      tone: "lavender",
    },
    {
      brand: "Anua",
      category: "Skincare",
      name: "PDRN Hyaluronic Acid Hydrating Capsule Mist 100ml",
      rating: "4.8",
      reviews: "1,256",
      price: "US$18.40",
      originalPrice: "US$24.00",
      tone: "green",
    },
    {
      brand: "Anua",
      category: "Cleansers",
      name: "Heartleaf Pore Control Cleansing Oil 200ml",
      rating: "4.8",
      reviews: "1,275",
      price: "US$22.00",
      originalPrice: "US$31.00",
      tone: "green",
    },
    {
      brand: "Anua",
      category: "Masks",
      name: "Heartleaf Quercetinol Pore Deep Cleansing Foam",
      rating: "4.7",
      reviews: "642",
      price: "US$14.80",
      originalPrice: "US$20.00",
      tone: "mint",
    },
    {
      brand: "numbuzin",
      category: "Skincare",
      name: "No.5 Vitamin Spotlight Serum 30ml",
      rating: "4.8",
      reviews: "1,088",
      price: "US$19.20",
      originalPrice: "US$27.00",
      tone: "cream",
    },
    {
      brand: "numbuzin",
      category: "Masks",
      name: "No.3 PHA Skin Prep Bubble Mask 90ml",
      rating: "4.9",
      reviews: "842",
      price: "US$22.00",
      originalPrice: "US$31.00",
      tone: "pink",
    },
    {
      brand: "numbuzin",
      category: "Skincare",
      name: "No.1 Glossy Essence Serum Pad",
      rating: "4.7",
      reviews: "710",
      price: "US$16.40",
      originalPrice: "US$23.00",
      tone: "skin",
    },
    {
      brand: "medicube",
      category: "Skincare",
      name: "PDRN Pink Collagen Capsule Cream 55g",
      rating: "4.8",
      reviews: "1,104",
      price: "US$28.00",
      originalPrice: "US$36.00",
      tone: "skin",
    },
    {
      brand: "medicube",
      category: "Pads",
      name: "Zero Pore Pad 2.0 70 sheets",
      rating: "4.7",
      reviews: "532",
      price: "US$19.90",
      originalPrice: "US$28.00",
      tone: "mint",
    },
    {
      brand: "medicube",
      category: "Skincare",
      name: "Age-R Booster Pro Serum",
      rating: "4.8",
      reviews: "890",
      price: "US$24.50",
      originalPrice: "US$32.00",
      tone: "pink",
    },
    {
      brand: "COSRX",
      category: "Skincare",
      name: "Advanced Snail 96 Mucin Power Essence 100ml",
      rating: "4.9",
      reviews: "2,104",
      price: "US$21.00",
      originalPrice: "US$29.00",
      tone: "mint",
    },
    {
      brand: "COSRX",
      category: "Cleansers",
      name: "Low pH Good Morning Gel Cleanser",
      rating: "4.8",
      reviews: "1,540",
      price: "US$12.00",
      originalPrice: "US$16.00",
      tone: "aqua",
    },
    {
      brand: "COSRX",
      category: "Skincare",
      name: "The Retinol 0.5 Oil",
      rating: "4.7",
      reviews: "980",
      price: "US$23.00",
      originalPrice: "US$30.00",
      tone: "cream",
    },
    {
      brand: "Beauty of Joseon",
      category: "Suncare",
      name: "Relief Sun Rice + Probiotics SPF50+ 50ml",
      rating: "4.8",
      reviews: "1,879",
      price: "US$16.80",
      originalPrice: "US$24.00",
      tone: "cream",
    },
    {
      brand: "Beauty of Joseon",
      category: "Skincare",
      name: "Glow Serum Propolis + Niacinamide",
      rating: "4.9",
      reviews: "2,240",
      price: "US$17.20",
      originalPrice: "US$24.00",
      tone: "skin",
    },
    {
      brand: "Celimax",
      category: "Skincare",
      name: "Retinal Shot Tightening Booster 15ml",
      rating: "4.7",
      reviews: "635",
      price: "US$18.48",
      originalPrice: "US$26.00",
      tone: "blue",
    },
    {
      brand: "Celimax",
      category: "Skincare",
      name: "Dual Barrier Creamy Toner",
      rating: "4.8",
      reviews: "720",
      price: "US$15.90",
      originalPrice: "US$22.00",
      tone: "lavender",
    },
    {
      brand: "Torriden",
      category: "Skincare",
      name: "Dive-In Serum 50ml",
      rating: "4.9",
      reviews: "1,492",
      price: "US$15.50",
      originalPrice: "US$24.00",
      tone: "aqua",
    },
    {
      brand: "Torriden",
      category: "Masks",
      name: "Dive-In Low Molecule Hyaluronic Acid Mask",
      rating: "4.8",
      reviews: "860",
      price: "US$4.20",
      originalPrice: "US$6.00",
      tone: "blue",
    },
    {
      brand: "rom&nd",
      category: "Makeup",
      name: "Juicy Lasting Tint 5.5g",
      rating: "4.8",
      reviews: "3,012",
      price: "US$12.80",
      originalPrice: "US$18.00",
      tone: "pink",
    },
    {
      brand: "rom&nd",
      category: "Makeup",
      name: "Better Than Cheek Blush",
      rating: "4.7",
      reviews: "1,120",
      price: "US$14.00",
      originalPrice: "US$19.00",
      tone: "skin",
    },
    {
      brand: "Isntree",
      category: "Suncare",
      name: "Hyaluronic Acid Watery Sun Gel SPF50+ 50ml",
      rating: "4.9",
      reviews: "2,241",
      price: "US$17.40",
      originalPrice: "US$25.00",
      tone: "aqua",
    },
    {
      brand: "Isntree",
      category: "Skincare",
      name: "Green Tea Fresh Toner",
      rating: "4.7",
      reviews: "690",
      price: "US$16.00",
      originalPrice: "US$22.00",
      tone: "green",
    },
    {
      brand: "Peripera",
      category: "Makeup",
      name: "Ink Mood Glowy Tint 4g",
      rating: "4.7",
      reviews: "1,564",
      price: "US$11.50",
      originalPrice: "US$16.00",
      tone: "skin",
    },
    {
      brand: "Peripera",
      category: "Makeup",
      name: "Ink Black Cara",
      rating: "4.6",
      reviews: "840",
      price: "US$10.80",
      originalPrice: "US$15.00",
      tone: "blue",
    },
  ];

  const requestedSlug = slugify(new URLSearchParams(window.location.search).get("brand") || "anua");

  const matchedProducts = catalog.filter((product) => slugify(product.brand) === requestedSlug);

  const profile =
    brandProfiles[requestedSlug] ||
    (() => {
      const fallbackName =
        matchedProducts[0]?.brand ||
        requestedSlug
          .split("-")
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ") ||
        "Brand";
      return {
        name: fallbackName,
        tagline: "Discover standout picks from this BridgeOn brand.",
        intro: `${fallbackName} brings curated Korean beauty and lifestyle favorites to BridgeOn. Explore signature formulas, category picks, and bestsellers selected for everyday routines.`,
        tone: "cream",
      };
    })();

  const products =
    matchedProducts.length > 0
      ? matchedProducts
      : [
          {
            brand: profile.name,
            category: "Skincare",
            name: `${profile.name} Signature Soothing Essence`,
            rating: "4.8",
            reviews: "420",
            price: "US$18.00",
            originalPrice: "US$24.00",
            tone: "lavender",
          },
          {
            brand: profile.name,
            category: "Skincare",
            name: `${profile.name} Daily Moisture Cream`,
            rating: "4.7",
            reviews: "310",
            price: "US$21.00",
            originalPrice: "US$28.00",
            tone: "cream",
          },
          {
            brand: profile.name,
            category: "Makeup",
            name: `${profile.name} Soft Glow Tint`,
            rating: "4.6",
            reviews: "260",
            price: "US$13.00",
            originalPrice: "US$18.00",
            tone: "pink",
          },
          {
            brand: profile.name,
            category: "Suncare",
            name: `${profile.name} Light Protection SPF50+`,
            rating: "4.8",
            reviews: "390",
            price: "US$16.50",
            originalPrice: "US$23.00",
            tone: "aqua",
          },
        ];

  const categories = ["All", ...Array.from(new Set(products.map((product) => product.category)))];
  let activeCategory = "All";

  const parseMoney = (value) => Number(String(value).replace(/[^0-9.]/g, "")) || 0;
  const parseCount = (value) => Number(String(value).replace(/[^0-9]/g, "")) || 0;

  const sortProducts = (items, sortLabel) => {
    const sorted = items.map((product, index) => ({ product, index }));

    sorted.sort((a, b) => {
      switch (sortLabel) {
        case "Newest":
          return b.index - a.index;
        case "Price: Low to High":
          return parseMoney(a.product.price) - parseMoney(b.product.price);
        case "Price: High to Low":
          return parseMoney(b.product.price) - parseMoney(a.product.price);
        case "Top Rated":
          return Number(b.product.rating) - Number(a.product.rating) || parseCount(b.product.reviews) - parseCount(a.product.reviews);
        case "Best Selling":
        default:
          return parseCount(b.product.reviews) - parseCount(a.product.reviews) || a.index - b.index;
      }
    });

    return sorted.map(({ product }) => product);
  };

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

  const renderProducts = () => {
    const filtered =
      activeCategory === "All" ? products : products.filter((product) => product.category === activeCategory);
    const sortLabel = sortSelect?.selectedOptions?.[0]?.textContent?.trim() || "Best Selling";
    const visible = sortProducts(filtered, sortLabel);

    gridRoot.replaceChildren(...visible.map(createCard));

    if (emptyState) emptyState.hidden = visible.length > 0;

    const countLabel = visible.length.toLocaleString("en-US");
    if (countNode) countNode.textContent = `(${countLabel})`;
    if (countMobileNode) countMobileNode.textContent = `${countLabel} Items`;

    window.BridgeOn?.wishlist?.syncButtons?.(gridRoot);
  };

  const renderTabs = () => {
    tabsRoot.replaceChildren(
      ...categories.map((category) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = category;
        button.classList.toggle("is-active", category === activeCategory);
        button.setAttribute("aria-selected", category === activeCategory ? "true" : "false");
        button.addEventListener("click", () => {
          activeCategory = category;
          renderTabs();
          renderProducts();
        });
        return button;
      })
    );
  };

  sortSelect?.addEventListener("change", renderProducts);

  nameNode.textContent = profile.name;
  if (taglineNode) taglineNode.textContent = profile.tagline;
  if (introNode) introNode.textContent = profile.intro;
  if (breadcrumbNode) breadcrumbNode.textContent = profile.name;
  if (heroMedia) heroMedia.dataset.tone = profile.tone;
  if (aboutImage) aboutImage.dataset.tone = profile.tone;
  document.title = `${profile.name} | BridgeOn`;

  renderTabs();
  renderProducts();
})();
