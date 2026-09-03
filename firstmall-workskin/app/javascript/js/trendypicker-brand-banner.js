/**
 * TrendyPicker shared brand-banner resolver
 *
 * The brand detail hero (goods/brand.html) and the New Arrivals brand banners
 * (goods/new_arrivals.html via trendypicker-new.js) must show the SAME image
 * for a given brand. Both read the raw Firstmall "img.banner" src first, then
 * fall back to a curated per-brand image. Keeping that mapping here (one place)
 * stops the two pages from drifting apart when a brand is added.
 *
 * window.tpResolveBrandBanner(brandCode, rawBannerSrc) -> resolved src string
 *   - rawBannerSrc: the src of the brand's own "img.banner" (may be empty or the
 *     default beauty placeholder).
 *   - Returns the curated image when the brand has no real banner (or is marked
 *     force), otherwise returns rawBannerSrc unchanged.
 */
(function (w) {
  // Skin image base (hardcoded like trendypicker-deals.js: external JS files are
  // not template-processed, so the {skin} token would not be substituted here).
  var BRAND_IMG = "/data/skin/responsive_food_mealkit_gl/images/brand/";

  // code -> filename.
  //   string          : use only when the brand falls back to the default banner
  //   { file, force } : force:true overrides even a real brand banner
  var BRAND_BANNERS = {
    "0071": "abib-brand.png",
    "0633": "abouttone-brand.png",
    "0014": "aestura-brand.png",
    "0010": "ahc-brand-desktop.png",
    "0033": "alternative-stereo-brand-desktop.png",
    "0034": "anua-brand-desktop.png",
    "0122": "amuse-brand-desktop.png",
    "0125": "anillo-brand-desktop.png",
    "0129": "aplb-brand-desktop.png",
    "0131": "aprilskin-brand-desktop.png",
    "0132": "arencia-brand-desktop.png",
    "0136": "aromatica-brand-desktop.png",
    "0143": "atopalm-brand-desktop.png",
    "0145": "axis-y-brand-desktop.png",
    "0147": "b-lab-brand-desktop.png",
    "0150": "banila-co-brand-desktop.png",
    "0157": "bbia-brand-desktop.png",
    "0164": "belif-brand-desktop.png",
    "0607": "bb-lab-brand-desktop.png",
    "0627": "athe-brand-desktop.png",
    "0635": "aou-brand-desktop-v2.png",
    "0006": { file: "beauty-of-joseon-brand-desktop.png", force: true },
    "0632": { file: "beaund-brand-desktop.png", force: true },
    "0169": { file: "beplain-brand-desktop.png", force: true },
    "0190": { file: "brmud-brand-desktop.png", force: true },
    "0179": { file: "biodance-brand-desktop.png", force: true },
    "0630": { file: "bioheal-boh-brand-desktop.png", force: true },
    "0182": { file: "blithe-brand-desktop.png", force: true },
    "0198": { file: "celimax-brand-desktop.png", force: true },
    "0199": { file: "cell-fusion-c-brand-desktop.png", force: true },
    "0204": { file: "centellian24-brand-desktop.png", force: true }
  };

  function usesDefaultBanner(rawBannerSrc) {
    return (
      !rawBannerSrc ||
      /default_beauty_brand_banner\.png(?:$|[?#])/i.test(rawBannerSrc)
    );
  }

  function resolveBrandBanner(brandCode, rawBannerSrc) {
    var entry = brandCode && BRAND_BANNERS[brandCode];
    if (entry) {
      var force = typeof entry === "object" && entry.force;
      var file = typeof entry === "object" ? entry.file : entry;
      if (force || usesDefaultBanner(rawBannerSrc)) {
        return BRAND_IMG + file;
      }
    }
    return rawBannerSrc || "";
  }

  w.tpResolveBrandBanner = resolveBrandBanner;
  w.tpBrandBannerUsesDefault = usesDefaultBanner;
})(window);
