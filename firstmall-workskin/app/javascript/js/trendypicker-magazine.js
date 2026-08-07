(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }
    fn();
  }

  function bindMagazineFrame() {
    var frame = document.getElementById("magazine_home_frame");
    if (!frame) return;

    frame.setAttribute("scrolling", "no");

    function applyHeight(height) {
      var next = Math.ceil(Number(height) || 0);
      if (next < 1) next = 600;
      frame.style.height = next + "px";
    }

    function resizeFrame() {
      try {
        var doc = frame.contentDocument || frame.contentWindow.document;
        if (!doc || !doc.body) return;
        applyHeight(
          Math.max(
            doc.body.scrollHeight || 0,
            doc.documentElement.scrollHeight || 0
          )
        );
      } catch (_error) {
        /* ignore */
      }
    }

    window.addEventListener("message", function (event) {
      var data = event && event.data;
      if (!data || data.type !== "magazine-frame-height") return;
      applyHeight(data.height);
    });

    frame.addEventListener("load", function () {
      resizeFrame();
      window.setTimeout(resizeFrame, 100);
      window.setTimeout(resizeFrame, 400);
      window.setTimeout(resizeFrame, 1200);
    });

    window.addEventListener("resize", resizeFrame);
  }

  ready(function () {
    if (document.body && document.body.className.indexOf("is-magazine-page") === -1) {
      document.body.className += (document.body.className ? " " : "") + "is-magazine-page";
    }
    bindMagazineFrame();
  });
})();
