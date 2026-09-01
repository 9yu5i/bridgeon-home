/**
 * 숏폼 콘텐츠 Feed JS
 */
(() => {
	const navigateWithPageTransition = window.TrendyPicker?.navigateWithPageTransition || ((href) => {
		window.location.href = href;
	});
	const PRODUCT_DETAIL_URL =
		new URL("/goods/quickview", document.currentScript?.src || window.location.href).href;

	const feed = document.getElementById("realtrend-feed");
	const track = document.getElementById("realtrend-track");
	if (!feed || !track) return;

	const slides = Array.from(track.querySelectorAll(".realtrend-slide"));
	const slideCount = slides.length;

	const getSlideDetailHref = (slide) =>
		slide?.dataset?.productDetailLink
			? new URL(slide.dataset.productDetailLink, window.location.href).href
			: PRODUCT_DETAIL_URL;

	const navButtons = document.querySelectorAll("[data-reel-direction]");

	const productNavEl = document.getElementById('realtrend-product-nav');
	const productNavCountEl = document.getElementById('realtrend-product-nav-count');

	let currentLinkedGoods = [];
	let currentGoodsIndex = 0;

	const progressBars = document.querySelectorAll(".realtrend-progress");
	const progressFills = document.querySelectorAll(".realtrend-progress-fill");
	let isScrubbing = false;

	const muteToggle = document.getElementById("realtrend-mute-toggle");
	let isMuted = true;

	function applyMuteState() {
		const slide = getActiveSlide();
		if (!slide) return;

		const video = slide.querySelector(".sf-reel__video");
		if (video) video.muted = isMuted;

		const ytIframe = slide.querySelector(".sf-reel__yt-frame");
		if (ytIframe) sendYoutubeCommand(ytIframe, isMuted ? "mute" : "unMute");

		const ttIframe = slide.querySelector(".sf-reel__tt-frame");
		if (ttIframe) sendTiktokCommand(ttIframe, isMuted ? "mute" : "unMute");

		const isControllable = Boolean(video || ytIframe || ttIframe);
		if (muteToggle) muteToggle.hidden = !isControllable;

		muteToggle?.classList.toggle("is-muted", isMuted);
		muteToggle?.setAttribute("aria-pressed", String(!isMuted));
		muteToggle?.setAttribute("aria-label", isMuted ? "Unmute" : "Mute");
	}

	muteToggle?.addEventListener("click", (event) => {
		event.stopPropagation();
		isMuted = !isMuted;
		applyMuteState();
	});


	const updateProgressUI = (percent) => {
		const clamped = Math.max(0, Math.min(100, percent));
		progressFills.forEach((fill) => { fill.style.width = `${clamped}%`; });
		progressBars.forEach((bar) => bar.setAttribute("aria-valuenow", String(Math.round(clamped))));
	};

	const handleVideoTimeUpdate = (event) => {
		const video = event.target;
		const slide = video.closest(".realtrend-slide");
		if (!slide?.classList.contains("is-active")) return;
		if (!Number.isFinite(video.duration) || video.duration <= 0) return;
		if (isMobileSheetOpen()) return;
		if (video.currentTime >= video.duration - NEAR_END_THRESHOLD_S) {
			goByDirection(1);
		}
	};

	let embedProgressStart = 0;
	let embedProgressRaf = null;

	const stopEmbedProgress = () => {
		if (embedProgressRaf) cancelAnimationFrame(embedProgressRaf);
		embedProgressRaf = null;
	};

	const tickEmbedProgress = () => {
		if (isScrubbing) return;
		const elapsed = Date.now() - embedProgressStart;
		updateProgressUI((elapsed / IFRAME_ADVANCE_MS) * 100);
		embedProgressRaf = requestAnimationFrame(tickEmbedProgress);
	};

	const startEmbedProgress = () => {
		stopEmbedProgress();
		embedProgressStart = Date.now();
		embedProgressRaf = requestAnimationFrame(tickEmbedProgress);
	};

	function updateProductNav() {
		if (!productNavEl) return;
		const hasMultiple = currentLinkedGoods.length > 1;
		productNavEl.hidden = !hasMultiple;
		if (hasMultiple && productNavCountEl) {
			productNavCountEl.textContent = `${currentGoodsIndex + 1} / ${currentLinkedGoods.length}`;
		}
	}

	function showLinkedGoods(linkedGoods) {
		currentLinkedGoods = Array.isArray(linkedGoods) ? linkedGoods : [];
		currentGoodsIndex = 0;
		updateProductNav();
		loadProductPanel(currentLinkedGoods[0]?.goods_seq);
	}

	function stepProduct(direction) {
		if (currentLinkedGoods.length < 2) return;
		currentGoodsIndex = ((currentGoodsIndex + direction) % currentLinkedGoods.length + currentLinkedGoods.length) % currentLinkedGoods.length;
		updateProductNav();
		loadProductPanel(currentLinkedGoods[currentGoodsIndex]?.goods_seq);
	}

	productNavEl?.addEventListener('click', (event) => {
		const btn = event.target.closest('[data-product-nav]');
		if (!btn) return;
		stepProduct(Number(btn.dataset.productNav));
	});

	function getLinkedGoods(slide) {
		const script = slide?.querySelector('.realtrend-linked-goods-data');
		if (!script) return [];
		try {
			return JSON.parse(script.textContent);
		} catch {
			return [];
		}
	}

	function loadProductPanel(goodsSeq) {
		if (!goodsSeq) return;
		const requestId = ++productPanelRequestSeq;
		$.get('/goods/quickview', { no: goodsSeq }, function(html) {
			if (requestId !== productPanelRequestSeq) return;
			// Strip only external <script src="..."> tags (third-party SDKs like
			// TikTok's login/share widget) — keep inline <script> blocks, since
			// those contain this popup's own interactivity (eaPlus/eaMinus, wishlist, etc.)
			const cleanHtml = html.replace(
				/<script\b[^>]*\bsrc=["'](?:https?:)?\/\/(?:www\.)?(?:tiktok|instagram|facebook|twitter|x)\.com[^"']*["'][^>]*><\/script>/gi,
				''
			);
			$('.realtrend-product-card').html(cleanHtml);
		});
	}

	const createLoopClone = (source) => {
		const clone = source.cloneNode(true);
		clone.classList.add("is-loop-clone");
		clone.classList.remove("is-active");
		clone.removeAttribute("id");
		clone.setAttribute("aria-hidden", "true");
		clone.querySelectorAll(".sf-reel__video").forEach((video) => {
			video.pause?.();
			video.removeAttribute("autoplay");
		});
		return clone;
	};

	if (slideCount > 1) {
		const firstClone = createLoopClone(slides[0]);
		const lastClone = createLoopClone(slides[slideCount - 1]);
		track.insertBefore(lastClone, slides[0]);
		track.appendChild(firstClone);
	}

	const params = new URLSearchParams(window.location.search);
	const queryReel = Number.parseInt(params.get("reel") || params.get("seq") || "", 10);

	let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
	if (activeIndex < 0) activeIndex = 0;
	if (Number.isFinite(queryReel) && queryReel > 0) {
		const querySeq = params.get("seq");
		let activeIndex = slides.findIndex((slide) => slide.dataset.seq === querySeq);
		if (activeIndex < 0) activeIndex = 0;
	}

	let isAnimating = false;
	let wheelLocked = false;
	let touchStartY = 0;
	let touchDidSwipe = false;
	let advanceTimer = null;

	const IFRAME_ADVANCE_MS = 60000; // 60 seconds
	const NEAR_END_THRESHOLD_S = 0.25;
	const TRANSITION_MS = 450;
	const SWIPE_THRESHOLD = 48;
	const WHEEL_THRESHOLD = 12;
	const WHEEL_COOLDOWN_MS = 550;

	let productPanelRequestSeq = 0;

	const getActiveSlide = () => slides[activeIndex];
	const getActiveVideo = () => getActiveSlide()?.querySelector(".sf-reel__video");

	const trackReelView = (slide) => {
		const seq = slide?.dataset?.seq;
		if (!seq) return;
		const key = `shortform_feed_view_${seq}`;
		const last = localStorage.getItem(key);
		const now = Date.now();
		if (last && now - last < 10 * 60 * 1000) return;
		localStorage.setItem(key, now);
		fetch("/shortform/track_view", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"X-Requested-With": "XMLHttpRequest",
			},
			body: `shortform_seq=${seq}`,
		});
	};

	const trackShare = () => {
		const seq = getActiveSlide()?.dataset?.seq;
		if (!seq) return;
		fetch("/shortform/track_share", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"X-Requested-With": "XMLHttpRequest",
			},
			body: `shortform_seq=${seq}`,
		});
	};

const toggleLike = async (button) => {
	if (button.dataset.busy) return;
	const slide = button.closest(".realtrend-slide");
	const seq = slide?.dataset?.seq;
	const count = button.querySelector(".sf-reel__iconcount");
	if (!seq) return;
	const wasLiked = button.classList.contains("is-active");
	const current = Number(count?.textContent || 0);
	const optimistic = current + (wasLiked ? -1 : 1);
	button.classList.toggle("is-active");
	if (count) count.textContent = optimistic > 0 ? optimistic : "";
	button.dataset.busy = "true";
	try {
		const response = await fetch("/shortform/toggle_like", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"X-Requested-With": "XMLHttpRequest",
			},
			body: `shortform_seq=${seq}`,
		});
		const res = await response.json();
		if (res.need_login) {
			button.classList.toggle("is-active", wasLiked);
			if (count) count.textContent = current > 0 ? current : "";
			if (confirm(getAlert('gv009'))) {
				window.location.href = `/member/login?return_url=${encodeURIComponent(window.location.pathname + window.location.search)}`;
			}
			return;
		}
		if (!res.success) throw new Error();
		button.classList.toggle("is-active", res.liked);
		if (count) count.textContent = res.likes_count > 0 ? res.likes_count : "";
	} catch {
		button.classList.toggle("is-active", wasLiked);
		if (count) count.textContent = current > 0 ? current : "";
	} finally {
		delete button.dataset.busy;
	}
};

const toggleSave = async (button) => {
	if (button.dataset.busy) return;
	const slide = button.closest(".realtrend-slide");
	const seq = slide?.dataset?.seq;
	const count = button.querySelector(".sf-reel__iconcount");
	if (!seq) return;
	const wasSaved = button.classList.contains("is-active");
	const current = Number(count?.textContent || 0);
	const optimistic = current + (wasSaved ? -1 : 1);
	button.classList.toggle("is-active");
	if (count) count.textContent = optimistic > 0 ? optimistic : "";
	button.dataset.busy = "true";
	try {
		const response = await fetch("/shortform/toggle_save", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"X-Requested-With": "XMLHttpRequest",
			},
			body: `shortform_seq=${seq}`,
		});
		const res = await response.json();
		if (res.need_login) {
			button.classList.toggle("is-active", wasSaved);
			if (count) count.textContent = current > 0 ? current : "";
			if (confirm(getAlert('gv009'))) {
				window.location.href = `/member/login?return_url=${encodeURIComponent(window.location.pathname + window.location.search)}`;
			}
			return;
		}
		if (!res.success) throw new Error();
		button.classList.toggle("is-active", res.saved);
		if (count) count.textContent = res.save_count > 0 ? res.save_count : "";
	} catch {
		button.classList.toggle("is-active", wasSaved);
		if (count) count.textContent = current > 0 ? current : "";
	} finally {
		delete button.dataset.busy;
	}
};
	document.querySelectorAll(".reel-like-btn").forEach((button) => {
		button.addEventListener("click", (event) => {
			event.stopPropagation();
			toggleLike(button);
		});
	});

	document.querySelectorAll(".reel-save-btn").forEach((button) => {
		button.addEventListener("click", (event) => {
			event.stopPropagation();
			toggleSave(button);
		});
	});

	document.querySelectorAll(".reel-share-btn").forEach((button) => {
		button.addEventListener("click", (event) => {
			event.stopPropagation();
			trackShare();
			openShareDialog(button);
		});
	});

	const updateTrack = (index, { animate = true } = {}) => {
		const height = syncSlideHeights();
		const visualIndex = slideCount > 1 ? index + 1 : index;
		track.style.transition = animate
			? `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
			: "none";
		track.style.transform = `translateY(-${visualIndex * height}px)`;
	};

	const isMobileSheetOpen = () =>
		window.matchMedia("(max-width: 1120px)").matches &&
		document.querySelector(".realtrend-page")?.classList.contains("is-product-sheet-open");

	const stopAdvanceWatch = () => {
		window.clearTimeout(advanceTimer);
		advanceTimer = null;
	};

	const startAdvanceWatch = () => {
		stopAdvanceWatch();
		stopEmbedProgress();
		if (getActiveVideo()) { updateProgressUI(0); return; }
		if (isMobileSheetOpen()) return;
		if (getActiveSlide()?.querySelector(".sf-reel__embed")) {
			startEmbedProgress();
			advanceTimer = window.setTimeout(() => goByDirection(1), IFRAME_ADVANCE_MS);
		}
	};

	const handleVideoEnded = (event) => {
		const slide = event.target.closest(".realtrend-slide");
		if (!slide?.classList.contains("is-active")) return;
		if (isMobileSheetOpen()) return;
		goByDirection(1);
	};

	track.querySelectorAll(".sf-reel__video").forEach((video) => {
		video.addEventListener("timeupdate", handleVideoTimeUpdate);
		video.addEventListener("ended", handleVideoEnded);
	});

	const setSlideMediaState = (slide, isActive) => {
		if (!slide) return;
		const media = slide.querySelector(".realtrend-media");

		const video = slide.querySelector(".sf-reel__video");
		if (video) {
			if (isActive) {
				video.currentTime = 0;
				video.muted = true;
				video.play().catch(() => {});
			} else {
				video.pause();
			}
			return;
		}

		const ytIframe = slide.querySelector(".sf-reel__yt-frame");
		if (ytIframe) {
			sendYoutubeCommand(ytIframe, isActive ? "playVideo" : "pauseVideo");
			setMediaPausedUI(media, !isActive);
			return;
		}

		const ttIframe = slide.querySelector(".sf-reel__tt-frame");
		if (ttIframe) {
			sendTiktokCommand(ttIframe, isActive ? "play" : "pause");
			setMediaPausedUI(media, !isActive);
		}
	};

	let nativeProgressRaf = null;

	const stopNativeProgress = () => {
		if (nativeProgressRaf) cancelAnimationFrame(nativeProgressRaf);
		nativeProgressRaf = null;
	};

	const tickNativeProgress = () => {
		const video = getActiveVideo();
		if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
			nativeProgressRaf = requestAnimationFrame(tickNativeProgress);
			return;
		}
		if (!isScrubbing) updateProgressUI((video.currentTime / video.duration) * 100);
		nativeProgressRaf = requestAnimationFrame(tickNativeProgress);
	};

	const startNativeProgress = () => {
		stopNativeProgress();
		nativeProgressRaf = requestAnimationFrame(tickNativeProgress);
	};

	const setActiveSlide = (index) => {
		if (isAnimating) return;
		const nextIndex = ((index % slideCount) + slideCount) % slideCount;
		const currentSlide = getActiveSlide();
		const wrappingForward = slideCount > 1 && activeIndex === slideCount - 1 && nextIndex === 0 && index > activeIndex;
		const wrappingBackward = slideCount > 1 && activeIndex === 0 && nextIndex === slideCount - 1 && index < activeIndex;

		const applyActiveState = (targetIndex) => {
			updateProgressUI(0);
			setSlideMediaState(currentSlide, false);
			activeIndex = targetIndex;
			const nextSlide = slides[activeIndex];
			trackReelView(nextSlide);

			showLinkedGoods(getLinkedGoods(nextSlide));

			slides.forEach((slide, i) => {
				const isActive = i === activeIndex;
				slide.classList.toggle("is-active", isActive);
				slide.setAttribute("aria-hidden", isActive ? "false" : "true");
			});
			setSlideMediaState(nextSlide, true);
			applyMuteState();
			startAdvanceWatch();
		};

		if (wrappingForward || wrappingBackward) {
			isAnimating = true;
			applyActiveState(nextIndex);
			updateTrack(wrappingForward ? slideCount : -1, { animate: true });
			window.setTimeout(() => {
				updateTrack(activeIndex, { animate: false });
				void track.offsetHeight;
				isAnimating = false;
			}, TRANSITION_MS);
			return;
		}

		applyActiveState(nextIndex);
		updateTrack(activeIndex, { animate: true });
		isAnimating = true;
		window.setTimeout(() => {
			isAnimating = false;
		}, TRANSITION_MS);
	};

	const goByDirection = (direction) => {
		setActiveSlide(activeIndex + direction);
	};

	const isSwipeBlockedTarget = (target) =>
		Boolean(target.closest(".realtrend-social, .sf-reel__side-actions, .realtrend-mobile-product, .sf-reel__source-icon, .realtrend-panel, .realtrend-nav-arrows"));

	const lockWheel = () => {
		wheelLocked = true;
		window.setTimeout(() => {
			wheelLocked = false;
		}, WHEEL_COOLDOWN_MS);
	};

	navButtons.forEach((button) => {
		button.addEventListener("click", () => {
			const direction = Number(button.dataset.reelDirection || 1);
			goByDirection(direction);
		});
	});

	const handleReelWheel = (event) => {
		if (isSwipeBlockedTarget(event.target)) return;
		const isDesktop = window.matchMedia("(min-width: 1121px)").matches;
		if (isDesktop) event.preventDefault();
		if (Math.abs(event.deltaY) < WHEEL_THRESHOLD) return;
		if (wheelLocked || isAnimating) return;
		event.preventDefault();
		lockWheel();
		goByDirection(event.deltaY > 0 ? 1 : -1);
	};

	const handleTouchStart = (event) => {
		if (isSwipeBlockedTarget(event.target)) return;
		touchStartY = event.touches[0]?.clientY ?? 0;
		touchDidSwipe = false;
	};

	const handleTouchEnd = (event) => {
		if (isSwipeBlockedTarget(event.target)) return;
		const touchEndY = event.changedTouches[0]?.clientY ?? 0;
		const delta = touchStartY - touchEndY;
		if (Math.abs(delta) > SWIPE_THRESHOLD) {
			touchDidSwipe = true;
			goByDirection(delta > 0 ? 1 : -1);
		}
	};

	document.addEventListener("wheel", handleReelWheel, { passive: false });
	feed.addEventListener("touchstart", handleTouchStart, { passive: true });
	feed.addEventListener("touchend", handleTouchEnd, { passive: true });

	document.addEventListener("keydown", (event) => {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			goByDirection(1);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			goByDirection(-1);
		}
	});

	let shareDialog = null;
	let shareTrigger = null;
	let shareCopyTimer = null;

	const getShareReelName = () =>
		getActiveSlide()?.querySelector(".realtrend-mobile-product-copy h3")?.textContent?.trim() ||
		"TrendyPicker Real Trend";

	const getShareReelUrl = () => {
		const url = new URL(window.location.href);
		url.searchParams.set("reel", String(activeIndex + 1));
		url.searchParams.delete("seq");
		return url.href;
	};

	const ensureShareDialog = () => {
		if (shareDialog) return shareDialog;
		shareDialog = document.createElement("div");
		shareDialog.className = "deal-share-dialog";
		shareDialog.id = "realtrend-share-dialog";
		shareDialog.hidden = true;
		shareDialog.setAttribute("aria-hidden", "true");
		shareDialog.innerHTML = `
			<button type="button" class="deal-share-backdrop" data-deal-share-close aria-label="Close share dialog"></button>
			<section class="deal-share-modal" role="dialog" aria-modal="true" aria-labelledby="realtrend-share-title">
				<button type="button" class="deal-share-close" data-deal-share-close aria-label="Close share dialog">&times;</button>
				<p class="deal-share-eyebrow">Share</p>
				<h2 id="realtrend-share-title">Share this reel</h2>
				<p class="deal-share-product" data-deal-share-name></p>
				<label class="deal-share-link-field">
					<span class="sr-only">Reel link</span>
					<input type="text" data-deal-share-input readonly>
					<button type="button" class="deal-share-copy" data-deal-share-copy>Copy Link</button>
				</label>
				<div class="deal-share-social" aria-label="Share on social">
					<button type="button" class="deal-share-social-button" data-deal-share-channel="sms" title="Messages" aria-label="Share via Messages">
						<img src="/data/skin/responsive_food_mealkit_gl/images/icon/icon-social-msg.png" alt="" aria-hidden="true">
					</button>
					<button type="button" class="deal-share-social-button" data-deal-share-channel="instagram" title="Instagram" aria-label="Share on Instagram">
						<img src="/data/skin/responsive_food_mealkit_gl/images/icon/icon-social-ig.png" alt="" aria-hidden="true">
					</button>
					<button type="button" class="deal-share-social-button" data-deal-share-channel="facebook" title="Facebook" aria-label="Share on Facebook">
						<img src="/data/skin/responsive_food_mealkit_gl/images/icon/icon-social-fb.png" alt="" aria-hidden="true">
					</button>
					<button type="button" class="deal-share-social-button" data-deal-share-channel="twitter" title="X" aria-label="Share on X">
						<img src="/data/skin/responsive_food_mealkit_gl/images/icon/icon-social-x.png" alt="" aria-hidden="true">
					</button>
					<button type="button" class="deal-share-social-button" data-deal-share-channel="whatsapp" title="WhatsApp" aria-label="Share on WhatsApp">
						<img src="/data/skin/responsive_food_mealkit_gl/images/icon/icon-social-wa.png" alt="" aria-hidden="true">
					</button>
				</div>
				<p class="deal-share-status" data-deal-share-status aria-live="polite"></p>
			</section>
		`;
		document.body.appendChild(shareDialog);

		const closeShareDialog = () => {
			shareDialog.hidden = true;
			shareDialog.setAttribute("aria-hidden", "true");
			document.body.classList.remove("is-deal-share-open");
			if (shareTrigger && typeof shareTrigger.focus === "function") shareTrigger.focus();
			shareTrigger = null;
		};

		const setStatus = (message, isSuccess = false) => {
			const status = shareDialog.querySelector("[data-deal-share-status]");
			if (!status) return;
			status.textContent = message;
			status.classList.toggle("is-success", isSuccess);
			window.clearTimeout(shareCopyTimer);
			if (message) {
				shareCopyTimer = window.setTimeout(() => {
					status.textContent = "";
					status.classList.remove("is-success");
				}, 2200);
			}
		};

		const copyShareLink = async () => {
			const input = shareDialog.querySelector("[data-deal-share-input]");
			const value = input?.value || "";
			if (!value) return;
			try {
				if (navigator.clipboard?.writeText) {
					await navigator.clipboard.writeText(value);
				} else {
					input.focus();
					input.select();
					document.execCommand("copy");
				}
				setStatus("Link copied!", true);
			} catch {
				setStatus("Could not copy the link.");
			}
		};

		shareDialog.querySelectorAll("[data-deal-share-close]").forEach((button) => {
			button.addEventListener("click", closeShareDialog);
		});
		shareDialog.querySelector("[data-deal-share-copy]")?.addEventListener("click", copyShareLink);
		shareDialog.querySelectorAll("[data-deal-share-channel]").forEach((button) => {
			button.addEventListener("click", async () => {
				const channel = button.dataset.dealShareChannel;
				const input = shareDialog.querySelector("[data-deal-share-input]");
				const name = shareDialog.querySelector("[data-deal-share-name]")?.textContent || "TrendyPicker Real Trend";
				const url = input?.value || window.location.href;

				if (channel === "facebook" || channel === "twitter" || channel === "whatsapp") {
					const snsChannel = channel === "facebook" ? "fa" : channel === "twitter" ? "tw" : "wa";
					const enc_tit = encodeURIComponent(`${name} - TrendyPicker`);
					const enc_sbj = encodeURIComponent(name);
 					const enc_url = encodeURIComponent(url);
					snsWin(snsChannel, enc_tit, enc_sbj, "", enc_url, isMobile.any());
 					return;
				}

				if (channel === "sms") {
					const encodedText = encodeURIComponent(`Check out ${name} on TrendyPicker\n${url}`);
					window.location.href = `sms:?&body=${encodedText}`;
					return;
				}

				if (channel === "instagram") {
					let copied = false;
					if (input) {
						input.focus();
						input.select();
						try {
							copied = document.execCommand("copy");
						} catch {
							copied = false;
						}
					}

					if (navigator.clipboard?.writeText) {
						navigator.clipboard.writeText(url).catch(() => {});
					}

					setStatus(
						copied ? "Link copied. Paste it in Instagram." : "Copy the link, then open Instagram.",
						copied
					);

					const igWindow = window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
					if (!igWindow) setStatus("Pop-up blocked — allow pop-ups to open Instagram.");
					try {
						if (navigator.clipboard?.writeText) {
							await navigator.clipboard.writeText(url);
						} else if (input) {
							input.focus();
							input.select();
							document.execCommand("copy");
						}
						setStatus("Link copied. Paste it in Instagram.", true);
					} catch {
						setStatus("Copy the link, then open Instagram.");
					}
					if (!igWindow) setStatus("Pop-up blocked — allow pop-ups to open Instagram.");
				}
			});
		});

		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && shareDialog && !shareDialog.hidden) closeShareDialog();
		});

		shareDialog._close = closeShareDialog;
		shareDialog._setStatus = setStatus;
		return shareDialog;
	};

	const openShareDialog = (trigger) => {
		const dialog = ensureShareDialog();
		const nameEl = dialog.querySelector("[data-deal-share-name]");
		const input = dialog.querySelector("[data-deal-share-input]");
		shareTrigger = trigger || null;
		if (nameEl) nameEl.textContent = getShareReelName();
		if (input) input.value = getShareReelUrl();
		dialog._setStatus?.("");
		dialog.hidden = false;
		dialog.setAttribute("aria-hidden", "false");
		document.body.classList.add("is-deal-share-open");
		dialog.querySelector(".deal-share-copy")?.focus();
	};

	window.TrendyPicker?.savedPosts?.syncButtons?.(document);

	window.addEventListener("resize", () => {
		updateTrack(activeIndex, { animate: false });
	});

	if (typeof ResizeObserver !== "undefined") {
		const reelResizeObserver = new ResizeObserver(() => {
			updateTrack(activeIndex, { animate: false });
		});
		reelResizeObserver.observe(feed);
	}

	document.addEventListener("visibilitychange", () => {
		if (document.hidden) {
			stopAdvanceWatch();
		} else {
			startAdvanceWatch();
		}
		const video = getActiveVideo();
		if (!video) return;
		if (document.hidden) {
			video.pause();
		} else {
			video.play().catch(() => {});
		}
	});

	const syncSlideHeights = () => {
		const height = feed.clientHeight;
		track.querySelectorAll(".realtrend-slide").forEach((slide) => {
			slide.style.height = `${height}px`;
		});
		return height;
	};

	setSlideMediaState(getActiveSlide(), true);
	applyMuteState();
	updateTrack(activeIndex, { animate: false });
	trackReelView(getActiveSlide());

	showLinkedGoods(getLinkedGoods(getActiveSlide()));

	startAdvanceWatch();
	startNativeProgress();

	const realtrendPageEl = document.querySelector(".realtrend-page");

	const openMobileQuickview = (goodsSeq) => {
		if (!goodsSeq || !realtrendPageEl) return;
		loadProductPanel(goodsSeq);
		realtrendPageEl.classList.add("is-product-sheet-open");
	};

	const closeMobileQuickview = () => {
		realtrendPageEl?.classList.remove("is-product-sheet-open");
		startAdvanceWatch();
	};

	const getCardGoodsSeq = (el) => el?.closest(".realtrend-mobile-product-card")?.dataset?.goodsSeq;

	document.querySelectorAll(".realtrend-mobile-add").forEach((button) => {
		button.addEventListener("click", (event) => {
			event.preventDefault();
			event.stopPropagation();
			openMobileQuickview(getCardGoodsSeq(button));
		});
	});

	document.querySelectorAll(".realtrend-mobile-product-thumb, .realtrend-mobile-product-copy h3").forEach((el) => {
		el.tabIndex = 0;
		el.setAttribute("role", "button");
		el.addEventListener("click", (event) => {
			event.stopPropagation();
			openMobileQuickview(getCardGoodsSeq(el));
		});
		el.addEventListener("keydown", (event) => {
			if (event.key !== "Enter" && event.key !== " ") return;
			event.preventDefault();
			openMobileQuickview(getCardGoodsSeq(el));
		});
	});

	document.querySelectorAll(".realtrend-product-sheet-close").forEach((button) => {
		button.addEventListener("click", (event) => {
			event.stopPropagation();
			closeMobileQuickview();
		});
	});

	document.querySelector(".realtrend-panel")?.addEventListener("click", (event) => {
		if (event.target.closest(".realtrend-product-card, .realtrend-product-sheet-close")) return;
		closeMobileQuickview();
	}, true);

	const YOUTUBE_ORIGIN = "https://www.youtube.com";
	const TIKTOK_ORIGIN = "https://www.tiktok.com";

	function sendYoutubeCommand(iframe, func) {
		if (!iframe?.contentWindow) return;
		iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func, args: "" }), "*");
	}

	function sendTiktokCommand(iframe, type, value) {
		if (!iframe?.contentWindow) return;
		const payload = { type, "x-tiktok-player": true };
		if (value !== undefined) payload.value = value;
		iframe.contentWindow.postMessage(payload, "*");
	}

	function setMediaPausedUI(media, isPaused) {
		if (!media) return;
		media.classList.toggle("is-paused", isPaused);
		const toggle = media.querySelector(".realtrend-play-toggle");
		if (!toggle) return;
		toggle.setAttribute("aria-pressed", String(!isPaused));
		toggle.setAttribute("aria-label", isPaused ? "Play reel" : "Pause reel");
	}

	function toggleMediaPlayback(media) {
		if (!media) return;

		const video = media.querySelector(".sf-reel__video");
		if (video) {
			if (video.paused) video.play().catch(() => {});
			else video.pause();
			return;
		}

		const ttIframe = media.querySelector(".sf-reel__tt-frame");
		if (ttIframe) {
			const willPause = !media.classList.contains("is-paused");
			sendTiktokCommand(ttIframe, willPause ? "pause" : "play");
			setMediaPausedUI(media, willPause);
			return;
		}

		const ytIframe = media.querySelector(".sf-reel__yt-frame");
		if (ytIframe) {
			const willPause = !media.classList.contains("is-paused");
			sendYoutubeCommand(ytIframe, willPause ? "pauseVideo" : "playVideo");
			setMediaPausedUI(media, willPause); // update immediately — don't wait on onStateChange, which isn't reliably echoed back on the raw postMessage protocol
		}

	}

	document.addEventListener("click", (event) => {
		if (event.target.closest(".realtrend-social, .sf-reel__side-actions, .realtrend-mobile-product, .sf-reel__source-icon")) return;
	
		const toggleTarget = event.target.closest("[data-embed-toggle], .realtrend-play-toggle, .sf-reel__video");
		if (!toggleTarget) return;

		const media = toggleTarget.closest(".realtrend-media");
		if (!media) return;

		event.stopPropagation();
		toggleMediaPlayback(media);
	});

	// Native <video>: trust the browser's own play/pause events, since they fire
	// for any state change — click, autoplay policy blocking it, .pause() elsewhere, etc.
	document.querySelectorAll(".sf-reel__video").forEach((video) => {
		const media = video.closest(".realtrend-media");
		video.addEventListener("play", () => setMediaPausedUI(media, false));
		video.addEventListener("pause", () => setMediaPausedUI(media, true));
	});

	// YouTube requires an explicit "listening" handshake before it will broadcast
	// onStateChange messages back to the parent page via raw postMessage.
	document.querySelectorAll(".sf-reel__yt-frame").forEach((iframe) => {
		iframe.addEventListener("load", () => {
			iframe.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: "" }), "*");
		});
	});

	window.addEventListener("message", (event) => {
		if (event.origin !== YOUTUBE_ORIGIN) return;
		let data;
		try { data = JSON.parse(event.data); } catch { return; }
		if (data.event !== "onStateChange") return;

		const media = [...document.querySelectorAll(".sf-reel__yt-frame")]
			.find((frame) => frame.contentWindow === event.source)
			?.closest(".realtrend-media");
		if (!media) return;

		setMediaPausedUI(media, data.info === 2); // YT.PlayerState.PAUSED === 2
	});

	const seekFromClientX = (bar, clientX) => {
		const video = getActiveVideo();
		if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
		const rect = bar.getBoundingClientRect();
		if (!rect.width) return;
		const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		video.currentTime = ratio * video.duration;
		updateProgressUI(ratio * 100);
	};

	progressBars.forEach((bar) => {
		bar.addEventListener("pointerdown", (event) => {
			if (!getActiveVideo()) return; // no scrub on embeds
			isScrubbing = true;
			bar.classList.add("is-scrubbing");
			bar.setPointerCapture(event.pointerId);
			seekFromClientX(bar, event.clientX);
				event.preventDefault();
			event.stopPropagation();
		});
		bar.addEventListener("pointermove", (event) => {
			if (!isScrubbing) return;
			seekFromClientX(bar, event.clientX);
		});
		bar.addEventListener("pointerup", (event) => {
			isScrubbing = false;
			bar.classList.remove("is-scrubbing");
			event.stopPropagation();
		});
	});

	document.querySelectorAll('.realtrend-mobile-product').forEach((section) => {
		const track = section.querySelector('.realtrend-mobile-product-track');
		const cards = track ? Array.from(track.children) : [];
		if (!track || cards.length === 0) return;

		const prevBtn = section.querySelector('[data-mobile-product-nav="-1"]');
		const nextBtn = section.querySelector('[data-mobile-product-nav="1"]');
		const countEl = section.querySelector('.realtrend-mobile-product-count');
		let index = 0;

		const render = () => {
			track.style.transform = `translateX(-${index * 100}%)`;
			if (countEl) countEl.textContent = cards.length > 1 ? `${index + 1} / ${cards.length}` : '';
			if (prevBtn) prevBtn.hidden = cards.length < 2;
			if (nextBtn) nextBtn.hidden = cards.length < 2;
		};

		const go = (direction) => {
			index = ((index + direction) % cards.length + cards.length) % cards.length;
			render();
		};

		prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); go(-1); });
		nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); go(1); });

		let startX = 0;
		const SWIPE_THRESHOLD_X = 32;

		track.addEventListener('touchstart', (e) => {
			startX = e.touches[0]?.clientX ?? 0;
		}, { passive: true });

		track.addEventListener('touchend', (e) => {
			const endX = e.changedTouches[0]?.clientX ?? 0;
			const delta = startX - endX;
			if (Math.abs(delta) > SWIPE_THRESHOLD_X) go(delta > 0 ? 1 : -1);
		}, { passive: true });

		render();
	});
})();
