import { API_BASE } from "./common.js";

function storeUserSession(user) {
  sessionStorage.setItem("userId", user.id);
  sessionStorage.setItem("username", user.username);
  sessionStorage.setItem("firstName", user.firstName);
  sessionStorage.setItem("lastName", user.lastName);
  sessionStorage.setItem("role", user.role);

  if (user.onboardingId !== null && user.onboardingId !== undefined) {
    sessionStorage.setItem("onboardingId", user.onboardingId);
  } else {
    sessionStorage.removeItem("onboardingId");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const button = document.getElementById("login-button");
  const errorMessage = document.getElementById("error-message");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    errorMessage.textContent = "";
    button.disabled = true;
    button.textContent = "Logging in...";

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
        }),
      });

      if (response.status === 401) {
        errorMessage.textContent = "Username or password is incorrect.";
        return;
      }

      if (!response.ok) {
        errorMessage.textContent = "Backend is not available.";
        return;
      }

      const user = await response.json();
      storeUserSession(user);
      window.location.href =
        user.role === "ADMIN" ? "admin-users.html" : "user-dashboard.html";
    } catch (error) {
      errorMessage.textContent = "Backend is not available.";
    } finally {
      button.disabled = false;
      button.textContent = "Login";
    }
  });
});
