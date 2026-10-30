import { API_BASE, requireUser, logout } from "./common.js";

if (requireUser()) {
  document.getElementById("logout-button").addEventListener("click", logout);
  loadDashboard();
}

async function loadDashboard() {
  const onboardingId = sessionStorage.getItem("onboardingId");
  const dashboardContent = document.getElementById("dashboard-content");

  if (!onboardingId) {
    dashboardContent.innerHTML = "<p>Kein Onboarding gefunden.</p>";
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/onboarding/${onboardingId}/dashboard`,
    );

    if (!response.ok) {
      throw new Error("Dashboard request failed");
    }

    renderDashboard(await response.json());
  } catch (error) {
    document.getElementById("dashboard-error").textContent =
      "Dashboard konnte nicht geladen werden.";
  }
}

function renderDashboard(dashboard) {
  const statusLabels = {
    PREPARED: "Vorbereitet",
    ACTIVE: "Aktiv",
    IN_PROGRESS: "In Bearbeitung",
    COMPLETED: "Abgeschlossen",
  };
  const tags = document.getElementById("dashboard-role-tags");
  const nextContent = dashboard.nextContent;

  document.getElementById("dashboard-title").textContent =
    `Willkommen, ${dashboard.firstName}`;
  document.getElementById("dashboard-function").textContent =
    dashboard["function"];
  document.getElementById("dashboard-completed").textContent =
    `${dashboard.completed} von ${dashboard.totalRelevant} erledigt`;
  document.getElementById("dashboard-progress-percentage").textContent =
    `${dashboard.progressPercentage} %`;
  document.getElementById("dashboard-progress-bar").style.width =
    `${dashboard.progressPercentage}%`;
  document.getElementById("dashboard-buddy").textContent =
    dashboard.buddy || "-";
  document.getElementById("dashboard-status").textContent =
    statusLabels[dashboard.status] || dashboard.status;
  tags.innerHTML = (dashboard.roleTags || [])
    .map((tag) => `<span class="tag-badge">${escapeHtml(tag)}</span>`)
    .join("");

  const details = document.getElementById("next-content-details");
  if (!nextContent) {
    details.innerHTML = "<p>Kein nächster Inhalt verfügbar.</p>";
    return;
  }

  details.innerHTML = `
    <h4>${escapeHtml(nextContent.title)}</h4>
    <p>${escapeHtml(nextContent.description)}</p>
    <p class="content-category">${escapeHtml(nextContent.category)}</p>
    <button id="next-content-button" class="content-action" type="button">${nextContent.type === "PDF" ? "Ansehen" : "Öffnen"}</button>
  `;

  document
    .getElementById("next-content-button")
    .addEventListener("click", () => {
      if (nextContent.type === "PDF") {
        console.log("Open PDF", nextContent.id);
      } else if (nextContent.type === "LINK") {
        window.open(`${API_BASE}/content/${nextContent.id}/resource`, "_blank");
      }
    });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
