(() => {
  const navigateWithPageTransition = window.BridgeOn?.navigateWithPageTransition || ((href) => {
    window.location.href = href;
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
const mobileSearchOpenButtons = document.querySelectorAll("[data-mobile-search-open]");
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
const compactHeaderSearchQuery = window.matchMedia("(max-width: 1120px)");
const compactHeaderSearchPage = document.body.matches(
  ".listing-page, .timedeal-page, .product-detail-page, .cart-page, .editors-page, .realtrend-page"
);
const headerAccountButtons = Array.from(
  document.querySelectorAll('.header-main .header-actions .icon-button[aria-label="Account"]')
);
let categoryMenuTimer = null;
let mobileCurrentThirdKey = "";
let mobileCategoryScrollFrame = null;
let mobileActiveCategoryIndex = -1;

const getListingPagePrefix = () => {
  if (document.body.classList.contains("timedeal-page")) return "../listing/";
  if (document.body.classList.contains("product-detail-page")) return "../listing/";
  if (document.body.classList.contains("cart-page")) return "../listing/";
  if (document.body.classList.contains("editors-page")) return "../listing/";
  if (document.body.classList.contains("my-page")) return "../listing/";
  if (document.body.classList.contains("listing-page")) return "./";
  return "listing/";
};

const getRealtrendUrl = () => {
  if (document.body.classList.contains("realtrend-page")) return "./realtrend.html";
  if (
    document.body.classList.contains("listing-page") ||
    document.body.classList.contains("timedeal-page") ||
    document.body.classList.contains("product-detail-page") ||
    document.body.classList.contains("cart-page") ||
    document.body.classList.contains("editors-page") ||
    document.body.classList.contains("my-page")
  ) {
    return "../realtrend/realtrend.html";
  }
  return "realtrend/realtrend.html";
};

const getEditorsPickUrl = () => {
  if (document.body.classList.contains("editors-page")) return "./editors-pick.html";
  if (
    document.body.classList.contains("listing-page") ||
    document.body.classList.contains("timedeal-page") ||
    document.body.classList.contains("product-detail-page") ||
    document.body.classList.contains("cart-page") ||
    document.body.classList.contains("realtrend-page") ||
    document.body.classList.contains("my-page")
  ) {
    return "../editors-pick/editors-pick.html";
  }
  return "editors-pick/editors-pick.html";
};

const getMyPageUrl = () => {
  if (document.body.classList.contains("my-page")) return "./my-page.html";
  if (
    document.body.classList.contains("listing-page") ||
    document.body.classList.contains("timedeal-page") ||
    document.body.classList.contains("product-detail-page") ||
    document.body.classList.contains("cart-page") ||
    document.body.classList.contains("editors-page") ||
    document.body.classList.contains("realtrend-page")
  ) {
    return "../my-page/my-page.html";
  }
  return "my-page/my-page.html";
};

const getHomeUrl = () => {
  if (
    document.body.classList.contains("listing-page") ||
    document.body.classList.contains("timedeal-page") ||
    document.body.classList.contains("product-detail-page") ||
    document.body.classList.contains("cart-page") ||
    document.body.classList.contains("editors-page") ||
    document.body.classList.contains("realtrend-page") ||
    document.body.classList.contains("my-page")
  ) {
    return "../index.html";
  }
  return "index.html";
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

document.querySelectorAll(".category-nav a[data-mega-target='tp-pick']").forEach((link) => {
  link.setAttribute("href", getEditorsPickUrl());
});

document.querySelectorAll(".category-mega[data-menu-panel='tp-pick'] .mega-column h3").forEach((heading) => {
  const headingLink = heading.querySelector("a");
  if (headingLink && headingLink.textContent.trim() === "Editor's Pick") {
    headingLink.setAttribute("href", getEditorsPickUrl());
    return;
  }

  if (heading.textContent.trim() !== "Editor's Pick") return;
  heading.setAttribute("role", "link");
  heading.setAttribute("tabindex", "0");
  heading.addEventListener("click", () => {
    navigateWithPageTransition(getEditorsPickUrl());
  });
  heading.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    navigateWithPageTransition(getEditorsPickUrl());
  });
});

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
    { label: "Editor's Pick", href: getEditorsPickUrl() },
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

const getCompactHeaderSearchSrc = (src) => {
  if (!src) return "../img/search/search.png";
  return src.replace("main-img/top_banner_my.png", "search/search.png");
};

const syncCompactHeaderSearchButtons = () => {
  if (!compactHeaderSearchPage) return;
  const isCompact = compactHeaderSearchQuery.matches;

  headerAccountButtons.forEach((button) => {
    const img = button.querySelector("img");

    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = button.getAttribute("aria-label") || "";
      button.dataset.originalType = button.getAttribute("type") || "";
    }

    if (img && !img.dataset.originalSrc) {
      img.dataset.originalSrc = img.getAttribute("src") || "";
      img.dataset.originalAlt = img.getAttribute("alt") || "";
      img.dataset.originalAriaHidden = img.getAttribute("aria-hidden") || "";
    }

    button.classList.toggle("is-header-search-trigger", isCompact);

    if (isCompact) {
      button.setAttribute("type", "button");
      button.setAttribute("aria-label", "Open search");
      if (img) {
        img.setAttribute("src", getCompactHeaderSearchSrc(img.dataset.originalSrc));
        img.setAttribute("alt", "");
        img.setAttribute("aria-hidden", "true");
      }
      return;
    }

    if (button.dataset.originalType) {
      button.setAttribute("type", button.dataset.originalType);
    } else {
      button.removeAttribute("type");
    }
    button.setAttribute("aria-label", button.dataset.originalLabel || "Account");

    if (img) {
      img.setAttribute("src", img.dataset.originalSrc || img.getAttribute("src") || "");
      img.setAttribute("alt", img.dataset.originalAlt || "");
      if (img.dataset.originalAriaHidden) {
        img.setAttribute("aria-hidden", img.dataset.originalAriaHidden);
      } else {
        img.removeAttribute("aria-hidden");
      }
    }
  });
};

if (compactHeaderSearchPage) {
  headerAccountButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      if (!compactHeaderSearchQuery.matches) return;
      event.preventDefault();
      closeMobileMenu();
      openSearchPanel({ focusMobile: true });
    });
  });

  syncCompactHeaderSearchButtons();
  if (compactHeaderSearchQuery.addEventListener) {
    compactHeaderSearchQuery.addEventListener("change", syncCompactHeaderSearchButtons);
  } else {
    compactHeaderSearchQuery.addListener(syncCompactHeaderSearchButtons);
  }
}

headerAccountButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    if (button.matches("a")) return;
    if (button.classList.contains("is-header-search-trigger") && compactHeaderSearchQuery.matches) return;
    event.preventDefault();
    navigateWithPageTransition(getMyPageUrl());
  });
});

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
  mobileMenuButtons.forEach((button) => {
    button.setAttribute("aria-expanded", "true");
  });
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
  mobileMenuButtons.forEach((button) => {
    button.setAttribute("aria-expanded", "false");
  });
};

mobileSearchOpenButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    closeMobileMenu();
    openSearchPanel({ focusMobile: true });
  });
});

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

document.querySelectorAll("[data-bottom-search-open]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    closeMobileMenu();
    openSearchPanel({ focusMobile: true });
  });
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
})();
