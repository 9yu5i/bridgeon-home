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
        cta: "Shop This Deal",
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
        cta: "Shop This Deal",
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
        cta: "Shop This Deal",
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
        cta: "Shop This Deal",
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
        cta: "Shop This Deal",
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
      if (mediaBadge) {
        if (sliderKey === "time") {
          mediaBadge.innerHTML = String(item.discount).replace(/\s+/, "<br>");
        } else {
          mediaBadge.textContent = item.discount;
        }
      }
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

  const initDealTimeCompact = () => {
    const root = document.querySelector("[data-deal-time-compact]");
    if (!root) return;

    const slides = dealSliderData.time;
    if (!slides?.length) return;

    const bannerTimer = root.querySelector("[data-deal-time-banner-timer]");
    const bannerTitle = root.querySelector("[data-deal-time-banner-title]");
    const rail = root.querySelector("[data-deal-time-rail]");
    const dots = root.querySelector("[data-deal-time-dots]");
    const pageSize = 3;
    let pageIndex = 0;

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

    const formatDiscount = (discount) =>
      String(discount || "")
        .replace(/\s*OFF$/i, "")
        .trim();

    const escapeHtml = (value) =>
      String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const pages = [];
    for (let i = 0; i < slides.length; i += pageSize) {
      pages.push(slides.slice(i, i + pageSize));
    }

    const renderBanner = () => {
      const item = slides[0];
      if (!item) return;

      if (bannerTimer && item.timer) bannerTimer.innerHTML = renderTimer(item.timer);
      if (bannerTitle) bannerTitle.textContent = "Flash Time Deal";
    };

    const setActiveDot = (nextIndex) => {
      pageIndex = nextIndex;
      dots?.querySelectorAll(".deal-time-dot").forEach((dot, dotIndex) => {
        const isActive = dotIndex === pageIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-selected", isActive ? "true" : "false");
        dot.tabIndex = isActive ? 0 : -1;
      });
    };

    const goToPage = (nextIndex, behavior = "smooth") => {
      if (!rail || !pages.length) return;
      const clamped = Math.max(0, Math.min(nextIndex, pages.length - 1));
      const page = rail.children[clamped];
      if (!page) return;
      rail.scrollTo({ left: page.offsetLeft, behavior });
      setActiveDot(clamped);
    };

    const renderDots = () => {
      if (!dots) return;
      if (pages.length < 2) {
        dots.hidden = true;
        dots.innerHTML = "";
        return;
      }

      dots.hidden = false;
      dots.innerHTML = pages
        .map(
          (_, itemIndex) => `
        <button
          type="button"
          class="deal-time-dot${itemIndex === 0 ? " is-active" : ""}"
          role="tab"
          aria-label="Time deal page ${itemIndex + 1}"
          aria-selected="${itemIndex === 0 ? "true" : "false"}"
          data-deal-time-page="${itemIndex}"
          tabindex="${itemIndex === 0 ? "0" : "-1"}"
        ></button>`,
        )
        .join("");
    };

    const renderRail = () => {
      if (!rail) return;

      rail.innerHTML = pages
        .map(
          (page) => `
        <div class="deal-time-rail-page">
          ${page
            .map((item) => {
              const detailUrl = getProductDetailUrl(item.detailUrl || DEFAULT_DETAIL_URL);
              const discount = formatDiscount(item.discount);
              const name = escapeHtml(item.title);
              const brand = escapeHtml(item.brand);
              return `
            <article class="deal-time-rail-card" data-product-detail-link="${escapeHtml(item.detailUrl || DEFAULT_DETAIL_URL)}">
              <div class="deal-time-rail-body">
                <a class="deal-time-rail-thumb" href="${detailUrl}">
                  <img src="${escapeHtml(item.mediaImage)}" alt="${brand} ${name}">
                </a>
                <div class="deal-time-rail-info">
                  <a href="${detailUrl}">
                    <p class="deal-time-rail-brand">${brand}</p>
                    <h4 class="deal-time-rail-name">${name}</h4>
                    <div class="deal-time-rail-price">
                      <del>${escapeHtml(item.originalPrice)}</del>
                      <span class="deal-time-rail-price-row">
                        <strong>${escapeHtml(item.price)}</strong>
                        <span class="discount">${escapeHtml(discount)}</span>
                      </span>
                    </div>
                  </a>
                  <button type="button" class="deal-time-rail-cart" aria-label="Add ${name} to cart">
                    <img src="img/main-img/cart.png" alt="" aria-hidden="true">
                  </button>
                </div>
              </div>
            </article>`;
            })
            .join("")}
        </div>`,
        )
        .join("");
    };

    dots?.addEventListener("click", (event) => {
      const dot = event.target.closest(".deal-time-dot");
      if (!dot || !dots.contains(dot)) return;
      goToPage(Number(dot.dataset.dealTimePage) || 0);
    });

    rail?.addEventListener(
      "scroll",
      () => {
        if (!rail || !pages.length) return;
        const nextIndex = Math.round(rail.scrollLeft / Math.max(rail.clientWidth, 1));
        if (nextIndex !== pageIndex) setActiveDot(Math.max(0, Math.min(nextIndex, pages.length - 1)));
      },
      { passive: true },
    );

    renderBanner();
    renderRail();
    renderDots();
    goToPage(0, "auto");
  };

  initDealTimeCompact();

  const initDealPickCompact = () => {
    const root = document.querySelector("[data-deal-pick-compact]");
    if (!root) return;

    const slides = dealSliderData.special;
    if (!slides?.length) return;

    const thumbs = root.querySelector("[data-deal-pick-thumbs]");
    const detail = root.querySelector("[data-deal-pick-detail]");
    const detailLink = root.querySelector("[data-deal-pick-link]");
    const detailImage = root.querySelector("[data-deal-pick-image]");
    const brandEl = root.querySelector("[data-deal-pick-brand]");
    const titleEl = root.querySelector("[data-deal-pick-title]");
    const reasonEl = root.querySelector("[data-deal-pick-reason]");
    const discountEl = root.querySelector("[data-deal-pick-discount]");
    const originalEl = root.querySelector("[data-deal-pick-original]");
    const priceEl = root.querySelector("[data-deal-pick-price]");
    const cartButton = root.querySelector("[data-deal-pick-cart]");
    const progressBar = root.querySelector("[data-deal-pick-progress]");
    let index = 0;
    let autoTimer = null;
    let hasRendered = false;
    const autoDelay = 5000;

    const formatDiscount = (discount) =>
      String(discount || "")
        .replace(/\s*OFF$/i, "")
        .trim();

    const escapeHtml = (value) =>
      String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const getDetailUrl = (item) => getProductDetailUrl(item?.detailUrl || DEFAULT_DETAIL_URL);

    const restartProgress = () => {
      if (!progressBar) return;
      progressBar.classList.remove("is-running");
      void progressBar.offsetWidth;
      if (slides.length > 1) progressBar.classList.add("is-running");
    };

    const applyDetailContent = (item) => {
      const detailUrl = getDetailUrl(item);
      const label = [item.brand, item.title].filter(Boolean).join(" ");

      if (detail) detail.dataset.productDetailLink = item.detailUrl || DEFAULT_DETAIL_URL;
      if (detailLink) detailLink.href = detailUrl;
      if (detailImage) {
        detailImage.src = item.mediaImage;
        detailImage.alt = label;
      }
      if (brandEl) brandEl.textContent = item.brand || "";
      if (titleEl) titleEl.textContent = item.title || "";
      if (reasonEl) reasonEl.textContent = item.quote || "";
      if (discountEl) discountEl.textContent = formatDiscount(item.discount);
      if (originalEl) originalEl.textContent = item.originalPrice || "";
      if (priceEl) priceEl.textContent = item.price || "";
      if (cartButton) cartButton.setAttribute("aria-label", `Add ${label} to cart`);
    };

    const renderDetail = () => {
      const item = slides[index];
      if (!item) return;

      const updateThumbs = () => {
        thumbs?.querySelectorAll(".deal-pick-thumb").forEach((thumb, thumbIndex) => {
          const isActive = thumbIndex === index;
          thumb.classList.toggle("is-active", isActive);
          thumb.setAttribute("aria-selected", isActive ? "true" : "false");
          thumb.tabIndex = isActive ? 0 : -1;
        });

        const activeThumb = thumbs?.querySelector(".deal-pick-thumb.is-active");
        if (!thumbs || !activeThumb) return;

        const thumbLeft = activeThumb.offsetLeft;
        const thumbRight = thumbLeft + activeThumb.offsetWidth;
        const viewLeft = thumbs.scrollLeft;
        const viewRight = viewLeft + thumbs.clientWidth;
        const pad = 8;

        if (thumbLeft < viewLeft) {
          thumbs.scrollTo({ left: Math.max(0, thumbLeft - pad), behavior: "smooth" });
        } else if (thumbRight > viewRight) {
          thumbs.scrollTo({
            left: thumbRight - thumbs.clientWidth + pad,
            behavior: "smooth",
          });
        }
      };

      if (!hasRendered) {
        applyDetailContent(item);
        updateThumbs();
        hasRendered = true;
        restartProgress();
        return;
      }

      detail?.classList.add("is-switching");
      reasonEl?.classList.add("is-switching");
      window.setTimeout(() => {
        applyDetailContent(item);
        detail?.classList.remove("is-switching");
        reasonEl?.classList.remove("is-switching");
      }, 140);
      updateThumbs();
      restartProgress();
    };

    const renderThumbs = () => {
      if (!thumbs) return;

      thumbs.innerHTML = slides
        .map((item, itemIndex) => {
          const label = escapeHtml([item.brand, item.title].filter(Boolean).join(" "));
          return `
          <button
            type="button"
            class="deal-pick-thumb${itemIndex === 0 ? " is-active" : ""}"
            role="tab"
            aria-selected="${itemIndex === 0 ? "true" : "false"}"
            aria-label="${label}"
            data-deal-pick-index="${itemIndex}"
            tabindex="${itemIndex === 0 ? "0" : "-1"}"
          >
            <img src="${escapeHtml(item.mediaImage)}" alt="">
          </button>`;
        })
        .join("");
    };

    const goToSlide = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      renderDetail();
    };

    const restartAuto = () => {
      if (slides.length < 2) return;
      window.clearInterval(autoTimer);
      autoTimer = window.setInterval(() => goToSlide(index + 1), autoDelay);
      restartProgress();
    };

    const pauseAuto = () => {
      window.clearInterval(autoTimer);
      autoTimer = null;
      progressBar?.classList.remove("is-running");
    };

    thumbs?.addEventListener("click", (event) => {
      const thumb = event.target.closest(".deal-pick-thumb");
      if (!thumb || !thumbs.contains(thumb)) return;
      goToSlide(Number(thumb.dataset.dealPickIndex) || 0);
      restartAuto();
    });

    thumbs?.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      goToSlide(index + (event.key === "ArrowRight" ? 1 : -1));
      thumbs.querySelector(".deal-pick-thumb.is-active")?.focus();
      restartAuto();
    });

    detailLink?.addEventListener("click", (event) => {
      event.preventDefault();
      navigateWithPageTransition(getDetailUrl(slides[index]));
    });

    titleEl?.addEventListener("click", () => {
      navigateWithPageTransition(getDetailUrl(slides[index]));
    });

    root.addEventListener("pointerenter", pauseAuto);
    root.addEventListener("pointerleave", restartAuto);
    root.addEventListener("focusin", pauseAuto);
    root.addEventListener("focusout", (event) => {
      if (!root.contains(event.relatedTarget)) restartAuto();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pauseAuto();
      else restartAuto();
    });

    renderThumbs();
    renderDetail();
    restartAuto();
  };

  initDealPickCompact();
})();
