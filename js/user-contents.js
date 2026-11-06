import { API_BASE, requireUser, logout, escapeHtml } from "./common.js";

let contentItems = [];
let selectedCategory = "Alle";
let contentSearch = "";

if (requireUser()) {
  document.getElementById("logout-button").addEventListener("click", logout);
  document
    .getElementById("content-search")
    .addEventListener("input", (event) => {
      contentSearch = event.target.value;
      renderContentItems();
    });
  document.querySelectorAll(".category-filter").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.category;
      document.querySelectorAll(".category-filter").forEach((item) => {
        item.classList.toggle(
          "active",
          item.dataset.category === selectedCategory,
        );
      });
      renderContentItems();
    });
  });
  loadContent();
}

async function loadContent() {
  const onboardingId = sessionStorage.getItem("onboardingId");

  if (!onboardingId) {
    document.getElementById("content-items").innerHTML =
      "<p>Keine Inhalte vorhanden.</p>";
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/onboarding/${onboardingId}/content`,
    );

    if (!response.ok) {
      throw new Error("Content request failed");
    }

    const items = await response.json();
    contentItems = Array.isArray(items) ? items : [];
    selectedCategory = "Alle";
    contentSearch = "";
    document.getElementById("content-search").value = "";
    renderContentItems();
  } catch (error) {
    document.getElementById("content-error").textContent =
      "Inhalte konnten nicht geladen werden.";
  }
}

function renderContentItems() {
  const completed = contentItems.filter((item) => item.completed).length;
  const total = contentItems.length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  const progress = document.getElementById("content-progress");
  const contentList = document.getElementById("content-items");

  progress.innerHTML = `
    <span>${completed} von ${total} Inhalten erledigt – ${percentage}%</span>
    <span class="progress-track" aria-label="Fortschritt">
      <span class="progress-bar" style="width: ${percentage}%"></span>
    </span>
  `;

  const search = contentSearch.trim().toLowerCase();
  const visibleItems = contentItems.filter((item) => {
    const title = String(item.title || "").toLowerCase();
    const description = String(item.description || "").toLowerCase();
    const matchesSearch =
      !search || title.includes(search) || description.includes(search);
    const matchesCategory =
      selectedCategory === "Alle" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (total === 0) {
    contentList.innerHTML = "<p>Keine Inhalte vorhanden.</p>";
    return;
  }

  if (visibleItems.length === 0) {
    contentList.innerHTML = `
      <p>Keine passenden Inhalte gefunden. Suche oder Filter zurücksetzen.</p>
      <button id="reset-filters" class="secondary-button" type="button">Zurücksetzen</button>
    `;
    document.getElementById("reset-filters").addEventListener("click", resetFilters);
    return;
  }

  contentList.innerHTML = visibleItems
    .map(
      (item) => `
        <article class="content-item${item.completed ? " completed" : ""}">
          <div class="content-item-main">
            <label class="completion-control">
              <input class="completion-checkbox" type="checkbox" data-content-id="${item.id}" ${item.completed ? "checked" : ""}>
              <span>${item.completed ? "Erledigt" : ""}</span>
            </label>
            <div>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.description)}</p>
            </div>
          </div>
          <div class="content-item-footer">
            <span class="category-badge">${escapeHtml(item.category)}</span>
            <button class="content-action" data-content-id="${item.id}" type="button">${item.type === "PDF" ? "Ansehen" : "Öffnen"}</button>
          </div>
        </article>
      `,
    )
    .join("");

  contentList.querySelectorAll(".completion-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", () => updateCompletion(checkbox));
  });
  contentList.querySelectorAll(".content-action").forEach((button) => {
    button.addEventListener("click", () => {
      window.open(
        `${API_BASE}/content/${button.dataset.contentId}/resource`,
        "_blank",
      );
    });
  });
}

function resetFilters() {
  contentSearch = "";
  selectedCategory = "Alle";
  document.getElementById("content-search").value = "";
  document.querySelectorAll(".category-filter").forEach((item) => {
    item.classList.toggle("active", item.dataset.category === "Alle");
  });
  renderContentItems();
}

async function updateCompletion(checkbox) {
  const contentId = checkbox.dataset.contentId;
  const item = contentItems.find(
    (contentItem) => String(contentItem.id) === contentId,
  );
  const previousValue = item.completed;
  const nextValue = checkbox.checked;
  const errorMessage = document.getElementById("content-error");

  checkbox.disabled = true;

  try {
    const onboardingId = sessionStorage.getItem("onboardingId");
    const response = await fetch(
      `${API_BASE}/onboarding/${onboardingId}/content/${contentId}/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: nextValue }),
      },
    );

    if (!response.ok) {
      throw new Error("Completion request failed");
    }

    item.completed = nextValue;
    errorMessage.textContent = "";
    renderContentItems();
  } catch (error) {
    checkbox.checked = previousValue;
    checkbox.disabled = false;
    errorMessage.textContent = "Inhalt konnte nicht aktualisiert werden.";
  }
}
