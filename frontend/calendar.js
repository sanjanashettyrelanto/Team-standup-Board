const API_BASE = "http://localhost:5000";
const calendarHost = document.getElementById("calendar-widget");

let activeDates = new Set();
let currentView = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let tooltipEl = null;
let selectedDate = new Date().toISOString().slice(0, 10);

function fmtDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function renderCalendar() {
  const today = new Date();
  const year = currentView.getFullYear();
  const month = currentView.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = firstDay.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const cells = [];
  for (let i = 0; i < startDay; i += 1) {
    cells.push(`<div class="calendar-cell empty"></div>`);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateObj = new Date(year, month, day);
    const dateStr = fmtDate(dateObj);
    const isToday = isSameDay(dateObj, today);
    const hasData = activeDates.has(dateStr);
    const isSelected = dateStr === selectedDate;
    const isPastNoData = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate()) && !hasData;
    const classes = ["calendar-cell"];
    if (isToday) classes.push("today");
    if (isSelected) classes.push("selected");
    if (isPastNoData) classes.push("dimmed");

    cells.push(`
      <button class="${classes.join(" ")}" data-date="${dateStr}" type="button">
        <span>${day}</span>
        ${hasData ? `<i class="data-dot"></i>` : ""}
      </button>
    `);
  }

  calendarHost.innerHTML = `
    <div class="calendar-wrap">
      <div class="calendar-header">
        <button id="prev-month" type="button" aria-label="Previous month">&lt;</button>
        <strong>${monthLabel}</strong>
        <button id="next-month" type="button" aria-label="Next month">&gt;</button>
      </div>
      <div class="calendar-weekdays">
        <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
      </div>
      <div class="calendar-grid">${cells.join("")}</div>
    </div>
  `;

  document.getElementById("prev-month").addEventListener("click", () => {
    currentView = new Date(year, month - 1, 1);
    renderCalendar();
  });

  document.getElementById("next-month").addEventListener("click", () => {
    currentView = new Date(year, month + 1, 1);
    renderCalendar();
  });

  calendarHost.querySelectorAll(".calendar-cell[data-date]").forEach((button) => {
    button.addEventListener("click", async () => {
      const date = button.dataset.date;
      selectedDate = date;
      renderCalendar();
      document.dispatchEvent(new CustomEvent("dateSelect", { detail: { date } }));

      const clicked = new Date(`${date}T00:00:00`);
      if (clicked > today) {
        await showFutureTasksTooltip(button, date);
      } else if (tooltipEl) {
        tooltipEl.remove();
      }
    });
  });
}

async function showFutureTasksTooltip(anchor, date) {
  const response = await fetch(`${API_BASE}/api/updates?date=${encodeURIComponent(date)}`);
  if (!response.ok) return;
  const updates = await response.json();
  const tasks = updates.map((entry) => entry.willdo?.trim()).filter(Boolean);
  if (!tasks.length) return;

  if (tooltipEl) tooltipEl.remove();
  tooltipEl = document.createElement("div");
  tooltipEl.className = "calendar-tooltip";
  tooltipEl.innerHTML = `<strong>Planned Tasks</strong><ul>${tasks.map((task) => `<li>${task}</li>`).join("")}</ul>`;
  document.body.appendChild(tooltipEl);

  const rect = anchor.getBoundingClientRect();
  tooltipEl.style.left = `${rect.left + window.scrollX}px`;
  tooltipEl.style.top = `${rect.bottom + window.scrollY + 6}px`;
}

async function initCalendar() {
  try {
    const response = await fetch(`${API_BASE}/api/dates`);
    if (response.ok) {
      const dates = await response.json();
      activeDates = new Set(dates);
    }
  } catch (error) {
    console.error("Failed to load active dates", error);
  }

  renderCalendar();
}

document.addEventListener("standupSubmitted", initCalendar);
document.addEventListener("dateSelect", (event) => {
  if (event.detail?.date) {
    selectedDate = event.detail.date;
  }
});
initCalendar();
