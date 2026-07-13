(() => {
const sellerRail = document.getElementById("seller-rail");
const sellerWishlistQuery = window.matchMedia("(max-width: 1120px)");
const sellerWishlistActiveRanks = new Set();
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
    const button = card.querySelector('.card-actions button[aria-label="Wishlist"]');
    const icon = button?.querySelector("img");
    if (!rank || !button || !icon) return;

    const isActive = sellerWishlistActiveRanks.has(rank);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
    icon.src = isActive ? sellerWishlistIcons.active : getSellerWishlistDefaultIcon(card);
  });
};

document.addEventListener("click", (event) => {
  const button = event.target.closest?.('.seller-section .card-actions button[aria-label="Wishlist"]');
  if (!button || !sellerRail || !sellerRail.contains(button)) return;

  event.preventDefault();
  event.stopPropagation();

  const card = button.closest(".product-card");
  const rank = getSellerRank(card);
  if (!rank) return;

  if (sellerWishlistActiveRanks.has(rank)) sellerWishlistActiveRanks.delete(rank);
  else sellerWishlistActiveRanks.add(rank);

  const icon = button.querySelector("img");
  if (icon) {
    icon.src = sellerWishlistActiveRanks.has(rank)
      ? sellerWishlistIcons.active
      : getSellerWishlistDefaultIcon(card);
  }

  updateSellerWishlistIcons();
}, true);

sellerWishlistQuery.addEventListener?.("change", updateSellerWishlistIcons);
window.addEventListener("resize", updateSellerWishlistIcons);
updateSellerWishlistIcons();
})();
