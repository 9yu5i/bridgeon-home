(() => {
  const revealRoot = document.documentElement;
  const READY = "data-reveal-ready";
  const OBSERVED = "data-reveal-observed";

  let observer = null;
  let motionChecked = false;
  let reducedMotion = false;

  const isReady = (el) => el.hasAttribute(READY);
  const markReady = (el) => el.setAttribute(READY, "");

  const getObserver = () => {
    if (observer || !("IntersectionObserver" in window)) return observer;
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          // Two frames, same as the hero above. A section that is already on
          // screen when init() runs gets its hidden class and .is-inview in
          // the same paint, so the transition is skipped entirely — which is
          // what happens on any reload that restores the scroll position.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => activateRevealSection(entry.target));
          });
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    return observer;
  };

  const activateRevealSection = (section) => {
    if (!section || section.classList.contains("is-inview")) return;
    section.classList.add("is-inview");
    section.querySelectorAll(
      ".scroll-reveal-soft, .scroll-reveal-stagger, .scroll-reveal-line, .scroll-reveal-split-left, .scroll-reveal-split-right",
    ).forEach((el) => el.classList.add("is-inview"));
  };

  const addLineReveal = (root) => {
    root.querySelectorAll(
      ".section-heading h2, .inline-heading h2, .mobile-section-title, .editorial-section-title, .editor-card-title",
    ).forEach((heading) => heading.classList.add("scroll-reveal-line"));
  };

  const addStaggerItems = (container, selector, staggerStep = 0.08) => {
    if (!container || isReady(container)) return;
    markReady(container);
    container.classList.add("scroll-reveal-stagger");
    container.querySelectorAll(selector).forEach((item, index) => {
      item.classList.add("scroll-reveal-item");
      item.style.setProperty("--reveal-index", String(index));
      item.style.setProperty("--reveal-stagger", `${staggerStep}s`);
    });
  };

  const initRailSectionReveal = (section, { cardSelector, autoPlayOnLoad = false }) => {
    if (!section || isReady(section)) return;
    markReady(section);
    section.classList.add("scroll-reveal-rail");
    addLineReveal(section);
    addStaggerItems(section.querySelector(".card-rail"), cardSelector, 0.06);
    if (autoPlayOnLoad) window.setTimeout(() => activateRevealSection(section), 420);
  };

  function init() {
    if (!motionChecked) {
      motionChecked = true;
      reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    if (reducedMotion) {
      revealRoot.classList.remove("scroll-reveal-pending");
      return;
    }

    const hero = document.querySelector(".hero");
    if (hero && !isReady(hero)) {
      markReady(hero);
      hero.classList.add("scroll-reveal-hero");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => hero.classList.add("is-inview"));
      });
    }

    const mobileCats = document.querySelector(".mobile-cats");
    if (mobileCats && !isReady(mobileCats)) {
      markReady(mobileCats);
      mobileCats.classList.add("scroll-reveal-soft");
    }

    initRailSectionReveal(document.querySelector(".trend-section"), {
      cardSelector: ".reel-card",
    });

    initRailSectionReveal(document.querySelector(".seller-section"), {
      cardSelector: ".product-card",
    });

    const dealsSection = document.querySelector(".deals-section");
    if (dealsSection && !isReady(dealsSection)) {
      markReady(dealsSection);
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
        dealGrid.querySelectorAll(".deal-pick-card, .deal-time-compact").forEach((item, index) => {
          item.classList.add("scroll-reveal-item");
          item.style.setProperty("--reveal-index", String(index));
          item.style.setProperty("--reveal-stagger", "0.1s");
        });
      }
    }

    const editorialSection = document.querySelector(".editorial-section");
    if (editorialSection && !isReady(editorialSection)) {
      markReady(editorialSection);
      addLineReveal(editorialSection);
      editorialSection.querySelector(".editor-card-carousel")?.classList.add("scroll-reveal-soft");
      editorialSection.querySelectorAll(".editor-card").forEach((c) => c.classList.add("scroll-reveal-soft"));
      editorialSection.querySelector(".magazine-block")?.classList.add("scroll-reveal-soft");
      addStaggerItems(editorialSection.querySelector(".magazine-grid"), ".magazine-card", 0.08);
    }

    const reviewsSection = document.querySelector(".reviews-section");
    if (reviewsSection && !isReady(reviewsSection)) {
      markReady(reviewsSection);
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

    // Main-page magazine block. It sits outside .editorial-section, so the
    // .magazine-block handling above never reaches it.
    const mainMagazine = document.querySelector(".tp-main-magazine");
    if (mainMagazine && !isReady(mainMagazine)) {
      markReady(mainMagazine);
      // Heading only: the cards live inside the board iframe and reveal one by
      // one from trendypicker-main-magazine.js, so fading the whole section as
      // a single block would hide that stagger behind one opacity change.
      mainMagazine.querySelector(".tp-main-magazine__head")?.classList.add("scroll-reveal-line");
    }

    document.querySelector(".share-pick")?.classList.add("scroll-reveal-soft");
    document.querySelector(".newsletter")?.classList.add("scroll-reveal-soft");
    revealRoot.classList.remove("scroll-reveal-pending");

    const obs = getObserver();
    const revealSections = document.querySelectorAll(
      ".mobile-cats, .content-section, .share-pick, .newsletter, .tp-main-magazine",
    );

    revealSections.forEach((section) => {
      if (section.hasAttribute(OBSERVED)) return;
      section.setAttribute(OBSERVED, "");
      if (obs) {
        obs.observe(section);
      } else {
        activateRevealSection(section);
      }
    });
  }

  window.initScrollReveal = init;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();