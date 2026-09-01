/**
 * TrendyPicker Best Sellers
 * /goods/best → goods/best.html
 *
 * 1. Wait for Firstmall to inject #searchedItemDisplay > ul
 * 2. Rank badges on listing cards
 * 3. Infinite scroll via /goods/search_list (not /goods/best?page=)
 */
(() => {
  const page = document.body;
  if (!page || !page.classList.contains("is-best-page")) return;

  const grid = document.querySelector(".bo-best-grid[data-displaytype='lattice']");
  if (!grid) return;

  /*
    #searchedItemDisplay starts empty in the template — Firstmall injects the
    <ul><li> product list asynchronously after this script has already run.
    Wait for that <ul> to actually show up instead of assuming it's there.
  */
  function whenListReady(onReady) {
    const existing = grid.querySelector(":scope > ul");
    if (existing) {
      onReady(existing);
      return;
    }
    const observer = new MutationObserver(() => {
      const list = grid.querySelector(":scope > ul");
      if (list) {
        observer.disconnect();
        onReady(list);
      }
    });
    observer.observe(grid, { childList: true });
  }

  /*
    get_currency_price() renders the amount as
    "<span class="num">18.40</span>USD" — the trailing "USD" is a text node
    CSS cannot reach, and the "US$" prefix is missing, so the grid reads
    "US 18.40USD". Normalise both. Runs after every page append because the
    infinite scroll brings in fresh, unprocessed markup.
  */
  function normalizeListingPrices(root) {
    if (!root) return;
    root
      /* Broad on purpose: BEST cards come from whichever list skin the
         Firstmall admin selects, so .item_info_area / .goods_price_area are
         not guaranteed to be present. */
      .querySelectorAll(".sale_price, .consumer_price")
      .forEach((el) => {
        el.childNodes.forEach((node) => {
          if (node.nodeType !== 3) return;
          if (!/US/i.test(node.nodeValue)) return;
          /* Strips "US$", "USD" and a bare "US" prefix — the markup already
             carries one, so adding US$ blindly produced "US US$389.70". */
          node.nodeValue = node.nodeValue.replace(/US\$|USD|US/gi, "").trim();
        });

        if (/US\$/.test(el.textContent || "")) return;
        const num = el.querySelector(".num");
        if (!num || !num.parentNode) return;
        num.parentNode.insertBefore(document.createTextNode("US$"), num);
      });
  }

  function init(list) {
    let currentPage = Number(new URL(window.location.href).searchParams.get("page")) || 1;
    let totalPages = null;
    let loading = false;
    let done = false;

    function readTotalPages(doc) {
      const links = doc.querySelectorAll(".paging_navigation a");
      let max = currentPage;
      links.forEach((a) => {
        const href = a.getAttribute("href") || "";
        const match = href.match(/goodsSearchPage\((\d+)\)/);
        if (match) max = Math.max(max, Number(match[1]));
        const text = (a.textContent || "").trim();
        if (/^\d+$/.test(text)) max = Math.max(max, Number(text));
      });
      return max;
    }

    function applyRanks() {
      const items = list.querySelectorAll(":scope > li");
      items.forEach((li, index) => {
        const media = li.querySelector(".listing-card-media, .item_img_area");
        if (!media || media.querySelector(".bo-best-rank")) return;
        const rank = index + 1;
        const badge = document.createElement("span");
        badge.className = "bo-best-rank" + (rank <= 3 ? " bo-best-rank--top" : "");
        badge.textContent = String(rank);
        media.appendChild(badge);
      });
    }

    /*
      #searchedItemDisplay is never server-rendered with the list inside —
      even the first 40 items come from Firstmall's own client-side call to
      /goods/search_list (visible in the network panel), not from the page's
      own HTML. Fetching /goods/best?page=N directly always returns an empty
      list. Call the same /goods/search_list endpoint Firstmall's own JS uses
      to get real item HTML for subsequent pages.
    */
    function fetchPage(pageNumber) {
      const url = new URL(window.location.href);
      url.pathname = url.pathname.replace(/\/best\/?$/, "/search_list");
      url.searchParams.set("page", String(pageNumber));
      url.searchParams.set("auto", "1");
      return fetch(url.toString(), { credentials: "same-origin" })
        .then((response) => (response.ok ? response.text() : ""))
        .then((html) => (html ? new DOMParser().parseFromString(html, "text/html") : null))
        .catch(() => null);
    }

    function loadNext() {
      if (loading || done) return;
      loading = true;
      const next = currentPage + 1;

      fetchPage(next).then((doc) => {
        loading = false;
        if (!doc) {
          done = true;
          return;
        }
        if (totalPages === null) totalPages = readTotalPages(doc);

        const newItems = doc.querySelectorAll("ul > li");
        if (!newItems.length) {
          done = true;
          return;
        }

        newItems.forEach((li) => list.appendChild(document.importNode(li, true)));
        currentPage = next;
        applyRanks();
        normalizeListingPrices(list);

        if (totalPages !== null && currentPage >= totalPages) done = true;
      });
    }

    applyRanks();
    normalizeListingPrices(list);

    const sentinel = document.createElement("div");
    sentinel.className = "bo-best-sentinel";
    sentinel.setAttribute("aria-hidden", "true");
    grid.insertAdjacentElement("afterend", sentinel);

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) loadNext();
          });
        },
        { rootMargin: "0px 0px 600px 0px" }
      );
      observer.observe(sentinel);
    }
  }

  whenListReady(init);
})();
