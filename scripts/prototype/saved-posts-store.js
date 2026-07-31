(() => {
  const SAVED_POSTS_STORAGE_KEY = "trendypicker-saved-posts";
  const SAVE_BUTTON_SELECTOR = '[data-social-toggle="save"]';
  const REALTREND_PAGE_URL = new URL(
    "../../realtrend/realtrend.html",
    document.currentScript?.src || window.location.href,
  ).href;
  const CATEGORY_LABELS = {
    beauty: "Beauty",
    "k-food": "K-Food",
    lifestyle: "Lifestyle",
    "k-pop": "K-pop",
    "k-traditional": "K-Traditional",
  };
  const CATEGORY_TONES = {
    beauty: "beauty",
    "k-food": "food",
    lifestyle: "life",
    "k-pop": "kpop",
    "k-traditional": "trad",
  };

  const normalizeText = (value, fallback = "") =>
    String(value || fallback).replace(/\s+/g, " ").trim();

  const normalizeCategory = (value) => {
    const category = normalizeText(value)
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return CATEGORY_LABELS[category] ? category : "beauty";
  };

  const createSavedPostId = ({ index, title }) => {
    if (index !== "" && index != null) return `reel-${index}`;
    return normalizeText(title).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "reel";
  };

  const normalizeSavedPost = (item = {}) => {
    const index = normalizeText(item.index);
    const title = normalizeText(item.title, "Real Trend reel");
    const category = normalizeCategory(item.category);
    const views = normalizeText(item.views, "0");
    const href =
      normalizeText(item.href) ||
      (() => {
        const url = new URL(REALTREND_PAGE_URL);
        url.searchParams.set("reel", String(Number(index || 0) + 1));
        return url.href;
      })();

    return {
      id: item.id || createSavedPostId({ index, title }),
      index,
      title,
      category,
      views,
      href,
    };
  };

  const readSavedPosts = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(SAVED_POSTS_STORAGE_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];

      const byId = new Map();
      parsed.map(normalizeSavedPost).forEach((item) => {
        if (item.id && !byId.has(item.id)) byId.set(item.id, item);
      });
      return [...byId.values()];
    } catch {
      return [];
    }
  };

  const writeSavedPosts = (items) => {
    localStorage.setItem(SAVED_POSTS_STORAGE_KEY, JSON.stringify(items.map(normalizeSavedPost)));
    window.dispatchEvent(
      new CustomEvent("trendypicker:savedpostschange", { detail: { items: readSavedPosts() } }),
    );
  };

  const getSlideFromButton = (button) => button?.closest(".realtrend-slide");

  const getPayloadFromSlide = (slide) => {
    if (!slide) return null;

    const index = slide.dataset.index ?? "";
    const mediaLabel = slide.querySelector("[data-reel-media]")?.getAttribute("aria-label") || "";
    const title = normalizeText(mediaLabel.replace(/\s+reel$/i, ""), "Real Trend reel");
    const views = slide.querySelector(`${SAVE_BUTTON_SELECTOR} span`)?.textContent || "0";
    const category = normalizeCategory(slide.dataset.category || "beauty");
    const hrefUrl = new URL(REALTREND_PAGE_URL);
    hrefUrl.searchParams.set("reel", String(Number(index || 0) + 1));

    return normalizeSavedPost({
      index,
      title,
      category,
      views,
      href: hrefUrl.href,
    });
  };

  const getPayloadFromButton = (button) => {
    const slide = getSlideFromButton(button);
    if (slide) return getPayloadFromSlide(slide);

    const card = button.closest(".saved-reel-card");
    if (!card) return null;

    return normalizeSavedPost({
      id: card.dataset.savedPostId,
      index: card.dataset.reelIndex,
      title: card.querySelector(".saved-reel-copy b")?.textContent,
      views: card.querySelector(".saved-reel-media em")?.textContent,
      category: card.dataset.accountCategory,
      href: card.querySelector("a")?.href,
    });
  };

  const setSaveButtonState = (button, isActive) => {
    const icon = button.querySelector("img");
    const defaultSrc = icon?.getAttribute("data-icon-default") || icon?.getAttribute("src") || "";
    const activeSrc = icon?.getAttribute("data-icon-active") || defaultSrc;

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
    button.setAttribute("aria-label", isActive ? "Remove saved reel" : "Save reel");
    if (icon && defaultSrc) icon.src = isActive ? activeSrc : defaultSrc;
  };

  const syncSaveButtons = (root = document) => {
    const scope = root && typeof root.querySelectorAll === "function" ? root : document;
    const activeIds = new Set(readSavedPosts().map((item) => item.id));

    scope.querySelectorAll(SAVE_BUTTON_SELECTOR).forEach((button) => {
      const item = getPayloadFromButton(button);
      if (!item?.id) return;
      setSaveButtonState(button, activeIds.has(item.id));
    });
  };

  const syncSavedReelsCount = (count = readSavedPosts().length) => {
    document.querySelectorAll(".mypage-reel-stats strong").forEach((node) => {
      node.textContent = String(count);
    });

    document.querySelectorAll(".saved-content .account-collection-head strong").forEach((node) => {
      node.textContent = `${count} reel${count === 1 ? "" : "s"}`;
    });
  };

  const applySavedPageFilter = (content) => {
    const activeFilter =
      content.querySelector(".account-collection-tabs button.is-active")?.dataset.accountFilter ||
      "all";

    content.querySelectorAll(".saved-reel-grid .saved-reel-card").forEach((card) => {
      card.hidden =
        activeFilter !== "all" &&
        normalizeCategory(card.dataset.accountCategory) !== normalizeCategory(activeFilter);
    });
  };

  const createSavedReelCard = (item) => {
    const tone = CATEGORY_TONES[item.category] || "beauty";
    const card = document.createElement("article");
    card.className = `saved-reel-card saved-reel-card--${tone}`;
    card.dataset.accountCategory = item.category;
    card.dataset.savedPostId = item.id;
    card.dataset.reelIndex = item.index;

    const link = document.createElement("a");
    link.href = item.href;
    link.setAttribute("aria-label", `Open saved reel ${item.title}`);

    const media = document.createElement("span");
    media.className = "saved-reel-media";
    const views = document.createElement("em");
    views.textContent = item.views;
    media.append(views);

    const copy = document.createElement("span");
    copy.className = "saved-reel-copy";
    const title = document.createElement("b");
    title.textContent = item.title;
    copy.append(title);

    link.append(media, copy);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", `Remove saved reel ${item.title}`);
    const removeIcon = document.createElement("img");
    removeIcon.src = "./img/saved_hover.png";
    removeIcon.alt = "";
    removeIcon.setAttribute("aria-hidden", "true");
    removeButton.append(removeIcon);

    card.append(link, removeButton);
    return card;
  };

  const renderSavedPostsPage = (root = document) => {
    const scope = root && typeof root.querySelectorAll === "function" ? root : document;
    const items = readSavedPosts();

    scope.querySelectorAll(".saved-content").forEach((content) => {
      const grid = content.querySelector(".saved-reel-grid");
      if (!grid) return;

      grid.replaceChildren(...items.map(createSavedReelCard));

      if (!items.length) {
        const empty = document.createElement("p");
        empty.className = "saved-posts-empty";
        empty.textContent = "No saved Real Trend posts yet.";
        grid.append(empty);
      }

      applySavedPageFilter(content);
    });

    syncSavedReelsCount(items.length);
  };

  window.TrendyPicker = window.TrendyPicker || {};
  window.TrendyPicker.savedPosts = {
    getItems: readSavedPosts,
    setItems: writeSavedPosts,
    isActive(item) {
      const normalized = normalizeSavedPost(item);
      return readSavedPosts().some((saved) => saved.id === normalized.id);
    },
    toggle(item) {
      const normalized = normalizeSavedPost(item);
      if (!normalized.id) return false;

      const items = readSavedPosts();
      const existingIndex = items.findIndex((saved) => saved.id === normalized.id);
      const isActive = existingIndex < 0;

      if (isActive) items.push(normalized);
      else items.splice(existingIndex, 1);

      writeSavedPosts(items);
      syncSaveButtons();
      renderSavedPostsPage();
      return isActive;
    },
    syncButtons: syncSaveButtons,
    syncPage: renderSavedPostsPage,
  };

  document.addEventListener(
    "click",
    (event) => {
      const saveButton = event.target.closest?.(SAVE_BUTTON_SELECTOR);
      if (saveButton) {
        const item = getPayloadFromButton(saveButton);
        if (!item?.id) return;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        window.TrendyPicker.savedPosts.toggle(item);
        return;
      }

      const removeButton = event.target.closest?.(".saved-reel-card > button");
      if (!removeButton) return;

      const card = removeButton.closest(".saved-reel-card");
      if (!card?.closest(".saved-content")) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const item = getPayloadFromButton(removeButton);
      if (item?.id && window.TrendyPicker.savedPosts.isActive(item)) {
        window.TrendyPicker.savedPosts.toggle(item);
      }
    },
    true,
  );

  window.addEventListener("storage", (event) => {
    if (event.key !== SAVED_POSTS_STORAGE_KEY) return;
    syncSaveButtons();
    renderSavedPostsPage();
  });

  window.addEventListener("trendypicker:savedpostschange", () => {
    syncSaveButtons();
    renderSavedPostsPage();
  });

  syncSaveButtons();
  renderSavedPostsPage();

  if (typeof MutationObserver === "function") {
    let syncFrame = 0;
    const scheduleSync = () => {
      window.cancelAnimationFrame(syncFrame);
      syncFrame = window.requestAnimationFrame(() => syncSaveButtons());
    };

    new MutationObserver(scheduleSync).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
})();
