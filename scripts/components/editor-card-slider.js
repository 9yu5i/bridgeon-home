(() => {
  const slider = document.querySelector("[data-editor-card-slider]");
  if (!slider) return;

  const track = slider.querySelector(".editor-card-track");
  const slides = Array.from(slider.querySelectorAll(".editor-card"));
  const prevButton = slider.querySelector("[data-editor-card-prev]");
  const nextButton = slider.querySelector("[data-editor-card-next]");
  const status = slider.querySelector("[data-editor-card-status]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!track || slides.length < 2) {
    slider.querySelector(".editor-card-controls")?.remove();
    return;
  }

  let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
  let timerId = null;
  let paused = false;
  const delay = 5400;

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

  const render = (animate = true) => {
    track.classList.toggle("is-drag-disabled", !animate || reduceMotion.matches);
    track.style.transform = `translateX(-${index * 100}%)`;

    slides.forEach((slide, slideIndex) => {
      setSlideInteractive(slide, slideIndex === index);
    });

    if (status) status.textContent = `${index + 1} / ${slides.length}`;
  };

  const goTo = (nextIndex, animate = true) => {
    closeEditorNotes();
    index = (nextIndex + slides.length) % slides.length;
    render(animate);
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

  prevButton?.addEventListener("click", () => {
    goTo(index - 1);
    restart();
  });

  nextButton?.addEventListener("click", () => {
    goTo(index + 1);
    restart();
  });

  slider.addEventListener("click", (event) => {
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
    if (event.target.closest(".editor-note-trigger, .editor-pick-note")) return;
    closeEditorNotes();
  });

  slider.addEventListener("mouseenter", () => {
    paused = true;
    stop();
  });

  slider.addEventListener("mouseleave", () => {
    paused = false;
    start();
  });

  slider.addEventListener("focusin", () => {
    paused = true;
    stop();
  });

  slider.addEventListener("focusout", () => {
    paused = false;
    start();
  });

  reduceMotion.addEventListener?.("change", () => {
    render(false);
    start();
  });

  render(false);
  start();
})();
