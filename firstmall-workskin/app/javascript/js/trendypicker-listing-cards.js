/**
 * TrendyPicker shared listing-card wishlist state.
 *
 * Firstmall owns the server mutation through display_goods_zzim(). This file
 * only keeps every visible wish control in the card in sync immediately and
 * reconciles the optimistic state with the AJAX result.
 */
(function (window, document) {
	"use strict";

	if (window.TrendyPickerListingWishlist) return;

	var selector = ".listing-card-wish, .listing-card-wish-inline";
	var pendingByGoodsSeq = {};
	var currentTimeDeals = null;
	var currentTimeDealsRequest = null;
	var timeDealCacheKey = "trendypicker-current-timedeals";
	var timeDealCacheMaxAge = 5 * 60 * 1000;

	function closestCard(button) {
		return button ? button.closest(".listing-card, .gl_item") : null;
	}

	function readGoodsSeq(button) {
		var card = closestCard(button);
		var goodsSeq = card ? card.getAttribute("data-goods-seq") : "";
		var match;

		if (goodsSeq) return String(goodsSeq);

		match = String(button.getAttribute("onclick") || "").match(
			/display_goods_zzim\s*\([^,]+,\s*['\"]?(\d+)/
		);
		if (match) return match[1];

		if (card) {
			var link = card.querySelector("a[href*='/goods/view']");
			match = String((link && link.getAttribute("href")) || "").match(/[?&]no=(\d+)/);
			if (match) return match[1];
		}

		return "";
	}

	function setButtonState(button, active) {
		var offImage;
		var onImage;

		button.setAttribute("aria-pressed", active ? "true" : "false");
		button.setAttribute("aria-label", active ? "Remove from wishlist" : "Add to wishlist");
		button.classList.toggle("is-active", active);

		offImage = button.querySelector(".zzimOffImg");
		onImage = button.querySelector(".zzimOnImg");
		if (offImage) {
			offImage.classList.toggle("zzim-hidden", active);
			offImage.style.display = active ? "none" : "block";
		}
		if (onImage) {
			onImage.classList.toggle("zzim-hidden", !active);
			onImage.style.display = active ? "block" : "none";
		}
	}

	function setCardState(button, active) {
		var card = closestCard(button);
		var controls = card ? card.querySelectorAll(selector) : [button];
		Array.prototype.forEach.call(controls, function (control) {
			setButtonState(control, active);
		});
	}

	function controlIsActive(control) {
		var offImage;
		var onImage;
		if (control.getAttribute("aria-pressed") === "true") return true;
		if (control.classList.contains("is-active")) return true;

		offImage = control.querySelector(".zzimOffImg");
		onImage = control.querySelector(".zzimOnImg");
		if (offImage && (offImage.classList.contains("zzim-hidden") || offImage.style.display === "none")) {
			return true;
		}
		return !!onImage && !onImage.classList.contains("zzim-hidden") && onImage.style.display !== "none";
	}

	function cardIsActive(button) {
		var card = closestCard(button);
		var controls = card ? card.querySelectorAll(selector) : [button];
		var active = false;
		Array.prototype.forEach.call(controls, function (control) {
			if (controlIsActive(control)) active = true;
		});
		return active;
	}

	function requestWithoutInlineHandler(button, goodsSeq) {
		if (typeof window.display_goods_zzim === "function") {
			window.display_goods_zzim(button, goodsSeq);
			return;
		}

		if (!window.jQuery) return;
		window.jQuery.ajax({
			url: "/mypage/wish_add_ajax_toggle",
			data: { goods_seq: goodsSeq },
			dataType: "json",
			global: true
		});
	}

	function handleClick(event) {
		var button = event.target.closest(selector);
		var goodsSeq;
		var wasActive;
		var hasNativeInlineHandler;

		if (!button) return;

		goodsSeq = readGoodsSeq(button);
		wasActive = cardIsActive(button);
		setCardState(button, !wasActive);

		if (goodsSeq) {
			pendingByGoodsSeq[goodsSeq] = {
				button: button,
				previous: wasActive
			};
		}

		hasNativeInlineHandler = /display_goods_zzim/.test(
			button.getAttribute("onclick") || ""
		);
		if (!hasNativeInlineHandler && goodsSeq) {
			event.preventDefault();
			event.stopPropagation();
			requestWithoutInlineHandler(button, goodsSeq);
		}
	}

	function goodsSeqFromRequest(settings) {
		var data = settings && settings.data;
		var match;
		if (!data) return "";
		if (typeof data === "object" && data.goods_seq) return String(data.goods_seq);
		match = String(data).match(/(?:^|&)goods_seq=([^&]+)/);
		return match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : "";
	}

	function reconcile(settings, response) {
		var url = String((settings && settings.url) || "");
		var goodsSeq;
		var pending;
		var result;

		if (url.indexOf("/mypage/wish_add_ajax_toggle") === -1) return;
		goodsSeq = goodsSeqFromRequest(settings);
		pending = pendingByGoodsSeq[goodsSeq];
		if (!pending) return;

		result = response && response.result;
		if (result === "add" || result === "del") {
			setCardState(pending.button, result === "add");
		} else {
			setCardState(pending.button, pending.previous);
		}
		delete pendingByGoodsSeq[goodsSeq];
	}


	/*
	  get_currency_price() wraps the amount with the shop's currency text, so
	  a card renders as  "US " + <span class="num">19.87</span> + "USD".
	  Neither piece is reachable from the design_list template (the currency
	  helper creates them) nor from CSS (they are text nodes), so normalise here — this
	  script is loaded by every design_list style, which makes it the one place
	  that covers Best, Time Deal, category and search grids alike.
	*/
	function normalizeCardPrice(el) {
		// Rebuild rather than strip. The shop's currency text is not always a
		// plain text node — it can be wrapped in its own element — so removing
		// text nodes alone left the original "US" in place and produced
		// "US US$389.70". The amount always lives in .num, so keep that and
		// rewrite everything around it.
		// Guard against the observer below: this function edits the DOM, and
		// those edits would re-trigger the observer that called it. Marking the
		// element first means each price is rewritten exactly once.
		if (el.getAttribute("data-tp-price") === "1") return;

		var num = el.querySelector(".num");
		if (!num) return;

		var amount = String(num.textContent || "").replace(/[^0-9.,]/g, "").trim();
		if (!amount) return;

		var rebuilt = document.createElement("span");
		rebuilt.className = "num";
		rebuilt.textContent = amount;

		el.setAttribute("data-tp-price", "1");
		while (el.firstChild) el.removeChild(el.firstChild);
		el.appendChild(document.createTextNode("US$"));
		el.appendChild(rebuilt);
	}

	function normalizeListingPrices(root) {
		var scope = root && root.querySelectorAll ? root : document;
		Array.prototype.forEach.call(
			scope.querySelectorAll(
				'.listing-card .sale_price:not([data-tp-price]), .listing-card .consumer_price:not([data-tp-price])'
			),
			normalizeCardPrice
		);
	}

	/* Older cached design-list markup places this block over the thumbnail as
	   .listing-card-rating-badge. Current markup already renders
	   .listing-card-rating in the body. Normalise both forms so search results
	   and AJAX-refreshed grids always show rating/reviews directly above price. */
	function normalizeCardRating(card) {
		var body = card.querySelector(".listing-card-body");
		var rating = card.querySelector(
			".listing-card-rating, .listing-card-rating-badge"
		);
		var price;

		if (!body || !rating) return;

		rating.classList.remove("listing-card-rating-badge");
		rating.classList.add("listing-card-rating");
		price = body.querySelector(".listing-card-price, .goods_price_area");

		if (price && (rating.parentNode !== body || rating.nextElementSibling !== price)) {
			body.insertBefore(rating, price);
		} else if (!price && rating.parentNode !== body) {
			body.appendChild(rating);
		}
	}

	function normalizeListingRatings(root) {
		var scope = root && root.querySelectorAll ? root : document;
		Array.prototype.forEach.call(
			scope.querySelectorAll(".listing-card"),
			normalizeCardRating
		);
	}

	function getSkinImageBase() {
		var link = document.querySelector(
			'link[href*="/css/redesign/trendypicker-listing-cards.css"]'
		);
		var href = link ? link.getAttribute("href") || "" : "";
		var match = href.match(/^(.*?)\/css\/redesign\/trendypicker-listing-cards\.css/i);
		return match ? match[1] : "/data/skin";
	}

	function readCardGoodsSeq(card) {
		var goodsSeq = card ? card.getAttribute("data-goods-seq") : "";
		var link;
		var match;

		if (goodsSeq) return String(goodsSeq);
		if (!card) return "";

		link = card.querySelector("a[href*='/goods/view']");
		match = String((link && link.getAttribute("href")) || "").match(/[?&]no=(\d+)/);
		if (match) return match[1];

		match = String(card.innerHTML || "").match(
			/(?:displayAddToCartQuickview2?|display_goods_zzim)\s*\([^,]+,\s*['\"]?(\d+)/
		);
		return match ? match[1] : "";
	}

	function readDiscountDigits(card) {
		var rateNode = card && card.querySelector(
			".discount_rate .num, .discount_rate b, .sale_per, .timedeal-card-deal-rate"
		);
		var digits = String((rateNode && rateNode.textContent) || "").replace(/[^0-9]/g, "");
		return digits && Number(digits) > 0 ? digits : "";
	}

	function addTimeDealBadge(card, digits) {
		var media = card.querySelector(".listing-card-media, .item_img_area");
		var badge;
		var clock;
		var rate;

		if (!media || !digits || card.querySelector(".timedeal-card-deal")) return;

		badge = document.createElement("div");
		badge.className = "timedeal-card-deal";
		badge.setAttribute("aria-label", digits + "% OFF time deal");

		clock = document.createElement("img");
		clock.className = "timedeal-card-deal-clock";
		clock.src = getSkinImageBase() + "/images/timedeal/clock_pink.png";
		clock.alt = "";
		clock.width = 22;
		clock.height = 22;
		clock.setAttribute("aria-hidden", "true");

		rate = document.createElement("span");
		rate.className = "timedeal-card-deal-rate";
		rate.textContent = digits + "% OFF";

		badge.appendChild(clock);
		badge.appendChild(rate);
		media.appendChild(badge);
	}

	/* Firstmall exposes .goods_event_time only inside the Time Deal response;
	   ordinary search/category cards omit it. Match those cards against the
	   current Time Deal response by goods_seq so a normal sale is never marked
	   as a Time Deal merely because it has a discount rate. */
	function normalizeTimeDealBadge(card) {
		var eventTime = card.querySelector(".goods_event_time");
		var goodsSeq = readCardGoodsSeq(card);
		var digits;

		if (card.querySelector(".timedeal-card-deal")) return;
		digits = eventTime ? readDiscountDigits(card) : "";
		if (!digits && goodsSeq && currentTimeDeals && currentTimeDeals[goodsSeq]) {
			digits = currentTimeDeals[goodsSeq];
		}
		addTimeDealBadge(card, digits);
	}

	function parseCurrentTimeDeals(html) {
		var parsed = new DOMParser().parseFromString(html, "text/html");
		var deals = {};
		var cards = parsed.querySelectorAll(
			"li.goods_list_style5, li.timedeal_listing_style, .listing-card"
		);

		Array.prototype.forEach.call(cards, function (card) {
			var goodsSeq = readCardGoodsSeq(card);
			var digits = readDiscountDigits(card);
			if (goodsSeq && digits) deals[goodsSeq] = digits;
		});
		return deals;
	}

	function readCachedTimeDeals() {
		var raw;
		var cached;
		try {
			raw = window.sessionStorage.getItem(timeDealCacheKey);
			cached = raw ? JSON.parse(raw) : null;
		} catch (_err) {
			return null;
		}
		if (!cached || !cached.savedAt || !cached.deals) return null;
		if (Date.now() - cached.savedAt > timeDealCacheMaxAge) return null;
		return cached.deals;
	}

	function saveCurrentTimeDeals(deals) {
		try {
			window.sessionStorage.setItem(timeDealCacheKey, JSON.stringify({
				savedAt: Date.now(),
				deals: deals
			}));
		} catch (_err) {
			/* The live lookup still works when sessionStorage is unavailable. */
		}
	}

	function requestCurrentTimeDeals() {
		var cached = readCachedTimeDeals();
		var requestUrl =
			"/goods/search_list?page=1&searchMode=timedeal&per=100&sorting=ranking&filter_display=lattice";

		if (cached) {
			currentTimeDeals = cached;
			normalizeListingTimeDeals(document);
			return;
		}
		if (currentTimeDealsRequest || typeof window.fetch !== "function") return;

		currentTimeDealsRequest = window.fetch(requestUrl, { credentials: "same-origin" })
			.then(function (response) {
				if (!response.ok) throw new Error("Time Deal lookup failed");
				return response.text();
			})
			.then(function (html) {
				currentTimeDeals = parseCurrentTimeDeals(html);
				saveCurrentTimeDeals(currentTimeDeals);
				normalizeListingTimeDeals(document);
			})
			.catch(function () {
				currentTimeDeals = {};
			});
	}

	function normalizeListingTimeDeals(root) {
		var scope = root && root.querySelectorAll ? root : document;
		Array.prototype.forEach.call(
			scope.querySelectorAll(".listing-card"),
			normalizeTimeDealBadge
		);
	}

	function normalizeListingCards(root) {
		normalizeListingPrices(root);
		normalizeListingRatings(root);
		normalizeListingTimeDeals(root);
	}

	function watchListingCards() {
		normalizeListingCards(document);
		requestCurrentTimeDeals();
		if (!window.MutationObserver) return;
		// Cards arrive from Firstmall's own ajax (paging, category tabs,
		// infinite scroll), so re-run whenever nodes are added.
		var pending = null;
		new MutationObserver(function () {
			window.clearTimeout(pending);
			pending = window.setTimeout(function () {
				normalizeListingCards(document);
			}, 60);
		}).observe(document.documentElement, { childList: true, subtree: true });
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", watchListingCards);
	} else {
		watchListingCards();
	}

	document.addEventListener("click", handleClick, true);

	if (window.jQuery) {
		window.jQuery(document).on(
			"ajaxSuccess.trendypickerListingWishlist",
			function (_event, xhr, settings, data) {
				reconcile(settings, data || (xhr && xhr.responseJSON));
			}
		);
		window.jQuery(document).on(
			"ajaxError.trendypickerListingWishlist",
			function (_event, _xhr, settings) {
				reconcile(settings, null);
			}
		);
	}

	window.TrendyPickerListingWishlist = {
		setCardState: setCardState
	};
})(window, document);
