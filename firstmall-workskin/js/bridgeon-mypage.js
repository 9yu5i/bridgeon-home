(() => {
  const hydrateCouponCount = async () => {
    const couponCount = document.querySelector('[data-account-stat="coupons"]');
    if (!couponCount || !window.fetch || !window.DOMParser) return;

    try {
      const response = await fetch("/mypage/coupon?tab=1", {
        credentials: "same-origin",
        headers: { Accept: "text/html" },
      });
      if (!response.ok) return;

      const html = await response.text();
      const page = new DOMParser().parseFromString(html, "text/html");
      const countElement = page.querySelector(
        '.tab_basic a[href*="/mypage/coupon?tab=1"] .pointcolor2',
      );
      const count = countElement?.textContent.match(/\d[\d,]*/)?.[0];
      if (count) couponCount.textContent = count;
    } catch {
      // Keep the server-rendered fallback when the coupon page cannot be loaded.
    }
  };

  hydrateCouponCount();

  const hydrateWishlistBrands = async () => {
    const brandElements = Array.from(document.querySelectorAll(".bo-product__brand")).filter(
      (element) => !element.textContent.trim(),
    );

    if (!brandElements.length || !window.fetch || !window.DOMParser) return;

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

      const request = fetch(url, { credentials: "same-origin" })
        .then((response) => (response.ok ? response.text() : ""))
        .then((html) => {
          if (!html) return "";

          const page = new DOMParser().parseFromString(html, "text/html");
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

  hydrateWishlistBrands();

  const newsletter = document.querySelector(".bo-newsletter.bo-scroll-reveal");
  if (!newsletter) return;

  const showNewsletter = () => newsletter.classList.add("is-inview");

  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("IntersectionObserver" in window)
  ) {
    showNewsletter();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        showNewsletter();
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -6% 0px",
    },
  );

  observer.observe(newsletter);
})();
