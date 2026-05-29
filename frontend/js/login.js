// frontend/js/login.js
const API_BASE = "http://localhost:3000";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get form values
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  // Simple validation
  if (!email || !password || !role) {
    showMessage("All fields are required", "danger");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
    });

    const data = await res.json();

    if (data.success) {
      // Save user info in localStorage
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);
      localStorage.setItem("token", data.token);


      // Redirect based on role
      if (role === "admin") window.location.href = "admin.html";
      else if (role === "practitioner") window.location.href = "practitioner.html";
      else window.location.href = "index.html";
    } else {
      showMessage(data.message || "Login failed", "danger");
    }
  } catch (err) {
    console.error(err);
    showMessage("Server error. Try again later.", "danger");
  }
});

// Function to show message in login.html
function showMessage(msg, type = "success") {
  const msgDiv = document.getElementById("loginMsg");
  msgDiv.textContent = msg;
  msgDiv.className = `mt-3 text-${type}`;
}
