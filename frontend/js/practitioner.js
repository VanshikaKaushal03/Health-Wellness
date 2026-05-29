// js/practitioner.js
const API_BASE = "http://localhost:3000";

// --------------------- ROLE CHECK ---------------------
const role = localStorage.getItem("role");
const practitionerId = Number(localStorage.getItem("user_id"));
const practitionerName = localStorage.getItem("name");

if (role !== "practitioner") {
  window.location.href = "login.html";
}

// Display practitioner's name
document.getElementById("practitionerName").textContent = practitionerName || "Practitioner";

// --------------------- LOGOUT ---------------------
document.getElementById("logoutBtn").addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.clear();
  window.location.href = "login.html";
});

// --------------------- SECTION TOGGLE ---------------------
function showSection(sectionId) {
  document.querySelectorAll(".dashboard-section").forEach(sec => (sec.style.display = "none"));
  document.querySelectorAll('.nav-link[data-section]').forEach(link => link.classList.remove("active"));

  const section = document.getElementById(sectionId);
  if (section) section.style.display = "block";

  const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
  if (activeLink) activeLink.classList.add("active");
}

document.querySelectorAll('.nav-link[data-section]').forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const sectionId = link.getAttribute("data-section");
    showSection(sectionId);
  });
});

// --------------------- LOAD APPOINTMENTS ---------------------
async function loadAppointments() {
  try {
    const res = await fetch(`${API_BASE}/appointments/practitioner/${practitionerId}`);
    const data = await res.json();
    const list = document.getElementById("appointmentList");
    list.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      list.innerHTML = "<li class='list-group-item'>No appointments yet</li>";
      return;
    }

    data.forEach(app => {
      // Create li
      const li = document.createElement("li");
      li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-start");

      // Left side: patient name + date/time
      const leftDiv = document.createElement("div");
      const strong = document.createElement("strong");
      strong.innerHTML = `<i class="bi bi-person-circle me-2"></i>${app.full_name}`;
      leftDiv.appendChild(strong);

      const smallDiv = document.createElement("div");
      smallDiv.classList.add("small", "text-muted");
      smallDiv.innerHTML = `<i class="bi bi-calendar3 me-1"></i>${app.appointment_date}
                            <i class="bi bi-clock me-1 ms-2"></i>${app.appointment_time}`;
      leftDiv.appendChild(smallDiv);

      // Right side: video call + notes
      const rightDiv = document.createElement("div");
      rightDiv.classList.add("appointment-actions", "d-flex", "flex-column", "align-items-end");

      const callBtn = document.createElement("button");
      callBtn.classList.add("btn", "btn-sm", "btn-primary", "mb-2", "video-call-btn");
      callBtn.dataset.patient = app.full_name;
      callBtn.innerHTML = `<i class="bi bi-camera-video"></i> Call`;
      rightDiv.appendChild(callBtn);

      const notes = document.createElement("textarea");
      notes.classList.add("form-control", "form-control-sm", "notes-textarea");
      notes.placeholder = "Write notes / suggested medicine...";
      rightDiv.appendChild(notes);

      // Append left and right divs to li
      li.appendChild(leftDiv);
      li.appendChild(rightDiv);

      list.appendChild(li);
    });

    // Video call button click handler
    document.querySelectorAll('.video-call-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const patientName = btn.dataset.patient;
        alert(`Starting video call with ${patientName}...`);
        // TODO: integrate real video call link here
      });
    });

    // Notes textarea change handler
    document.querySelectorAll('.notes-textarea').forEach(textarea => {
      textarea.addEventListener('change', (e) => {
        const note = e.target.value;
        const patientName = e.target.closest('.list-group-item').querySelector('strong').textContent;
        console.log(`Notes for ${patientName}: ${note}`);
        // TODO: save notes to backend
      });
    });

  } catch (err) {
    console.error("Error fetching appointments:", err);
    document.getElementById("appointmentList").innerHTML =
      "<li class='list-group-item text-danger'>Failed to load appointments</li>";
  }
}
  
// --------------------- LOAD REVENUE ---------------------
async function loadRevenue() {
  console.log("Loading revenue...");
  try {
    const res = await fetch(`${API_BASE}/payments/practitioner/${practitionerId}`, {
      cache: "no-store"
    });    
    const data = await res.json();

    const list = document.getElementById("revenueList");
    const totalElem = document.getElementById("totalRevenue");

    if (!data || !data.success || !Array.isArray(data.payments) || data.payments.length === 0) {
      totalElem.textContent = "$0.00";
      list.innerHTML = "<li class='list-group-item'>No payments received yet</li>";
      return;
    }

    // Calculate total revenue dynamically
    const totalRevenue = data.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    totalElem.textContent = `$${totalRevenue.toFixed(2)}`;

    list.innerHTML = "";
    data.payments.forEach(p => {
      const li = document.createElement("li");
      li.classList.add("list-group-item");
      li.textContent = `${p.patient_name} - $${parseFloat(p.amount).toFixed(2)} on ${new Date(
        p.timestamp
      ).toLocaleString()}`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Error fetching revenue:", err);
    document.getElementById("totalRevenue").textContent = "$0.00";
    document.getElementById("revenueList").innerHTML =
      "<li class='list-group-item text-danger'>Failed to load revenue</li>";
  }
}

async function loadPatients() {
  const patientList = document.getElementById('patientList');
  patientList.innerHTML = ''; // clear previous list

  try {
    // Fetch patients for the logged-in practitioner
    const response = await fetch(`${API_BASE}/api/patients/${practitionerId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const patients = await response.json();
    console.log("Fetched patients:", patients); // Debug

    if (!Array.isArray(patients) || patients.length === 0) {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = 'No patients found';
      patientList.appendChild(li);
      return;
    }

    // Populate patient list
    patients.forEach(p => {
      const li = document.createElement('li');
      li.className = 'list-group-item list-group-item-action'; // Bootstrap clickable style
      li.textContent = p.name;
      li.style.cursor = 'pointer';

      // Click to load this patient's medical history
      li.addEventListener('click', () => {
        loadPatientHistory(p.id, p.name); // send patient ID and name
      });

      patientList.appendChild(li);
    });
  } catch (err) {
    console.error('Error fetching patients:', err);

    const li = document.createElement('li');
    li.className = 'list-group-item text-danger';
    li.textContent = 'Failed to load patients';
    patientList.appendChild(li);
  }
}

async function loadPatientHistory(patientId, patientName) {
  const historyCard = document.getElementById('patientHistory');
  const historyList = document.getElementById('historyList');

  historyList.innerHTML = '';
  historyCard.style.display = 'block';

  const practitionerId = localStorage.getItem("user_id");
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    const res = await fetch(`${API_BASE}/api/patient-history/${patientId}/${practitionerId}/${currentDate}`);
    const data = await res.json();

    console.log("Medical history data:", data); // debug

    // Ensure data is an array
    const records = Array.isArray(data) ? data : [];

    if (records.length === 0) {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = 'No medical history found';
      historyList.appendChild(li);
      return;
    }

    records.forEach(record => {
      const li = document.createElement('li');
      li.className = 'list-group-item';

      li.innerHTML = `
        <strong>Date:</strong> ${record.appointment_date} &nbsp; 
        <strong>Time:</strong> ${record.appointment_time} <br>
        <strong>Created on:</strong> ${record.created_at} <br>
        ${record.report_file
          ? `<button class="btn btn-sm btn-primary mt-1 view-report-btn" data-file="${record.report_file}">
               View Report
             </button>`
          : `<span class="text-muted">No report uploaded</span>`
        }
      `;
      historyList.appendChild(li);
    });

    // Attach click events for report buttons
    document.querySelectorAll(".view-report-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        let filePath = e.target.getAttribute("data-file");

        // Ensure proper URL path (replace backslashes on Windows)
        filePath = filePath.replace(/\\/g, "/");

        // Prepend backend URL
        const fullPath = `${API_BASE}${filePath.startsWith("/") ? "" : "/"}${filePath}`;

        const modalBody = document.getElementById("reportModalBody");
        const modalTitle = document.getElementById("reportModalLabel");
        modalTitle.textContent = `Report Preview - ${patientName}`;
        modalBody.innerHTML = `<iframe src="${fullPath}" width="100%" height="500px" style="border:none;"></iframe>`;

        const modal = new bootstrap.Modal(document.getElementById('reportModal'));
        modal.show();
      });
    });

  } catch (err) {
    console.error('Error fetching medical history:', err);
    const li = document.createElement('li');
    li.className = 'list-group-item text-danger';
    li.textContent = 'Failed to load medical history';
    historyList.appendChild(li);
  }
}


// --------------------- INITIAL LOAD ---------------------
window.onload = () => {
  showSection("appointments");
  loadAppointments();
  loadRevenue();
  loadPatients();
};


// --------------------- AUTO REFRESH REVENUE ---------------------
setInterval(loadRevenue, 10000); // refresh every 10 seconds
