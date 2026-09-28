/**
 * TrendyPicker newsletter validation messages.
 * Keeps browser-native validation while showing English copy on every page.
 */
(() => {
  const emailSelector = [
    ".newsletter input[type='email']",
    ".newsletter-section input[type='email']",
    ".bo-newsletter input[type='email']",
  ].join(", ");

  const isNewsletterEmail = (element) => element?.matches?.(emailSelector);

  document.addEventListener(
    "invalid",
    (event) => {
      const input = event.target;
      if (!isNewsletterEmail(input)) return;

      if (input.validity.valueMissing) {
        input.setCustomValidity("Please enter your email address.");
      } else if (input.validity.typeMismatch) {
        input.setCustomValidity("Please enter a valid email address.");
      } else {
        input.setCustomValidity("");
      }
    },
    true,
  );

  document.addEventListener("input", (event) => {
    const input = event.target;
    if (!isNewsletterEmail(input)) return;
    input.setCustomValidity("");
  });
})();
