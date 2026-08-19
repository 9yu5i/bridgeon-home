/**
 * TrendyPicker home magazine iframe sizing and card reveal.
 * Article rendering and navigation stay owned by the magazine board template.
 *
 * The cards live in the board iframe, so the shared scroll-reveal.js cannot
 * reach them — it only reveals the section heading out here. Everything below
 * the heading is staggered from this file instead, by setting classes on the
 * widget inside the (same-origin) frame document.
 */
(function () {
  "use strict";

  var frameId = "tp_main_magazine_frame";
  var CARDS = ".tp-home-magazine-feature, .tp-home-magazine-item";
  var ARMED = "data-tp-reveal-armed";
  var STAGGER_FAILSAFE_MS = 15000;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  ready(function () {
    var frame = document.getElementById(frameId);
    if (!frame) return;

    function applyHeight(value) {
      var next = Math.ceil(Number(value) || 0);
      if (next < 320 || next > 3000) return;
      frame.style.height = next + "px";
    }

    window.addEventListener("message", function (event) {
      var data = event && event.data;
      if (!data || data.type !== "magazine-frame-height") return;
      if (event.source !== frame.contentWindow) return;
      applyHeight(data.height);
    });

    function getWidget() {
      try {
        var doc = frame.contentDocument;
        return doc ? doc.querySelector("[data-home-magazine-widget]") : null;
      } catch (_error) {
        /* Cross-origin at this point: sizing still works over postMessage. */
        return null;
      }
    }

    function revealCards(widget) {
      if (!widget || widget.classList.contains("is-inview")) return;
      // Two frames so the hidden state is painted before .is-inview lands.
      // Without this the cards go from armed to revealed within a single
      // paint and the transition never runs.
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          widget.classList.add("is-inview");
        });
      });
    }

    function armCards() {
      var widget = getWidget();
      if (!widget || widget.hasAttribute(ARMED)) return;

      var cards = widget.querySelectorAll(CARDS);
      if (!cards.length) return;

      widget.setAttribute(ARMED, "");
      Array.prototype.forEach.call(cards, function (card, index) {
        card.style.setProperty("--reveal-index", String(index));
      });

      var section = frame.closest(".tp-main-magazine");
      if (!section || !window.IntersectionObserver) {
        revealCards(widget);
        return;
      }

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            revealCards(widget);
          });
        },
        // Start once the block is properly on screen, not the instant its top
        // edge appears — the stagger should play while the reader is looking
        // at the cards, not above them.
        { threshold: 0, rootMargin: "0px 0px -15% 0px" }
      );

      observer.observe(section);

      // The cards must never be left hidden if the observer never reports.
      window.setTimeout(function () {
        observer.disconnect();
        revealCards(widget);
      }, STAGGER_FAILSAFE_MS);
    }

    function onFrameReady() {
      var widget = getWidget();
      if (widget) applyHeight(widget.getBoundingClientRect().height + 8);
      // Reduced motion is handled in CSS, which keeps the fade and drops the
      // movement, so the cards are armed either way.
      armCards();
    }

    frame.addEventListener("load", onFrameReady);

    // A cached frame can finish loading before this handler is attached.
    if (getWidget()) onFrameReady();
  });
})();
