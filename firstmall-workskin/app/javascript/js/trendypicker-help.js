(() => {
  const helpPage = document.querySelector(".bo-help-page");
  if (!helpPage) return;

  helpPage.querySelectorAll(".bo-help-faq__question").forEach((question) => {
    question.addEventListener("click", () => {
      const answerId = question.getAttribute("aria-controls");
      const answer = answerId ? document.getElementById(answerId) : null;
      if (!answer) return;

      const isOpen = question.getAttribute("aria-expanded") === "true";
      question.setAttribute("aria-expanded", String(!isOpen));
      answer.hidden = isOpen;
    });
  });
})();
