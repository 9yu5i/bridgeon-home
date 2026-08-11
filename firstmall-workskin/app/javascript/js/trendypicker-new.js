(() => {
  const page = document.body;
  if (!page || !page.classList.contains("is-new-arrivals-page")) return;

  const sectionsRoot = document.querySelector("[data-new-brand-sections]");
  const sourceDisplay = document.querySelector("#searchedItemDisplay");
  if (!sectionsRoot || !sourceDisplay) return;

  const revealRoot = document.documentElement;
  const BANNER_TONES = [
    "green",
    "pink",
    "lavender",
    "blue",
    "mint",
    "aqua",
    "cream",
    "skin",
  ];

  const revealQuery = [
    ".bo-new-hero.new-reveal-hero",
    ".bo-new-brand-section.new-reveal-section",
  ].join(",");

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function readBrandFromCard(item) {
    const link =
      item.querySelector("a.listing-card-brand[href*='code=']") ||
      item.querySelector("a[href*='/goods/brand'][href*='code=']");
    if (link) {
      try {
        const href = new URL(link.getAttribute("href"), window.location.origin);
        const code = href.searchParams.get("code") || "";
        const name = (link.textContent || "").replace(/\s+/g, " ").trim();
        if (code && name) {
          return {
            code,
            name,
            href: `/goods/brand?code=${encodeURIComponent(code)}`,
          };
        }
      } catch (_err) {}
    }

    const nameNode = item.querySelector(".brand_name, .listing-card-brand");
    const name = ((nameNode && nameNode.textContent) || "")
      .replace(/\s+/g, " ")
      .trim();
    if (!name) return null;
    return {
      code: `name:${name.toLowerCase()}`,
      name,
      href: "/goods/brand_main",
    };
  }

  function collectProductItems() {
    const lists = sourceDisplay.querySelectorAll(":scope > ul, :scope > ol");
    const roots = lists.length ? lists : [sourceDisplay];
    const items = [];
    roots.forEach((root) => {
      Array.prototype.forEach.call(root.children, (item) => {
        if (item.tagName !== "LI") return;
        if (item.closest(".paging_navigation")) return;
        if (
          !item.querySelector(
            ".listing-card, .goods_list_style1, a[href*='/goods/view']"
          )
        ) {
          return;
        }
        items.push(item);
      });
    });
    return items;
  }

  function buildSection(brand, items, brandIndex) {
    const tone = BANNER_TONES[brandIndex % BANNER_TONES.length];
    const section = document.createElement("section");
    section.className = "bo-new-brand-section new-reveal-section";
    section.setAttribute("data-bo-new-brand", brand.code);
    section.setAttribute("aria-labelledby", `bo-new-brand-${brandIndex}`);
    section.style.setProperty("--reveal-section-index", String(brandIndex));

    const banner = document.createElement("a");
    banner.className = `bo-new-brand-banner bo-new-brand-banner--${tone} scroll-reveal-soft new-reveal-banner`;
    banner.href = brand.href;
    if (brand.code.indexOf("name:") !== 0) {
      banner.setAttribute("data-brand-code", brand.code);
    }
    banner.setAttribute("aria-label", `View ${brand.name} brand page`);
    banner.innerHTML = `
      <div class="bo-new-brand-banner-copy">
        <span class="bo-new-brand-banner-label">NEW FROM</span>
        <strong class="bo-new-brand-banner-name" id="bo-new-brand-${brandIndex}">${escapeHtml(brand.name)}</strong>
        <p class="bo-new-brand-banner-text">Discover the latest arrivals from ${escapeHtml(brand.name)}.</p>
      </div>
      <span class="bo-new-brand-banner-cta">SHOP BRAND &gt;</span>
    `;

    const products = document.createElement("div");
    products.className = "bo-new-brand-products";

    const label = document.createElement("p");
    label.className = "bo-new-brand-products-label scroll-reveal-line";
    label.textContent = "NEW ARRIVALS";

    const grid = document.createElement("ul");
    grid.className = "bo-new-brand-grid scroll-reveal-stagger new-reveal-grid";
    grid.setAttribute("aria-label", `${brand.name} new arrivals`);

    items.forEach((item, index) => {
      item.classList.add("scroll-reveal-item", "new-reveal-card");
      item.style.setProperty("--reveal-index", String(index));
      item.style.setProperty("--reveal-stagger", "0.07s");
      grid.appendChild(item);
    });

    products.append(label, grid);
    section.append(banner, products);
    return section;
  }

  function hydrateBannerImage(banner) {
    const code = banner.getAttribute("data-brand-code");
    if (!code) return Promise.resolve();

    return fetch(`/goods/brand?code=${encodeURIComponent(code)}`, {
      credentials: "same-origin",
    })
      .then((response) => (response.ok ? response.text() : ""))
      .then((html) => {
        if (!html) return;
        const doc = new DOMParser().parseFromString(html, "text/html");
        const img =
          doc.querySelector(".brand_top_area img.banner") ||
          doc.querySelector("img.banner");
        let src = "";
        if (img) src = img.getAttribute("src") || img.src || "";
        if (!src) {
          const media = doc.querySelector("[data-brand-hero-media]");
          const style = (media && media.getAttribute("style")) || "";
          const match = style.match(/url\(["']?([^"')]+)["']?\)/);
          if (match) src = match[1];
        }
        if (!src) return;
        banner.style.setProperty(
          "--bo-new-banner-image",
          `url("${String(src).replace(/"/g, '\\"')}")`
        );
        banner.classList.add("has-banner");
      })
      .catch(() => {});
  }

  function revealElement(element) {
    if (!element || element.classList.contains("is-inview")) return;
    element.classList.add("is-inview");
    element
      .querySelectorAll(
        ".scroll-reveal-soft, .scroll-reveal-stagger, .scroll-reveal-line"
      )
      .forEach((child) => child.classList.add("is-inview"));
  }

  function initScrollReveal() {
    const hero = document.querySelector(".bo-new-hero");
    hero?.classList.add("new-reveal-hero");

    const targets = Array.from(document.querySelectorAll(revealQuery));
    if (hero && !targets.includes(hero)) targets.unshift(hero);

    if (!targets.length) {
      revealRoot.classList.remove("new-scroll-reveal-pending");
      return;
    }

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      targets.forEach(revealElement);
      revealRoot.classList.remove("new-scroll-reveal-pending");
      return;
    }

    window.requestAnimationFrame(() => {
      revealRoot.classList.remove("new-scroll-reveal-pending");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealElement(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.14 }
    );

    targets.forEach((target) => observer.observe(target));
  }

  function ensurePagingHost() {
    let host = document.querySelector("[data-new-paging]");
    if (host) return host;
    host = document.createElement("div");
    host.className = "bo-new-paging";
    host.setAttribute("data-new-paging", "");
    sectionsRoot.insertAdjacentElement("afterend", host);
    return host;
  }

  function relocatePaging() {
    const host = ensurePagingHost();
    const paging =
      sourceDisplay.querySelector(".paging_navigation") ||
      host.querySelector(".paging_navigation");
    if (!paging) {
      host.replaceChildren();
      return;
    }
    host.replaceChildren(paging);
  }

  function renderEmpty(message) {
    sectionsRoot.innerHTML = `<p class="bo-new-empty">${escapeHtml(message)}</p>`;
    const host = document.querySelector("[data-new-paging]");
    if (host) host.replaceChildren();
    revealRoot.classList.remove("new-scroll-reveal-pending");
  }

  function regroupFromSource() {
    const items = collectProductItems();
    if (!items.length) {
      if (!sectionsRoot.children.length) {
        renderEmpty("No new arrivals found.");
      }
      return false;
    }

    const groups = new Map();
    items.forEach((item) => {
      const brand = readBrandFromCard(item) || {
        code: "unknown",
        name: "New Arrivals",
        href: "/goods/brand_main",
      };
      if (!groups.has(brand.code)) {
        groups.set(brand.code, { brand, items: [] });
      }
      groups.get(brand.code).items.push(item);
    });

    revealRoot.classList.add("new-scroll-reveal-pending");
    sectionsRoot.replaceChildren(
      ...Array.from(groups.values()).map((group, index) =>
        buildSection(group.brand, group.items, index)
      )
    );
    relocatePaging();

    const banners = Array.from(
      sectionsRoot.querySelectorAll(".bo-new-brand-banner[data-brand-code]")
    );
    Promise.all(banners.map(hydrateBannerImage)).finally(() => {
      initScrollReveal();
    });
    return true;
  }

  function ensurePerPage() {
    const $per = $("form#goodsSearchForm select[name='per']");
    if (!$per.length) return;
    if (!$per.find("option[value='40']").length) {
      $per.append('<option value="40">40</option>');
    }
    if (String($per.val()) === "40") return;
    $per.val("40").trigger("change");
  }

  let regroupTimer = null;
  function scheduleRegroup() {
    window.clearTimeout(regroupTimer);
    regroupTimer = window.setTimeout(() => {
      if (!collectProductItems().length) return;
      regroupFromSource();
    }, 80);
  }

  sourceDisplay.classList.add("bo-new-source-grid");
  sourceDisplay.setAttribute("aria-hidden", "true");

  if (window.jQuery) {
    const $ = window.jQuery;
    $(function () {
      ensurePerPage();
      scheduleRegroup();
    });
    $(document).on("ajaxComplete", function (_event, _xhr, settings) {
      const url = (settings && settings.url) || "";
      if (!/search_list|goods\/search/i.test(String(url))) return;
      scheduleRegroup();
    });
  } else {
    scheduleRegroup();
  }

  const bootObserver = new MutationObserver(() => scheduleRegroup());
  bootObserver.observe(sourceDisplay, { childList: true, subtree: true });
  window.setTimeout(() => bootObserver.disconnect(), 8000);
})();
