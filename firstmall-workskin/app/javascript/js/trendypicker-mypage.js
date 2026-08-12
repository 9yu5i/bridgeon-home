/**
 * TrendyPicker My Page shared shell
 * Loaded on account pages, Help Center, and service shells.
 *
 * 1. Same-origin page transitions + scroll-to-top
 * 2. Dashboard reveal, live-order track modal, avatar upload
 * 3. Coupon / review / wishlist brand hydrators
 * 4. Reviews filters + edit layer
 * 5. Logout confirm
 */
(() => {
  const pageTransitionKey = "trendypicker-page-transition";
  const scrollTopOnNavigationKey = "trendypicker-scroll-top";
  const pageTransitionDuration = 320;

  const shouldAnimatePageTransition = () =>
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const hasNativeCrossDocumentTransitions = () => "PageRevealEvent" in window;

  const resolveSameOriginUrl = (href) => {
    try {
      const url = new URL(href, window.location.href);
      return url.origin === window.location.origin ? url : null;
    } catch {
      return null;
    }
  };

  const isHashOnlyNavigation = (url) =>
    url.pathname === window.location.pathname &&
    url.search === window.location.search &&
    Boolean(url.hash);

  const markScrollTopOnNextPage = (url) => {
    try {
      sessionStorage.setItem(scrollTopOnNavigationKey, url.href);
    } catch {
      // Continue without scroll restoration when storage is unavailable.
    }
  };

  const forceScrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const consumeScrollTopOnLoad = () => {
    let requestedUrl = "";

    try {
      requestedUrl = sessionStorage.getItem(scrollTopOnNavigationKey) || "";
    } catch {
      return false;
    }

    const currentUrl = new URL(window.location.href);
    currentUrl.hash = "";
    const targetUrl = requestedUrl ? resolveSameOriginUrl(requestedUrl) : null;
    if (targetUrl) targetUrl.hash = "";

    if (!(requestedUrl === "1" || targetUrl?.href === currentUrl.href)) return false;

    try {
      sessionStorage.removeItem(scrollTopOnNavigationKey);
    } catch {
      // Continue when storage is unavailable.
    }

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
      window.addEventListener(
        "pagehide",
        () => {
          history.scrollRestoration = "auto";
        },
        { once: true },
      );
    }

    forceScrollToTop();
    window.requestAnimationFrame(() => {
      forceScrollToTop();
      window.requestAnimationFrame(forceScrollToTop);
    });

    if (document.readyState === "complete") {
      window.setTimeout(forceScrollToTop, 0);
    } else {
      window.addEventListener("load", forceScrollToTop, { once: true });
    }

    return true;
  };

  const navigateWithPageTransition = (href) => {
    const url = resolveSameOriginUrl(href);
    if (!url || isHashOnlyNavigation(url)) {
      window.location.href = href;
      return;
    }

    markScrollTopOnNextPage(url);

    if (!shouldAnimatePageTransition() || hasNativeCrossDocumentTransitions()) {
      window.location.href = url.href;
      return;
    }

    try {
      sessionStorage.setItem(pageTransitionKey, "1");
    } catch {
      window.location.href = url.href;
      return;
    }

    document.documentElement.classList.add("is-page-leaving");
    window.setTimeout(() => {
      window.location.href = url.href;
    }, pageTransitionDuration);
  };

  const isForwardPageLink = (link, event) => {
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return false;
    if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;

    const url = resolveSameOriginUrl(href);
    return Boolean(url && !isHashOnlyNavigation(url));
  };

  const initPageTransitions = () => {
    document.addEventListener(
      "click",
      (event) => {
        const link = event.target.closest("a[href]");
        if (!isForwardPageLink(link, event)) return;
        markScrollTopOnNextPage(resolveSameOriginUrl(link.getAttribute("href")));
      },
      true,
    );

    if (!shouldAnimatePageTransition()) return;

    if (!hasNativeCrossDocumentTransitions()) {
      try {
        if (sessionStorage.getItem(pageTransitionKey)) {
          sessionStorage.removeItem(pageTransitionKey);
          document.documentElement.classList.add("is-page-entering");
          window.setTimeout(() => {
            document.documentElement.classList.remove("is-page-entering");
          }, pageTransitionDuration);
        }
      } catch {
        // Continue without the entrance animation when storage is unavailable.
      }

      document.addEventListener("click", (event) => {
        const link = event.target.closest("a[href]");
        if (!isForwardPageLink(link, event) || event.defaultPrevented) return;

        event.preventDefault();
        navigateWithPageTransition(resolveSameOriginUrl(link.getAttribute("href")).href);
      });
    }

    window.addEventListener("pageshow", (event) => {
      if (!event.persisted) return;
      document.documentElement.classList.remove("is-page-leaving", "is-page-entering");
      document.body.style.opacity = "";
    });
  };

  window.addEventListener("pageshow", () => {
    if (consumeScrollTopOnLoad()) {
      window.requestAnimationFrame(forceScrollToTop);
    }
  });

  consumeScrollTopOnLoad();
  initPageTransitions();

  const initDashboardReveal = () => {
    const revealTargets = Array.from(
      new Set(
        [
          document.querySelector(".bo-account-side"),
          document.querySelector(".bo-profile"),
          ...document.querySelectorAll(
            ".bo-mypage > .bo-card, .bo-bottom-grid .bo-card, .bo-mobile-card, .bo-mobile-invite",
          ),
          document.querySelector(".bo-newsletter.bo-scroll-reveal"),
        ].filter(Boolean),
      ),
    );

    if (!revealTargets.length) return;

    revealTargets.forEach((target) => {
      if (!target.classList.contains("bo-scroll-reveal")) {
        target.classList.add("bo-page-reveal");
      }
    });

    const showRevealTarget = (target) => target.classList.add("is-inview");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealTargets.forEach(showRevealTarget);
      return;
    }

    const revealAll = () => revealTargets.forEach(showRevealTarget);

    // A single rAF isn't reliable here: if the browser hasn't painted
    // between adding .bo-page-reveal (opacity:0) and adding .is-inview
    // (opacity:1), it can collapse both into one paint and skip the CSS
    // transition entirely — which is exactly why the fade stopped playing
    // when this was simplified to one rAF. Nesting two rAFs guarantees an
    // actual paint of the opacity:0 state happens first. This is still
    // fast (~1 frame, not the old 900ms failsafe) and the fade itself is
    // now short (0.35s).
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(revealAll);
    });

    // Safety net in case rAF never fires (e.g. a backgrounded tab) —
    // short, not the old 900ms.
    window.setTimeout(revealAll, 300);
  };

  initDashboardReveal();

  const normalizeOrderCatalogLinks = () => {
    document.querySelectorAll('a[href*="order_catalog"]').forEach((link) => {
      try {
        const url = new URL(link.getAttribute("href"), window.location.href);
        if (!/\/mypage\/order_catalog\/?$/.test(url.pathname)) return;
        const scDate = url.searchParams.get("sc_date");
        if (scDate !== null && scDate !== "") return;
        url.searchParams.set("sc_date", "0");
        link.setAttribute("href", `${url.pathname}${url.search}${url.hash}`);
      } catch {
        // Keep the original href when it cannot be normalized.
      }
    });
  };
  normalizeOrderCatalogLinks();

  const canFetchHtml = typeof window.fetch === "function" && typeof window.DOMParser === "function";

  const fetchHtmlDocument = async (url) => {
    const response = await fetch(url, {
      credentials: "same-origin",
      headers: { Accept: "text/html" },
    });
    if (!response.ok) return null;

    return new DOMParser().parseFromString(await response.text(), "text/html");
  };

  // Run async work over a list with at most `limit` in flight at once —
  // used below so brand hydration doesn't fire dozens of full product-page
  // fetches (~240KB each) all at once, which was queuing behind the
  // browser's per-host connection cap and stretching dashboard load past
  // 6+ seconds.
  const mapLimit = async (items, limit, mapper) => {
    let nextIndex = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex;
        nextIndex += 1;
        await mapper(items[index], index);
      }
    });
    await Promise.all(workers);
  };

  // Product-page brand lookups resolved once this session don't need to be
  // fetched again on the next dashboard visit.
  const PRODUCT_BRAND_CACHE_KEY = "bo-product-brand-cache-v1";
  const readProductBrandCache = () => {
    try {
      return JSON.parse(sessionStorage.getItem(PRODUCT_BRAND_CACHE_KEY) || "{}");
    } catch {
      return {};
    }
  };
  const productBrandCache = readProductBrandCache();
  const writeProductBrandCache = () => {
    try {
      sessionStorage.setItem(PRODUCT_BRAND_CACHE_KEY, JSON.stringify(productBrandCache));
    } catch {
      // Storage full/unavailable — the cache is a nice-to-have, not required.
    }
  };

  const hydrateCouponCount = async () => {
    const couponCount = document.querySelector('[data-account-stat="coupons"]');
    if (!couponCount || !canFetchHtml) return;

    try {
      const page = await fetchHtmlDocument("/mypage/coupon?tab=1");
      if (!page) return;

      const countElement = page.querySelector(
        '.tab_basic a[href*="/mypage/coupon?tab=1"] .pointcolor2',
      );
      const count = countElement?.textContent.match(/\d[\d,]*/)?.[0];
      if (count) couponCount.textContent = count;
    } catch {
      // Keep the server-rendered fallback when the coupon page cannot be loaded.
    }
  };

  const hydrateReviewCount = async () => {
    const reviewCount = document.querySelector('[data-account-stat="reviews"]');
    if (!reviewCount || !canFetchHtml) return;

    try {
      const page = await fetchHtmlDocument("/mypage/mygdreview_catalog");
      if (!page) return;

      const summary = page.querySelector(".article_info")?.textContent || "";
      const summaryCount = summary.match(/(?:총|total)\s*([\d,]+)/i)?.[1];
      const visibleCount = page.querySelectorAll(".bo-review-card, .review_table > li").length;

      reviewCount.textContent = summaryCount || String(visibleCount);
    } catch {
      // Keep the server-rendered zero when the review page cannot be loaded.
    }
  };

  const hydrateWishlistBrands = async () => {
    const brandElements = [...document.querySelectorAll(".bo-product__brand")].filter(
      (element) => !element.textContent.trim(),
    );

    if (!brandElements.length || !canFetchHtml) return;

    const elementsByCode = new Map();

    brandElements.forEach((element) => {
      const code = element.dataset.brandCode || element.dataset.brand;
      if (!code) return;

      const elements = elementsByCode.get(code) || [];
      elements.push(element);
      elementsByCode.set(code, elements);
    });

    if (elementsByCode.size) {
      try {
        const response = await fetch("/goods/get_brand_list", {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        });
        if (response.ok) {
          const brands = await response.json();
          if (Array.isArray(brands)) {
            brands.forEach((brand) => {
              const elements = elementsByCode.get(String(brand.brand_code || ""));
              if (!elements || !brand.brand_name) return;
              elements.forEach((element) => {
                element.textContent = brand.brand_name;
              });
            });
          }
        }
      } catch {
        // Fall through to the product-page lookup below.
      }
    }

    const productBrandRequests = new Map();

    const loadProductBrand = (url) => {
      if (productBrandCache[url] !== undefined) return Promise.resolve(productBrandCache[url]);
      if (productBrandRequests.has(url)) return productBrandRequests.get(url);

      const request = fetchHtmlDocument(url)
        .then((page) => {
          if (!page) return "";

          const metaBrand = page.querySelector('meta[property$=":brand"]')?.content?.trim();
          if (metaBrand) return metaBrand;

          const brandLink = page.querySelector('a[href*="/goods/brand?code="]');
          if (brandLink?.textContent.trim()) return brandLink.textContent.trim();

          const productName = page.querySelector("h3.name")?.textContent?.trim() || "";
          const bracketBrand = productName.match(/^\[([^\]]+)\]/);
          return bracketBrand ? bracketBrand[1].trim() : "";
        })
        .then((brandName) => {
          productBrandCache[url] = brandName;
          writeProductBrandCache();
          return brandName;
        })
        .catch(() => "");

      productBrandRequests.set(url, request);
      return request;
    };

    // At most 4 of these ~240KB full product-page fetches in flight at
    // once, instead of firing every missing brand simultaneously and
    // letting the browser's own connection queue serialize them anyway.
    await mapLimit(
      brandElements.filter((element) => !element.textContent.trim()),
      4,
      async (element) => {
        const productUrl = element.closest(".bo-product")?.querySelector(".bo-product__image")
          ?.href;
        if (!productUrl) return;

        const brandName = await loadProductBrand(productUrl);
        if (brandName) element.textContent = brandName;
      },
    );
  };

  hydrateCouponCount();
  hydrateReviewCount();
  hydrateWishlistBrands();

  const getOrderStage = (step) => {
    if (step >= 75) return 3;
    if (step >= 50) return 2;
    if (step >= 35) return 1;
    return 0;
  };

  const getTrackingStage = (step) => {
    if (step >= 75) return 3;
    if (step >= 60) return 2;
    if (step >= 50) return 1;
    return 0;
  };

  const syncOrderTimeline = (orderCard) => {
    const step = Number(orderCard.dataset.orderStep || 0);
    const timelineSteps = orderCard.querySelectorAll(".bo-live-order__timeline > span");
    if (!timelineSteps.length || !step) return;

    const currentStage = getOrderStage(step);
    timelineSteps.forEach((timelineStep, index) => {
      timelineStep.classList.toggle("is-complete", index < currentStage);
      timelineStep.classList.toggle("is-current", index === currentStage);
    });

    const paymentLabel = timelineSteps[0]?.querySelector("small");
    if (paymentLabel) {
      paymentLabel.textContent = step === 15 ? "Payment Pending" : "Payment Confirmed";
    }
  };

  document.querySelectorAll(".bo-live-order[data-order-step]").forEach(syncOrderTimeline);

  const ordersModalLayer = document.querySelector("[data-orders-modal-layer]");

  if (ordersModalLayer) {
    const trackDialog = ordersModalLayer.querySelector(".orders-track-dialog");
    const trackingPrimary = ordersModalLayer.querySelector("[data-orders-track-primary]");
    const epostForm = document.getElementById("trendypicker-epost-form");
    let ordersModalTrigger = null;
    let activeTracking = null;

    const setText = (selector, value) => {
      const target = ordersModalLayer.querySelector(selector);
      if (target) target.textContent = value || "";
    };

    const closeOrdersModal = () => {
      ordersModalLayer.hidden = true;
      ordersModalLayer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-orders-modal-open");
      activeTracking = null;
      ordersModalTrigger?.focus();
      ordersModalTrigger = null;
    };

    const getTrackingData = (orderCard) => {
      const step = Number(orderCard.dataset.orderStep || 0);
      const shippingMethod = orderCard.dataset.orderShippingMethod || "";
      const trackingNumber = orderCard.dataset.orderTrackingNumber || "";
      const image = orderCard.querySelector(".bo-live-order__image img");

      return {
        step,
        stage: getTrackingStage(step),
        shippingMethod,
        trackingNumber,
        carrier: shippingMethod === "quick" ? "UPS" : "Korea Post EMS",
        order: orderCard.dataset.orderSeq || "",
        date: orderCard.dataset.orderDate || "",
        detailsUrl: orderCard.dataset.orderDetailsUrl || "",
        estimatedArrival: orderCard.dataset.orderEstimatedArrival || "",
        shippingAddress: orderCard.dataset.orderShippingAddress || "",
        status:
          orderCard.dataset.orderStatus ||
          orderCard.querySelector(".bo-live-order__copy mark")?.textContent.trim() ||
          "",
        name: orderCard.querySelector(".bo-live-order__copy strong")?.textContent.trim() || "",
        price: orderCard.dataset.orderPrice || "",
        imageUrl: image?.currentSrc || image?.src || "",
      };
    };

    const fillTrackingDialog = (data) => {
      setText("[data-orders-track-order]", data.order ? `Order #${data.order}` : "Order");
      setText("[data-orders-track-date]", data.date);
      setText("[data-orders-track-status]", data.status);
      setText("[data-orders-track-name]", data.name);
      setText("[data-orders-track-price]", data.price);
      setText("[data-orders-track-carrier]", data.carrier);
      setText("[data-orders-track-number]", data.trackingNumber);
      setText("[data-orders-track-estimated]", data.estimatedArrival || "Not provided");
      setText(
        "[data-orders-track-address]",
        data.shippingAddress || (data.detailsUrl ? "Loading..." : "Not provided"),
      );

      const thumb = ordersModalLayer.querySelector("[data-orders-track-thumb]");
      if (thumb) {
        thumb.style.backgroundImage = data.imageUrl
          ? `url(${JSON.stringify(data.imageUrl)})`
          : "";
      }

      const modalSteps = ordersModalLayer.querySelectorAll("[data-orders-track-step]");
      modalSteps.forEach((modalStep, index) => {
        modalStep.classList.toggle("is-complete", index < data.stage);
        modalStep.classList.toggle("is-active", index === data.stage);
        const state = modalStep.querySelector("em");
        if (state) {
          state.textContent = index < data.stage
            ? "Complete"
            : index === data.stage
              ? "Current"
              : "Pending";
        }
      });

    };

    const readOrderDetail = (page, label) => {
      const heading = [...page.querySelectorAll("li.th strong")].find(
        (element) => element.textContent.trim().toLowerCase() === label.toLowerCase(),
      );
      const value = heading?.closest("ul")?.querySelector("li.td");
      return value?.textContent.replace(/\s+/g, " ").trim() || "";
    };

    const hydrateTrackingDetails = async (data) => {
      if (!data.detailsUrl || !canFetchHtml) return;

      try {
        const page = await fetchHtmlDocument(data.detailsUrl);
        if (!page || activeTracking !== data) return;

        const recipient = readOrderDetail(page, "Contact Name");
        let address = readOrderDetail(page, "Shipping Address");

        if (!address) {
          const street =
            page.querySelector('input[name="recipient_address_street"]')?.value ||
            page.querySelector('input[name="recipient_address"]')?.value ||
            "";
          const detail = page.querySelector('input[name="recipient_address_detail"]')?.value || "";
          address = [street, detail].filter(Boolean).join(" ");
        }

        data.shippingAddress = [recipient, address].filter(Boolean).join(", ");
        setText(
          "[data-orders-track-address]",
          data.shippingAddress || "Not provided",
        );
      } catch {
        if (activeTracking === data) {
          setText("[data-orders-track-address]", "Not provided");
        }
      }
    };

    const openOrdersModal = (trigger) => {
      const orderCard = trigger.closest(".bo-live-order");
      if (!orderCard || !trackDialog) return;

      ordersModalTrigger = trigger;
      activeTracking = getTrackingData(orderCard);
      fillTrackingDialog(activeTracking);
      hydrateTrackingDetails(activeTracking);
      ordersModalLayer.hidden = false;
      ordersModalLayer.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-orders-modal-open");

      window.requestAnimationFrame(() => {
        trackDialog.scrollTop = 0;
        trackDialog.focus({ preventScroll: true });
      });
    };

    document.addEventListener("click", (event) => {
      const trackTrigger = event.target.closest("[data-bo-track-order]");
      if (!trackTrigger) return;

      event.preventDefault();
      openOrdersModal(trackTrigger);
    });

    ordersModalLayer.querySelectorAll("[data-orders-modal-close]").forEach((button) => {
      button.addEventListener("click", closeOrdersModal);
    });

    trackingPrimary?.addEventListener("click", () => {
      if (!activeTracking?.trackingNumber) return;

      if (activeTracking.shippingMethod === "quick") {
        const trackingUrl = new URL("https://www.ups.com/track");
        trackingUrl.searchParams.set("tracknum", activeTracking.trackingNumber);
        trackingUrl.searchParams.set("loc", "en_US");
        trackingUrl.searchParams.set("requester", "QUIC/trackdetails");
        window.open(trackingUrl.toString(), "_blank", "noopener,noreferrer");
        return;
      }

      if (activeTracking.shippingMethod === "delivery" && epostForm) {
        const trackingInput = epostForm.querySelector("[data-orders-epost-number]");
        if (trackingInput) trackingInput.value = activeTracking.trackingNumber;
        epostForm.submit();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !ordersModalLayer.hidden) closeOrdersModal();
    });

  }

  const avatarTrigger = document.querySelector("[data-mypage-avatar-open]");
  const avatarDialog = document.getElementById("mypage-avatar-dialog");

  if (avatarTrigger && avatarDialog) {
    const avatarForm = avatarDialog.querySelector("[data-mypage-avatar-form]");
    const avatarInput = avatarDialog.querySelector("[data-mypage-avatar-input]");
    const avatarPreview = avatarDialog.querySelector("[data-mypage-avatar-preview]");
    const avatarRemove = avatarDialog.querySelector("[data-mypage-avatar-remove]");
    const avatarSave = avatarDialog.querySelector("[data-mypage-avatar-save]");
    const avatarContainer = document.querySelector(".bo-profile__avatar");
    let currentAvatar = document.querySelector("[data-mypage-avatar-current]");
    let previewUrl = "";

    const releasePreviewUrl = () => {
      if (!previewUrl) return;
      URL.revokeObjectURL(previewUrl);
      previewUrl = "";
    };

    const resetAvatarDialog = () => {
      releasePreviewUrl();
      avatarForm?.reset();
      if (avatarSave) {
        avatarSave.disabled = true;
        avatarSave.textContent = "Save";
      }
      if (avatarRemove) avatarRemove.hidden = true;

      if (avatarPreview) {
        const currentSource =
          currentAvatar && !currentAvatar.hidden ? currentAvatar.currentSrc || currentAvatar.src : "";
        avatarPreview.src = currentSource;
        avatarPreview.hidden = !currentSource;
      }
    };

    const closeAvatarDialog = () => {
      avatarDialog.hidden = true;
      avatarDialog.setAttribute("aria-hidden", "true");
      avatarTrigger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-mypage-avatar-open");
      resetAvatarDialog();
      avatarTrigger.focus();
    };

    const openAvatarDialog = () => {
      resetAvatarDialog();
      avatarDialog.hidden = false;
      avatarDialog.setAttribute("aria-hidden", "false");
      avatarTrigger.setAttribute("aria-expanded", "true");
      document.body.classList.add("is-mypage-avatar-open");
      avatarInput?.focus();
    };

    avatarTrigger.addEventListener("click", openAvatarDialog);

    avatarDialog.querySelectorAll("[data-mypage-avatar-close]").forEach((button) => {
      button.addEventListener("click", closeAvatarDialog);
    });

    avatarInput?.addEventListener("change", () => {
      releasePreviewUrl();
      const file = avatarInput.files?.[0];
      if (!file) {
        resetAvatarDialog();
        return;
      }

      previewUrl = URL.createObjectURL(file);
      if (avatarPreview) {
        avatarPreview.src = previewUrl;
        avatarPreview.hidden = false;
      }
      if (avatarRemove) avatarRemove.hidden = false;
      if (avatarSave) avatarSave.disabled = false;
    });

    avatarRemove?.addEventListener("click", () => {
      releasePreviewUrl();
      if (avatarInput) avatarInput.value = "";
      if (avatarPreview) {
        avatarPreview.removeAttribute("src");
        avatarPreview.hidden = true;
      }
      avatarRemove.hidden = true;
      if (avatarSave) avatarSave.disabled = true;
      avatarInput?.focus();
    });

    avatarForm?.addEventListener("submit", (event) => {
      if (!avatarInput?.files?.length) {
        event.preventDefault();
        return;
      }
      if (avatarSave) {
        avatarSave.disabled = true;
        avatarSave.textContent = "Saving...";
      }
    });

    window.membericonDisplay = (filename) => {
      if (!currentAvatar && avatarContainer) {
        currentAvatar = document.createElement("img");
        currentAvatar.dataset.mypageAvatarCurrent = "";
        currentAvatar.alt = document.getElementById("bo-dashboard-title")?.textContent.trim() || "";
        currentAvatar.addEventListener("error", () => {
          currentAvatar.hidden = true;
        });
        avatarContainer.prepend(currentAvatar);
      }

      if (currentAvatar) {
        currentAvatar.src = filename;
        currentAvatar.hidden = false;
      }
      if (avatarSave) avatarSave.textContent = "Save";
      closeAvatarDialog();
    };

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !avatarDialog.hidden) closeAvatarDialog();
    });
  }

  const enhanceReviewsSelect = (nativeSelect) => {
    if (!nativeSelect || nativeSelect.dataset.reviewsSelectReady === "1") return;

    nativeSelect.dataset.reviewsSelectReady = "1";
    nativeSelect.classList.add("bo-reviews-select-native");
    nativeSelect.tabIndex = -1;
    nativeSelect.setAttribute("aria-hidden", "true");

    const wrap = document.createElement("span");
    wrap.className = "bo-reviews-select-wrap";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "bo-reviews-select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", nativeSelect.getAttribute("aria-label") || "Filter");

    const value = document.createElement("span");
    value.className = "bo-reviews-select-value";

    const menu = document.createElement("ul");
    menu.className = "bo-reviews-select-menu";
    menu.setAttribute("role", "listbox");

    const closeMenu = () => {
      wrap.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    };

    const syncSelection = () => {
      const selectedOption = nativeSelect.options[nativeSelect.selectedIndex];
      value.textContent = selectedOption?.textContent || "";
      menu.querySelectorAll("li").forEach((item) => {
        const selected = item.dataset.value === nativeSelect.value;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-selected", String(selected));
      });
    };

    Array.from(nativeSelect.options).forEach((option) => {
      const item = document.createElement("li");
      item.textContent = option.textContent;
      item.dataset.value = option.value;
      item.setAttribute("role", "option");
      item.addEventListener("click", () => {
        nativeSelect.value = option.value;
        nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
        syncSelection();
        closeMenu();
        trigger.focus();
      });
      menu.append(item);
    });

    trigger.append(value);
    wrap.append(trigger, menu);
    nativeSelect.parentNode.insertBefore(wrap, nativeSelect);
    wrap.append(nativeSelect);

    trigger.addEventListener("click", () => {
      const shouldOpen = !wrap.classList.contains("is-open");
      document.querySelectorAll(".bo-reviews-select-wrap.is-open").forEach((openWrap) => {
        if (openWrap === wrap) return;
        openWrap.classList.remove("is-open");
        openWrap.querySelector(".bo-reviews-select-trigger")?.setAttribute("aria-expanded", "false");
      });
      wrap.classList.toggle("is-open", shouldOpen);
      trigger.setAttribute("aria-expanded", String(shouldOpen));
    });

    document.addEventListener("pointerdown", (event) => {
      if (!wrap.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && wrap.classList.contains("is-open")) {
        closeMenu();
        trigger.focus();
      }
    });

    syncSelection();
  };

  document.querySelectorAll(".bo-reviews-controls-selects .bo-reviews-select").forEach(enhanceReviewsSelect);

  const reviewCategorySelect = document.querySelector("#searchcategory[name='review_category']");
  const reviewPeriodSelect = document.querySelector(".bo-reviews-period");
  const reviewCards = [...document.querySelectorAll(".bo-reviews-list .bo-review-card")];

  if (reviewCategorySelect && reviewCards.length) {
    let reviewCategoriesReady = false;

    const matchReviewCategory = (value) => {
      const text = String(value || "").toLowerCase();
      if (/k-?\s*traditional|전통|hanbok|heritage|tea\s*ceremony/.test(text)) return "k-traditional";
      if (/k-?\s*pop|케이\s*팝|idol|photocard|album|merchandise|응원봉/.test(text)) return "k-pop";
      if (/k-?\s*food|식품|\bfood\b|snack|ramen|grocery|sauce|김치|라면|간식/.test(text)) return "k-food";
      if (/lifestyle|라이프|home\s*living|\bliving\b|home\s*decor|stationery|kitchen|생활/.test(text)) {
        return "lifestyle";
      }
      if (
        /k-?\s*beauty|\bbeauty\b|뷰티|skincare|skin\s*care|cosmetic|makeup|serum|ampoule|toner|cream|cleanser|sunscreen|hair\s*care|body\s*care|fragrance/.test(
          text,
        )
      ) {
        return "beauty";
      }
      return "";
    };

    const selectedReviewCategory = () => matchReviewCategory(reviewCategorySelect.value);

    const applyReviewFilters = () => {
      const selectedCategory = selectedReviewCategory();
      const selectedMonths = Number(reviewPeriodSelect?.value || 0);
      const cutoffDate = new Date();
      if (selectedMonths) cutoffDate.setMonth(cutoffDate.getMonth() - selectedMonths);

      reviewCards.forEach((card) => {
        const cardCategory = card.dataset.reviewCategory || "";
        const categoryMismatch = Boolean(
          selectedCategory && (reviewCategoriesReady || cardCategory) && cardCategory !== selectedCategory,
        );
        const reviewDate = new Date((card.querySelector("time")?.textContent || "").replace(/\./g, "-"));
        const periodMismatch = Boolean(
          selectedMonths && !Number.isNaN(reviewDate.getTime()) && reviewDate < cutoffDate,
        );
        card.hidden = categoryMismatch || periodMismatch;
      });
    };

    const readReviewCategoryFromProduct = async (card) => {
      if (card.dataset.reviewCategory) return;
      const productText = card.querySelector(".bo-review-product-copy")?.textContent || "";
      const productLink = card.querySelector('.bo-review-thumb[href*="/goods/view"]')?.href;

      if (productLink) {
        try {
          const response = await fetch(productLink, {
            credentials: "same-origin",
            headers: { Accept: "text/html" },
          });
          if (response.ok) {
            const productDocument = new DOMParser().parseFromString(await response.text(), "text/html");
            const crumbs = [
              ...productDocument.querySelectorAll(
                ".navi_linemap a, .navi_linemap2 a, .navi_linemap2 .selected_cate, .structure_nav a, .goods_category a, .category_path a, .breadcrumb a, .location a, .goods_nav a, .linemap_area a",
              ),
            ]
              .map((element) => element.textContent.trim())
              .filter(Boolean);
            const pageCategory = matchReviewCategory(crumbs.join(" > "));
            if (pageCategory) {
              card.dataset.reviewCategory = pageCategory;
              return;
            }
          }
        } catch {
          // Fall back to the product name when the product page cannot be read.
        }
      }

      card.dataset.reviewCategory = matchReviewCategory(productText);
    };

    reviewCategorySelect.addEventListener("change", () => {
      const url = new URL(window.location.href);
      if (reviewCategorySelect.value) url.searchParams.set("review_category", reviewCategorySelect.value);
      else url.searchParams.delete("review_category");
      window.history.replaceState({}, "", url);
      applyReviewFilters();
    });

    reviewPeriodSelect?.addEventListener("change", applyReviewFilters);

    applyReviewFilters();
    Promise.all(reviewCards.map(readReviewCategoryFromProduct)).then(() => {
      reviewCategoriesReady = true;
      applyReviewFilters();
    });
  }

  const reviewEditLayer = document.querySelector("[data-review-edit-layer]");

  if (reviewEditLayer) {
    const reviewEditTitle = reviewEditLayer.querySelector("[data-review-edit-heading]");
    const reviewEditCopy = reviewEditLayer.querySelector("[data-review-edit-copy]");
    const reviewEditThumb = reviewEditLayer.querySelector("[data-review-edit-thumb]");
    const reviewEditBrand = reviewEditLayer.querySelector("[data-review-edit-brand]");
    const reviewEditName = reviewEditLayer.querySelector("[data-review-edit-name]");
    const reviewEditPrice = reviewEditLayer.querySelector("[data-review-edit-price]");
    const reviewEditSave = reviewEditLayer.querySelector("[data-review-edit-save]");
    const reviewEditUpload = reviewEditLayer.querySelector("[data-review-edit-upload]");
    const reviewEditFiles = reviewEditLayer.querySelector("[data-review-edit-files]");
    const reviewEditPreview = reviewEditLayer.querySelector("[data-review-edit-preview]");
    const reviewEditUploadStatus = reviewEditLayer.querySelector("[data-review-edit-upload-status]");
    const ratingButtons = [...reviewEditLayer.querySelectorAll("[data-review-edit-rating]")];
    let activeReviewCard = null;
    let activeReviewTrigger = null;
    let activeRating = 5;
    let reviewPhotos = [];

    const setReviewRating = (rating) => {
      activeRating = Math.max(1, Math.min(5, Number(rating) || 5));
      ratingButtons.forEach((button) => {
        const isActive = Number(button.dataset.reviewEditRating) <= activeRating;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    };

    const closeReviewEditor = () => {
      reviewEditLayer.hidden = true;
      reviewEditLayer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-review-edit-open");
      activeReviewTrigger?.focus();
    };

    const renderReviewPhotoPreview = () => {
      if (!reviewEditPreview) return;
      reviewEditPreview.replaceChildren();

      reviewPhotos.forEach((photo, index) => {
        const item = document.createElement("span");
        item.className = "review-edit-preview-item";

        const image = document.createElement("img");
        image.src = photo.src;
        image.alt = "";

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "review-edit-photo-remove";
        remove.setAttribute("aria-label", `Remove photo ${index + 1}`);
        remove.textContent = "×";
        remove.addEventListener("click", () => {
          if (photo.isObjectUrl) URL.revokeObjectURL(photo.src);
          reviewPhotos.splice(index, 1);
          renderReviewPhotoPreview();
        });

        item.append(image, remove);
        reviewEditPreview.append(item);
      });

      if (reviewEditUploadStatus) {
        reviewEditUploadStatus.textContent = `${reviewPhotos.length}/5 photos`;
      }
    };

    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-review-edit-open]");
      if (!trigger) return;
      const card = trigger.closest(".bo-review-card");
      if (!card) return;

      event.preventDefault();
      activeReviewCard = card;
      activeReviewTrigger = trigger;
      reviewEditThumb.src = card.querySelector(".bo-review-thumb img")?.src || "";
      reviewEditBrand.textContent = "";
      reviewEditName.textContent = card.querySelector(".bo-review-product-copy h2")?.textContent || "";
      reviewEditPrice.textContent = "";
      reviewEditTitle.value = card.querySelector(".bo-review-copy h3")?.textContent || "";
      reviewEditCopy.value = card.querySelector(".bo-review-copy p")?.textContent || "";
      setReviewRating(Math.round(Number(card.querySelector(".bo-review-score-num")?.textContent) || 5));
      reviewPhotos = [...card.querySelectorAll(".bo-review-gallery img")]
        .slice(0, 5)
        .map((image) => ({ src: image.src, isObjectUrl: false }));
      if (reviewEditFiles) reviewEditFiles.value = "";
      renderReviewPhotoPreview();

      reviewEditLayer.hidden = false;
      reviewEditLayer.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-review-edit-open");
      reviewEditTitle.focus();
    });

    ratingButtons.forEach((button) => {
      button.addEventListener("click", () => setReviewRating(button.dataset.reviewEditRating));
    });

    reviewEditUpload?.addEventListener("click", () => reviewEditFiles?.click());

    reviewEditFiles?.addEventListener("change", () => {
      const availableSlots = Math.max(0, 5 - reviewPhotos.length);
      [...reviewEditFiles.files].slice(0, availableSlots).forEach((file) => {
        reviewPhotos.push({ src: URL.createObjectURL(file), isObjectUrl: true });
      });
      reviewEditFiles.value = "";
      renderReviewPhotoPreview();
    });

    reviewEditLayer.querySelectorAll("[data-review-edit-close]").forEach((button) => {
      button.addEventListener("click", closeReviewEditor);
    });

    reviewEditSave?.addEventListener("click", () => {
      if (!activeReviewCard) return;

      const heading = activeReviewCard.querySelector(".bo-review-copy h3");
      const copy = activeReviewCard.querySelector(".bo-review-copy p");
      const score = activeReviewCard.querySelector(".bo-review-score-num");
      const starFill = activeReviewCard.querySelector(".bo-review-stars b");
      const gallery = activeReviewCard.querySelector(".bo-review-gallery");

      if (heading) heading.textContent = reviewEditTitle.value.trim() || "My review";
      if (copy) copy.textContent = reviewEditCopy.value.trim();
      if (score) score.textContent = activeRating.toFixed(1);
      if (starFill) starFill.style.width = `${(activeRating / 5) * 100}%`;
      if (gallery) {
        gallery.replaceChildren();
        reviewPhotos.forEach((photo) => {
          const image = document.createElement("img");
          image.src = photo.src;
          image.alt = "";
          gallery.append(image);
        });
      }
      closeReviewEditor();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !reviewEditLayer.hidden) closeReviewEditor();
    });
  }

  const logoutTriggers = [
    ...document.querySelectorAll(
      '#mypageLnbBasic .lnb_sub a[href*="/login_process/logout"], .bo-mobile-service__grid a[href*="/login_process/logout"]',
    ),
  ];
  const logoutDialog = document.getElementById("mypage-logout-dialog");

  if (logoutTriggers.length && logoutDialog) {
    const logoutConfirm = logoutDialog.querySelector("[data-mypage-logout-confirm]");
    let activeLogoutTrigger = logoutTriggers[0];

    const closeLogoutDialog = () => {
      logoutDialog.hidden = true;
      logoutDialog.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-mypage-logout-open");
      activeLogoutTrigger?.focus();
    };

    const openLogoutDialog = (event) => {
      event.preventDefault();
      activeLogoutTrigger = event.currentTarget;
      logoutDialog.hidden = false;
      logoutDialog.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-mypage-logout-open");
      logoutConfirm?.focus();
    };

    logoutTriggers.forEach((trigger) => {
      trigger.addEventListener("click", openLogoutDialog);
    });

    logoutDialog.querySelectorAll("[data-mypage-logout-close]").forEach((button) => {
      button.addEventListener("click", closeLogoutDialog);
    });

    logoutConfirm?.addEventListener("click", () => {
      window.location.href = activeLogoutTrigger?.href || "/login_process/logout";
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !logoutDialog.hidden) closeLogoutDialog();
    });
  }
})();
