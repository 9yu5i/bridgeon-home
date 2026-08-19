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
	  Neither piece is reachable from the design_list template (the function
	  builds them) nor from CSS (they are text nodes), so normalise here — this
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

	function watchListingPrices() {
		normalizeListingPrices(document);
		if (!window.MutationObserver) return;
		// Cards arrive from Firstmall's own ajax (paging, category tabs,
		// infinite scroll), so re-run whenever nodes are added.
		var pending = null;
		new MutationObserver(function () {
			window.clearTimeout(pending);
			pending = window.setTimeout(function () {
				normalizeListingPrices(document);
			}, 60);
		}).observe(document.documentElement, { childList: true, subtree: true });
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", watchListingPrices);
	} else {
		watchListingPrices();
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
