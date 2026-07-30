(() => {
  const profileBirthdayInput = document.querySelector("[data-profile-birthday]");
  
  if (profileBirthdayInput) {
    const parseDateValue = (value) => {
      const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!match) return null;
      const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      return Number.isNaN(date.getTime()) ? null : date;
    };
  
    const formatDateValue = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
  
    const sameDate = (a, b) =>
      a &&
      b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  
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
  
    const calendar = document.createElement("div");
    calendar.className = "profile-birthday-dialog";
    calendar.hidden = true;
    calendar.setAttribute("aria-hidden", "true");
    calendar.innerHTML = `
      <button type="button" class="profile-birthday-backdrop" data-profile-birthday-close aria-label="Close birthday calendar"></button>
      <section class="profile-birthday-panel" role="dialog" aria-modal="true" aria-label="Choose birthday">
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
    document.body.appendChild(calendar);
  
    const monthSelect = calendar.querySelector("[data-profile-birthday-month]");
    const yearSelect = calendar.querySelector("[data-profile-birthday-year]");
    const days = calendar.querySelector(".profile-birthday-days");
    let selectedDate = parseDateValue(profileBirthdayInput.value) || new Date(2001, 4, 6);
    let viewYear = selectedDate.getFullYear();
    let viewMonth = selectedDate.getMonth();
  
    monthSelect?.replaceChildren(
      ...monthNames.map((month, index) => {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = month;
        return option;
      })
    );
  
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let year = currentYear; year >= 1900; year -= 1) {
      const option = document.createElement("option");
      option.value = String(year);
      option.textContent = String(year);
      yearOptions.push(option);
    }
    yearSelect?.replaceChildren(...yearOptions);
  
    const renderBirthdayCalendar = () => {
      if (monthSelect) monthSelect.value = String(viewMonth);
      if (yearSelect) yearSelect.value = String(viewYear);
      days.innerHTML = "";
  
      const firstDay = new Date(viewYear, viewMonth, 1).getDay();
      const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
      const today = new Date();
  
      for (let index = 0; index < firstDay; index += 1) {
        days.appendChild(document.createElement("span"));
      }
  
      for (let day = 1; day <= totalDays; day += 1) {
        const date = new Date(viewYear, viewMonth, day);
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = String(day);
        button.dataset.profileBirthdayDay = formatDateValue(date);
        button.setAttribute("role", "gridcell");
        button.classList.toggle("is-today", sameDate(date, today));
        button.classList.toggle("is-selected", sameDate(date, selectedDate));
        days.appendChild(button);
      }
  
    };
  
    const closeBirthdayCalendar = ({ restoreFocus = false } = {}) => {
      calendar.hidden = true;
      calendar.setAttribute("aria-hidden", "true");
      profileBirthdayInput.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-profile-birthday-open");
      if (restoreFocus) profileBirthdayInput.focus();
    };
  
    const openBirthdayCalendar = () => {
      selectedDate = parseDateValue(profileBirthdayInput.value) || selectedDate;
      viewYear = selectedDate.getFullYear();
      viewMonth = selectedDate.getMonth();
      calendar.hidden = false;
      calendar.setAttribute("aria-hidden", "false");
      profileBirthdayInput.setAttribute("aria-expanded", "true");
      document.body.classList.add("is-profile-birthday-open");
      renderBirthdayCalendar();
      window.setTimeout(() => {
        calendar.querySelector(".profile-birthday-days .is-selected")?.focus();
      }, 0);
    };
  
    profileBirthdayInput.addEventListener("click", openBirthdayCalendar);
    profileBirthdayInput.addEventListener("keydown", (event) => {
      if (["Enter", " ", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        openBirthdayCalendar();
      }
    });
  
    monthSelect?.addEventListener("change", () => {
      viewMonth = Number(monthSelect.value);
      renderBirthdayCalendar();
    });
  
    yearSelect?.addEventListener("change", () => {
      viewYear = Number(yearSelect.value);
      renderBirthdayCalendar();
    });
  
    calendar.addEventListener("click", (event) => {
      if (event.target.closest("[data-profile-birthday-close]")) {
        closeBirthdayCalendar({ restoreFocus: true });
        return;
      }
  
      if (event.target.closest("[data-profile-birthday-prev]")) {
        viewMonth -= 1;
        if (viewMonth < 0) {
          viewMonth = 11;
          viewYear -= 1;
        }
        renderBirthdayCalendar();
        return;
      }
  
      if (event.target.closest("[data-profile-birthday-next]")) {
        viewMonth += 1;
        if (viewMonth > 11) {
          viewMonth = 0;
          viewYear += 1;
        }
        renderBirthdayCalendar();
        return;
      }
  
      if (event.target.closest("[data-profile-birthday-today]")) {
        selectedDate = new Date();
        profileBirthdayInput.value = formatDateValue(selectedDate);
        closeBirthdayCalendar({ restoreFocus: true });
        return;
      }
  
      const dayButton = event.target.closest("[data-profile-birthday-day]");
      if (!dayButton) return;
      selectedDate = parseDateValue(dayButton.dataset.profileBirthdayDay) || selectedDate;
      profileBirthdayInput.value = formatDateValue(selectedDate);
      closeBirthdayCalendar({ restoreFocus: true });
    });
  
    document.addEventListener("pointerdown", (event) => {
      if (
        calendar.hidden ||
        event.target.closest(".profile-birthday-panel") ||
        event.target === profileBirthdayInput
      ) {
        return;
      }
      closeBirthdayCalendar();
    });
  
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !calendar.hidden) {
        closeBirthdayCalendar({ restoreFocus: true });
      }
    });
  
  }
  
})();
