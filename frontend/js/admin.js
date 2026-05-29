const API_BASE = "http://localhost:3000";

// --------------------- UTIL ---------------------
async function fetchData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network error");
    return await res.json();
  } catch (err) {
    console.error("Fetch failed:", err);
    return [];
  }
}

// --------------------- USERS ---------------------
async function loadUsers() {
  const users = await fetchData(`${API_BASE}/users`);
  const list = document.getElementById("userList");
  list.innerHTML = "";

  users.forEach(u => {
    const item = document.createElement("li");
    item.className = "list-group-item d-flex justify-content-between align-items-center";
    item.innerHTML = `
      <span>${u.name} - ${u.email}</span>
      <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})">Delete</button>
    `;
    list.appendChild(item);
  });

  document.getElementById("totalUsers").textContent = users.length;
}

async function deleteUser(id) {
  if (!confirm("Delete this user?")) return;
  await fetch(`${API_BASE}/users/${id}`, { method: "DELETE" });
  loadUsers();
}

document.getElementById("addUserForm").addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("userName").value;
  const email = document.getElementById("userEmail").value;
  const password = document.getElementById("userPassword").value;
  await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role: "user" })
  });
  e.target.reset();
  loadUsers();
});

// --------------------- PRACTITIONERS ---------------------
async function loadPractitioners() {
  const practitioners = await fetchData(`${API_BASE}/practitioners`);
  const list = document.getElementById("practitionerList");
  list.innerHTML = "";

  practitioners.forEach(p => {
    const item = document.createElement("li");
    item.className = "list-group-item d-flex justify-content-between align-items-center";
    item.innerHTML = `
      <span>${p.name} - ${p.email}</span>
      <button class="btn btn-sm btn-danger" onclick="deletePractitioner(${p.id})">Delete</button>
    `;
    list.appendChild(item);
  });

  document.getElementById("totalPractitioners").textContent = practitioners.length;
}

async function deletePractitioner(id) {
  if (!confirm("Delete this practitioner?")) return;
  await fetch(`${API_BASE}/practitioners/${id}`, { method: "DELETE" });
  loadPractitioners();
}

document.getElementById("addPractitionerForm").addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("practName").value;
  const email = document.getElementById("practEmail").value;
  const password = document.getElementById("practPassword").value;
  await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role: "practitioner" })
  });
  e.target.reset();
  loadPractitioners();
});

// --------------------- APPOINTMENTS ---------------------
async function loadAppointments() {
  const appointments = await fetchData(`${API_BASE}/admin/appointments`);
  const list = document.getElementById("appointmentList");
  list.innerHTML = "";

  appointments.forEach(a => {
    const item = document.createElement("li");
    item.className = "list-group-item";
    item.textContent = `${a.patient_name} → ${a.practitioner_name}`;
    list.appendChild(item);
  });

  document.getElementById("totalAppointments").textContent = appointments.length;
}

// --------------------- PAYMENTS ---------------------
async function loadPayments() {
  const payments = await fetchData(`${API_BASE}/admin/payments`);
  const list = document.getElementById("paymentList");
  list.innerHTML = "";

  let totalRevenue = 0;
  payments.forEach(p => {
    const item = document.createElement("li");
    item.className = "list-group-item";
    item.textContent = `${p.patient_name} → ${p.practitioner_name} - ₹${parseFloat(p.amount).toFixed(2)}`;
    list.appendChild(item);

    if (p.status === "paid") {
      totalRevenue += parseFloat(p.amount);
    }
  });

  document.getElementById("totalRevenue").textContent = "₹" + totalRevenue.toFixed(2);
}

// --------------------- SECTION SWITCHING ---------------------
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    e.target.classList.add("active");
    const sectionId = e.target.getAttribute("data-section");
    document.querySelectorAll(".dashboard-section").forEach(s => s.classList.remove("active-section"));
    document.getElementById(sectionId).classList.add("active-section");
  });
});

// --------------------- ANALYTICS ---------------------
async function updateAnalytics() {
  const users = await fetchData(`${API_BASE}/users`);
  const practitioners = await fetchData(`${API_BASE}/practitioners`);
  const appointments = await fetchData(`${API_BASE}/admin/appointments`);
  const payments = await fetchData(`${API_BASE}/admin/payments`);

  const totalRevenue = payments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  document.getElementById("totalUsers").textContent = users.length;
  document.getElementById("totalPractitioners").textContent = practitioners.length;
  document.getElementById("totalAppointments").textContent = appointments.length;
  document.getElementById("totalRevenue").textContent = "₹" + totalRevenue.toFixed(2);
}

// --------------------- LOGOUT ---------------------
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// --------------------- INIT ---------------------
window.onload = () => {
  loadUsers();
  loadPractitioners();
  loadAppointments();
  loadPayments();
  updateAnalytics();
};
