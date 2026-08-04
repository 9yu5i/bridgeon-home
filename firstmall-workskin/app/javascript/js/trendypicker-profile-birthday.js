(() => {
  const input = document.querySelector("[data-profile-birthday]");
  if (!input) return;

  const parseDate = (value) => {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isSameDate = (first, second) =>
    first &&
    second &&
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dialog = document.createElement("div");
  dialog.className = "profile-birthday-dialog";
  dialog.hidden = true;
  dialog.setAttribute("aria-hidden", "true");
  dialog.innerHTML = `
    <button type="button" class="profile-birthday-backdrop" data-profile-birthday-close aria-label="Close birthday calendar"></button>
    <section class="profile-birthday-panel profile-field" role="dialog" aria-modal="true" aria-label="Choose birthday">
      <div class="profile-birthday-head">
        <button type="button" data-profile-birthday-prev aria-label="Previous month">&#8249;</button>
        <div class="profile-birthday-selects">
          <select data-profile-birthday-month aria-label="Select month"></select>
          <select data-profile-birthday-year aria-label="Select year"></select>
        </div>
        <button type="button" data-profile-birthday-next aria-label="Next month">&#8250;</button>
      </div>
      <div class="profile-birthday-weekdays" aria-hidden="true">
        <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
      </div>
      <div class="profile-birthday-days" role="grid" aria-label="Choose birthday"></div>
      <div class="profile-birthday-actions">
        <button type="button" data-profile-birthday-today>Today</button>
        <button type="button" data-profile-birthday-close>Done</button>
      </div>
    </section>
  `;
  document.body.append(dialog);

  const monthSelect = dialog.querySelector("[data-profile-birthday-month]");
  const yearSelect = dialog.querySelector("[data-profile-birthday-year]");
  const days = dialog.querySelector(".profile-birthday-days");
  let selectedDate = parseDate(input.value) || new Date();
  let viewYear = selectedDate.getFullYear();
  let viewMonth = selectedDate.getMonth();

  monthNames.forEach((month, index) => {
    monthSelect?.append(new Option(month, String(index)));
  });

  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 1900; year -= 1) {
    yearSelect?.append(new Option(String(year), String(year)));
  }

  const calendarSelectSync = new WeakMap();

  const enhanceCalendarSelect = (select, label) => {
    if (!select?.parentElement) return;
    const wrap = document.createElement("span");
    wrap.className =
      "profile-select-control profile-birthday-select-control realtrend-select-wrap";
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "realtrend-select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", label);
    const value = document.createElement("span");
    value.className = "realtrend-select-value";
    const menu = document.createElement("ul");
    menu.className = "realtrend-select-menu";
    menu.setAttribute("role", "listbox");

    select.classList.add("realtrend-select-native");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
    select.before(wrap);
    trigger.append(value);
    wrap.append(trigger, menu, select);

    const close = () => {
      wrap.classList.remove("is-open");
      menu.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    };

    const sync = () => {
      const selectedOption = select.options[select.selectedIndex];
      value.textContent = selectedOption?.textContent || "";
      menu.querySelectorAll("li").forEach((item) => {
        const isSelected = item.dataset.value === select.value;
        item.classList.toggle("is-selected", isSelected);
        item.setAttribute("aria-selected", String(isSelected));
      });
    };

    Array.from(select.options).forEach((option) => {
      const item = document.createElement("li");
      item.textContent = option.textContent;
      item.dataset.value = option.value;
      item.setAttribute("role", "option");
      item.addEventListener("click", () => {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        sync();
        close();
        trigger.focus();
      });
      menu.append(item);
    });

    trigger.addEventListener("click", () => {
      const willOpen = !wrap.classList.contains("is-open");
      dialog.querySelectorAll(".realtrend-select-wrap.is-open").forEach((openWrap) => {
        if (openWrap === wrap) return;
        openWrap.classList.remove("is-open");
        openWrap.querySelector(".realtrend-select-menu")?.classList.remove("is-open");
        openWrap.querySelector(".realtrend-select-trigger")?.setAttribute(
          "aria-expanded",
          "false",
        );
      });
      wrap.classList.toggle("is-open", willOpen);
      menu.classList.toggle("is-open", willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));
    });

    document.addEventListener("pointerdown", (event) => {
      if (!wrap.contains(event.target)) close();
    });
    select.addEventListener("change", sync);
    calendarSelectSync.set(select, sync);
    sync();
  };

  enhanceCalendarSelect(monthSelect, "Select month");
  enhanceCalendarSelect(yearSelect, "Select year");

  const render = () => {
    if (!days) return;
    if (monthSelect) monthSelect.value = String(viewMonth);
    if (yearSelect) yearSelect.value = String(viewYear);
    calendarSelectSync.get(monthSelect)?.();
    calendarSelectSync.get(yearSelect)?.();
    days.replaceChildren();

    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
    const today = new Date();

    for (let index = 0; index < firstWeekday; index += 1) {
      days.append(document.createElement("span"));
    }

    for (let day = 1; day <= lastDay; day += 1) {
      const date = new Date(viewYear, viewMonth, day);
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(day);
      button.dataset.profileBirthdayDay = formatDate(date);
      button.setAttribute("role", "gridcell");
      button.classList.toggle("is-today", isSameDate(date, today));
      button.classList.toggle("is-selected", isSameDate(date, selectedDate));
      days.append(button);
    }
  };

  const close = ({ restoreFocus = false } = {}) => {
    dialog.hidden = true;
    dialog.setAttribute("aria-hidden", "true");
    input.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-profile-birthday-open");
    if (restoreFocus) input.focus();
  };

  const open = () => {
    selectedDate = parseDate(input.value) || new Date();
    viewYear = selectedDate.getFullYear();
    viewMonth = selectedDate.getMonth();
    dialog.hidden = false;
    dialog.setAttribute("aria-hidden", "false");
    input.setAttribute("aria-expanded", "true");
    document.body.classList.add("is-profile-birthday-open");
    render();
    window.setTimeout(() => {
      dialog.querySelector(".profile-birthday-days .is-selected")?.focus();
    }, 0);
  };

  input.addEventListener("click", open);
  input.addEventListener("keydown", (event) => {
    if (!["Enter", " ", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    open();
  });

  monthSelect?.addEventListener("change", () => {
    viewMonth = Number(monthSelect.value);
    render();
  });

  yearSelect?.addEventListener("change", () => {
    viewYear = Number(yearSelect.value);
    render();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target.closest("[data-profile-birthday-close]")) {
      close({ restoreFocus: true });
      return;
    }

    if (event.target.closest("[data-profile-birthday-prev]")) {
      viewMonth -= 1;
      if (viewMonth < 0) {
        viewMonth = 11;
        viewYear -= 1;
      }
      render();
      return;
    }

    if (event.target.closest("[data-profile-birthday-next]")) {
      viewMonth += 1;
      if (viewMonth > 11) {
        viewMonth = 0;
        viewYear += 1;
      }
      render();
      return;
    }

    if (event.target.closest("[data-profile-birthday-today]")) {
      selectedDate = new Date();
      input.value = formatDate(selectedDate);
      input.dispatchEvent(new Event("change", { bubbles: true }));
      close({ restoreFocus: true });
      return;
    }

    const dayButton = event.target.closest("[data-profile-birthday-day]");
    if (!dayButton) return;
    selectedDate = parseDate(dayButton.dataset.profileBirthdayDay) || selectedDate;
    input.value = formatDate(selectedDate);
    input.dispatchEvent(new Event("change", { bubbles: true }));
    close({ restoreFocus: true });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dialog.hidden) close({ restoreFocus: true });
  });
})();
