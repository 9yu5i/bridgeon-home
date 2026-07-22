(() => {
  const page = document.body;
  if (!page.classList.contains("listing-page--new")) return;

  const sectionsRoot = document.querySelector("[data-new-brand-sections]");
  if (!sectionsRoot) return;

  const brands = [
    {
      key: "anua",
      name: "Anua",
      href: "../brand/detail.html?brand=anua",
      tone: "green",
      products: [
        {
          name: "Heartleaf Pore Control Cleansing Oil Fresh 200ml",
          rating: "4.8",
          reviews: "1,126",
          price: "US$18.40",
          originalPrice: "US$24.00",
          tone: "green",
        },
        {
          name: "PDRN Hyaluronic Acid Hydrating Serum 30ml",
          rating: "4.9",
          reviews: "684",
          price: "US$21.80",
          originalPrice: "US$30.00",
          tone: "mint",
        },
        {
          name: "Heartleaf 77% Toner Pad Mild 70 Pads",
          rating: "4.8",
          reviews: "902",
          price: "US$17.90",
          originalPrice: "US$25.00",
          tone: "aqua",
        },
      ],
    },
    {
      key: "numbuzin",
      name: "numbuzin",
      href: "../brand/detail.html?brand=numbuzin",
      tone: "pink",
      products: [
        {
          name: "No.3 Skin Softening Serum 50ml",
          rating: "4.9",
          reviews: "842",
          price: "US$22.00",
          originalPrice: "US$31.00",
          tone: "pink",
        },
        {
          name: "No.5 Vitamin-Niacinamide Concentrated Pad",
          rating: "4.8",
          reviews: "736",
          price: "US$19.60",
          originalPrice: "US$28.00",
          tone: "cream",
        },
        {
          name: "No.3 PHA Skin Prep Bubble Mask 90ml",
          rating: "4.9",
          reviews: "1,015",
          price: "US$23.00",
          originalPrice: "US$32.00",
          tone: "lavender",
        },
      ],
    },
    {
      key: "medicube",
      name: "medicube",
      href: "../brand/detail.html?brand=medicube",
      tone: "lavender",
      products: [
        {
          name: "PDRN Pink Collagen Capsule Cream 55g",
          rating: "4.8",
          reviews: "1,104",
          price: "US$28.00",
          originalPrice: "US$36.00",
          tone: "skin",
        },
        {
          name: "Zero Pore One Day Serum 30ml",
          rating: "4.7",
          reviews: "529",
          price: "US$24.50",
          originalPrice: "US$33.00",
          tone: "lavender",
        },
        {
          name: "Collagen Jelly Cream Fresh Set",
          rating: "4.8",
          reviews: "654",
          price: "US$26.20",
          originalPrice: "US$38.00",
          tone: "pink",
        },
      ],
    },
    {
      key: "celimax",
      name: "Celimax",
      href: "../brand/detail.html?brand=celimax",
      tone: "blue",
      products: [
        {
          name: "Retinal Shot Tightening Booster 15ml",
          rating: "4.7",
          reviews: "635",
          price: "US$18.48",
          originalPrice: "US$26.00",
          tone: "blue",
        },
        {
          name: "Noni Energy Repair Cream 50ml",
          rating: "4.8",
          reviews: "418",
          price: "US$20.40",
          originalPrice: "US$29.00",
          tone: "aqua",
        },
        {
          name: "Dual Barrier Aqua Sun Serum 50ml",
          rating: "4.7",
          reviews: "372",
          price: "US$16.80",
          originalPrice: "US$24.00",
          tone: "mint",
        },
      ],
    },
    {
      key: "romand",
      name: "rom&nd",
      href: "../brand/detail.html?brand=rom-nd",
      tone: "skin",
      products: [
        {
          name: "The Juicy Lasting Tint Bare Apricot",
          rating: "4.9",
          reviews: "1,382",
          price: "US$10.80",
          originalPrice: "US$15.00",
          tone: "skin",
        },
        {
          name: "Glasting Melting Balm Fresh Collection",
          rating: "4.8",
          reviews: "902",
          price: "US$12.20",
          originalPrice: "US$18.00",
          tone: "pink",
        },
        {
          name: "Better Than Palette Light Garden",
          rating: "4.8",
          reviews: "714",
          price: "US$18.90",
          originalPrice: "US$27.00",
          tone: "cream",
        },
      ],
    },
    {
      key: "beauty-of-joseon",
      name: "Beauty of Joseon",
      href: "../brand/detail.html?brand=beauty-of-joseon",
      tone: "cream",
      products: [
        {
          name: "Relief Sun Aqua-Fresh Rice + B5 50ml",
          rating: "4.8",
          reviews: "1,219",
          price: "US$17.60",
          originalPrice: "US$25.00",
          tone: "cream",
        },
        {
          name: "Glow Replenishing Rice Milk 150ml",
          rating: "4.7",
          reviews: "548",
          price: "US$16.40",
          originalPrice: "US$23.00",
          tone: "green",
        },
        {
          name: "Red Bean Refreshing Pore Mask 140ml",
          rating: "4.8",
          reviews: "821",
          price: "US$15.90",
          originalPrice: "US$22.00",
          tone: "mint",
        },
      ],
    },
    {
      key: "round-lab",
      name: "Round Lab",
      href: "../brand/detail.html?brand=round-lab",
      tone: "aqua",
      products: [
        {
          name: "Birch Juice Moisturizing Sunscreen 50ml",
          rating: "4.9",
          reviews: "1,642",
          price: "US$18.20",
          originalPrice: "US$28.00",
          tone: "blue",
        },
        {
          name: "1025 Dokdo Toner 200ml",
          rating: "4.8",
          reviews: "2,011",
          price: "US$15.80",
          originalPrice: "US$24.00",
          tone: "aqua",
        },
        {
          name: "Pine Calming Cica Ampoule 30ml",
          rating: "4.8",
          reviews: "758",
          price: "US$20.40",
          originalPrice: "US$29.00",
          tone: "green",
        },
        {
          name: "Soybean Nourishing Cream 80ml",
          rating: "4.7",
          reviews: "496",
          price: "US$22.10",
          originalPrice: "US$31.00",
          tone: "cream",
        },
        {
          name: "Mugwort Calming Cleanser 150ml",
          rating: "4.8",
          reviews: "624",
          price: "US$13.90",
          originalPrice: "US$21.00",
          tone: "mint",
        },
        {
          name: "Vita Niacinamide Dark Spot Serum 30ml",
          rating: "4.7",
          reviews: "531",
          price: "US$19.30",
          originalPrice: "US$27.00",
          tone: "lavender",
        },
        {
          name: "Birch Moisture Mild-Up Sun Cream 50ml",
          rating: "4.8",
          reviews: "905",
          price: "US$17.70",
          originalPrice: "US$25.00",
          tone: "skin",
        },
      ],
    },
  ];

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const createCard = (brand, product, index) => {
    const article = document.createElement("article");
    article.className = "listing-card listing-card--new";
    article.dataset.brand = brand.key;
    article.dataset.order = String(index + 1);
    article.dataset.productDetailLink = "../product-detail/product-detail.html";
    article.innerHTML = `
      <div class="listing-card-media">
        <span class="listing-card-new-badge">NEW</span>
        <div class="listing-card-image listing-card-image--${escapeHtml(product.tone)}" aria-hidden="true"></div>
        <button type="button" class="listing-card-wish" aria-label="Add to wishlist" aria-pressed="false"></button>
      </div>
      <div class="listing-card-body">
        <p class="listing-card-brand">${escapeHtml(brand.name)}</p>
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

  const createBrandSection = (brand) => {
    const section = document.createElement("section");
    section.className = "listing-brand-section";
    section.setAttribute("aria-labelledby", `new-brand-${brand.key}`);

    const banner = document.createElement("a");
    banner.className = `listing-brand-banner listing-brand-banner--${escapeHtml(brand.tone || "lavender")}`;
    banner.href = brand.href;
    banner.setAttribute("aria-label", `View ${brand.name} brand page`);
    banner.innerHTML = `
      <div class="listing-brand-banner-copy">
        <span class="listing-brand-banner-label">NEW FROM</span>
        <strong class="listing-brand-banner-name" id="new-brand-${escapeHtml(brand.key)}">${escapeHtml(brand.name)}</strong>
        <p class="listing-brand-banner-text">Discover the latest arrivals from ${escapeHtml(brand.name)}.</p>
      </div>
      <span class="listing-brand-banner-cta">SHOP BRAND &gt;</span>
    `;

    const products = document.createElement("div");
    products.className = "listing-brand-products";

    const label = document.createElement("p");
    label.className = "listing-brand-products-label";
    label.textContent = "NEW ARRIVALS";

    const grid = document.createElement("div");
    grid.className = "listing-brand-grid";
    grid.setAttribute("aria-label", `${brand.name} new arrivals`);

    brand.products.forEach((product, index) => {
      grid.appendChild(createCard(brand, product, index));
    });

    products.append(label, grid);
    section.append(banner, products);
    return section;
  };

  sectionsRoot.replaceChildren(...brands.map((brand) => createBrandSection(brand)));
})();
