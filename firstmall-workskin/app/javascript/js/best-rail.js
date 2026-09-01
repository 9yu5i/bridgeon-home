(() => {

    const SECTION_SELECTOR = ".seller-section";
    const PANEL_SELECTOR = "[data-tab-panel]";
    const RAIL_SELECTOR = ".best-seller-rail";
    const TAB_BUTTON_SELECTOR = ".tag-tabs button";
    const ARROW_SELECTOR = '[data-scroll="best-seller-rail"]';

    const DRAG_THRESHOLD = 8;
    const RAIL_EASING = "linear";
    const AUTO_INTERVAL = 4000;

    // Shared across every rail on the page - same breakpoint everywhere the
    // rail switches from a horizontal loop to a static grid.
    const disableLoopMedia = window.matchMedia("(max-width: 1120px)");
    const reduceMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

    const getDuration = () => (reduceMotionMedia.matches ? 1 : 420);

    /**
     * Builds an independent loop/drag/animate controller for a single rail
     * element. No IDs involved - everything is scoped to `rail` directly, so
     * this works whether there's one rail on the page or one per tab panel.
     */
    const createRailController = (rail) => {

        const isLoopDisabled = () => disableLoopMedia.matches;

        let originalCards = Array.from(rail.children).filter(
            (card) => !card.classList.contains("is-loop-clone")
        );

        let isAnimating = false;
        let autoTimer = null;

        let dragActive = false;
        let didDrag = false;

        let startX = 0;
        let currentX = 0;

        let activeAnimation = null;

        const getGap = () =>
            parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap) || 0;

        const getActiveCards = () =>
            Array.from(rail.children).filter(
                (card) =>
                    !card.classList.contains("is-loop-clone") &&
                    !card.classList.contains("is-tab-hidden") &&
                    !card.hidden
            );

        const getStep = (direction = 1) => {
            const cards = getActiveCards();
            const card = direction > 0 ? cards[0] : cards[cards.length - 1];
            if (!card) return 0;
            return card.getBoundingClientRect().width + getGap();
        };

        const resetRailPosition = () => {
            rail.style.transition = "none";
            rail.style.transform = "translateX(0)";
            rail.scrollLeft = 0;
        };

        const resetToOriginalOrder = () => {
            window.clearInterval(autoTimer);
            autoTimer = null;

            activeAnimation?.cancel();
            activeAnimation = null;

            isAnimating = false;
            dragActive = false;
            didDrag = false;
            currentX = 0;

            rail.classList.remove("is-dragging");

            rail.querySelectorAll(".is-loop-clone").forEach((clone) => clone.remove());

            originalCards.forEach((card) => {
                if (!card.classList.contains("is-tab-hidden") && !card.hidden) {
                    rail.appendChild(card);
                }
            });

            originalCards.forEach((card) => {
                if (card.classList.contains("is-tab-hidden") || card.hidden) {
                    rail.appendChild(card);
                }
            });

            resetRailPosition();
        };

        const animateRail = ({ from, to, onFinish }) => {
            if (Math.abs(to - from) < 0.5) {
                onFinish();
                resetRailPosition();
                isAnimating = false;
                return;
            }

            const fromTransform = `translateX(${from}px)`;
            const toTransform = `translateX(${to}px)`;

            rail.style.transition = "none";
            rail.style.transform = fromTransform;
            rail.getBoundingClientRect();

            const runAnimation = () => {
                if (typeof rail.animate === "function") {
                    const animation = rail.animate(
                        [{ transform: fromTransform }, { transform: toTransform }],
                        { duration: getDuration(), easing: RAIL_EASING, fill: "both" }
                    );

                    activeAnimation = animation;
                    let finished = false;

                    animation.onfinish = () => {
                        finished = true;
                        onFinish();
                        resetRailPosition();
                        animation.cancel();
                        activeAnimation = null;
                        isAnimating = false;
                    };

                    animation.oncancel = () => {
                        if (finished) return;
                        resetRailPosition();
                        activeAnimation = null;
                        isAnimating = false;
                    };

                    return;
                }

                rail.style.transition = `transform ${getDuration()}ms ${RAIL_EASING}`;
                rail.style.transform = toTransform;

                const onEnd = () => {
                    rail.removeEventListener("transitionend", onEnd);
                    onFinish();
                    resetRailPosition();
                    isAnimating = false;
                };

                rail.addEventListener("transitionend", onEnd);
            };

            requestAnimationFrame(runAnimation);
        };

        const finishForward = (fromX = 0) => {
            const step = getStep(1);
            const activeCards = getActiveCards();
            const firstCard = activeCards[0];

            if (!step || !firstCard) {
                isAnimating = false;
                return;
            }

            const loopClone = firstCard.cloneNode(true);
            loopClone.setAttribute("aria-hidden", "true");
            loopClone.classList.add("is-loop-clone");
            rail.appendChild(loopClone);

            animateRail({
                from: fromX,
                to: -step,
                onFinish: () => {
                    rail.appendChild(firstCard);
                    loopClone.remove();
                },
            });
        };

        const finishBackward = (fromX = 0) => {
            const step = getStep(-1);
            const activeCards = getActiveCards();
            const firstCard = activeCards[0];
            const lastCard = activeCards[activeCards.length - 1];

            if (!step || !firstCard || !lastCard) {
                isAnimating = false;
                return;
            }

            const loopClone = lastCard.cloneNode(true);
            loopClone.setAttribute("aria-hidden", "true");
            loopClone.classList.add("is-loop-clone");

            rail.style.transition = "none";
            rail.style.transform = `translateX(${fromX}px)`;
            rail.insertBefore(loopClone, firstCard);

            const from = fromX - step;
            rail.style.transform = `translateX(${from}px)`;
            rail.getBoundingClientRect();

            animateRail({
                from,
                to: 0,
                onFinish: () => {
                    rail.insertBefore(lastCard, loopClone);
                    loopClone.remove();
                },
            });
        };

        const shift = (direction) => {
            if (isLoopDisabled()) {
                resetToOriginalOrder();
                return;
            }

            if (isAnimating || getActiveCards().length < 2) return;

            isAnimating = true;

            if (direction > 0) finishForward(0);
            else finishBackward(0);
        };

        const snapBack = () => {
            rail.style.transition = `transform 0.28s ${RAIL_EASING}`;
            rail.style.transform = "translateX(0)";

            const onEnd = () => {
                rail.removeEventListener("transitionend", onEnd);
                rail.style.transition = "none";
            };

            rail.addEventListener("transitionend", onEnd);
        };

        const stopAuto = () => {
            window.clearInterval(autoTimer);
            autoTimer = null;
        };

        const startAuto = (direction) => {
            if (isLoopDisabled()) {
                resetToOriginalOrder();
                return;
            }

            if (reduceMotionMedia.matches) {
                shift(direction);
                return;
            }

            stopAuto();
            shift(direction);

            autoTimer = window.setInterval(() => shift(direction), AUTO_INTERVAL);
        };

        const isInteractiveRailTarget = (event) =>
            Boolean(event.target.closest("button, a, input, select, textarea, .reel-product em"));

        rail.addEventListener("pointerdown", (event) => {
            if (isLoopDisabled()) return;
            if (isAnimating) return;
            if (event.pointerType === "mouse" && event.button !== 0) return;
            if (isInteractiveRailTarget(event)) return;

            stopAuto();

            dragActive = true;
            didDrag = false;
            startX = event.clientX;
            currentX = 0;

            rail.setPointerCapture(event.pointerId);
        });

        rail.addEventListener("pointermove", (event) => {
            if (!dragActive || isAnimating) return;

            currentX = event.clientX - startX;

            if (!didDrag && Math.abs(currentX) < DRAG_THRESHOLD) return;

            if (!didDrag) {
                didDrag = true;
                rail.classList.add("is-dragging");
            }

            rail.style.transition = "none";
            rail.style.transform = `translateX(${currentX}px)`;
        });

        const endDrag = () => {
            if (!dragActive) return;

            dragActive = false;

            rail.classList.remove("is-dragging");

            if (!didDrag) {
                currentX = 0;
                return;
            }

            const forwardStep = getStep(1);
            const backwardStep = getStep(-1);
            const threshold = Math.min(Math.max(forwardStep, backwardStep) * 0.15, 48);

            if (currentX <= -threshold) {
                isAnimating = true;
                finishForward(currentX);
            } else if (currentX >= threshold) {
                isAnimating = true;
                finishBackward(currentX);
            } else {
                snapBack();
            }

            currentX = 0;
        };

        rail.addEventListener("pointerup", endDrag);
        rail.addEventListener("pointercancel", endDrag);

        rail.addEventListener(
            "click",
            (event) => {
                if (!didDrag) return;
                didDrag = false;
                event.preventDefault();
                event.stopPropagation();
            },
            true
        );

        disableLoopMedia.addEventListener("change", () => {
            if (isLoopDisabled()) resetToOriginalOrder();
        });

        // Fired by the tab-switch handler below (on both the outgoing and
        // incoming rail) - clears clones, resyncs the tracked card order,
        // and stops this rail's auto-loop timer.
        rail.addEventListener("trendypicker:railfilterchange", () => {
            rail.querySelectorAll(".is-loop-clone").forEach((clone) => clone.remove());
            originalCards = Array.from(rail.children).filter(
                (card) => !card.classList.contains("is-loop-clone")
            );
            resetToOriginalOrder();
        });

        if (isLoopDisabled()) resetToOriginalOrder();

        return { stopAuto, startAuto, resetToOriginalOrder };
    };

    const initSection = (section) => {

        const panels = Array.from(section.querySelectorAll(PANEL_SELECTOR));
        if (!panels.length) return;

        const tabButtons = Array.from(section.querySelectorAll(TAB_BUTTON_SELECTOR));
        const prevButton = section.querySelector(`${ARROW_SELECTOR}[data-direction="-1"]`);
        const nextButton = section.querySelector(`${ARROW_SELECTOR}[data-direction="1"]`);
        const railWrap = section.querySelector(".rail-wrap");

        const entries = panels
            .map((panel) => {
                const rail = panel.querySelector(RAIL_SELECTOR);
                if (!rail) return null;
                return { panel, rail, controller: createRailController(rail) };
            })
            .filter(Boolean);

        if (!entries.length) return;

        const findEntryForPanel = (panel) =>
            entries.find((entry) => entry.panel === panel);

        // Whichever panel isn't hidden on load is the active one.
        let active =
            entries.find((entry) => !entry.panel.classList.contains("hide")) || entries[0];

        nextButton?.addEventListener("click", () => active.controller.startAuto(1));
        prevButton?.addEventListener("click", () => active.controller.startAuto(-1));
        railWrap?.addEventListener("mouseleave", () => active.controller.stopAuto());

        tabButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const target = button.getAttribute("data-tab");

                tabButtons.forEach((b) => {
                    const isActive = b === button;
                    b.classList.toggle("is-active", isActive);
                    b.setAttribute("aria-selected", isActive ? "true" : "false");
                });

                let nextPanel = null;

                panels.forEach((panel) => {
                    const match = panel.getAttribute("data-tab-panel") === target;
                    panel.classList.toggle("hide", !match);
                    if (match) nextPanel = panel;
                });

                // Reset every rail on every tab click - simplest guarantee
                // that whichever tab you land on (and whichever one you
                // left) always starts from the beginning.
                entries.forEach((entry) => entry.controller.resetToOriginalOrder());

                if (nextPanel) {
                    const nextEntry = findEntryForPanel(nextPanel);
                    if (nextEntry) active = nextEntry;
                }
            });
        });
    };

    document.querySelectorAll(SECTION_SELECTOR).forEach(initSection);

})();
