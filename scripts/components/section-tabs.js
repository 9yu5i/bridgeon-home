(() => {
  const normalizeTabKey = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/^#/, "")
      .replace(/\s+/g, "-");

  const getTabKey = (button) => {
    if (button.dataset.tab) return normalizeTabKey(button.dataset.tab);
    return normalizeTabKey(button.textContent);
  };

  const navigateWithPageTransition =
    window.BridgeOn?.navigateWithPageTransition || ((href) => {
      window.location.href = href;
    });

  const getBestListingUrl = (category = "all") => {
    const fromBridgeOn = window.BridgeOn?.getBestListingUrl?.();
    let base = fromBridgeOn;
    if (!base) {
      if (document.body.classList.contains("listing-page")) base = "./best.html";
      else if (
        document.body.classList.contains("timedeal-page") ||
        document.body.classList.contains("product-detail-page") ||
        document.body.classList.contains("cart-page") ||
        document.body.classList.contains("editors-page") ||
        document.body.classList.contains("realtrend-page") ||
        document.body.classList.contains("my-page") ||
        document.body.classList.contains("brand-page")
      ) {
        base = "../listing/best.html";
      } else {
        base = "listing/best.html";
      }
    }

    const url = new URL(base, window.location.href);
    if (category && category !== "all") {
      url.searchParams.set("category", category);
    } else {
      url.searchParams.delete("category");
    }
    return url.href;
  };

  const desktopMedia = window.matchMedia("(min-width: 1121px)");
  const getSellerLimit = () => (desktopMedia.matches ? 10 : 6);

  const makeProducts = (category, items) =>
    items.map((item) => ({
      category,
      brand: item[0],
      title: item[1],
      detailUrl: item[2] || "product-detail/product-detail.html",
      price: item[3] || "US$18.40",
      originalPrice: item[4] || "US$24.00",
      discount: item[5] || "23%",
      rating: item[6] || "4.8",
      reviews: item[7] || "(1,256)",
    }));

  const SELLER_RANKINGS = {
    all: makeProducts("all", [
      ["Anua", "PDRN Hyaluronic Acid Hydrating Capsule Mist 100ml", "product-detail/product-detail.html"],
      ["numbuzin", "No.3 Skin Softener Essence Toner Pad", "product-detail/product-detail-options.html"],
      ["Samyang", "Buldak Spicy Chicken Ramen 5 Pack"],
      ["BT21", "Desk Organizer Stationery Set"],
      ["HYBE", "Official Light Stick Keyring"],
      ["Donguibogam", "Traditional Herbal Tea Gift Box"],
      ["COSRX", "The Vitamin C 23 Serum"],
      ["rom&nd", "The Juicy Lasting Tint"],
      ["Round Lab", "Birch Juice Sun Cream"],
      ["Market B", "Mini Desk Organizer"],
    ]).map((item, index) => ({
      ...item,
      category: ["beauty", "beauty", "k-food", "lifestyle", "k-pop", "k-traditional", "beauty", "beauty", "beauty", "lifestyle"][index],
    })),
    beauty: makeProducts("beauty", [
      ["Anua", "PDRN Hyaluronic Acid Hydrating Capsule Mist 100ml", "product-detail/product-detail.html"],
      ["numbuzin", "No.3 Skin Softener Essence Toner Pad", "product-detail/product-detail-options.html"],
      ["COSRX", "The Vitamin C 23 Serum"],
      ["Torriden", "Dive-In Low Molecule Hyaluronic Acid Serum"],
      ["medicube", "PDRN Pink Collagen Capsule Cream"],
      ["Beauty of Joseon", "Relief Sun SPF50+"],
      ["Dr.G", "Red Blemish Clear Cream"],
      ["Round Lab", "Birch Juice Sun Cream"],
      ["Anua", "Heartleaf 77% Soothing Toner"],
      ["VT", "Reedle Shot 100"],
    ]),
    "k-food": makeProducts("k-food", [
      ["Samyang", "Buldak Spicy Chicken Ramen 5 Pack"],
      ["Ottogi", "Jin Ramen Mild 5 Pack"],
      ["Nongshim", "Shin Ramyun Gourmet Spicy"],
      ["CJ", "Hetbahn Cooked White Rice"],
      ["Binggrae", "Banana Flavored Milk 6 Pack"],
      ["Paldo", "Teumsae Ramen"],
      ["Samyang", "Cheese Buldak Ramen"],
      ["Ottogi", "Sesame Oil Ramen"],
      ["HBAF", "Honey Butter Almond Set"],
      ["Orion", "Choco Pie Classic 12 Pack"],
    ]),
    lifestyle: makeProducts("lifestyle", [
      ["BT21", "Desk Organizer Stationery Set"],
      ["Market B", "Mini Desk Organizer"],
      ["LocknLock", "Everyday Tumbler 500ml"],
      ["Muji", "PP Pen Case"],
      ["Xiaomi", "Mi LED Desk Lamp"],
      ["Daiso", "Cable Organizer Pack"],
      ["Simplehuman", "Sensor Soap Pump"],
      ["Brabantia", "Pedal Bin 3L"],
      ["Ikea", "Knodd Storage Bin"],
      ["Moleskine", "Classic Notebook Soft Cover"],
    ]),
    "k-pop": makeProducts("k-pop", [
      ["HYBE", "Official Light Stick Keyring"],
      ["Weverse", "Photocard Binder Set"],
      ["SMTOWN", "Official Light Stick Strap"],
      ["JYP", "Concert Slogan Towel"],
      ["YG", "Logo Cap"],
      ["HYBE", "Acrylic Stand Collection"],
      ["Weverse", "Sticker Pack Vol.2"],
      ["SMTOWN", "Mini Pouch"],
      ["JYP", "Photocard Sleeve 50pcs"],
      ["YG", "Echo Bag Charm"],
    ]),
    "k-traditional": makeProducts("k-traditional", [
      ["Donguibogam", "Traditional Herbal Tea Gift Box"],
      ["Osulloc", "Jeju Green Tea Set"],
      ["Damtee", "Jujube Ginger Tea"],
      ["Sulloc", "Roasted Grain Tea"],
      ["Boseong", "Green Tea Powder"],
      ["Injeolmi", "Rice Cake Snack Box"],
      ["Yakgwa", "Honey Cookie Gift Pack"],
      ["Sikhye", "Sweet Rice Drink 6 Pack"],
      ["Doenjang", "Artisan Soybean Paste"],
      ["Gochujang", "Premium Chili Paste"],
    ]),
  };

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const createSellerCard = (product, rank) => {
    const isTop = rank <= 3;
    const ratingClass = isTop ? "product-rating" : "product-rating1";
    const article = document.createElement("article");
    article.className = isTop ? "product-card top-card" : "product-card";
    article.dataset.category = product.category;
    article.dataset.productDetailLink = product.detailUrl;
    article.innerHTML = `
      <b>${rank}</b>
      <div class="product-img">img</div>
      <p>${escapeHtml(product.brand)}</p>
      <h3>${escapeHtml(product.title)}</h3>
      <div class="${ratingClass}"><span><img src="img/main-img/star.png" alt="rating"></span><b>${escapeHtml(product.rating)}</b><em>${escapeHtml(product.reviews)}</em></div>
      <small><span><em class="sale-rate">${escapeHtml(product.discount)}</em> <strong class="sale-price">${escapeHtml(product.price)}</strong></span><del>${escapeHtml(product.originalPrice)}</del></small>
      <div class="card-actions">
        <button aria-label="Add to cart"><img src="img/main-img/cart 2.png" alt="cart"></button>
        <button aria-label="Wishlist"><img src="img/main-img/heart2.png" alt="Wishlist"></button>
      </div>
    `;
    return article;
  };

  const renderSellerRanking = (rail, tabKey) => {
    if (!rail) return;

    const rankingKey = SELLER_RANKINGS[tabKey] ? tabKey : "all";
    const limit = getSellerLimit();
    const products = (SELLER_RANKINGS[rankingKey] || SELLER_RANKINGS.all).slice(0, limit);

    rail.querySelectorAll(".is-loop-clone").forEach((clone) => clone.remove());
    rail.replaceChildren(...products.map((product, index) => createSellerCard(product, index + 1)));
    window.BridgeOn?.wishlist?.syncButtons?.(rail);

    rail.dispatchEvent(
      new CustomEvent("bridgeon:railfilterchange", {
        bubbles: true,
        detail: { tab: rankingKey, limit },
      })
    );
  };

  const initSellerTabs = (group) => {
    const section = group.closest("section");
    const rail = section?.querySelector(".seller-rail") || section?.querySelector(".card-rail");
    const buttons = Array.from(group.querySelectorAll("button"));
    if (!rail || !buttons.length) return;

    let currentTab = "all";

    const setActive = (activeButton) => {
      currentTab = getTabKey(activeButton);

      buttons.forEach((button) => {
        const isActive = button === activeButton;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", isActive ? "true" : "false");
        button.tabIndex = isActive ? 0 : -1;
      });

      renderSellerRanking(rail, currentTab);
      activeButton.scrollIntoView({
        behavior: "smooth",
        inline: "nearest",
        block: "nearest",
      });
    };

    group.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button || !group.contains(button)) return;
      setActive(button);
    });

    group.addEventListener("keydown", (event) => {
      const current = event.target.closest("button");
      if (!current || !group.contains(current)) return;

      const index = buttons.indexOf(current);
      if (index < 0) return;

      let nextIndex = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (index + 1) % buttons.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (index - 1 + buttons.length) % buttons.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = buttons.length - 1;
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActive(current);
        return;
      } else {
        return;
      }

      event.preventDefault();
      buttons[nextIndex].focus();
      setActive(buttons[nextIndex]);
    });

    const syncLimitOnViewportChange = () => {
      renderSellerRanking(rail, currentTab);
    };

    desktopMedia.addEventListener?.("change", syncLimitOnViewportChange);

    const initial = buttons.find((button) => button.classList.contains("is-active")) || buttons[0];
    currentTab = getTabKey(initial);
    setActive(initial);
  };

  document.querySelectorAll(".seller-heading .tag-tabs").forEach(initSellerTabs);

  document.querySelectorAll(".seller-section .section-heading > a, .seller-section .view-button").forEach((link) => {
    link.setAttribute("href", getBestListingUrl("all"));
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigateWithPageTransition(getBestListingUrl("all"));
    });
  });
})();
