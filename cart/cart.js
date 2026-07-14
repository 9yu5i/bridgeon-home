(() => {
  const cartPage = document.querySelector(".cart-page");
  if (!cartPage) return;

  const cartApi = window.BridgeOn?.cart;
  const itemsContainer = document.querySelector("[data-cart-items]");
  const emptyMessage = document.querySelector("[data-cart-empty]");
  const selectAll = document.querySelector("[data-cart-select-all]");
  const promoForm = document.querySelector("[data-cart-promo-form]");
  const promoError = document.querySelector("[data-cart-promo-error]");
  const promoApplied = document.querySelector(".cart-promo-applied");
  const promoAppliedMessage = document.querySelector("[data-cart-promo-applied-message]");
  const promoAppliedCode = document.querySelector("[data-cart-promo-applied-code]");
  const promoAppliedDiscount = document.querySelector("[data-cart-promo-applied-discount]");
  const cartSide = document.querySelector(".cart-side");
  const deleteSelected = document.querySelector("[data-cart-delete-selected]");
  const headingCount = document.querySelector("[data-cart-heading-count]");
  const summaryCount = document.querySelector("[data-cart-summary-count]");
  const subtotalEl = document.querySelector("[data-cart-subtotal]");
  const discountEl = document.querySelector("[data-cart-discount]");
  const summaryPromo = document.querySelector("[data-cart-summary-promo]");
  const summaryPromoLabel = document.querySelector("[data-cart-summary-promo-label]");
  const summaryPromoDiscount = document.querySelector("[data-cart-summary-promo-discount]");
  const totalEl = document.querySelector("[data-cart-total]");
  const saveEl = document.querySelector("[data-cart-save]");
  const shippingProgress = document.querySelector("[data-cart-shipping-progress]");
  const shippingMeter = document.querySelector("[data-cart-shipping-meter]");
  const shippingMessage = document.querySelector("[data-cart-shipping-message]");
  const FREE_SHIPPING_THRESHOLD = 78;
  const PROMO_CODES = {
    WELCOME10: 0.1,
    TEST20: 0.2,
  };
  let activePromoCode = null;
  const selectedIds = new Set();
  let knownItemIds = new Set();

  if (!cartApi || !itemsContainer) return;

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const formatPrice = (value) => cartApi.formatPrice(value);
  const parsePrice = (value) => cartApi.parsePrice(value);

  const getToneClass = (tone) => {
    const safeTone = String(tone || "green").replace(/[^a-z-]/g, "");
    return safeTone ? `cart-item-image--${safeTone}` : "cart-item-image--green";
  };

  const getCartItems = () => cartApi.getItems();

  const getItemCount = (items) =>
    items.reduce((sum, item) => sum + item.quantity, 0);

  const syncSelectedIdsWithItems = (items) => {
    const currentIds = new Set(items.map((item) => item.id));

    selectedIds.forEach((id) => {
      if (!currentIds.has(id)) selectedIds.delete(id);
    });

    items.forEach((item) => {
      if (!knownItemIds.has(item.id)) selectedIds.add(item.id);
    });

    knownItemIds = currentIds;
  };

  const getSelectedItems = (items) =>
    items.filter((item) => selectedIds.has(item.id));

  const refreshSelectedTotals = () => {
    updateTotals(getCartItems());
  };

  const createOptionMarkup = (item) => {
    if (!item.option) return "";
    const option = escapeHtml(item.option);

    return `
      <span class="realtrend-select-wrap cart-option-select">
        <button type="button" class="realtrend-select-trigger" aria-haspopup="listbox" aria-expanded="false" aria-label="Product option">
          <span class="realtrend-select-value">${option}</span>
        </button>
        <ul class="realtrend-select-menu" role="listbox"></ul>
        <select class="realtrend-select-native" tabindex="-1" aria-hidden="true">
          <option selected>${option}</option>
        </select>
      </span>
    `;
  };

  const createItemMarkup = (item) => `
    <article class="cart-item" data-cart-item="${escapeHtml(item.id)}">
      <label class="cart-item-check"><input type="checkbox" data-cart-check value="${escapeHtml(item.id)}"${selectedIds.has(item.id) ? " checked" : ""}></label>
      <div class="cart-item-image ${getToneClass(item.tone)}" aria-hidden="true"></div>
      <div class="cart-item-info">
        <p>${escapeHtml(item.brand)}</p>
        <h2>${escapeHtml(item.name)}</h2>
        ${createOptionMarkup(item)}
        <div class="cart-item-links"><button type="button">Move to Wishlist ♡</button><span>|</span><button type="button" data-cart-delete>Delete</button></div>
      </div>
      <p class="cart-item-price">${item.originalPrice ? `<del>${escapeHtml(item.originalPrice)}</del>` : ""}<strong>${escapeHtml(item.price)}</strong></p>
      <div class="cart-qty" data-cart-qty>
        <button type="button" data-cart-qty-change="-1" aria-label="Decrease quantity">-</button>
        <output>${item.quantity}</output>
        <button type="button" data-cart-qty-change="1" aria-label="Increase quantity">+</button>
      </div>
      <strong class="cart-item-total">${formatPrice(parsePrice(item.price) * item.quantity)}</strong>
    </article>
  `;

  const syncSelectAll = () => {
    const checks = Array.from(document.querySelectorAll("[data-cart-check]"));
    if (!selectAll || checks.length === 0) {
      if (selectAll) {
        selectAll.checked = false;
        selectAll.indeterminate = false;
      }
      return;
    }

    const checkedCount = checks.filter((input) => input.checked).length;
    selectAll.checked = checkedCount === checks.length;
    selectAll.indeterminate = checkedCount > 0 && checkedCount < checks.length;
  };

  const buildCartOptionMenu = (wrap) => {
    const select = wrap.querySelector(".realtrend-select-native");
    const valueEl = wrap.querySelector(".realtrend-select-value");
    const menu = wrap.querySelector(".realtrend-select-menu");
    if (!select || !valueEl || !menu) return;

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

  const closeCartOptionSelects = (exceptWrap = null) => {
    document.querySelectorAll(".cart-option-select.is-open").forEach((wrap) => {
      if (wrap === exceptWrap) return;
      wrap.classList.remove("is-open");
      wrap.querySelector(".realtrend-select-trigger")?.setAttribute("aria-expanded", "false");
      wrap.querySelector(".realtrend-select-menu")?.classList.remove("is-open");
    });
  };

  const initCartOptionSelects = () => {
    document.querySelectorAll(".cart-option-select").forEach(buildCartOptionMenu);
  };

  const updateTotals = (items) => {
    const selectedItems = getSelectedItems(items);
    const cartCount = getItemCount(items);
    const selectedCount = getItemCount(selectedItems);
    const saleSubtotal = selectedItems.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
    const regularSubtotal = selectedItems.reduce((sum, item) => {
      const salePrice = parsePrice(item.price);
      const originalPrice = item.originalPrice ? parsePrice(item.originalPrice) : salePrice;
      return sum + Math.max(originalPrice, salePrice) * item.quantity;
    }, 0);
    const productDiscount = Math.max(0, regularSubtotal - saleSubtotal);
    const promoRate = activePromoCode ? PROMO_CODES[activePromoCode] || 0 : 0;
    const promoDiscount = selectedCount > 0 ? saleSubtotal * promoRate : 0;
    const total = Math.max(0, saleSubtotal - promoDiscount);
    const productDiscountText = `- ${formatPrice(productDiscount)}`;
    const promoDiscountText = `- ${formatPrice(promoDiscount)}`;
    const hasPromo = Boolean(activePromoCode && promoDiscount > 0);

    if (headingCount) headingCount.textContent = `(${cartCount})`;
    if (summaryCount) summaryCount.textContent = `(${selectedCount} item${selectedCount === 1 ? "" : "s"})`;
    if (subtotalEl) subtotalEl.textContent = formatPrice(regularSubtotal);
    if (discountEl) discountEl.textContent = productDiscountText;
    if (summaryPromo) summaryPromo.hidden = !hasPromo;
    if (summaryPromoLabel) summaryPromoLabel.textContent = activePromoCode ? `Promo code (${activePromoCode})` : "Promo code";
    if (summaryPromoDiscount) summaryPromoDiscount.textContent = promoDiscountText;
    if (promoAppliedCode) promoAppliedCode.textContent = activePromoCode ? `Promo code (${activePromoCode})` : "Promo code";
    if (promoAppliedDiscount) promoAppliedDiscount.textContent = promoDiscountText;
    if (totalEl) totalEl.textContent = formatPrice(total);
    if (saveEl) saveEl.textContent = formatPrice(productDiscount + promoDiscount);

    if (shippingProgress) {
      const progressValue = Math.min(saleSubtotal, FREE_SHIPPING_THRESHOLD);
      const progressRatio = FREE_SHIPPING_THRESHOLD > 0 ? progressValue / FREE_SHIPPING_THRESHOLD : 0;

      shippingProgress.max = FREE_SHIPPING_THRESHOLD;
      shippingProgress.value = progressValue;
      shippingProgress.setAttribute(
        "aria-label",
        `Free shipping progress: ${formatPrice(progressValue)} of ${formatPrice(FREE_SHIPPING_THRESHOLD)}`,
      );
      shippingMeter?.style.setProperty("--cart-shipping-progress", String(progressRatio));
    }

    if (shippingMessage) {
      const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - saleSubtotal);
      shippingMessage.innerHTML = remaining === 0
        ? `You've unlocked <b>FREE</b> shipping!`
        : `You're ${formatPrice(remaining)} away from <b>FREE</b> shipping!`;
    }
  };

  const renderCart = () => {
    const items = getCartItems();
    const isEmpty = items.length === 0;

    syncSelectedIdsWithItems(items);
    itemsContainer.innerHTML = items.map(createItemMarkup).join("");
    initCartOptionSelects();
    cartPage.classList.toggle("is-cart-empty", isEmpty);
    if (emptyMessage) emptyMessage.hidden = !isEmpty;
    if (cartSide) cartSide.hidden = isEmpty;
    if (deleteSelected) deleteSelected.hidden = isEmpty;
    updateTotals(items);
    cartApi.updateBadges();
    syncSelectAll();
  };

  selectAll?.addEventListener("change", () => {
    const shouldSelect = selectAll.checked;

    document.querySelectorAll("[data-cart-check]").forEach((input) => {
      input.checked = shouldSelect;
      if (shouldSelect) {
        selectedIds.add(input.value);
      } else {
        selectedIds.delete(input.value);
      }
    });
    syncSelectAll();
    refreshSelectedTotals();
  });

  document.addEventListener("change", (event) => {
    if (!event.target.matches("[data-cart-check]")) return;
    if (event.target.checked) {
      selectedIds.add(event.target.value);
    } else {
      selectedIds.delete(event.target.value);
    }
    syncSelectAll();
    refreshSelectedTotals();
  });

  document.addEventListener("click", (event) => {
    const optionTrigger = event.target.closest(".cart-option-select .realtrend-select-trigger");
    if (optionTrigger) {
      const wrap = optionTrigger.closest(".cart-option-select");
      if (!wrap) return;
      const menu = wrap.querySelector(".realtrend-select-menu");
      const shouldOpen = !wrap.classList.contains("is-open");

      closeCartOptionSelects(wrap);
      wrap.classList.toggle("is-open", shouldOpen);
      optionTrigger.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
      menu?.classList.toggle("is-open", shouldOpen);
      return;
    }

    const optionItem = event.target.closest(".cart-option-select .realtrend-select-menu [role='option']");
    if (optionItem) {
      const wrap = optionItem.closest(".cart-option-select");
      const select = wrap?.querySelector(".realtrend-select-native");
      const index = Number(optionItem.dataset.index);
      if (select && Number.isInteger(index) && index >= 0 && index < select.options.length) {
        select.selectedIndex = index;
        buildCartOptionMenu(wrap);
      }
      closeCartOptionSelects();
      return;
    }

    if (!event.target.closest(".cart-option-select")) {
      closeCartOptionSelects();
    }

    const qtyButton = event.target.closest("[data-cart-qty-change]");
    if (qtyButton) {
      const item = qtyButton.closest("[data-cart-item]");
      if (!item) return;
      const current = cartApi.getItems().find((cartItem) => cartItem.id === item.dataset.cartItem);
      const nextQty = Math.max(1, (current?.quantity || 1) + Number(qtyButton.dataset.cartQtyChange));
      cartApi.updateQuantity(item.dataset.cartItem, nextQty);
      renderCart();
      return;
    }

    const deleteButton = event.target.closest("[data-cart-delete]");
    if (deleteButton) {
      const item = deleteButton.closest("[data-cart-item]");
      if (item?.dataset.cartItem) cartApi.remove(item.dataset.cartItem);
      renderCart();
      return;
    }

    if (event.target.closest("[data-cart-delete-selected]")) {
      const ids = Array.from(document.querySelectorAll("[data-cart-check]:checked")).map((input) => input.value);
      cartApi.clearSelected(ids);
      renderCart();
    }
  });

  document.querySelector("[data-cart-back]")?.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "../index.html";
  });

  promoForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = event.currentTarget.querySelector("input");
    const value = input?.value.trim().toUpperCase() || "";
    const isValid = Object.hasOwn(PROMO_CODES, value);

    if (promoError) promoError.hidden = isValid;
    if (promoApplied) promoApplied.hidden = !isValid;

    if (isValid) {
      activePromoCode = value;
      if (promoAppliedMessage) promoAppliedMessage.textContent = `Promo code "${value}" applied!`;
      if (input) input.value = "";
    } else {
      activePromoCode = null;
    }

    renderCart();
  });

  document.querySelector("[data-cart-promo-remove]")?.addEventListener("click", () => {
    activePromoCode = null;
    if (promoApplied) promoApplied.hidden = true;
    if (promoError) promoError.hidden = true;
    renderCart();
  });

  window.addEventListener("bridgeon:cartchange", renderCart);
  window.addEventListener("storage", (event) => {
    if (event.key === "bridgeon-cart-items") renderCart();
  });

  const SHIPPING_COUNTRIES = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "New Zealand",
    "Japan",
    "South Korea",
    "Singapore",
    "Hong Kong",
    "Taiwan",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Netherlands",
    "Belgium",
    "Sweden",
    "Norway",
    "Denmark",
    "Finland",
    "Ireland",
    "Switzerland",
    "Austria",
    "Portugal",
    "Poland",
    "Czech Republic",
    "Hungary",
    "Romania",
    "Greece",
    "Luxembourg",
    "Iceland",
    "Mexico",
    "Brazil",
    "Chile",
    "Colombia",
    "Argentina",
    "Peru",
    "United Arab Emirates",
    "Saudi Arabia",
    "Israel",
    "Turkey",
    "India",
    "Indonesia",
    "Malaysia",
    "Thailand",
    "Vietnam",
    "Philippines",
    "China",
    "South Africa",
    "Egypt",
    "Nigeria",
    "Kenya",
    "Morocco",
    "Russia",
    "Ukraine",
    "Croatia",
    "Slovakia",
    "Slovenia",
    "Bulgaria",
    "Estonia",
    "Latvia",
    "Lithuania",
    "Malta",
    "Cyprus",
    "Qatar",
    "Kuwait",
    "Bahrain",
    "Oman",
    "Jordan",
    "Lebanon",
    "Costa Rica",
    "Panama",
    "Dominican Republic",
    "Puerto Rico",
    "Guatemala",
    "Uruguay",
    "Ecuador",
    "Pakistan",
    "Bangladesh",
    "Sri Lanka",
    "Cambodia",
    "Laos",
    "Myanmar",
    "Macao",
    "Mongolia",
    "Kazakhstan",
    "Georgia",
    "Armenia",
    "Azerbaijan",
    "Serbia",
    "Bosnia and Herzegovina",
    "North Macedonia",
    "Albania",
    "Moldova",
    "Belarus",
    "Ghana",
    "Tanzania",
    "Uganda",
    "Tunisia",
    "Algeria",
    "Mauritius",
    "Réunion",
    "Guadeloupe",
    "Martinique",
    "French Guiana",
    "New Caledonia",
    "Fiji",
    "Papua New Guinea",
    "Samoa",
    "Tonga",
    "Brunei",
    "Maldives",
    "Nepal",
    "Bhutan",
    "Trinidad and Tobago",
    "Jamaica",
    "Bahamas",
    "Barbados",
    "Belize",
    "El Salvador",
    "Honduras",
    "Nicaragua",
    "Paraguay",
    "Bolivia",
    "Venezuela",
  ];

  const countryDialog = document.getElementById("cart-country-dialog");
  const countryListEl = document.querySelector("[data-cart-country-list]");
  const countrySearch = document.querySelector("[data-cart-country-search]");
  const shipCountryLabel = document.querySelector("[data-cart-ship-country]");
  const shipChangeButton = document.querySelector("[data-cart-ship-change]");
  const STORAGE_KEY = "bridgeon-cart-ship-country";

  let selectedCountry = localStorage.getItem(STORAGE_KEY) || "United States";

  const syncShipCountryLabel = () => {
    if (shipCountryLabel) shipCountryLabel.textContent = `Shipping to ${selectedCountry}`;
  };

  const renderCountryList = (query = "") => {
    if (!countryListEl) return;

    const normalized = query.trim().toLowerCase();
    const countries = SHIPPING_COUNTRIES.filter((country) =>
      country.toLowerCase().includes(normalized)
    ).sort((a, b) => a.localeCompare(b));

    if (!countries.length) {
      countryListEl.innerHTML = `<li class="cart-country-empty">No countries found.</li>`;
      return;
    }

    countryListEl.innerHTML = countries
      .map(
        (country) => `
          <li>
            <button
              type="button"
              role="option"
              data-cart-country="${escapeHtml(country)}"
              aria-selected="${country === selectedCountry ? "true" : "false"}"
              class="${country === selectedCountry ? "is-selected" : ""}"
            >${escapeHtml(country)}</button>
          </li>
        `
      )
      .join("");
  };

  const openCountryDialog = () => {
    if (!countryDialog) return;
    countryDialog.hidden = false;
    countryDialog.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-cart-country-open");
    renderCountryList(countrySearch?.value || "");
    countrySearch?.focus();
  };

  const closeCountryDialog = () => {
    if (!countryDialog) return;
    countryDialog.hidden = true;
    countryDialog.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-cart-country-open");
    shipChangeButton?.focus();
  };

  const selectCountry = (country) => {
    if (!country || !SHIPPING_COUNTRIES.includes(country)) return;
    selectedCountry = country;
    localStorage.setItem(STORAGE_KEY, selectedCountry);
    syncShipCountryLabel();
    closeCountryDialog();
  };

  shipChangeButton?.addEventListener("click", openCountryDialog);

  countryDialog?.querySelectorAll("[data-cart-country-close]").forEach((button) => {
    button.addEventListener("click", closeCountryDialog);
  });

  countrySearch?.addEventListener("input", () => {
    renderCountryList(countrySearch.value);
  });

  countryListEl?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-country]");
    if (!button) return;
    selectCountry(button.dataset.cartCountry);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && countryDialog && !countryDialog.hidden) {
      closeCountryDialog();
    }
  });

  syncShipCountryLabel();
  renderCountryList();

  renderCart();
})();
