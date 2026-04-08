const members = ["Alice", "Bob", "Carol", "Dave", "Eva", "Frank"];

const state = {
  member: "All",
  keyword: "",
  blockersOnly: false,
};

function emitFilterChange() {
  document.dispatchEvent(
    new CustomEvent("filterChange", {
      detail: { ...state },
    }),
  );
}

function debounce(fn, delayMs) {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

function renderFilters() {
  const host = document.getElementById("filter-bar");
  if (!host) return;

  host.innerHTML = `
    <div class="filters-wrap">
      <select id="filter-member" aria-label="Filter by member">
        <option value="All">All Members</option>
        ${members.map((name) => `<option value="${name}">${name}</option>`).join("")}
      </select>
      <input id="filter-keyword" type="search" placeholder="Search updates..." aria-label="Keyword search" />
      <label class="filter-checkbox">
        <input id="filter-blockers" type="checkbox" />
        <span>Blockers only</span>
      </label>
    </div>
  `;

  const memberSelect = document.getElementById("filter-member");
  const keywordInput = document.getElementById("filter-keyword");
  const blockersCheck = document.getElementById("filter-blockers");

  memberSelect.value = state.member;
  keywordInput.value = state.keyword;
  blockersCheck.checked = state.blockersOnly;

  memberSelect.addEventListener("change", () => {
    state.member = memberSelect.value;
    emitFilterChange();
  });

  keywordInput.addEventListener(
    "input",
    debounce(() => {
      state.keyword = keywordInput.value.trim();
      emitFilterChange();
    }, 300),
  );

  blockersCheck.addEventListener("change", () => {
    state.blockersOnly = blockersCheck.checked;
    emitFilterChange();
  });
}

renderFilters();
emitFilterChange();
