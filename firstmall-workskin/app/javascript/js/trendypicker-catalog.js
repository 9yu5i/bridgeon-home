/**
 * TrendyPicker category catalog
 * /goods/catalog → goods/catalog.html
 *
 * 1. Hero kicker / title / theme from categoryData.title
 * 2. Custom sort dropdown on #catalog_filter (native change stays in catalog.html)
 * 3. Wish icon src swap for native zzim fallback
 * 4. Strip trailing "USD" text nodes from get_currency_price()
 * 5. Borrow cards from the next page to fill a partial last grid row
 * 6. Force per=40 on the desktop (1121px+) tier
 */
(function () {
	"use strict";

	var page = document.body;
	if (!page || !page.classList.contains("is-catalog-page")) return;

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
		var nativeSelect = document.querySelector("#catalog_filter");
		if (!nativeSelect || nativeSelect.closest(".realtrend-select-wrap")) return;

		nativeSelect.classList.add("realtrend-select-native");
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
		stripAlreadyBorrowedItems();
		fillLastRow();
	}

	// Column count isn't fixed — 2 on mobile, 3 on tablet, and the desktop
	// tier (1121px+) uses grid-template-columns: repeat(auto-fill, ...) so a
	// wide screen can fit 4+ — see detectColumnCount(). If this page's item
	// count isn't a multiple of the actual rendered column count and there's
	// a next page, borrow just enough cards from it (via the same
	// search_list AJAX call the native catalog JS uses) so the last row is
	// never left partially empty. The true last page is left alone —
	// nothing to borrow from.
	//
	// Borrowing means that next page would otherwise show those same cards
	// again — so the borrowed goods_seq list is recorded in sessionStorage
	// (keyed by the exact page + filters it was borrowed for), and stripped
	// back out if the user actually navigates there. Removing them can push
	// that page under a multiple of its own column count too, so
	// stripAlreadyBorrowedItems() always runs before fillLastRow() to let
	// the shortfall cascade forward page by page.
	var BORROWED_KEY_PREFIX = "bo-catalog-borrowed:";
	var fillingLastRow = false;

	function normalizedQueryKey(params) {
		var keys = [];
		params.forEach(function (_value, key) {
			if (key !== "auto" && key !== "_" && keys.indexOf(key) === -1) keys.push(key);
		});
		keys.sort();
		var normalized = new URLSearchParams();
		keys.forEach(function (key) {
			normalized.set(key, params.get(key));
		});
		return BORROWED_KEY_PREFIX + normalized.toString();
	}

	function extractGoodsSeq(li) {
		var link = li.querySelector('a[href*="/goods/view?no="], a[href*="/goods/view/no="]');
		if (!link) return null;
		var match = /[?&]no=(\d+)/.exec(link.getAttribute("href") || "");
		return match ? match[1] : null;
	}

	function detectColumnCount(items) {
		if (items.length < 2) return items.length;
		var firstTop = Math.round(items[0].getBoundingClientRect().top);
		var count = 0;
		for (var i = 0; i < items.length; i += 1) {
			if (Math.round(items[i].getBoundingClientRect().top) !== firstTop) break;
			count += 1;
		}
		return count || 1;
	}

	function stripAlreadyBorrowedItems() {
		var grid = document.getElementById("searchedItemDisplay");
		if (!grid) return;
		var list = grid.querySelector("ul");
		if (!list) return;

		var key = normalizedQueryKey(new URLSearchParams(window.location.search));
		var raw;
		try {
			raw = window.sessionStorage.getItem(key);
		} catch (e) {
			return;
		}
		if (!raw) return;

		var ids;
		try {
			ids = JSON.parse(raw);
		} catch (e) {
			return;
		}
		if (!ids || !ids.length) return;

		var idSet = {};
		ids.forEach(function (id) {
			idSet[id] = true;
		});

		Array.prototype.forEach.call(list.querySelectorAll(":scope > li"), function (li) {
			var seq = extractGoodsSeq(li);
			if (seq && idSet[seq]) li.remove();
		});
	}

	function fillLastRow() {
		if (fillingLastRow) return;
		var grid = document.getElementById("searchedItemDisplay");
		if (!grid) return;
		var list = grid.querySelector("ul");
		if (!list) return;
		var items = list.querySelectorAll(":scope > li");
		if (items.length < 2) return;

		// Column count isn't fixed: mobile/tablet are 2/3 columns, but the
		// desktop tier (1121px+) uses grid-template-columns: repeat(auto-fill, ...)
		// so a wide screen can fit 4, 5, or more. Measure it from the actual
		// layout instead of assuming a number.
		var columns = detectColumnCount(items);
		if (columns < 2) return;

		var remainder = items.length % columns;
		if (remainder === 0) return;

		var nav = document.querySelector(".paging_navigation");
		var hasNext = nav && nav.querySelector('a.next, a[rel="next"]');
		if (!hasNext) return;

		var needed = columns - remainder;
		var fetchUrl = new URL(window.location.href);
		var currentPage = parseInt(fetchUrl.searchParams.get("page"), 10) || 1;
		fetchUrl.pathname = fetchUrl.pathname.replace(/\/catalog\/?$/, "/search_list");
		fetchUrl.searchParams.set("page", String(currentPage + 1));
		fetchUrl.searchParams.set("auto", "1");
		fetchUrl.searchParams.set("_", String(Date.now()));

		var borrowedFromKey = normalizedQueryKey(fetchUrl.searchParams);

		fillingLastRow = true;
		fetch(fetchUrl.toString(), { credentials: "same-origin" })
			.then(function (res) {
				return res.text();
			})
			.then(function (html) {
				var doc = new DOMParser().parseFromString(html, "text/html");
				var borrowed = Array.prototype.slice.call(
					doc.querySelectorAll("li.categories_listing_style"),
					0,
					needed
				);
				if (!borrowed.length) return;

				var borrowedIds = [];
				borrowed.forEach(function (li) {
					li.setAttribute("data-bo-borrowed", "1");
					list.appendChild(li);
					var seq = extractGoodsSeq(li);
					if (seq) borrowedIds.push(seq);
				});

				if (!borrowedIds.length) return;
				try {
					var existingRaw = window.sessionStorage.getItem(borrowedFromKey);
					var existing = existingRaw ? JSON.parse(existingRaw) : [];
					window.sessionStorage.setItem(
						borrowedFromKey,
						JSON.stringify(existing.concat(borrowedIds))
					);
				} catch (e) {
					/* sessionStorage unavailable — dedup skipped, not fatal */
				}
			})
			.catch(function () {
				/* leave the partial row as-is on failure */
			})
			.then(function () {
				fillingLastRow = false;
			});
	}

	// Desktop tier (see the 1121px breakpoint in trendypicker-catalog.css)
	// always shows 40 per page, regardless of what `per` an entry link used.
	// 40 is a value the server actually honors (confirmed live — arbitrary
	// values silently fall back to the site default instead).
	function ensureDesktopPageSize() {
		if (window.innerWidth < 1121) return false;
		var url = new URL(window.location.href);
		if (url.searchParams.get("_perlock") === "1") return false;
		if (url.searchParams.get("per") === "40") return false;

		url.searchParams.set("per", "40");
		url.searchParams.set("_perlock", "1");
		window.location.replace(url.toString());
		return true;
	}

	ready(function () {
		if (ensureDesktopPageSize()) return;
		applyHero();
		enhanceSortSelect();
		refreshDynamicUI();

		// Selecting a filter makes Firstmall scroll to the very top *immediately on
		// click* (well before its re-search AJAX finishes ~1s later). So we can't
		// wait for ajaxComplete to restore — by then the user has stared at the top
		// for a second. Instead, LOCK the scroll position the moment a filter is
		// clicked and hold it (correcting on every scroll event + each frame) right
		// through the AJAX, releasing when the results re-render or the user scrolls.
		var lockY = 0;
		var lockActive = false;
		var lockRAF = null;
		var lockSafety = null;

		function stopScrollLock() {
			lockActive = false;
			if (lockRAF) {
				window.cancelAnimationFrame(lockRAF);
				lockRAF = null;
			}
			if (lockSafety) {
				window.clearTimeout(lockSafety);
				lockSafety = null;
			}
		}

		function pinToLock() {
			if (!lockActive) return;
			var current = window.scrollY || window.pageYOffset || 0;
			if (Math.abs(current - lockY) > 1) window.scrollTo(0, lockY);
		}

		function scrollLockStep() {
			if (!lockActive) return;
			pinToLock();
			lockRAF = window.requestAnimationFrame(scrollLockStep);
		}

		function startScrollLock(y) {
			stopScrollLock();
			lockY = y;
			lockActive = true;
			if (window.jQuery) window.jQuery("html, body").stop(true);
			lockRAF = window.requestAnimationFrame(scrollLockStep);
			// Never hold forever if the AJAX never reports back.
			lockSafety = window.setTimeout(stopScrollLock, 3000);
		}

		// Correct Firstmall's programmatic scroll the instant it happens (the
		// scroll event fires before paint, so this keeps the jump invisible).
		window.addEventListener("scroll", pinToLock, { passive: true });

		// A real scroll gesture from the user releases the lock first (these fire
		// before the resulting scroll event), so we never fight their scrolling.
		["wheel", "touchmove", "keydown"].forEach(function (evt) {
			window.addEventListener(evt, stopScrollLock, { passive: true });
		});

		// Lock on the click itself (capture phase = before the input's inline
		// onclick=setFilter* that triggers Firstmall's scroll-to-top).
		document.addEventListener(
			"click",
			function (event) {
				var target = event.target;
				if (!target || !target.closest) return;
				var isFilterCtrl =
					target.closest(".listing-filters, .search_left, #searchFilter") &&
					!target.closest(
						".listing-filter-more, .listing-filter-less, summary"
					);
				var isClear = target.closest(
					".listing-clear-all, [data-listing-clear-filters], .selected_clear"
				);
				if (!isFilterCtrl && !isClear) return;
				startScrollLock(window.scrollY || window.pageYOffset || 0);
			},
			true
		);

		if (window.jQuery) {
			window.jQuery(document).on("ajaxComplete", function (_e, _xhr, settings) {
				window.setTimeout(refreshDynamicUI, 50);
				// Release shortly after the search results re-render, letting the
				// post-render layout settle while still pinned.
				if (lockActive) {
					var url = (settings && settings.url) || "";
					if (/search_list|goods\/search/i.test(String(url))) {
						window.setTimeout(stopScrollLock, 150);
					}
				}
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
