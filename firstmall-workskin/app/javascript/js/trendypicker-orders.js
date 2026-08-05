(() => {
  const page = document.querySelector(".bo-orders-page");
  if (!page) return;

  // Firstmall defaults to a limited period when sc_date is missing/empty.
  // Dashboard links already pass sc_date=0; native LNB / other pages often do not.
  const orderParams = new URLSearchParams(window.location.search);
  const scDate = orderParams.get("sc_date");
  if (scDate === null || scDate === "") {
    const allOrdersUrl = new URL(window.location.href);
    allOrdersUrl.searchParams.set("sc_date", "0");
    window.location.replace(allOrdersUrl.href);
    return;
  }

  const normalize = (value) =>
    String(value || "")
      .toLocaleLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const activeOrderList = page.querySelector(".order_list");
  const cards = Array.from(activeOrderList?.querySelectorAll(".bo-order-card") || []);

  const getStatus = (card) => {
    if (card.dataset.orderStatus) return card.dataset.orderStatus;

    const state = normalize(card.dataset.orderState);
    const step = Number(card.dataset.orderStep || 0);

    if (/cancel|refund|return|exchange|void|취소|환불|반품|교환|철회|무효/.test(state)) {
      return "cancel-refund";
    }
    if (/delivered|purchase confirmed|배송완료|구매확정/.test(state)) return "delivered";
    if (/shipped|in transit|배송중|출고/.test(state)) return "shipped";
    if (/payment confirmed|processing|preparing|상품준비|결제확인/.test(state)) {
      return "payment-confirmed";
    }
    if (/pending|payment pending|주문접수|입금대기/.test(state)) return "pending";
    if (step >= 75) return "delivered";
    if (step >= 50) return "shipped";
    if (step >= 25) return "payment-confirmed";
    return "pending";
  };

  const paymentLabel = (value) => {
    const key = normalize(value).replace(/[\s-]+/g, "_");
    const labels = {
      card: "Credit Card",
      bank: "Bank Transfer",
      account: "Bank Transfer",
      virtual: "Virtual Account",
      cellphone: "Mobile Payment",
      paypal: "PayPal",
      pos_pay: "POS Payment",
    };
    return labels[key] || value || "—";
  };

  const makeAction = (source, className = "") => {
    if (!source) return null;
    const action = source.cloneNode(true);
    action.className = `order_btn ${className}`.trim();
    if (action.tagName === "BUTTON") action.type = "button";
    return action;
  };

  const buildSummaryCard = (card) => {
    const menu = card.querySelector(":scope > .menu");
    const shipping = card.querySelector(":scope > .shipping");
    if (!menu || !shipping) return;

    const orderLink = menu.querySelector(".order_num h4 a");
    const dateText = menu.querySelector(".order_num > span")?.textContent.split("|")[0].trim() || "";
    const totalText = shipping.querySelector(":scope > .price b")?.textContent.trim() || "";
    const products = Array.from(shipping.querySelectorAll(".oc_item_info_detail"));
    const quantities = products.map((product) => {
      const quantity = Number(product.querySelector(".goods_quantity .num")?.textContent.replace(/[^0-9.]/g, ""));
      return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
    });
    const totalItems = quantities.reduce((sum, quantity) => sum + quantity, 0) || products.length;
    const status = getStatus(card);
    const rawStatus = card.dataset.orderState || shipping.querySelector(":scope > .status > span")?.textContent || "Pending";

    const summary = document.createElement("article");
    summary.className = "orders-summary";

    const head = document.createElement("div");
    head.className = "orders-card-head";
    head.innerHTML = `
      <div>
        <h2></h2>
        <time>${dateText}</time>
      </div>
      <mark class="is-${status}">${rawStatus}</mark>
      <div class="orders-card-head__aside">
        <strong>${totalText}</strong>
      </div>`;
    const summaryOrderLink = orderLink?.cloneNode(true) || document.createElement("span");
    if (!summaryOrderLink.textContent) summaryOrderLink.textContent = "Order";
    head.querySelector("h2").append(summaryOrderLink);

    const details = menu.querySelector(".order_act > span a")?.cloneNode(true);
    if (details) {
      details.className = "order-details-link";
      head.querySelector(".orders-card-head__aside").append(details);
    }

    const body = document.createElement("div");
    body.className = "orders-card-body";

    const thumbs = document.createElement("div");
    thumbs.className = "orders-thumbs";
    products.slice(0, 3).forEach((product, index) => {
      const sourceImage = product.querySelector(".goods_thumb");
      const sourceLink = product.querySelector(".img_link");
      const thumb = document.createElement(sourceLink?.hasAttribute("onclick") ? "button" : "span");
      if (thumb.tagName === "BUTTON") {
        thumb.type = "button";
        thumb.setAttribute("onclick", sourceLink.getAttribute("onclick"));
      }
      thumb.className = "orders-thumb";
      if (sourceImage) thumb.append(sourceImage.cloneNode(true));
      if (index === 2 && totalItems >= 4) {
        const more = document.createElement("em");
        more.textContent = `+${totalItems - 3}`;
        thumb.append(more);
      }
      thumbs.append(thumb);
    });

    const meta = document.createElement("div");
    meta.className = "orders-desktop-meta";
    meta.innerHTML = `
      <p><span>Items</span><b>${totalItems} ${totalItems === 1 ? "item" : "items"}</b></p>
      <p><span>Payment</span><b>${paymentLabel(card.dataset.orderPayment)}</b></p>`;

    const address = document.createElement("div");
    address.className = "orders-address";
    address.dataset.orderShippingAddress = "";
    const recipient = String(card.dataset.orderRecipient || "").replace(/\s+/g, " ").trim();
    const zipcode = String(card.dataset.orderZipcode || "").replace(/\s+/g, " ").trim();
    const rawAddress = String(card.dataset.orderAddress || "").replace(/\s+/g, " ").trim();
    const embeddedAddress = [recipient, zipcode ? `[${zipcode}] ${rawAddress}`.trim() : rawAddress]
      .filter(Boolean)
      .join(", ");
    const addressValue = document.createElement("b");
    if (embeddedAddress) {
      const addressLines = formatShippingAddressLines(recipient, embeddedAddress);
      addressLines.forEach((line, index) => {
        if (index > 0) addressValue.append(document.createElement("br"));
        addressValue.append(document.createTextNode(line));
      });
      card.dataset.orderAddressReady = "true";
    } else {
      addressValue.textContent = "Loading...";
    }
    const addressLabel = document.createElement("span");
    addressLabel.textContent = "Shipping Address";
    address.append(addressLabel, addressValue);

    const reviewSource = menu.querySelector(".order_act > .btn_resp");
    const trackingSource = Array.from(shipping.querySelectorAll(".status .order_btn")).find(
      (action) => /track/i.test(action.textContent),
    );
    const actions = document.createElement("div");
    actions.className = "orders-card-actions";
    const review = makeAction(reviewSource);
    const tracking = makeAction(trackingSource, "orders-track-button");
    if (tracking) tracking.textContent = "Track Order";
    if (review) actions.append(review);
    if (tracking) actions.append(tracking);

    shipping.querySelectorAll(".status .order_btn").forEach((source) => {
      const label = normalize(source.textContent);
      if (/track/.test(label)) return;
      if (tracking && /inquiry|exchange|return|q&a|문의|교환|반품/.test(label)) return;
      const action = makeAction(source);
      if (action && /inquiry|exchange|return|q&a/.test(label)) {
        action.textContent = "Inquiry";
      }
      if (action) actions.append(action);
    });

    const mobileItems = document.createElement("div");
    mobileItems.className = "orders-mobile-items";
    products.forEach((product) => {
      const item = document.createElement("section");
      item.className = "orders-mobile-item";

      const sourceImage = product.querySelector(".goods_thumb");
      const sourceLink = product.querySelector(".img_link");
      const media = document.createElement(sourceLink?.hasAttribute("onclick") ? "button" : "span");
      if (media.tagName === "BUTTON") {
        media.type = "button";
        media.setAttribute("onclick", sourceLink.getAttribute("onclick"));
        media.setAttribute("aria-label", "View ordered product");
      }
      media.className = "orders-mobile-thumb";
      if (sourceImage) media.append(sourceImage.cloneNode(true));

      const copy = document.createElement("div");
      copy.className = "orders-mobile-copy";
      const name = document.createElement("h3");
      name.textContent = product.querySelector(".goods_name")?.textContent.trim() || "Ordered item";
      copy.append(name);

      const optionText = Array.from(
        product.querySelectorAll(".goods_options li, .goods_suboptions li"),
      )
        .map((option) => option.textContent.replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .join(", ");
      if (optionText) {
        const option = document.createElement("p");
        option.textContent = `Options: ${optionText}`;
        copy.append(option);
      }

      const quantity = document.createElement("p");
      quantity.textContent = `Qty: ${product.querySelector(".goods_quantity .num")?.textContent.trim() || "1"}`;
      const price = document.createElement("strong");
      price.textContent = product.querySelector(".goods_price")?.textContent.trim() || "";
      copy.append(quantity, price);

      const mobileReview = makeAction(reviewSource, "orders-mobile-review");
      const mobileTracking = makeAction(trackingSource, "orders-track-button");
      if (mobileReview) mobileReview.textContent = "Write A Review";
      if (mobileTracking) mobileTracking.textContent = "Track Order";
      if (Number(Boolean(mobileReview)) + Number(Boolean(mobileTracking)) === 1) {
        item.classList.add("has-single-action");
      }

      item.append(media, copy);
      if (mobileReview) item.append(mobileReview);
      if (mobileTracking) item.append(mobileTracking);
      mobileItems.append(item);
    });

    if (details) {
      const mobileDetails = details.cloneNode(true);
      mobileDetails.className = "order-details-link orders-mobile-detail-link";
      mobileDetails.textContent = "Order Details >";
      mobileItems.append(mobileDetails);
    }

    body.append(thumbs, meta, address, actions, mobileItems);
    summary.append(head, body);

    card.dataset.orderStatus = status;
    card.prepend(summary);
    card.classList.add("is-summary-ready");
  };

  const historySources = [
    { url: "/mypage/refund_catalog", label: "Cancel/Refund" },
    { url: "/mypage/return_catalog", label: "Return/Exchange" },
  ];
  let historyLoadRequest = null;
  let historyLoaded = false;

  const fetchHistoryDocument = async (url) => {
    try {
      const response = await fetch(url, {
        credentials: "same-origin",
        headers: { Accept: "text/html" },
      });
      if (!response.ok) return null;
      return new DOMParser().parseFromString(await response.text(), "text/html");
    } catch (_error) {
      return null;
    }
  };

  const getHistoryDocuments = async (source) => {
    const firstPage = await fetchHistoryDocument(source.url);
    if (!firstPage) return [];

    const pageUrls = Array.from(firstPage.querySelectorAll(".paging_navigation a[href]"))
      .map((link) => {
        try {
          const url = new URL(link.getAttribute("href"), new URL(source.url, window.location.origin));
          return url.origin === window.location.origin ? url.href : "";
        } catch (_error) {
          return "";
        }
      })
      .filter(Boolean);
    const uniquePageUrls = Array.from(new Set(pageUrls)).slice(0, 12);
    const additionalPages = await Promise.all(uniquePageUrls.map(fetchHistoryDocument));
    return [firstPage, ...additionalPages.filter(Boolean)];
  };

  const createHistoryCard = (row, source) => {
    const detailSource = row.querySelector("a.link1[href]");
    const code = detailSource?.textContent.replace(/\s+/g, " ").trim() || "History";
    const date = row.querySelector(".date")?.textContent.replace(/\s+/g, " ").trim() || "";
    const type = row.querySelector(".mo_stle")?.textContent.replace(/\s+/g, " ").trim() || source.label;
    const product = row.querySelector(".subject")?.textContent.replace(/\s+/g, " ").trim() || "Order item";
    const status = row.querySelector(".mypage_refund_status, .pointcolor")?.textContent.replace(/\s+/g, " ").trim() || source.label;
    const completedRow = Array.from(row.children).find((element) => element.style.order === "2");
    const completed = completedRow?.textContent.replace(/환불완료일:|반품완료일:/g, "").replace(/\s+/g, " ").trim() || "—";

    const card = document.createElement("li");
    card.className = "bo-order-card is-summary-ready is-history-card";
    card.dataset.orderStatus = "cancel-refund";
    card.dataset.orderState = status;

    const summary = document.createElement("article");
    summary.className = "orders-summary";

    const head = document.createElement("div");
    head.className = "orders-card-head";
    const heading = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = `${type} ${code}`;
    const time = document.createElement("time");
    time.textContent = date;
    heading.append(title, time);
    const mark = document.createElement("mark");
    mark.className = "is-cancel-refund";
    mark.textContent = status;
    const aside = document.createElement("div");
    aside.className = "orders-card-head__aside";
    if (detailSource) {
      const details = document.createElement("a");
      details.className = "order-details-link orders-history-detail-link";
      details.dataset.ordersNativeDetail = "";
      details.href = new URL(detailSource.getAttribute("href"), new URL(source.url, window.location.origin)).href;
      details.textContent = "Order Details >";
      aside.append(details);
    }
    head.append(heading, mark);
    if (aside.childElementCount) head.append(aside);

    const body = document.createElement("div");
    body.className = "orders-history-body";
    [
      ["Item", product],
      ["Type", type],
      ["Completed", completed],
    ].forEach(([label, value]) => {
      const field = document.createElement("p");
      const fieldLabel = document.createElement("span");
      fieldLabel.textContent = label;
      const fieldValue = document.createElement("strong");
      fieldValue.textContent = value;
      field.append(fieldLabel, fieldValue);
      body.append(field);
    });

    summary.append(head, body);
    card.append(summary);
    return card;
  };

  const ensureOrderList = () => {
    let listRoot = page.querySelector(".order_list");
    if (!listRoot) {
      listRoot = document.createElement("div");
      listRoot.className = "order_list";
      listRoot.dataset.ordersList = "";
      const emptyNode = page.querySelector("[data-orders-native-empty]");
      if (emptyNode) emptyNode.before(listRoot);
      else page.append(listRoot);
    }

    let list = listRoot.querySelector(":scope > ul");
    if (!list) {
      list = document.createElement("ul");
      listRoot.append(list);
    }
    return list;
  };

  const syncNativeEmptyState = () => {
    const emptyNode = page.querySelector("[data-orders-native-empty]");
    if (!emptyNode) return;
    const hasVisibleCards = cards.some((card) => !card.hidden);
    emptyNode.hidden = hasVisibleCards;
    emptyNode.classList.toggle("is-hidden", hasVisibleCards);
  };

  const loadCancelRefundHistory = () => {
    if (historyLoadRequest) return historyLoadRequest;
    historyLoadRequest = Promise.all(
      historySources.map(async (source) => ({
        source,
        documents: await getHistoryDocuments(source),
      })),
    ).then((results) => {
      const list = ensureOrderList();
      const seen = new Set();
      results.forEach(({ source, documents }) => {
        documents.forEach((documentPage) => {
          documentPage.querySelectorAll(".res_table.custom.return > ul.tbody").forEach((row) => {
            const key = row.querySelector("a.link1")?.textContent.replace(/\s+/g, " ").trim();
            if (!key || seen.has(`${source.url}:${key}`)) return;
            seen.add(`${source.url}:${key}`);
            const card = createHistoryCard(row, source);
            list.append(card);
            cards.push(card);
          });
        });
      });
      syncNativeEmptyState();
    }).finally(() => {
      historyLoaded = true;
    });
    return historyLoadRequest;
  };

  // Default filters are All / All Orders — start history fetch immediately so
  // cancel/refund rows appear with the rest of the order list on first paint.
  const historyReady = loadCancelRefundHistory();

  const extractDetailValue = (detailPage, label, sectionTitle = "") => {
    const wanted = normalize(label);
    const sectionHeading = sectionTitle
      ? Array.from(detailPage.querySelectorAll("h3.title_container")).find((heading) =>
          normalize(heading.textContent).includes(normalize(sectionTitle)),
        )
      : null;
    const section = sectionHeading?.nextElementSibling || detailPage;
    const headings = Array.from(section.querySelectorAll(".th, th, dt, strong"));
    const heading = headings.find((element) => normalize(element.textContent).includes(wanted));
    if (!heading) return "";
    const row = heading.closest("li, tr, dl, div") || heading.parentElement;
    const value = row?.querySelector(".td, td, dd") || heading.nextElementSibling;
    return value?.textContent.replace(/\s+/g, " ").trim() || "";
  };

  const formatShippingAddressLines = (recipient, shippingAddress) => {
    const lines = [];
    const recipientName = String(recipient || "").replace(/\s+/g, " ").trim();
    let addressText = String(shippingAddress || "").replace(/\s+/g, " ").trim();
    let country = "";

    const countryPrefix = addressText.match(/^\[([^\]]+)]\s*/);
    if (countryPrefix) {
      country = countryPrefix[1].trim();
      addressText = addressText.slice(countryPrefix[0].length).trim();
    }

    const parts = addressText
      .split(/\s*,\s*/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (recipientName && normalize(parts[0]) === normalize(recipientName)) parts.shift();

    const lastPart = parts[parts.length - 1] || "";
    if (country && normalize(lastPart) === normalize(country)) {
      parts.pop();
    } else if (!country && parts.length > 1 && !/\d/.test(lastPart)) {
      country = parts.pop();
    }

    let address = "";
    let city = "";
    let region = "";
    const lastPartIsPostalCode = parts.length > 0 && /\d/.test(parts[parts.length - 1]);

    if (parts.length >= 5 || (parts.length === 4 && !lastPartIsPostalCode)) {
      address = parts.splice(0, 2).join(", ");
    } else if (parts.length > 0) {
      address = parts.shift();
    }

    if (parts.length > 0) city = parts.shift();
    if (parts.length > 0) region = parts.join(" ");

    [recipientName, address, city, region, country].forEach((line) => {
      if (line) lines.push(line);
    });
    return lines;
  };

  const detailRequests = new Map();
  const getOrderDetailPage = (url) => {
    if (!url) return Promise.resolve(null);
    if (!detailRequests.has(url)) {
      const request = fetch(url, {
        credentials: "same-origin",
        headers: { Accept: "text/html" },
      })
        .then((response) => {
          if (!response.ok) throw new Error(`Order detail request failed: ${response.status}`);
          return response.text();
        })
        .then((html) => new DOMParser().parseFromString(html, "text/html"))
        .catch(() => null);
      detailRequests.set(url, request);
    }
    return detailRequests.get(url);
  };

  const readDetailPageAddress = (detailPage) => {
    if (!detailPage) return { recipient: "", shippingAddress: "" };

    const textOfSelector = (selector) =>
      Array.from(detailPage.querySelectorAll(selector))
        .map((element) => element.textContent.replace(/\s+/g, " ").trim())
        .find(Boolean) || "";

    const recipient =
      textOfSelector(".recipient_user_name") ||
      extractDetailValue(detailPage, "Contact Name", "Shipping Information") ||
      extractDetailValue(detailPage, "Recipient") ||
      extractDetailValue(detailPage, "받는분");

    const international = textOfSelector(".international_address");
    const zipcode = textOfSelector(".recipient_zipcode");
    const street = textOfSelector(".recipient_address_street");
    const baseAddress = textOfSelector(".recipient_address");
    const detail = textOfSelector(".recipient_address_detail");
    const composed = [zipcode ? `[${zipcode}]` : "", street || baseAddress, detail]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    const shippingAddress =
      international ||
      composed ||
      extractDetailValue(detailPage, "Shipping Address", "Shipping Information") ||
      extractDetailValue(detailPage, "Address") ||
      extractDetailValue(detailPage, "배송지") ||
      extractDetailValue(detailPage, "주소");

    return { recipient, shippingAddress };
  };

  const applyShippingAddress = (card, recipient, shippingAddress) => {
    const target = card.querySelector("[data-order-shipping-address] b");
    if (!target || !shippingAddress) return false;
    const addressLines = formatShippingAddressLines(recipient, shippingAddress);
    if (!addressLines.length) return false;
    target.replaceChildren();
    addressLines.forEach((line, index) => {
      if (index > 0) target.append(document.createElement("br"));
      target.append(document.createTextNode(line));
    });
    card.dataset.orderAddressReady = "true";
    return true;
  };

  const hydrateAddress = async (card) => {
    if (card.dataset.orderAddressReady === "true") return;
    const url = card.dataset.orderDetailsUrl;
    const target = card.querySelector("[data-order-shipping-address] b");
    if (!url || !target) return;

    const detailPage = await getOrderDetailPage(url);
    if (!detailPage || card.dataset.orderAddressReady === "true") return;
    const { recipient, shippingAddress } = readDetailPageAddress(detailPage);
    if (!applyShippingAddress(card, recipient, shippingAddress) && /^(Loading\.\.\.|View order details)$/i.test(target.textContent)) {
      target.textContent = "Not provided";
    }
  };

  // Warm address detail requests as early as possible, then paint cards.
  cards.forEach((card) => {
    if (card.dataset.orderDetailsUrl) getOrderDetailPage(card.dataset.orderDetailsUrl);
  });
  cards.forEach(buildSummaryCard);
  cards.forEach(hydrateAddress);

  const detailModal = document.querySelector("[data-orders-detail-modal]");
  const detailDialog = detailModal?.querySelector(".orders-detail-dialog");
  const detailItems = detailModal?.querySelector("[data-orders-detail-items]");
  const detailNumber = detailModal?.querySelector("[data-orders-detail-number]");
  const detailTime = detailModal?.querySelector("[data-orders-detail-time]");
  const detailStatus = detailModal?.querySelector("[data-orders-detail-status]");
  const detailTotal = detailModal?.querySelector("[data-orders-detail-total]");
  const detailPayment = detailModal?.querySelector("[data-orders-detail-payment]");
  const detailPaymentDate = detailModal?.querySelector("[data-orders-detail-payment-date]");
  const detailRecipient = detailModal?.querySelector("[data-orders-detail-recipient]");
  const detailAddress = detailModal?.querySelector("[data-orders-detail-address]");
  const detailPricing = detailModal?.querySelector("[data-orders-detail-pricing]");
  let detailTrigger = null;
  let detailCard = null;

  const textOf = (root, selector, fallback = "") =>
    root?.querySelector(selector)?.textContent.replace(/\s+/g, " ").trim() || fallback;

  const readCardItems = (card) =>
    Array.from(card.querySelectorAll(":scope > .shipping .oc_item_info_detail")).map(
      (product) => {
        const sourceLink = product.querySelector(".img_link");
        const onclick = sourceLink?.getAttribute("onclick") || "";
        const onclickUrl = onclick.match(/location\.href\s*=\s*['\"]([^'\"]+)/)?.[1] || "";
        const productUrl =
          sourceLink?.getAttribute("href") ||
          (onclickUrl ? new URL(onclickUrl, window.location.href).href : "");
        const brandElement = product.querySelector(".brand_name");
        const brandCode = brandElement?.dataset.brandCode || "";

        return {
        image:
          product.querySelector(".goods_thumb img")?.getAttribute("src") ||
          product.querySelector(".img_link img")?.getAttribute("src") ||
          "",
        imageAlt:
          product.querySelector(".goods_thumb img")?.getAttribute("alt") ||
          textOf(product, ".goods_name", "Ordered item"),
        brand: textOf(product, ".brand_name"),
        brandUrl: brandCode ? `/goods/brand?code=${encodeURIComponent(brandCode)}` : "",
        productUrl,
        name: textOf(product, ".goods_name", "Ordered item"),
        options: Array.from(product.querySelectorAll(".goods_options li, .goods_suboptions li"))
          .map((option) => option.textContent.replace(/\s+/g, " ").trim())
          .filter(Boolean)
          .join(" · "),
        quantity: textOf(product, ".goods_quantity .num", "1"),
        price: textOf(product, ".goods_price"),
        };
      },
    );

  const renderDetailItems = (items) => {
    if (!detailItems) return;
    detailItems.replaceChildren();
    if (!items.length) {
      const message = document.createElement("p");
      message.className = "orders-detail-error";
      message.textContent = "Item information is available on the full order details page.";
      detailItems.append(message);
      return;
    }

    items.forEach((item) => {
      const row = document.createElement("article");
      row.className = "orders-detail-item";

      const media = document.createElement(item.productUrl ? "a" : "span");
      media.className = "orders-detail-item__media";
      if (item.productUrl) media.href = item.productUrl;

      if (item.image) {
        const image = document.createElement("img");
        image.src = item.image;
        image.alt = item.imageAlt;
        media.append(image);
      } else {
        const placeholder = document.createElement("span");
        placeholder.className = "orders-detail-item__placeholder";
        placeholder.setAttribute("aria-hidden", "true");
        media.append(placeholder);
      }
      row.append(media);

      const copy = document.createElement("div");
      copy.className = "orders-detail-item__copy";
      if (item.brand) {
        const brand = document.createElement(item.brandUrl ? "a" : "small");
        brand.className = "orders-detail-item__brand";
        brand.textContent = item.brand;
        if (item.brandUrl) brand.href = item.brandUrl;
        copy.append(brand);
      }
      const name = document.createElement(item.productUrl ? "a" : "strong");
      name.className = "orders-detail-item__name";
      name.textContent = item.name;
      if (item.productUrl) name.href = item.productUrl;
      copy.append(name);
      if (item.options) {
        const meta = document.createElement("small");
        meta.textContent = item.options;
        copy.append(meta);
      }

      const price = document.createElement("div");
      price.className = "orders-detail-item__price";
      const priceValue = document.createElement("b");
      priceValue.textContent = item.price || "—";
      const quantity = document.createElement("small");
      quantity.textContent = `Qty ${item.quantity}`;
      price.append(priceValue, quantity);
      row.append(copy, price);
      detailItems.append(row);
    });
  };

  const setDetailText = (element, value) => {
    if (element) element.textContent = value || "—";
  };

  const getPricingLabel = (label) => {
    const value = normalize(label).replace(/내역/g, "").trim();
    if (/grand total|order total|최종.*결제|총.*결제/.test(value)) return "Order Total";
    if (/shipping coupon|배송비쿠폰/.test(value)) return "Shipping Coupon";
    if (/shipping code|배송비코드/.test(value)) return "Shipping Code Discount";
    if (/promotion.*code|discount code|할인코드|코드할인/.test(value)) {
      return "Promotion Code Discount";
    }
    if (/discount amount|total discount|할인금액|총 할인/.test(value)) return "Total Discount";
    if (/event|이벤트/.test(value)) return "Event Promotion";
    if (/multi|복수구매/.test(value)) return "Multi-buy Discount";
    if (/member|등급/.test(value)) return "Member Discount";
    if (/mobile|모바일/.test(value)) return "Mobile Discount";
    if (/social|좋아요/.test(value)) return "Social Promotion";
    if (/coupon|쿠폰/.test(value)) return "Coupon Discount";
    if (/refer|유입경로/.test(value)) return "Referral Discount";
    if (/enuri|에누리/.test(value)) return "Manual Discount";
    if (/subtotal|상품.*합계|상품금액/.test(value)) return "Subtotal";
    if (/shipping|배송비/.test(value)) return "Shipping";
    if (/miledge|mileage|마일리지/.test(value)) return "Mileage Used";
    if (/cash|예치금/.test(value)) return "Cash Used";
    if (/tax|세금/.test(value)) return "Tax";
    return "";
  };

  const extractPricingRows = (detailPage) => {
    const summaryRows = [];
    const discountRows = [];
    const addRow = (target, rawLabel, rawValue) => {
      const label = getPricingLabel(rawLabel);
      const value = String(rawValue || "").replace(/\s+/g, " ").trim();
      if (!label || !value) return;
      if (target.some((row) => row.label === label && row.value === value)) return;
      target.push({ label, value });
    };

    const summaryHeading = Array.from(detailPage.querySelectorAll("h3.title_container")).find(
      (heading) => normalize(heading.textContent).includes("order summary"),
    );
    const summary = summaryHeading?.nextElementSibling;
    summary?.querySelectorAll(":scope > ul").forEach((row) => {
      addRow(summaryRows, row.querySelector(".th")?.textContent, row.querySelector(".td")?.textContent);
    });

    detailPage.querySelectorAll("#saleDetailList .table_row_a tr").forEach((row) => {
      addRow(discountRows, row.querySelector("th")?.textContent, row.querySelector("td")?.textContent);
    });

    const discountIndex = summaryRows.findIndex((row) => row.label === "Total Discount");
    if (discountIndex >= 0) summaryRows.splice(discountIndex + 1, 0, ...discountRows);
    else {
      const shippingIndex = summaryRows.findIndex((row) => row.label === "Shipping");
      summaryRows.splice(shippingIndex >= 0 ? shippingIndex : summaryRows.length, 0, ...discountRows);
    }
    return summaryRows;
  };

  const renderDetailPricing = (rows, fallbackTotal = "") => {
    if (!detailPricing) return;
    const pricingRows = rows.length
      ? [...rows]
      : [{ label: "Order Total", value: fallbackTotal || "—" }];
    if (!pricingRows.some((row) => row.label === "Tax")) {
      const totalIndex = pricingRows.findIndex((row) => row.label === "Order Total");
      const taxRow = { label: "Tax", value: "Not separately itemized", isMuted: true };
      if (totalIndex >= 0) pricingRows.splice(totalIndex, 0, taxRow);
      else pricingRows.push(taxRow);
    }

    detailPricing.replaceChildren();
    pricingRows.forEach((row) => {
      const line = document.createElement("div");
      if (row.label === "Order Total") line.classList.add("is-total");
      if (/discount|promotion|coupon|mileage|cash/i.test(row.label)) {
        line.classList.add("is-discount");
      }
      if (row.label === "Shipping") line.classList.add("is-shipping");
      if (row.label === "Tax") line.classList.add("is-tax");
      const label = document.createElement("dt");
      label.textContent = row.label;
      const value = document.createElement("dd");
      if (row.label === "Order Total") {
        const usdValue = String(row.value || "").match(
          /(?:US\$|\$)\s*[\d,.]+|[\d,.]+\s*USD/i,
        );
        value.textContent = usdValue ? usdValue[0].replace(/\s+/g, "") : row.value;
      } else {
        value.textContent = row.value;
      }
      if (row.isMuted) value.classList.add("is-muted");
      line.append(label, value);
      detailPricing.append(line);
    });
  };

  const closeDetailModal = () => {
    if (!detailModal || detailModal.hidden) return;
    detailModal.hidden = true;
    detailModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-orders-detail-open");
    detailCard = null;
    detailTrigger?.focus();
    detailTrigger = null;
  };

  const openDetailModal = async (card, trigger) => {
    if (!detailModal || !detailDialog) return;
    detailCard = card;
    detailTrigger = trigger;

    const detailsUrl = card.dataset.orderDetailsUrl || "";
    const orderNumber = textOf(card, ".orders-card-head h2", "Order");
    const orderTime = textOf(card, ".orders-card-head time", "—");
    const orderStatus = textOf(card, ".orders-card-head mark", "—");
    const orderTotal = textOf(card, ".orders-card-head__aside > strong", "—");
    const shippingAddress = textOf(card, "[data-order-shipping-address] b", "—");

    setDetailText(detailNumber, orderNumber);
    setDetailText(detailTime, orderTime);
    setDetailText(detailStatus, orderStatus);
    setDetailText(detailTotal, orderTotal);
    setDetailText(detailPayment, paymentLabel(card.dataset.orderPayment));
    setDetailText(detailPaymentDate, "—");
    setDetailText(detailRecipient, "—");
    setDetailText(detailAddress, shippingAddress);
    renderDetailItems(readCardItems(card));
    renderDetailPricing([], orderTotal);

    detailModal.hidden = false;
    detailModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-orders-detail-open");
    window.requestAnimationFrame(() => detailDialog.focus());

    const detailPage = await getOrderDetailPage(detailsUrl);
    if (!detailPage || detailCard !== card) return;

    const paymentMethod = extractDetailValue(
      detailPage,
      "Payment Method",
      "Payment Information",
    );
    const { recipient, shippingAddress: address } = readDetailPageAddress(detailPage);
    const paymentHeading = Array.from(detailPage.querySelectorAll("h3.title_container")).find(
      (heading) => normalize(heading.textContent).includes("payment information"),
    );
    const paymentDate = paymentHeading
      ?.querySelector(".order_right_info")
      ?.textContent.replace(/payment date/i, "")
      .replace(/\s+/g, " ")
      .trim();

    setDetailText(detailPayment, paymentMethod || paymentLabel(card.dataset.orderPayment));
    setDetailText(detailPaymentDate, paymentDate);
    setDetailText(detailRecipient, recipient);
    setDetailText(detailAddress, address || shippingAddress);
    if (address) applyShippingAddress(card, recipient, address);
    renderDetailPricing(extractPricingRows(detailPage), orderTotal);
    if (paymentDate) setDetailText(detailTime, paymentDate);
  };

  page.addEventListener("click", (event) => {
    const link = event.target.closest(".order-details-link");
    if (!link || !page.contains(link)) return;
    if (link.hasAttribute("data-orders-native-detail")) return;
    const card = link.closest(".bo-order-card");
    if (!card) return;
    event.preventDefault();
    openDetailModal(card, link);
  });

  detailModal?.addEventListener("click", (event) => {
    if (event.target.closest("[data-orders-detail-close]")) closeDetailModal();
  });

  const trackModal = document.querySelector("[data-orders-page-track-modal]");
  const trackDialog = trackModal?.querySelector(".orders-track-dialog");
  const trackPrimary = trackModal?.querySelector("[data-orders-page-track-primary]");
  let trackTrigger = null;
  let nativeTrackAction = null;

  const setTrackText = (selector, value) => {
    const target = trackModal?.querySelector(selector);
    if (target) target.textContent = value || "";
  };

  const getTrackStage = (step) => {
    if (step >= 75) return 3;
    if (step >= 60) return 2;
    if (step >= 50) return 1;
    return 0;
  };

  const closeTrackModal = () => {
    if (!trackModal || trackModal.hidden) return;
    trackModal.hidden = true;
    trackModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-orders-modal-open");
    nativeTrackAction = null;
    trackTrigger?.focus();
    trackTrigger = null;
  };

  const openTrackModal = (trigger) => {
    const card = trigger.closest(".bo-order-card");
    if (!card || !trackModal || !trackDialog) return;

    const step = Number(card.dataset.orderStep || 0);
    const stage = getTrackStage(step);
    const shippingMethod = card.dataset.orderShippingMethod || "";
    const trackingNumber = card.dataset.orderTrackingNumber || "";
    const image = card.querySelector(":scope > .shipping .goods_thumb");

    trackTrigger = trigger;
    nativeTrackAction = card.querySelector(
      ":scope > .shipping .status .orderexportsbtn:not(.orders-track-button)",
    );
    setTrackText(
      "[data-orders-page-track-order]",
      card.dataset.orderSeq ? `Order #${card.dataset.orderSeq}` : "Order",
    );
    setTrackText("[data-orders-page-track-date]", card.dataset.orderDate);
    setTrackText("[data-orders-page-track-status]", card.dataset.orderState);
    setTrackText("[data-orders-page-track-name]", textOf(card, ".goods_name", "Ordered item"));
    setTrackText("[data-orders-page-track-price]", card.dataset.orderPrice);
    setTrackText(
      "[data-orders-page-track-carrier]",
      shippingMethod === "quick" ? "UPS" : "Korea Post EMS",
    );
    setTrackText("[data-orders-page-track-number]", trackingNumber || "Not provided");
    setTrackText(
      "[data-orders-page-track-estimated]",
      card.dataset.orderEstimatedArrival || "Not provided",
    );
    setTrackText(
      "[data-orders-page-track-address]",
      textOf(card, "[data-order-shipping-address] b", "Not provided"),
    );

    const thumb = trackModal.querySelector("[data-orders-page-track-thumb]");
    if (thumb) {
      const imageUrl = image?.currentSrc || image?.src || "";
      thumb.style.backgroundImage = imageUrl ? `url(${JSON.stringify(imageUrl)})` : "";
    }

    trackModal.querySelectorAll("[data-orders-page-track-step]").forEach((item, index) => {
      item.classList.toggle("is-complete", index < stage);
      item.classList.toggle("is-active", index === stage);
      const state = item.querySelector("em");
      if (state) state.textContent = index < stage ? "Complete" : index === stage ? "Current" : "Pending";
    });

    trackModal.hidden = false;
    trackModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-orders-modal-open");
    window.requestAnimationFrame(() => trackDialog.focus({ preventScroll: true }));
  };

  page.addEventListener("click", (event) => {
    const button = event.target.closest(".orders-track-button");
    if (!button || !page.contains(button)) return;
    event.preventDefault();
    openTrackModal(button);
  });

  trackModal?.querySelectorAll("[data-orders-page-track-close]").forEach((button) => {
    button.addEventListener("click", closeTrackModal);
  });

  trackPrimary?.addEventListener("click", () => {
    if (!nativeTrackAction) return;
    const href = nativeTrackAction.getAttribute("href") || "";
    if (href && !href.toLowerCase().startsWith("javascript:")) {
      window.open(new URL(href, window.location.href).href, "_blank", "noopener,noreferrer");
      return;
    }
    nativeTrackAction.click();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && detailModal && !detailModal.hidden) {
      closeDetailModal();
      return;
    }
    if (event.key === "Escape" && trackModal && !trackModal.hidden) {
      closeTrackModal();
      return;
    }
    if (event.key !== "Tab" || !detailDialog || detailModal?.hidden) return;
    const focusable = Array.from(
      detailDialog.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'),
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const nativeEmpty = page.querySelector("[data-orders-native-empty]");
  syncNativeEmptyState();

  const searchInput = page.querySelector("[data-orders-search]");
  const searchButton = page.querySelector("[data-orders-search-submit]");
  const filterTabs = page.querySelector(".orders-filter-tabs");
  let activeFilter = "all";

  filterTabs?.querySelectorAll("button[data-orders-filter]").forEach((tab) => {
    tab.setAttribute("aria-pressed", String(tab.dataset.ordersFilter === activeFilter));
  });

  const emptyResult = document.createElement("div");
  emptyResult.className = "orders-filter-empty";
  emptyResult.textContent = "No matching orders found.";
  emptyResult.hidden = true;
  page.querySelector(".order_list")?.append(emptyResult);

  const applyFilters = () => {
    const query = normalize(searchInput?.value);
    let visibleCount = 0;

    cards.forEach((card) => {
      const matchesStatus = activeFilter === "all" || getStatus(card) === activeFilter;
      const matchesSearch = !query || normalize(card.textContent).includes(query);
      const isVisible = matchesStatus && matchesSearch;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    const waitingForHistory =
      !historyLoaded && (activeFilter === "all" || activeFilter === "cancel-refund");

    if (visibleCount > 0) {
      emptyResult.hidden = true;
      if (nativeEmpty) {
        nativeEmpty.hidden = true;
        nativeEmpty.classList.add("is-hidden");
      }
      return;
    }

    if (waitingForHistory) {
      emptyResult.hidden = true;
      if (nativeEmpty && cards.length === 0) {
        nativeEmpty.hidden = false;
        nativeEmpty.classList.remove("is-hidden");
      }
      return;
    }

    if (nativeEmpty) {
      nativeEmpty.hidden = true;
      nativeEmpty.classList.add("is-hidden");
    }
    emptyResult.hidden = false;
    emptyResult.textContent =
      activeFilter === "cancel-refund" && !historyLoaded
        ? "Loading cancel and refund history..."
        : "No matching orders found.";
  };

  historyReady.then(applyFilters);

  filterTabs?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-orders-filter]");
    if (!button || !filterTabs.contains(button)) return;

    activeFilter = button.dataset.ordersFilter || "all";
    filterTabs.querySelectorAll("button[data-orders-filter]").forEach((tab) => {
      const isActive = tab === button;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-pressed", String(isActive));
    });
    if (activeFilter === "cancel-refund" && !historyLoaded) {
      if (!historyLoadRequest) {
        emptyResult.textContent = "Loading cancel and refund history...";
        applyFilters();
      }
      await loadCancelRefundHistory();
      emptyResult.textContent = "No matching orders found.";
    }
    applyFilters();
  });

  searchInput?.addEventListener("input", applyFilters);
  searchInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    applyFilters();
  });
  searchButton?.addEventListener("click", () => {
    applyFilters();
    searchInput?.focus();
  });

  const nativeDateSelect = page.querySelector('select[name="sc_date"]');
  const dateSlot = page.querySelector("[data-orders-date-control]");
  const nativeDateRow = nativeDateSelect?.closest(".myorder_sort");

  if (dateSlot && filterTabs) {
    const statusField = document.createElement("label");
    statusField.className = "orders-status-field";
    statusField.innerHTML = '<span class="orders-sr-only">Order status</span>';
    const statusWrap = document.createElement("span");
    statusWrap.className = "orders-select-control realtrend-select-wrap";
    const statusTrigger = document.createElement("button");
    statusTrigger.type = "button";
    statusTrigger.className = "realtrend-select-trigger";
    statusTrigger.setAttribute("aria-haspopup", "listbox");
    statusTrigger.setAttribute("aria-expanded", "false");
    const statusValue = document.createElement("span");
    statusValue.className = "realtrend-select-value";
    statusValue.textContent = "All Statuses";
    const statusMenu = document.createElement("ul");
    statusMenu.className = "realtrend-select-menu";
    statusMenu.setAttribute("role", "listbox");

    filterTabs.querySelectorAll("button[data-orders-filter]").forEach((tab) => {
      const item = document.createElement("li");
      item.dataset.value = tab.dataset.ordersFilter;
      item.textContent = tab.dataset.ordersFilter === "all" ? "All Statuses" : tab.textContent;
      item.setAttribute("role", "option");
      statusMenu.append(item);
    });

    const closeStatusMenu = () => {
      statusWrap.classList.remove("is-open");
      statusTrigger.setAttribute("aria-expanded", "false");
    };
    const syncStatusMenu = () => {
      statusMenu.querySelectorAll("li").forEach((item) => {
        const selected = item.dataset.value === activeFilter;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-selected", String(selected));
        if (selected) statusValue.textContent = item.textContent;
      });
    };

    statusTrigger.append(statusValue);
    statusWrap.append(statusTrigger, statusMenu);
    statusField.append(statusWrap);
    dateSlot.prepend(statusField);

    statusTrigger.addEventListener("click", () => {
      const willOpen = !statusWrap.classList.contains("is-open");
      statusWrap.classList.toggle("is-open", willOpen);
      statusTrigger.setAttribute("aria-expanded", String(willOpen));
    });
    statusMenu.addEventListener("click", (event) => {
      const item = event.target.closest("li[data-value]");
      if (!item) return;
      filterTabs.querySelector(`button[data-orders-filter="${item.dataset.value}"]`)?.click();
      syncStatusMenu();
      closeStatusMenu();
      statusTrigger.focus();
    });
    filterTabs.addEventListener("click", () => window.setTimeout(syncStatusMenu, 0));
    document.addEventListener("pointerdown", (event) => {
      if (!statusWrap.contains(event.target)) closeStatusMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && statusWrap.classList.contains("is-open")) {
        closeStatusMenu();
        statusTrigger.focus();
      }
    });
    syncStatusMenu();
  }

  if (nativeDateSelect && dateSlot && nativeDateRow) {
    const field = document.createElement("label");
    field.className = "orders-date-field";
    const label = document.createElement("span");
    label.className = "orders-sr-only";
    label.textContent = "Order period";
    const wrap = document.createElement("span");
    wrap.className = "orders-select-control realtrend-select-wrap";
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "realtrend-select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    const value = document.createElement("span");
    value.className = "realtrend-select-value";
    const menu = document.createElement("ul");
    menu.className = "realtrend-select-menu";
    menu.setAttribute("role", "listbox");

    nativeDateSelect.classList.add("realtrend-select-native");
    nativeDateSelect.tabIndex = -1;
    nativeDateSelect.setAttribute("aria-hidden", "true");

    const close = () => {
      wrap.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    };
    const sync = () => {
      const selected = nativeDateSelect.options[nativeDateSelect.selectedIndex];
      value.textContent = selected?.textContent || "All";
      menu.querySelectorAll("li").forEach((item) => {
        const isSelected = item.dataset.value === nativeDateSelect.value;
        item.classList.toggle("is-selected", isSelected);
        item.setAttribute("aria-selected", String(isSelected));
      });
    };

    Array.from(nativeDateSelect.options).forEach((option) => {
      const item = document.createElement("li");
      item.dataset.value = option.value;
      item.textContent = option.textContent;
      item.setAttribute("role", "option");
      menu.append(item);
    });

    trigger.append(value);
    wrap.append(trigger, menu, nativeDateSelect);
    field.append(label, wrap);
    dateSlot.append(field, nativeDateRow);

    trigger.addEventListener("click", () => {
      const willOpen = !wrap.classList.contains("is-open");
      wrap.classList.toggle("is-open", willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));
    });
    menu.addEventListener("click", (event) => {
      const item = event.target.closest("li[data-value]");
      if (!item) return;
      nativeDateSelect.value = item.dataset.value;
      sync();
      close();
      nativeDateSelect.dispatchEvent(new Event("change", { bubbles: true }));
      trigger.focus();
    });
    document.addEventListener("pointerdown", (event) => {
      if (!wrap.contains(event.target)) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && wrap.classList.contains("is-open")) {
        close();
        trigger.focus();
      }
    });
    sync();
  }

  applyFilters();
})();
