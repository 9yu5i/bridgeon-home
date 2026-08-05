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

  const callingCodeAbbreviations = {
    "+1": "US/CA", "+7": "RU/KZ", "+20": "EG", "+27": "ZA", "+30": "GR",
    "+31": "NL", "+32": "BE", "+33": "FR", "+34": "ES", "+36": "HU",
    "+39": "IT/VA", "+40": "RO", "+41": "CH", "+43": "AT", "+44": "GB",
    "+45": "DK", "+46": "SE", "+47": "NO", "+48": "PL", "+49": "DE",
    "+51": "PE", "+52": "MX", "+53": "CU", "+54": "AR", "+55": "BR",
    "+56": "CL", "+57": "CO", "+58": "VE", "+60": "MY", "+61": "AU",
    "+62": "ID", "+63": "PH", "+64": "NZ", "+65": "SG", "+66": "TH",
    "+81": "JP", "+82": "KR", "+84": "VN", "+86": "CN", "+90": "TR",
    "+91": "IN", "+92": "PK", "+93": "AF", "+94": "LK", "+95": "MM",
    "+98": "IR", "+211": "SS", "+212": "MA", "+213": "DZ", "+216": "TN",
    "+218": "LY", "+220": "GM", "+221": "SN", "+222": "MR", "+223": "ML",
    "+224": "GN", "+225": "CI", "+226": "BF", "+227": "NE", "+228": "TG",
    "+229": "BJ", "+230": "MU", "+231": "LR", "+232": "SL", "+233": "GH",
    "+234": "NG", "+235": "TD", "+236": "CF", "+237": "CM", "+238": "CV",
    "+239": "ST", "+240": "GQ", "+241": "GA", "+242": "CG", "+243": "CD",
    "+244": "AO", "+245": "GW", "+246": "IO", "+248": "SC", "+249": "SD",
    "+250": "RW", "+251": "ET", "+252": "SO", "+253": "DJ", "+254": "KE",
    "+255": "TZ", "+256": "UG", "+257": "BI", "+258": "MZ", "+260": "ZM",
    "+261": "MG", "+262": "RE/YT", "+263": "ZW", "+264": "NA", "+265": "MW",
    "+266": "LS", "+267": "BW", "+268": "SZ", "+269": "KM", "+290": "SH",
    "+291": "ER", "+297": "AW", "+298": "FO", "+299": "GL", "+350": "GI",
    "+351": "PT", "+352": "LU", "+353": "IE", "+354": "IS", "+355": "AL",
    "+356": "MT", "+357": "CY", "+358": "FI", "+359": "BG", "+370": "LT",
    "+371": "LV", "+372": "EE", "+373": "MD", "+374": "AM", "+375": "BY",
    "+376": "AD", "+377": "MC", "+378": "SM", "+380": "UA", "+381": "RS",
    "+382": "ME", "+383": "XK", "+385": "HR", "+386": "SI", "+387": "BA",
    "+389": "MK", "+420": "CZ", "+421": "SK", "+423": "LI", "+500": "FK",
    "+501": "BZ", "+502": "GT", "+503": "SV", "+504": "HN", "+505": "NI",
    "+506": "CR", "+507": "PA", "+508": "PM", "+509": "HT", "+590": "GP",
    "+591": "BO", "+592": "GY", "+593": "EC", "+594": "GF", "+595": "PY",
    "+596": "MQ", "+597": "SR", "+598": "UY", "+599": "BQ/CW", "+670": "TL",
    "+672": "AQ/NF", "+673": "BN", "+674": "NR", "+675": "PG", "+676": "TO",
    "+677": "SB", "+678": "VU", "+679": "FJ", "+680": "PW", "+681": "WF",
    "+682": "CK", "+683": "NU", "+685": "WS", "+686": "KI", "+687": "NC",
    "+688": "TV", "+689": "PF", "+690": "TK", "+691": "FM", "+692": "MH",
    "+850": "KP", "+852": "HK", "+853": "MO", "+855": "KH", "+856": "LA",
    "+880": "BD", "+886": "TW", "+960": "MV", "+961": "LB", "+962": "JO",
    "+963": "SY", "+964": "IQ", "+965": "KW", "+966": "SA", "+967": "YE",
    "+968": "OM", "+970": "PS", "+971": "AE", "+972": "IL", "+973": "BH",
    "+974": "QA", "+975": "BT", "+976": "MN", "+977": "NP", "+992": "TJ",
    "+993": "TM", "+994": "AZ", "+995": "GE", "+996": "KG", "+998": "UZ",
  };
  const callingCodeOptions = Object.entries(callingCodeAbbreviations).map(
    ([value, abbreviation]) => ({
      value,
      label: `${value} ${abbreviation}`,
    }),
  );
  const addressRegionOptions = {
    australia: [
      "Australian Capital Territory", "New South Wales", "Northern Territory",
      "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia",
    ],
    canada: [
      "Alberta", "British Columbia", "Manitoba", "New Brunswick",
      "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut",
      "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon",
    ],
    "south korea": [
      "Busan", "Chungcheongbuk-do", "Chungcheongnam-do", "Daegu", "Daejeon",
      "Gangwon-do", "Gwangju", "Gyeonggi-do", "Gyeongsangbuk-do", "Gyeongsangnam-do",
      "Incheon", "Jeju-do", "Jeollabuk-do", "Jeollanam-do", "Sejong", "Seoul", "Ulsan",
    ],
    "united kingdom": ["England", "Northern Ireland", "Scotland", "Wales"],
    "united states": [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
      "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
      "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
      "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana",
      "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
      "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
      "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah",
      "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
    ],
  };

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
      options: callingCodeOptions,
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
      const fullName = [firstNameInput?.value, lastNameInput?.value]
        .map((value) => String(value || "").trim())
        .filter(Boolean)
        .join(" ");
      if (!fullName) return;
      if (profileName) profileName.textContent = fullName;
    };
    firstNameInput?.addEventListener("input", syncProfileName);
    lastNameInput?.addEventListener("input", syncProfileName);
    syncProfileName();

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
      const passwordChangeRequested = Boolean(
        oldPasswordInput?.value ||
          newPasswordInput?.value ||
          confirmPasswordInput?.value ||
          event.submitter?.matches("[data-bo-change-password]"),
      );

      if (!passwordChangeRequested) {
        const nativePasswordInputs = [oldPasswordInput, newPasswordInput].filter(Boolean);
        nativePasswordInputs.forEach((input) => {
          input.disabled = true;
        });
        window.setTimeout(() => {
          nativePasswordInputs.forEach((input) => {
            input.disabled = false;
          });
        });
        return;
      }

      if (!oldPasswordInput?.value) {
        event.preventDefault();
        window.alert("Enter your current password.");
        oldPasswordInput?.focus();
        return;
      }

      if (!newPasswordInput?.value) {
        event.preventDefault();
        window.alert("Enter a new password.");
        newPasswordInput?.focus();
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
    action.addEventListener("click", (event) => {
      event.preventDefault();
      openAddressModal();
    });
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
      if (!addressRows.length) {
        renderAddressEmpty(
          "Add an address in your Firstmall address book.",
        );
        return;
      }

      const primaryRow = addressRows.find((row) =>
        /primary/i.test(compactText(row.querySelector(".name"))),
      );
      if (!primaryRow) {
        renderAddressEmpty(
          "Set a Primary address in Address Book to use it as your default shipping address.",
        );
        return;
      }

      const addressSeq =
        primaryRow.querySelector(".updateaddress")?.getAttribute("seq") || "";
      const card = document.createElement("article");
      card.className = "bo-profile-address__card is-default";

      const copy = document.createElement("span");
      copy.className = "bo-profile-address__copy";
      const name = document.createElement("strong");
      name.textContent =
        compactText(primaryRow.querySelector(".name")?.childNodes[0]) ||
        compactText(primaryRow.querySelector(".name")) ||
        "Saved address";
      const address = document.createElement("span");
      address.textContent =
        compactText(primaryRow.querySelector(".address")) ||
        "Address details are available in Address Book.";
      const phone = document.createElement("small");
      phone.textContent = compactText(primaryRow.querySelector(".tel"));
      copy.append(name, address);
      if (phone.textContent) copy.append(phone);

      const actions = document.createElement("span");
      actions.className = "bo-profile-address__actions";
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => openAddressModal(addressSeq));
      actions.append(editButton);

      card.append(copy, actions);
      defaultAddressState.replaceChildren(card);
    } catch (error) {
      renderAddressEmpty(
        "Open Address Book to view or update your default shipping address.",
      );
    }
  };

  hydrateDefaultAddress();

  const addressModalLayer = document.querySelector("[data-bo-address-modal-layer]");
  const addressModalFrame = document.querySelector("[data-bo-address-modal-frame]");
  let pendingAddressSeq = "";
  let pendingAddressOperation = "edit";
  let addressSavePending = false;
  let addressFrameNeedsReload = false;
  let addressSaveFallbackTimer = 0;
  let restoreAddressSaveAlerts = null;

  const prepareAddressSaveAlert = (frameWindow, intent) => {
    restoreAddressSaveAlerts?.();
    const restores = [];
    const targets = [...new Set([window, frameWindow].filter(Boolean))];
    const replacementMessage =
      intent === "default"
        ? "Default shipping address has been updated."
        : "Shipping address has been saved.";

    targets.forEach((target) => {
      try {
        const originalAlert = target.alert;
        if (typeof originalAlert !== "function") return;
        const wrappedAlert = (message, ...args) => {
          const nativeMessage = String(message || "");
          const nextMessage = /frequently used shipping address has been (?:modified|registered|saved)/i.test(
            nativeMessage,
          )
            ? replacementMessage
            : message;
          return originalAlert.call(target, nextMessage, ...args);
        };
        target.alert = wrappedAlert;
        restores.push(() => {
          if (target.alert === wrappedAlert) target.alert = originalAlert;
        });
      } catch (_error) {
        // The native Firstmall frame can block access while it is navigating.
      }
    });

    restoreAddressSaveAlerts = () => {
      restores.forEach((restore) => restore());
      restoreAddressSaveAlerts = null;
    };
  };

  const hideAddressModal = () => {
    if (!addressModalLayer) return;
    addressModalLayer.hidden = true;
    addressModalLayer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-profile-address-open");
  };

  const completeAddressSave = () => {
    if (!addressSavePending) return;
    addressSavePending = false;
    window.clearTimeout(addressSaveFallbackTimer);
    addressSaveFallbackTimer = 0;
    addressFrameNeedsReload = true;
    pendingAddressOperation = "edit";
    restoreAddressSaveAlerts?.();
    hideAddressModal();
    hydrateDefaultAddress();
    window.setTimeout(hydrateDefaultAddress, 500);
  };

  const nativeAddressModalStyles = `
    html, body { margin: 0 !important; overflow: hidden !important; background: #fff !important; font-family: Pretendard, Arial, sans-serif !important; }
    body > *:not(#inAddress):not(iframe[name="actionFrame"]) { display: none !important; }
    iframe[name="actionFrame"] { position: absolute !important; width: 1px !important; height: 1px !important; overflow: hidden !important; border: 0 !important; opacity: 0 !important; pointer-events: none !important; }
    #inAddress { position: static !important; display: block !important; width: auto !important; height: auto !important; margin: 0 !important; padding: 0 !important; border: 0 !important; background: #fff !important; box-shadow: none !important; transform: none !important; }
    #inAddress > .title, #inAddress > .btn_pop_close, #inAddress .stitle, #inAddress .shipping-info-desc { display: none !important; }
    #inAddress .y_scroll_auto { height: auto !important; max-height: none !important; overflow: visible !important; }
    #inAddress .layer_pop_contents { padding: 0 !important; }
    #inAddress .resp_table_row { display: block !important; }
    #inAddress .resp_table_row > * { display: none !important; }
    #inAddress .resp_table_row > .trendypicker-address-fields { display: grid !important; gap: 12px !important; }
    #inAddress .trendypicker-address-hidden, #inAddress .domestic { display: none !important; }
    #inAddress .trendypicker-address-row { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 16px !important; }
    #inAddress .trendypicker-address-row--single { grid-template-columns: minmax(0, 1fr) !important; }
    #inAddress .trendypicker-address-contact-title { margin: 2px 0 -2px !important; color: #211b2c !important; font-size: 18px !important; line-height: 1.2 !important; font-weight: 800 !important; }
    #inAddress .resp_table_row .tr { display: grid !important; width: 100% !important; min-width: 0 !important; gap: 7px !important; margin: 0 !important; padding: 0 !important; border: 0 !important; }
    #inAddress .resp_table_row .th, #inAddress .resp_table_row .td { display: block !important; width: auto !important; margin: 0 !important; padding: 0 !important; border: 0 !important; color: #211b2c !important; background: transparent !important; font-size: 13px !important; line-height: 1.2 !important; font-weight: 800 !important; }
    #inAddress .state-select-wrapper, #inAddress .country-select-wrapper { width: 100% !important; min-width: 0 !important; }
    #inAddress .country-select-wrapper { position: relative !important; }
    #inAddress .country-select-wrapper::after { content: "" !important; position: absolute !important; top: 50% !important; right: 15px !important; z-index: 2 !important; width: 12px !important; height: 8px !important; border: 0 !important; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' stroke='%23111' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat !important; transform: translateY(-50%) !important; transition: transform .2s ease !important; pointer-events: none !important; }
    #inAddress .country-select-wrapper.is-open::after { transform: translateY(-50%) rotate(180deg) !important; }
    #inAddress input:not([type="checkbox"]), #inAddress select { box-sizing: border-box !important; width: 100% !important; height: 46px !important; margin: 0 !important; padding: 0 14px !important; border: 1px solid #d9c9ff !important; border-radius: 12px !important; color: #211b2c !important; background: #fbf8ff !important; font: 14px Pretendard, Arial, sans-serif !important; }
    #inAddress input:not([type="checkbox"])::placeholder { color: #9a91aa !important; opacity: 1 !important; }
    #inAddress #countrySearchInput { padding-right: 38px !important; cursor: pointer !important; }
    #inAddress #countryOptionsList { position: absolute !important; top: calc(100% - 1px) !important; right: 0 !important; left: 0 !important; z-index: 31 !important; box-sizing: border-box !important; display: block !important; width: 100% !important; max-height: 260px !important; margin: 0 !important; padding: 7px 6px 6px !important; overflow: auto !important; border: 1px solid #d9c9ff !important; border-top: 0 !important; border-radius: 0 0 10px 10px !important; background: #fff !important; box-shadow: 0 10px 28px rgba(18, 12, 26, .14) !important; list-style: none !important; scrollbar-width: thin !important; }
    #inAddress #countryOptionsList.country-options-hidden { display: none !important; }
    #inAddress #countryOptionsList li { display: flex !important; align-items: center !important; gap: 8px !important; min-height: 38px !important; margin: 0 !important; padding: 8px 10px !important; overflow: hidden !important; border-radius: 8px !important; color: #111 !important; background: transparent !important; font: 14px/1.35 Pretendard, Arial, sans-serif !important; text-overflow: ellipsis !important; white-space: nowrap !important; cursor: pointer !important; }
    #inAddress #countryOptionsList li:hover { color: #7b3fe4 !important; background: #f2ebff !important; }
    #inAddress #countryOptionsList li img { flex: 0 0 auto !important; width: 20px !important; height: 14px !important; object-fit: cover !important; }
    #inAddress .trendypicker-native-select { position: relative !important; display: block !important; width: 100% !important; min-width: 0 !important; }
    #inAddress .trendypicker-native-select.is-unavailable { display: none !important; }
    #inAddress .trendypicker-native-select.is-open { z-index: 40 !important; }
    #inAddress .trendypicker-native-select::after { content: "" !important; position: absolute !important; top: 23px !important; right: 14px !important; z-index: 2 !important; width: 12px !important; height: 8px !important; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' stroke='%23111' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat !important; transform: translateY(-50%) !important; transition: transform .2s ease !important; pointer-events: none !important; }
    #inAddress .trendypicker-native-select.is-open::after { transform: translateY(-50%) rotate(180deg) !important; }
    #inAddress .trendypicker-native-select-trigger { box-sizing: border-box !important; display: flex !important; align-items: center !important; justify-content: flex-start !important; width: 100% !important; height: 46px !important; margin: 0 !important; padding: 0 36px 0 14px !important; overflow: hidden !important; border: 1px solid #d9c9ff !important; border-radius: 12px !important; color: #211b2c !important; background: #fbf8ff !important; font: 14px Pretendard, Arial, sans-serif !important; text-align: left !important; cursor: pointer !important; }
    #inAddress .trendypicker-native-select-value { display: block !important; min-width: 0 !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }
    #inAddress .trendypicker-native-select.is-open .trendypicker-native-select-trigger, #inAddress .trendypicker-native-select-trigger:focus-visible { border-color: #7b3fe4 !important; outline: 0 !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(123, 63, 228, .14) !important; }
    #inAddress .trendypicker-native-select-menu { position: absolute !important; top: calc(100% - 1px) !important; right: 0 !important; left: 0 !important; z-index: 41 !important; display: none !important; width: auto !important; max-height: 220px !important; margin: 0 !important; padding: 7px 6px !important; overflow-y: auto !important; border: 1px solid #d9c9ff !important; border-top: 0 !important; border-radius: 0 0 10px 10px !important; background: #fff !important; box-shadow: 0 10px 28px rgba(18, 12, 26, .14) !important; list-style: none !important; scrollbar-width: thin !important; }
    #inAddress .trendypicker-native-select.is-open .trendypicker-native-select-menu { display: block !important; }
    #inAddress .trendypicker-native-select-menu li { display: flex !important; align-items: center !important; min-height: 38px !important; margin: 0 !important; padding: 8px 10px !important; overflow: hidden !important; border-radius: 8px !important; color: #211b2c !important; background: transparent !important; font: 14px/1.35 Pretendard, Arial, sans-serif !important; text-overflow: ellipsis !important; white-space: nowrap !important; cursor: pointer !important; }
    #inAddress .trendypicker-native-select-menu li:hover, #inAddress .trendypicker-native-select-menu li.is-selected { color: #7b3fe4 !important; background: #f2ebff !important; }
    #inAddress .trendypicker-native-select-source { position: absolute !important; width: 1px !important; height: 1px !important; margin: -1px !important; padding: 0 !important; overflow: hidden !important; border: 0 !important; opacity: 0 !important; clip: rect(0 0 0 0) !important; pointer-events: none !important; }
    #inAddress .trendypicker-state-source { display: none !important; }
    #inAddress .trendypicker-phone-code .trendypicker-native-select-menu { top: auto !important; right: auto !important; bottom: calc(100% - 1px) !important; left: 0 !important; width: 116px !important; border-top: 1px solid #d9c9ff !important; border-bottom: 0 !important; border-radius: 10px 10px 0 0 !important; }
    #inAddress input:not([type="checkbox"]):focus, #inAddress select:focus { border-color: #7b3fe4 !important; outline: 0 !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(123, 63, 228, .14) !important; }
    #inAddress input.is-address-invalid, #inAddress select.is-address-invalid { border-color: #d63d75 !important; background: #fffafb !important; box-shadow: 0 0 0 3px rgba(214, 61, 117, .12) !important; }
    #inAddress .trendypicker-address-phone { grid-template-columns: minmax(0, 1fr) !important; gap: 7px !important; }
    #inAddress .trendypicker-address-phone .td { display: block !important; min-width: 0 !important; }
    #inAddress .trendypicker-address-phone .td > :not(.trendypicker-phone-controls) { display: none !important; }
    #inAddress .trendypicker-phone-controls { display: flex !important; align-items: center !important; gap: 8px !important; min-width: 0 !important; }
    #inAddress .trendypicker-address-phone input[name="international_recipient_phone"] { flex: 1 1 auto !important; width: auto !important; min-width: 0 !important; }
    #inAddress .trendypicker-phone-code { flex: 0 0 116px !important; width: 116px !important; min-width: 116px !important; }
    #inAddress .contacts_line .td { width: auto !important; }
    #inAddress .btn_area_b { display: flex !important; justify-content: flex-end !important; gap: 8px !important; margin: 0 !important; padding: 0 !important; }
    #inAddress #insert_address, #inAddress .profile-address-native-cancel { min-width: 118px !important; height: 46px !important; margin: 0 !important; padding: 0 18px !important; border: 1px solid #7b3fe4 !important; border-radius: 9px !important; font: 700 14px Pretendard, Arial, sans-serif !important; cursor: pointer !important; transition: color .2s ease, background .2s ease, border-color .2s ease, transform .2s ease, box-shadow .2s ease !important; }
    #inAddress #insert_address { color: #fff !important; background: #7b3fe4 !important; }
    #inAddress .profile-address-native-cancel { color: #7b3fe4 !important; background: #fff !important; }
    #inAddress .trendypicker-address-default { box-sizing: border-box !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; min-width: 126px !important; max-width: 100% !important; height: 46px !important; margin: 0 !important; padding: 0 16px !important; border: 1px solid #7b3fe4 !important; border-radius: 9px !important; color: #7b3fe4 !important; background: #fff !important; font: 700 13px Pretendard, Arial, sans-serif !important; cursor: pointer !important; transition: color .2s ease, background .2s ease, border-color .2s ease, transform .2s ease, box-shadow .2s ease !important; }
    #inAddress .trendypicker-address-default.is-selected { color: #fff !important; background: #7b3fe4 !important; }
    #inAddress .trendypicker-address-default input { position: absolute !important; width: 1px !important; height: 1px !important; overflow: hidden !important; opacity: 0 !important; pointer-events: none !important; }
    #inAddress .trendypicker-address-footer { box-sizing: border-box !important; display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: flex-end !important; gap: 9px !important; width: 100% !important; min-width: 0 !important; margin-top: 10px !important; }
    #inAddress .trendypicker-address-footer .btn_area_b { order: 2 !important; margin: 0 !important; }
    #inAddress .trendypicker-address-footer .trendypicker-address-default { order: 1 !important; flex: 0 0 auto !important; align-self: center !important; margin: 0 auto 0 0 !important; }
    #inAddress .trendypicker-address-footer .trendypicker-address-default:hover, #inAddress .trendypicker-address-footer .trendypicker-address-default:focus-within, #inAddress .trendypicker-address-footer button:hover, #inAddress .trendypicker-address-footer button:focus-visible { border-color: #31136c !important; color: #fff !important; background: #31136c !important; outline: 0 !important; box-shadow: 0 8px 18px rgba(49, 19, 108, .18) !important; transform: translateY(-1px) !important; }
    @media (max-width: 600px) { html, body { overflow-y: auto !important; } #inAddress .trendypicker-address-row { grid-template-columns: minmax(0, 1fr) !important; gap: 10px !important; } #inAddress .trendypicker-address-row--names { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 8px !important; } #inAddress .trendypicker-address-fields { gap: 10px !important; } #inAddress .resp_table_row .th, #inAddress .resp_table_row .td, #inAddress .trendypicker-address-default, #inAddress #insert_address, #inAddress .profile-address-native-cancel { font-size: 14px !important; } #inAddress input:not([type="checkbox"]), #inAddress select, #inAddress .trendypicker-native-select-trigger { height: 46px !important; padding-inline: 12px !important; font-size: 14px !important; } #inAddress .trendypicker-native-select-trigger { padding-right: 34px !important; } #inAddress .trendypicker-phone-controls { gap: 6px !important; } #inAddress .trendypicker-phone-code { flex-basis: 108px !important; width: 108px !important; min-width: 108px !important; } #inAddress .trendypicker-phone-code .trendypicker-native-select-menu { width: 108px !important; } #inAddress .trendypicker-address-footer { flex-direction: column !important; align-items: stretch !important; gap: 8px !important; width: 100% !important; max-width: 100% !important; } #inAddress .trendypicker-address-footer .btn_area_b { order: 1 !important; display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; width: 100% !important; max-width: 100% !important; } #inAddress .trendypicker-address-footer .trendypicker-address-default { order: 2 !important; flex: 0 0 auto !important; align-self: stretch !important; width: 100% !important; min-width: 0 !important; max-width: 100% !important; margin: 0 !important; } #inAddress .trendypicker-address-default { min-width: 0 !important; height: 44px !important; padding: 0 8px !important; } #inAddress #insert_address, #inAddress .profile-address-native-cancel { width: 100% !important; min-width: 0 !important; height: 44px !important; padding: 0 8px !important; } }
  `;

  const getNativeAddressEmailFields = (nativeModal) =>
    Array.from(
      nativeModal.querySelectorAll(
        'input[name="recipient_input_email"], input[name="international_recipient_email"], input[name="recipient_email"], input[name="recipient_email_address"], input[type="email"]',
      ),
    ).filter(
      (field, index, fields) =>
        field.type !== "hidden" &&
        !field.closest(".domestic") &&
        fields.indexOf(field) === index,
    );

  const getNativeAddressEmailField = (nativeModal) => {
    const fields = getNativeAddressEmailFields(nativeModal);
    return fields.find((field) => String(field.value || "").trim()) || fields[0] || null;
  };

  const enhanceNativeAddressSelect = ({
    frameDocument,
    nativeModal,
    select,
    className = "",
    mirrorInput = null,
  }) => {
    if (!select) return null;
    const existing = select.closest(".trendypicker-native-select");
    if (existing) return existing;

    const wrapper = frameDocument.createElement("div");
    wrapper.className = `trendypicker-native-select ${className}`.trim();
    const trigger = frameDocument.createElement("button");
    trigger.type = "button";
    trigger.className = "trendypicker-native-select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    const selectedValue = frameDocument.createElement("span");
    selectedValue.className = "trendypicker-native-select-value";
    trigger.appendChild(selectedValue);
    const menu = frameDocument.createElement("ul");
    menu.className = "trendypicker-native-select-menu";
    menu.setAttribute("role", "listbox");

    const close = () => {
      wrapper.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    };
    const sync = () => {
      const option = select.options[select.selectedIndex];
      selectedValue.textContent = String(option?.textContent || option?.value || "Select").trim();
      menu.querySelectorAll("li").forEach((item) => {
        const isSelected = item.dataset.value === select.value;
        item.classList.toggle("is-selected", isSelected);
        item.setAttribute("aria-selected", String(isSelected));
      });
      if (mirrorInput && select.value) {
        mirrorInput.value = select.value;
        mirrorInput.dispatchEvent(new Event("input", { bubbles: true }));
        mirrorInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };
    const buildMenu = () => {
      menu.replaceChildren();
      Array.from(select.options).forEach((option) => {
        if (option.hidden) return;
        const item = frameDocument.createElement("li");
        item.setAttribute("role", "option");
        item.dataset.value = option.value;
        item.textContent = String(option.textContent || option.value || "Select").trim();
        item.addEventListener("click", () => {
          select.value = option.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          sync();
          close();
          trigger.focus();
        });
        menu.appendChild(item);
      });
      sync();
    };

    select.parentNode?.insertBefore(wrapper, select);
    select.classList.add("trendypicker-native-select-source");
    wrapper.append(trigger, menu, select);
    trigger.addEventListener("click", () => {
      const willOpen = !wrapper.classList.contains("is-open");
      nativeModal
        .querySelectorAll(".trendypicker-native-select.is-open")
        .forEach((openSelect) => openSelect !== wrapper && openSelect.classList.remove("is-open"));
      wrapper.classList.toggle("is-open", willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));
    });
    select.addEventListener("change", sync);
    frameDocument.addEventListener("pointerdown", (event) => {
      if (!wrapper.contains(event.target)) close();
    });
    frameDocument.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !wrapper.classList.contains("is-open")) return;
      close();
      trigger.focus();
    });

    const FrameMutationObserver = frameDocument.defaultView?.MutationObserver || MutationObserver;
    new FrameMutationObserver(buildMenu).observe(select, { childList: true, subtree: true });
    buildMenu();
    return wrapper;
  };

  const simplifyNativeAddressForm = (frameDocument, nativeModal) => {
    const source = nativeModal.querySelector(".resp_table_row");
    if (!source) return;
    const hasKorean = (value) => /[\u3131-\u318e\uac00-\ud7a3]/.test(String(value || ""));
    const forbiddenKoreanLabels = /^(그룹|주소|휴대폰|연락처\s*2)$/;

    const removeNativeKoreanFields = () => {
      nativeModal.querySelectorAll(".domestic").forEach((element) => element.remove());
      nativeModal.querySelectorAll(".tr").forEach((row) => {
        const label = String(row.querySelector(".th")?.textContent || "")
          .replace(/\s+/g, " ")
          .trim();
        if (
          forbiddenKoreanLabels.test(label) &&
          !row.querySelector('input[name="address_description"]')
        ) {
          row.remove();
        }
      });
      nativeModal
        .querySelector('select[name="select_address_group"]')
        ?.closest(".tr")
        ?.remove();
    };

    removeNativeKoreanFields();

    frameDocument
      .querySelectorAll("option, #countryOptionsList li")
      .forEach((option) => {
        const value = String(
          option.value || option.dataset?.nation || option.textContent || "",
        ).trim();
        const ownerSelect = option.closest("select");
        const isCallingCodeOption = Boolean(
          ownerSelect?.closest(".tr")?.querySelector(
            'input[name="international_recipient_phone"]',
          ),
        );
        if (/^global$/i.test(value)) {
          option.remove();
        } else if (isCallingCodeOption && hasKorean(value)) {
          const callingCode = value.match(/\+\d+/)?.[0] || String(option.value || "").trim();
          if (callingCode) option.textContent = callingCode;
        } else if (hasKorean(value)) {
          option.remove();
        }
      });

    frameDocument.querySelectorAll("input, select").forEach((field) => {
      if (/^global$/i.test(String(field.value || "").trim())) field.value = "";
      if (hasKorean(field.placeholder)) field.placeholder = "";
    });

    const countryWrapper = nativeModal.querySelector(".country-select-wrapper");
    const countryInput = nativeModal.querySelector("#countrySearchInput");
    const countryOptions = nativeModal.querySelector("#countryOptionsList");
    if (
      countryWrapper &&
      countryInput &&
      countryOptions &&
      !countryInput.dataset.trendypickerToggleBound
    ) {
      let wasOpenOnPointerDown = false;
      const isCountryMenuOpen = () =>
        !countryOptions.classList.contains("country-options-hidden") &&
        frameDocument.defaultView?.getComputedStyle(countryOptions).display !== "none";
      const setCountryMenuOpen = (isOpen) => {
        countryOptions.classList.toggle("country-options-hidden", !isOpen);
        countryWrapper.classList.toggle("is-open", isOpen);
        countryInput.setAttribute("aria-expanded", String(isOpen));
      };

      countryInput.setAttribute("aria-haspopup", "listbox");
      countryInput.setAttribute("aria-expanded", String(isCountryMenuOpen()));
      countryInput.addEventListener(
        "pointerdown",
        () => {
          wasOpenOnPointerDown = isCountryMenuOpen();
        },
        true,
      );
      countryInput.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          setCountryMenuOpen(!wasOpenOnPointerDown);
        },
        true,
      );
      countryOptions.addEventListener("click", () => {
        window.setTimeout(() => setCountryMenuOpen(false));
      });
      frameDocument.addEventListener("pointerdown", (event) => {
        if (!countryWrapper.contains(event.target)) setCountryMenuOpen(false);
      });
      frameDocument.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || !isCountryMenuOpen()) return;
        setCountryMenuOpen(false);
        countryInput.focus();
      });
      countryInput.dataset.trendypickerToggleBound = "true";
    }

    const setLabel = (fieldName, label) => {
      const field = nativeModal.querySelector(`[name="${fieldName}"]`);
      const row = field?.closest(".tr");
      const heading = row?.querySelector(".th");
      if (heading) heading.textContent = label;
      return row || null;
    };

    setLabel("address_description", "Address Name");
    setLabel("recipient_user_first_name", "Recipient First Name");
    setLabel("recipient_user_last_name", "Recipient Last Name");
    setLabel("international_country_input", "Country / Region");
    setLabel("international_address1", "Address");
    setLabel("international_address2", "Apt / Suite / Other (optional)");
    setLabel("international_town_city", "City");
    setLabel("international_county_input", "State / Province");
    setLabel("international_postcode", "ZIP / Postal Code");

    nativeModal.querySelectorAll("input").forEach((input) => {
      const excludedTypes = new Set([
        "hidden",
        "checkbox",
        "radio",
        "file",
        "button",
        "submit",
        "reset",
      ]);
      if (
        excludedTypes.has(String(input.type || "text").toLowerCase()) ||
        input.disabled ||
        input.readOnly ||
        input === countryInput ||
        input.dataset.trendypickerRestoreBound
      ) {
        return;
      }

      let valueBeforeFocus = "";
      let isInternalUpdate = false;
      input.addEventListener("focus", () => {
        valueBeforeFocus = input.value;
        if (!valueBeforeFocus) return;
        isInternalUpdate = true;
        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        isInternalUpdate = false;
      });
      input.addEventListener("input", () => {
        if (isInternalUpdate) return;
        input.classList.remove("is-address-invalid");
        input.removeAttribute("aria-invalid");
      });
      input.addEventListener("blur", () => {
        if (String(input.value || "").trim() || !valueBeforeFocus) return;
        isInternalUpdate = true;
        input.value = valueBeforeFocus;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        isInternalUpdate = false;
      });
      input.dataset.trendypickerRestoreBound = "true";
    });

    const emailFields = getNativeAddressEmailFields(nativeModal);
    const emailField = getNativeAddressEmailField(nativeModal);
    const emailRow = emailField?.closest(".tr") || null;
    const emailHeading = emailRow?.querySelector(".th");
    if (emailHeading) emailHeading.textContent = "Email";

    if (emailField && !emailField.dataset.trendypickerEmailSyncBound) {
      const syncEmailAliases = () => {
        emailFields.forEach((field) => {
          if (field !== emailField) field.value = emailField.value;
        });
      };
      emailField.addEventListener("input", syncEmailAliases);
      emailField.addEventListener("change", syncEmailAliases);
      emailField.dataset.trendypickerEmailSyncBound = "true";
    }

    nativeModal.querySelectorAll(".tr").forEach((row) => {
      const heading = row.querySelector(".th");
      if (!hasKorean(heading?.textContent)) return;
      row.remove();
    });

    const koreanFieldObserver = new MutationObserver(removeNativeKoreanFields);
    koreanFieldObserver.observe(nativeModal, { childList: true, subtree: true });

    const addressLine3 = nativeModal.querySelector(
      'input[name="international_address3"]',
    );
    if (addressLine3) addressLine3.value = "";

    if (source.querySelector(".trendypicker-address-fields")) return;

    const rowFor = (fieldName) =>
      nativeModal.querySelector(`[name="${fieldName}"]`)?.closest(".tr") || null;
    const makeRow = (fieldNames, single = false) => {
      const row = frameDocument.createElement("div");
      row.className = `trendypicker-address-row${single ? " trendypicker-address-row--single" : ""}`;
      fieldNames.map(rowFor).filter(Boolean).forEach((fieldRow) => row.appendChild(fieldRow));
      return row;
    };

    const fields = frameDocument.createElement("div");
    fields.className = "trendypicker-address-fields";
    const recipientNameRow = makeRow([
      "recipient_user_first_name",
      "recipient_user_last_name",
    ]);
    recipientNameRow.classList.add("trendypicker-address-row--names");

    fields.append(
      makeRow(["address_description"], true),
      recipientNameRow,
      makeRow(["international_country_input", "international_address1"]),
      makeRow(["international_address2", "international_town_city"]),
      makeRow(["international_county_input", "international_postcode"]),
    );

    const stateInput = nativeModal.querySelector(
      'input[name="international_county_input"]',
    );
    const stateFieldRow = stateInput?.closest(".tr");
    const stateCell = stateInput?.closest(".td");
    let stateSelect =
      stateFieldRow?.querySelector("select") ||
      nativeModal.querySelector(".state-select-wrapper select") ||
      null;
    const stateSelectIsGenerated = !stateSelect;
    if (stateInput && stateCell && !stateSelect) {
      stateSelect = frameDocument.createElement("select");
      stateSelect.setAttribute("aria-label", "State or province");
      stateSelect.dataset.trendypickerGenerated = "true";
      stateCell.appendChild(stateSelect);
    }

    if (stateSelect && stateInput) {
      const resolveRegionKey = () => {
        const countryValue = String(countryInput?.value || "")
          .replace(/[\[\].]/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();
        if (/^(u s a|usa|us)$/.test(countryValue) || countryValue.includes("united states")) {
          return "united states";
        }
        if (/^(uk|u k)$/.test(countryValue) || countryValue.includes("united kingdom")) {
          return "united kingdom";
        }
        if (countryValue.includes("south korea") || countryValue === "korea") return "south korea";
        if (countryValue.includes("australia")) return "australia";
        if (countryValue.includes("canada")) return "canada";
        return countryValue;
      };
      const stateControl = enhanceNativeAddressSelect({
        frameDocument,
        nativeModal,
        select: stateSelect,
        className: "trendypicker-state-select",
        mirrorInput: stateInput,
      });
      if (stateControl && stateControl.parentNode !== stateCell) {
        stateCell?.appendChild(stateControl);
      }
      stateInput.classList.add("trendypicker-state-source");
      const refreshStateOptions = () => {
        if (!stateSelectIsGenerated) {
          const hasNativeRegions = Array.from(stateSelect.options).some(
            (option) => String(option.value || "").trim(),
          );
          const currentState = String(stateInput.value || "").trim();
          if (!hasNativeRegions && currentState) {
            const currentOption = frameDocument.createElement("option");
            currentOption.value = currentState;
            currentOption.textContent = currentState;
            stateSelect.appendChild(currentOption);
            stateSelect.value = currentState;
          }
          stateControl?.classList.remove("is-unavailable");
          stateInput.classList.add("trendypicker-state-source");
          return;
        }
        const currentState = String(stateInput.value || "").trim();
        const configuredRegions = addressRegionOptions[resolveRegionKey()] || [];
        const regions = configuredRegions.length
          ? configuredRegions
          : currentState
            ? [currentState]
            : [];
        stateSelect.replaceChildren();
        const placeholderOption = frameDocument.createElement("option");
        placeholderOption.value = "";
        placeholderOption.textContent = "Select state / province";
        stateSelect.appendChild(placeholderOption);
        regions.forEach((region) => {
          const option = frameDocument.createElement("option");
          option.value = region;
          option.textContent = region;
          stateSelect.appendChild(option);
        });
        const matchingRegion = regions.find(
          (region) => region.toLowerCase() === currentState.toLowerCase(),
        );
        stateSelect.value = matchingRegion || "";
        stateControl?.classList.remove("is-unavailable");
        stateInput.classList.add("trendypicker-state-source");
      };
      refreshStateOptions();
      if (!stateSelectIsGenerated) {
        const FrameMutationObserver = frameDocument.defaultView?.MutationObserver || MutationObserver;
        new FrameMutationObserver(refreshStateOptions).observe(stateSelect, {
          childList: true,
          subtree: true,
        });
      }
      countryInput?.addEventListener("change", refreshStateOptions);
      countryInput?.addEventListener("input", refreshStateOptions);
      countryOptions?.addEventListener("click", () => {
        window.setTimeout(refreshStateOptions);
      });
    }

    const contactTitle = frameDocument.createElement("h3");
    contactTitle.className = "trendypicker-address-contact-title";
    contactTitle.textContent = "Contact Information";
    fields.appendChild(contactTitle);

    const contactRow = makeRow(["international_recipient_phone"]);
    if (emailRow) contactRow.appendChild(emailRow);
    const phoneFieldRow = contactRow
      .querySelector('input[name="international_recipient_phone"]')
      ?.closest(".tr");
    phoneFieldRow?.classList.add("trendypicker-address-phone");

    const phoneCodeSelect = phoneFieldRow?.querySelector("select");
    if (phoneCodeSelect) {
      const savedCallingCode = phoneCodeSelect.value;
      callingCodeOptions.forEach((option) => {
        const existingOption = Array.from(phoneCodeSelect.options).find(
          (nativeOption) => nativeOption.value === option.value,
        );
        if (existingOption) {
          existingOption.textContent = option.label;
        } else {
          const nativeOption = frameDocument.createElement("option");
          nativeOption.value = option.value;
          nativeOption.textContent = option.label;
          phoneCodeSelect.appendChild(nativeOption);
        }
      });
      const availableValues = new Set(
        Array.from(phoneCodeSelect.options).map((option) => option.value),
      );
      if (savedCallingCode && availableValues.has(savedCallingCode)) {
        phoneCodeSelect.value = savedCallingCode;
      } else if (!phoneCodeSelect.value) {
        phoneCodeSelect.value = "+1";
      }
      phoneCodeSelect.classList.remove("hide", "dn");
      phoneCodeSelect.hidden = false;
      phoneCodeSelect.disabled = false;
      phoneCodeSelect.multiple = false;
      phoneCodeSelect.size = 1;
      phoneCodeSelect.setAttribute("aria-label", "Country calling code");

      const phoneInput = phoneFieldRow.querySelector(
        'input[name="international_recipient_phone"]',
      );
      const phoneCell = phoneInput?.closest(".td");
      if (phoneInput && phoneCell) {
        const phoneCodeControl = enhanceNativeAddressSelect({
          frameDocument,
          nativeModal,
          select: phoneCodeSelect,
          className: "trendypicker-phone-code",
        });
        const phoneControls = frameDocument.createElement("div");
        phoneControls.className = "trendypicker-phone-controls";
        phoneControls.append(phoneCodeControl || phoneCodeSelect, phoneInput);
        phoneCell.appendChild(phoneControls);
      }
    }
    fields.appendChild(contactRow);
    source.appendChild(fields);
  };

  const validateNativeAddressForm = (nativeModal) => {
    const requiredFieldNames = [
      "address_description",
      "recipient_user_first_name",
      "recipient_user_last_name",
      "international_country_input",
      "international_address1",
      "international_town_city",
      "international_county_input",
      "international_postcode",
      "international_recipient_phone",
    ];
    const requiredFields = requiredFieldNames
      .map((fieldName) => nativeModal.querySelector(`[name="${fieldName}"]`))
      .filter(Boolean);
    const emailField = getNativeAddressEmailField(nativeModal);
    if (emailField) requiredFields.push(emailField);

    requiredFields.forEach((field) => {
      const clearInvalidState = () => {
        if (!String(field.value || "").trim()) return;
        field.classList.remove("is-address-invalid");
        field.removeAttribute("aria-invalid");
      };
      if (!field.dataset.trendypickerValidationBound) {
        field.addEventListener("input", clearInvalidState);
        field.addEventListener("change", clearInvalidState);
        field.dataset.trendypickerValidationBound = "true";
      }
    });

    const invalidFields = requiredFields.filter(
      (field) => !String(field.value || "").trim(),
    );
    requiredFields.forEach((field) => {
      const isInvalid = invalidFields.includes(field);
      field.classList.toggle("is-address-invalid", isInvalid);
      if (isInvalid) field.setAttribute("aria-invalid", "true");
      else field.removeAttribute("aria-invalid");
    });
    invalidFields[0]?.focus();
    return invalidFields.length === 0;
  };

  const syncNativeAddressFrameHeight = (nativeModal) => {
    if (!addressModalFrame || !nativeModal) return;
    const nativeHost = addressModalFrame.closest(".profile-address-native-host");
    let resizeFrame = 0;
    const sync = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        const contentHeight = Math.ceil(
          Math.max(nativeModal.scrollHeight, nativeModal.getBoundingClientRect().height),
        );
        if (!contentHeight) return;
        const nextHeight = `${contentHeight}px`;
        addressModalFrame.style.height = nextHeight;
        if (nativeHost) nativeHost.style.height = nextHeight;
      });
    };

    sync();
    window.setTimeout(sync, 50);
    window.setTimeout(sync, 180);
    if (!nativeModal.dataset.trendypickerResizeBound) {
      const FrameMutationObserver =
        nativeModal.ownerDocument.defaultView?.MutationObserver || MutationObserver;
      new FrameMutationObserver(sync).observe(nativeModal, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      nativeModal.dataset.trendypickerResizeBound = "true";
    }
  };

  const launchNativeAddressEditor = () => {
    if (!addressModalFrame) return;

    try {
      const frameDocument = addressModalFrame.contentDocument;
      if (!frameDocument) return;

      if (!frameDocument.getElementById("trendypicker-address-modal-style")) {
        const style = frameDocument.createElement("style");
        style.id = "trendypicker-address-modal-style";
        style.textContent = nativeAddressModalStyles;
        frameDocument.head?.appendChild(style);
      }

      const editorTrigger = pendingAddressSeq
        ? Array.from(frameDocument.querySelectorAll(".updateaddress")).find(
            (button) => button.getAttribute("seq") === pendingAddressSeq,
          )
        : frameDocument.querySelector(".addAddress");
      if (!editorTrigger) return;
      editorTrigger?.click();

      window.setTimeout(() => {
        const nativeModal = frameDocument.querySelector("#inAddress");
        if (!nativeModal) return;

        frameDocument.body.appendChild(nativeModal);
        nativeModal.classList.remove("hide");
        nativeModal.style.setProperty("display", "block", "important");
        simplifyNativeAddressForm(frameDocument, nativeModal);

        const defaultInput = nativeModal.querySelector(
          'input[name="save_delivery_address"]',
        );
        const defaultButton = defaultInput?.closest("label");
        if (defaultInput && defaultButton) {
          defaultButton.classList.add("trendypicker-address-default");
          nativeModal.dataset.addressSubmitIntent = "save";
          const syncDefaultButton = () => {
            defaultButton.classList.toggle("is-selected", defaultInput.checked);
            defaultButton.setAttribute("aria-pressed", String(defaultInput.checked));
          };
          if (!defaultInput.dataset.trendypickerDefaultBound) {
            defaultInput.addEventListener("change", syncDefaultButton);
            defaultInput.dataset.trendypickerDefaultBound = "true";
          }

          const insertModeInput = nativeModal.querySelector('input[name="insert_mode"]');
          if (
            (!pendingAddressSeq || insertModeInput?.value === "insert") &&
            pendingAddressOperation !== "set-default"
          ) {
            defaultInput.checked = false;
          }
          syncDefaultButton();
        }

        const actions = nativeModal.querySelector(".btn_area_b");
        if (actions && !actions.querySelector(".profile-address-native-cancel")) {
          const cancelButton = frameDocument.createElement("button");
          cancelButton.type = "button";
          cancelButton.className = "profile-address-native-cancel";
          cancelButton.textContent = "Cancel";
          cancelButton.addEventListener("click", closeAddressModal);
          actions.prepend(cancelButton);
        }

        if (actions && defaultButton) {
          let footer = nativeModal.querySelector(".trendypicker-address-footer");
          if (!footer) {
            footer = frameDocument.createElement("div");
            footer.className = "trendypicker-address-footer";
            actions.parentNode?.insertBefore(footer, actions);
          }
          footer.append(defaultButton, actions);
        }

        syncNativeAddressFrameHeight(nativeModal);

        const saveButton = nativeModal.querySelector("#insert_address");
        if (saveButton && !saveButton.dataset.trendypickerValidationBound) {
          saveButton.addEventListener(
            "click",
            (event) => {
              const isSilentDefaultUpdate = pendingAddressOperation === "set-default";
              const shouldSetDefault =
                isSilentDefaultUpdate || nativeModal.dataset.addressSubmitIntent === "default";
              if (!isSilentDefaultUpdate && !validateNativeAddressForm(nativeModal)) {
                event.preventDefault();
                event.stopImmediatePropagation();
                addressSavePending = false;
                return;
              }

              if (defaultInput) {
                defaultInput.checked = shouldSetDefault;
                if (shouldSetDefault) defaultInput.setAttribute("checked", "checked");
                else defaultInput.removeAttribute("checked");
                defaultInput.dispatchEvent(new Event("change", { bubbles: true }));
              }

              prepareAddressSaveAlert(
                frameDocument.defaultView,
                shouldSetDefault ? "default" : "save",
              );

              addressSavePending = true;
              window.clearTimeout(addressSaveFallbackTimer);
              addressSaveFallbackTimer = window.setTimeout(completeAddressSave, 1200);
              pendingAddressOperation = "edit";
            },
            true,
          );
          saveButton.dataset.trendypickerValidationBound = "true";
        }

        if (
          defaultButton &&
          defaultInput &&
          saveButton &&
          !defaultButton.dataset.trendypickerSubmitBound
        ) {
          defaultButton.addEventListener("click", (event) => {
            event.preventDefault();
            if (!validateNativeAddressForm(nativeModal)) return;

            nativeModal.dataset.addressSubmitIntent = "default";
            defaultInput.checked = true;
            defaultInput.setAttribute("checked", "checked");
            defaultInput.dispatchEvent(new Event("change", { bubbles: true }));
            saveButton.click();
            hideAddressModal();
          });
          defaultButton.dataset.trendypickerSubmitBound = "true";
        }

        const nativeActionFrame = frameDocument.querySelector("iframe[name='actionFrame']");
        if (nativeActionFrame && !nativeActionFrame.dataset.trendypickerSaveBound) {
          nativeActionFrame.addEventListener("load", () => {
            if (!addressSavePending) return;
            window.setTimeout(completeAddressSave, 100);
          });
          nativeActionFrame.dataset.trendypickerSaveBound = "true";
        }

        if (pendingAddressOperation === "set-default") {
          const submitDefaultAddress = (attemptsLeft = 24) => {
            const addressSeqInput = nativeModal.querySelector('input[name="address_seq"]');
            const insertModeInput = nativeModal.querySelector('input[name="insert_mode"]');
            const saveButton = nativeModal.querySelector("#insert_address");
            const isReady =
              addressSeqInput?.value === pendingAddressSeq &&
              insertModeInput?.value === "update" &&
              defaultInput &&
              saveButton;

            if (!isReady) {
              if (attemptsLeft > 0) {
                window.setTimeout(() => submitDefaultAddress(attemptsLeft - 1), 100);
              } else {
                pendingAddressOperation = "edit";
                hydrateDefaultAddress();
              }
              return;
            }

            nativeModal.dataset.addressSubmitIntent = "default";
            defaultInput.checked = true;
            defaultInput.setAttribute("checked", "checked");
            defaultInput.dispatchEvent(new Event("change", { bubbles: true }));
            saveButton.click();
          };

          submitDefaultAddress();
          return;
        }

        if (addressModalLayer.classList.contains("is-default-updating")) return;
        const addressModal = addressModalLayer.querySelector(".profile-address-modal");
        if (addressModal) addressModal.scrollTop = 0;
        frameDocument.documentElement.scrollTop = 0;
        frameDocument.body.scrollTop = 0;
        addressModalLayer.hidden = false;
        addressModalLayer.setAttribute("aria-hidden", "false");
        document.body.classList.add("is-profile-address-open");
      }, 80);
    } catch (error) {
      // Same-origin Firstmall pages expose the native form. The full address page remains usable as fallback.
    }
  };

  const requestNativeAddressEditor = () => {
    if (!addressModalFrame) return;
    if (!addressModalFrame.getAttribute("src") || addressFrameNeedsReload) {
      addressFrameNeedsReload = false;
      addressModalFrame.addEventListener("load", launchNativeAddressEditor, { once: true });
      addressModalFrame.src =
        "/mypage/delivery_address?tab=1&trendypicker_reload=" + Date.now();
    } else {
      launchNativeAddressEditor();
    }
  };

  const openAddressModal = (addressSeq = "") => {
    if (!addressModalLayer) return;
    pendingAddressSeq = String(addressSeq || "");
    pendingAddressOperation = "edit";
    addressModalLayer.classList.remove("is-default-updating");
    requestNativeAddressEditor();
  };

  const setDefaultAddress = (addressSeq, radio) => {
    if (!addressSeq) return;
    addressModalLayer?.classList.add("is-default-updating");
    pendingAddressSeq = String(addressSeq);
    pendingAddressOperation = "set-default";
    radio.disabled = true;
    requestNativeAddressEditor();
  };

  const closeAddressModal = () => {
    hideAddressModal();
    pendingAddressOperation = "edit";
    hydrateDefaultAddress();
  };

  document.querySelectorAll("[data-bo-address-modal-open]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openAddressModal();
    });
  });

  document.querySelectorAll("[data-bo-address-modal-close]").forEach((trigger) => {
    trigger.addEventListener("click", closeAddressModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (addressModalLayer?.hidden === false) closeAddressModal();
  });

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

  const syncProfileSideAlignment = () => {
    const shell = document.querySelector(".bo-profile-shell");
    const side = shell?.querySelector(":scope > .bo-account-side");
    const title = document.querySelector(".bo-profile-page__head h1");
    if (!shell || !side || !title) return;

    if (!window.matchMedia("(min-width: 1121px)").matches) {
      shell.style.removeProperty("--bo-profile-side-offset");
      return;
    }

    shell.style.removeProperty("--bo-profile-side-offset");
    const delta = Math.round(
      title.getBoundingClientRect().top - side.getBoundingClientRect().top,
    );
    if (!delta) return;

    const currentOffset =
      parseFloat(getComputedStyle(side).marginTop) || 60;
    shell.style.setProperty(
      "--bo-profile-side-offset",
      `${Math.max(0, currentOffset + delta)}px`,
    );
  };

  const queueProfileSideAlignment = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(syncProfileSideAlignment);
    });
  };

  queueProfileSideAlignment();
  window.addEventListener("load", queueProfileSideAlignment);
  window.addEventListener("resize", queueProfileSideAlignment);
})();
