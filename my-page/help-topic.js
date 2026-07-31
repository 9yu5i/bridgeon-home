(() => {
  const topics = window.TrendyPicker?.helpTopics || {};
  const params = new URLSearchParams(window.location.search);
  const topicKey = topics[params.get("topic")] ? params.get("topic") : "notice";
  const topic = topics[topicKey];

  document.title = `${topic.title} | Help Center | TrendyPicker`;
  document.querySelector("[data-help-category]").textContent = topic.category;
  document.querySelector("[data-help-kicker]").textContent = topic.category;
  document.querySelector("[data-help-title]").textContent = topic.title;
  document.querySelector("[data-help-summary]").textContent = topic.summary;
  document.querySelector("[data-help-meta]").textContent = topic.meta;
  document.querySelector("[data-help-body]").innerHTML = topic.body;

  document.querySelectorAll("[data-topic-link]").forEach((link) => {
    const isActive = link.dataset.topicLink === topicKey;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const board = document.querySelector(".help-board");
  if (board) {
    const form = board.querySelector("[data-help-board-form]");
    const categorySelect = board.querySelector("[data-help-board-category]");
    const queryInput = board.querySelector("[data-help-board-query]");
    const list = board.querySelector("[data-help-board-list]");
    const count = board.querySelector("[data-help-board-count]");
    const empty = board.querySelector("[data-help-board-empty]");
    const rows = Array.from(list.querySelectorAll(".help-board-row"));

    const applyBoardFilter = () => {
      const category = categorySelect.value;
      const query = queryInput.value.trim().toLowerCase();
      let visible = 0;

      rows.forEach((row) => {
        const rowCategory = row.dataset.category || "";
        const rowTitle = (row.dataset.title || row.textContent || "").toLowerCase();
        const categoryMatch = category === "all" || rowCategory === category;
        const queryMatch = !query || rowTitle.includes(query);
        const show = categoryMatch && queryMatch;
        row.hidden = !show;
        if (show) visible += 1;
      });

      count.textContent = `Total ${visible} (Page 1 / 1)`;
      empty.hidden = visible !== 0;
      list.hidden = visible === 0;
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      applyBoardFilter();
    });

    form.addEventListener("reset", () => {
      window.setTimeout(applyBoardFilter, 0);
    });

    categorySelect.addEventListener("change", applyBoardFilter);
    rows.forEach((row) => {
      row.addEventListener("click", (event) => {
        event.preventDefault();
      });
    });
  }

  const faq = document.querySelector("[data-help-faq]");
  if (faq) {
    const categorySelect = faq.querySelector("[data-faq-category]");
    const items = Array.from(faq.querySelectorAll(".help-faq-item"));
    const list = faq.querySelector("[data-faq-list]");
    const empty = faq.querySelector("[data-faq-empty]");
    const form = faq.querySelector("[data-faq-search-form]");
    const queryInput = faq.querySelector("[data-faq-query]");

    const applyFaqFilter = () => {
      const category = categorySelect.value;
      const query = queryInput.value.trim().toLowerCase();
      let visible = 0;

      items.forEach((item) => {
        const itemCategory = item.dataset.category || "";
        const haystack = [
          item.dataset.title || "",
          itemCategory,
          item.textContent || ""
        ].join(" ").toLowerCase();
        const categoryMatch = category === "all" || itemCategory === category;
        const queryMatch = !query || haystack.includes(query);
        const show = categoryMatch && queryMatch;
        item.hidden = !show;
        if (!show) item.open = false;
        if (show) visible += 1;
      });

      empty.hidden = visible !== 0;
      list.hidden = visible === 0;
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      applyFaqFilter();
    });

    categorySelect.addEventListener("change", applyFaqFilter);

    const requestedCategory = params.get("category");
    const hasRequestedCategory = Array.from(categorySelect.options).some(
      (option) => option.value === requestedCategory
    );
    if (requestedCategory && hasRequestedCategory) {
      categorySelect.value = requestedCategory;
    }

    applyFaqFilter();
  }
})();
