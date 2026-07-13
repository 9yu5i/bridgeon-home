(() => {
const hero = document.querySelector(".hero");
const heroFrame = document.querySelector(".hero-frame");
const heroTrack = document.querySelector(".hero-track");
const heroCounter = document.querySelector(".hero-counter");
const heroToggle = document.querySelector(".hero-toggle");
const heroPrev = document.querySelector(".hero-prev");
const heroNext = document.querySelector(".hero-next");

if (heroTrack) {
  const heroSlides = Array.from(heroTrack.children);
  const heroTotal = heroSlides.length;
  const heroCloneCount = heroTotal > 1 ? Math.min(2, heroTotal) : 0;
  let heroIndex = 0;
  let heroPosition = heroTotal > 1 ? heroCloneCount : 0;
  let heroTimer;
  let heroHoverPaused = false;
  let heroDragActive = false;
  let heroDragStartX = 0;
  let heroDragDeltaX = 0;
  let heroAutoplayEnabled = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroMobileQuery = window.matchMedia("(max-width: 1120px)");
  const reduceHeroMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const wrapHeroIndex = (index) => (index + heroTotal) % heroTotal;

  heroSlides.forEach((slide, index) => {
    slide.style.background = getComputedStyle(slide).background;
    slide.dataset.heroOriginalIndex = String(index);
  });

  if (heroTotal > 1) {
    const prependClones = heroSlides.slice(heroTotal - heroCloneCount).map((slide) => {
      const clone = slide.cloneNode(true);
      clone.classList.add("hero-clone");
      clone.setAttribute("aria-hidden", "true");
      return clone;
    });

    const appendClones = heroSlides.slice(0, heroCloneCount).map((slide) => {
      const clone = slide.cloneNode(true);
      clone.classList.add("hero-clone");
      clone.setAttribute("aria-hidden", "true");
      return clone;
    });

    prependClones.reverse().forEach((clone) => heroTrack.prepend(clone));
    appendClones.forEach((clone) => heroTrack.append(clone));
  }

  const getHeroTrackCards = () => Array.from(heroTrack.children);

  const updateHeroToggle = () => {
    if (!heroToggle) return;
    heroToggle.classList.toggle("is-paused", !heroAutoplayEnabled);
    heroToggle.setAttribute("aria-label", heroAutoplayEnabled ? "Pause hero" : "Play hero");
    heroToggle.setAttribute("aria-pressed", heroAutoplayEnabled ? "true" : "false");
  };

  const setHeroTransition = (enabled) => {
    heroTrack.style.transition = enabled && !reduceHeroMotionQuery.matches ? "" : "none";
  };

  const updateHeroCardState = () => {
    const activeOriginalIndex = String(heroIndex);
    getHeroTrackCards().forEach((card, index) => {
      card.classList.toggle("is-active", card.dataset.heroOriginalIndex === activeOriginalIndex);
    });
  };

  const getHeroMobileOffset = (position) => {
    const cards = getHeroTrackCards();
    const activeCard = cards[position];
    if (!heroFrame || !activeCard) return 0;

    return (heroFrame.clientWidth / 2) - (activeCard.offsetLeft + activeCard.offsetWidth / 2);
  };

  const setHeroPosition = (position, animate = true) => {
    heroPosition = position;
    setHeroTransition(animate);

    if (heroMobileQuery.matches) {
      heroTrack.style.transform = `translateX(${getHeroMobileOffset(heroPosition)}px)`;
    } else {
      heroTrack.style.transform = `translateX(-${heroPosition * 100}%)`;
    }

    updateHeroCardState();

    if (!animate) {
      requestAnimationFrame(() => setHeroTransition(true));
    }
  };

  const jumpHeroPosition = (position) => {
    heroPosition = position;
    heroTrack.classList.add("is-loop-jumping");
    heroTrack.style.transition = "none";

    if (heroMobileQuery.matches) {
      heroTrack.style.transform = `translateX(${getHeroMobileOffset(heroPosition)}px)`;
    } else {
      heroTrack.style.transform = `translateX(-${heroPosition * 100}%)`;
    }

    updateHeroCardState();
    void heroTrack.offsetWidth;
    setHeroTransition(true);
    requestAnimationFrame(() => heroTrack.classList.remove("is-loop-jumping"));
  };

  const updateHeroCounter = () => {
    if (heroCounter) heroCounter.textContent = `${heroIndex + 1} / ${heroTotal}`;
  };

  const syncHeroAfterLoop = () => {
    if (heroTotal <= 1) return;

    if (heroPosition < heroCloneCount) {
      jumpHeroPosition(heroPosition + heroTotal);
    } else if (heroPosition >= heroCloneCount + heroTotal) {
      jumpHeroPosition(heroPosition - heroTotal);
    }
  };

  const goToHeroSlide = (index) => {
    if (heroTotal <= 1) {
      heroIndex = 0;
      setHeroPosition(0);
      updateHeroCounter();
      return;
    }

    if (index < 0) {
      heroIndex = heroTotal - 1;
      setHeroPosition(heroCloneCount - 1);
    } else if (index >= heroTotal) {
      heroIndex = 0;
      setHeroPosition(heroCloneCount + heroTotal);
    } else {
      heroIndex = wrapHeroIndex(index);
      setHeroPosition(heroCloneCount + heroIndex);
    }

    updateHeroCounter();
    if (reduceHeroMotionQuery.matches) syncHeroAfterLoop();
  };

  const refreshHeroLayout = () => {
    setHeroPosition(heroPosition, false);
    updateHeroCounter();
  };

  const stopHeroAutoplay = () => {
    window.clearInterval(heroTimer);
  };

  const startHeroAutoplay = () => {
    stopHeroAutoplay();
    if (!heroAutoplayEnabled || heroHoverPaused) return;
    heroTimer = window.setInterval(() => goToHeroSlide(heroIndex + 1), 5000);
  };

  const resetHeroAutoplay = () => {
    if (heroAutoplayEnabled) startHeroAutoplay();
  };

  heroToggle?.addEventListener("click", () => {
    heroAutoplayEnabled = !heroAutoplayEnabled;
    updateHeroToggle();
    startHeroAutoplay();
  });

  heroPrev?.addEventListener("click", () => {
    goToHeroSlide(heroIndex - 1);
    resetHeroAutoplay();
  });

  heroNext?.addEventListener("click", () => {
    goToHeroSlide(heroIndex + 1);
    resetHeroAutoplay();
  });

  hero?.addEventListener("mouseenter", () => {
    heroHoverPaused = true;
    stopHeroAutoplay();
  });

  hero?.addEventListener("mouseleave", () => {
    heroHoverPaused = false;
    startHeroAutoplay();
  });

  hero?.addEventListener("focusin", () => {
    heroHoverPaused = true;
    stopHeroAutoplay();
  });

  hero?.addEventListener("focusout", () => {
    heroHoverPaused = false;
    startHeroAutoplay();
  });

  heroFrame?.addEventListener("pointerdown", (event) => {
    if (!heroMobileQuery.matches || heroTotal <= 1 || event.button !== 0) return;
    heroDragActive = true;
    heroDragStartX = event.clientX;
    heroDragDeltaX = 0;
    heroFrame.setPointerCapture(event.pointerId);
    stopHeroAutoplay();
  });

  heroFrame?.addEventListener("pointermove", (event) => {
    if (!heroDragActive) return;
    heroDragDeltaX = event.clientX - heroDragStartX;
  });

  const finishHeroDrag = () => {
    if (!heroDragActive) return;
    heroDragActive = false;

    if (heroDragDeltaX <= -35) {
      goToHeroSlide(heroIndex + 1);
    } else if (heroDragDeltaX >= 35) {
      goToHeroSlide(heroIndex - 1);
    }

    heroDragDeltaX = 0;
    if (!heroHoverPaused) startHeroAutoplay();
  };

  heroFrame?.addEventListener("pointerup", finishHeroDrag);
  heroFrame?.addEventListener("pointercancel", finishHeroDrag);

  heroTrack.addEventListener("transitionend", (event) => {
    if (event.propertyName === "transform") syncHeroAfterLoop();
  });

  heroMobileQuery.addEventListener?.("change", refreshHeroLayout);
  window.addEventListener("resize", refreshHeroLayout);

  updateHeroToggle();
  refreshHeroLayout();
  if (heroTotal > 1) startHeroAutoplay();
}
})();
