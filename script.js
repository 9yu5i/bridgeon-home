const PAGE_TRANSITION_KEY = "bridgeon-page-transition";
const PAGE_TRANSITION_MS = 320;
const BRIDGEON_ROOT_URL = new URL("./", document.currentScript?.src || window.location.href);
const PRODUCT_DETAIL_URL = new URL("product-detail/product-detail.html", BRIDGEON_ROOT_URL).href;

const shouldAnimatePageTransition = () =>
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const hasNativeCrossDocTransitions = () => "PageRevealEvent" in window;

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

const navigateWithPageTransition = (href) => {
  const url = resolveSameOriginUrl(href);
  if (!url || isHashOnlyNavigation(url)) {
    window.location.href = href;
    return;
  }

  if (!shouldAnimatePageTransition() || hasNativeCrossDocTransitions()) {
    window.location.href = url.href;
    return;
  }

  sessionStorage.setItem(PAGE_TRANSITION_KEY, "1");
  document.documentElement.classList.add("is-page-leaving");

  window.setTimeout(() => {
    window.location.href = url.href;
  }, PAGE_TRANSITION_MS);
};

const initPageTransitions = () => {
  if (!shouldAnimatePageTransition()) return;

  if (!hasNativeCrossDocTransitions()) {
    if (sessionStorage.getItem(PAGE_TRANSITION_KEY)) {
      sessionStorage.removeItem(PAGE_TRANSITION_KEY);
      document.documentElement.classList.add("is-page-entering");
      window.setTimeout(() => {
        document.documentElement.classList.remove("is-page-entering");
      }, PAGE_TRANSITION_MS);
    }

    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const url = resolveSameOriginUrl(href);
      if (!url || isHashOnlyNavigation(url)) return;

      event.preventDefault();
      navigateWithPageTransition(url.href);
    });
  }

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    document.documentElement.classList.remove("is-page-leaving", "is-page-entering");
    document.body.style.opacity = "";
  });
};

initPageTransitions();

const initScrollReveals = () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.remove("scroll-reveal-pending");
    return;
  }

  const addLineReveal = (root) => {
    root.querySelectorAll(
      ".section-heading h2, .inline-heading h2, .mobile-section-title, .editor-card-title",
    ).forEach((heading) => {
      heading.classList.add("scroll-reveal-line");
    });
  };

  const addStaggerItems = (container, selector, staggerStep = 0.08) => {
    if (!container) return;
    container.classList.add("scroll-reveal-stagger");
    container.querySelectorAll(selector).forEach((item, index) => {
      item.classList.add("scroll-reveal-item");
      item.style.setProperty("--reveal-index", String(index));
      item.style.setProperty("--reveal-stagger", `${staggerStep}s`);
    });
  };

  const initRailSectionReveal = (section, { cardSelector, autoPlayOnLoad = false }) => {
    if (!section) return null;
    section.classList.add("scroll-reveal-rail");
    addLineReveal(section);
    addStaggerItems(section.querySelector(".card-rail"), cardSelector, 0.06);
    if (autoPlayOnLoad) {
      window.setTimeout(() => activateRevealSection(section), 420);
    }
    return section;
  };

  const activateRevealSection = (section) => {
    if (!section || section.classList.contains("is-inview")) return;
    section.classList.add("is-inview");
    section.querySelectorAll(
      ".scroll-reveal-soft, .scroll-reveal-stagger, .scroll-reveal-line, .scroll-reveal-split-left, .scroll-reveal-split-right",
    ).forEach((el) => el.classList.add("is-inview"));
  };

  const hero = document.querySelector(".hero");
  if (hero) {
    hero.classList.add("scroll-reveal-hero");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => hero.classList.add("is-inview"));
    });
  }

  document.querySelector(".mobile-cats")?.classList.add("scroll-reveal-soft");

  initRailSectionReveal(document.querySelector(".trend-section"), {
    cardSelector: ".reel-card",
    autoPlayOnLoad: true,
  });

  initRailSectionReveal(document.querySelector(".seller-section"), {
    cardSelector: ".product-card",
  });

  const dealsSection = document.querySelector(".deals-section");
  if (dealsSection) {
    addLineReveal(dealsSection);
    dealsSection.querySelector(".mobile-section-title")?.classList.add("scroll-reveal-line");
    const dealGrid = dealsSection.querySelector(".deal-grid");
    if (dealGrid) {
      dealGrid.classList.add("scroll-reveal-stagger");
      dealGrid.querySelectorAll(".deal-card").forEach((item, index) => {
        item.classList.add("scroll-reveal-pop-item");
        item.style.setProperty("--reveal-index", String(index));
        item.style.setProperty("--reveal-stagger", "0.1s");
      });
    }
  }

  const editorialSection = document.querySelector(".editorial-section");
  if (editorialSection) {
    const editorCard = editorialSection.querySelector(".editor-card");
    editorCard?.querySelector(":scope > span")?.classList.add("scroll-reveal-split-left");
    editorCard?.querySelectorAll(":scope > div h2, :scope > div h3, :scope > div p").forEach((el) => {
      el.classList.add("scroll-reveal-split-right");
    });
    editorCard?.querySelector(":scope > button")?.classList.add("scroll-reveal-split-right");
    editorCard?.querySelector(":scope > a")?.classList.add("scroll-reveal-split-right");
    editorialSection.querySelector(".magazine-block")?.classList.add("scroll-reveal-soft");
    addStaggerItems(editorialSection.querySelector(".magazine-grid"), ".magazine-card", 0.08);
  }

  const reviewsSection = document.querySelector(".reviews-section");
  if (reviewsSection) {
    addLineReveal(reviewsSection);
    reviewsSection.querySelector(".section-heading")?.classList.add("scroll-reveal-soft", "scroll-reveal-slow");
    const reviewRail = reviewsSection.querySelector(".review-rail");
    if (reviewRail) {
      reviewRail.classList.add("scroll-reveal-stagger");
      reviewRail.querySelectorAll(".review-card").forEach((item, index) => {
        item.classList.add("scroll-reveal-item", "scroll-reveal-slow-item");
        item.style.setProperty("--reveal-index", String(index));
        item.style.setProperty("--reveal-stagger", "0.1s");
      });
    }
  }

  document.querySelector(".share-pick")?.classList.add("scroll-reveal-soft");
  document.querySelector(".newsletter")?.classList.add("scroll-reveal-soft");

  document.documentElement.classList.remove("scroll-reveal-pending");

  const revealSections = document.querySelectorAll(
    ".mobile-cats, .content-section:not(.trend-section), .share-pick, .newsletter",
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        activateRevealSection(entry.target);
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -6% 0px",
    },
  );

  revealSections.forEach((section) => revealObserver.observe(section));
};

initScrollReveals();

const scrollButtons = document.querySelectorAll("[data-scroll]");

scrollButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const rail = document.getElementById(button.dataset.scroll);
    if (!rail) return;
    if (
      rail.classList.contains("trend-rail") ||
      rail.classList.contains("seller-rail") ||
      rail.classList.contains("review-rail")
    ) return;

    const direction = Number(button.dataset.direction || 1);
    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.8, 240),
      behavior: "smooth",
    });
  });
});

const initLoopRail = ({ railId, autoLoop = true, autoStartOnLoad = false }) => {
  const rail = document.getElementById(railId);
  const nextButton = document.querySelector(`[data-scroll="${railId}"][data-direction="1"]`);
  const prevButton = document.querySelector(`[data-scroll="${railId}"][data-direction="-1"]`);
  if (!rail || !nextButton || !prevButton) return;
  const disableLoopQuery =
    railId === "seller-rail"
      ? "(max-width: 1120px)"
      : railId === "trend-rail"
        ? null
        : railId === "review-rail"
          ? "(max-width: 1120px)"
          : "(max-width: 760px)";
  const disableLoopMedia = disableLoopQuery ? window.matchMedia(disableLoopQuery) : null;
  const isLoopDisabled = () =>
    disableLoopMedia ? disableLoopMedia.matches : false;
  const originalCards = Array.from(rail.children);

  let isAnimating = false;
  let autoTimer = null;
  let dragActive = false;
  let startX = 0;
  let currentX = 0;
  let activeAnimation = null;

  const getGap = () => parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap) || 0;

  const getStep = (direction = 1) => {
    const cards = [...rail.children].filter((child) => !child.classList.contains("is-loop-clone"));
    const card = direction > 0 ? cards[0] : cards[cards.length - 1];
    if (!card) return 0;
    return card.getBoundingClientRect().width + getGap();
  };

  const getDuration = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 420;

  const RAIL_EASING = "linear";

  const resetRailPosition = () => {
    rail.style.transition = "none";
    rail.style.transform = "translateX(0)";
  };

  const resetToOriginalOrder = () => {
    window.clearInterval(autoTimer);
    autoTimer = null;
    activeAnimation?.cancel();
    activeAnimation = null;
    isAnimating = false;
    dragActive = false;
    currentX = 0;
    rail.classList.remove("is-dragging");
    rail.querySelectorAll(".is-loop-clone").forEach((clone) => clone.remove());
    originalCards.forEach((card) => rail.appendChild(card));
    resetRailPosition();
  };

  const animateRail = ({ from, to, onFinish }) => {
    if (Math.abs(to - from) < 0.5) {
      onFinish();
      resetRailPosition();
      isAnimating = false;
      return;
    }

    const fromTransform = `translateX(${from}px)`;
    const toTransform = `translateX(${to}px)`;

    rail.style.transition = "none";
    rail.style.transform = fromTransform;
    rail.getBoundingClientRect();

    const runAnimation = () => {
      if (typeof rail.animate === "function") {
        const animation = rail.animate(
          [{ transform: fromTransform }, { transform: toTransform }],
          { duration: getDuration(), easing: RAIL_EASING, fill: "both" },
        );
        activeAnimation = animation;
        let finished = false;

        animation.onfinish = () => {
          finished = true;
          onFinish();
          resetRailPosition();
          animation.cancel();
          activeAnimation = null;
          isAnimating = false;
        };

        animation.oncancel = () => {
          if (finished) return;
          resetRailPosition();
          activeAnimation = null;
          isAnimating = false;
        };

        return;
      }

      rail.style.transition = `transform ${getDuration()}ms ${RAIL_EASING}`;
      rail.style.transform = toTransform;

      const onEnd = () => {
        rail.removeEventListener("transitionend", onEnd);
        onFinish();
        resetRailPosition();
        isAnimating = false;
      };

      rail.addEventListener("transitionend", onEnd);
    };

    requestAnimationFrame(runAnimation);
  };

  const finishForward = (fromX = 0) => {
    const step = getStep(1);
    if (!step) {
      isAnimating = false;
      return;
    }

    const firstCard = rail.firstElementChild;
    const loopClone = firstCard.cloneNode(true);
    loopClone.setAttribute("aria-hidden", "true");
    loopClone.classList.add("is-loop-clone");
    rail.appendChild(loopClone);

    animateRail({
      from: fromX,
      to: -step,
      onFinish: () => {
        rail.appendChild(firstCard);
        loopClone.remove();
      },
    });
  };

  const finishBackward = (fromX = 0) => {
    const step = getStep(-1);
    if (!step) {
      isAnimating = false;
      return;
    }

    const firstCard = rail.firstElementChild;
    const lastCard = rail.lastElementChild;
    const loopClone = lastCard.cloneNode(true);
    loopClone.setAttribute("aria-hidden", "true");
    loopClone.classList.add("is-loop-clone");

    rail.style.transition = "none";
    rail.style.transform = `translateX(${fromX}px)`;
    rail.insertBefore(loopClone, firstCard);

    const from = fromX - step;
    rail.style.transform = `translateX(${from}px)`;
    rail.getBoundingClientRect();

    animateRail({
      from,
      to: 0,
      onFinish: () => {
        rail.insertBefore(lastCard, loopClone);
        loopClone.remove();
      },
    });
  };

  const shift = (direction) => {
    if (isLoopDisabled()) {
      resetToOriginalOrder();
      return;
    }
    if (isAnimating || !rail.firstElementChild) return;
    isAnimating = true;

    if (direction > 0) finishForward(0);
    else finishBackward(0);
  };

  const snapBack = () => {
    rail.style.transition = `transform 0.28s ${RAIL_EASING}`;
    rail.style.transform = "translateX(0)";

    const onEnd = () => {
      rail.removeEventListener("transitionend", onEnd);
      rail.style.transition = "none";
    };

    rail.addEventListener("transitionend", onEnd);
  };

  const stopAuto = () => {
    window.clearInterval(autoTimer);
    autoTimer = null;
  };

  const startAuto = (direction) => {
    if (isLoopDisabled()) {
      resetToOriginalOrder();
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      shift(direction);
      return;
    }

    stopAuto();
    shift(direction);

    if (!autoLoop) return;
    autoTimer = window.setInterval(() => shift(direction), 4000);
  };

  nextButton.addEventListener("click", () => startAuto(1));
  prevButton.addEventListener("click", () => startAuto(-1));
  rail.closest(".rail-wrap")?.addEventListener("mouseleave", stopAuto);

  const isInteractiveRailTarget = (event) =>
    Boolean(event.target.closest("button, a, input, select, textarea, .reel-product em"));

  rail.addEventListener("pointerdown", (event) => {
    if (isLoopDisabled()) return;
    if (isAnimating) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (isInteractiveRailTarget(event)) return;
    stopAuto();
    dragActive = true;
    startX = event.clientX;
    currentX = 0;
    rail.classList.add("is-dragging");
    rail.setPointerCapture(event.pointerId);
  });

  rail.addEventListener("pointermove", (event) => {
    if (!dragActive || isAnimating) return;
    currentX = event.clientX - startX;
    rail.style.transition = "none";
    rail.style.transform = `translateX(${currentX}px)`;
  });

  const endDrag = () => {
    if (!dragActive) return;
    dragActive = false;
    rail.classList.remove("is-dragging");

    const forwardStep = getStep(1);
    const backwardStep = getStep(-1);
    const threshold = Math.min(Math.max(forwardStep, backwardStep) * 0.15, 48);

    if (currentX <= -threshold) {
      isAnimating = true;
      finishForward(currentX);
    } else if (currentX >= threshold) {
      isAnimating = true;
      finishBackward(currentX);
    } else {
      snapBack();
    }

    currentX = 0;
  };

  rail.addEventListener("pointerup", endDrag);
  rail.addEventListener("pointercancel", endDrag);

  disableLoopMedia?.addEventListener("change", () => {
    if (isLoopDisabled()) resetToOriginalOrder();
  });

  if (isLoopDisabled()) resetToOriginalOrder();

  if (autoStartOnLoad && autoLoop && !isLoopDisabled()) {
    window.setTimeout(() => {
      if (!isLoopDisabled()) startAuto(1);
    }, 600);
  }
};

initLoopRail({ railId: "trend-rail", autoLoop: false, autoStartOnLoad: false });
initLoopRail({ railId: "seller-rail", autoLoop: true });
initLoopRail({ railId: "review-rail", autoLoop: true });

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
  let index = 0;
  let autoTimer = null;
  const autoDelay = 5000;

  const renderTimer = (value) => {
    const [hours = "00", minutes = "00", seconds = "00"] = value.split(":").map((part) => part.trim());
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
    if (price) price.innerHTML = `${item.price} <del>${item.originalPrice}</del> <mark>${item.discount}</mark>`;
    if (counter) counter.textContent = `${index + 1} / ${slides.length}`;
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

  renderSlide();
  restartAuto();
});

const hero = document.querySelector(".hero");
const heroFrame = document.querySelector(".hero-frame");
const heroTrack = document.querySelector(".hero-track");
const heroCounter = document.querySelector(".hero-counter");
const heroToggle = document.querySelector(".hero-toggle");
const heroPrev = document.querySelector(".hero-prev");
const heroNext = document.querySelector(".hero-next");

if (heroTrack) {
  const heroSlides = Array.from(heroTrack.children);
  const heroTotal = heroSlides.length;
  const heroCloneCount = heroTotal > 1 ? Math.min(2, heroTotal) : 0;
  let heroIndex = 0;
  let heroPosition = heroTotal > 1 ? heroCloneCount : 0;
  let heroTimer;
  let heroHoverPaused = false;
  let heroDragActive = false;
  let heroDragStartX = 0;
  let heroDragDeltaX = 0;
  let heroAutoplayEnabled = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroMobileQuery = window.matchMedia("(max-width: 1120px)");
  const reduceHeroMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const wrapHeroIndex = (index) => (index + heroTotal) % heroTotal;

  heroSlides.forEach((slide, index) => {
    slide.style.background = getComputedStyle(slide).background;
    slide.dataset.heroOriginalIndex = String(index);
  });

  if (heroTotal > 1) {
    const prependClones = heroSlides.slice(heroTotal - heroCloneCount).map((slide) => {
      const clone = slide.cloneNode(true);
      clone.classList.add("hero-clone");
      clone.setAttribute("aria-hidden", "true");
      return clone;
    });

    const appendClones = heroSlides.slice(0, heroCloneCount).map((slide) => {
      const clone = slide.cloneNode(true);
      clone.classList.add("hero-clone");
      clone.setAttribute("aria-hidden", "true");
      return clone;
    });

    prependClones.reverse().forEach((clone) => heroTrack.prepend(clone));
    appendClones.forEach((clone) => heroTrack.append(clone));
  }

  const getHeroTrackCards = () => Array.from(heroTrack.children);

  const updateHeroToggle = () => {
    if (!heroToggle) return;
    heroToggle.classList.toggle("is-paused", !heroAutoplayEnabled);
    heroToggle.setAttribute("aria-label", heroAutoplayEnabled ? "Pause hero" : "Play hero");
    heroToggle.setAttribute("aria-pressed", heroAutoplayEnabled ? "true" : "false");
  };

  const setHeroTransition = (enabled) => {
    heroTrack.style.transition = enabled && !reduceHeroMotionQuery.matches ? "" : "none";
  };

  const updateHeroCardState = () => {
    const activeOriginalIndex = String(heroIndex);
    getHeroTrackCards().forEach((card, index) => {
      card.classList.toggle("is-active", card.dataset.heroOriginalIndex === activeOriginalIndex);
    });
  };

  const getHeroMobileOffset = (position) => {
    const cards = getHeroTrackCards();
    const activeCard = cards[position];
    if (!heroFrame || !activeCard) return 0;

    return (heroFrame.clientWidth / 2) - (activeCard.offsetLeft + activeCard.offsetWidth / 2);
  };

  const setHeroPosition = (position, animate = true) => {
    heroPosition = position;
    setHeroTransition(animate);

    if (heroMobileQuery.matches) {
      heroTrack.style.transform = `translateX(${getHeroMobileOffset(heroPosition)}px)`;
    } else {
      heroTrack.style.transform = `translateX(-${heroPosition * 100}%)`;
    }

    updateHeroCardState();

    if (!animate) {
      requestAnimationFrame(() => setHeroTransition(true));
    }
  };

  const jumpHeroPosition = (position) => {
    heroPosition = position;
    heroTrack.classList.add("is-loop-jumping");
    heroTrack.style.transition = "none";

    if (heroMobileQuery.matches) {
      heroTrack.style.transform = `translateX(${getHeroMobileOffset(heroPosition)}px)`;
    } else {
      heroTrack.style.transform = `translateX(-${heroPosition * 100}%)`;
    }

    updateHeroCardState();
    void heroTrack.offsetWidth;
    setHeroTransition(true);
    requestAnimationFrame(() => heroTrack.classList.remove("is-loop-jumping"));
  };

  const updateHeroCounter = () => {
    if (heroCounter) heroCounter.textContent = `${heroIndex + 1} / ${heroTotal}`;
  };

  const syncHeroAfterLoop = () => {
    if (heroTotal <= 1) return;

    if (heroPosition < heroCloneCount) {
      jumpHeroPosition(heroPosition + heroTotal);
    } else if (heroPosition >= heroCloneCount + heroTotal) {
      jumpHeroPosition(heroPosition - heroTotal);
    }
  };

  const goToHeroSlide = (index) => {
    if (heroTotal <= 1) {
      heroIndex = 0;
      setHeroPosition(0);
      updateHeroCounter();
      return;
    }

    if (index < 0) {
      heroIndex = heroTotal - 1;
      setHeroPosition(heroCloneCount - 1);
    } else if (index >= heroTotal) {
      heroIndex = 0;
      setHeroPosition(heroCloneCount + heroTotal);
    } else {
      heroIndex = wrapHeroIndex(index);
      setHeroPosition(heroCloneCount + heroIndex);
    }

    updateHeroCounter();
    if (reduceHeroMotionQuery.matches) syncHeroAfterLoop();
  };

  const refreshHeroLayout = () => {
    setHeroPosition(heroPosition, false);
    updateHeroCounter();
  };

  const stopHeroAutoplay = () => {
    window.clearInterval(heroTimer);
  };

  const startHeroAutoplay = () => {
    stopHeroAutoplay();
    if (!heroAutoplayEnabled || heroHoverPaused) return;
    heroTimer = window.setInterval(() => goToHeroSlide(heroIndex + 1), 5000);
  };

  const resetHeroAutoplay = () => {
    if (heroAutoplayEnabled) startHeroAutoplay();
  };

  heroToggle?.addEventListener("click", () => {
    heroAutoplayEnabled = !heroAutoplayEnabled;
    updateHeroToggle();
    startHeroAutoplay();
  });

  heroPrev?.addEventListener("click", () => {
    goToHeroSlide(heroIndex - 1);
    resetHeroAutoplay();
  });

  heroNext?.addEventListener("click", () => {
    goToHeroSlide(heroIndex + 1);
    resetHeroAutoplay();
  });

  hero?.addEventListener("mouseenter", () => {
    heroHoverPaused = true;
    stopHeroAutoplay();
  });

  hero?.addEventListener("mouseleave", () => {
    heroHoverPaused = false;
    startHeroAutoplay();
  });

  hero?.addEventListener("focusin", () => {
    heroHoverPaused = true;
    stopHeroAutoplay();
  });

  hero?.addEventListener("focusout", () => {
    heroHoverPaused = false;
    startHeroAutoplay();
  });

  heroFrame?.addEventListener("pointerdown", (event) => {
    if (!heroMobileQuery.matches || heroTotal <= 1 || event.button !== 0) return;
    heroDragActive = true;
    heroDragStartX = event.clientX;
    heroDragDeltaX = 0;
    heroFrame.setPointerCapture(event.pointerId);
    stopHeroAutoplay();
  });

  heroFrame?.addEventListener("pointermove", (event) => {
    if (!heroDragActive) return;
    heroDragDeltaX = event.clientX - heroDragStartX;
  });

  const finishHeroDrag = () => {
    if (!heroDragActive) return;
    heroDragActive = false;

    if (heroDragDeltaX <= -35) {
      goToHeroSlide(heroIndex + 1);
    } else if (heroDragDeltaX >= 35) {
      goToHeroSlide(heroIndex - 1);
    }

    heroDragDeltaX = 0;
    if (!heroHoverPaused) startHeroAutoplay();
  };

  heroFrame?.addEventListener("pointerup", finishHeroDrag);
  heroFrame?.addEventListener("pointercancel", finishHeroDrag);

  heroTrack.addEventListener("transitionend", (event) => {
    if (event.propertyName === "transform") syncHeroAfterLoop();
  });

  heroMobileQuery.addEventListener?.("change", refreshHeroLayout);
  window.addEventListener("resize", refreshHeroLayout);

  updateHeroToggle();
  refreshHeroLayout();
  if (heroTotal > 1) startHeroAutoplay();
}

const todayPick = document.querySelector(".today-pick");
const todayPickTrack = document.querySelector(".today-pick-track");
const todayPickToggle = document.querySelector(".today-pick-toggle");
const todayPickSoldCount = document.querySelector(".today-pick-sold-count");
const todayPickProgress = document.querySelectorAll(".today-pick-progress button");

if (todayPick && todayPickTrack) {
  const todayPickSold = ["3,215", "2,108", "1,890", "4,502"];
  const todayPickTotal = todayPickTrack.children.length;
  let todayPickIndex = 0;
  let todayPickTimer;
  let todayPickHoverPaused = false;
  let todayPickCollapsed = false;
  let todayPickAutoplayEnabled = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const updateTodayPick = () => {
    todayPickTrack.style.transform = `translateX(-${todayPickIndex * 100}%)`;
    if (todayPickSoldCount) todayPickSoldCount.textContent = todayPickSold[todayPickIndex];

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

    todayPick.style.removeProperty("height");
    const collapsedHeightLimit = parseFloat(getComputedStyle(todayPick).getPropertyValue("--today-pick-collapsed-height")) || 170.5;
    todayPick.style.setProperty("--today-pick-height", `${Math.min(todayPick.offsetHeight, collapsedHeightLimit)}px`);

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
    if (!window.matchMedia("(min-width: 761px)").matches) return;
    if (event.target.closest("button, a")) return;

    const target = document.querySelector(".deal-card.special .deal-copy");
    if (!target) return;

    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center",
    });
  });

  updateTodayPick();
  measureTodayPickHeight();
  window.addEventListener("resize", measureTodayPickHeight);
  startTodayPickAutoplay();
}

document.querySelectorAll(".tab-row button, .tag-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.parentElement;
    group.querySelectorAll("button").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
  });
});

const searchForm = document.querySelector(".search");
const searchInput = document.querySelector("#site-search");
const mobileSearchInput = document.querySelector("#mobile-site-search");
const searchPanel = document.querySelector(".search-panel");
const searchTabs = document.querySelectorAll("[data-search-tab]");
const searchSections = document.querySelectorAll("[data-search-panel]");
const searchCloseButtons = document.querySelectorAll(".search-close");
const searchClearButtons = document.querySelectorAll(".search-clear");
const mobileMenuButtons = document.querySelectorAll("[data-mobile-menu-open]");
const mobileMenuPanel = document.querySelector(".mobile-menu-panel");
const mobileMenuCloseButton = document.querySelector(".mobile-menu-close");
const mobileSubmenuOpenButton = document.querySelector("[data-mobile-submenu-open='categories']");
const mobileSubmenuPanel = document.querySelector(".mobile-submenu-panel");
const mobileSubmenuBackButton = document.querySelector(".mobile-submenu-back");
const mobileSubmenuList = document.querySelector(".mobile-submenu-list");
const mobileMenuList = document.querySelector(".mobile-menu-list");
const mobileTertiaryPanel = document.querySelector(".mobile-tertiary-panel");
const mobileTertiaryBackButton = document.querySelector(".mobile-tertiary-back");
const mobileTertiaryTitle = document.querySelector(".mobile-tertiary-title");
const mobileTertiaryList = document.querySelector(".mobile-tertiary-list");
const mobileCategoryContent = document.querySelector(".mobile-category-content");
const mobileQuaternaryPanel = document.querySelector(".mobile-quaternary-panel");
const mobileQuaternaryBackButton = document.querySelector(".mobile-quaternary-back");
const mobileQuaternaryTitle = document.querySelector(".mobile-quaternary-title");
const mobileQuaternaryList = document.querySelector(".mobile-quaternary-list");
const categoryMenu = document.querySelector(".category-menu");
const categoryLinks = document.querySelectorAll(".category-nav a");
const categoryMegaPanels = document.querySelectorAll("[data-menu-panel]");
let categoryMenuTimer = null;
let mobileCurrentThirdKey = "";
let mobileCategoryScrollFrame = null;
let mobileActiveCategoryIndex = -1;

const getListingPagePrefix = () => {
  if (document.body.classList.contains("timedeal-page")) return "../listing/";
  if (document.body.classList.contains("product-detail-page")) return "../listing/";
  if (document.body.classList.contains("listing-page")) return "./";
  return "listing/";
};

const getRealtrendUrl = () => {
  if (document.body.classList.contains("realtrend-page")) return "./realtrend.html";
  if (
    document.body.classList.contains("listing-page") ||
    document.body.classList.contains("timedeal-page") ||
    document.body.classList.contains("product-detail-page")
  ) {
    return "../realtrend/realtrend.html";
  }
  return "realtrend/realtrend.html";
};

const listingCategoryPages = {
  beauty: "beauty.html",
  "k-food": "k-food.html",
  lifestyle: "lifestyle.html",
  "k-pop": "k-pop.html",
  "k-traditional": "k-traditional.html",
};

const listingCategoryLabels = {
  beauty: "beauty",
  "k-food": "k-food",
  lifestyle: "lifestyle",
  "k-pop": "k-pop",
  "k-traditional": "k-traditional",
};

const getListingCategoryUrl = (key) => {
  const fileName = listingCategoryPages[key] || listingCategoryPages.beauty;
  if (document.body.classList.contains("realtrend-page")) return `../listing/${fileName}`;
  return `${getListingPagePrefix()}${fileName}`;
};

const getBeautyListingUrl = () => getListingCategoryUrl("beauty");

const wireListingCategoryLinks = () => {
  Object.entries(listingCategoryPages).forEach(([key]) => {
    const url = getListingCategoryUrl(key);

    document.querySelectorAll(`.category-nav a[data-mega-target="${key}"]`).forEach((link) => {
      link.setAttribute("href", url);
    });

    document.querySelectorAll(`.category-mega[data-menu-panel="${key}"] .mega-feature`).forEach((feature) => {
      if (feature.matches("a")) {
        feature.setAttribute("href", url);
        return;
      }

      feature.setAttribute("role", "link");
      feature.setAttribute("tabindex", "0");
      feature.addEventListener("click", () => {
        navigateWithPageTransition(url);
      });
      feature.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        navigateWithPageTransition(url);
      });
    });

    document.querySelectorAll(`.mobile-submenu-list a[data-mobile-third-open="${key}"]`).forEach((link) => {
      link.setAttribute("href", url);
    });
  });

  document.querySelectorAll(".mobile-cats a").forEach((link) => {
    const key = link.textContent.trim().toLowerCase().replace(/\s+/g, "-");
    if (!listingCategoryLabels[key]) return;
    link.setAttribute("href", getListingCategoryUrl(key));
  });
};

wireListingCategoryLinks();

const mobileThirdCategoryData = {
  beauty: [
    { label: "Beauty Trendy Pick", href: getBeautyListingUrl() },
    { label: "Skincare", children: ["Cleansers", "Serum/Ampoule", "Moiaturizers", "Toners", "Mask", "Suncare", "Trouble Care", "Sets"] },
    { label: "Makeup", children: ["Face", "Eye", "Lip", "Cheeks"] },
    { label: "Hair Care", children: ["Daily Care", "Special Care", "Hair Color & Perm", "Hair Styling", "Hair Perfume"] },
    { label: "Body Care", children: ["Bath & Shower", "Body Moisturizers", "Fragrance", "Hand & Foot Care", "Hair Removal", "Personal Care"] },
    { label: "Beauty Tools", children: ["Skincare", "Makeup", "Body Care", "Hair", "Hair Removal", "Beauty Devices"] },
    { label: "Nail", children: ["Nail Care", "Nail Polish", "Nail Art", "Nail Tips", "Nail Tools"] },
    { label: "Men's", children: ["Face Care", "Hair Care", "Body Care", "Men’s Makeup"] },
    { label: "Supplements", children: ["Beauty", "Slimming", "Health"] },

  ],
  "k-food": [
    { label: "Food Trendy Pick", href: getListingCategoryUrl("k-food") },
    { label: "Ramen & Noodles", children: ["Ramen/Cup Noodles", "Other Noodles"] },
    { label: "Snacks & Nuts", children: ["Snacks", "Cookies & Pies", "Natural Snacks", "Nuts", "Candy & Chocolate", "Gim(Seaweed) Snacks", "Dried Fish", "Snack Sets"] },
    { label: "Instant & Quick Meals", children: ["Meal Kits", "Instant Rice", "Instant Soups", "Street Food"] },
    { label: "Beverages", children: ["Coffee", "Tea", "Soft Drinks", "Health Drinks", "Others"] },
    { label: "Kitchen Staples", children: ["Pastes", "Sauces", "Marinades", "Oil", "Canned Food", "Powders", "Seasonings", "Dressing"] },
    { label: "Kimchi & Side Dishes", children: ["Kimchi", "Side Dishes"] },
    { label: "Health", children: ["Ginseng", "Supplements"] },
  ],
  lifestyle: [
    { label: "Lifestyle Trendy Pick", href: getListingCategoryUrl("lifestyle") },
    { label: "Toys & Cratfs", children: ["Character", "Toys", "Games"] },
    { label: "Staionery", children: ["Character", "Paper Goods", "Writing Tools", "Study Gadgets", "Decor"] },
    { label: "Kitchen", children: ["Kitchen Appliances", "Storage", "Kitchenware"] },
    { label: "Living"}
  ],
  "k-pop": [
    { label: "K-POP Trendy Pick", href: getListingCategoryUrl("k-pop") },
    { label: "Bestseller"},
    { label: "New Release"},
    { label: "Album"},
    { label: "Photo Book"},
    { label: "Goods"},
  ],
  "k-traditional": [
    { label: "K-Traditional Trendy Pick", href: getListingCategoryUrl("k-traditional") },
    { label: "Art&Decor"},
    { label: "DIY"},
    { label: "Fashion&Accessories"},
    { label: "Stationery"},
    { label: "Home"},
    { label: "Kitchen"},
    { label: "Food"},
    { label: "Games"},

  ],
  "tp-pick": [
    { label: "Editor’s Pick"},
    { label: "T.P Magazine"},
    { label: "Real Trend", href: getRealtrendUrl() },
  ],
};

const updateSearchPanelBounds = () => {
  if (!searchPanel) return;
  searchPanel.style.removeProperty("--search-panel-left");
  searchPanel.style.removeProperty("--search-panel-width");
};

updateSearchPanelBounds();

const openSearchPanel = (options = {}) => {
  if (!searchPanel) return;
  closeCategoryMega();
  updateSearchPanelBounds();
  searchPanel.classList.add("is-open");
  searchPanel.setAttribute("aria-hidden", "false");
  if (window.matchMedia("(max-width: 1120px)").matches) {
    animateTrendingSearches(searchPanel.querySelector(".search-mobile-content"));
    if (options.focusMobile !== false) {
      window.requestAnimationFrame(() => {
        mobileSearchInput?.focus({ preventScroll: true });
      });
    }
  }
};

const closeSearchPanel = () => {
  if (!searchPanel) return;
  searchPanel.classList.remove("is-open");
  searchPanel.setAttribute("aria-hidden", "true");
};

const openMobileMenu = () => {
  if (!mobileMenuPanel) return;
  closeSearchPanel();
  closeCategoryMega();
  mobileMenuPanel.classList.remove("is-submenu-open");
  mobileSubmenuPanel?.classList.remove("is-tertiary-open");
  mobileTertiaryPanel?.classList.remove("is-quaternary-open");
  mobileSubmenuPanel?.setAttribute("aria-hidden", "true");
  mobileTertiaryPanel?.setAttribute("aria-hidden", "true");
  mobileQuaternaryPanel?.setAttribute("aria-hidden", "true");
  document.body.classList.add("is-mobile-menu-open");
  mobileMenuPanel.setAttribute("aria-hidden", "false");
  mobileMenuButtons.forEach((button) => button.setAttribute("aria-expanded", "true"));
};

const closeMobileMenu = () => {
  if (!mobileMenuPanel) return;
  document.body.classList.remove("is-mobile-menu-open");
  mobileMenuPanel.classList.remove("is-submenu-open");
  mobileSubmenuPanel?.classList.remove("is-tertiary-open");
  mobileTertiaryPanel?.classList.remove("is-quaternary-open");
  mobileSubmenuPanel?.setAttribute("aria-hidden", "true");
  mobileTertiaryPanel?.setAttribute("aria-hidden", "true");
  mobileQuaternaryPanel?.setAttribute("aria-hidden", "true");
  mobileMenuPanel.setAttribute("aria-hidden", "true");
  mobileMenuButtons.forEach((button) => button.setAttribute("aria-expanded", "false"));
};

const openMobileSubmenu = () => {
  if (!mobileMenuPanel || !mobileSubmenuPanel) return;
  mobileSubmenuPanel.classList.remove("is-tertiary-open");
  mobileTertiaryPanel?.classList.remove("is-quaternary-open");
  mobileTertiaryPanel?.setAttribute("aria-hidden", "true");
  mobileQuaternaryPanel?.setAttribute("aria-hidden", "true");
  mobileMenuPanel.classList.add("is-submenu-open");
  mobileSubmenuPanel.setAttribute("aria-hidden", "false");
};

const closeMobileSubmenu = () => {
  if (!mobileMenuPanel || !mobileSubmenuPanel) return;
  mobileSubmenuPanel.classList.remove("is-tertiary-open");
  mobileTertiaryPanel?.classList.remove("is-quaternary-open");
  mobileTertiaryPanel?.setAttribute("aria-hidden", "true");
  mobileQuaternaryPanel?.setAttribute("aria-hidden", "true");
  mobileMenuPanel.classList.remove("is-submenu-open");
  mobileSubmenuPanel.setAttribute("aria-hidden", "true");
};

const getMobilePrimaryLabel = (key) => {
  const trigger = document.querySelector(`[data-mobile-third-open="${key}"]`);
  return trigger?.childNodes[0]?.textContent?.trim() || "Categories";
};

const getMobileSideLabel = (label) => {
  if (/trendy pick/i.test(label)) return "Trendy Pick";
  return label;
};

const getMobileSectionTitle = (label, primaryLabel) => {
  if (/trendy pick/i.test(label)) return `${primaryLabel} Trendy Pick`;
  return label;
};

const getMobileThumbHue = (label, index) => {
  const seed = Array.from(label).reduce((total, letter) => total + letter.charCodeAt(0), 0);
  return (seed + index * 41) % 360;
};

const setActiveMobileCategory = (index, { syncListScroll = true } = {}) => {
  if (!mobileTertiaryList) return;
  if (index === mobileActiveCategoryIndex) return;

  mobileActiveCategoryIndex = index;
  mobileTertiaryList.querySelectorAll("button").forEach((button, buttonIndex) => {
    const isActive = buttonIndex === index;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "true" : "false");
    if (isActive && syncListScroll) {
      button.scrollIntoView({ block: "nearest" });
    }
  });
};

const updateActiveMobileCategoryFromScroll = () => {
  if (!mobileCategoryContent) return;
  const sections = Array.from(mobileCategoryContent.querySelectorAll(".mobile-category-section"));
  if (!sections.length) return;

  const anchor = mobileCategoryContent.getBoundingClientRect().top + 24;
  let activeIndex = 0;

  sections.forEach((section, index) => {
    if (section.getBoundingClientRect().top <= anchor) activeIndex = index;
  });

  setActiveMobileCategory(activeIndex);
};

const queueMobileCategoryScrollSpy = () => {
  window.cancelAnimationFrame(mobileCategoryScrollFrame);
  mobileCategoryScrollFrame = window.requestAnimationFrame(updateActiveMobileCategoryFromScroll);
};

const createMobileCategoryTile = (label, index, href) => {
  const link = document.createElement("a");
  link.href = href || "#";
  link.className = "mobile-category-tile";
  if (!href) {
    link.addEventListener("click", (event) => event.preventDefault());
  }

  const thumb = document.createElement("span");
  thumb.className = "mobile-category-thumb";
  thumb.setAttribute("aria-hidden", "true");
  thumb.style.setProperty("--thumb-hue", getMobileThumbHue(label, index));

  const text = document.createElement("span");
  text.textContent = label;

  link.append(thumb, text);
  return link;
};

const openMobileTertiary = (key) => {
  if (!mobileSubmenuPanel || !mobileTertiaryPanel || !mobileTertiaryList || !mobileCategoryContent) return;
  const items = mobileThirdCategoryData[key];
  if (!items) {
    closeMobileMenu();
    return;
  }

  const primaryLabel = getMobilePrimaryLabel(key);

  mobileTertiaryList.replaceChildren(
    ...items.map((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = getMobileSideLabel(item.label);
      button.classList.toggle("is-active", index === 0);
      button.setAttribute("aria-current", index === 0 ? "true" : "false");
      button.addEventListener("click", () => {
        if (item.href) {
          navigateWithPageTransition(item.href);
          return;
        }

        const target = mobileCategoryContent.querySelector(`[data-mobile-category-index="${index}"]`);
        if (!target) return;
        setActiveMobileCategory(index);
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return button;
    }),
  );

  mobileCategoryContent.replaceChildren(
    ...items.map((item, index) => {
      const section = document.createElement("section");
      section.className = "mobile-category-section";
      section.dataset.mobileCategoryIndex = String(index);

      const header = document.createElement("div");
      header.className = "mobile-category-section-header";

      const title = document.createElement("h3");
      title.textContent = getMobileSectionTitle(item.label, primaryLabel);

      const arrow = document.createElement("span");
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = ">";

      header.append(title, arrow);

      const grid = document.createElement("div");
      grid.className = "mobile-category-grid";
      const children = Array.isArray(item.children) && item.children.length ? item.children : [item.label];
      children.forEach((child, childIndex) => {
        grid.append(createMobileCategoryTile(child, index * 20 + childIndex, item.href));
      });

      section.append(header, grid);
      return section;
    }),
  );

  mobileCurrentThirdKey = key;

  if (mobileTertiaryTitle) {
    mobileTertiaryTitle.textContent = primaryLabel;
  }

  mobileTertiaryPanel.classList.remove("is-quaternary-open");
  mobileQuaternaryPanel?.setAttribute("aria-hidden", "true");
  mobileMenuPanel?.classList.add("is-submenu-open");
  mobileSubmenuPanel.setAttribute("aria-hidden", "false");
  mobileSubmenuPanel.classList.add("is-tertiary-open");
  mobileTertiaryPanel.setAttribute("aria-hidden", "false");
  mobileCategoryContent.scrollTo({ top: 0, left: 0, behavior: "auto" });
  mobileActiveCategoryIndex = -1;
  setActiveMobileCategory(0);
};

const closeMobileTertiary = () => {
  if (!mobileSubmenuPanel || !mobileTertiaryPanel) return;
  mobileTertiaryPanel.classList.remove("is-quaternary-open");
  mobileQuaternaryPanel?.setAttribute("aria-hidden", "true");
  mobileSubmenuPanel.classList.remove("is-tertiary-open");
  mobileTertiaryPanel.setAttribute("aria-hidden", "true");
};

const openMobileQuaternary = (index) => {
  if (!mobileTertiaryPanel || !mobileQuaternaryPanel || !mobileQuaternaryList) return;
  const branch = mobileThirdCategoryData[mobileCurrentThirdKey];
  if (!branch || !branch[index]) return;

  const target = branch[index];
  if (!Array.isArray(target.children) || !target.children.length) {
    closeMobileMenu();
    return;
  }
  mobileQuaternaryList.replaceChildren(
    ...target.children.map((label) => {
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = label;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        closeMobileMenu();
      });
      return link;
    }),
  );

  if (mobileQuaternaryTitle) {
    mobileQuaternaryTitle.textContent = target.label;
  }

  mobileTertiaryPanel.classList.add("is-quaternary-open");
  mobileQuaternaryPanel.setAttribute("aria-hidden", "false");
};

const closeMobileQuaternary = () => {
  if (!mobileTertiaryPanel || !mobileQuaternaryPanel) return;
  mobileTertiaryPanel.classList.remove("is-quaternary-open");
  mobileQuaternaryPanel.setAttribute("aria-hidden", "true");
};

const categoryNav = document.querySelector(".category-nav");
const categoryNavScrollQuery = window.matchMedia("(max-width: 1120px)");

const getCurrentCategoryLink = () => (
  categoryNav?.querySelector('a[aria-current="page"]') ||
  categoryNav?.querySelector("a.is-active")
);

const restoreCurrentCategoryLink = () => {
  const currentLink = categoryNav?.querySelector('a[aria-current="page"]');
  if (!currentLink) return;

  categoryLinks.forEach((link) => {
    link.classList.toggle("is-active", link === currentLink);
  });
};

const scrollCurrentCategoryIntoView = (behavior = "auto") => {
  if (!categoryNav || !categoryNavScrollQuery.matches) return;

  const currentLink = getCurrentCategoryLink();
  if (!currentLink) return;

  const maxScrollLeft = Math.max(0, categoryNav.scrollWidth - categoryNav.clientWidth);
  const targetLeft = currentLink.offsetLeft - (categoryNav.clientWidth - currentLink.offsetWidth) / 2;

  categoryNav.scrollTo({
    left: Math.max(0, Math.min(maxScrollLeft, targetLeft)),
    behavior,
  });
};

const queueScrollCurrentCategoryIntoView = (behavior = "auto") => {
  window.requestAnimationFrame(() => scrollCurrentCategoryIntoView(behavior));
};

const closeCategoryMega = () => {
  categoryMegaPanels.forEach((panel) => panel.classList.remove("is-open"));
  categoryLinks.forEach((link) => link.classList.remove("is-active"));
  restoreCurrentCategoryLink();
};

const animateTrendingSearches = (section) => {
  if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const list = section.querySelector(".trending-searches");
  if (!list) return;

  list.classList.remove("is-animating");
  void list.offsetWidth;
  list.classList.add("is-animating");
};

const openCategoryMega = (target) => {
  window.clearTimeout(categoryMenuTimer);
  let hasPanel = false;

  categoryMegaPanels.forEach((panel) => {
    const isTarget = panel.dataset.menuPanel === target;
    panel.classList.toggle("is-open", isTarget);
    if (isTarget) hasPanel = true;
  });

  categoryLinks.forEach((link) => {
    link.classList.toggle("is-active", hasPanel && link.dataset.megaTarget === target);
  });

  if (!hasPanel) closeCategoryMega();
};

const queueCloseCategoryMega = () => {
  window.clearTimeout(categoryMenuTimer);
  categoryMenuTimer = window.setTimeout(closeCategoryMega, 90);
};

searchInput?.addEventListener("focus", openSearchPanel);
searchInput?.addEventListener("click", openSearchPanel);
searchInput?.addEventListener("input", () => {
  if (mobileSearchInput) mobileSearchInput.value = searchInput.value;
});

mobileSearchInput?.addEventListener("input", () => {
  if (searchInput) searchInput.value = mobileSearchInput.value;
});

document.querySelector("[data-bottom-search-open]")?.addEventListener("click", (event) => {
  event.preventDefault();
  closeMobileMenu();
  openSearchPanel({ focusMobile: true });
});

searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  openSearchPanel();
});

searchTabs.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedTab = button.dataset.searchTab;

    searchTabs.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    searchSections.forEach((section) => {
      const isActive = section.dataset.searchPanel === selectedTab;
      section.classList.toggle("is-active", isActive);
      section.hidden = !isActive;
      if (isActive && selectedTab === "trending") animateTrendingSearches(section);
    });
  });
});

searchCloseButtons.forEach((button) => {
  button.addEventListener("click", closeSearchPanel);
});

searchClearButtons.forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".recent-searches").forEach((list) => list.replaceChildren());
  });
});

mobileMenuButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    openMobileMenu();
  });
});
mobileMenuCloseButton?.addEventListener("click", closeMobileMenu);
mobileSubmenuOpenButton?.addEventListener("click", (event) => {
  event.preventDefault();
  openMobileSubmenu();
});
mobileMenuList?.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-mobile-third-open]");
  if (!link) return;
  event.preventDefault();
  openMobileTertiary(link.dataset.mobileThirdOpen);
});
mobileSubmenuBackButton?.addEventListener("click", closeMobileSubmenu);
mobileSubmenuList?.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-mobile-third-open]");
  if (!link) return;

  const key = link.dataset.mobileThirdOpen;
  const clickedArrow = event.target.closest("span[aria-hidden='true']");

  if (clickedArrow && link.contains(clickedArrow)) {
    event.preventDefault();
    openMobileTertiary(key);
    return;
  }

  const href = link.getAttribute("href");
  if (href && href !== "#") {
    closeMobileMenu();
    return;
  }

  event.preventDefault();
  openMobileTertiary(key);
});
mobileTertiaryBackButton?.addEventListener("click", closeMobileTertiary);
mobileQuaternaryBackButton?.addEventListener("click", closeMobileQuaternary);

mobileCategoryContent?.addEventListener("scroll", queueMobileCategoryScrollSpy, { passive: true });

mobileMenuPanel?.querySelectorAll("a").forEach((link) => {
  if (link.hasAttribute("data-mobile-submenu-open")) return;
  if (link.hasAttribute("data-mobile-third-open")) return;
  link.addEventListener("click", closeMobileMenu);
});

categoryLinks.forEach((link) => {
  link.addEventListener("mouseenter", () => openCategoryMega(link.dataset.megaTarget));
  link.addEventListener("focus", () => openCategoryMega(link.dataset.megaTarget));
  link.addEventListener("click", (event) => {
    if (link.getAttribute("aria-current") === "page" && categoryNavScrollQuery.matches) {
      event.preventDefault();
      restoreCurrentCategoryLink();
      scrollCurrentCategoryIntoView("smooth");
      return;
    }

    const href = link.getAttribute("href");
    if (href && href !== "#") return;
    event.preventDefault();
  });
});

categoryMegaPanels.forEach((panel) => {
  panel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (href && href !== "#") return;
      event.preventDefault();
    });
  });
});

categoryMenu?.addEventListener("mouseenter", () => window.clearTimeout(categoryMenuTimer));
categoryMenu?.addEventListener("mouseleave", queueCloseCategoryMega);
categoryMenu?.addEventListener("focusout", (event) => {
  if (!categoryMenu.contains(event.relatedTarget)) queueCloseCategoryMega();
});

queueScrollCurrentCategoryIntoView();
window.addEventListener("load", () => queueScrollCurrentCategoryIntoView());

document.addEventListener("pointerdown", (event) => {
  if (!searchPanel?.classList.contains("is-open")) return;
  if (event.target.closest(".search-panel") || event.target.closest(".search")) return;
  closeSearchPanel();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeSearchPanel();
  closeMobileMenu();
  closeCategoryMega();
});

window.addEventListener("resize", () => {
  if (searchPanel?.classList.contains("is-open")) updateSearchPanelBounds();
  if (window.matchMedia("(min-width: 1121px)").matches) closeMobileMenu();
  else closeCategoryMega();
  queueScrollCurrentCategoryIntoView();
});

const sellerRail = document.getElementById("seller-rail");
const sellerWishlistQuery = window.matchMedia("(max-width: 1120px)");
const sellerWishlistActiveRanks = new Set();
const sellerWishlistIcons = {
  desktop: "img/main-img/heart2.png",
  dark: "img/mobile-icon/menu/wishlist.png",
  light: "img/mobile-icon/menu/wishlist2.png",
  active: "img/mobile-icon/menu/wishlist-hover.png",
};

const getSellerRank = (card) => {
  if (!card) return 0;
  const rankNode = Array.from(card.children).find((child) => child.tagName === "B");
  return Number(rankNode?.textContent.trim() || 0);
};

const getSellerWishlistDefaultIcon = (card) => {
  if (!sellerWishlistQuery.matches) return sellerWishlistIcons.desktop;
  return getSellerRank(card) <= 3 ? sellerWishlistIcons.light : sellerWishlistIcons.dark;
};

const updateSellerWishlistIcons = () => {
  sellerRail?.querySelectorAll(".product-card").forEach((card) => {
    const rank = getSellerRank(card);
    const button = card.querySelector('.card-actions button[aria-label="Wishlist"]');
    const icon = button?.querySelector("img");
    if (!rank || !button || !icon) return;

    const isActive = sellerWishlistActiveRanks.has(rank);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
    icon.src = isActive ? sellerWishlistIcons.active : getSellerWishlistDefaultIcon(card);
  });
};

document.addEventListener("click", (event) => {
  const button = event.target.closest?.('.seller-section .card-actions button[aria-label="Wishlist"]');
  if (!button || !sellerRail.contains(button)) return;

  event.preventDefault();
  event.stopPropagation();

  const card = button.closest(".product-card");
  const rank = getSellerRank(card);
  if (!rank) return;

  if (sellerWishlistActiveRanks.has(rank)) sellerWishlistActiveRanks.delete(rank);
  else sellerWishlistActiveRanks.add(rank);

  const icon = button.querySelector("img");
  if (icon) {
    icon.src = sellerWishlistActiveRanks.has(rank)
      ? sellerWishlistIcons.active
      : getSellerWishlistDefaultIcon(card);
  }

  updateSellerWishlistIcons();
}, true);

sellerWishlistQuery.addEventListener?.("change", updateSellerWishlistIcons);
window.addEventListener("resize", updateSellerWishlistIcons);
updateSellerWishlistIcons();

const magazineGrid = document.querySelector(".magazine-grid");
const magazineBlock = document.querySelector(".magazine-block");
const magazineSliderQuery = window.matchMedia("(max-width: 760px)");

const updateMagazineSliderBar = () => {
  if (!magazineGrid || !magazineBlock) return;

  const cardCount = magazineGrid.querySelectorAll(".magazine-card").length || 1;
  const trackStart = 12;
  const trackWidth = 76;
  const thumbSize = trackWidth / cardCount;
  const maxScroll = magazineGrid.scrollWidth - magazineGrid.clientWidth;
  const progress = maxScroll > 0 ? magazineGrid.scrollLeft / maxScroll : 0;
  const thumbLeft = trackStart + (trackWidth - thumbSize) * Math.max(0, Math.min(progress, 1));

  magazineBlock.style.setProperty("--magazine-thumb-size", `${thumbSize}%`);
  magazineBlock.style.setProperty("--magazine-thumb-left", `${thumbLeft}%`);
};

if (magazineGrid && magazineBlock) {
  let magazineFrame = null;
  let isMagazineDragging = false;
  let magazinePointerId = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartScrollLeft = 0;
  let magazineDragAxis = null;
  let magazineTouchActive = false;
  let magazineTouchStartX = 0;
  let magazineTouchStartY = 0;
  let magazineTouchStartScrollLeft = 0;
  let magazineTouchAxis = null;
  let isMagazineBarDragging = false;
  let magazineBarPointerId = null;

  const scheduleMagazineSliderBar = () => {
    if (!magazineSliderQuery.matches) return;
    window.cancelAnimationFrame(magazineFrame);
    magazineFrame = window.requestAnimationFrame(updateMagazineSliderBar);
  };

  const stopMagazineDrag = () => {
    isMagazineDragging = false;
    magazinePointerId = null;
    magazineDragAxis = null;
    magazineGrid.classList.remove("is-dragging");
  };

  const getMagazineBarMetrics = () => {
    const rect = magazineBlock.getBoundingClientRect();
    const trackLeft = rect.left + rect.width * 0.12;
    const trackWidth = rect.width * 0.76;
    return {
      rect,
      trackLeft,
      trackRight: trackLeft + trackWidth,
      trackWidth,
      hitTop: rect.bottom - 24,
      hitBottom: rect.bottom + 10,
    };
  };

  const syncMagazineScrollFromBar = (clientX) => {
    const { trackLeft, trackWidth } = getMagazineBarMetrics();
    const maxScroll = magazineGrid.scrollWidth - magazineGrid.clientWidth;
    if (maxScroll <= 0 || trackWidth <= 0) return;

    const progress = Math.max(0, Math.min((clientX - trackLeft) / trackWidth, 1));
    magazineGrid.scrollLeft = progress * maxScroll;
    updateMagazineSliderBar();
  };

  const handleMagazinePointerDown = (event) => {
    if (!magazineSliderQuery.matches) return;
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    isMagazineDragging = true;
    magazinePointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragStartScrollLeft = magazineGrid.scrollLeft;
    magazineDragAxis = event.pointerType === "mouse" ? "x" : null;
    if (magazineDragAxis === "x") {
      magazineGrid.classList.add("is-dragging");
    }
    if (event.pointerType === "mouse" && typeof magazineGrid.setPointerCapture === "function") {
      magazineGrid.setPointerCapture(event.pointerId);
    }
  };

  const handleMagazinePointerMove = (event) => {
    if (!isMagazineDragging || magazinePointerId !== event.pointerId) return;
    const deltaX = event.clientX - dragStartX;
    const deltaY = event.clientY - dragStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (!magazineDragAxis) {
      if (Math.max(absX, absY) < 6) return;
      if (absY > absX) {
        stopMagazineDrag();
        return;
      }
      magazineDragAxis = "x";
      magazineGrid.classList.add("is-dragging");
      if (typeof magazineGrid.setPointerCapture === "function") {
        magazineGrid.setPointerCapture(event.pointerId);
      }
    }

    event.preventDefault();
    magazineGrid.scrollLeft = dragStartScrollLeft - deltaX;
    updateMagazineSliderBar();
  };

  const handleMagazinePointerUp = (event) => {
    if (magazinePointerId !== event.pointerId) return;
    stopMagazineDrag();
  };

  const stopMagazineTouch = () => {
    magazineTouchActive = false;
    magazineTouchAxis = null;
    magazineGrid.classList.remove("is-dragging");
  };

  const handleMagazineTouchStart = (event) => {
    if (!magazineSliderQuery.matches || event.touches.length !== 1) return;

    const touch = event.touches[0];
    magazineTouchActive = true;
    magazineTouchStartX = touch.clientX;
    magazineTouchStartY = touch.clientY;
    magazineTouchStartScrollLeft = magazineGrid.scrollLeft;
    magazineTouchAxis = null;
  };

  const handleMagazineTouchMove = (event) => {
    if (!magazineTouchActive || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - magazineTouchStartX;
    const deltaY = touch.clientY - magazineTouchStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (!magazineTouchAxis) {
      if (Math.max(absX, absY) < 6) return;
      if (absY > absX) {
        stopMagazineTouch();
        return;
      }
      magazineTouchAxis = "x";
      magazineGrid.classList.add("is-dragging");
    }

    event.preventDefault();
    magazineGrid.scrollLeft = magazineTouchStartScrollLeft - deltaX;
    updateMagazineSliderBar();
  };

  const handleMagazineBarPointerDown = (event) => {
    if (!magazineSliderQuery.matches) return;

    const { trackLeft, trackRight, hitTop, hitBottom } = getMagazineBarMetrics();
    const isInsideTrack =
      event.clientX >= trackLeft &&
      event.clientX <= trackRight &&
      event.clientY >= hitTop &&
      event.clientY <= hitBottom;

    if (!isInsideTrack) return;

    event.preventDefault();
    isMagazineBarDragging = true;
    magazineBarPointerId = event.pointerId;
    syncMagazineScrollFromBar(event.clientX);
    if (typeof magazineBlock.setPointerCapture === "function") {
      magazineBlock.setPointerCapture(event.pointerId);
    }
  };

  const handleMagazineBarPointerMove = (event) => {
    if (!isMagazineBarDragging || magazineBarPointerId !== event.pointerId) return;
    event.preventDefault();
    syncMagazineScrollFromBar(event.clientX);
  };

  const handleMagazineBarPointerUp = (event) => {
    if (magazineBarPointerId !== event.pointerId) return;
    isMagazineBarDragging = false;
    magazineBarPointerId = null;
  };

  magazineGrid.addEventListener("scroll", scheduleMagazineSliderBar, { passive: true });
  magazineGrid.addEventListener("pointerdown", handleMagazinePointerDown);
  magazineGrid.addEventListener("pointermove", handleMagazinePointerMove);
  magazineGrid.addEventListener("pointerup", handleMagazinePointerUp);
  magazineGrid.addEventListener("pointercancel", handleMagazinePointerUp);
  magazineGrid.addEventListener("touchstart", handleMagazineTouchStart, { passive: true });
  magazineGrid.addEventListener("touchmove", handleMagazineTouchMove, { passive: false });
  magazineGrid.addEventListener("touchend", stopMagazineTouch, { passive: true });
  magazineGrid.addEventListener("touchcancel", stopMagazineTouch, { passive: true });
  magazineBlock.addEventListener("pointerdown", handleMagazineBarPointerDown);
  magazineBlock.addEventListener("pointermove", handleMagazineBarPointerMove);
  magazineBlock.addEventListener("pointerup", handleMagazineBarPointerUp);
  magazineBlock.addEventListener("pointercancel", handleMagazineBarPointerUp);
  window.addEventListener("resize", scheduleMagazineSliderBar);
  magazineSliderQuery.addEventListener?.("change", updateMagazineSliderBar);
  updateMagazineSliderBar();
}

document.querySelectorAll(".footer-toggle").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const group = toggle.closest(".footer-group");
    if (!group || window.matchMedia("(min-width: 761px)").matches) return;
    group.classList.toggle("is-open");
  });
});

document.querySelector(".to-top")?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelector(".newsletter form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = event.currentTarget.querySelector("input");
  if (input) input.value = "";
});

const initTrendProductSheet = () => {
  const productPanel = document.getElementById("trend-product-sheet");
  const trendRail = document.getElementById("trend-rail");
  const reviewRail = document.getElementById("review-rail");
  if (!productPanel) return;

  const productCard = productPanel.querySelector(".realtrend-product-card");
  const closeButton = productPanel.querySelector(".realtrend-product-sheet-close");
  const qtyEl = productPanel.querySelector("#trend-product-qty");
  const productSelect = productCard?.querySelector(".realtrend-select-native");
  const productNameEl = productCard?.querySelector(".realtrend-product-name");
  const cartToast =
    document.getElementById("trend-cart-toast") || document.getElementById("product-detail-cart-toast");
  const cartToastMessage =
    document.getElementById("trend-cart-toast-message") ||
    document.getElementById("product-detail-cart-toast-message");
  const cartToastClose = cartToast?.querySelector(".realtrend-cart-toast-close");
  const cartToastRing = cartToast?.querySelector(".realtrend-cart-toast-ring circle");
  const CART_TOAST_RING_MS = 5000;
  const selectRebuilders = [];
  let selectClickLock = false;
  let cartToastTimer = null;

  const preventTrendSheetBackdropScroll = (event) => {
    if (!document.body.classList.contains("is-trend-product-sheet-open")) return;
    if (event.target.closest(".realtrend-product-card")) return;
    event.preventDefault();
  };

  const slugifyBrand = (brand) =>
    brand
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const getProductInfoFromSource = (source) => {
    if (!source) return { brand: "", name: "", rawPrice: "", originalPrice: "" };

    if (source.classList.contains("listing-card")) {
      return {
        brand: source.querySelector(".listing-card-brand")?.textContent?.trim() || "",
        name: source.querySelector(".listing-card-title")?.textContent?.trim() || "",
        rawPrice: source.querySelector(".listing-card-price strong")?.textContent?.trim() || "",
        originalPrice: source.querySelector(".listing-card-price del")?.textContent?.trim() || "",
      };
    }

    if (source.classList.contains("reel-card")) {
      return {
        brand: source.querySelector(".reel-product p b")?.textContent?.trim() || "",
        name: source.querySelector(".reel-product p span")?.textContent?.trim() || "",
        rawPrice: source.querySelector(".reel-price")?.textContent?.trim() || "",
      };
    }

    if (source.classList.contains("review-card")) {
      const footerText = source.querySelector("footer p")?.innerText?.trim() || "";
      const [brandLine, ...nameParts] = footerText.split("\n");
      return {
        brand: brandLine?.trim() || "",
        name: nameParts.join(" ").trim() || brandLine?.trim() || "",
        rawPrice: "",
      };
    }

    if (source.classList.contains("product-card")) {
      return {
        brand: source.querySelector(":scope > p")?.textContent?.trim() || "",
        name: source.querySelector("h3")?.textContent?.trim() || "",
        rawPrice: source.querySelector(".sale-price")?.textContent?.trim() || "",
      };
    }

    if (source.classList.contains("product-rec-card")) {
      return {
        brand: source.querySelector(":scope > p")?.textContent?.trim() || "",
        name: source.querySelector("h3")?.textContent?.trim() || "",
        rawPrice: source.querySelector(":scope > strong")?.textContent?.trim() || "",
        originalPrice: "",
      };
    }

    return { brand: "", name: "", rawPrice: "", originalPrice: "" };
  };

  const replaySheetAnimation = () => {
    if (!productCard) return;
    productCard.style.animation = "none";
    void productCard.offsetHeight;
    productCard.style.animation = "";
  };

  const getCartToastProductName = () => {
    const selectedOption = productSelect?.selectedOptions?.[0]?.textContent?.trim();
    if (selectedOption) return selectedOption;
    return productNameEl?.textContent?.trim() || "This product";
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

  const showCartToast = () => {
    if (!cartToast || !cartToastMessage) return;

    window.clearTimeout(cartToastTimer);
    cartToastTimer = null;
    cartToast.classList.remove("is-visible", "is-leaving");
    cartToastRing?.classList.remove("is-animating");
    void cartToastRing?.getBoundingClientRect();
    cartToastMessage.innerHTML = `<span class="realtrend-cart-toast-product">${getCartToastProductName()}</span> has been added to your cart.`;
    cartToast.hidden = false;
    cartToast.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      cartToast.classList.add("is-visible");
      cartToastRing?.classList.add("is-animating");
    });
    cartToastTimer = window.setTimeout(hideCartToast, CART_TOAST_RING_MS);
  };

  const closeTrendProductSheet = ({ keepCartToast = false } = {}) => {
    if (!document.body.classList.contains("is-trend-product-sheet-open")) return;
    if (!keepCartToast) hideCartToast();
    productPanel.querySelectorAll(".realtrend-select-wrap.is-open").forEach((wrap) => {
      wrap.classList.remove("is-open");
      wrap.querySelector(".realtrend-select-trigger")?.setAttribute("aria-expanded", "false");
      wrap.querySelector(".realtrend-select-menu")?.classList.remove("is-open");
    });
    productCard?.classList.remove("is-select-open");
    productPanel.classList.remove("is-select-open");
    document.body.classList.remove("is-trend-product-sheet-open");
    productPanel.hidden = true;
    productPanel.setAttribute("aria-hidden", "true");
  };

  const openTrendProductSheet = (source) => {
    if (!productCard || !source) return;

    const { brand, name, rawPrice, originalPrice = "" } = getProductInfoFromSource(source);
    const brandPathPrefix =
      document.body.classList.contains("listing-page") ||
      document.body.classList.contains("timedeal-page") ||
      document.body.classList.contains("product-detail-page")
        ? "../"
        : "";

    const brandEl = productCard.querySelector(".realtrend-brand");
    const nameEl = productCard.querySelector(".realtrend-product-name");
    const priceStrong = productCard.querySelector(".realtrend-price strong");
    const priceDel = productCard.querySelector(".realtrend-price del");
    const priceMark = productCard.querySelector(".realtrend-price mark");
    const select = productCard.querySelector(".realtrend-select-native");
    const selectValue = productCard.querySelector(".realtrend-select-value");
    const wishBtn = productCard.querySelector(".realtrend-wish");

    if (brandEl) {
      brandEl.textContent = brand;
      if (brandEl instanceof HTMLAnchorElement) {
        brandEl.href = `${brandPathPrefix}brand/${slugifyBrand(brand)}.html`;
      }
    }

    if (nameEl) nameEl.textContent = name;

    const saleText = rawPrice.startsWith("$") ? `US${rawPrice}` : rawPrice || "US$22.00";
    const sale = Number.parseFloat(saleText.replace(/[^\d.]/g, "") || "22");

    if (priceStrong) priceStrong.textContent = saleText;

    if (originalPrice) {
      if (priceDel) priceDel.textContent = originalPrice;
      const original = Number.parseFloat(originalPrice.replace(/[^\d.]/g, "") || "0");
      if (priceMark && original > sale) {
        priceMark.textContent = `${Math.round((1 - sale / original) * 100)}% OFF`;
      }
    } else {
      const original = Math.round((sale / 0.7) * 100) / 100;
      if (priceDel) priceDel.textContent = `US$${original.toFixed(2)}`;
      if (priceMark && original > sale) {
        priceMark.textContent = `${Math.round((1 - sale / original) * 100)}% OFF`;
      }
    }

    if (select && name) {
      if (select.options[0]) select.options[0].textContent = `${name} 50ml`;
      if (select.options[1]) select.options[1].textContent = `${name} 100ml`;
      select.selectedIndex = 0;
      if (selectValue) selectValue.textContent = select.options[0]?.textContent || "";
      selectRebuilders.forEach((rebuild) => rebuild());
    }

    if (qtyEl) qtyEl.textContent = "1";
    wishBtn?.classList.remove("is-active");
    wishBtn?.setAttribute("aria-pressed", "false");
    wishBtn?.setAttribute("aria-label", "Add to wishlist");

    productPanel.hidden = false;
    productPanel.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-trend-product-sheet-open");
    replaySheetAnimation();
  };

  const initTrendProductSelect = (wrap) => {
    const select = wrap.querySelector(".realtrend-select-native");
    const trigger = wrap.querySelector(".realtrend-select-trigger");
    const valueEl = wrap.querySelector(".realtrend-select-value");
    const menu = wrap.querySelector(".realtrend-select-menu");
    if (!select || !trigger || !valueEl || !menu) return;

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
      productPanel.querySelectorAll(".realtrend-select-wrap.is-open").forEach((otherWrap) => {
        if (otherWrap === wrap) return;
        otherWrap.classList.remove("is-open");
        otherWrap.querySelector(".realtrend-select-trigger")?.setAttribute("aria-expanded", "false");
        otherWrap.querySelector(".realtrend-select-menu")?.classList.remove("is-open");
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
      closeMenu();
    };

    buildMenu();
    selectRebuilders.push(buildMenu);

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (wrap.classList.contains("is-open")) closeMenu();
      else openMenu();
    });

    menu.addEventListener("pointerdown", (event) => event.stopPropagation());

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

    document.addEventListener("click", (event) => {
      if (!wrap.classList.contains("is-open")) return;
      if (wrap.contains(event.target)) return;
      closeMenu();
    });
  };

  productPanel.querySelectorAll(".realtrend-select-wrap").forEach(initTrendProductSelect);

  productCard?.querySelectorAll(".realtrend-qty button").forEach((button) => {
    button.addEventListener("click", () => {
      if (!qtyEl) return;
      const delta = Number(button.dataset.qty || 0);
      const next = Math.max(1, Number(qtyEl.textContent || 1) + delta);
      qtyEl.textContent = String(next);
    });
  });

  productCard?.querySelector(".realtrend-wish")?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    const isActive = button.classList.toggle("is-active");
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
    button.setAttribute("aria-label", isActive ? "Remove from wishlist" : "Add to wishlist");
  });

  productCard?.querySelector(".realtrend-add-cart")?.addEventListener("click", (event) => {
    if (selectClickLock) {
      event.preventDefault();
      return;
    }
    if (productCard.classList.contains("is-select-open")) {
      event.preventDefault();
      return;
    }
    showCartToast();
    closeTrendProductSheet({ keepCartToast: true });
  });

  cartToastClose?.addEventListener("click", hideCartToast);

  trendRail?.addEventListener(
    "pointerdown",
    (event) => {
      if (event.target.closest(".reel-product em")) event.stopPropagation();
    },
    true,
  );

  trendRail?.addEventListener("click", (event) => {
    const cartButton = event.target.closest(".reel-product em");
    if (!cartButton || !trendRail.contains(cartButton)) return;
    event.preventDefault();
    event.stopPropagation();
    openTrendProductSheet(cartButton.closest(".reel-card"));
  });

  reviewRail?.addEventListener("click", (event) => {
    const reviewCartButton = event.target.closest(".review-card footer .review-cart-button");
    if (!reviewCartButton || !reviewRail.contains(reviewCartButton)) return;
    event.preventDefault();
    event.stopPropagation();
    openTrendProductSheet(reviewCartButton.closest(".review-card"));
  });

  sellerRail?.addEventListener(
    "pointerdown",
    (event) => {
      if (event.target.closest('.card-actions button[aria-label="Add to cart"]')) event.stopPropagation();
    },
    true,
  );

  sellerRail?.addEventListener("click", (event) => {
    const cartButton = event.target.closest('.card-actions button[aria-label="Add to cart"]');
    if (!cartButton || !sellerRail.contains(cartButton)) return;
    event.preventDefault();
    event.stopPropagation();
    openTrendProductSheet(cartButton.closest(".product-card"));
  });

  const listingGrid = document.querySelector(".listing-grid");

  listingGrid?.addEventListener("click", (event) => {
    const cartButton =
      event.target.closest('.listing-card-actions--desktop button[aria-label="Add to cart"]') ||
      event.target.closest(".listing-card-cart");
    if (!cartButton) return;

    const card = cartButton.closest(".listing-card");
    if (!card || !listingGrid.contains(card)) return;

    event.preventDefault();
    event.stopPropagation();
    openTrendProductSheet(card);
  });

  const recommendationList = document.querySelector(".product-recommendation-list");

  recommendationList?.addEventListener("click", (event) => {
    const cartButton = event.target.closest(".product-rec-card button");
    if (!cartButton || !recommendationList.contains(cartButton)) return;

    event.preventDefault();
    event.stopPropagation();
    openTrendProductSheet(cartButton.closest(".product-rec-card"));
  });

  closeButton?.addEventListener("click", closeTrendProductSheet);

  productPanel.addEventListener("click", (event) => {
    if (event.target.closest(".realtrend-product-card")) return;
    closeTrendProductSheet();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTrendProductSheet();
  });

  document.addEventListener("touchmove", preventTrendSheetBackdropScroll, { passive: false });
};

initTrendProductSheet();

const initProductDetailCardLinks = () => {
  document.querySelectorAll(".listing-grid, .seller-rail").forEach((container) => {
    container.addEventListener("click", (event) => {
      if (event.defaultPrevented) return;
      if (event.target.closest("a, button, input, select, textarea, label")) return;

      const card = event.target.closest(".listing-card, .product-card");
      if (!card || !container.contains(card)) return;

      navigateWithPageTransition(PRODUCT_DETAIL_URL);
    });
  });
};

initProductDetailCardLinks();
