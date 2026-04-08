const API_BASE = "http://localhost:5000";

async function loadFormMarkup() {
  const response = await fetch("./form.html");
  if (!response.ok) {
    throw new Error("Failed to load form modal.");
  }
  return response.text();
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function validateForm(fields) {
  const errors = [];
  if (!fields.name) errors.push("Please select a team member.");
  if (!fields.did.trim()) errors.push("Please enter what you did today.");
  if (!fields.willdo.trim()) errors.push("Please enter what you'll do next.");
  return errors;
}

function setError(message) {
  const el = document.getElementById("form-error");
  if (!message) {
    el.textContent = "";
    el.classList.add("hidden");
    return;
  }
  el.textContent = message;
  el.classList.remove("hidden");
}

function closeModal(modal) {
  modal.classList.add("hidden");
}

function openModal(modal) {
  modal.classList.remove("hidden");
}

async function initForm() {
  const root = document.getElementById("form-modal-root");
  const openBtn = document.getElementById("open-form-btn");
  if (!root || !openBtn) return;

  try {
    root.innerHTML = await loadFormMarkup();
  } catch (error) {
    console.error(error);
    return;
  }

  const modal = document.getElementById("standup-modal");
  const form = document.getElementById("standup-form");
  const closeBtn = document.getElementById("close-form-btn");
  const cancelBtn = document.getElementById("cancel-form-btn");
  const nameInput = document.getElementById("member-name");
  const didInput = document.getElementById("did-text");
  const willdoInput = document.getElementById("willdo-text");
  const blockersInput = document.getElementById("blockers-text");

  const resetForm = () => {
    form.reset();
    setError("");
  };

  openBtn.addEventListener("click", () => openModal(modal));
  closeBtn.addEventListener("click", () => closeModal(modal));
  cancelBtn.addEventListener("click", () => closeModal(modal));

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal(modal);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      name: nameInput.value,
      did: didInput.value,
      willdo: willdoInput.value,
      blockers: blockersInput.value,
      date: getTodayDate(),
    };

    const errors = validateForm(payload);
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit standup update.");
      }
      closeModal(modal);
      resetForm();
      document.dispatchEvent(new CustomEvent("standupSubmitted"));
    } catch (error) {
      setError(error.message || "Could not submit update. Please try again.");
    }
  });
}

initForm();
