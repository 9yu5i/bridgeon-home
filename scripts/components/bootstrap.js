(() => {
  const rootUrl = new URL("../../", document.currentScript?.src || window.location.href);
  const components = [
    "header-navigation.js",
    "magazine-links.js",
    "scroll-reveal.js",
    "loop-rail.js",
    "deal-sliders.js",
    "hero-slider.js",
    "today-pick-panel.js",
    "section-tabs.js",
    "editor-card-slider.js",
    "magazine-slider.js",
    "support-footer.js",
    "trend-card-links.js",
  ];

  components.forEach((name) => {
    const script = document.createElement("script");
    script.async = false;
    script.src = new URL(`scripts/components/${name}`, rootUrl).href;
    document.head.append(script);
  });
})();
