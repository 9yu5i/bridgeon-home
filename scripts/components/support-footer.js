(() => {
  document.querySelectorAll(".footer-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const group = toggle.closest(".footer-group");
      if (!group || window.matchMedia("(min-width: 761px)").matches) return;
      group.classList.toggle("is-open");
    });
  });

  document.querySelector(".to-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.querySelector(".newsletter form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = event.currentTarget.querySelector("input");
    if (input) input.value = "";
  });
})();
