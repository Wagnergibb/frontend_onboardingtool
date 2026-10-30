import { API_BASE, requireAdmin, logout } from "./common.js";

if (requireAdmin()) {
  document.getElementById("logout-button").addEventListener("click", logout);
  document
    .getElementById("create-user-button")
    .addEventListener("click", toggleCreateForm);
  document
    .getElementById("cancel-create-user")
    .addEventListener("click", resetCreateForm);
  document
    .getElementById("create-user-form")
    .addEventListener("submit", createUser);
  loadUsers();
}

async function loadUsers(successMessage = "") {
  const list = document.getElementById("admin-user-list");
  const message = document.getElementById("admin-message");

  list.textContent = "Benutzer werden geladen...";
  message.textContent = successMessage;

  try {
    const response = await fetch(`${API_BASE}/users`);

    if (!response.ok) {
      throw new Error("Users request failed");
    }

    const users = await response.json();
    renderUsers(users);
  } catch (error) {
    list.textContent = "Benutzer konnten nicht geladen werden.";
  }
}

function renderUsers(users) {
  const list = document.getElementById("admin-user-list");

  if (users.length === 0) {
    list.textContent = "Keine Benutzer vorhanden.";
    return;
  }

  list.innerHTML = `
    <div class="user-table" role="table" aria-label="Benutzerliste">
      <div class="user-table-row user-table-header" role="row">
        <span role="columnheader">Name</span>
        <span role="columnheader">Benutzername</span>
        <span role="columnheader">Rolle</span>
        <span role="columnheader">Status</span>
      </div>
      ${users
        .map(
          (user) => `<div class="user-table-row" role="row">
            <span role="cell">${escapeHtml(`${user.firstName || ""} ${user.lastName || ""}`.trim())}</span>
            <span role="cell">${escapeHtml(user.username)}</span>
            <span role="cell">${escapeHtml(user.role)}</span>
            <span role="cell">${user.active ? "Aktiv" : "Inaktiv"}</span>
          </div>`,
        )
        .join("")}
    </div>
  `;
}

function toggleCreateForm() {
  const form = document.getElementById("create-user-form");
  form.hidden = !form.hidden;
  if (!form.hidden) {
    document.getElementById("new-username").focus();
  }
}

function resetCreateForm() {
  const form = document.getElementById("create-user-form");
  form.reset();
  form.hidden = true;
  document.getElementById("create-user-error").textContent = "";
}

async function createUser(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const errorMessage = document.getElementById("create-user-error");
  const submitButton = document.getElementById("submit-create-user");
  const roleTags = String(formData.get("roleTags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  errorMessage.textContent = "";
  submitButton.disabled = true;
  submitButton.textContent = "Wird gespeichert...";

  try {
    const response = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: String(formData.get("username")).trim(),
        password: String(formData.get("password")),
        firstName: String(formData.get("firstName")).trim(),
        lastName: String(formData.get("lastName")).trim(),
        functionName: String(formData.get("functionName")).trim(),
        roleTags,
        buddyName: String(formData.get("buddyName") || "").trim(),
      }),
    });

    if (response.status === 409) {
      errorMessage.textContent = "Dieser Benutzername existiert bereits.";
      return;
    }

    if (response.status !== 201) {
      errorMessage.textContent = "Benutzer konnte nicht erstellt werden.";
      return;
    }

    resetCreateForm();
    await loadUsers("Benutzer wurde erstellt.");
  } catch (error) {
    errorMessage.textContent = "Benutzer konnte nicht erstellt werden.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Speichern";
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
