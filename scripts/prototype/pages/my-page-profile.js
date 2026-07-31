(() => {
  const profileCallingCodeByCountry = new Map(
    [
      ["United States", "+1 US"],
      ["Canada", "+1 CA"],
      ["United Kingdom", "+44 UK"],
      ["Australia", "+61 AU"],
      ["New Zealand", "+64 NZ"],
      ["Japan", "+81 JP"],
      ["South Korea", "+82 KR"],
      ["Singapore", "+65 SG"],
      ["Hong Kong", "+852 HK"],
      ["Taiwan", "+886 TW"],
      ["Germany", "+49 DE"],
      ["France", "+33 FR"],
      ["Italy", "+39 IT"],
      ["Spain", "+34 ES"],
      ["Netherlands", "+31 NL"],
      ["Belgium", "+32 BE"],
      ["Sweden", "+46 SE"],
      ["Norway", "+47 NO"],
      ["Denmark", "+45 DK"],
      ["Finland", "+358 FI"],
      ["Ireland", "+353 IE"],
      ["Switzerland", "+41 CH"],
      ["Austria", "+43 AT"],
      ["Portugal", "+351 PT"],
      ["Poland", "+48 PL"],
      ["Czech Republic", "+420 CZ"],
      ["Hungary", "+36 HU"],
      ["Romania", "+40 RO"],
      ["Greece", "+30 GR"],
      ["Luxembourg", "+352 LU"],
      ["Iceland", "+354 IS"],
      ["Mexico", "+52 MX"],
      ["Brazil", "+55 BR"],
      ["Chile", "+56 CL"],
      ["Colombia", "+57 CO"],
      ["Argentina", "+54 AR"],
      ["Peru", "+51 PE"],
      ["United Arab Emirates", "+971 AE"],
      ["Saudi Arabia", "+966 SA"],
      ["Israel", "+972 IL"],
      ["Turkey", "+90 TR"],
      ["India", "+91 IN"],
      ["Indonesia", "+62 ID"],
      ["Malaysia", "+60 MY"],
      ["Thailand", "+66 TH"],
      ["Vietnam", "+84 VN"],
      ["Philippines", "+63 PH"],
      ["China", "+86 CN"],
      ["South Africa", "+27 ZA"],
      ["Egypt", "+20 EG"],
      ["Nigeria", "+234 NG"],
      ["Kenya", "+254 KE"],
      ["Morocco", "+212 MA"],
      ["Russia", "+7 RU"],
      ["Ukraine", "+380 UA"],
      ["Croatia", "+385 HR"],
      ["Slovakia", "+421 SK"],
      ["Slovenia", "+386 SI"],
      ["Bulgaria", "+359 BG"],
      ["Estonia", "+372 EE"],
      ["Latvia", "+371 LV"],
      ["Lithuania", "+370 LT"],
      ["Malta", "+356 MT"],
      ["Cyprus", "+357 CY"],
      ["Qatar", "+974 QA"],
      ["Kuwait", "+965 KW"],
      ["Bahrain", "+973 BH"],
      ["Oman", "+968 OM"],
      ["Jordan", "+962 JO"],
      ["Lebanon", "+961 LB"],
      ["Costa Rica", "+506 CR"],
      ["Panama", "+507 PA"],
      ["Dominican Republic", "+1 DO"],
      ["Puerto Rico", "+1 PR"],
      ["Guatemala", "+502 GT"],
      ["Uruguay", "+598 UY"],
      ["Ecuador", "+593 EC"],
      ["Pakistan", "+92 PK"],
      ["Bangladesh", "+880 BD"],
      ["Sri Lanka", "+94 LK"],
      ["Cambodia", "+855 KH"],
      ["Laos", "+856 LA"],
      ["Myanmar", "+95 MM"],
      ["Macao", "+853 MO"],
      ["Mongolia", "+976 MN"],
      ["Kazakhstan", "+7 KZ"],
      ["Georgia", "+995 GE"],
      ["Armenia", "+374 AM"],
      ["Azerbaijan", "+994 AZ"],
      ["Serbia", "+381 RS"],
      ["Bosnia and Herzegovina", "+387 BA"],
      ["North Macedonia", "+389 MK"],
      ["Albania", "+355 AL"],
      ["Moldova", "+373 MD"],
      ["Belarus", "+375 BY"],
      ["Ghana", "+233 GH"],
      ["Tanzania", "+255 TZ"],
      ["Uganda", "+256 UG"],
      ["Tunisia", "+216 TN"],
      ["Algeria", "+213 DZ"],
      ["Mauritius", "+230 MU"],
      ["Reunion", "+262 RE"],
      ["Guadeloupe", "+590 GP"],
      ["Martinique", "+596 MQ"],
      ["French Guiana", "+594 GF"],
      ["New Caledonia", "+687 NC"],
      ["Fiji", "+679 FJ"],
      ["Papua New Guinea", "+675 PG"],
      ["Samoa", "+685 WS"],
      ["Tonga", "+676 TO"],
      ["Brunei", "+673 BN"],
      ["Maldives", "+960 MV"],
      ["Nepal", "+977 NP"],
      ["Bhutan", "+975 BT"],
      ["Trinidad and Tobago", "+1 TT"],
      ["Jamaica", "+1 JM"],
      ["Bahamas", "+1 BS"],
      ["Barbados", "+1 BB"],
      ["Belize", "+501 BZ"],
      ["El Salvador", "+503 SV"],
      ["Honduras", "+504 HN"],
      ["Nicaragua", "+505 NI"],
      ["Paraguay", "+595 PY"],
      ["Bolivia", "+591 BO"],
      ["Venezuela", "+58 VE"],
    ].map(([country, code]) => [country.toLowerCase(), code])
  );
  
  const getProfileCallingCode = (country) => {
    const countryName = String(country || "").trim();
    const asciiName = countryName.replace(/[^\x00-\x7F]/g, "");
    if (/^r.*nion$/i.test(asciiName)) return "+262 RE";
    return profileCallingCodeByCountry.get(countryName.toLowerCase()) || "+1 US";
  };
  
  const syncProfilePhoneCodes = () => {
    const countrySelect = document.querySelector(
      '.profile-select-control .realtrend-select-native[aria-label="Country or region"]'
    );
    const phoneSelect = document.querySelector(
      '.profile-phone-code .realtrend-select-native[aria-label="Country calling code"]'
    );
    if (!countrySelect || !phoneSelect) return;
  
    const previousValue = phoneSelect.value || phoneSelect.selectedOptions[0]?.textContent?.trim();
    const options = Array.from(countrySelect.options).map((countryOption) => {
      const option = document.createElement("option");
      const label = getProfileCallingCode(countryOption.textContent);
      option.value = label;
      option.textContent = label;
      option.selected = label === previousValue;
      return option;
    });
  
    phoneSelect.replaceChildren(...options);
    if (!Array.from(phoneSelect.options).some((option) => option.value === previousValue)) {
      phoneSelect.value = "+1 US";
    }
  };
  
  syncProfilePhoneCodes();
  
  const getProfileCountryNames = () => {
    const countrySelect = document.querySelector(
      '.profile-select-control .realtrend-select-native[aria-label="Country or region"]'
    );
    return Array.from(countrySelect?.options || [])
      .map((option) => option.textContent.trim())
      .filter(Boolean);
  };
  
  const populateProfileAddressModalSelects = () => {
    const countryNames = getProfileCountryNames();
    const addressCountrySelect = document.querySelector(
      '.profile-address-country .realtrend-select-native[aria-label="Address country or region"]'
    );
    const addressPhoneSelect = document.querySelector(
      '.profile-address-phone-code .realtrend-select-native[aria-label="Address country calling code"]'
    );
  
    if (addressCountrySelect) {
      const globalOption = document.createElement("option");
      globalOption.value = "Global";
      globalOption.textContent = "Global";
      globalOption.selected = true;
  
      const countryOptions = countryNames.map((country) => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        return option;
      });
  
      addressCountrySelect.replaceChildren(globalOption, ...countryOptions);
      addressCountrySelect.value = "Global";
    }
  
    if (addressPhoneSelect) {
      const codes = Array.from(
        new Set(countryNames.map((country) => getProfileCallingCode(country)))
      );
      const options = codes.map((code) => {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = code;
        option.selected = code === "+1 US";
        return option;
      });
  
      addressPhoneSelect.replaceChildren(...options);
      addressPhoneSelect.value = codes.includes("+1 US") ? "+1 US" : codes[0] || "";
    }
  };
  
  populateProfileAddressModalSelects();
  
  const clearProfileSampleInputValue = (field) => {
    if (!field) return;
    const value = field.value.trim();
    const samples = new Set(["Name", "000 000 0000", "name@email.com", field.placeholder?.trim()].filter(Boolean));
    if (samples.has(value)) field.value = "";
  };
  
  document.querySelectorAll("[data-profile-clear-sample]").forEach((field) => {
    field.addEventListener("focus", () => clearProfileSampleInputValue(field));
    field.addEventListener("pointerdown", () => clearProfileSampleInputValue(field));
  });
  
  document.querySelectorAll("[data-profile-save]").forEach((button) => {
    button.addEventListener("click", () => {
      const originalText = button.textContent;
      button.textContent = "Saved";
      button.disabled = true;
      window.setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 1400);
    });
  });

  window.TrendyPicker = window.TrendyPicker || {};
  window.TrendyPicker.profile = {
    getCallingCode: getProfileCallingCode,
  };
  
})();
