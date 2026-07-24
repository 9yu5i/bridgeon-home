(() => {
const magazineGrid = document.querySelector(".magazine-grid");
const magazineBlock = document.querySelector(".magazine-block");
const magazineSliderQuery = window.matchMedia("(max-width: 760px)");

const updateMagazineSliderBar = () => {
  if (!magazineGrid || !magazineBlock) return;

  const cardCount = magazineGrid.querySelectorAll(".magazine-card").length || 1;
  const trackStart = 12;
  const trackWidth = 76;
  const thumbSize = trackWidth / cardCount;
  const maxScroll = magazineGrid.scrollWidth - magazineGrid.clientWidth;
  const progress = maxScroll > 0 ? magazineGrid.scrollLeft / maxScroll : 0;
  const thumbLeft = trackStart + (trackWidth - thumbSize) * Math.max(0, Math.min(progress, 1));

  magazineBlock.style.setProperty("--magazine-thumb-size", `${thumbSize}%`);
  magazineBlock.style.setProperty("--magazine-thumb-left", `${thumbLeft}%`);
};

if (magazineGrid && magazineBlock) {
  let magazineFrame = null;
  let isMagazineDragging = false;
  let magazinePointerId = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartScrollLeft = 0;
  let magazineDragAxis = null;
  let magazineTouchActive = false;
  let magazineTouchStartX = 0;
  let magazineTouchStartY = 0;
  let magazineTouchStartScrollLeft = 0;
  let magazineTouchAxis = null;
  let isMagazineBarDragging = false;
  let magazineBarPointerId = null;

  const scheduleMagazineSliderBar = () => {
    if (!magazineSliderQuery.matches) return;
    window.cancelAnimationFrame(magazineFrame);
    magazineFrame = window.requestAnimationFrame(updateMagazineSliderBar);
  };

  const stopMagazineDrag = () => {
    isMagazineDragging = false;
    magazinePointerId = null;
    magazineDragAxis = null;
    magazineGrid.classList.remove("is-dragging");
  };

  const getMagazineBarMetrics = () => {
    const rect = magazineBlock.getBoundingClientRect();
    const trackLeft = rect.left + rect.width * 0.12;
    const trackWidth = rect.width * 0.76;
    return {
      rect,
      trackLeft,
      trackRight: trackLeft + trackWidth,
      trackWidth,
      hitTop: rect.bottom - 24,
      hitBottom: rect.bottom + 10,
    };
  };

  const syncMagazineScrollFromBar = (clientX) => {
    const { trackLeft, trackWidth } = getMagazineBarMetrics();
    const maxScroll = magazineGrid.scrollWidth - magazineGrid.clientWidth;
    if (maxScroll <= 0 || trackWidth <= 0) return;

    const progress = Math.max(0, Math.min((clientX - trackLeft) / trackWidth, 1));
    magazineGrid.scrollLeft = progress * maxScroll;
    updateMagazineSliderBar();
  };

  const handleMagazinePointerDown = (event) => {
    if (!magazineSliderQuery.matches) return;
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    isMagazineDragging = true;
    magazinePointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragStartScrollLeft = magazineGrid.scrollLeft;
    magazineDragAxis = event.pointerType === "mouse" ? "x" : null;
    if (magazineDragAxis === "x") {
      magazineGrid.classList.add("is-dragging");
    }
    if (event.pointerType === "mouse" && typeof magazineGrid.setPointerCapture === "function") {
      magazineGrid.setPointerCapture(event.pointerId);
    }
  };

  const handleMagazinePointerMove = (event) => {
    if (!isMagazineDragging || magazinePointerId !== event.pointerId) return;
    const deltaX = event.clientX - dragStartX;
    const deltaY = event.clientY - dragStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (!magazineDragAxis) {
      if (Math.max(absX, absY) < 6) return;
      if (absY > absX) {
        stopMagazineDrag();
        return;
      }
      magazineDragAxis = "x";
      magazineGrid.classList.add("is-dragging");
      if (typeof magazineGrid.setPointerCapture === "function") {
        magazineGrid.setPointerCapture(event.pointerId);
      }
    }

    event.preventDefault();
    magazineGrid.scrollLeft = dragStartScrollLeft - deltaX;
    updateMagazineSliderBar();
  };

  const handleMagazinePointerUp = (event) => {
    if (magazinePointerId !== event.pointerId) return;
    stopMagazineDrag();
  };

  const stopMagazineTouch = () => {
    magazineTouchActive = false;
    magazineTouchAxis = null;
    magazineGrid.classList.remove("is-dragging");
  };

  const handleMagazineTouchStart = (event) => {
    if (!magazineSliderQuery.matches || event.touches.length !== 1) return;

    const touch = event.touches[0];
    magazineTouchActive = true;
    magazineTouchStartX = touch.clientX;
    magazineTouchStartY = touch.clientY;
    magazineTouchStartScrollLeft = magazineGrid.scrollLeft;
    magazineTouchAxis = null;
  };

  const handleMagazineTouchMove = (event) => {
    if (!magazineTouchActive || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - magazineTouchStartX;
    const deltaY = touch.clientY - magazineTouchStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (!magazineTouchAxis) {
      if (Math.max(absX, absY) < 6) return;
      if (absY > absX) {
        stopMagazineTouch();
        return;
      }
      magazineTouchAxis = "x";
      magazineGrid.classList.add("is-dragging");
    }

    event.preventDefault();
    magazineGrid.scrollLeft = magazineTouchStartScrollLeft - deltaX;
    updateMagazineSliderBar();
  };

  const handleMagazineBarPointerDown = (event) => {
    if (!magazineSliderQuery.matches) return;

    const { trackLeft, trackRight, hitTop, hitBottom } = getMagazineBarMetrics();
    const isInsideTrack =
      event.clientX >= trackLeft &&
      event.clientX <= trackRight &&
      event.clientY >= hitTop &&
      event.clientY <= hitBottom;

    if (!isInsideTrack) return;

    event.preventDefault();
    isMagazineBarDragging = true;
    magazineBarPointerId = event.pointerId;
    syncMagazineScrollFromBar(event.clientX);
    if (typeof magazineBlock.setPointerCapture === "function") {
      magazineBlock.setPointerCapture(event.pointerId);
    }
  };

  const handleMagazineBarPointerMove = (event) => {
    if (!isMagazineBarDragging || magazineBarPointerId !== event.pointerId) return;
    event.preventDefault();
    syncMagazineScrollFromBar(event.clientX);
  };

  const handleMagazineBarPointerUp = (event) => {
    if (magazineBarPointerId !== event.pointerId) return;
    isMagazineBarDragging = false;
    magazineBarPointerId = null;
  };

  magazineGrid.addEventListener("scroll", scheduleMagazineSliderBar, { passive: true });
  magazineGrid.addEventListener("pointerdown", handleMagazinePointerDown);
  magazineGrid.addEventListener("pointermove", handleMagazinePointerMove);
  magazineGrid.addEventListener("pointerup", handleMagazinePointerUp);
  magazineGrid.addEventListener("pointercancel", handleMagazinePointerUp);
  magazineGrid.addEventListener("touchstart", handleMagazineTouchStart, { passive: true });
  magazineGrid.addEventListener("touchmove", handleMagazineTouchMove, { passive: false });
  magazineGrid.addEventListener("touchend", stopMagazineTouch, { passive: true });
  magazineGrid.addEventListener("touchcancel", stopMagazineTouch, { passive: true });
  magazineBlock.addEventListener("pointerdown", handleMagazineBarPointerDown);
  magazineBlock.addEventListener("pointermove", handleMagazineBarPointerMove);
  magazineBlock.addEventListener("pointerup", handleMagazineBarPointerUp);
  magazineBlock.addEventListener("pointercancel", handleMagazineBarPointerUp);
  window.addEventListener("resize", scheduleMagazineSliderBar);
  magazineSliderQuery.addEventListener?.("change", updateMagazineSliderBar);
  updateMagazineSliderBar();
}
})();
