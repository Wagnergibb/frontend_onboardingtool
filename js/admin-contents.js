import { API_BASE, requireAdmin, logout, escapeHtml } from "./common.js";

if (requireAdmin()) {
  document.getElementById("logout-button").addEventListener("click", logout);
  document
    .getElementById("create-content-button")
    .addEventListener("click", toggleCreateForm);
  document
    .getElementById("cancel-create-content")
    .addEventListener("click", resetCreateForm);
  document
    .getElementById("content-type")
    .addEventListener("change", updateResourceFields);
  document
    .getElementById("create-content-form")
    .addEventListener("submit", createContent);
  loadContentList();
}

async function loadContentList(successMessage = "") {
  const list = document.getElementById("admin-content-list");
  const message = document.getElementById("content-message");

  list.textContent = "Inhalte werden geladen...";
  message.textContent = successMessage;

  try {
    const response = await fetch(`${API_BASE}/content`);

    if (!response.ok) {
      throw new Error("Content list request failed");
    }

    const contents = await response.json();
    renderContentList(contents);
  } catch (error) {
    list.textContent = "Inhalte konnten nicht geladen werden.";
  }
}

function renderContentList(contents) {
  const list = document.getElementById("admin-content-list");

  if (contents.length === 0) {
    list.textContent = "Keine Inhalte vorhanden.";
    return;
  }

  list.innerHTML = `
    <div class="user-table" role="table" aria-label="Inhaltsliste">
      <div class="user-table-row content-table-row user-table-header" role="row">
        <span role="columnheader">Titel</span>
        <span role="columnheader">Typ</span>
        <span role="columnheader">Kategorie</span>
        <span role="columnheader">Rollen</span>
        <span role="columnheader">Status</span>
        <span role="columnheader">Aktionen</span>
      </div>
      ${contents
        .map(
          (
            content,
          ) => `<div class="user-table-row content-table-row" role="row">
            <span role="cell">${escapeHtml(content.title)}</span>
            <span role="cell">${escapeHtml(content.type)}</span>
            <span role="cell">${escapeHtml(content.category)}</span>
            <span role="cell">${escapeHtml((content.roleTags || content.targetRoleTags || []).join(", ") || "Alle")}</span>
            <span role="cell">${content.active ? "Aktiv" : "Inaktiv"}</span>
            <span role="cell">${content.active ? `<button class="secondary-button deactivate-content" data-content-id="${content.id}" type="button">Deaktivieren</button>` : "-"}</span>
          </div>`,
        )
        .join("")}
    </div>
  `;

  list.querySelectorAll(".deactivate-content").forEach((button) => {
    button.addEventListener("click", () =>
      deactivateContent(button.dataset.contentId),
    );
  });
}

function toggleCreateForm() {
  const form = document.getElementById("create-content-form");
  form.hidden = !form.hidden;
  if (!form.hidden) {
    document.getElementById("content-title").focus();
  }
}

function resetCreateForm() {
  const form = document.getElementById("create-content-form");
  form.reset();
  form.hidden = true;
  document.getElementById("create-content-error").textContent = "";
  updateResourceFields();
}

function updateResourceFields() {
  const type = document.getElementById("content-type").value;
  const linkField = document.getElementById("link-field");
  const pdfField = document.getElementById("pdf-field");
  const url = document.getElementById("content-url");
  const file = document.getElementById("content-file");

  linkField.hidden = type !== "LINK";
  pdfField.hidden = type !== "PDF";
  url.required = type === "LINK";
  file.required = type === "PDF";
}

async function createContent(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const type = formData.get("contentType");
  const errorMessage = document.getElementById("create-content-error");
  const submitButton = document.getElementById("submit-create-content");

  errorMessage.textContent = "";
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const roleTags = String(formData.get("targetRoleTags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  submitButton.disabled = true;
  submitButton.textContent = "Wird gespeichert...";

  try {
    let resource;
    if (type === "PDF") {
      const file = formData.get("file");
      if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
        throw new Error("PDF file is required");
      }

      const uploadData = new FormData();
      uploadData.append("file", file);
      const uploadResponse = await fetch(`${API_BASE}/content/upload-pdf`, {
        method: "POST",
        body: uploadData,
      });

      if (!uploadResponse.ok) {
        throw new Error("PDF upload failed");
      }

      const uploadResult = await uploadResponse.json();
      resource = uploadResult.fileName;
    } else {
      resource = String(formData.get("resource")).trim();
    }

    const response = await fetch(`${API_BASE}/content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: String(formData.get("title")).trim(),
        description: String(formData.get("description") || "").trim(),
        category: formData.get("category"),
        contentType: type,
        resource,
        targetRoleTags: roleTags,
        sortOrder: Number(formData.get("sortOrder") || 0),
      }),
    });

    if (!response.ok) {
      throw new Error("Content creation failed");
    }

    resetCreateForm();
    await loadContentList("Inhalt wurde erstellt.");
  } catch (error) {
    errorMessage.textContent = "Inhalt konnte nicht erstellt werden.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Speichern";
  }
}

async function deactivateContent(contentId) {
  try {
    const response = await fetch(`${API_BASE}/content/${contentId}`, {
      method: "DELETE",
    });

    if (response.status !== 204) {
      throw new Error("Content deactivation failed");
    }

    await loadContentList("Inhalt wurde deaktiviert.");
  } catch (error) {
    document.getElementById("content-message").textContent =
      "Inhalt konnte nicht deaktiviert werden.";
  }
}
