(() => {
const sellerRail = document.getElementById("seller-rail");
const sellerWishlistQuery = window.matchMedia("(max-width: 1120px)");
const sellerWishlistIcons = {
  desktop: "img/main-img/heart2.png",
  dark: "img/mobile-icon/menu/wishlist.png",
  light: "img/mobile-icon/menu/wishlist2.png",
  active: "img/mobile-icon/menu/wishlist-hover.png",
};

const getSellerRank = (card) => {
  if (!card) return 0;
  const rankNode = Array.from(card.children).find((child) => child.tagName === "B");
  return Number(rankNode?.textContent.trim() || 0);
};

const getSellerWishlistDefaultIcon = (card) => {
  if (!sellerWishlistQuery.matches) return sellerWishlistIcons.desktop;
  return getSellerRank(card) <= 3 ? sellerWishlistIcons.light : sellerWishlistIcons.dark;
};

const updateSellerWishlistIcons = () => {
  sellerRail?.querySelectorAll(".product-card").forEach((card) => {
    const rank = getSellerRank(card);
    const button =
      card.querySelector('.card-actions button[aria-label="Wishlist"]')
      || card.querySelector('.card-actions button[aria-label="Add to wishlist"]')
      || card.querySelector('.card-actions button[aria-label="Remove from wishlist"]')
      || card.querySelector(".card-actions button:last-child");
    const icon = button?.querySelector("img");
    if (!rank || !button || !icon) return;

    const isActive = button.classList.contains("is-active") || button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
    icon.src = isActive ? sellerWishlistIcons.active : getSellerWishlistDefaultIcon(card);
  });
};

document.addEventListener("click", (event) => {
  if (window.BridgeOn?.wishlist?.toggle) return;

  const button = event.target.closest?.('.seller-section .card-actions button:last-child');
  if (!button || !sellerRail || !sellerRail.contains(button)) return;

  event.preventDefault();
  event.stopPropagation();

  const card = button.closest(".product-card");
  const isActive = !button.classList.contains("is-active");
  button.classList.toggle("is-active", isActive);
  button.setAttribute("aria-pressed", isActive ? "true" : "false");
  button.setAttribute("aria-label", isActive ? "Remove from wishlist" : "Add to wishlist");

  const icon = button.querySelector("img");
  if (icon) {
    icon.src = isActive
      ? sellerWishlistIcons.active
      : getSellerWishlistDefaultIcon(card);
  }

  updateSellerWishlistIcons();
}, true);

const syncSellerWishlistIcons = () => {
  if (sellerRail) window.BridgeOn?.wishlist?.syncButtons?.(sellerRail);
  updateSellerWishlistIcons();
};

sellerWishlistQuery.addEventListener?.("change", syncSellerWishlistIcons);
window.addEventListener("resize", syncSellerWishlistIcons);
window.addEventListener("bridgeon:wishlistchange", updateSellerWishlistIcons);
sellerRail?.addEventListener("bridgeon:railfilterchange", syncSellerWishlistIcons);
syncSellerWishlistIcons();
})();
