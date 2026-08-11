/**
 * TrendyPicker category catalog
 * - Page: /goods/catalog
 * - Custom sort dropdown + wish icons for listing-card and goodsZzimBtn
 */
(function () {
	"use strict";

	var HERO = {
		beauty: { kicker: "Glow. Everyday.", title: "K-Beauty", theme: "beauty" },
		lifestyle: { kicker: "Daily Finds", title: "Lifestyle", theme: "lifestyle" },
		"k-food": { kicker: "Taste Korea", title: "K-Food", theme: "k-food" },
		kfood: { kicker: "Taste Korea", title: "K-Food", theme: "k-food" },
		"k-pop": { kicker: "Fan Favorites", title: "K-POP", theme: "k-pop" },
		kpop: { kicker: "Fan Favorites", title: "K-POP", theme: "k-pop" },
		"k-traditional": { kicker: "K-Heritage", title: "K-Traditional", theme: "k-traditional" }
	};

	function ready(fn) {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", fn);
		} else {
			fn();
		}
	}

	function skinBase() {
		var links = document.querySelectorAll('link[href*="/data/skin/"]');
		var i;
		for (i = 0; i < links.length; i += 1) {
			var match = String(links[i].getAttribute("href") || "").match(
				/\/data\/skin\/[^/?#]+/
			);
			if (match) return match[0];
		}
		return "";
	}

	function applyHero() {
		var page = document.getElementById("catalog_page");
		if (!page) return;
		var raw = String(page.getAttribute("data-category-title") || "").toLowerCase();
		var key = raw.replace(/\s+/g, "-");
		var conf = HERO[key] || HERO[raw] || null;
		if (!conf) {
			if (raw.indexOf("beauty") !== -1) conf = HERO.beauty;
			else if (raw.indexOf("life") !== -1) conf = HERO.lifestyle;
			else if (raw.indexOf("food") !== -1) conf = HERO["k-food"];
			else if (raw.indexOf("pop") !== -1) conf = HERO["k-pop"];
			else if (raw.indexOf("trad") !== -1) conf = HERO["k-traditional"];
		}
		if (!conf) return;
		page.setAttribute("data-catalog-theme", conf.theme);
		var kicker = page.querySelector("[data-catalog-kicker]");
		var title = page.querySelector(".bo-catalog-hero-title");
		if (kicker) kicker.textContent = conf.kicker;
		if (title && conf.title) title.textContent = conf.title;
	}

	function enhanceSortSelect() {
		var nativeSelect = document.querySelector("#catalog_page #catalog_filter");
		if (!nativeSelect || nativeSelect.closest(".realtrend-select-wrap")) return;

		nativeSelect.className +=
			(nativeSelect.className ? " " : "") + " realtrend-select-native";
		nativeSelect.tabIndex = -1;
		nativeSelect.setAttribute("aria-hidden", "true");

		var wrap = document.createElement("span");
		wrap.className = "realtrend-select-wrap";

		var trigger = document.createElement("button");
		trigger.type = "button";
		trigger.className = "realtrend-select-trigger";
		trigger.setAttribute("aria-haspopup", "listbox");
		trigger.setAttribute("aria-expanded", "false");
		trigger.setAttribute("aria-label", "Sort products");

		var value = document.createElement("span");
		value.className = "realtrend-select-value";

		var menu = document.createElement("ul");
		menu.className = "realtrend-select-menu";
		menu.setAttribute("role", "listbox");

		function closeMenu() {
			wrap.classList.remove("is-open");
			menu.classList.remove("is-open");
			trigger.setAttribute("aria-expanded", "false");
		}

		function openMenu() {
			wrap.classList.add("is-open");
			menu.classList.add("is-open");
			trigger.setAttribute("aria-expanded", "true");
		}

		function syncSelection() {
			var selected = nativeSelect.options[nativeSelect.selectedIndex];
			value.textContent = selected ? selected.textContent : "Best Selling";
			Array.prototype.forEach.call(menu.querySelectorAll("li"), function (item) {
				var isSelected = item.getAttribute("data-value") === nativeSelect.value;
				item.className = isSelected ? "is-selected" : "";
				item.setAttribute("aria-selected", isSelected ? "true" : "false");
			});
		}

		Array.prototype.forEach.call(nativeSelect.options, function (option) {
			var item = document.createElement("li");
			item.textContent = option.textContent;
			item.setAttribute("data-value", option.value);
			item.setAttribute("role", "option");
			item.addEventListener("click", function (event) {
				event.preventDefault();
				event.stopPropagation();
				nativeSelect.value = option.value;
				if (window.jQuery) {
					window.jQuery(nativeSelect).trigger("change");
				} else {
					nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
				}
				syncSelection();
				closeMenu();
			});
			menu.appendChild(item);
		});

		trigger.appendChild(value);
		wrap.appendChild(trigger);
		wrap.appendChild(menu);
		nativeSelect.parentNode.insertBefore(wrap, nativeSelect);
		wrap.appendChild(nativeSelect);

		trigger.addEventListener("click", function (event) {
			event.preventDefault();
			event.stopPropagation();
			if (wrap.classList.contains("is-open")) closeMenu();
			else openMenu();
		});

		document.addEventListener("click", function (event) {
			if (!wrap.contains(event.target)) closeMenu();
		});

		syncSelection();
	}

	function applyWishIcons() {
		var base = skinBase();
		if (!base) return;
		var pink = base + "/images/listing/wish_pink.png";
		var filled = base + "/images/listing/wish_hover.png";
		var root = document.getElementById("searchedItemDisplay");
		if (!root) return;

		Array.prototype.forEach.call(
			root.querySelectorAll(
				".listing-card-wish-inline .zzimOffImg, .listing-card-wish .zzimOffImg, .goodsZzimBtn .zzimOffImg, .respGoodsZzim .zzimOffImg, .heart-img.zzimOffImg"
			),
			function (img) {
				if (img.getAttribute("src") !== pink) img.src = pink;
			}
		);

		Array.prototype.forEach.call(
			root.querySelectorAll(
				".listing-card-wish-inline .zzimOnImg, .listing-card-wish .zzimOnImg, .goodsZzimBtn .zzimOnImg, .respGoodsZzim .zzimOnImg, .heart-img.zzimOnImg"
			),
			function (img) {
				if (img.getAttribute("src") !== filled) img.src = filled;
			}
		);
	}

	function stripCurrencySuffix() {
		// get_currency_price() renders "<span class=num>8.73</span>USD" —
		// the "USD" is a trailing text node, not something CSS can remove.
		var root = document.getElementById("searchedItemDisplay");
		if (!root) return;
		Array.prototype.forEach.call(
			root.querySelectorAll(".sale_price, .consumer_price"),
			function (el) {
				Array.prototype.forEach.call(el.childNodes, function (node) {
					if (node.nodeType === 3 && /USD/i.test(node.nodeValue)) {
						node.nodeValue = node.nodeValue.replace(/USD/gi, "").trim();
					}
				});
			}
		);
	}

	function refreshDynamicUI() {
		applyWishIcons();
		stripCurrencySuffix();
	}

	ready(function () {
		applyHero();
		enhanceSortSelect();
		refreshDynamicUI();

		if (window.jQuery) {
			window.jQuery(document).on("ajaxComplete", function () {
				window.setTimeout(refreshDynamicUI, 50);
			});
		}

		var display = document.getElementById("searchedItemDisplay");
		if (display && window.MutationObserver) {
			var timer = null;
			new MutationObserver(function () {
				window.clearTimeout(timer);
				timer = window.setTimeout(refreshDynamicUI, 80);
			}).observe(display, { childList: true, subtree: true });
		}

		window.setTimeout(refreshDynamicUI, 400);
		window.setTimeout(refreshDynamicUI, 1200);
	});
})();
