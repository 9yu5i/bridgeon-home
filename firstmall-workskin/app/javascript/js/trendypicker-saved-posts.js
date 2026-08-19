(function () {
  "use strict";

  const root = document.querySelector(".bo-saved-posts-page");
  if (!root) return;

  const grid = root.querySelector("[data-saved-posts-grid]");
  const countLabel = root.querySelector("[data-saved-posts-count]");
  const status = root.querySelector("[data-saved-posts-status]");

  const setStatus = (message) => {
    if (status) status.textContent = message;
  };

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
        if (count === 0) renderEmptyState();
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

})();
