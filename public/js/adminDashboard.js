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
    const response = await fetch('/api/applications');
    const result = await response.json();
    const container = document.getElementById('applications-list');

    // routes/applications.js returns a plain array, not { success, data }
    const applications = Array.isArray(result) ? result : (result.data || []);

    if (applications.length > 0) {
      currentApplications = applications;

      container.innerHTML = applications.map(app => `
        <div class="app-card" id="app-${app._id}">
          <h3>${escapeHtml(app.studentName)}</h3>
          <p><strong>Room Requested:</strong> ${escapeHtml(app.roomTitle)}</p>
          <p><strong>Date Submitted:</strong> ${new Date(app.createdAt).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span class="badge-${app.status.toLowerCase()}">${app.status}</span></p>

          ${app.status === 'Pending' ? `
            <div style="margin-top: 10px;">
              <button onclick="updateStatus('${app._id}', 'Approved')" style="background:#22c55e; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; margin-right:8px;">Approve</button>
              <button onclick="updateStatus('${app._id}', 'Rejected')" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">Reject</button>
            </div>
          ` : ''}
          <button onclick="showDetails('${app._id}')" style="margin-top:8px; background:#14403f; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">View Details</button>
        </div>
      `).join('');
    } else {
      currentApplications = [];
      container.innerHTML = '<p>No applications found.</p>';
    }
  } catch (err) {
    console.error('Error fetching applications:', err);
    document.getElementById('applications-list').innerHTML = '<p style="color: red;">Failed to load applications.</p>';
  }
}

// Function to open modal with full info
function showDetails(appId) {
  const app = currentApplications.find(item => item._id === appId);
  if (!app) return;

  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <p><strong>Student ID:</strong> ${escapeHtml(app.studentId)}</p>
    <p><strong>Student Name:</strong> ${escapeHtml(app.studentName)}</p>
    <p><strong>Requested Room:</strong> ${escapeHtml(app.roomTitle)}</p>
    <p><strong>Date Submitted:</strong> ${new Date(app.createdAt).toLocaleDateString()}</p>
    <p><strong>Status:</strong> ${app.status}</p>
  `;

  document.getElementById('detailsModal').style.display = 'flex';
}

// Function to close modal
function closeModal() {
  document.getElementById('detailsModal').style.display = 'none';
}

// Handle Approve / Reject Actions
async function updateStatus(applicationId, newStatus) {
  try {
    const response = await fetch(`/api/applications/${applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await response.json();
    if (response.ok) {
      alert(`Application ${newStatus} successfully!`);
      fetchApplications(); // Reload UI
    } else {
      alert(result.error || 'Failed to update status');
    }
  } catch (err) {
    console.error('Error updating status:', err);
  }
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = String(value ?? '');
  return div.innerHTML;
}

// Automatically load applications when page visits
fetchApplications();
