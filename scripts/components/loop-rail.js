(() => {
const scrollButtons = document.querySelectorAll("[data-scroll]");

scrollButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const rail = document.getElementById(button.dataset.scroll);
    if (!rail) return;
    if (
      rail.classList.contains("trend-rail") ||
      rail.classList.contains("seller-rail")
    ) return;

    const direction = Number(button.dataset.direction || 1);
    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.8, 240),
      behavior: "smooth",
    });
  });
});

const initLoopRail = ({ railId, autoLoop = true, autoStartOnLoad = false }) => {
  const rail = document.getElementById(railId);
  const nextButton = document.querySelector(`[data-scroll="${railId}"][data-direction="1"]`);
  const prevButton = document.querySelector(`[data-scroll="${railId}"][data-direction="-1"]`);
  if (!rail || !nextButton || !prevButton) return;
  const disableLoopQuery =
    railId === "seller-rail"
      ? "(max-width: 1120px)"
      : railId === "trend-rail"
        ? null
        : "(max-width: 760px)";
  const disableLoopMedia = disableLoopQuery ? window.matchMedia(disableLoopQuery) : null;
  const isLoopDisabled = () =>
    disableLoopMedia ? disableLoopMedia.matches : false;
  const originalCards = Array.from(rail.children);

  let isAnimating = false;
  let autoTimer = null;
  let dragActive = false;
  let startX = 0;
  let currentX = 0;
  let activeAnimation = null;

  const getGap = () => parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap) || 0;

  const getActiveCards = () =>
    originalCards.filter(
      (card) =>
        rail.contains(card) &&
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

  const getDuration = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 420;

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
          { duration: getDuration(), easing: RAIL_EASING, fill: "both" },
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      shift(direction);
      return;
    }

    stopAuto();
    shift(direction);

    if (!autoLoop) return;
    autoTimer = window.setInterval(() => shift(direction), 4000);
  };

  nextButton.addEventListener("click", () => startAuto(1));
  prevButton.addEventListener("click", () => startAuto(-1));
  rail.closest(".rail-wrap")?.addEventListener("mouseleave", stopAuto);

  const isInteractiveRailTarget = (event) =>
    Boolean(event.target.closest("button, a, input, select, textarea, .reel-product em"));

  rail.addEventListener("pointerdown", (event) => {
    if (isLoopDisabled()) return;
    if (isAnimating) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (isInteractiveRailTarget(event)) return;
    stopAuto();
    dragActive = true;
    startX = event.clientX;
    currentX = 0;
    rail.classList.add("is-dragging");
    rail.setPointerCapture(event.pointerId);
  });

  rail.addEventListener("pointermove", (event) => {
    if (!dragActive || isAnimating) return;
    currentX = event.clientX - startX;
    rail.style.transition = "none";
    rail.style.transform = `translateX(${currentX}px)`;
  });

  const endDrag = () => {
    if (!dragActive) return;
    dragActive = false;
    rail.classList.remove("is-dragging");

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

  disableLoopMedia?.addEventListener("change", () => {
    if (isLoopDisabled()) resetToOriginalOrder();
  });

  rail.addEventListener("bridgeon:railfilterchange", () => {
    resetToOriginalOrder();
  });

  if (isLoopDisabled()) resetToOriginalOrder();

  if (autoStartOnLoad && autoLoop && !isLoopDisabled()) {
    window.setTimeout(() => {
      if (!isLoopDisabled()) startAuto(1);
    }, 600);
  }
};

initLoopRail({ railId: "trend-rail", autoLoop: false, autoStartOnLoad: false });
initLoopRail({ railId: "seller-rail", autoLoop: true });

const initReviewMarquee = () => {
  const rail = document.getElementById("review-rail");
  if (!rail) return;

  const mobileMedia = window.matchMedia("(max-width: 760px)");
  const reduceMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  const originalCards = Array.from(rail.children).filter(
    (child) => !child.classList.contains("is-loop-clone"),
  );

  const clearClones = () => {
    rail.querySelectorAll(".is-loop-clone").forEach((clone) => clone.remove());
    originalCards.forEach((card) => rail.appendChild(card));
    rail.classList.remove("is-marquee");
    rail.style.removeProperty("--review-marquee-distance");
  };

  const syncDistance = () => {
    const firstOriginal = originalCards[0];
    const firstClone = rail.querySelector(".is-loop-clone");
    if (!firstOriginal || !firstClone) return;
    const distance = firstClone.offsetLeft - firstOriginal.offsetLeft;
    if (distance > 0) {
      rail.style.setProperty("--review-marquee-distance", `${Math.round(distance)}px`);
    }
  };

  const enableMarquee = () => {
    clearClones();
    if (mobileMedia.matches || reduceMotionMedia.matches) return;

    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.classList.add("is-loop-clone");
      clone.setAttribute("aria-hidden", "true");
      rail.appendChild(clone);
    });

    rail.classList.add("is-marquee");
    // Measure after layout so the loop starts exactly at the first clone.
    window.requestAnimationFrame(() => {
      syncDistance();
      window.requestAnimationFrame(syncDistance);
    });
  };

  enableMarquee();
  mobileMedia.addEventListener("change", enableMarquee);
  reduceMotionMedia.addEventListener("change", enableMarquee);
  window.addEventListener("resize", () => {
    if (!rail.classList.contains("is-marquee")) return;
    syncDistance();
  });
};

initReviewMarquee();
})();
