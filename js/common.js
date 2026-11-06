export const API_BASE = "http://localhost:8080/api";

export function requireUser() {
  if (sessionStorage.getItem("role") !== "USER") {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

export function requireAdmin() {
  if (sessionStorage.getItem("role") !== "ADMIN") {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

export function logout() {
  sessionStorage.clear();
  window.location.href = "index.html";
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
