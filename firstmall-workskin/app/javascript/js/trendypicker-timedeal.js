/**
 * TrendyPicker Time Deal
 * /promotion/timedeal → promotion/timedeal.html
 *
 * 1. Guard: body.is-timedeal-page
 * 2. Custom sort on #catalog_filter (page copy, do not merge)
 * 3. Listing card chrome, deal badge, brand line
 * 4. Client category tabs (Firstmall set_classification is a no-op here)
 * 5. Fallback 12h countdown + schedule tab scroll
 * 6. Unlock html.overflow + MutationObserver / ajaxComplete regroup
 */
(function () {
	"use strict";

	var page = document.body;
	if (!page || !page.classList.contains("is-timedeal-page")) return;

	function ready(fn) {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", fn);
		} else {
			fn();
		}
	}

	function getSkinImageBase() {
		var link = document.querySelector('link[href*="/css/redesign/trendypicker-timedeal.css"]');
		if (!link) return "/data/skin";
		try {
			var href = link.getAttribute("href") || "";
			var match = href.match(/^(.*?)\/css\/redesign\/trendypicker-timedeal\.css/i);
			return match ? match[1] : "/data/skin";
		} catch (_err) {
			return "/data/skin";
		}
	}

	function enhanceSortSelect() {
		var nativeSelect = document.querySelector("#timedeal_page #catalog_filter");
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
			value.textContent = selected ? selected.textContent : "Ending Soon";
			Array.prototype.forEach.call(menu.querySelectorAll("li"), function (item) {
				var isSelected = item.getAttribute("data-value") === nativeSelect.value;
				item.classList.toggle("is-selected", isSelected);
				item.setAttribute("aria-selected", isSelected ? "true" : "false");
			});
		}

		if (!nativeSelect.value) {
			nativeSelect.value = "ranking";
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

	function listingCards() {
		var display = document.getElementById("searchedItemDisplay");
		if (!display) return [];
		var list = display.querySelector(":scope > ul") || display.querySelector("ul");
		if (!list) return [];
		return list.querySelectorAll(":scope > li");
	}

	var BORROWED_KEY_PREFIX = "trendypicker-timedeal-borrowed:";
	var fillingLastRow = false;

	function listingFormParams(pageNumber) {
		var nativeQuery = typeof window.searchParams === "function"
			? window.searchParams()
			: window.location.search;
		var params = new URLSearchParams(String(nativeQuery || "").replace(/^\?/, ""));
		params.set("page", String(pageNumber));
		return params;
	}

	function normalizedQueryKey(params) {
		var pairs = [];
		params.forEach(function (value, key) {
			if (key !== "auto" && key !== "_") pairs.push([key, value]);
		});
		pairs.sort(function (a, b) {
			return a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0]);
		});
		return BORROWED_KEY_PREFIX + pairs.map(function (pair) {
			return encodeURIComponent(pair[0]) + "=" + encodeURIComponent(pair[1]);
		}).join("&");
	}

	function extractGoodsSeq(item) {
		var card = item.querySelector("[data-goods-seq]");
		if (card && card.getAttribute("data-goods-seq")) {
			return card.getAttribute("data-goods-seq");
		}
		var link = item.querySelector('a[href*="/goods/view?no="], a[href*="/goods/view/no/"]');
		if (!link) return null;
		var href = link.getAttribute("href") || "";
		var match = /[?&]no=(\d+)/.exec(href) || /\/goods\/view\/no\/(\d+)/.exec(href);
		return match ? match[1] : null;
	}

	function currentPageNumber() {
		var formPage = document.querySelector("#goodsSearchForm input[name='page']");
		var page = formPage ? parseInt(formPage.value, 10) : NaN;
		if (page > 0) return page;
		var active = document.querySelector(".paging_navigation .on");
		page = active ? parseInt(active.textContent, 10) : NaN;
		return page > 0 ? page : 1;
	}

	function hasNextPage() {
		var nav = document.querySelector(".paging_navigation");
		return !!(nav && nav.querySelector("a.next"));
	}

	function detectColumnCount(items) {
		if (items.length < 2) return items.length;
		var firstTop = Math.round(items[0].getBoundingClientRect().top);
		var columns = 0;
		for (var i = 0; i < items.length; i += 1) {
			if (Math.round(items[i].getBoundingClientRect().top) !== firstTop) break;
			columns += 1;
		}
		return columns || 1;
	}

	function stripAlreadyBorrowedItems() {
		var display = document.getElementById("searchedItemDisplay");
		var list = display && (display.querySelector(":scope > ul") || display.querySelector("ul"));
		if (!list) return;

		var raw;
		try {
			raw = window.sessionStorage.getItem(
				normalizedQueryKey(listingFormParams(currentPageNumber()))
			);
		} catch (_err) {
			return;
		}
		if (!raw) return;

		var ids;
		try {
			ids = JSON.parse(raw);
		} catch (_err) {
			return;
		}
		if (!Array.isArray(ids) || !ids.length) return;

		var idSet = {};
		ids.forEach(function (id) {
			idSet[id] = true;
		});
		Array.prototype.forEach.call(list.querySelectorAll(":scope > li"), function (item) {
			var goodsSeq = extractGoodsSeq(item);
			if (goodsSeq && idSet[goodsSeq]) item.remove();
		});
	}

	function fillLastRow() {
		if (fillingLastRow || !hasNextPage()) return;
		var categories = document.querySelector(".timedeal-categories");
		var activeCategory = categories && categories.getAttribute("data-active-category");
		if (activeCategory && activeCategory !== "all") return;

		var display = document.getElementById("searchedItemDisplay");
		var list = display && (display.querySelector(":scope > ul") || display.querySelector("ul"));
		if (!list) return;
		var items = Array.prototype.slice.call(list.querySelectorAll(":scope > li"));
		if (items.length < 2) return;

		var columns = detectColumnCount(items);
		if (columns < 2) return;
		var remainder = items.length % columns;
		if (!remainder) return;

		var needed = columns - remainder;
		var nextPage = currentPageNumber() + 1;
		var params = listingFormParams(nextPage);
		params.set("auto", "1");
		params.set("_", String(Date.now()));
		var borrowedFromKey = normalizedQueryKey(params);
		var fetchUrl = new URL(window.location.href);
		fetchUrl.pathname = "/goods/search_list";
		fetchUrl.search = params.toString();

		fillingLastRow = true;
		fetch(fetchUrl.toString(), { credentials: "same-origin" })
			.then(function (response) {
				if (!response.ok) throw new Error("Time Deal next page request failed");
				return response.text();
			})
			.then(function (html) {
				var doc = new DOMParser().parseFromString(html, "text/html");
				var nextItems = doc.querySelectorAll("li.timedeal_listing_style");
				if (!nextItems.length) {
					nextItems = doc.querySelectorAll("#searchedItemDisplay > ul > li, ul > li.timedeal_listing_style");
				}
				var borrowed = Array.prototype.slice.call(nextItems, 0, needed);
				if (!borrowed.length) return;

				var borrowedIds = [];
				borrowed.forEach(function (item) {
					item.setAttribute("data-trendypicker-borrowed", "1");
					list.appendChild(item);
					var goodsSeq = extractGoodsSeq(item);
					if (goodsSeq) borrowedIds.push(goodsSeq);
				});
				if (!borrowedIds.length) return;

				try {
					var stored = window.sessionStorage.getItem(borrowedFromKey);
					var existing = stored ? JSON.parse(stored) : [];
					window.sessionStorage.setItem(
						borrowedFromKey,
						JSON.stringify(existing.concat(borrowedIds).filter(function (id, index, all) {
							return all.indexOf(id) === index;
						}))
					);
				} catch (_err) {
					/* sessionStorage unavailable: filling still works for this page. */
				}
			})
			.catch(function () {
				/* Keep the native partial row when the next-page request fails. */
			})
			.then(function () {
				fillingLastRow = false;
			});
	}

	function syncCount() {
		var raw = "";
		// #filterResultCount reflects Firstmall's native search-form result count.
		// set_classification() never actually updates it for searchMode=timedeal
		// (its AJAX response is always null there), so once a .timedeal-categories
		// tab is filtering client-side, this stale native count must be skipped —
		// otherwise the badge shows the full unfiltered total instead of what's
		// actually visible.
		var catRoot = document.querySelector(".timedeal-categories");
		var activeCategory = catRoot ? catRoot.getAttribute("data-active-category") : null;
		var filteringByCategory = !!activeCategory && activeCategory !== "all";

		if (!filteringByCategory && window.jQuery) {
			raw = (window.jQuery("#filterResultCount").text() || "").replace(/[^0-9]/g, "");
		}
		if (!raw) {
			var items = listingCards();
			var visible = 0;
			Array.prototype.forEach.call(items, function (item) {
				if (!item.classList.contains("is-timedeal-cat-hidden")) visible += 1;
			});
			raw = String(visible || items.length);
		}
		if (!raw) return;

		var formatted = Number(raw).toLocaleString("en-US");
		var countNode = document.querySelector("[data-timedeal-count]");
		var countMobile = document.querySelector("[data-timedeal-count-mobile]");
		if (countNode) countNode.textContent = "(" + formatted + ")";
		if (countMobile) countMobile.textContent = "All Products (" + formatted + " Items)";
	}

	function readDiscountText(card) {
		var rateNode =
			card.querySelector(".discount_rate .num") ||
			card.querySelector(".discount_rate b") ||
			card.querySelector(".sale_per") ||
			card.querySelector(".listing-card-badge");
		var digits = String((rateNode && rateNode.textContent) || "").replace(/[^0-9]/g, "");
		if (!digits) {
			digits = String(card.getAttribute("data-sale-per") || "").replace(/[^0-9]/g, "");
		}
		return digits ? digits + "% OFF" : "";
	}

	function textOf(node) {
		return node ? String(node.textContent || "").replace(/\s+/g, " ").trim() : "";
	}

	function isOnSaleNowView() {
		var mode = new URLSearchParams(window.location.search).get("display_mode");
		return !mode || mode === "current";
	}

	function ensureDealBadge(card, media) {
		var existing = card.querySelector(".timedeal-card-deal");
		if (!isOnSaleNowView()) {
			if (existing) existing.remove();
			return;
		}
		if (!media || existing) return;
		// Real Time Deal products always carry a discount rate — only show the
		// badge when one is present, instead of falling back to a generic label.
		var rateText = readDiscountText(card);
		if (!rateText) return;

		var badge = document.createElement("div");
		badge.className = "timedeal-card-deal";
		badge.setAttribute("aria-label", rateText + " time deal");

		var clock = document.createElement("img");
		clock.className = "timedeal-card-deal-clock";
		clock.src = getSkinImageBase() + "/images/timedeal/clock_pink.png";
		clock.alt = "";
		clock.width = 22;
		clock.height = 22;
		clock.setAttribute("aria-hidden", "true");

		var rate = document.createElement("span");
		rate.className = "timedeal-card-deal-rate";
		rate.textContent = rateText;

		badge.appendChild(clock);
		badge.appendChild(rate);
		media.appendChild(badge);
	}

	function ensureWishControl(card, media) {
		var existing = card.querySelector(".listing-card-wish");
		var zzim = card.querySelector(".display_zzim, .respGoodsZzim");
		if (existing) {
			if (zzim && zzim !== existing) zzim.classList.add("is-timedeal-zzim-duplicate");
			return existing;
		}
		if (zzim) {
			zzim.classList.add("listing-card-wish");
			if (media && zzim.parentNode !== media) media.appendChild(zzim);
			return zzim;
		}

		var wish = document.createElement("button");
		wish.type = "button";
		wish.className = "listing-card-wish";
		wish.setAttribute("aria-label", "Add to wishlist");
		wish.setAttribute("aria-pressed", "false");
		if (media) media.appendChild(wish);
		return wish;
	}

	function readGoodsSeq(card) {
		var link = card.querySelector("a[href*='/goods/view']");
		var href = link ? link.getAttribute("href") || "" : "";
		var match = href.match(/[?&]no=(\d+)/);
		if (match) return match[1];
		var native = card.querySelector("[onclick*='displayAddToCartQuickview']");
		if (native) {
			match = String(native.getAttribute("onclick") || "").match(
				/displayAddToCartQuickview2?\([^,]+,\s*(\d+)/
			);
			if (match) return match[1];
		}
		return "";
	}

	function openQuickview(button, goodsSeq, event) {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		if (!goodsSeq) return;
		if (typeof window.displayAddToCartQuickview2 === "function") {
			window.displayAddToCartQuickview2(button, goodsSeq, event);
			return;
		}
		if (typeof window.displayAddToCartQuickview === "function") {
			window.displayAddToCartQuickview(button, goodsSeq);
		}
	}

	function bindCartQuickview(card) {
		var goodsSeq = readGoodsSeq(card);
		if (!goodsSeq) return;
		var buttons = card.querySelectorAll(
			".listing-card-actions--desktop > button:not(.listing-card-wish-inline), .listing-card-actions--desktop > a:not(.listing-card-wish-inline), .listing-card-cart"
		);
		Array.prototype.forEach.call(buttons, function (button) {
			if (button.getAttribute("data-qv-bound") === "1") return;
			if (/displayAddToCartQuickview/.test(button.getAttribute("onclick") || "")) return;
			button.setAttribute("data-qv-bound", "1");
			button.addEventListener("click", function (event) {
				openQuickview(button, goodsSeq, event);
			});
		});
	}

	function ensureCardChrome(card) {
		if (!card.querySelector(".listing-card-actions--desktop")) {
			var actions = document.createElement("div");
			actions.className = "listing-card-actions listing-card-actions--desktop";

			var cartBtn = document.createElement("button");
			cartBtn.type = "button";
			cartBtn.setAttribute("aria-label", "Add to cart");

			var wishBtn = document.createElement("button");
			wishBtn.type = "button";
			wishBtn.className = "listing-card-wish-inline";
			wishBtn.setAttribute("aria-label", "Add to wishlist");
			wishBtn.setAttribute("aria-pressed", "false");

			actions.appendChild(cartBtn);
			actions.appendChild(wishBtn);
			card.appendChild(actions);
		}

		if (!card.querySelector(".listing-card-cart")) {
			var mobileCart = document.createElement("button");
			mobileCart.type = "button";
			mobileCart.className = "listing-card-cart mobile-only";
			mobileCart.setAttribute("aria-label", "Add to cart");
			card.appendChild(mobileCart);
		}

		bindCartQuickview(card);
	}

	function orderCardRows(card, info) {
		var nameArea = info.querySelector(".goods_name_area");
		var price = info.querySelector(".goods_price_area, .listing-card-price");
		var actions = card.querySelector(".listing-card-actions--desktop");
		var cart = card.querySelector(".listing-card-cart");

		if (nameArea) info.appendChild(nameArea);
		if (price) info.appendChild(price);
		if (actions) card.appendChild(actions);
		if (cart) card.appendChild(cart);
	}

	function enhanceListingCards() {
		var display = document.getElementById("searchedItemDisplay");
		if (!display) return;
		display.classList.remove("listing-grid");

		var list = display.querySelector(":scope > ul") || display.querySelector("ul");
		if (list) list.classList.add("listing-grid");

		var cards = display.querySelectorAll(":scope > ul > li, :scope > .listing-card");

		Array.prototype.forEach.call(cards, function (card) {
			if (card.getAttribute("data-bo-ready") === "1") return;
			card.setAttribute("data-bo-ready", "1");
			card.classList.add("listing-card");
			var goodsSeq = readGoodsSeq(card);
			if (goodsSeq) card.setAttribute("data-goods-seq", goodsSeq);

			var media =
				card.querySelector(".listing-card-media") ||
				card.querySelector(".item_img_area") ||
				card.querySelector(".gl_item");
			if (media) {
				media.classList.add("listing-card-media", "item_img_area");
				var img = media.querySelector("img");
				if (img) {
					var imageWrap = media.querySelector(".listing-card-image");
					if (!imageWrap) {
						imageWrap = document.createElement("div");
						imageWrap.className = "listing-card-image";
						img.parentNode.insertBefore(imageWrap, img);
						imageWrap.appendChild(img);
					}
				}
				ensureWishControl(card, media);
				ensureDealBadge(card, media);
			}

			var info = card.querySelector(".listing-card-body") || card.querySelector(".item_info_area");
			if (info) {
				info.classList.add("listing-card-body", "item_info_area");

				var title = info.querySelector(".listing-card-title, .goods_name_area .name, .name");
				if (title) title.classList.add("listing-card-title");

				var priceArea = info.querySelector(".listing-card-price, .goods_price_area");
				if (priceArea) {
					priceArea.classList.add("listing-card-price", "goods_price_area");
					var sale = priceArea.querySelector(".sale_price");
					var consumer = priceArea.querySelector(".consumer_price");
					var rate = priceArea.querySelector(".discount_rate");
					/* Keep Firstmall nodes: 할인가 → 정가 → 할인율 */
					if (sale) priceArea.appendChild(sale);
					if (consumer) priceArea.appendChild(consumer);
					if (rate) {
						rate.classList.remove("hide");
						rate.style.removeProperty("display");
						priceArea.appendChild(rate);
					}
				}
			}

			ensureCardChrome(card);
			if (info) orderCardRows(card, info);
		});
	}

	function centerActiveScheduleTab() {
		var schedule = document.querySelector("[data-timedeal-schedule]");
		if (!schedule) return;
		var active = schedule.querySelector(".timedeal-schedule-tab.is-active");
		if (!active) return;
		var left = active.offsetLeft - (schedule.clientWidth - active.clientWidth) / 2;
		schedule.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
	}

	function observeProducts() {
		var display = document.getElementById("searchedItemDisplay");
		if (!display) return;

		var run = function () {
			stripAlreadyBorrowedItems();
			enhanceListingCards();
			var cats = document.querySelector(".timedeal-categories");
			if (cats && typeof cats._reapplyCategoryFilter === "function") {
				cats._reapplyCategoryFilter();
			}
			fillLastRow();
		};

		run();

		if (window.MutationObserver) {
			var timer = null;
			var listObserver = new MutationObserver(function () {
				window.clearTimeout(timer);
				timer = window.setTimeout(run, 80);
			});
			var bindList = function () {
				var list = display.querySelector(":scope > ul") || display.querySelector("ul");
				if (!list || list._boObserved) return;
				list._boObserved = true;
				listObserver.observe(list, { childList: true, subtree: false });
			};
			bindList();
			var displayObserver = new MutationObserver(bindList);
			displayObserver.observe(display, { childList: true, subtree: false });
		}

		if (window.jQuery) {
			window.jQuery(document).on("ajaxComplete", function (_event, _xhr, settings) {
				var url = (settings && settings.url) || "";
				if (/search_list|goods\/search|timedeal/i.test(String(url))) {
					run();
				}
			});
		}

		window.setTimeout(run, 400);
		window.setTimeout(run, 1200);
	}

	function unlockPageScroll() {
		document.documentElement.classList.remove("overflow");
	}

	function enableThumbDrag(scrollEl, trackEl) {
		if (!scrollEl || !trackEl) return;
		var thumb = trackEl.querySelector(".timedeal-schedule-scrollbar-thumb");
		if (!thumb) return;

		var isDown = false;
		var startX = 0;
		var startScrollLeft = 0;

		thumb.addEventListener("mousedown", function (e) {
			if (e.button !== 0) return;
			isDown = true;
			startX = e.pageX;
			startScrollLeft = scrollEl.scrollLeft;
			thumb.classList.add("is-dragging");
			e.preventDefault(); // don't let the browser start a text-selection drag
		});

		window.addEventListener("mouseup", function () {
			if (!isDown) return;
			isDown = false;
			thumb.classList.remove("is-dragging");
		});

		var DRAG_SPEED = 1.6;

		window.addEventListener("mousemove", function (e) {
			if (!isDown) return;
			var trackWidth = trackEl.clientWidth;
			var scrollable = scrollEl.scrollWidth - scrollEl.clientWidth;
			if (trackWidth <= 0 || scrollable <= 0) return;
			var deltaPx = e.pageX - startX;
			var scrollDelta = deltaPx * (scrollable / trackWidth) * DRAG_SPEED;
			scrollEl.scrollLeft = startScrollLeft + scrollDelta;
		});

		// clicking the bare track (not the thumb) jumps toward that point — standard scrollbar behavior
		trackEl.addEventListener("mousedown", function (e) {
			if (e.target === thumb) return;
			var trackRect = trackEl.getBoundingClientRect();
			var clickRatio = (e.clientX - trackRect.left) / trackRect.width;
			var scrollable = scrollEl.scrollWidth - scrollEl.clientWidth;
			scrollEl.scrollLeft = clickRatio * scrollable;
		});
	}

	function wireScrollIndicator(scrollEl, trackEl) {
		if (!scrollEl || !trackEl) return;
		const thumb = trackEl.querySelector('.timedeal-schedule-scrollbar-thumb');
		if (!thumb) return;

		function update() {
			const scrollable = scrollEl.scrollWidth - scrollEl.clientWidth;
			if (scrollable <= 1) {
				trackEl.style.display = 'none'; // nothing to scroll — hide the bar entirely
				return;
			}
			trackEl.style.display = '';
			const ratio = scrollEl.clientWidth / scrollEl.scrollWidth;
			const thumbWidthPct = Math.max(ratio * 100, 8); // floor so the thumb never disappears
			const maxLeftPct = 100 - thumbWidthPct;
			const scrollRatio = scrollEl.scrollLeft / scrollable;
			thumb.style.width = thumbWidthPct + '%';
			thumb.style.left = (scrollRatio * maxLeftPct) + '%';
		}

		scrollEl.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
		window.addEventListener('resize', update);
		update();
	}

	function enableWheelScroll(el) {
		if (!el) return;
		el.addEventListener("wheel", function (e) {
			if (el.scrollWidth <= el.clientWidth) return; // nothing to scroll, don't intercept
			if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return; // already horizontal (trackpad swipe) — leave native behavior alone
			e.preventDefault();
			el.scrollLeft += e.deltaY;
		}, { passive: false });
	}

	ready(function () {
		unlockPageScroll();
		if (window.MutationObserver) {
			new MutationObserver(function () {
				if (document.documentElement.classList.contains("overflow")) {
					unlockPageScroll();
				}
			}).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
		}
		enhanceSortSelect();
		centerActiveScheduleTab();
		observeProducts();

		var scheduleEl = document.querySelector(".timedeal-schedule");
		var scheduleTrackEl = document.querySelector(".timedeal-schedule-scrollbar");
		enableThumbDrag(scheduleEl, scheduleTrackEl);
		wireScrollIndicator(scheduleEl, scheduleTrackEl);
		enableWheelScroll(scheduleEl);
	});
})();
