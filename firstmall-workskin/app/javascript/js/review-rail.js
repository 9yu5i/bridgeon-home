(() => {

    const initReviewMarquee = () => {
        const rail = document.getElementById("review-rail");
        if (!rail) return;

        const reduceMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

        const originalCards = Array.from(rail.children).filter(
            (child) => !child.classList.contains("is-loop-clone")
        );

        const getProductHref = (card) => {
            if (!card) return "";

            const storedHref = card.dataset.productDetailLink;
            if (storedHref) return storedHref;

            const goodsLink = card.querySelector('a[href*="/goods/view"]');
            if (goodsLink) return goodsLink.getAttribute("href") || "";

            const cartButton = card.querySelector(".review-cart-button");
            const match = String(cartButton?.getAttribute("onclick") || "").match(
                /displayAddToCartQuickview2?\s*\([^,]+,\s*['"]?(\d+)/
            );
            return match ? `/goods/view?no=${match[1]}` : "";
        };

        const navigateToProduct = (href) => {
            if (!href) return;
            try {
                window.top.location.href = href;
            } catch (_error) {
                window.location.href = href;
            }
        };

        originalCards.forEach((card) => {
            const href = getProductHref(card);
            if (!href) return;

            card.dataset.productDetailLink = href;
            const imageLink = card.querySelector(".review-img-link");
            const body = card.querySelector(".review-body");
            if (imageLink) imageLink.href = href;
            if (body) {
                body.tabIndex = 0;
                body.setAttribute("role", "link");
                body.setAttribute("aria-label", "View product details");
            }
        });

        rail.addEventListener("click", (event) => {
            const target = event.target.closest(".review-img, .review-body");
            if (!target || !rail.contains(target)) return;

            const href = getProductHref(target.closest(".review-card"));
            if (!href) return;
            event.preventDefault();
            event.stopPropagation();
            navigateToProduct(href);
        }, true);

        rail.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            const target = event.target.closest(".review-img-link, .review-body");
            if (!target || !rail.contains(target)) return;

            const href = getProductHref(target.closest(".review-card"));
            if (!href) return;
            event.preventDefault();
            navigateToProduct(href);
        });

        const clearClones = () => {
            rail.querySelectorAll(".is-loop-clone").forEach((clone) => clone.remove());

            originalCards.forEach((card) => {
                rail.appendChild(card);
            });

            rail.classList.remove("is-marquee");
            rail.style.removeProperty("--review-marquee-distance");
        };


        const syncDistance = () => {
            const firstOriginal = originalCards[0];
            const firstClone = rail.querySelector(".is-loop-clone");

            if (!firstOriginal || !firstClone) return;

            const distance = firstClone.offsetLeft - firstOriginal.offsetLeft;

            if (distance > 0) {
                rail.style.setProperty(
                    "--review-marquee-distance",
                    `${Math.round(distance)}px`
                );
            }
        };


        const enableMarquee = () => {
            clearClones();

            if (reduceMotionMedia.matches) return;

            originalCards.forEach((card) => {
                const clone = card.cloneNode(true);

                clone.classList.add("is-loop-clone");
                clone.setAttribute("aria-hidden", "true");

                clone.querySelectorAll("a, button").forEach((el) => {
                    el.setAttribute("tabindex", "-1");
                    el.addEventListener("click", (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    });
                });
                clone.querySelectorAll(".review-body").forEach((el) => {
                    el.setAttribute("tabindex", "-1");
                });

                rail.appendChild(clone);
            });

            rail.classList.add("is-marquee");

            requestAnimationFrame(() => {
                syncDistance();

                requestAnimationFrame(syncDistance);
            });
        };

        enableMarquee();

        reduceMotionMedia.addEventListener(
            "change",
            enableMarquee
        );


        window.addEventListener("resize", () => {
            if (!rail.classList.contains("is-marquee")) {
                return;
            }

            syncDistance();
        });
    };

    initReviewMarquee();

})();
