(() => {
  const normalizeTabKey = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/^#/, "")
      .replace(/\s+/g, "-");

  const getTabKey = (button) => {
    if (button.dataset.tab) return normalizeTabKey(button.dataset.tab);
    return normalizeTabKey(button.textContent);
  };

  const navigateWithPageTransition =
    window.BridgeOn?.navigateWithPageTransition || ((href) => {
      window.location.href = href;
    });

  const getBestListingUrl = (category = "all") => {
    const fromBridgeOn = window.BridgeOn?.getBestListingUrl?.();
    let base = fromBridgeOn;
    if (!base) {
      if (document.body.classList.contains("listing-page")) base = "./best.html";
      else if (
        document.body.classList.contains("timedeal-page") ||
        document.body.classList.contains("product-detail-page") ||
        document.body.classList.contains("cart-page") ||
        document.body.classList.contains("editors-page") ||
        document.body.classList.contains("realtrend-page") ||
        document.body.classList.contains("my-page") ||
        document.body.classList.contains("brand-page")
      ) {
        base = "../listing/best.html";
      } else {
        base = "listing/best.html";
      }
    }

    const url = new URL(base, window.location.href);
    if (category && category !== "all") {
      url.searchParams.set("category", category);
    } else {
      url.searchParams.delete("category");
    }
    return url.href;
  };

  const applyRailFilter = (rail, tabKey) => {
    if (!rail) return;

    const cards = Array.from(rail.children).filter(
      (child) => !child.classList.contains("is-loop-clone")
    );

    cards.forEach((card) => {
      const category = normalizeTabKey(card.dataset.category || "all");
      const isVisible = tabKey === "all" || category === tabKey;
      card.classList.toggle("is-tab-hidden", !isVisible);
      card.hidden = !isVisible;
      card.setAttribute("aria-hidden", isVisible ? "false" : "true");
    });

    rail.dispatchEvent(
      new CustomEvent("bridgeon:railfilterchange", {
        bubbles: true,
        detail: { tab: tabKey },
      })
    );
  };

  const initTrendTabs = (group) => {
    const section = group.closest("section");
    const rail = section?.querySelector(".trend-rail") || section?.querySelector(".card-rail");
    const buttons = Array.from(group.querySelectorAll("button"));
    if (!buttons.length) return;

    const setActive = (activeButton) => {
      const tabKey = getTabKey(activeButton);

      buttons.forEach((button) => {
        const isActive = button === activeButton;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", isActive ? "true" : "false");
        button.tabIndex = isActive ? 0 : -1;
      });

      applyRailFilter(rail, tabKey);
      activeButton.scrollIntoView({
        behavior: "smooth",
        inline: "nearest",
        block: "nearest",
      });
    };

    group.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button || !group.contains(button)) return;
      setActive(button);
    });

    group.addEventListener("keydown", (event) => {
      const current = event.target.closest("button");
      if (!current || !group.contains(current)) return;

      const index = buttons.indexOf(current);
      if (index < 0) return;

      let nextIndex = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (index + 1) % buttons.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (index - 1 + buttons.length) % buttons.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = buttons.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      buttons[nextIndex].focus();
      setActive(buttons[nextIndex]);
    });

    const initial = buttons.find((button) => button.classList.contains("is-active")) || buttons[0];
    setActive(initial);
  };

  const initSellerTabs = (group) => {
    const buttons = Array.from(group.querySelectorAll("button"));
    if (!buttons.length) return;

    const openBestRanking = (button) => {
      const tabKey = getTabKey(button);
      navigateWithPageTransition(getBestListingUrl(tabKey));
    };

    group.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button || !group.contains(button)) return;
      openBestRanking(button);
    });

    group.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const button = event.target.closest("button");
      if (!button || !group.contains(button)) return;
      event.preventDefault();
      openBestRanking(button);
    });
  };

  document.querySelectorAll(".trend-section .tab-row").forEach(initTrendTabs);
  document.querySelectorAll(".seller-heading .tag-tabs").forEach(initSellerTabs);

  document.querySelectorAll(".seller-section .section-heading > a, .seller-section .view-button").forEach((link) => {
    link.setAttribute("href", getBestListingUrl("all"));
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigateWithPageTransition(getBestListingUrl("all"));
    });
  });
})();
