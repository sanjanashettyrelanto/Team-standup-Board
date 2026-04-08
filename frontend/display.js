const API_BASE = "http://localhost:5000";
const listHost = document.getElementById("standup-list");

const avatarColors = {
  Alice: "#7A5AF8",
  Bob: "#3B6FD4",
  Carol: "#16A34A",
  Dave: "#F59E0B",
  Eva: "#DB2777",
  Frank: "#0EA5E9",
};

let selectedDate = new Date().toISOString().slice(0, 10);
let activeFilters = {
  member: "All",
  keyword: "",
  blockersOnly: false,
};

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTimestamp(raw) {
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleString();
}

function applyClientFilters(items, filters) {
  const keyword = filters.keyword.toLowerCase();
  return items.filter((item) => {
    if (filters.member !== "All" && item.name !== filters.member) return false;
    if (filters.blockersOnly && !item.blockers?.trim()) return false;
    if (!keyword) return true;

    const blob = `${item.name} ${item.did} ${item.willdo} ${item.blockers || ""}`.toLowerCase();
    return blob.includes(keyword);
  });
}

async function fetchDateUpdates(date) {
  const response = await fetch(`${API_BASE}/api/updates?date=${encodeURIComponent(date)}`);
  if (!response.ok) throw new Error("Failed to fetch updates.");
  return response.json();
}

function renderEmptyState() {
  listHost.innerHTML = `<div class="empty-state">No standups yet for this date</div>`;
}

function renderCards(items) {
  if (!items.length) {
    renderEmptyState();
    return;
  }

  listHost.innerHTML = items
    .map((item) => {
      const nameColor = avatarColors[item.name] || "#64748B";
      const hasBlocker = Boolean(item.blockers && item.blockers.trim());
      return `
      <article class="standup-card">
        <div class="card-header">
          <div class="avatar" style="background:${nameColor}">${getInitials(item.name)}</div>
          <div class="header-copy">
            <h3>${item.name}</h3>
            <p class="timestamp">${formatTimestamp(item.submitted_at)}</p>
          </div>
          ${hasBlocker ? `<span class="badge-blocker">Blocker</span>` : ""}
        </div>
        <div class="card-body">
          <section><h4>Did</h4><p>${item.did}</p></section>
          <section><h4>Will Do</h4><p>${item.willdo}</p></section>
          <section><h4>Blockers</h4><p>${item.blockers || "None"}</p></section>
        </div>
      </article>
    `;
    })
    .join("");
}

async function refreshBoard() {
  try {
    const updates = await fetchDateUpdates(selectedDate);
    const filtered = applyClientFilters(updates, activeFilters);
    renderCards(filtered);
  } catch (error) {
    listHost.innerHTML = `<div class="empty-state">Could not load standups.</div>`;
  }
}

document.addEventListener("standupSubmitted", () => {
  selectedDate = new Date().toISOString().slice(0, 10);
  refreshBoard();
});

document.addEventListener("filterChange", (event) => {
  activeFilters = event.detail || activeFilters;
  refreshBoard();
});

document.addEventListener("dateSelect", (event) => {
  if (event.detail?.date) selectedDate = event.detail.date;
  refreshBoard();
});

refreshBoard();
