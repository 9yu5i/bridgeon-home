(() => {
  const navigateWithPageTransition = window.BridgeOn?.navigateWithPageTransition || ((href) => {
    window.location.href = href;
  });
  const magazineDetailUrl = new URL(
    "../../editors-pick/magazine-detail.html",
    document.currentScript?.src || window.location.href,
  );
  const homeMagazineSlugs = ["korean-sunscreens", "editor-beauty-cart", "korean-summer-snacks"];
  const editorMagazineSlugs = ["summer-fruit-desserts", "rescene-kpop-style", "bts-anniversary-busan"];
  const cardSelector = ".magazine-card, .editor-magazine-card";

  const createMagazineSlug = (value, fallback = "magazine-story") =>
    String(value || fallback)
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback;

  const getMagazineSlug = (card, index = 0) => {
    if (card.dataset.magazineSlug) return card.dataset.magazineSlug;

    const cardList = Array.from(card.parentElement?.querySelectorAll(cardSelector) || []);
    const cardIndex = cardList.includes(card) ? cardList.indexOf(card) : index;

    if (card.closest(".magazine-grid")) return homeMagazineSlugs[cardIndex] || `home-magazine-${cardIndex + 1}`;
    if (card.closest(".editor-magazine-grid")) {
      return editorMagazineSlugs[cardIndex] || `editor-magazine-${cardIndex + 1}`;
    }

    return createMagazineSlug(card.querySelector("h3")?.textContent, `magazine-story-${cardIndex + 1}`);
  };

  const getMagazineDetailHref = (card) => {
    const detailUrl = new URL(magazineDetailUrl.href);
    detailUrl.searchParams.set("article", getMagazineSlug(card));
    return detailUrl.href;
  };

  document.querySelectorAll(cardSelector).forEach((card, index) => {
    card.dataset.magazineSlug = getMagazineSlug(card, index);
    if (!card.hasAttribute("tabindex")) card.tabIndex = 0;
    card.setAttribute("role", "link");
  });

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented) return;
    if (event.target.closest("a, button, input, select, textarea, label")) return;

    const card = event.target.closest(cardSelector);
    if (!card) return;

    event.preventDefault();
    navigateWithPageTransition(getMagazineDetailHref(card));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(cardSelector);
    if (!card) return;

    event.preventDefault();
    navigateWithPageTransition(getMagazineDetailHref(card));
  });
})();
