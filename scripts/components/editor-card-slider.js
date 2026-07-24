(() => {
  const slider = document.querySelector("[data-editor-card-slider]");
  if (!slider) return;

  const viewport = slider.querySelector(".editor-card-viewport");
  const track = slider.querySelector(".editor-card-track");
  const slides = Array.from(slider.querySelectorAll(".editor-card-track > .editor-card"));
  const tabs = Array.from(slider.querySelectorAll("[data-editor-card-tab]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!viewport || !track || slides.length < 2) {
    slider.querySelector("[data-editor-card-tabs]")?.remove();
    return;
  }

  let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
  let timerId = null;
  let paused = false;
  let isDragging = false;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let axisLocked = "";
  const delay = 5400;
  const swipeThreshold = 48;
  const compactNoteMq = window.matchMedia("(max-width: 1120px)");

  const closeEditorNotes = (exceptCard = null) => {
    slider.querySelectorAll(".editor-card-product.is-note-open").forEach((card) => {
      if (card === exceptCard) return;
      card.classList.remove("is-note-open");
      card.querySelector(".editor-note-trigger")?.setAttribute("aria-expanded", "false");
    });
  };

  const setSlideInteractive = (slide, isActive) => {
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", isActive ? "false" : "true");
    slide.querySelectorAll("a, button").forEach((control) => {
      control.tabIndex = isActive ? 0 : -1;
    });
  };

  const syncTabs = () => {
    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === index;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
      tab.tabIndex = isActive ? 0 : -1;
    });
  };

  const render = () => {
    track.classList.toggle("is-reduced-motion", reduceMotion.matches);
    track.style.transform = "";

    slides.forEach((slide, slideIndex) => {
      setSlideInteractive(slide, slideIndex === index);
    });

    syncTabs();
  };

  const goTo = (nextIndex) => {
    closeEditorNotes();
    index = (nextIndex + slides.length) % slides.length;
    isDragging = false;
    render();
  };

  const stop = () => {
    window.clearInterval(timerId);
    timerId = null;
  };

  const start = () => {
    stop();
    if (paused || reduceMotion.matches) return;
    timerId = window.setInterval(() => goTo(index + 1), delay);
  };

  const restart = () => {
    stop();
    start();
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const nextIndex = Number(tab.getAttribute("data-editor-card-tab"));
      if (Number.isNaN(nextIndex)) return;
      goTo(nextIndex);
      restart();
    });

    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = index + 1;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = index - 1;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = slides.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      goTo(nextIndex);
      tabs[index]?.focus();
      restart();
    });
  });

  slider.addEventListener("click", (event) => {
    if (!compactNoteMq.matches) return;

    const note = event.target.closest(".editor-pick-note");
    if (note && slider.contains(note)) {
      event.preventDefault();
      event.stopPropagation();
      closeEditorNotes();
      return;
    }

    const trigger = event.target.closest(".editor-note-trigger");
    if (!trigger || !slider.contains(trigger)) return;

    event.preventDefault();
    event.stopPropagation();

    const card = trigger.closest(".editor-card-product");
    if (!card) return;

    const shouldOpen = !card.classList.contains("is-note-open");
    closeEditorNotes(card);
    card.classList.toggle("is-note-open", shouldOpen);
    trigger.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
  });

  document.addEventListener("click", (event) => {
    if (!compactNoteMq.matches) return;
    if (event.target.closest(".editor-note-trigger, .editor-pick-note")) return;
    closeEditorNotes();
  });

  compactNoteMq.addEventListener?.("change", () => {
    if (!compactNoteMq.matches) closeEditorNotes();
  });

  slider.querySelectorAll(".editor-card-products").forEach((rail) => {
    rail.addEventListener(
      "wheel",
      (event) => {
        if (rail.scrollWidth <= rail.clientWidth + 1) return;
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        event.preventDefault();
        rail.scrollLeft += event.deltaY;
      },
      { passive: false }
    );
  });

  const endDrag = (clientX) => {
    if (!isDragging) return;

    const delta = clientX - startX;
    isDragging = false;
    pointerId = null;
    axisLocked = "";

    if (Math.abs(delta) >= swipeThreshold) {
      goTo(delta < 0 ? index + 1 : index - 1);
    }

    restart();
  };

  viewport.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest("a, button, .editor-pick-note, .editor-card-products")) return;

    isDragging = true;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    axisLocked = "";
    paused = true;
    stop();
    viewport.setPointerCapture?.(event.pointerId);
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!isDragging || event.pointerId !== pointerId) return;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    if (!axisLocked) {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
      axisLocked = Math.abs(deltaX) >= Math.abs(deltaY) ? "x" : "y";
      if (axisLocked === "y") {
        isDragging = false;
        pointerId = null;
        axisLocked = "";
        restart();
      }
    }
  });

  viewport.addEventListener("pointerup", (event) => {
    if (event.pointerId !== pointerId) return;
    endDrag(event.clientX);
  });

  viewport.addEventListener("pointercancel", (event) => {
    if (event.pointerId !== pointerId) return;
    endDrag(event.clientX);
  });

  slider.addEventListener("mouseenter", () => {
    paused = true;
    stop();
  });

  slider.addEventListener("mouseleave", () => {
    if (isDragging) return;
    paused = false;
    start();
  });

  slider.addEventListener("focusin", () => {
    paused = true;
    stop();
  });

  slider.addEventListener("focusout", () => {
    if (isDragging) return;
    paused = false;
    start();
  });

  reduceMotion.addEventListener?.("change", () => {
    render();
    start();
  });

  render();
  start();
})();
