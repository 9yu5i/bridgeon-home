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
        title: "numbuzin No.3<br />PHA Skin Prep Bubble Mask 90ml",
        body: "A bouncy collagen serum that hydrates deeply without any stickiness.",
        isTimer: false,
        price: "US$28.00",
        originalPrice: "$36.00",
        discount: "22% OFF",
        rating: "4.9",
        reviews: "1,275 reviews",
        mediaLabel: "img 1",
        detailUrl: "product-detail/product-detail.html",
      },
      {
        badge: "TODAY'S PICK",
        title: "Anua<br />PDRN Serum 30ml",
        body: "Helps improve skin texture while keeping moisture locked in.",
        isTimer: false,
        price: "US$19.20",
        originalPrice: "$32.00",
        discount: "40% OFF",
        rating: "4.8",
        reviews: "842 reviews",
        mediaLabel: "img 2",
        detailUrl: "product-detail/product-detail.html",
      },
      {
        badge: "TODAY'S PICK",
        title: "SKIN1004<br />Madagascar Ampoule 55ml",
        body: "Calms irritation and leaves the skin balanced and clear.",
        isTimer: false,
        price: "US$17.90",
        originalPrice: "$29.00",
        discount: "38% OFF",
        rating: "4.7",
        reviews: "936 reviews",
        mediaLabel: "img 3",
        detailUrl: "product-detail/product-detail.html",
      },
      {
        badge: "TODAY'S PICK",
        title: "Torriden<br />Dive-In Serum 50ml",
        body: "Lightweight hydration for a fresh and plump glass-skin look.",
        isTimer: false,
        price: "US$15.50",
        originalPrice: "$24.00",
        discount: "35% OFF",
        rating: "4.9",
        reviews: "1,088 reviews",
        mediaLabel: "img 4",
        detailUrl: "product-detail/product-detail.html",
      },
      {
        badge: "TODAY'S PICK",
        title: "Round Lab<br />Birch Juice Sun Cream",
        body: "Daily UV care with smooth finish and no white cast.",
        isTimer: false,
        price: "US$14.80",
        originalPrice: "$22.00",
        discount: "33% OFF",
        rating: "4.8",
        reviews: "764 reviews",
        mediaLabel: "img 5",
        detailUrl: "product-detail/product-detail.html",
      },
    ],
    time: [
      {
        badge: "Time Deal",
        title: "medicube<br />PDRN Pink Collagen Capsule Cream 55g",
        body: "06 : 42 : 18",
        isTimer: true,
        price: "$28.00",
        originalPrice: "$36.00",
        discount: "22% OFF",
        mediaLabel: "img 1",
        detailUrl: "product-detail/product-detail-options.html",
      },
      {
        badge: "Time Deal",
        title: "COSRX<br />The Vitamin C 23 Serum",
        body: "05 : 12 : 44",
        isTimer: true,
        price: "$16.90",
        originalPrice: "$25.00",
        discount: "32% OFF",
        mediaLabel: "img 2",
        detailUrl: "product-detail/product-detail.html",
      },
      {
        badge: "Time Deal",
        title: "VT<br />Reedle Shot 100",
        body: "04 : 07 : 29",
        isTimer: true,
        price: "$23.40",
        originalPrice: "$31.00",
        discount: "24% OFF",
        mediaLabel: "img 3",
        detailUrl: "product-detail/product-detail.html",
      },
      {
        badge: "Time Deal",
        title: "Dr.G<br />Red Blemish Clear Cream",
        body: "03 : 19 : 06",
        isTimer: true,
        price: "$18.20",
        originalPrice: "$27.00",
        discount: "29% OFF",
        mediaLabel: "img 4",
        detailUrl: "product-detail/product-detail.html",
      },
      {
        badge: "Time Deal",
        title: "Beauty of Joseon<br />Relief Sun SPF50+",
        body: "02 : 33 : 51",
        isTimer: true,
        price: "$13.50",
        originalPrice: "$20.00",
        discount: "32% OFF",
        mediaLabel: "img 5",
        detailUrl: "product-detail/product-detail.html",
      },
    ],
  };

  document.querySelectorAll(".deal-card[data-deal-slider]").forEach((card) => {
    const sliderKey = card.dataset.dealSlider;
    const slides = dealSliderData[sliderKey];
    if (!slides || !slides.length) return;

    const mediaLabel = card.querySelector(".deal-media-label");
    const badge = card.querySelector(".deal-top span");
    const title = card.querySelector(".deal-copy h3");
    const rating = card.querySelector(".deal-rating");
    const body = card.querySelector(".deal-copy p");
    const timer = card.querySelector(".deal-timer");
    const price = card.querySelector(".deal-copy strong");
    const counter = card.querySelector(".deal-nav-status");
    const prevButton = card.querySelector(".deal-nav-btn.prev");
    const nextButton = card.querySelector(".deal-nav-btn.next");
    const shopButton = card.querySelector(".deal-shop-button");
    let index = 0;
    let autoTimer = null;
    const autoDelay = 5000;

    const getCurrentDetailUrl = () =>
      getProductDetailUrl(slides[index]?.detailUrl || DEFAULT_DETAIL_URL);

    const renderTimer = (value) => {
      const [hours = "00", minutes = "00", seconds = "00"] = value
        .split(":")
        .map((part) => part.trim());
      return `
      <span class="deal-timer-heading">Ends in</span>
      <span class="deal-timer-unit"><b>${hours}</b><em>HRS</em></span>
      <span class="deal-timer-separator">:</span>
      <span class="deal-timer-unit"><b>${minutes}</b><em>MINS</em></span>
      <span class="deal-timer-separator">:</span>
      <span class="deal-timer-unit"><b>${seconds}</b><em>SECS</em></span>
    `;
    };

    const renderSlide = () => {
      const item = slides[index];
      if (mediaLabel) mediaLabel.textContent = item.mediaLabel;
      if (badge) badge.textContent = item.badge;
      if (title) title.innerHTML = item.title;
      if (rating) {
        rating.innerHTML = `<span><img src="img/main-img/star.png" alt="rating"></span><b>${item.rating}</b><em>| ${item.reviews}</em>`;
      }
      if (body) {
        body.classList.toggle("timer", item.isTimer);
        body.innerHTML = item.isTimer ? `Ends in <b>${item.body}</b>` : item.body;
      }
      if (timer) timer.innerHTML = renderTimer(item.body);
      if (price) {
        price.innerHTML = `${item.price} <del>${item.originalPrice}</del> <mark>${item.discount}</mark>`;
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
