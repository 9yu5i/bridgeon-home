(() => {
  const slider = document.querySelector("[data-editor-card-slider]");
  if (!slider) return;

  const viewport = slider.querySelector(".editor-card-viewport");
  const track = slider.querySelector(".editor-card-track");
  const tabsWrap = slider.querySelector("[data-editor-card-tabs]");
  const sharedEditors = Array.isArray(window.TrendyPicker?.editorData) ? window.TrendyPicker.editorData : [];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[char];
    });

  const toClassToken = (value) =>
    String(value || "editor")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "editor";

  const getProductDetailUrl = (pick = {}) => {
    const name = String(pick.name || "").toLowerCase();
    if (name.includes("tint") || name.includes("active soothing serum")) {
      return "product-detail/product-detail-options.html";
    }

    return "product-detail/product-detail.html";
  };

  const getEditorHeading = (editor) =>
    editor.homeHeading ||
    editor.magazines?.[0]?.title ||
    `${editor.name || "Editor's"} Curated Picks`;

  const renderProductCard = (pick = {}) => {
    const detailUrl = escapeHtml(pick.detailUrl || getProductDetailUrl(pick));
    const productName = escapeHtml(pick.name || "Editor's Pick Product");
    const brand = escapeHtml(pick.brand || "TrendyPicker");
    const price = escapeHtml(pick.price || "US$18.40");
    const originalPrice = escapeHtml(pick.originalPrice || "");
    const reason = escapeHtml(pick.reason || "A thoughtful pick from our editors.");

    return `
      <article class="editor-card-product" data-product-detail-link="${detailUrl}">
        <a class="editor-product-link" href="${detailUrl}">
          <span class="editor-product-thumb">img</span>
          <span class="editor-product-copy">
            <small>${brand}</small>
            <strong>${productName}</strong>
            <span class="editor-product-price"><em>${price}</em>${originalPrice ? `<del>${originalPrice}</del>` : ""}</span>
          </span>
        </a>
        <button type="button" class="editor-note-trigger" aria-label="View editor note for ${productName}" aria-expanded="false"></button>
        <div class="editor-pick-note" role="note">
          <span class="editor-pick-note-label">EDITOR'S NOTE</span>
          <strong class="editor-pick-note-title">Why I Picked It!</strong>
          <p class="editor-pick-note-body">${reason}</p>
        </div>
        <button type="button" class="editor-product-add" aria-label="Add ${productName} to cart">+</button>
      </article>
    `;
  };

  const renderSharedEditors = () => {
    if (!tabsWrap || !track || sharedEditors.length < 2) return;

    tabsWrap.innerHTML = sharedEditors
      .map((editor, editorIndex) => {
        const isActive = editorIndex === 0;
        return `
          <button type="button" class="editor-card-tab${isActive ? " is-active" : ""}" role="tab" aria-selected="${isActive ? "true" : "false"}" data-editor-card-tab="${editorIndex}" id="editor-card-tab-${editorIndex}"${isActive ? "" : ' tabindex="-1"'}>${escapeHtml(editor.name || `Editor ${editorIndex + 1}`)}</button>
        `;
      })
      .join("");

    track.innerHTML = sharedEditors
      .map((editor, editorIndex) => {
        const name = escapeHtml(editor.name || `Editor ${editorIndex + 1}`);
        const theme = toClassToken(editor.theme || editor.avatar || editor.name);
        const avatar = toClassToken(editor.avatar || editor.theme || editor.name);
        const flag = toClassToken(editor.flag || "kr");
        const tags = (editor.tags || []).slice(0, 2);
        const products = (editor.picks || []).slice(0, 4);
        const heading = escapeHtml(getEditorHeading(editor));
        const quote = escapeHtml(editor.note || editor.bio || "A curated edit from our editors.");
        const isActive = editorIndex === 0;

        return `
          <article class="editor-card editor-card--${theme}${isActive ? " is-active" : ""}" data-editor-id="${theme}" aria-labelledby="editor-card-tab-${editorIndex}" aria-hidden="${isActive ? "false" : "true"}">
            <div class="editor-card-intro">
              <aside class="editor-card-profile">
                <div class="editor-profile-avatar">
                  <span class="editor-avatar editor-avatar--${avatar}" aria-hidden="true"><i></i></span>
                  <b class="flag flag--${flag}" aria-hidden="true"></b>
                  <h3 class="editor-profile-name">${name}</h3>
                </div>
                <a class="editor-card-cta" href="editors-pick/editors-pick.html">SHOP THE PICKS &rarr;</a>
              </aside>

              <div class="editor-card-copy">
                <span class="editor-pick-badge"><span aria-hidden="true">&#9733;</span> ${name.toUpperCase()}'S PICK</span>
                <h2 class="editor-card-heading">${heading}</h2>
                <blockquote class="editor-card-quote">
                  <span class="editor-quote-mark" aria-hidden="true">&ldquo;</span>
                  <p>${quote}</p>
                </blockquote>
                <div class="editor-pick-tags">
                  ${tags.map((tag) => `<i>${escapeHtml(tag)}</i>`).join("")}
                </div>
              </div>
            </div>

            <div class="editor-card-products" data-layout="static" aria-label="${name}'s picked products">
              ${products.map(renderProductCard).join("")}
            </div>
          </article>
        `;
      })
      .join("");
  };

  renderSharedEditors();

  let slides = Array.from(slider.querySelectorAll(".editor-card-track > .editor-card"));
  let tabs = Array.from(slider.querySelectorAll("[data-editor-card-tab]"));

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
    if (event.target.closest(".editor-note-trigger, .editor-pick-note")) return;
    closeEditorNotes();
  });

  slider.querySelectorAll(".editor-card-products").forEach((rail) => {
    let railDragging = false;
    let railPointerId = null;
    let railStartX = 0;
    let railScrollLeft = 0;
    let railMoved = false;
    let suppressClick = false;

    const canScrollRail = () => rail.scrollWidth > rail.clientWidth + 2;
    const controls = document.createElement("div");
    controls.className = "editor-product-rail-controls";
    controls.setAttribute("aria-label", "Browse editor picked products");
    controls.innerHTML = `
      <button class="editor-product-rail-button" type="button" data-editor-product-prev aria-label="Previous picked product"><span aria-hidden="true">&lsaquo;</span></button>
      <button class="editor-product-rail-button" type="button" data-editor-product-next aria-label="Next picked product"><span aria-hidden="true">&rsaquo;</span></button>
    `;
    rail.insertAdjacentElement("afterend", controls);

    const getRailStep = () => {
      const firstCard = rail.querySelector(".editor-card-product");
      if (!firstCard) return rail.clientWidth * 0.72;

      const railStyle = window.getComputedStyle(rail);
      const gap = Number.parseFloat(railStyle.columnGap || railStyle.gap || "0") || 0;
      return firstCard.getBoundingClientRect().width + gap;
    };

    const syncRailControls = () => {
      const hasOverflow = canScrollRail();
      rail.classList.toggle("has-product-overflow", hasOverflow);
      controls.hidden = !hasOverflow;
    };

    const scrollRail = (direction) => {
      if (!canScrollRail()) return;

      const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
      const currentLeft = rail.scrollLeft;
      let nextLeft = currentLeft + direction * getRailStep();

      if (direction > 0 && currentLeft >= maxScrollLeft - 4) {
        nextLeft = 0;
      } else if (direction < 0 && currentLeft <= 4) {
        nextLeft = maxScrollLeft;
      } else {
        nextLeft = Math.max(0, Math.min(maxScrollLeft, nextLeft));
      }

      rail.scrollTo({
        left: nextLeft,
        behavior: reduceMotion.matches ? "auto" : "smooth",
      });
    };

    controls.querySelector("[data-editor-product-prev]")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      scrollRail(-1);
    });

    controls.querySelector("[data-editor-product-next]")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      scrollRail(1);
    });

    syncRailControls();
    window.addEventListener("resize", syncRailControls);
    if ("ResizeObserver" in window) {
      new ResizeObserver(syncRailControls).observe(rail);
    }

    rail.addEventListener(
      "wheel",
      (event) => {
        if (!canScrollRail()) return;
        const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
        if (!delta) return;
        event.preventDefault();
        rail.scrollLeft += delta;
      },
      { passive: false }
    );

    rail.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      if (event.target.closest("a, button")) return;
      if (!canScrollRail()) return;

      railDragging = true;
      railMoved = false;
      suppressClick = false;
      railPointerId = event.pointerId;
      railStartX = event.clientX;
      railScrollLeft = rail.scrollLeft;
      rail.setPointerCapture?.(event.pointerId);
    });

    rail.addEventListener("pointermove", (event) => {
      if (!railDragging || event.pointerId !== railPointerId) return;
      const deltaX = event.clientX - railStartX;
      if (!railMoved && Math.abs(deltaX) > 4) {
        railMoved = true;
        rail.classList.add("is-dragging");
      }
      if (!railMoved) return;
      rail.scrollLeft = railScrollLeft - deltaX;
    });

    const endRailDrag = (event) => {
      if (!railDragging || event.pointerId !== railPointerId) return;
      suppressClick = railMoved;
      railDragging = false;
      railPointerId = null;
      railMoved = false;
      rail.classList.remove("is-dragging");
    };

    rail.addEventListener("pointerup", endRailDrag);
    rail.addEventListener("pointercancel", endRailDrag);
    rail.addEventListener(
      "click",
      (event) => {
        if (!suppressClick) return;
        suppressClick = false;
        event.preventDefault();
        event.stopPropagation();
      },
      true
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
