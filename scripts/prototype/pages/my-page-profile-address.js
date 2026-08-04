(() => {
  const getCallingCode = window.TrendyPicker.profile.getCallingCode;
  const selectApis = window.TrendyPicker.myPage.selectApis;
  const addressDialog = document.getElementById("profile-address-dialog");
  const addressForm = addressDialog?.querySelector("[data-profile-address-form]");
  const addressSearchInput = addressForm?.querySelector("[data-profile-address-search]");
  const addressSuggestionList = addressForm?.querySelector("[data-profile-address-suggestions]");
  const addressSubmitButton = addressForm?.querySelector("[data-profile-address-submit]");
  let activeAddressCard = null;
  
  if (addressDialog && addressForm) {
    const addressSuggestions = [
      { address: "350 5th Ave", city: "New York", state: "NY", zip: "10118", country: "United States" },
      { address: "1600 Amphitheatre Pkwy", city: "Mountain View", state: "CA", zip: "94043", country: "United States" },
      { address: "290 Bremner Blvd", city: "Toronto", state: "ON", zip: "M5V 3L9", country: "Canada" },
      { address: "100 Queen St W", city: "Toronto", state: "ON", zip: "M5H 2N2", country: "Canada" },
      { address: "300 Olympic-ro", city: "Seoul", state: "Songpa-gu", zip: "05551", country: "South Korea" },
      { address: "12 Haneul-gil", city: "Seoul", state: "Gangseo-gu", zip: "07505", country: "South Korea" },
      { address: "4-2-8 Shibakoen", city: "Minato City", state: "Tokyo", zip: "105-0011", country: "Japan" },
      { address: "1-1 Maihama", city: "Urayasu", state: "Chiba", zip: "279-0031", country: "Japan" },
      { address: "Westminster Bridge Road", city: "London", state: "England", zip: "SE1 7PB", country: "United Kingdom" },
      { address: "1 New Change", city: "London", state: "England", zip: "EC4M 9AF", country: "United Kingdom" },
      { address: "Bennelong Point", city: "Sydney", state: "NSW", zip: "2000", country: "Australia" },
      { address: "Federation Square", city: "Melbourne", state: "VIC", zip: "3000", country: "Australia" },
      { address: "10 Bayfront Avenue", city: "Singapore", state: "Singapore", zip: "018956", country: "Singapore" },
      { address: "93 Stamford Road", city: "Singapore", state: "Singapore", zip: "178897", country: "Singapore" },
      { address: "Pariser Platz", city: "Berlin", state: "BE", zip: "10117", country: "Germany" },
      { address: "Potsdamer Platz 1", city: "Berlin", state: "BE", zip: "10785", country: "Germany" },
      { address: "Champ de Mars", city: "Paris", state: "Ile-de-France", zip: "75007", country: "France" },
      { address: "6 Parvis Notre-Dame", city: "Paris", state: "Ile-de-France", zip: "75004", country: "France" },
    ];
  
    const addressFields = {
      mode: addressForm.elements.mode,
      country: addressForm.elements.country,
      address: addressForm.elements.address,
      apt: addressForm.elements.apt,
      city: addressForm.elements.city,
      state: addressForm.elements.state,
      zip: addressForm.elements.zip,
      phoneCode: addressForm.elements.phoneCode,
      phone: addressForm.elements.phone,
      email: addressForm.elements.email,
    };
  
    const setFieldValue = (field, value) => {
      if (field) field.value = value || "";
    };
  
    const clearAddressSampleValue = (field) => {
      if (!field) return;
      const value = field.value.trim();
      const samples = new Set(["000 000 0000", "name@email.com", field.placeholder?.trim()].filter(Boolean));
      if (samples.has(value)) field.value = "";
    };
  
    const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  
    const getDialingCode = (value) => String(value || "").trim().match(/^\+\d+/)?.[0] || "";
  
    const stripAddressPhoneCountryCode = (phoneNumber) => {
      let value = String(phoneNumber || "").trim();
      const selectedCode = addressFields.phoneCode?.value || "";
      const codeCandidates = [
        selectedCode,
        getDialingCode(selectedCode),
        ...Array.from(addressFields.phoneCode?.options || []).flatMap((option) => [
          option.value,
          option.textContent.trim(),
          getDialingCode(option.value),
          getDialingCode(option.textContent),
        ]),
      ]
        .filter(Boolean)
        .sort((a, b) => b.length - a.length);
  
      const matchedCode = codeCandidates.find((code) =>
        new RegExp(`^${escapeRegExp(code)}(?:\\s|-|(?=\\d)|$)`).test(value)
      );
      if (matchedCode) value = value.replace(new RegExp(`^${escapeRegExp(matchedCode)}(?:\\s|-)*`), "").trim();
      return value;
    };
  
    const rebuildAddressSelect = (select) => {
      const wrap = select?.closest(".realtrend-select-wrap");
      const api = wrap ? selectApis.get(wrap) : null;
      if (api) api.buildMenu();
    };
  
    const setAddressSelectValue = (select, value) => {
      if (!select) return;
      const option = Array.from(select.options).find(
        (selectOption) => selectOption.value === value || selectOption.textContent.trim() === value
      );
      if (option) {
        select.value = option.value;
      } else {
        select.value = select.options[0]?.value || "";
      }
      rebuildAddressSelect(select);
    };
  
    const splitAddressPhone = (phone) => {
      const value = String(phone || "").trim();
      const codes = Array.from(addressFields.phoneCode?.options || [])
        .map((option) => option.value || option.textContent.trim())
        .sort((a, b) => b.length - a.length);
      const matchedCode = codes.find((code) => value === code || value.startsWith(`${code} `));
  
      return {
        code: matchedCode || "+1 US",
        number: matchedCode ? value.slice(matchedCode.length).trim() : value,
      };
    };
  
    const getAddressData = () => {
      const phoneNumber = stripAddressPhoneCountryCode(addressFields.phone?.value);
      setFieldValue(addressFields.phone, phoneNumber);
      return {
        country: addressFields.country?.value || "Global",
        addressLine: addressFields.address?.value.trim() || "",
        apt: addressFields.apt?.value.trim() || "",
        city: addressFields.city?.value.trim() || "",
        state: addressFields.state?.value.trim() || "",
        zip: addressFields.zip?.value.trim() || "",
        phone: phoneNumber ? `${addressFields.phoneCode?.value || "+1 US"} ${phoneNumber}` : "",
        email: addressFields.email?.value.trim() || "",
      };
    };
  
    const applySuggestion = (suggestion) => {
      setAddressSelectValue(addressFields.country, suggestion.country);
      setAddressSelectValue(addressFields.phoneCode, getCallingCode(suggestion.country));
      setFieldValue(addressFields.address, suggestion.address);
      setFieldValue(addressFields.city, suggestion.city);
      setFieldValue(addressFields.state, suggestion.state);
      setFieldValue(addressFields.zip, suggestion.zip);
      if (addressSuggestionList) addressSuggestionList.hidden = true;
    };
  
    const getCountryAddressSuggestions = () => {
      const country = addressFields.country?.value || "Global";
      if (country === "Global") return addressSuggestions;
      const countryMatches = addressSuggestions.filter((suggestion) => suggestion.country === country);
      return countryMatches.length ? countryMatches : addressSuggestions;
    };
  
    const updateAddressPlaceholder = () => {
      if (!addressSearchInput) return;
      const firstSuggestion = getCountryAddressSuggestions()[0];
      addressSearchInput.placeholder = firstSuggestion
        ? addressFields.country?.value === "Global"
          ? "Search addresses worldwide"
          : `Try ${firstSuggestion.address}`
        : "Start typing your street address";
    };
  
    const renderAddressSuggestions = () => {
      if (!addressSuggestionList || !addressSearchInput) return;
      const query = addressSearchInput.value.trim().toLowerCase();
      addressSuggestionList.replaceChildren();
      const countrySuggestions = getCountryAddressSuggestions();
  
      if (!query) {
        addressSuggestionList.hidden = true;
        return;
      }
  
      const matches = countrySuggestions.filter((suggestion) =>
        `${suggestion.address} ${suggestion.city} ${suggestion.state} ${suggestion.zip} ${suggestion.country}`
          .toLowerCase()
          .includes(query)
      );
  
      (matches.length ? matches : countrySuggestions).slice(0, 4).forEach((suggestion) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.innerHTML = `<strong></strong><small></small>`;
        button.querySelector("strong").textContent = suggestion.address;
        button.querySelector("small").textContent =
          `${suggestion.city}, ${suggestion.state} ${suggestion.zip} - ${suggestion.country}`;
        button.addEventListener("click", () => applySuggestion(suggestion));
        item.appendChild(button);
        addressSuggestionList.appendChild(item);
      });
  
      addressSuggestionList.hidden = false;
    };
  
    const setAddressCardContent = (card, data) => {
      card.dataset.country = data.country;
      card.dataset.addressLine = data.addressLine;
      card.dataset.apt = data.apt;
      card.dataset.city = data.city;
      card.dataset.state = data.state;
      card.dataset.zip = data.zip;
      card.dataset.phone = data.phone;
      card.dataset.email = data.email;
  
      const info = card.querySelector("div");
      const title = info?.querySelector("strong");
      const address = info?.querySelector("p");
      const contact = info?.querySelector("small");
      const editButton = card.querySelector("[data-profile-edit-address]");
      const addressLine = [data.addressLine, data.apt].filter(Boolean).join(", ");
      const regionLine = [data.city, data.state].filter(Boolean).join(", ");
  
      if (title) title.textContent = "Name";
      if (address) {
        address.replaceChildren(
          document.createTextNode(addressLine || "Enter your shipping address."),
          document.createElement("br"),
          document.createTextNode(`${regionLine}${regionLine && data.zip ? " " : ""}${data.zip}`)
        );
      }
      if (contact) {
        contact.replaceChildren(
          document.createTextNode(data.phone || "Add phone number"),
          ...(data.email ? [document.createElement("br"), document.createTextNode(data.email)] : [])
        );
      }
      if (editButton) editButton.textContent = "Edit";
    };
  
    const updateDefaultAddress = (selectedCard) => {
      document.querySelectorAll("[data-profile-address-card]").forEach((card) => {
        const isDefault = card === selectedCard;
        const button = card.querySelector("[data-profile-set-default-address]");
        card.classList.toggle("is-default", isDefault);
        if (button) {
          button.textContent = isDefault ? "Default" : "Set Default";
          button.disabled = isDefault;
        }
      });
    };

    const createAddressCard = (data) => {
      const card = document.createElement("article");
      card.className = "profile-address-card";
      card.dataset.profileAddressCard = "";

      const info = document.createElement("div");
      info.appendChild(document.createElement("strong"));
      info.appendChild(document.createElement("p"));
      info.appendChild(document.createElement("small"));

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.dataset.profileEditAddress = "";
      editButton.textContent = "Edit";

      const defaultButton = document.createElement("button");
      defaultButton.type = "button";
      defaultButton.dataset.profileSetDefaultAddress = "";
      defaultButton.textContent = "Set Default";

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "profile-address-delete";
      deleteButton.dataset.profileDeleteAddress = "";
      deleteButton.textContent = "Delete";

      const actions = document.createElement("div");
      actions.className = "profile-address-actions";
      actions.append(editButton, defaultButton, deleteButton);

      card.append(info, actions);
      setAddressCardContent(card, data);
      return card;
    };
  
    const fillAddressForm = (card) => {
      const defaults = {
        country: "Global",
        addressLine: "",
        apt: "",
        city: "",
        state: "",
        zip: "",
        phoneCode: "+1 US",
        phone: "",
        email: "",
      };
      const data = card ? { ...defaults, ...card.dataset } : defaults;
      const phoneParts = splitAddressPhone(data.phone);
  
      setFieldValue(addressFields.mode, card ? "edit" : "add");
      setAddressSelectValue(addressFields.country, data.country || "Global");
      setFieldValue(addressFields.address, data.addressLine);
      setFieldValue(addressFields.apt, data.apt);
      setFieldValue(addressFields.city, data.city);
      setFieldValue(addressFields.state, data.state);
      setFieldValue(addressFields.zip, data.zip);
      setAddressSelectValue(addressFields.phoneCode, phoneParts.code || data.phoneCode || "+1 US");
      setFieldValue(addressFields.phone, phoneParts.number);
      setFieldValue(addressFields.email, data.email);
      updateAddressPlaceholder();
      if (addressSuggestionList) addressSuggestionList.hidden = true;
    };
  
    const closeAddressDialog = () => {
      addressDialog.hidden = true;
      addressDialog.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-profile-address-open");
      activeAddressCard = null;
      if (addressSubmitButton) {
        addressSubmitButton.textContent = "Save";
        addressSubmitButton.disabled = false;
      }
    };
  
    const openAddressDialog = (card = null) => {
      activeAddressCard = card;
      fillAddressForm(card);
      addressDialog.hidden = false;
      addressDialog.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-profile-address-open");
      window.setTimeout(() => {
        addressFields.country
          ?.closest(".realtrend-select-wrap")
          ?.querySelector(".realtrend-select-trigger")
          ?.focus();
      }, 0);
    };
  
    document.querySelectorAll("[data-profile-add-address]").forEach((button) => {
      button.addEventListener("click", () => openAddressDialog());
    });
  
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-profile-edit-address]");
      if (!button) return;
      const card = button.closest("[data-profile-address-card]");
      if (card) openAddressDialog(card);
    });
  
    document.addEventListener("click", (event) => {
      const defaultButton = event.target.closest("[data-profile-set-default-address]");
      if (defaultButton) {
        const card = defaultButton.closest("[data-profile-address-card]");
        if (card) updateDefaultAddress(card);
        return;
      }
  
      const deleteButton = event.target.closest("[data-profile-delete-address]");
      if (!deleteButton) return;
      const card = deleteButton.closest("[data-profile-address-card]");
      if (!card) return;
      const wasDefault = card.querySelector("[data-profile-set-default-address]")?.disabled;
      card.remove();
      if (wasDefault) {
        const nextCard = document.querySelector("[data-profile-address-card]");
        if (nextCard) updateDefaultAddress(nextCard);
      }
    });
  
    addressDialog.querySelectorAll("[data-profile-address-close]").forEach((button) => {
      button.addEventListener("click", closeAddressDialog);
    });
  
    addressFields.country?.addEventListener("change", () => {
      const selectedCountry = addressFields.country?.value || "Global";
      if (selectedCountry !== "Global") {
        setAddressSelectValue(addressFields.phoneCode, getCallingCode(selectedCountry));
      }
      setFieldValue(addressFields.address, "");
      setFieldValue(addressFields.city, "");
      setFieldValue(addressFields.state, "");
      setFieldValue(addressFields.zip, "");
      updateAddressPlaceholder();
      if (addressSuggestionList) addressSuggestionList.hidden = true;
    });
  
    addressForm.querySelectorAll("[data-profile-clear-sample]").forEach((field) => {
      field.addEventListener("focus", () => clearAddressSampleValue(field));
    });
  
    addressFields.phone?.addEventListener("blur", () => {
      setFieldValue(addressFields.phone, stripAddressPhoneCountryCode(addressFields.phone.value));
    });
  
    updateAddressPlaceholder();
    addressSearchInput?.addEventListener("input", renderAddressSuggestions);
  
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !addressDialog.hidden) closeAddressDialog();
    });
  
    addressForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = getAddressData();
      if (!data.addressLine || !data.city || !data.state || !data.zip) {
        renderAddressSuggestions();
        addressFields.address?.focus();
        return;
      }
  
      if (activeAddressCard) {
        setAddressCardContent(activeAddressCard, data);
      } else {
        const addressCardSection = document.querySelector("[data-profile-add-address]")?.closest(".profile-card");
        const hadAddressCard = Boolean(document.querySelector("[data-profile-address-card]"));
        const newCard = createAddressCard(data);
        addressCardSection?.appendChild(newCard);
        if (!hadAddressCard) updateDefaultAddress(newCard);
      }
  
      if (addressSubmitButton) {
        addressSubmitButton.textContent = "Saved";
        addressSubmitButton.disabled = true;
      }
  
      window.setTimeout(closeAddressDialog, 650);
    });
  }
  
})();
