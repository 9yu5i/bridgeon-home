(() => {
  const navigateWithPageTransition =
    window.BridgeOn?.navigateWithPageTransition ||
    ((href) => {
      window.location.href = href;
    });
  const REALTREND_PAGE_URL = new URL(
    "../../realtrend/realtrend.html",
    document.currentScript?.src || window.location.href,
  ).href;

  const interactiveSelector = "a, button, input, select, textarea, label, .reel-product em";
  let pointerStart = null;

  const getTrendCardHref = (card) => {
    const explicitHref = card?.dataset.trendLink || card?.getAttribute("data-trend-link");
    if (explicitHref) return new URL(explicitHref, window.location.href).href;

    const url = new URL(REALTREND_PAGE_URL);
    const reelIndex = Number.parseInt(card?.dataset.reelIndex || "", 10);
    if (Number.isFinite(reelIndex) && reelIndex > 0) {
      url.searchParams.set("reel", String(reelIndex));
    }
    return url.href;
  };

  const syncTrendRailCards = () => {
    document.querySelectorAll(".trend-rail").forEach((rail) => {
      const originalCards = Array.from(rail.querySelectorAll(".reel-card:not(.is-loop-clone)"));
      const originalCount = Math.max(originalCards.length, 1);

      rail.querySelectorAll(".reel-card").forEach((card, index) => {
        const explicitIndex = Number.parseInt(card.getAttribute("data-reel-index") || "", 10);
        if (Number.isFinite(explicitIndex) && explicitIndex > 0) {
          card.dataset.reelIndex = String(explicitIndex);
        } else {
          const originalIndex = originalCards.indexOf(card);
          card.dataset.reelIndex = String(
            originalIndex >= 0 ? originalIndex + 1 : (index % originalCount) + 1,
          );
        }
        if (!card.hasAttribute("tabindex")) card.tabIndex = 0;
        card.setAttribute("role", "link");
        card.setAttribute("aria-label", `Open Real Trend reel ${card.dataset.reelIndex}`);
      });
    });
  };

  const getTrendCard = (target) => target?.closest?.(".trend-rail .reel-card");

  document.addEventListener(
    "pointerdown",
    (event) => {
      const card = getTrendCard(event.target);
      if (!card || event.target.closest(interactiveSelector)) {
        pointerStart = null;
        return;
      }

      pointerStart = {
        card,
        x: event.clientX,
        y: event.clientY,
      };
    },
    true,
  );

  document.addEventListener(
    "click",
    (event) => {
      const card = getTrendCard(event.target);
      if (!card || event.target.closest(interactiveSelector)) return;

      const pointerMoved =
        pointerStart?.card === card &&
        (Math.abs(event.clientX - pointerStart.x) > 8 || Math.abs(event.clientY - pointerStart.y) > 8);
      pointerStart = null;
      if (pointerMoved) return;

      event.preventDefault();
      event.stopPropagation();
      navigateWithPageTransition(getTrendCardHref(card));
    },
    true,
  );

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = getTrendCard(event.target);
    if (!card) return;

    event.preventDefault();
    navigateWithPageTransition(getTrendCardHref(card));
  });

  syncTrendRailCards();

  if (typeof MutationObserver === "function") {
    new MutationObserver(syncTrendRailCards).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
})();
