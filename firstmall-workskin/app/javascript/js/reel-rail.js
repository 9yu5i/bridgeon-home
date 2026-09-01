(() => {

const scrollButtons = document.querySelectorAll("[data-scroll]");

scrollButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const rail = document.getElementById(button.dataset.scroll);

        if (!rail) return;

        if (
            rail.classList.contains("trend-rail") ||
            rail.classList.contains("seller-rail")
        ) {
            return;
        }

        const direction = Number(button.dataset.direction || 1);

        rail.scrollBy({
            left: direction * Math.max(rail.clientWidth * 0.8, 240),
            behavior: "smooth",
        });

    });

});


const initLoopRail = ({ railId, autoLoop = true, autoStartOnLoad = false }) => {

    const rail = document.getElementById(railId);

    const nextButton = document.querySelector(
        `[data-scroll="${railId}"][data-direction="1"]`
    );

    const prevButton = document.querySelector(
        `[data-scroll="${railId}"][data-direction="-1"]`
    );


    if (!rail || !nextButton || !prevButton) return;


    const disableLoopQuery =
        railId === "seller-rail"
            ? "(max-width: 1120px)"
            : railId === "trend-rail"
                ? null
                : "(max-width: 760px)";


    const disableLoopMedia = disableLoopQuery
        ? window.matchMedia(disableLoopQuery)
        : null;


    const isLoopDisabled = () =>
        disableLoopMedia
            ? disableLoopMedia.matches
            : false;



    let originalCards = Array.from(rail.children).filter(
        (card) => !card.classList.contains("is-loop-clone")
    );


    let isAnimating = false;
    let autoTimer = null;

    let dragActive = false;
    let didDrag = false;

    let startX = 0;
    let currentX = 0;

    const DRAG_THRESHOLD = 8;

    let activeAnimation = null;



    const getGap = () =>
        parseFloat(
            getComputedStyle(rail).columnGap ||
            getComputedStyle(rail).gap
        ) || 0;



    const getActiveCards = () =>
        Array.from(rail.children).filter(
            (card) =>
                !card.classList.contains("is-loop-clone") &&
                !card.classList.contains("is-tab-hidden") &&
                !card.hidden
        );



    const getStep = (direction = 1) => {

        const cards = getActiveCards();

        const card =
            direction > 0
                ? cards[0]
                : cards[cards.length - 1];


        if (!card) return 0;


        return card.getBoundingClientRect().width + getGap();

    };



    const getDuration = () =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? 1
            : 420;


    const RAIL_EASING = "linear";



    const resetRailPosition = () => {

        rail.style.transition = "none";
        rail.style.transform = "translateX(0)";

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


        rail.querySelectorAll(".is-loop-clone")
            .forEach((clone) => clone.remove());



        originalCards.forEach((card) => {

            if (
                !card.classList.contains("is-tab-hidden") &&
                !card.hidden
            ) {
                rail.appendChild(card);
            }

        });


        originalCards.forEach((card) => {

            if (
                card.classList.contains("is-tab-hidden") ||
                card.hidden
            ) {
                rail.appendChild(card);
            }

        });


        resetRailPosition();

    };



    const animateRail = ({from, to, onFinish}) => {

        const fromTransform = `translateX(${from}px)`;
        const toTransform = `translateX(${to}px)`;


        rail.style.transition = "none";
        rail.style.transform = fromTransform;

        rail.getBoundingClientRect();

        rail.classList.add("is-shifting");



        if (typeof rail.animate === "function") {

            const animation = rail.animate(
                [
                    {transform: fromTransform},
                    {transform: toTransform}
                ],
                {
                    duration: getDuration(),
                    easing: RAIL_EASING,
                    fill: "both"
                }
            );


            activeAnimation = animation;


            animation.onfinish = () => {

                onFinish();

                resetRailPosition();

                rail.classList.remove("is-shifting");

                animation.cancel();

                activeAnimation = null;

                isAnimating = false;

            };


            animation.oncancel = () => {

                resetRailPosition();

                rail.classList.remove("is-shifting");

                activeAnimation = null;

                isAnimating = false;

            };


            return;

        }



        rail.style.transition =
            `transform ${getDuration()}ms ${RAIL_EASING}`;


        rail.style.transform = toTransform;



        const onEnd = () => {

            rail.removeEventListener(
                "transitionend",
                onEnd
            );


            onFinish();

            resetRailPosition();

            rail.classList.remove("is-shifting");

            isAnimating = false;

        };


        rail.addEventListener(
            "transitionend",
            onEnd
        );

    };



    const finishForward = (fromX = 0) => {

        const step = getStep(1);

        const activeCards = getActiveCards();

        const firstCard = activeCards[0];


        if (!step || !firstCard) {

            isAnimating = false;
            return;

        }



        const clone = firstCard.cloneNode(true);

        clone.classList.add("is-loop-clone");

        clone.setAttribute("aria-hidden", "true");


        rail.appendChild(clone);



        animateRail({

            from: fromX,

            to: -step,


            onFinish: () => {

                rail.appendChild(firstCard);

                clone.remove();

            }

        });

    };



    const finishBackward = (fromX = 0) => {

        const step = getStep(-1);

        const cards = getActiveCards();

        const firstCard = cards[0];

        const lastCard = cards[cards.length - 1];


        if (!step || !firstCard || !lastCard) {

            isAnimating = false;
            return;

        }



        const clone = lastCard.cloneNode(true);

        clone.classList.add("is-loop-clone");

        clone.setAttribute("aria-hidden", "true");



        rail.insertBefore(
            clone,
            firstCard
        );



        rail.style.transition = "none";

        rail.style.transform =
            `translateX(${-step}px)`;


        rail.getBoundingClientRect();



        animateRail({

            from: -step,

            to: 0,


            onFinish: () => {

                rail.insertBefore(
                    lastCard,
                    rail.firstChild
                );

                clone.remove();

            }

        });

    };



    const shift = (direction) => {

        if (isLoopDisabled()) {
            resetToOriginalOrder();
            return;
        }


        if (
            isAnimating ||
            getActiveCards().length < 2
        ) {
            return;
        }

        isAnimating = true;

        if (direction > 0) {
            finishForward();
        } else {
            finishBackward();
        }

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

        stopAuto();

        shift(direction);

        if (!autoLoop) return;

        autoTimer = setInterval(
            () => shift(direction),
            4000
        );

    };



    nextButton.addEventListener(
        "click",
        () => startAuto(1)
    );


    prevButton.addEventListener(
        "click",
        () => startAuto(-1)
    );



    rail.closest(".rail-wrap")
        ?.addEventListener(
            "mouseleave",
            stopAuto
        );



    rail.addEventListener(
        "pointerdown",
        (event) => {

            if (isLoopDisabled() || isAnimating) return;

            if (
                event.pointerType === "mouse" &&
                event.button !== 0
            ) return;

            //if (event.target.closest("a, button")) return;

            stopAuto();

            dragActive = true;

            didDrag = false;

            startX = event.clientX;

            currentX = 0;

        }
    );

    rail.addEventListener("click", (event) => {
        if (didDrag) {
            event.preventDefault();
            event.stopPropagation();
        }
    }, true);

    rail.addEventListener("dragstart", (event) => {
        event.preventDefault();
    });

    rail.addEventListener(
        "pointermove",
        (event) => {

            if (!dragActive || isAnimating)
                return;


            currentX =
                event.clientX - startX;


            if (
                !didDrag &&
                Math.abs(currentX) < DRAG_THRESHOLD
            ) {
                return;
            }

            if (!didDrag) {
                rail.setPointerCapture(event.pointerId);
            }

            didDrag = true;

            rail.classList.add(
                "is-dragging"
            );

            rail.classList.add("is-dragging");
            rail.style.transition = "none";
            rail.style.transform = `translateX(${currentX}px)`;

        }
    );



    const endDrag = () => {
        if (!dragActive) return;

        dragActive = false;

        rail.classList.remove(
            "is-dragging"
        );

        if (rail.hasPointerCapture?.(event?.pointerId)) {
            rail.releasePointerCapture(event.pointerId);
        }

        if (!didDrag) {
            currentX = 0;
            return;
        }

        const threshold = 40;

        if (currentX <= -threshold) {
            isAnimating = true;
            finishForward(currentX);
        } else if (currentX >= threshold) {
            isAnimating = true;
            finishBackward(currentX);
        } else {
            rail.style.transform = "translateX(0)";
        }

        currentX = 0;
    };



    rail.addEventListener(
        "pointerup",
        endDrag
    );


    rail.addEventListener(
        "pointercancel",
        endDrag
    );



    if (isLoopDisabled()) {
        resetToOriginalOrder();
    }


};



initLoopRail({
    railId: "trend-rail",
    autoLoop: false,
    autoStartOnLoad: false
});


initLoopRail({
    railId: "seller-rail",
    autoLoop: true
});


})();