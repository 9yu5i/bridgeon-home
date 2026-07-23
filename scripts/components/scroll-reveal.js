(() => {
  const revealRoot = document.documentElement;

  const activateRevealSection = (section) => {
    if (!section || section.classList.contains("is-inview")) return;
    section.classList.add("is-inview");
    section.querySelectorAll(
      ".scroll-reveal-soft, .scroll-reveal-stagger, .scroll-reveal-line, .scroll-reveal-split-left, .scroll-reveal-split-right",
    ).forEach((el) => el.classList.add("is-inview"));
  };

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
    if (!section) return;
    section.classList.add("scroll-reveal-rail");
    addLineReveal(section);
    addStaggerItems(section.querySelector(".card-rail"), cardSelector, 0.06);
    if (autoPlayOnLoad) window.setTimeout(() => activateRevealSection(section), 420);
  };

  const clearPendingState = () => {
    revealRoot.classList.remove("scroll-reveal-pending");
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    clearPendingState();
    return;
  }

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
    addLineReveal(editorialSection);
    editorialSection.querySelectorAll(".editor-card").forEach((editorCard) => {
      editorCard.classList.add("scroll-reveal-soft");
    });
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
  clearPendingState();

  const revealSections = document.querySelectorAll(
    ".mobile-cats, .content-section:not(.trend-section), .share-pick, .newsletter",
  );

  if (!("IntersectionObserver" in window)) {
    revealSections.forEach((section) => activateRevealSection(section));
    return;
  }

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
})();
