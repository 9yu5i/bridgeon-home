(() => {
  const canFetchHtml = typeof window.fetch === "function" && typeof window.DOMParser === "function";

  const fetchHtmlDocument = async (url) => {
    const response = await fetch(url, {
      credentials: "same-origin",
      headers: { Accept: "text/html" },
    });
    if (!response.ok) return null;

    return new DOMParser().parseFromString(await response.text(), "text/html");
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
      const visibleCount = page.querySelectorAll(".review_table > li").length;

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
        .catch(() => "");

      productBrandRequests.set(url, request);
      return request;
    };

    await Promise.all(
      brandElements
        .filter((element) => !element.textContent.trim())
        .map(async (element) => {
          const productUrl = element.closest(".bo-product")?.querySelector(".bo-product__image")
            ?.href;
          if (!productUrl) return;

          const brandName = await loadProductBrand(productUrl);
          if (brandName) element.textContent = brandName;
        }),
    );
  };

  hydrateCouponCount();
  hydrateReviewCount();
  hydrateWishlistBrands();

  const orderPreview = document.querySelector("[data-trendypicker-order-preview]");
  const isOrderPreview = new URLSearchParams(window.location.search).get(
    "trendypicker_order_preview",
  ) === "1";

  if (orderPreview && isOrderPreview) {
    document
      .querySelectorAll("[data-trendypicker-live-orders], [data-trendypicker-order-empty]")
      .forEach((element) => {
        element.classList.add("is-trendypicker-preview-hidden");
      });

    orderPreview.hidden = false;
  }

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

  const revealTargets = Array.from(
    new Set([
      document.querySelector(".bo-account-side"),
      document.querySelector(".bo-profile"),
      ...document.querySelectorAll(
        ".bo-mypage > .bo-card, .bo-bottom-grid .bo-card, .bo-mobile-card, .bo-mobile-invite",
      ),
      document.querySelector(".bo-newsletter.bo-scroll-reveal"),
    ].filter(Boolean)),
  );

  revealTargets.forEach((target, index) => {
    if (!target.classList.contains("bo-scroll-reveal")) {
      target.classList.add("bo-page-reveal");
    }
    target.style.setProperty("--bo-reveal-delay", `${Math.min(index, 3) * 0.06}s`);
  });

  const showRevealTarget = (target) => target.classList.add("is-inview");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealTargets.forEach(showRevealTarget);
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => revealTargets.forEach(showRevealTarget));
  });
})();
