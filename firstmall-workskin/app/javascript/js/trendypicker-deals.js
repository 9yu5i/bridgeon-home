(() => {
  const IMG = "/data/skin/responsive_food_mealkit_gl/images/";
  const navigateWithPageTransition = (href) => { if (href) window.location.href = href; };
  const getProductDetailUrl = (path) => path || "/goods/catalog?code=0008";
  const DEFAULT_DETAIL_URL = "/goods/catalog?code=0008";
  const getGoodsNo = (item) => {
    const directValue = String(item?.goodsNo || "").trim();
    if (directValue) return directValue;
    const match = String(item?.detailUrl || "").match(/[?&]no=(\d+)/);
    return match ? match[1] : "";
  };
  const dealWishlistState = new Map();
  const pendingDealWishlist = new Map();
  const setDealWishlistButtonState = (button, active) => {
    if (!button) return;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
    button.setAttribute(
      "aria-label",
      active ? "Remove from wishlist" : "Add to wishlist",
    );
  };
  const readGoodsNoFromRequest = (settings) => {
    const data = settings?.data;
    if (!data) return "";
    if (typeof data === "object" && data.goods_seq) return String(data.goods_seq);
    const match = String(data).match(/(?:^|&)goods_seq=([^&]+)/);
    return match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : "";
  };
  const reconcileDealWishlist = (settings, response) => {
    if (!String(settings?.url || "").includes("/mypage/wish_add_ajax_toggle")) return;

    const goodsNo = readGoodsNoFromRequest(settings);
    const pending = pendingDealWishlist.get(goodsNo);
    if (!pending) return;

    const result = response?.result;
    const active = result === "add" ? true : result === "del" ? false : pending.previous;
    dealWishlistState.set(goodsNo, active);
    if (pending.button.dataset.goodsNo === goodsNo) {
      setDealWishlistButtonState(pending.button, active);
      pending.button.disabled = false;
    }
    window.clearTimeout(pending.timeout);
    pendingDealWishlist.delete(goodsNo);
  };
  const requestDealWishlistToggle = (button, goodsNo) => {
    if (typeof window.display_goods_zzim === "function") {
      window.display_goods_zzim(button, goodsNo);
      return true;
    }
    if (!window.jQuery) return false;
    window.jQuery.ajax({
      url: "/mypage/wish_add_ajax_toggle",
      data: { goods_seq: goodsNo },
      dataType: "json",
      global: true,
    });
    return true;
  };

  if (window.jQuery) {
    window.jQuery(document).on(
      "ajaxSuccess.trendypickerDealWishlist",
      (_event, xhr, settings, data) => {
        reconcileDealWishlist(settings, data || xhr?.responseJSON);
      },
    );
    window.jQuery(document).on(
      "ajaxError.trendypickerDealWishlist",
      (_event, _xhr, settings) => reconcileDealWishlist(settings, null),
    );
  }
  const openCartQuickview = (button, goodsNo, event) => {
    if (!goodsNo) return;
    event?.preventDefault();
    event?.stopPropagation();
    if (typeof window.displayAddToCartQuickview2 === "function") {
      window.displayAddToCartQuickview2(button, goodsNo, event);
      return;
    }
    if (typeof window.displayAddToCartQuickview === "function") {
      window.displayAddToCartQuickview(button, goodsNo);
    }
  };

  // Live countdown helpers, shared by the time card + compact banner. Hours are
  // not capped at 24, so multi-day deals still read correctly.
  const pad2 = (n) => String(n).padStart(2, "0");
  const fmtCountdown = (endTs) => {
    let s = Math.max(0, Math.floor((endTs - Date.now()) / 1000));
    const h = Math.floor(s / 3600);
    s -= h * 3600;
    return [pad2(h), pad2(Math.floor(s / 60)), pad2(s % 60)];
  };
  const paintTimer = (el, endTs) => {
    if (!el || !endTs) return;
    const [h, m, s] = fmtCountdown(endTs);
    el.innerHTML =
      `<span class="deal-timer-unit"><b>${h}</b><em>HRS</em></span>` +
      `<span class="deal-timer-separator">:</span>` +
      `<span class="deal-timer-unit"><b>${m}</b><em>MIN</em></span>` +
      `<span class="deal-timer-separator">:</span>` +
      `<span class="deal-timer-unit"><b>${s}</b><em>SEC</em></span>`;
  };
  const startTimedealTicker = () => {
    if (window.__tpDealTicker) window.clearInterval(window.__tpDealTicker);
    window.__tpDealTicker = window.setInterval(() => {
      document.querySelectorAll(".deal-card.time").forEach((c) => {
        if (c.__tpEndTs) paintTimer(c.querySelector(".deal-timer"), c.__tpEndTs);
      });
      const comp = document.querySelector("[data-deal-time-compact]");
      if (comp && comp.__tpEndTs) {
        paintTimer(comp.querySelector("[data-deal-time-banner-timer]"), comp.__tpEndTs);
      }
    }, 1000);
  };

  // Match the Time Deal page while the live product fragment is loading. The
  // current schedule changes at noon and midnight; a product's own event end
  // time replaces this value as soon as its card data is available.
  const getNextTimedealBoundaryTs = () => {
    const now = new Date();
    const next = new Date(now.getTime());
    if (now.getHours() < 12) next.setHours(12, 0, 0, 0);
    else {
      next.setDate(next.getDate() + 1);
      next.setHours(0, 0, 0, 0);
    }
    return next.getTime();
  };

  const seedTimedealTimers = () => {
    const endTs = getNextTimedealBoundaryTs();
    const card = document.querySelector(".deal-card.time");
    const compact = document.querySelector("[data-deal-time-compact]");

    if (card) {
      card.__tpEndTs = endTs;
      paintTimer(card.querySelector(".deal-timer"), endTs);
    }
    if (compact) {
      compact.__tpEndTs = endTs;
      paintTimer(compact.querySelector("[data-deal-time-banner-timer]"), endTs);
    }
    startTimedealTicker();
  };

  // Placeholder product thumbnails (real catalog images, served already) so
  // Today's Pick is not broken before a display group is wired. The catalog is
  // K-beauty only, so these images won't category-match the example names.
  const TP = [
    "https://d1l1qu21r0179n.cloudfront.net/crawl/yesstyle/1136653506/300_list.jpg",
    "https://d1l1qu21r0179n.cloudfront.net/crawl/yesstyle/1114251519/300_list.jpg",
    "https://d1l1qu21r0179n.cloudfront.net/crawl/yesstyle/1136347992/300_list.jpg",
    "https://d1l1qu21r0179n.cloudfront.net/crawl/yesstyle/1133317070/300_list.jpg",
  ];

  // Fixed image for the desktop Time Deal card's media slot (the live timedeal
  // product supplies the name/price/countdown; the image is this graphic).
  const TIME_CARD_IMAGE = IMG + "main/extimedeal1.png";

  const dealSliderData = {
    // Today's Pick — example curation, one per category (K-POP excluded).
    // Swap for a real Firstmall display group via {=showDesignDisplay(no)}.
    special: [
      { badge: "This Week Pick", brand: "lilybyred", title: "Luv Beam Glow Veil", quote: "A soft lavender glow veil for a luminous, dewy finish.", price: "US$16.20", originalPrice: "US$20.25", discount: "20% OFF", mediaImage: TP[0], cardImage: IMG + "main/TODAYSPICK1.png", cta: "Discover This Pick", detailUrl: "/goods/view?no=92928" },
      { badge: "This Week Pick", brand: "Ottogi", title: "Jin Ramen Multipack", quote: "A savory Korean classic — quick, rich, and deeply satisfying.", price: "US$12.90", originalPrice: "US$18.00", discount: "28% OFF", mediaImage: TP[1], cardImage: IMG + "main/TODAYSPICK2.png", cta: "Discover This Pick", detailUrl: "/goods/view?no=93172" },
      { badge: "This Week Pick", brand: "Kakao Friends", title: "Ryan Face Cushion", quote: "Soft, huggable comfort that adds instant charm to any room.", price: "US$34.00", originalPrice: "US$42.00", discount: "19% OFF", mediaImage: TP[2], cta: "Discover This Pick", detailUrl: "/goods/view?no=93082" },
      { badge: "This Week Pick", brand: "Osulloc", title: "Jeju Green Tea Gift Set", quote: "Premium Jeju green tea — a timeless Korean ritual.", price: "US$28.00", originalPrice: "US$40.00", discount: "30% OFF", mediaImage: TP[3], cta: "Discover This Pick", detailUrl: "/goods/view?no=93343" },
    ],
    // Flash Time Deal — populated at runtime from the live "on sale now"
    // timedeal listing (loadTimedeal below). Empty until that resolves.
    time: [],
  };
  let hasMoreTimedeals = false;

  const initDealSliderCard = (card) => {
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
    const wishlistButton = card.querySelector(".deal-share-button");
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
      // A product with cardImage turns the whole special card into a full-bleed
      // image (set as the card's background) with the copy overlaid
      // (tp-card-image); others keep the split card + thumbnail.
      const fullCard = sliderKey === "special" ? item.cardImage : null;
      card.classList.toggle("tp-card-image", !!fullCard);
      if (fullCard) card.style.setProperty("--tp-card-image", `url("${fullCard}")`);
      else card.style.removeProperty("--tp-card-image");
      if (mediaImage) {
        const src = sliderKey === "time" ? TIME_CARD_IMAGE : item.mediaImage;
        if (src) mediaImage.src = src;
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
      if (sliderKey === "time") card.__tpEndTs = item.endTs || null;
      if (timer) {
        if (item.endTs) paintTimer(timer, item.endTs);
        else if (item.timer) timer.innerHTML = renderTimer(item.timer);
      }
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
      if (sliderKey === "special" && wishlistButton) {
        const goodsNo = getGoodsNo(item);
        wishlistButton.dataset.goodsNo = goodsNo;
        wishlistButton.disabled = !goodsNo || pendingDealWishlist.has(goodsNo);
        setDealWishlistButtonState(
          wishlistButton,
          goodsNo ? dealWishlistState.get(goodsNo) === true : false,
        );
      }
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
      if (sliderKey === "time" && hasMoreTimedeals && index === slides.length - 1) {
        navigateWithPageTransition("/promotion/timedeal");
        return;
      }
      goNext();
      restartAuto();
    });

    // Special "Discover This Pick" -> the product detail page.
    // Time "Shop This Deal" -> the Time Deal page (the whole deal, not one item);
    // the product name + image still open that product's detail page.
    shopButton?.addEventListener("click", () => {
      navigateWithPageTransition(
        sliderKey === "time" ? "/promotion/timedeal" : getCurrentDetailUrl(),
      );
    });

    const goDetail = () => navigateWithPageTransition(getCurrentDetailUrl());
    [title, productName, mediaImage].forEach((el) => {
      if (!el) return;
      el.style.cursor = "pointer";
      el.addEventListener("click", goDetail);
    });

    // Today's Pick: clicking anywhere on the card opens the product detail —
    // except the slider arrows and the wishlist toggle.
    if (sliderKey === "special") {
      wishlistButton?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const goodsNo = wishlistButton.dataset.goodsNo || "";
        if (!goodsNo || pendingDealWishlist.has(goodsNo)) return;

        const previous = wishlistButton.getAttribute("aria-pressed") === "true";
        dealWishlistState.set(goodsNo, !previous);
        setDealWishlistButtonState(wishlistButton, !previous);
        wishlistButton.disabled = true;
        const timeout = window.setTimeout(() => {
          const pending = pendingDealWishlist.get(goodsNo);
          if (!pending) return;
          dealWishlistState.set(goodsNo, previous);
          if (wishlistButton.dataset.goodsNo === goodsNo) {
            setDealWishlistButtonState(wishlistButton, previous);
            wishlistButton.disabled = false;
          }
          pendingDealWishlist.delete(goodsNo);
        }, 10000);
        pendingDealWishlist.set(goodsNo, { button: wishlistButton, previous, timeout });

        try {
          if (!requestDealWishlistToggle(wishlistButton, goodsNo)) {
            throw new Error("Wishlist request is unavailable");
          }
        } catch (_error) {
          window.clearTimeout(timeout);
          dealWishlistState.set(goodsNo, previous);
          setDealWishlistButtonState(wishlistButton, previous);
          wishlistButton.disabled = false;
          pendingDealWishlist.delete(goodsNo);
        }
      });
      card.style.cursor = "pointer";
      card.addEventListener("click", (event) => {
        if (event.target.closest(".deal-nav, .deal-nav-btn, .deal-share-button")) return;
        goDetail();
      });
    }

    renderSlide();
    restartAuto();
  };

  document
    .querySelectorAll(".deal-card[data-deal-slider]")
    .forEach(initDealSliderCard);

  seedTimedealTimers();

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
    const hasMore = hasMoreTimedeals;
    let pageIndex = 0;
    let swipeStart = null;

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

      root.__tpEndTs = item.endTs || null;
      if (bannerTimer) {
        if (item.endTs) paintTimer(bannerTimer, item.endTs);
        else if (item.timer) bannerTimer.innerHTML = renderTimer(item.timer);
      }
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
            <article class="deal-time-rail-card" data-product-detail-link="${escapeHtml(item.detailUrl || DEFAULT_DETAIL_URL)}" data-goods-no="${escapeHtml(getGoodsNo(item))}">
              <div class="deal-time-rail-body">
                <a class="deal-time-rail-thumb" href="${detailUrl}">
                  <img src="${escapeHtml(item.mediaImage)}" alt="${brand} ${name}">
                </a>
                <div class="deal-time-rail-info">
                  <a href="${detailUrl}">
                    <p class="deal-time-rail-brand">${brand}</p>
                    <h4 class="deal-time-rail-name">${name}</h4>
                    <div class="deal-time-rail-price">
                      <span class="deal-time-rail-price-row">
                        <del>${escapeHtml(item.originalPrice)}</del>
                        <span class="discount">${escapeHtml(discount)}</span>
                      </span>
                      <strong>${escapeHtml(item.price)}</strong>
                    </div>
                  </a>
                  <button type="button" class="deal-time-rail-cart" aria-label="Add ${name} to cart">
                    <img src="${IMG}listing/cart.png" alt="" aria-hidden="true">
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

    rail?.addEventListener("click", (event) => {
      const cartButton = event.target.closest(".deal-time-rail-cart");
      if (!cartButton || !rail.contains(cartButton)) return;
      const goodsNo = cartButton.closest("[data-goods-no]")?.dataset.goodsNo;
      openCartQuickview(cartButton, goodsNo, event);
    });

    // Only six products are previewed on Home. When more live deals exist, a
    // further swipe from the second page continues into the full Time Deal page.
    rail?.addEventListener(
      "touchstart",
      (event) => {
        const touch = event.touches[0];
        if (!touch) return;
        swipeStart = {
          x: touch.clientX,
          y: touch.clientY,
          page: Math.round(rail.scrollLeft / Math.max(rail.clientWidth, 1)),
        };
      },
      { passive: true },
    );

    rail?.addEventListener(
      "touchend",
      (event) => {
        const touch = event.changedTouches[0];
        if (!touch || !swipeStart) return;
        const deltaX = touch.clientX - swipeStart.x;
        const deltaY = touch.clientY - swipeStart.y;
        const startedOnLastPage = swipeStart.page === pages.length - 1;
        swipeStart = null;

        if (
          hasMore &&
          startedOnLastPage &&
          deltaX < -48 &&
          Math.abs(deltaX) > Math.abs(deltaY)
        ) {
          navigateWithPageTransition("/promotion/timedeal");
        }
      },
      { passive: true },
    );

    renderBanner();
    renderRail();
    renderDots();
    goToPage(0, "auto");
  };

  initDealTimeCompact();

  // Bind the Time Deal banner + its button to the featured product's Quickview
  // ONCE at load — independent of when the timedeal data arrives — and read the
  // current featured goods number at click time. Before data loads, the "Shop
  // All" link keeps its default (/promotion/timedeal) behaviour.
  (() => {
    const root = document.querySelector("[data-deal-time-compact]");
    if (!root) return;
    const banner = root.querySelector("[data-deal-time-banner]");
    const bannerShop = root.querySelector(".deal-time-banner-shop");
    const openFeatured = (event, el) => {
      const item = dealSliderData.time[0];
      const no = item && item.goodsNo;
      if (no && typeof window.display_goods_quickview === "function") {
        if (event) event.preventDefault();
        window.display_goods_quickview(el, no);
      }
    };
    if (banner) {
      banner.style.cursor = "pointer";
      banner.addEventListener("click", (event) => {
        if (event.target.closest(".deal-time-banner-shop")) return;
        openFeatured(event, banner);
      });
    }
    if (bannerShop) {
      bannerShop.addEventListener("click", (event) => openFeatured(event, bannerShop));
    }
  })();

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

    cartButton?.addEventListener("click", (event) => {
      openCartQuickview(cartButton, getGoodsNo(slides[index]), event);
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

  // ===== Live "on sale now" Time Deal =====================================
  // Read the ON SALE NOW goods fragment directly. Loading the full Time Deal
  // page in an iframe also runs its header and page-ready handlers, so an
  // unrelated header error could prevent the product list from ever rendering.
  const absUrl = (src) =>
    !src ? "" : /^https?:\/\//i.test(src) ? src : window.location.origin + src;

  const parseTimedealCards = (cards, dealEndTs) =>
    Array.prototype.map.call(cards, (c) => {
      const text = (sel) => {
        const el = c.querySelector(sel);
        return el ? el.textContent.trim() : "";
      };
      const countdownValue = (part) => {
        const el = c.querySelector(`[class*="solo${part}"]`);
        return el ? Number.parseInt(el.textContent, 10) || 0 : 0;
      };
      const link = c.querySelector('a[href*="/goods/view"]');
      const href = link ? link.getAttribute("href") || "" : "";
      const hrefMatch = /[?&]no=(\d+)/.exec(href) || /\/goods\/view\/no\/(\d+)/.exec(href);
      const id = c.getAttribute("data-goods-seq") || (hrefMatch ? hrefMatch[1] : "");
      const img = c.querySelector(".listing-card-image img, img.square_display");
      const sale = text(".sale_price .num");
      const cons = text(".consumer_price .num");
      const rate = text(".discount_rate .num") || text(".timedeal-card-deal-rate").replace(/[^0-9]/g, "");
      const fullTitle = text(".listing-card-title, .goods_name_area .name, .name");
      const titleBrand = /^\[([^\]]+)\]\s*/.exec(fullTitle);
      const hasProductCountdown = Boolean(
        c.querySelector(
          '[class*="soloday"], [class*="solohour"], [class*="solomin"], [class*="solosecond"]',
        ),
      );
      const remainingSeconds =
        countdownValue("day") * 86400 +
        countdownValue("hour") * 3600 +
        countdownValue("min") * 60 +
        countdownValue("second");
      const productEndTs =
        hasProductCountdown && remainingSeconds > 0
          ? Date.now() + remainingSeconds * 1000
          : dealEndTs;
      return {
        badge: "FLASH TIME DEAL",
        brand: text(".listing-card-brand") || (titleBrand ? titleBrand[1] : ""),
        title: fullTitle.replace(/^\[[^\]]+\]\s*/, ""),
        price: sale ? "US$" + sale : "",
        originalPrice: cons ? "US$" + cons : "",
        discount: rate ? rate + "% OFF" : "",
        mediaImage: img ? absUrl(img.getAttribute("src") || img.getAttribute("data-src")) : "",
        cta: "Shop This Deal",
        detailUrl: id ? "/goods/view?no=" + id : "/promotion/timedeal",
        goodsNo: id || "",
        endTs: productEndTs,
      };
    });

  const applyTimedeal = (items) => {
    const grid = document.querySelector(".deals-section .deal-grid");
    const timeCard = document.querySelector(".deal-card.time");
    const compact = document.querySelector("[data-deal-time-compact]");
    if (items == null) {
      // Do not expose a stale placeholder when the live Time Deal request fails.
      if (timeCard) {
        timeCard.style.display = "none";
        timeCard.setAttribute("aria-hidden", "true");
      }
      if (compact) {
        compact.style.display = "none";
        compact.setAttribute("aria-hidden", "true");
      }
      if (grid) grid.classList.add("tp-no-timedeal");
      return;
    }
    if (!items || !items.length) {
      // No active deals — drop the Time Deal column, let Today's Pick stand alone.
      if (timeCard) {
        timeCard.style.display = "none";
        timeCard.setAttribute("aria-hidden", "true");
      }
      if (compact) {
        compact.style.display = "none";
        compact.setAttribute("aria-hidden", "true");
      }
      if (grid) grid.classList.add("tp-no-timedeal");
      return;
    }
    hasMoreTimedeals = items.length > 6;
    dealSliderData.time = items.slice(0, 6);
    if (timeCard) {
      timeCard.style.display = "";
      timeCard.removeAttribute("aria-hidden");
      initDealSliderCard(timeCard);
    }
    if (compact) {
      compact.style.display = "";
      compact.removeAttribute("aria-hidden");
    }
    initDealTimeCompact();
    startTimedealTicker();
  };

  const loadTimedeal = () => {
    const params = new URLSearchParams({
      page: "1",
      searchMode: "timedeal",
      per: "40",
      sorting: "ranking",
      filter_display: "lattice",
      display_mode: "current",
    });

    window
      .fetch("/goods/search_list?" + params.toString(), {
        credentials: "same-origin",
      })
      .then((response) => {
        if (!response.ok) throw new Error("Time Deal goods request failed");
        return response.text();
      })
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const cards = doc.querySelectorAll(
          "li.goods_list_style5, .listing-card, li[data-goods-seq]",
        );
        applyTimedeal(parseTimedealCards(cards, getNextTimedealBoundaryTs()));
      })
      .catch(() => applyTimedeal(null));
  };

  const scheduleTimedeal = () => {
    if (!document.querySelector(".deals-section .deal-grid")) return;
    if (window.requestIdleCallback) window.requestIdleCallback(loadTimedeal, { timeout: 3000 });
    else window.setTimeout(loadTimedeal, 1200);
  };
  scheduleTimedeal();
})();


(() => {
  const todayPick = document.querySelector(".today-pick");
  const todayPickTrack = document.querySelector(".today-pick-track");

  if (!todayPick || !todayPickTrack) return;

  const todayPickToggle = document.querySelector(".today-pick-toggle");
  const todayPickSoldEl = document.querySelector(".today-pick-sold");
  const todayPickSoldCount = document.querySelector(".today-pick-sold-count");
  const todayPickProgress = document.querySelectorAll(".today-pick-progress button");
  const todayPickSlides = Array.prototype.slice.call(todayPickTrack.children);
  // Real "recently viewed" counts (last 30 days) keyed by goods_seq, emitted by
  // the main page (window.__tpTodayPickViews). Absent until the server snippet
  // is in place — the line then stays hidden rather than showing a fake number.
  const todayPickViews =
    window.__tpTodayPickViews && typeof window.__tpTodayPickViews === "object"
      ? window.__tpTodayPickViews
      : null;
  const todayPickViewFor = (i) => {
    if (!todayPickViews) return null;
    const seq = todayPickSlides[i] && todayPickSlides[i].getAttribute("data-goods");
    if (!seq || todayPickViews[seq] == null) return null;
    const n = Number(todayPickViews[seq]);
    return Number.isFinite(n) ? n : null;
  };
  const todayPickTotal = todayPickTrack.children.length;
  const desktopQuery = window.matchMedia("(min-width: 761px)");
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let todayPickIndex = 0;
  let todayPickTimer;
  let todayPickHoverPaused = false;
  let todayPickCollapsed = false;
  let todayPickAutoplayEnabled = !reduceMotionQuery.matches;

  const updateTodayPick = () => {
    todayPickTrack.style.transform = `translateX(-${todayPickIndex * 100}%)`;

    const views = todayPickViewFor(todayPickIndex);
    if (todayPickSoldEl) {
      if (views == null) {
        todayPickSoldEl.style.display = "none";
      } else {
        todayPickSoldEl.style.removeProperty("display");
        if (todayPickSoldCount) todayPickSoldCount.textContent = views.toLocaleString("en-US");
      }
    }

    todayPickProgress.forEach((button, index) => {
      const isActive = index === todayPickIndex;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  };

  const goToTodayPick = (index) => {
    todayPickIndex = (index + todayPickTotal) % todayPickTotal;
    updateTodayPick();
  };

  const stopTodayPickAutoplay = () => {
    window.clearInterval(todayPickTimer);
  };

  const startTodayPickAutoplay = () => {
    stopTodayPickAutoplay();
    if (!todayPickAutoplayEnabled || todayPickHoverPaused || todayPickCollapsed || todayPickTotal <= 1) return;
    todayPickTimer = window.setInterval(() => goToTodayPick(todayPickIndex + 1), 5000);
  };

  const resetTodayPickAutoplay = () => {
    if (todayPickAutoplayEnabled && !todayPickCollapsed) startTodayPickAutoplay();
  };

  const measureTodayPickHeight = () => {
    const wasCollapsed = todayPickCollapsed;
    if (wasCollapsed) todayPick.classList.remove("is-collapsed");

    const previousInlineHeight = todayPick.style.height;
    todayPick.style.height = "auto";
    todayPick.style.setProperty("--today-pick-height", `${todayPick.offsetHeight}px`);
    todayPick.style.height = previousInlineHeight;

    if (wasCollapsed) todayPick.classList.add("is-collapsed");
  };

  const setTodayPickCollapsed = (collapsed) => {
    if (collapsed && !todayPickCollapsed) measureTodayPickHeight();

    todayPickCollapsed = collapsed;
    todayPick.classList.toggle("is-collapsed", collapsed);
    todayPickToggle?.setAttribute("aria-expanded", collapsed ? "false" : "true");
    todayPickToggle?.setAttribute("aria-label", collapsed ? "Expand today's pick" : "Collapse today's pick");

    if (collapsed) {
      stopTodayPickAutoplay();
    } else {
      todayPick.style.removeProperty("height");
      startTodayPickAutoplay();
    }
  };

  todayPickToggle?.addEventListener("click", () => {
    setTodayPickCollapsed(!todayPickCollapsed);
  });

  todayPickProgress.forEach((button, index) => {
    button.addEventListener("click", () => {
      goToTodayPick(index);
      resetTodayPickAutoplay();
    });
  });

  todayPick.addEventListener("mouseenter", () => {
    todayPickHoverPaused = true;
    stopTodayPickAutoplay();
  });

  todayPick.addEventListener("mouseleave", () => {
    todayPickHoverPaused = false;
    startTodayPickAutoplay();
  });

  todayPick.addEventListener("focusin", () => {
    todayPickHoverPaused = true;
    stopTodayPickAutoplay();
  });

  todayPick.addEventListener("focusout", () => {
    todayPickHoverPaused = false;
    startTodayPickAutoplay();
  });

  todayPick.addEventListener("click", (event) => {
    if (!desktopQuery.matches) return;
    if (event.target.closest("button, a")) return;

    const target = document.querySelector(".deal-card.special .deal-copy");
    if (!target) return;

    target.scrollIntoView({
      behavior: reduceMotionQuery.matches ? "auto" : "smooth",
      block: "center",
    });
  });

  updateTodayPick();
  measureTodayPickHeight();
  window.addEventListener("resize", measureTodayPickHeight);
  startTodayPickAutoplay();
})();
