(() => {
  const nativeFieldTable = document.querySelector(
    "[data-bo-native-source] .resp_join_table",
  );
  const personalFieldTable = document.querySelector(
    "[data-bo-personal-fields] .resp_join_table",
  );
  const passwordFieldTable = document.querySelector(
    "[data-bo-password-fields] .resp_join_table",
  );

  const getNativeRows = () =>
    Array.from(nativeFieldTable?.children || []).filter(
      (element) => element.tagName === "UL",
    );

  const findFieldRow = (selectors, labelPattern) =>
    getNativeRows().find((row) => {
      const hasMatchingControl = selectors.some((selector) =>
        row.querySelector(selector),
      );
      const label = row.querySelector(".th p")?.textContent.trim() || "";
      return hasMatchingControl || labelPattern?.test(label);
    });

  const movePersonalField = (selectors, labelPattern, label) => {
    const row = findFieldRow(selectors, labelPattern);
    if (!row || !personalFieldTable) return false;

    row.classList.remove("dn");
    const labelElement = row.querySelector(".th p");
    if (labelElement) labelElement.textContent = label;
    personalFieldTable.append(row);
    return true;
  };

  const countryNames = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "New Zealand",
    "Japan",
    "South Korea",
    "Singapore",
    "Hong Kong",
    "Taiwan",
    "China",
    "Thailand",
    "Vietnam",
    "Philippines",
    "Indonesia",
    "Malaysia",
    "India",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Netherlands",
    "Belgium",
    "Sweden",
    "Norway",
    "Denmark",
    "Finland",
    "Ireland",
    "Switzerland",
    "Austria",
    "Portugal",
    "Poland",
    "Czech Republic",
    "Greece",
    "Mexico",
    "Brazil",
    "Chile",
    "Colombia",
    "Argentina",
    "Peru",
    "United Arab Emirates",
    "Saudi Arabia",
    "Turkey",
    "South Africa",
  ];

  const createCountryRow = () => {
    const row = document.createElement("ul");
    row.className = "bo-profile-country-field";
    row.innerHTML =
      '<li class="th"><p>Country</p></li>' +
      '<li class="td"><select name="country" aria-label="Country">' +
      '<option value="">Select country</option>' +
      countryNames.map((country) => `<option value="${country}">${country}</option>`).join("") +
      "</select></li>";
    return row;
  };

  const enhanceCountryField = (row) => {
    const fieldCell = row?.querySelector(".td");
    const originalControl = fieldCell?.querySelector("select, input:not([type='hidden'])");
    if (!fieldCell || !originalControl) return;

    row.classList.add("profile-field");
    let nativeSelect = originalControl;
    let sourceInput = null;

    if (originalControl.tagName !== "SELECT") {
      sourceInput = originalControl;
      sourceInput.classList.add("bo-profile-country-source");
      nativeSelect = document.createElement("select");
      nativeSelect.setAttribute("aria-label", "Country");

      const currentCountry = sourceInput.value.trim();
      const options = currentCountry && !countryNames.includes(currentCountry)
        ? [currentCountry, ...countryNames]
        : countryNames;
      nativeSelect.append(new Option("Select country", ""));
      options.forEach((country) => nativeSelect.append(new Option(country, country)));
      nativeSelect.value = currentCountry;
    }

    nativeSelect.classList.add("realtrend-select-native");
    nativeSelect.tabIndex = -1;
    nativeSelect.setAttribute("aria-hidden", "true");

    const wrap = document.createElement("span");
    wrap.className = "profile-select-control realtrend-select-wrap";
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "realtrend-select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    const value = document.createElement("span");
    value.className = "realtrend-select-value";
    const menu = document.createElement("ul");
    menu.className = "realtrend-select-menu";
    menu.setAttribute("role", "listbox");
    trigger.append(value);
    wrap.append(trigger, menu, nativeSelect);
    fieldCell.append(wrap);

    const closeMenu = () => {
      wrap.classList.remove("is-open");
      menu.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    };

    const syncSelection = () => {
      const selectedOption = nativeSelect.options[nativeSelect.selectedIndex];
      value.textContent = selectedOption?.textContent || "Select country";
      menu.querySelectorAll("li").forEach((item) => {
        const isSelected = item.dataset.value === nativeSelect.value;
        item.classList.toggle("is-selected", isSelected);
        item.setAttribute("aria-selected", String(isSelected));
      });
      if (sourceInput) sourceInput.value = nativeSelect.value;
    };

    Array.from(nativeSelect.options).forEach((option) => {
      const item = document.createElement("li");
      item.textContent = option.textContent;
      item.dataset.value = option.value;
      item.setAttribute("role", "option");
      item.addEventListener("click", () => {
        nativeSelect.value = option.value;
        nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
        sourceInput?.dispatchEvent(new Event("input", { bubbles: true }));
        syncSelection();
        closeMenu();
        trigger.focus();
      });
      menu.append(item);
    });

    trigger.addEventListener("click", () => {
      const willOpen = !wrap.classList.contains("is-open");
      document.querySelectorAll(".realtrend-select-wrap.is-open").forEach((openWrap) => {
        if (openWrap === wrap) return;
        openWrap.classList.remove("is-open");
        openWrap.querySelector(".realtrend-select-menu")?.classList.remove("is-open");
        openWrap.querySelector(".realtrend-select-trigger")?.setAttribute("aria-expanded", "false");
      });
      wrap.classList.toggle("is-open", willOpen);
      menu.classList.toggle("is-open", willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));
    });

    document.addEventListener("pointerdown", (event) => {
      if (!wrap.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && wrap.classList.contains("is-open")) {
        closeMenu();
        trigger.focus();
      }
    });
    syncSelection();
  };

  const createInlineSelect = ({ options, selectedValue, className, label }) => {
    const wrap = document.createElement("span");
    wrap.className = `${className} realtrend-select-wrap`;
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "realtrend-select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    const value = document.createElement("span");
    value.className = "realtrend-select-value";
    const menu = document.createElement("ul");
    menu.className = "realtrend-select-menu";
    menu.setAttribute("role", "listbox");
    const select = document.createElement("select");
    select.className = "realtrend-select-native";
    select.name = "country_calling_code";
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
    select.setAttribute("aria-label", label);

    options.forEach((option) => {
      select.append(new Option(option.label, option.value));
      const item = document.createElement("li");
      item.textContent = option.label;
      item.dataset.value = option.value;
      item.setAttribute("role", "option");
      menu.append(item);
    });
    select.value = selectedValue;
    trigger.append(value);
    wrap.append(trigger, menu, select);

    const close = () => {
      wrap.classList.remove("is-open");
      menu.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    };

    const sync = () => {
      const option = select.options[select.selectedIndex];
      value.textContent = option?.textContent || "";
      menu.querySelectorAll("li").forEach((item) => {
        const isSelected = item.dataset.value === select.value;
        item.classList.toggle("is-selected", isSelected);
        item.setAttribute("aria-selected", String(isSelected));
      });
    };

    trigger.addEventListener("click", () => {
      const willOpen = !wrap.classList.contains("is-open");
      wrap.classList.toggle("is-open", willOpen);
      menu.classList.toggle("is-open", willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));
    });

    menu.addEventListener("click", (event) => {
      const item = event.target.closest("li[data-value]");
      if (!item) return;
      select.value = item.dataset.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      sync();
      close();
      trigger.focus();
    });

    document.addEventListener("pointerdown", (event) => {
      if (!wrap.contains(event.target)) close();
    });
    sync();
    return wrap;
  };

  const enhancePhoneField = (row) => {
    const fieldCell = row?.querySelector(".td");
    const nativeInputs = Array.from(
      fieldCell?.querySelectorAll(
        'input[name="cellphone[]"], input[name="phone[]"]',
      ) || [],
    );
    if (!fieldCell || !nativeInputs.length) return;

    row.classList.add("profile-field", "bo-profile-phone-row");
    nativeInputs.forEach((input) => input.classList.add("bo-profile-native-phone"));

    const phoneControl = document.createElement("div");
    phoneControl.className = "profile-phone-control";
    const callingCode = createInlineSelect({
      className: "profile-phone-code",
      label: "Country calling code",
      selectedValue: "+1",
      options: [
        { value: "+1", label: "+1 US" },
        { value: "+82", label: "+82 KR" },
        { value: "+81", label: "+81 JP" },
        { value: "+86", label: "+86 CN" },
        { value: "+44", label: "+44 UK" },
        { value: "+61", label: "+61 AU" },
        { value: "+33", label: "+33 FR" },
        { value: "+49", label: "+49 DE" },
        { value: "+65", label: "+65 SG" },
      ],
    });
    const visibleInput = document.createElement("input");
    visibleInput.type = "tel";
    visibleInput.className = "bo-profile-phone-number";
    visibleInput.autocomplete = "tel-national";
    visibleInput.setAttribute("aria-label", "Phone number");
    visibleInput.placeholder = "000 000 0000";
    visibleInput.value = nativeInputs.map((input) => input.value).filter(Boolean).join(" ");
    phoneControl.append(callingCode, visibleInput);
    fieldCell.append(phoneControl);

    const syncNativePhone = () => {
      const spacedParts = visibleInput.value
        .trim()
        .split(/[\s-]+/)
        .filter(Boolean);
      let parts = spacedParts;

      if (parts.length < nativeInputs.length) {
        const digits = visibleInput.value.replace(/\D/g, "");
        if (digits.length >= 10 && nativeInputs.length === 3) {
          const firstLength = 3;
          const middleLength = digits.length === 10 ? 3 : 4;
          parts = [
            digits.slice(0, firstLength),
            digits.slice(firstLength, firstLength + middleLength),
            digits.slice(firstLength + middleLength),
          ];
        } else {
          parts = [digits];
        }
      }

      nativeInputs.forEach((input, index) => {
        input.value = parts[index] || "";
      });
    };

    visibleInput.addEventListener("input", syncNativePhone);
    document.getElementById("registFrm")?.addEventListener("submit", syncNativePhone);
  };

  const enhanceEmailField = (row) => {
    const fieldCell = row?.querySelector(".td");
    const nativeInputs = Array.from(
      fieldCell?.querySelectorAll(
        'input[name="email[0]"], input[name="email[1]"], input[name="bemail[0]"], input[name="bemail[1]"]',
      ) || [],
    );
    if (!fieldCell || nativeInputs.length < 2) return;

    row.classList.add("profile-field", "bo-profile-email-row");
    nativeInputs.forEach((input) => input.classList.add("bo-profile-native-email"));
    const visibleInput = document.createElement("input");
    visibleInput.type = "email";
    visibleInput.className = "bo-profile-email-input";
    visibleInput.autocomplete = "email";
    visibleInput.setAttribute("aria-label", "Email");
    visibleInput.value =
      nativeInputs[0].value && nativeInputs[1].value
        ? `${nativeInputs[0].value}@${nativeInputs[1].value}`
        : nativeInputs[0].value;
    fieldCell.append(visibleInput);

    const syncNativeEmail = () => {
      const separator = visibleInput.value.lastIndexOf("@");
      nativeInputs[0].value =
        separator >= 0 ? visibleInput.value.slice(0, separator) : visibleInput.value;
      nativeInputs[1].value =
        separator >= 0 ? visibleInput.value.slice(separator + 1) : "";
    };

    visibleInput.addEventListener("input", syncNativeEmail);
    document.getElementById("registFrm")?.addEventListener("submit", syncNativeEmail);
  };

  if (nativeFieldTable && personalFieldTable) {
    movePersonalField(
      ['input[name="first_name"]', 'input[name="user_first_name"]'],
      /^first name$/i,
      "First Name",
    );
    movePersonalField(
      ['input[name="last_name"]', 'input[name="user_last_name"]'],
      /^last name$/i,
      "Last Name",
    );

    const hasCountry = movePersonalField(
      [
        '[name="country"]',
        '[name="country_code"]',
        '[name="nation"]',
        '[name="nation_code"]',
      ],
      /^(country|country\s*\/\s*region|nation|국가)$/i,
      "Country",
    );

    if (!hasCountry) personalFieldTable.append(createCountryRow());

    movePersonalField(
      ['input[name="cellphone[]"]', 'input[name="phone[]"]'],
      /^(phone|tel|phone number)$/i,
      "Phone Number",
    );
    movePersonalField(
      ['input[name="email[0]"]', 'input[name="bemail[0]"]'],
      /^e-?mail$/i,
      "Email",
    );
    movePersonalField(
      ['input[name="birthday"]'],
      /^(birth|birthday)$/i,
      "Birthday",
    );

    const countryRow = personalFieldTable.querySelector(
      ".bo-profile-country-field, :scope > ul:has([name='country']), :scope > ul:has([name='country_code']), :scope > ul:has([name='nation']), :scope > ul:has([name='nation_code'])",
    );
    enhanceCountryField(countryRow);

    const birthdayInput = personalFieldTable.querySelector('input[name="birthday"]');
    if (birthdayInput) {
      birthdayInput.classList.remove("datepicker");
      birthdayInput.dataset.profileBirthday = "";
      birthdayInput.readOnly = true;
      birthdayInput.inputMode = "none";
      birthdayInput.setAttribute("aria-haspopup", "dialog");
      birthdayInput.setAttribute("aria-expanded", "false");
      birthdayInput.setAttribute("autocomplete", "bday");
    }

    enhancePhoneField(
      personalFieldTable.querySelector(
        ":scope > ul:has(input[name='cellphone[]']), :scope > ul:has(input[name='phone[]'])",
      ),
    );
    enhanceEmailField(
      personalFieldTable.querySelector(
        ":scope > ul:has(input[name='email[0]']), :scope > ul:has(input[name='bemail[0]'])",
      ),
    );

    const firstNameInput = personalFieldTable.querySelector(
      'input[name="first_name"], input[name="user_first_name"]',
    );
    const lastNameInput = personalFieldTable.querySelector(
      'input[name="last_name"], input[name="user_last_name"]',
    );
    [firstNameInput, lastNameInput].forEach((input) => {
      input?.removeAttribute("readonly");
      if (input) input.readOnly = false;
    });

    const profileName = document.querySelector(".bo-profile-avatar-panel > strong");
    const syncProfileName = () => {
      if (!profileName) return;
      const fullName = [firstNameInput?.value, lastNameInput?.value]
        .map((value) => String(value || "").trim())
        .filter(Boolean)
        .join(" ");
      if (fullName) profileName.textContent = fullName;
    };
    firstNameInput?.addEventListener("input", syncProfileName);
    lastNameInput?.addEventListener("input", syncProfileName);

    [
      firstNameInput,
      lastNameInput,
      personalFieldTable.querySelector(".bo-profile-phone-number"),
      personalFieldTable.querySelector(".bo-profile-email-input"),
      birthdayInput,
    ].forEach((input) => {
      if (!input?.value) return;

      const savedValue = input.value;
      let hasNewValue = false;
      let isResetting = false;

      input.dataset.boRestoreValue = savedValue;
      input.addEventListener("focus", () => {
        if (hasNewValue || input.value !== savedValue) return;
        isResetting = true;
        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        isResetting = false;
      });
      input.addEventListener("input", () => {
        if (isResetting) return;
        hasNewValue = input.value.trim() !== "";
      });
      input.addEventListener("blur", () => {
        if (input.value.trim() !== "") return;
        isResetting = true;
        input.value = savedValue;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        isResetting = false;
        hasNewValue = false;
      });
    });
  }

  const passwordCard = document.querySelector("[data-bo-password-card]");
  const oldPasswordRow = findFieldRow(
    ['input[name="old_password"]'],
    /^old password$/i,
  );
  const newPasswordRow = findFieldRow(
    ['input[name="new_password"]'],
    /^new password$/i,
  );

  if (passwordFieldTable && oldPasswordRow && newPasswordRow) {
    const setPasswordLabel = (row, label) => {
      row.classList.remove("dn");
      const labelElement = row.querySelector(".th p");
      if (labelElement) labelElement.textContent = label;
      passwordFieldTable.append(row);
    };

    setPasswordLabel(oldPasswordRow, "Current Password");
    setPasswordLabel(newPasswordRow, "New Password");

    const confirmRow = document.createElement("ul");
    confirmRow.className = "bo-profile-password-confirm";
    confirmRow.innerHTML =
      '<li class="th"><p>Confirm Password</p></li>' +
      '<li class="td"><input type="password" autocomplete="new-password" data-bo-password-confirm placeholder="Confirm new password" /></li>';
    passwordFieldTable.append(confirmRow);

    const oldPasswordInput = oldPasswordRow.querySelector(
      'input[name="old_password"]',
    );
    const newPasswordInput = newPasswordRow.querySelector(
      'input[name="new_password"]',
    );
    const confirmPasswordInput = confirmRow.querySelector(
      "[data-bo-password-confirm]",
    );
    const profileForm = document.getElementById("registFrm");

    oldPasswordInput?.setAttribute("autocomplete", "current-password");
    oldPasswordInput?.setAttribute("placeholder", "Enter current password");
    newPasswordInput?.setAttribute("autocomplete", "new-password");
    newPasswordInput?.setAttribute("placeholder", "Enter new password");

    profileForm?.addEventListener("submit", (event) => {
      if (!newPasswordInput?.value && !confirmPasswordInput?.value) return;

      if (!oldPasswordInput?.value) {
        event.preventDefault();
        window.alert("Enter your current password.");
        oldPasswordInput?.focus();
        return;
      }

      if (newPasswordInput.value !== confirmPasswordInput?.value) {
        event.preventDefault();
        window.alert("The new password confirmation does not match.");
        confirmPasswordInput?.focus();
      }
    });
  } else if (passwordCard) {
    passwordCard.hidden = true;
  }

  const preferences = document.querySelector("[data-bo-preferences]");
  const nativeSource = document.querySelector("[data-bo-native-source]");

  const appendPreference = ({ input, title, description }) => {
    if (!preferences || !input) return;

    input.classList.remove("mr5");
    const label = document.createElement("label");
    label.className = "bo-profile-preference";
    const copy = document.createElement("span");
    copy.className = "bo-profile-preference__copy";
    const heading = document.createElement("strong");
    heading.textContent = title;
    const detail = document.createElement("small");
    detail.textContent = description;
    const control = document.createElement("span");
    control.className = "bo-profile-switch";
    copy.append(heading, detail);
    control.append(input, document.createElement("i"));
    label.append(copy, control);
    preferences.append(label);
  };

  appendPreference({
    input: nativeSource?.querySelector('input[name="mailing"]'),
    title: "Email Offers",
    description: "Coupons, product news, and editor picks",
  });
  appendPreference({
    input: nativeSource?.querySelector('input[name="sms"]'),
    title: "SMS Alerts",
    description: "Important account and promotional alerts",
  });

  if (preferences) {
    const orderUpdates = document.createElement("div");
    orderUpdates.className = "bo-profile-preference";
    orderUpdates.innerHTML =
      '<span class="bo-profile-preference__copy"><strong>Order Updates</strong>' +
      '<small>Shipping, delivery, cancellation, and refund notifications</small></span>' +
      '<span class="bo-profile-always-on">Always on</span>';
    const smsPreference = preferences.querySelector(
      'input[name="sms"]',
    )?.closest(".bo-profile-preference");
    preferences.insertBefore(orderUpdates, smsPreference || null);
  }

  const defaultAddressState = document.querySelector(
    "[data-bo-default-address]",
  );

  const compactText = (element) =>
    String(element?.textContent || "").replace(/\s+/g, " ").trim();

  const renderAddressEmpty = (message) => {
    if (!defaultAddressState) return;
    const empty = document.createElement("div");
    empty.className = "bo-profile-address__empty";
    const heading = document.createElement("strong");
    heading.textContent = "No default shipping address";
    const detail = document.createElement("p");
    detail.textContent = message;
    const action = document.createElement("a");
    action.href = "/mypage/delivery_address?tab=1";
    action.textContent = "Add Address";
    empty.append(heading, detail, action);
    defaultAddressState.replaceChildren(empty);
  };

  const hydrateDefaultAddress = async () => {
    if (!defaultAddressState) return;

    try {
      const response = await fetch("/mypage/delivery_address?tab=1", {
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error(`Address request failed: ${response.status}`);

      const documentFragment = new DOMParser().parseFromString(
        await response.text(),
        "text/html",
      );
      const addressRows = Array.from(
        documentFragment.querySelectorAll(".address_table > ul > li"),
      );
      const defaultRow =
        addressRows.find((row) =>
          /primary/i.test(compactText(row.querySelector(".name"))),
        );

      if (!defaultRow) {
        renderAddressEmpty(
          addressRows.length
            ? "Choose a default address in your Firstmall address book."
            : "Add an address in your Firstmall address book.",
        );
        return;
      }

      const card = document.createElement("article");
      card.className = "bo-profile-address__card";
      const copy = document.createElement("span");
      copy.className = "bo-profile-address__copy";
      const name = document.createElement("strong");
      name.textContent =
        compactText(defaultRow.querySelector(".name")?.childNodes[0]) ||
        compactText(defaultRow.querySelector(".name")) ||
        "Saved address";
      const address = document.createElement("span");
      address.textContent =
        compactText(defaultRow.querySelector(".address")) ||
        "Address details are available in Address Book.";
      const phone = document.createElement("small");
      phone.textContent = compactText(defaultRow.querySelector(".tel"));
      const badge = document.createElement("b");
      badge.textContent = "Default";
      const action = document.createElement("a");
      action.href = "/mypage/delivery_address?tab=1";
      action.textContent = "Edit";
      copy.append(name, address);
      if (phone.textContent) copy.append(phone);
      card.append(copy, badge, action);
      defaultAddressState.replaceChildren(card);
    } catch (error) {
      renderAddressEmpty(
        "Open Address Book to view or update your default shipping address.",
      );
    }
  };

  hydrateDefaultAddress();

  const avatarEditButton = document.querySelector("[data-bo-profile-avatar-edit]");
  const avatar = document.querySelector(".bo-profile-avatar");

  const displayAvatar = (source) => {
    if (!avatar || !source) return;

    let image = avatar.querySelector("[data-bo-profile-avatar-image]");
    if (!image) {
      image = document.createElement("img");
      image.alt = "";
      image.dataset.boProfileAvatarImage = "";
      avatar.append(image);
    }

    image.src = source;
  };

  avatarEditButton?.addEventListener("click", () => {
    const avatarFileInput = document.getElementById(
      "trendypickerProfileImageInput",
    );
    if (avatarFileInput) {
      avatarFileInput.click();
      return;
    }
    document.getElementById("membericonUpdate")?.click();
  });

  const profileImageForm = document.getElementById(
    "trendypickerProfileImageForm",
  );
  const profileImageInput = document.getElementById(
    "trendypickerProfileImageInput",
  );
  profileImageInput?.addEventListener("change", () => {
    if (!profileImageInput.files?.length || !profileImageForm) return;
    profileImageForm.submit();
  });

  const nativeMemberIconDisplay = window.membericonDisplay;
  window.membericonDisplay = (source) => {
    if (typeof nativeMemberIconDisplay === "function") {
      nativeMemberIconDisplay(source);
    }
    displayAvatar(source);
    profileImageForm?.reset();
  };

  const socialConnectButtons = document.querySelectorAll("[data-bo-sns-connect]");

  socialConnectButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".bo-profile-sns__item");
      const nativeConnectControl = item?.querySelector(
        ".sns-login-button-mbconnect-direct, .fb-login-button-mbconnect-direct",
      );

      nativeConnectControl?.click();
    });
  });
})();
