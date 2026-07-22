(() => {

  const feed = document.getElementById("realtrend-feed");

  const track = document.getElementById("realtrend-track");

  const progressBars = document.querySelectorAll(".realtrend-progress");

  const progressFills = document.querySelectorAll(".realtrend-progress-fill");

  const qtyOutput = document.getElementById("realtrend-qty");



  if (!feed || !track) return;



  const slides = Array.from(track.querySelectorAll(".realtrend-slide"));

  const slideProductOptions = [

    ["No.3 PHA Skin Prep Bubble Mask 90ml", "No.3 PHA Skin Prep Bubble Mask 180ml"],

    ["Heartleaf 77% Soothing Toner 250ml", "Heartleaf 77% Soothing Toner 500ml"],

    ["Relief Sun Rice + Probiotics SPF50+ 50ml", "Relief Sun Rice + Probiotics SPF50+ 100ml"],

  ];

  const wishlistedSlideKeys = new Set();



  const getSlideWishKey = (slide) => {

    if (!slide) return null;

    return String(slide.dataset.index ?? slides.indexOf(slide));

  };



  const applyProductWishState = (productCard, slide) => {

    if (window.BridgeOn?.wishlist?.syncButtons) {

      window.BridgeOn.wishlist.syncButtons(productCard);

      return;

    }

    const key = getSlideWishKey(slide);

    const isWishlisted = key !== null && wishlistedSlideKeys.has(key);

    productCard?.querySelectorAll(".realtrend-wish").forEach((button) => {

      button.classList.toggle("is-active", isWishlisted);

      button.setAttribute("aria-pressed", isWishlisted ? "true" : "false");

      button.setAttribute("aria-label", isWishlisted ? "Remove from wishlist" : "Add to wishlist");

    });

  };

  const getBrandHref = (brand) => {

    const slug = brand

      .trim()

      .toLowerCase()

      .replace(/[^\w\s-]/g, "")

      .replace(/\s+/g, "-");

    return `../brand/detail.html?brand=${slug}`;

  };



  const resetSocialToggle = (button) => {

    button.classList.remove("is-active");

    button.setAttribute("aria-pressed", "false");

    const icon = button.querySelector("img");

    const defaultSrc = icon?.getAttribute("data-icon-default");

    if (icon && defaultSrc) icon.src = defaultSrc;

  };



  const syncRealtrendBundlePricing = (card = document.querySelector(".realtrend-product-card")) => {
    if (!card) return;

    const qtyEl = document.getElementById("realtrend-qty") || card.querySelector(".realtrend-qty output");
    const quantity = Number(qtyEl?.textContent || 1) || 1;
    const basePriceText =
      card.dataset.sheetBasePrice ||
      card.querySelector(".realtrend-price strong")?.textContent?.trim() ||
      "US$22.00";
    const basePrice =
      window.BridgeOn?.cart?.parsePrice?.(basePriceText) ||
      Number.parseFloat(String(basePriceText).replace(/[^\d.]/g, "")) ||
      0;
    const bundleTiers =
      window.BridgeOn?.cart?.defaultBundleTiers ||
      [
        { qty: 2, discount: 5 },
        { qty: 3, discount: 10 },
        { qty: 4, discount: 15 },
      ];
    const activeBundle =
      window.BridgeOn?.cart?.getActiveBundleTier?.(bundleTiers, quantity) ||
      bundleTiers.reduce((active, tier) => (quantity >= tier.qty ? tier : active), null);
    const unitPrice = activeBundle ? basePrice * (1 - activeBundle.discount / 100) : basePrice;
    const priceStrong = card.querySelector(".realtrend-price strong");
    const priceRow = card.querySelector(".realtrend-price");
    let bundleMark = priceRow?.querySelector(".realtrend-bundle-mark");

    if (priceRow && !bundleMark) {
      bundleMark = document.createElement("span");
      bundleMark.className = "realtrend-bundle-mark";
      bundleMark.hidden = true;
      priceRow.appendChild(bundleMark);
    }

    if (priceStrong) {
      priceStrong.textContent =
        window.BridgeOn?.cart?.formatPrice?.(unitPrice) || `US$${Number(unitPrice || 0).toFixed(2)}`;
    }

    if (bundleMark) {
      if (activeBundle) {
        bundleMark.hidden = false;
        bundleMark.textContent = `Bundle ${activeBundle.qty}+ · ${activeBundle.discount}% OFF`;
      } else {
        bundleMark.hidden = true;
        bundleMark.textContent = "";
      }
    }

    card.classList.toggle("is-bundle-active", Boolean(activeBundle));
  };

  const syncProductCardFromSlide = (slide) => {

    const productCard = document.querySelector(".realtrend-product-card");

    const mobileCopy = slide?.querySelector(".realtrend-mobile-product-copy");

    if (!mobileCopy || !productCard) return;



    const brandEl = productCard.querySelector(".realtrend-brand");

    const nameEl = productCard.querySelector(".realtrend-product-name");

    const priceStrong = productCard.querySelector(".realtrend-price strong");

    const priceDel = productCard.querySelector(".realtrend-price del");

    const priceMark = productCard.querySelector(".realtrend-price mark");

    const select = productCard.querySelector(".realtrend-field select");

    const qtyEl = document.getElementById("realtrend-qty");



    const brand = mobileCopy.querySelector(".realtrend-brand")?.textContent?.trim();

    const name = mobileCopy.querySelector("h3")?.textContent?.trim();

    const strong = mobileCopy.querySelector(".realtrend-mobile-price strong")?.textContent?.trim();

    const del = mobileCopy.querySelector(".realtrend-mobile-price del")?.textContent?.trim();



    if (brandEl && brand) {

      brandEl.textContent = brand;

      if (brandEl instanceof HTMLAnchorElement) brandEl.href = getBrandHref(brand);

    }

    if (nameEl && name) nameEl.textContent = name;

    if (priceStrong && strong) {
      productCard.dataset.sheetBasePrice = strong;
      priceStrong.textContent = strong;
    }

    if (priceDel && del) priceDel.textContent = del;



    const sale = Number.parseFloat(strong?.replace(/[^\d.]/g, "") || "0");

    const original = Number.parseFloat(del?.replace(/[^\d.]/g, "") || "0");

    if (priceMark && original > sale) {

      priceMark.textContent = `${Math.round((1 - sale / original) * 100)}% OFF`;

    }



    const slideIndex = Number(slide.dataset.index ?? slides.indexOf(slide));

    const options = slideProductOptions[slideIndex] || (name ? [name, name] : []);



    if (select && options.length) {

      if (select.options[0]) select.options[0].textContent = options[0];

      if (select.options[1]) select.options[1].textContent = options[1] || options[0];

      select.selectedIndex = 0;

      select.closest(".realtrend-select-wrap")?.dispatchEvent(new CustomEvent("realtrend-select-refresh"));

    }



    if (qtyEl) qtyEl.textContent = "1";

    syncRealtrendBundlePricing(productCard);



    productCard.classList.remove("is-select-open");

    productCard.closest(".realtrend-panel")?.classList.remove("is-select-open");

    productCard.querySelectorAll(".realtrend-select-wrap.is-open").forEach((wrap) => {

      wrap.classList.remove("is-open");

      wrap.querySelector(".realtrend-select-trigger")?.setAttribute("aria-expanded", "false");

      wrap.querySelector(".realtrend-select-menu")?.classList.remove("is-open");

    });

    applyProductWishState(productCard, slide);

  };

  const navButtons = document.querySelectorAll("[data-reel-direction]");

  const mediaAreas = document.querySelectorAll("[data-reel-media]");

  const playToggles = document.querySelectorAll(".realtrend-play-toggle");



  const queryReel = Number.parseInt(new URLSearchParams(window.location.search).get("reel") || "", 10);

  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));

  if (activeIndex < 0) activeIndex = 0;

  if (Number.isFinite(queryReel) && queryReel > 0) {
    activeIndex = (queryReel - 1) % slides.length;
  }



  let progressValue = 0;

  let playbackElapsed = 0;

  let progressTimer = null;

  let isAnimating = false;

  let isPlaying = true;

  let isScrubbing = false;
  let wheelLocked = false;
  let touchStartY = 0;
  let touchDidSwipe = false;



  const REEL_DURATION_MS = 12000;
  const PROGRESS_INTERVAL = 40;
  const TRANSITION_MS = 450;
  const SWIPE_THRESHOLD = 48;
  const WHEEL_THRESHOLD = 12;
  const WHEEL_COOLDOWN_MS = 550;



  const getActiveSlide = () => slides[activeIndex];



  const getActiveVideo = () => getActiveSlide()?.querySelector(".realtrend-video");



  const getDurationMs = () => {

    const video = getActiveVideo();

    if (video && Number.isFinite(video.duration) && video.duration > 0) {

      return video.duration * 1000;

    }

    return REEL_DURATION_MS;

  };



  const syncSlideHeights = () => {

    const height = feed.clientHeight;

    slides.forEach((slide) => {

      slide.style.height = `${height}px`;

    });

    return height;

  };



  const updateTrack = (index, { animate = true } = {}) => {

    const height = syncSlideHeights();

    track.style.transition = animate

      ? `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`

      : "none";

    track.style.transform = `translateY(-${index * height}px)`;

  };



  const updateProgressUI = () => {

    progressFills.forEach((fill) => {

      fill.style.width = `${progressValue}%`;

    });

    progressBars.forEach((bar) => {

      bar.setAttribute("aria-valuenow", String(Math.round(progressValue)));

    });

  };



  const syncVideoTime = () => {

    const video = getActiveVideo();

    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;

    video.currentTime = (progressValue / 100) * video.duration;

  };



  const setProgress = (percent, { syncVideo = true } = {}) => {

    progressValue = Math.max(0, Math.min(100, percent));

    playbackElapsed = (progressValue / 100) * getDurationMs();

    updateProgressUI();

    if (syncVideo) syncVideoTime();

  };



  const updatePlayOverlay = () => {

    slides.forEach((slide, index) => {

      const media = slide.querySelector("[data-reel-media]");

      const toggle = slide.querySelector(".realtrend-play-toggle");

      const video = slide.querySelector(".realtrend-video");

      const isActive = index === activeIndex;

      const showPlay = isActive && !isPlaying;



      media?.classList.toggle("is-paused", showPlay);

      toggle?.classList.toggle("is-visible", showPlay);

      toggle?.setAttribute("aria-pressed", isPlaying ? "true" : "false");

      toggle?.setAttribute("aria-label", isPlaying ? "Pause reel" : "Play reel");



      if (!video) return;



      if (isActive && isPlaying) {

        video.play().catch(() => {});

      } else {

        video.pause();

      }

    });

  };



  const setActiveSlide = (index, { animate = true, resumePlayback = true } = {}) => {

    if (isAnimating) return;



    const nextIndex = (index + slides.length) % slides.length;

    if (nextIndex === activeIndex && animate) return;



    activeIndex = nextIndex;



    slides.forEach((slide, i) => {

      const isActive = i === activeIndex;

      slide.classList.toggle("is-active", isActive);

      slide.setAttribute("aria-hidden", isActive ? "false" : "true");

    });



    updateTrack(activeIndex, { animate });



    progressValue = 0;

    playbackElapsed = 0;

    updateProgressUI();

    syncVideoTime();



    if (resumePlayback) {

      isPlaying = true;

    }



    updatePlayOverlay();



    syncProductCardFromSlide(getActiveSlide());



    if (animate) {

      isAnimating = true;

      window.setTimeout(() => {

        isAnimating = false;

      }, TRANSITION_MS);

    }

  };



  const togglePlayPause = () => {

    isPlaying = !isPlaying;

    updatePlayOverlay();



    if (isPlaying) startProgress();

    else stopProgress();

  };



  const goByDirection = (direction) => {

    stopProgress();

    setActiveSlide(activeIndex + direction, { resumePlayback: true });

    startProgress();

  };



  const tickProgress = () => {

    if (!isPlaying || isScrubbing) return;



    playbackElapsed = Math.min(playbackElapsed + PROGRESS_INTERVAL, getDurationMs());

    progressValue = (playbackElapsed / getDurationMs()) * 100;

    updateProgressUI();

    syncVideoTime();



    if (progressValue >= 100) {

      stopProgress();

      setActiveSlide(activeIndex + 1, { resumePlayback: true });

      startProgress();

    }

  };



  const startProgress = () => {

    if (!isPlaying || isScrubbing) return;

    window.clearInterval(progressTimer);

    progressTimer = window.setInterval(tickProgress, PROGRESS_INTERVAL);

  };



  const stopProgress = () => {

    window.clearInterval(progressTimer);

    progressTimer = null;

  };



  const seekFromClientX = (bar, clientX) => {

    const rect = bar.getBoundingClientRect();

    if (!rect.width) return;

    const ratio = (clientX - rect.left) / rect.width;

    setProgress(ratio * 100);

  };



  const bindProgressScrub = (bar) => {

    const endScrub = () => {

      if (!isScrubbing) return;

      isScrubbing = false;

      bar.classList.remove("is-scrubbing");

      if (isPlaying) startProgress();

    };



    bar.addEventListener("pointerdown", (event) => {

      isScrubbing = true;

      stopProgress();

      bar.classList.add("is-scrubbing");

      bar.setPointerCapture(event.pointerId);

      seekFromClientX(bar, event.clientX);

      event.preventDefault();

      event.stopPropagation();

    });



    bar.addEventListener("pointermove", (event) => {

      if (!isScrubbing) return;

      seekFromClientX(bar, event.clientX);

      event.preventDefault();

    });



    bar.addEventListener("pointerup", (event) => {

      endScrub();

      event.stopPropagation();

    });



    bar.addEventListener("pointercancel", endScrub);



    bar.addEventListener("keydown", (event) => {

      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      event.preventDefault();

      const step = event.key === "ArrowRight" ? 5 : -5;

      setProgress(progressValue + step);

    });

  };



  const isSwipeBlockedTarget = (target) =>
    Boolean(
      target.closest(
        ".realtrend-progress, .realtrend-social, .realtrend-mobile-product, .realtrend-play-toggle",
      ),
    );

  const lockWheel = () => {
    wheelLocked = true;
    window.setTimeout(() => {
      wheelLocked = false;
    }, WHEEL_COOLDOWN_MS);
  };



  navButtons.forEach((button) => {

    button.addEventListener("click", () => {

      const direction = Number(button.dataset.reelDirection || 1);

      goByDirection(direction);

    });

  });



  mediaAreas.forEach((media) => {
    media.addEventListener("click", (event) => {
      if (touchDidSwipe) {
        touchDidSwipe = false;
        return;
      }

      if (event.target.closest(".realtrend-play-toggle")) return;

      const slide = media.closest(".realtrend-slide");

      if (!slide?.classList.contains("is-active")) return;

      event.stopPropagation();

      togglePlayPause();
    });
  });



  playToggles.forEach((button) => {

    button.addEventListener("click", (event) => {

      const slide = button.closest(".realtrend-slide");

      if (!slide?.classList.contains("is-active")) return;

      event.stopPropagation();

      togglePlayPause();

    });

  });



  progressBars.forEach(bindProgressScrub);



  const reelStage = feed.closest(".realtrend-stage");



  const handleReelWheel = (event) => {

    const isDesktop = window.matchMedia("(min-width: 1121px)").matches;



    if (isDesktop) {

      event.preventDefault();

    }



    if (isSwipeBlockedTarget(event.target)) return;

    if (Math.abs(event.deltaY) < WHEEL_THRESHOLD) return;

    if (wheelLocked || isAnimating) return;



    event.preventDefault();

    lockWheel();

    goByDirection(event.deltaY > 0 ? 1 : -1);

  };



  (reelStage || feed).addEventListener("wheel", handleReelWheel, { passive: false });



  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      goByDirection(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      goByDirection(-1);
    }
  });

  feed.addEventListener(
    "touchstart",
    (event) => {
      if (isSwipeBlockedTarget(event.target)) return;

      touchStartY = event.touches[0]?.clientY ?? 0;
      touchDidSwipe = false;
      stopProgress();
    },
    { passive: true },
  );

  feed.addEventListener(
    "touchend",
    (event) => {
      if (isSwipeBlockedTarget(event.target)) return;

      const touchEndY = event.changedTouches[0]?.clientY ?? 0;
      const delta = touchStartY - touchEndY;

      if (Math.abs(delta) > SWIPE_THRESHOLD) {
        touchDidSwipe = true;
        goByDirection(delta > 0 ? 1 : -1);
      } else if (isPlaying) {
        startProgress();
      }
    },
    { passive: true },
  );



  document.querySelectorAll("[data-qty]").forEach((button) => {

    button.addEventListener("click", () => {

      if (!qtyOutput) return;

      const step = Number(button.dataset.qty || 0);

      const next = Math.max(1, Number(qtyOutput.textContent || 1) + step);

      qtyOutput.textContent = String(next);

      syncRealtrendBundlePricing();

    });

  });



  document.querySelectorAll("[data-social-toggle]").forEach((button) => {

    const icon = button.querySelector("img");

    if (!icon) return;



    const defaultSrc = icon.getAttribute("data-icon-default") || icon.src;

    const activeSrc = icon.getAttribute("data-icon-active");

    if (!activeSrc) return;



    button.addEventListener("click", (event) => {

      event.stopPropagation();



      const isActive = button.classList.toggle("is-active");

      button.setAttribute("aria-pressed", isActive ? "true" : "false");

      icon.src = isActive ? activeSrc : defaultSrc;

    });

  });



  document.querySelectorAll(".realtrend-wish").forEach((button) => {

    button.addEventListener("click", () => {

      const activeSlide = getActiveSlide();

      const key = getSlideWishKey(activeSlide);

      if (!key) return;

      if (wishlistedSlideKeys.has(key)) wishlistedSlideKeys.delete(key);

      else wishlistedSlideKeys.add(key);

      applyProductWishState(document.querySelector(".realtrend-product-card"), activeSlide);

    });

  });



  const initRealtrendSelect = (wrap) => {

    const select = wrap.querySelector("select");

    const trigger = wrap.querySelector(".realtrend-select-trigger");

    const valueEl = wrap.querySelector(".realtrend-select-value");

    const menu = wrap.querySelector(".realtrend-select-menu");

    if (!select || !trigger || !valueEl || !menu) return null;

    const productCard = wrap.closest(".realtrend-product-card");



    const productPanel = wrap.closest(".realtrend-panel");



    const syncSelectOverflow = () => {

      const isOpen = Boolean(productCard?.querySelector(".realtrend-select-wrap.is-open"));

      productCard?.classList.toggle("is-select-open", isOpen);

      productPanel?.classList.toggle("is-select-open", isOpen);

    };



    const buildMenu = () => {

      menu.innerHTML = "";

      Array.from(select.options).forEach((option, index) => {

        const item = document.createElement("li");

        const isSelected = index === select.selectedIndex;

        item.setAttribute("role", "option");

        item.dataset.index = String(index);

        item.textContent = option.textContent;

        item.classList.toggle("is-selected", isSelected);

        item.setAttribute("aria-selected", isSelected ? "true" : "false");

        menu.appendChild(item);

      });



      valueEl.textContent = select.selectedOptions[0]?.textContent?.trim() || "";

    };



    const closeMenu = () => {

      wrap.classList.remove("is-open");

      trigger.setAttribute("aria-expanded", "false");

      menu.classList.remove("is-open");

      syncSelectOverflow();

    };



    const openMenu = () => {

      document.querySelectorAll(".realtrend-select-wrap.is-open").forEach((otherWrap) => {

        if (otherWrap === wrap) return;

        otherWrap.classList.remove("is-open");

        otherWrap.querySelector(".realtrend-select-trigger")?.setAttribute("aria-expanded", "false");

        const otherMenu = otherWrap.querySelector(".realtrend-select-menu");

        if (otherMenu) {

          otherMenu.classList.remove("is-open");

        }

      });



      wrap.classList.add("is-open");

      trigger.setAttribute("aria-expanded", "true");

      menu.classList.add("is-open");

      syncSelectOverflow();

    };



    const selectIndex = (index) => {

      if (index < 0 || index >= select.options.length) return;

      select.selectedIndex = index;

      buildMenu();

      window.BridgeOn?.wishlist?.syncButtons?.(productCard);

      closeMenu();

      select.dispatchEvent(new Event("change", { bubbles: true }));

    };



    buildMenu();



    trigger.addEventListener("click", (event) => {

      event.preventDefault();

      event.stopPropagation();

      if (wrap.classList.contains("is-open")) closeMenu();

      else openMenu();

    });



    menu.addEventListener("pointerdown", (event) => {

      event.stopPropagation();

    });



    menu.addEventListener("click", (event) => {

      event.preventDefault();

      event.stopPropagation();

      const item = event.target.closest('[role="option"]');

      if (!item) return;

      selectClickLock = true;

      window.setTimeout(() => {

        selectClickLock = false;

      }, 400);

      selectIndex(Number(item.dataset.index));

    });



    menu.addEventListener("keydown", (event) => {

      const items = Array.from(menu.querySelectorAll('[role="option"]'));

      const currentIndex = items.findIndex((item) => item.classList.contains("is-selected"));

      if (event.key === "Escape") {

        closeMenu();

        trigger.focus();

        return;

      }

      if (event.key === "ArrowDown") {

        event.preventDefault();

        const nextIndex = Math.min(currentIndex + 1, items.length - 1);

        items.forEach((item, index) => {

          const isSelected = index === nextIndex;

          item.classList.toggle("is-selected", isSelected);

          item.setAttribute("aria-selected", isSelected ? "true" : "false");

        });

        return;

      }

      if (event.key === "ArrowUp") {

        event.preventDefault();

        const nextIndex = Math.max(currentIndex - 1, 0);

        items.forEach((item, index) => {

          const isSelected = index === nextIndex;

          item.classList.toggle("is-selected", isSelected);

          item.setAttribute("aria-selected", isSelected ? "true" : "false");

        });

        return;

      }

      if (event.key === "Enter") {

        event.preventDefault();

        const selectedItem = items.find((item) => item.classList.contains("is-selected"));

        if (!selectedItem) return;

        selectIndex(Number(selectedItem.dataset.index));

      }

    });



    wrap.addEventListener("realtrend-select-refresh", buildMenu);



    return { buildMenu, closeMenu };

  };



  const realtrendSelectApis = new Map();

  let selectClickLock = false;



  document.querySelectorAll(".realtrend-select-wrap").forEach((wrap) => {

    const api = initRealtrendSelect(wrap);

    if (api) realtrendSelectApis.set(wrap, api);

  });



  document.addEventListener("click", (event) => {

    if (event.target.closest(".realtrend-select-wrap")) return;

    realtrendSelectApis.forEach((api) => api.closeMenu());

  });



  document.addEventListener("scroll", (event) => {

    const scrollTarget = event.target;

    if (scrollTarget instanceof Element && scrollTarget.closest(".realtrend-product-card")) return;

    realtrendSelectApis.forEach((api, wrap) => {

      if (wrap.classList.contains("is-open")) api.closeMenu();

    });

  }, true);



  slides.forEach((slide) => {

    const video = slide.querySelector(".realtrend-video");

    if (!video) return;



    video.addEventListener("loadedmetadata", () => {

      if (slide.classList.contains("is-active")) {

        syncVideoTime();

      }

    });



    video.addEventListener("ended", () => {

      if (!slide.classList.contains("is-active")) return;

      goByDirection(1);

    });

  });



  window.addEventListener("resize", () => {

    updateTrack(activeIndex, { animate: false });

  });

  if (typeof ResizeObserver !== "undefined") {
    const reelResizeObserver = new ResizeObserver(() => {
      updateTrack(activeIndex, { animate: false });
    });

    reelResizeObserver.observe(feed);
  }



  document.addEventListener("visibilitychange", () => {

    if (document.hidden) stopProgress();

    else if (isPlaying) startProgress();

  });



  setActiveSlide(activeIndex, { animate: false, resumePlayback: true });

  startProgress();



  const cartToast = document.getElementById("realtrend-cart-toast");

  const cartToastMessage = document.getElementById("realtrend-cart-toast-message");

  const cartToastClose = cartToast?.querySelector(".realtrend-cart-toast-close");

  const cartToastRing = cartToast?.querySelector(".realtrend-cart-toast-ring circle");

  const productNameEl = document.querySelector(".realtrend-product-name");

  const productSelect = document.querySelector(".realtrend-field select");

  const productCard = document.querySelector(".realtrend-product-card");

  const productPanel = document.querySelector(".realtrend-panel");

  const productSheetClose = document.querySelector(".realtrend-product-sheet-close");

  const CART_TOAST_RING_MS = 5000;

  let cartToastTimer = null;

  let sheetPausedPlayback = false;



  const getCartToastProductName = (button) => {

    const slideCard = button.closest(".realtrend-slide")?.querySelector(".realtrend-mobile-product-copy h3");

    if (slideCard?.textContent?.trim()) return slideCard.textContent.trim();



    const selectedOption = productSelect?.selectedOptions?.[0]?.textContent?.trim();

    if (selectedOption) return selectedOption;



    return productNameEl?.textContent?.trim() || "This product";

  };



  const getRealtrendCartPayload = () => {
    const brandEl = productCard?.querySelector(".realtrend-brand");
    const basePrice =
      productCard?.dataset.sheetBasePrice ||
      productCard?.querySelector(".realtrend-price strong")?.textContent?.trim() ||
      "US$22.00";
    const quantity = Number(productCard?.querySelector(".realtrend-qty output")?.textContent || 1) || 1;
    const bundleTiers =
      window.BridgeOn?.cart?.defaultBundleTiers ||
      [
        { qty: 2, discount: 5 },
        { qty: 3, discount: 10 },
        { qty: 4, discount: 15 },
      ];

    return {
      brand: brandEl?.textContent?.trim() || "BridgeOn",
      name: productNameEl?.textContent?.trim() || "Product",
      option: productSelect?.selectedOptions?.[0]?.textContent?.trim() || "",
      optionChoices: Array.from(productSelect?.options || [])
        .map((option) => option.textContent?.trim())
        .filter(Boolean),
      price: basePrice,
      basePrice,
      originalPrice: productCard?.querySelector(".realtrend-price del")?.textContent?.trim() || "",
      tone: "green",
      quantity,
      detailUrl: window.BridgeOn?.productDetailUrl || "../product-detail/product-detail.html",
      brandUrl: brandEl instanceof HTMLAnchorElement ? brandEl.href : "",
      hasBundleDeal: true,
      bundleTiers,
    };
  };



  const hideCartToast = () => {

    if (!cartToast?.classList.contains("is-visible")) return;

    window.clearTimeout(cartToastTimer);

    cartToastTimer = null;

    cartToast.classList.add("is-leaving");

    cartToast.classList.remove("is-visible");

    window.setTimeout(() => {

      cartToast.hidden = true;

      cartToast.setAttribute("aria-hidden", "true");

      cartToast.classList.remove("is-leaving");

      cartToastRing?.classList.remove("is-animating");

    }, 280);

  };



  const isDesktopViewport = () => window.matchMedia("(min-width: 1121px)").matches;

  const isMobileViewport = () => window.matchMedia("(max-width: 1120px)").matches;



  const closeProductSheet = () => {

    if (!document.body.classList.contains("is-product-sheet-open")) return;

    realtrendSelectApis.forEach((api) => api.closeMenu());

    hideCartToast();

    document.body.classList.remove("is-product-sheet-open");



    if (sheetPausedPlayback) {

      isPlaying = true;

      updatePlayOverlay();

      startProgress();

    }



    sheetPausedPlayback = false;

  };



  const openProductSheet = (button) => {

    if (!isMobileViewport()) return;



    const slide = button.closest(".realtrend-slide");

    syncProductCardFromSlide(slide);

    document.body.classList.add("is-product-sheet-open");



    sheetPausedPlayback = isPlaying;



    if (isPlaying) {

      isPlaying = false;

      stopProgress();

      updatePlayOverlay();

    }

  };



  const canShowCartToast = (button) => {

    if (!cartToast || !cartToastMessage || !button) return false;

    if (isDesktopViewport()) return true;

    if (!isMobileViewport()) return false;

    if (!document.body.classList.contains("is-product-sheet-open")) return false;

    return Boolean(button.closest(".realtrend-product-card"));

  };



  const showCartToast = (button) => {

    if (!canShowCartToast(button)) return;



    window.clearTimeout(cartToastTimer);

    cartToastTimer = null;

    cartToast.classList.remove("is-visible", "is-leaving");

    cartToastRing?.classList.remove("is-animating");

    void cartToastRing?.getBoundingClientRect();

    cartToastMessage.innerHTML = `<span class="realtrend-cart-toast-product">${getCartToastProductName(button)}</span> has been added to your cart.`;

    cartToast.hidden = false;

    cartToast.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {

      cartToast.classList.add("is-visible");

      cartToastRing?.classList.add("is-animating");

    });

    cartToastTimer = window.setTimeout(hideCartToast, CART_TOAST_RING_MS);

  };



  document.querySelectorAll(".realtrend-add-cart").forEach((button) => {

    button.addEventListener("click", (event) => {

      if (selectClickLock) {

        event.preventDefault();

        return;

      }

      if (button.closest(".realtrend-product-card")?.classList.contains("is-select-open")) {

        event.preventDefault();

        return;

      }

      window.BridgeOn?.cart?.add(getRealtrendCartPayload());

      showCartToast(button);

    });

  });



  document.querySelectorAll(".realtrend-mobile-add").forEach((button) => {

    button.addEventListener("click", () => openProductSheet(button));

  });



  productPanel?.addEventListener("click", (event) => {

    if (event.target.closest(".realtrend-product-card")) return;

    closeProductSheet();

  });



  productCard?.addEventListener("click", (event) => {

    event.stopPropagation();

  });



  productSheetClose?.addEventListener("click", closeProductSheet);



  document.addEventListener("keydown", (event) => {

    if (event.key === "Escape" && document.body.classList.contains("is-product-sheet-open")) {

      closeProductSheet();

    }

  });



  cartToastClose?.addEventListener("click", hideCartToast);

  window.addEventListener("resize", () => {
    if (!isDesktopViewport() && !document.body.classList.contains("is-product-sheet-open")) hideCartToast();
    if (!isMobileViewport()) closeProductSheet();
  });

})();

