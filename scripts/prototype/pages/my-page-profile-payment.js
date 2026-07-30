(() => {
  const selectApis = window.BridgeOn.myPage.selectApis;
  const paymentDialog = document.getElementById("profile-payment-dialog");
  const paymentForm = paymentDialog?.querySelector("[data-profile-payment-form]");
  const paymentList = document.querySelector("[data-profile-payment-list]");
  const paymentSubmitButton = paymentForm?.querySelector("[data-profile-payment-submit]");
  const paymentMessage = paymentForm?.querySelector("[data-profile-payment-message]");
  let activePaymentCard = null;
  
  if (paymentDialog && paymentForm && paymentList) {
    const paymentFields = {
      mode: paymentForm.elements.mode,
      type: paymentForm.elements.type,
      cardName: paymentForm.elements.cardName,
      cardNumber: paymentForm.elements.cardNumber,
      expiryMonth: paymentForm.elements.expiryMonth,
      expiryYear: paymentForm.elements.expiryYear,
      paypalEmail: paymentForm.elements.paypalEmail,
    };
    const cardFieldRows = Array.from(paymentForm.querySelectorAll("[data-profile-payment-card-field]"));
    const paypalFieldRows = Array.from(paymentForm.querySelectorAll("[data-profile-payment-paypal-field]"));
  
    const setPaymentMessage = (text = "", type = "error") => {
      if (!paymentMessage) return;
      paymentMessage.textContent = text;
      paymentMessage.classList.toggle("is-success", type === "success");
    };
  
    const setPaymentFieldValue = (field, value) => {
      if (field) field.value = value || "";
    };
  
    const getPaymentInfoNode = (card) =>
      Array.from(card.children).find(
        (child) => child.tagName === "DIV" && !child.classList.contains("profile-payment-actions")
      );
  
    const getPaymentBrand = (digits) => {
      if (/^4/.test(digits)) return "VISA";
      if (/^3[47]/.test(digits)) return "AMEX";
      if (/^(5[1-5]|2[2-7])/.test(digits)) return "MASTER";
      return "CARD";
    };
  
    const normalizePaymentDigits = (value) => String(value || "").replace(/\D/g, "");
  
    const formatPaymentCardNumber = (value) =>
      normalizePaymentDigits(value)
        .slice(0, 19)
        .replace(/(.{4})/g, "$1 ")
        .trim();
  
    const splitPaymentExpiry = (value) => {
      const [month = "", year = ""] = String(value || "").split("/");
      return {
        month: month.padStart(2, "0").slice(-2),
        year: year.slice(-2),
      };
    };
  
    const rebuildPaymentSelect = (select) => {
      const wrap = select?.closest(".realtrend-select-wrap");
      const api = wrap ? selectApis.get(wrap) : null;
      if (api) api.buildMenu();
    };
  
    const setPaymentSelectValue = (select, value) => {
      if (!select) return;
      const option = Array.from(select.options).find(
        (selectOption) => selectOption.value === value || selectOption.textContent.trim() === value
      );
      select.value = option ? option.value : select.options[0]?.value || "";
      rebuildPaymentSelect(select);
    };
  
    const renderPaymentTypeFields = () => {
      const isPaypal = paymentFields.type?.value === "paypal";
      cardFieldRows.forEach((row) => {
        row.hidden = isPaypal;
      });
      paypalFieldRows.forEach((row) => {
        row.hidden = !isPaypal;
      });
      setPaymentMessage();
    };
  
    const setPaymentCardContent = (card, data) => {
      card.dataset.paymentType = data.type;
      card.dataset.paymentLabel = data.label;
      card.dataset.paymentDetail = data.detail;
      card.dataset.paymentBrand = data.brand;
      card.dataset.paymentCardName = data.cardName || "";
      card.dataset.paymentCardNumber = data.cardNumber || "";
      card.dataset.paymentExpiry = data.expiry || "";
      card.dataset.paymentPaypalEmail = data.paypalEmail || "";
  
      const brand = card.querySelector(".profile-payment-brand");
      if (brand) {
        brand.className =
          data.type === "paypal"
            ? "profile-payment-brand profile-payment-brand--paypal"
            : "profile-payment-brand";
        brand.replaceChildren();
        if (data.type === "paypal") {
          const image = document.createElement("img");
          image.src = "../cart/img/paypal.png";
          image.alt = "";
          brand.appendChild(image);
        } else {
          brand.textContent = data.brand || "CARD";
        }
      }
  
      const info = getPaymentInfoNode(card);
      const title = info?.querySelector("strong");
      const detail = info?.querySelector("p");
      if (title) title.textContent = data.label;
      if (detail) detail.textContent = data.detail;
    };
  
    const updateDefaultPayment = (selectedCard) => {
      document.querySelectorAll("[data-profile-payment-card]").forEach((card) => {
        const isDefault = card === selectedCard;
        let mark = card.querySelector("mark");
        const button = card.querySelector("[data-profile-set-default-payment]");
        card.dataset.paymentDefault = isDefault ? "true" : "false";
        if (!mark) {
          mark = document.createElement("mark");
          mark.textContent = "Default";
          card.insertBefore(mark, card.querySelector(".profile-payment-actions"));
        }
        if (mark) {
          mark.textContent = "Default";
          mark.hidden = !isDefault;
        }
        if (button) {
          button.textContent = isDefault ? "Default" : "Set Default";
          button.disabled = isDefault;
        }
      });
    };
  
    const createPaymentCard = (data) => {
      const card = document.createElement("article");
      card.className = "profile-payment-card";
      card.dataset.profilePaymentCard = "";
      card.dataset.paymentDefault = "false";
  
      const brand = document.createElement("span");
      brand.className = "profile-payment-brand";
      brand.setAttribute("aria-hidden", "true");
  
      const info = document.createElement("div");
      info.appendChild(document.createElement("strong"));
      info.appendChild(document.createElement("p"));
  
      const mark = document.createElement("mark");
      mark.textContent = "Default";
      mark.hidden = true;
  
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.dataset.profileEditPayment = "";
      editButton.textContent = "Edit";
  
      const defaultButton = document.createElement("button");
      defaultButton.type = "button";
      defaultButton.dataset.profileSetDefaultPayment = "";
      defaultButton.textContent = "Set Default";
  
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.dataset.profileDeletePayment = "";
      deleteButton.textContent = "Delete";
  
      const actions = document.createElement("div");
      actions.className = "profile-payment-actions";
      actions.append(editButton, defaultButton, deleteButton);
  
      card.append(brand, info, mark, actions);
      setPaymentCardContent(card, data);
      return card;
    };
  
    const getPaymentFormData = () => {
      const type = paymentFields.type?.value || "card";
      const cardNumber = normalizePaymentDigits(paymentFields.cardNumber?.value);
      const cardName = paymentFields.cardName?.value.trim() || "";
      const expiryMonth = paymentFields.expiryMonth?.value || "";
      const expiryYear = paymentFields.expiryYear?.value || "";
      const expiry = expiryMonth && expiryYear ? `${expiryMonth}/${expiryYear}` : "";
      const paypalEmail = paymentFields.paypalEmail?.value.trim() || "";
  
      if (type === "paypal") {
        return {
          type,
          brand: "PayPal",
          label: "PayPal",
          detail: paypalEmail,
          paypalEmail,
        };
      }
  
      const brand = getPaymentBrand(cardNumber);
      const lastFour = cardNumber.slice(-4);
      return {
        type,
        brand,
        label: lastFour ? `${brand} ending in ${lastFour}` : brand,
        detail: expiry ? `Expires ${expiry}` : "",
        cardName,
        cardNumber,
        expiryMonth,
        expiryYear,
        expiry,
      };
    };
  
    const validatePaymentData = (data) => {
      if (data.type === "paypal") {
        if (!data.paypalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.paypalEmail)) {
          return "Enter a valid PayPal email.";
        }
        return "";
      }
  
      if (!data.cardName) return "Enter the cardholder name.";
      if (!data.cardNumber || data.cardNumber.length < 4) return "Enter a valid card number.";
      if (!data.expiry) return "Enter the card expiration date.";
      return "";
    };
  
    const fillPaymentForm = (card) => {
      const data = card?.dataset || {};
      const type = data.paymentType || "card";
      const expiry = splitPaymentExpiry(data.paymentExpiry || "");
      setPaymentFieldValue(paymentFields.mode, card ? "edit" : "add");
      setPaymentSelectValue(paymentFields.type, type);
      setPaymentFieldValue(paymentFields.cardName, data.paymentCardName || "");
      setPaymentFieldValue(paymentFields.cardNumber, formatPaymentCardNumber(data.paymentCardNumber || ""));
      setPaymentSelectValue(paymentFields.expiryMonth, expiry.month);
      setPaymentSelectValue(paymentFields.expiryYear, expiry.year);
      setPaymentFieldValue(paymentFields.paypalEmail, data.paymentPaypalEmail || data.paymentDetail || "");
      renderPaymentTypeFields();
      setPaymentMessage();
      if (paymentSubmitButton) {
        paymentSubmitButton.textContent = "Save";
        paymentSubmitButton.disabled = false;
      }
    };
  
    const closePaymentDialog = () => {
      paymentDialog.hidden = true;
      paymentDialog.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-profile-payment-open");
      activePaymentCard = null;
    };
  
    const openPaymentDialog = (card = null) => {
      activePaymentCard = card;
      fillPaymentForm(card);
      paymentDialog.hidden = false;
      paymentDialog.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-profile-payment-open");
      window.setTimeout(() => {
        paymentFields.type
          ?.closest(".realtrend-select-wrap")
          ?.querySelector(".realtrend-select-trigger")
          ?.focus();
      }, 0);
    };
  
    document.querySelectorAll("[data-profile-add-payment]").forEach((button) => {
      button.addEventListener("click", () => openPaymentDialog());
    });
  
    document.addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-profile-edit-payment]");
      if (editButton) {
        const card = editButton.closest("[data-profile-payment-card]");
        if (card) openPaymentDialog(card);
        return;
      }
  
      const defaultButton = event.target.closest("[data-profile-set-default-payment]");
      if (defaultButton) {
        const card = defaultButton.closest("[data-profile-payment-card]");
        if (card) updateDefaultPayment(card);
        return;
      }
  
      const deleteButton = event.target.closest("[data-profile-delete-payment]");
      if (!deleteButton) return;
      const card = deleteButton.closest("[data-profile-payment-card]");
      if (!card) return;
      const wasDefault = card.dataset.paymentDefault === "true";
      card.remove();
      if (wasDefault) {
        const nextCard = document.querySelector("[data-profile-payment-card]");
        if (nextCard) updateDefaultPayment(nextCard);
      }
    });
  
    paymentDialog.querySelectorAll("[data-profile-payment-close]").forEach((button) => {
      button.addEventListener("click", closePaymentDialog);
    });
  
    paymentFields.type?.addEventListener("change", renderPaymentTypeFields);
  
    paymentFields.cardNumber?.addEventListener("input", () => {
      const cursorAtEnd = paymentFields.cardNumber.selectionStart === paymentFields.cardNumber.value.length;
      paymentFields.cardNumber.value = formatPaymentCardNumber(paymentFields.cardNumber.value);
      if (cursorAtEnd) {
        const end = paymentFields.cardNumber.value.length;
        paymentFields.cardNumber.setSelectionRange(end, end);
      }
    });
  
    paymentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = getPaymentFormData();
      const error = validatePaymentData(data);
  
      if (error) {
        setPaymentMessage(error);
        return;
      }
  
      if (activePaymentCard) {
        setPaymentCardContent(activePaymentCard, data);
      } else {
        const hadPaymentCard = Boolean(paymentList.querySelector("[data-profile-payment-card]"));
        const newCard = createPaymentCard(data);
        paymentList.appendChild(newCard);
        if (!hadPaymentCard) updateDefaultPayment(newCard);
      }
  
      if (paymentSubmitButton) {
        paymentSubmitButton.textContent = "Saved";
        paymentSubmitButton.disabled = true;
      }
      setPaymentMessage("Payment method saved.", "success");
      window.setTimeout(closePaymentDialog, 650);
    });
  
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !paymentDialog.hidden) closePaymentDialog();
    });
  
    updateDefaultPayment(
      document.querySelector('[data-profile-payment-card][data-payment-default="true"]') ||
        document.querySelector("[data-profile-payment-card]")
    );
  }
  
})();
