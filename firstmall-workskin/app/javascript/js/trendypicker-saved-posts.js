(function () {
  "use strict";

  const root = document.querySelector(".bo-saved-posts-page");
  if (!root) return;

  const grid = root.querySelector("[data-saved-posts-grid]");
  const countLabel = root.querySelector("[data-saved-posts-count]");
  const status = root.querySelector("[data-saved-posts-status]");
  const tabs = root.querySelector("[data-saved-posts-tabs]");
  const filterButtons = [...root.querySelectorAll("[data-saved-posts-filter]")];
  let activeFilter = "all";

  const setStatus = (message) => {
    if (status) status.textContent = message;
  };


  const normalizeCategory = (value) => {
    const text = String(value || "").trim().toLowerCase();
    if (!text) return "";
    if (/^(beauty|k-beauty)$/.test(text)) return "beauty";
    if (/^(k-food|kfood|food)$/.test(text)) return "k-food";
    if (/^(lifestyle|life-style|living)$/.test(text)) return "lifestyle";
    if (/^(k-pop|kpop)$/.test(text)) return "k-pop";
    if (/^(k-traditional|ktraditional|traditional)$/.test(text)) return "k-traditional";
    return "";
  };

  // Firstmall's current Saved Posts `record` does not expose a verified,
  // stable category field in this template. If the backend later supplies one
  // as a data attribute it wins; otherwise this restores the former client-side
  // title classification used by the category tabs.
  const inferCategoryFromText = (value) => {
    const text = String(value || "").toLowerCase();

    if (
      /k-?\s*traditional|traditional|heritage|hanbok|tea\s*ceremony|전통|한복|도자기|공예/.test(text)
    ) {
      return "k-traditional";
    }

    if (
      /k-?\s*pop|kpop|idol|photocard|photo\s*card|album|light\s*stick|merch|응원봉|아이돌|앨범/.test(text)
    ) {
      return "k-pop";
    }

    if (
      /k-?\s*food|\bfood\b|buldak|ramen|ramyeon|tteokbokki|kimchi|snack|grocery|sauce|rice|noodle|meal|식품|라면|김치|간식|떡볶이/.test(text)
    ) {
      return "k-food";
    }

    if (
      /lifestyle|home\s*living|\bliving\b|home\s*decor|stationery|kitchen|interior|tableware|라이프|리빙|생활|문구|주방/.test(text)
    ) {
      return "lifestyle";
    }

    if (
      /k-?\s*beauty|\bbeauty\b|glass\s*skin|skincare|skin\s*care|cosmetic|makeup|serum|ampoule|toner|toner\s*pad|cream|cleanser|sunscreen|sun\s*cream|lip|tint|ceramide|hyaluron|pore|mask|hair\s*care|body\s*care|fragrance|뷰티|스킨케어|화장품/.test(text)
    ) {
      return "beauty";
    }

    return "";
  };

  const getCardCategory = (card) => {
    const explicit = normalizeCategory(
      card.dataset.savedPostCategory ||
        card.dataset.category ||
        card.getAttribute("data-shortform-category"),
    );
    if (explicit) return explicit;

    return inferCategoryFromText(
      card.querySelector(".bo-saved-post-card__copy b")?.textContent || "",
    );
  };

  const ensureFilterEmptyState = () => {
    let empty = root.querySelector("[data-saved-posts-filter-empty]");
    if (empty) return empty;

    empty = document.createElement("div");
    empty.className = "bo-saved-posts-filter-empty";
    empty.dataset.savedPostsFilterEmpty = "";
    empty.hidden = true;
    empty.textContent = "No saved posts in this category.";
    grid?.insertAdjacentElement("afterend", empty);
    return empty;
  };

  const applyFilter = (filter = activeFilter) => {
    activeFilter = filter;
    const cards = [...root.querySelectorAll("[data-saved-post-card]")];
    let visibleCount = 0;

    cards.forEach((card) => {
      const category = getCardCategory(card);
      const visible = filter === "all" || category === filter;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    filterButtons.forEach((button) => {
      const active = button.dataset.savedPostsFilter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const empty = ensureFilterEmptyState();
    empty.hidden = filter === "all" || visibleCount > 0 || cards.length === 0;

    return visibleCount;
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyFilter(button.dataset.savedPostsFilter || "all");
    });
  });

  const updateCount = () => {
    const count = root.querySelectorAll("[data-saved-post-card]").length;
    if (countLabel) countLabel.textContent = `${count} ${count === 1 ? "reel" : "reels"}`;
    return count;
  };

  const renderEmptyState = () => {
    const empty = document.createElement("div");
    empty.className = "bo-saved-posts-empty";
    empty.dataset.savedPostsEmpty = "";

    const copy = document.createElement("p");
    copy.textContent = "No saved Real Trend posts yet.";

    empty.append(copy);
    grid?.replaceWith(empty);
    root.querySelector("[data-saved-posts-pagination]")?.remove();
  };

  const removeSavedPost = async (button) => {
    const shortformSeq = button.dataset.shortformSeq;
    const card = button.closest("[data-saved-post-card]");
    if (!shortformSeq || !card || button.disabled) return;

    button.disabled = true;
    setStatus("Removing saved reel…");

    try {
      const response = await fetch("/shortform/toggle_save", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: new URLSearchParams({ shortform_seq: shortformSeq }),
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      const result = await response.json().catch(() => null);
      if (!result) throw new Error("The server returned an invalid response.");
      if (!result.success) {
        if (result.need_login) {
          const returnUrl = `${window.location.pathname}${window.location.search}`;
          window.location.href = `/member/login?return_url=${encodeURIComponent(returnUrl)}`;
          return;
        }
        throw new Error(result.message || "Unable to update saved posts.");
      }

      if (result.saved) {
        button.disabled = false;
        setStatus("This reel is still saved.");
        return;
      }

      card.classList.add("is-removing");
      window.setTimeout(() => {
        card.remove();
        const count = updateCount();
        if (count === 0) {
          renderEmptyState();
          return;
        }
        applyFilter(activeFilter);
      }, 200);
      setStatus("Removed from your saved posts.");
    } catch (error) {
      button.disabled = false;
      setStatus(error.message || "Failed to update saved posts.");
    }
  };

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-saved-post-remove]");
    if (!button || !root.contains(button)) return;
    event.preventDefault();
    event.stopPropagation();
    removeSavedPost(button);
  });

  if (tabs && filterButtons.length) applyFilter("all");
})();
