// Logout Functionality
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login.html";
}

let currentApplications = [];

// Dynamic Fetch for Applications List
async function fetchApplications() {
  try {
    const response = await fetch("/api/applications");
    const result = await response.json();
    const container = document.getElementById("applications-list");

    // Handle plain array response or wrapped object
    const applications = Array.isArray(result) ? result : result.data || [];

    if (applications.length > 0) {
      currentApplications = applications;

      container.innerHTML = applications
        .map((app) => {
          const rawStatus = app.status || "pending";
          const isPending = (app.status || "").toLowerCase() === "pending";
          const roomName = app.roomTitle || app.room || "Standard Room";
          const studentName = app.studentName || app.name || "Jane Doe";
          const dateStr = app.createdAt
            ? new Date(app.createdAt).toLocaleDateString()
            : "N/A";

return `
          <div class="app-card" id="app-${app._id}" style="border:1px solid #e5e7eb; padding:16px; margin-bottom:12px; border-radius:8px; background:white; position:relative; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h3 style="margin:0; font-size:1.1rem; font-weight:700;">${escapeHtml(studentName)}</h3>
                <span style="${
                  rawStatus.toLowerCase() === "approved"
                    ? "background:#dcfce7; color:#15803d;"
                    : rawStatus.toLowerCase() === "rejected"
                    ? "background:#fee2e2; color:#b91c1c;"
                    : "background:#fef3c7; color:#b45309;"
                } padding:3px 10px; border-radius:12px; font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:0.02em;">${escapeHtml(rawStatus)}</span>
              </div>

              <p style="margin:4px 0;"><strong>Room:</strong> ${escapeHtml(roomName)}</p>
              <p style="margin:4px 0;"><strong>Date Submitted:</strong> ${dateStr}</p>
            </div>

            <div>
              ${
                isPending
                  ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;"> 
                  <button onclick="updateStatus('${app._id}', 'Approved')" style="background:#28a745; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer; font-weight:600;">Approve</button> 
                  <button onclick="updateStatus('${app._id}', 'Rejected')" style="background:#dc3545; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer; font-weight:600;">Reject</button> 
              </div> 
              `
                  : ""
              }
              <button onclick="showDetails('${app._id}')" style="margin-top:10px; width:100%; background:#14403f; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer; font-weight:600;">View Details</button>
            </div>
          </div>
        `;
        })
        .join("");
    } else {
      currentApplications = [];
      container.innerHTML = "<p>No applications found.</p>";
    }
  } catch (err) {
    console.error("Error fetching applications:", err);
    document.getElementById("applications-list").innerHTML =
      '<p style="color: red;">Failed to load applications.</p>';
  }
}

// Function to open modal with full info & actions
function showDetails(appId) {
  const app = currentApplications.find((item) => item._id === appId);
  if (!app) return;

  const rawStatus = app.status || "pending";
  const isPending = rawStatus.toLowerCase() === "pending";
  const modalBody = document.getElementById("modalBody");
  const studentEmail = app.studentEmail || (app.user && app.user.email) || "N/A";

  modalBody.innerHTML = `
    <p><strong>Student ID:</strong> ${escapeHtml(app.studentId || app.user || "s98765432")}</p>
    <p><strong>Student Name:</strong> ${escapeHtml(app.studentName || app.name || "Jane Doe")}</p>
    <p><strong>Student Email:</strong> ${escapeHtml(studentEmail)}</p>
    <p><strong>Requested Room:</strong> ${escapeHtml(app.roomTitle || app.room || "Standard Room")}</p>
    <p><strong>Date Submitted:</strong> ${app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}</p>
    <p><strong>Status:</strong> <span style="text-transform:capitalize;">${escapeHtml(rawStatus)}</span></p>
    
    ${
      isPending
        ? `
      <div style="margin-top: 16px; border-top: 1px solid #eee; padding-top: 12px;">
        <button onclick="updateStatus('${app._id}', 'Approved')" style="background:#22c55e; color:white; border:none; padding:8px 16px; border-radius:4px; cursor:pointer; margin-right:8px;">Approve Application</button>
        <button onclick="updateStatus('${app._id}', 'Rejected')" style="background:#ef4444; color:white; border:none; padding:8px 16px; border-radius:4px; cursor:pointer;">Reject Application</button>
      </div>
    `
        : ""
    }
  `;

  document.getElementById("detailsModal").style.display = "flex";
}

// Function to close modal
function closeModal() {
  document.getElementById("detailsModal").style.display = "none";
}

// Handle Approve / Reject Actions (Supports PATCH and PUT routes)
async function updateStatus(applicationId, newStatus) {
  try {
    let response = await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    // Fallback to PUT if route is configured as PUT in express
    if (!response.ok && response.status === 404) {
      response = await fetch(`/api/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    }

    const result = await response.json();
    if (response.ok) {
      alert(`Application ${newStatus} successfully!`);
      closeModal();
      fetchApplications(); // Reload UI
    } else {
      alert(result.error || result.message || "Failed to update status");
    }
  } catch (err) {
    console.error("Error updating status:", err);
    alert("Server error updating status.");
  }
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

// Automatically load applications when page visits
fetchApplications();

// Automatically poll the server every 3 seconds for new applications
setInterval(() => {
  fetchApplications();
}, 3000);
