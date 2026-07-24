(() => {
  const navigateWithPageTransition =
    window.BridgeOn?.navigateWithPageTransition || ((href) => {
      window.location.href = href;
    });

  const getProductDetailUrl = (path) => {
    if (!path) {
      return window.BridgeOn?.productDetailUrl || new URL("product-detail/product-detail.html", window.location.href).href;
    }
    if (/^https?:\/\//i.test(path)) return path;
    return new URL(path, window.location.href).href;
  };

  const DEFAULT_DETAIL_URL = getProductDetailUrl();

  const dealSliderData = {
    special: [
      {
        badge: "TODAY'S PICK",
        brand: "Anua",
        title: "PDRN Serum 30ml",
        quote: "Boosts skin elasticity and keeps it looking plump all day.",
        price: "US$19.20",
        originalPrice: "US$24.00",
        discount: "20% OFF",
        mediaImage: "img/deals/todays-pick.png?v=6",
        cta: "Discover This Pick",
        detailUrl: "product-detail/product-detail.html",
      },
      {
        badge: "TODAY'S PICK",
        brand: "numbuzin",
        title: "No.3 Bubble Mask",
        quote: "A bouncy prep mask that hydrates deeply without stickiness.",
        price: "US$28.00",
        originalPrice: "US$36.00",
        discount: "22% OFF",
        mediaImage: "img/deals/todays-pick.png?v=6",
        cta: "Discover This Pick",
        detailUrl: "product-detail/product-detail.html",
      },
      {
        badge: "TODAY'S PICK",
        brand: "SKIN1004",
        title: "Madagascar Ampoule",
        quote: "Calms irritation and leaves skin balanced and clear.",
        price: "US$17.90",
        originalPrice: "US$29.00",
        discount: "38% OFF",
        mediaImage: "img/deals/todays-pick.png?v=6",
        cta: "Discover This Pick",
        detailUrl: "product-detail/product-detail.html",
      },
      {
        badge: "TODAY'S PICK",
        brand: "Torriden",
        title: "Dive-In Serum 50ml",
        quote: "Lightweight hydration for a fresh glass-skin look.",
        price: "US$15.50",
        originalPrice: "US$24.00",
        discount: "35% OFF",
        mediaImage: "img/deals/todays-pick.png?v=6",
        cta: "Discover This Pick",
        detailUrl: "product-detail/product-detail.html",
      },
      {
        badge: "TODAY'S PICK",
        brand: "Round Lab",
        title: "Birch Juice Sun Cream",
        quote: "Daily UV care with a smooth finish and no white cast.",
        price: "US$14.80",
        originalPrice: "US$22.00",
        discount: "33% OFF",
        mediaImage: "img/deals/todays-pick.png?v=6",
        cta: "Discover This Pick",
        detailUrl: "product-detail/product-detail.html",
      },
    ],
    time: [
      {
        badge: "FLASH TIME DEAL",
        brand: "COSRX",
        title: "The Vitamin C 23 Serum",
        timer: "04 : 07 : 29",
        price: "US$16.90",
        originalPrice: "US$26.00",
        discount: "35% OFF",
        mediaImage: "img/deals/time-deal.png?v=3",
        cta: "Claim This Deal",
        detailUrl: "product-detail/product-detail-options.html",
      },
      {
        badge: "FLASH TIME DEAL",
        brand: "medicube",
        title: "PDRN Pink Collagen Capsule Cream",
        timer: "06 : 42 : 18",
        price: "US$28.00",
        originalPrice: "US$36.00",
        discount: "22% OFF",
        mediaImage: "img/deals/time-deal.png?v=3",
        cta: "Claim This Deal",
        detailUrl: "product-detail/product-detail.html",
      },
      {
        badge: "FLASH TIME DEAL",
        brand: "VT",
        title: "Reedle Shot 100",
        timer: "05 : 12 : 44",
        price: "US$23.40",
        originalPrice: "US$31.00",
        discount: "24% OFF",
        mediaImage: "img/deals/time-deal.png?v=3",
        cta: "Claim This Deal",
        detailUrl: "product-detail/product-detail.html",
      },
      {
        badge: "FLASH TIME DEAL",
        brand: "Dr.G",
        title: "Red Blemish Clear Cream",
        timer: "03 : 19 : 06",
        price: "US$18.20",
        originalPrice: "US$27.00",
        discount: "29% OFF",
        mediaImage: "img/deals/time-deal.png?v=3",
        cta: "Claim This Deal",
        detailUrl: "product-detail/product-detail.html",
      },
      {
        badge: "FLASH TIME DEAL",
        brand: "Beauty of Joseon",
        title: "Relief Sun SPF50+",
        timer: "02 : 33 : 51",
        price: "US$13.50",
        originalPrice: "US$20.00",
        discount: "32% OFF",
        mediaImage: "img/deals/time-deal.png?v=3",
        cta: "Claim This Deal",
        detailUrl: "product-detail/product-detail.html",
      },
    ],
  };

  document.querySelectorAll(".deal-card[data-deal-slider]").forEach((card) => {
    const sliderKey = card.dataset.dealSlider;
    const slides = dealSliderData[sliderKey];
    if (!slides || !slides.length) return;

    const mediaLabel = card.querySelector(".deal-media-label");
    const mediaImage = card.querySelector(".deal-media-image");
    const badge = card.querySelector(".deal-top span");
    const brand = card.querySelector(".deal-brand");
    const title = card.querySelector(".deal-copy h3");
    const productName = card.querySelector(".deal-product-name");
    const quote = card.querySelector(".deal-quote p") || card.querySelector(".deal-quote");
    const timer = card.querySelector(".deal-timer");
    const priceStrong = card.querySelector(".deal-price strong");
    const priceMark = card.querySelector(".deal-price mark");
    const priceDel = card.querySelector(".deal-price del");
    const mediaBadge = card.querySelector("[data-deal-media-badge]");
    const shopButton = card.querySelector(".deal-shop-button");
    const counter = card.querySelector(".deal-nav-status");
    const prevButton = card.querySelector(".deal-nav-btn.prev");
    const nextButton = card.querySelector(".deal-nav-btn.next");
    let index = 0;
    let autoTimer = null;
    const autoDelay = 5000;

    const getCurrentDetailUrl = () =>
      getProductDetailUrl(slides[index]?.detailUrl || DEFAULT_DETAIL_URL);

    const renderTimer = (value) => {
      const [hours = "00", minutes = "00", seconds = "00"] = String(value)
        .split(":")
        .map((part) => part.trim());
      return `
      <span class="deal-timer-unit"><b>${hours}</b><em>HRS</em></span>
      <span class="deal-timer-separator">:</span>
      <span class="deal-timer-unit"><b>${minutes}</b><em>MIN</em></span>
      <span class="deal-timer-separator">:</span>
      <span class="deal-timer-unit"><b>${seconds}</b><em>SEC</em></span>
    `;
    };

    const renderBadge = (item) => {
      if (!badge) return;
      if (sliderKey === "special") {
        badge.innerHTML = `<i aria-hidden="true">&#9733;</i> ${item.badge}`;
        return;
      }
      badge.innerHTML = `<i aria-hidden="true">&#9889;</i> ${item.badge}`;
    };

    const renderSlide = () => {
      const item = slides[index];
      if (mediaImage && item.mediaImage) {
        mediaImage.src = item.mediaImage;
        mediaImage.alt = [item.brand, item.title]
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
      }
      if (mediaLabel) mediaLabel.textContent = item.mediaLabel;
      renderBadge(item);
      if (sliderKey === "special") {
        if (title) title.textContent = item.brand || "";
        if (productName) productName.textContent = item.title || "";
      } else {
        if (brand) brand.textContent = item.brand || "";
        if (title) title.textContent = item.title || "";
      }
      if (quote) quote.textContent = item.quote || "";
      if (timer && item.timer) timer.innerHTML = renderTimer(item.timer);
      if (priceStrong) priceStrong.textContent = item.price;
      if (priceMark) priceMark.textContent = item.discount;
      if (priceDel) priceDel.textContent = item.originalPrice;
      if (mediaBadge) mediaBadge.textContent = item.discount;
      if (shopButton && item.cta) {
        shopButton.innerHTML = `${item.cta} <span aria-hidden="true">&rarr;</span>`;
      }
      if (counter) counter.textContent = `${index + 1} / ${slides.length}`;
      card.dataset.productDetailLink = getCurrentDetailUrl();
      window.BridgeOn?.wishlist?.syncButtons?.(card);
    };

    const goToSlide = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      renderSlide();
    };

    const goNext = () => {
      goToSlide(index + 1);
    };

    const restartAuto = () => {
      if (slides.length < 2) return;
      window.clearInterval(autoTimer);
      autoTimer = window.setInterval(goNext, autoDelay);
    };

    prevButton?.addEventListener("click", () => {
      goToSlide(index - 1);
      restartAuto();
    });

    nextButton?.addEventListener("click", () => {
      goNext();
      restartAuto();
    });

    shopButton?.addEventListener("click", () => {
      navigateWithPageTransition(getCurrentDetailUrl());
    });

    renderSlide();
    restartAuto();
  });
})();
