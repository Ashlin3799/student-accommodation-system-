// Logout Functionality
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login.html";
}

// Dynamic Fetch for Applications List
async function fetchApplications() {
  try {
    const response = await fetch('/api/admin/applications');
    const result = await response.json();
    const container = document.getElementById('applications-list');
    
    if (result.success && result.data.length > 0) {
      container.innerHTML = result.data.map(app => `
        <div class="app-card" id="app-${app.id}">
          <h3>${app.studentName}</h3>
          <p><strong>Room Requested:</strong> ${app.roomRequested}</p>
          <p><strong>Date Submitted:</strong> ${app.date}</p>
          <p><strong>Status:</strong> <span class="badge-${app.status.toLowerCase()}">${app.status}</span></p>
          
          ${app.status === 'Pending' ? `
            <div style="margin-top: 10px;">
              <button onclick="updateStatus('${app.id}', 'Approved')" style="background:#22c55e; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; margin-right:8px;">Approve</button>
              <button onclick="updateStatus('${app.id}', 'Rejected')" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">Reject</button>
            </div>
          ` : ''}
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p>No pending applications found.</p>';
    }
  } catch (err) {
    console.error('Error fetching applications:', err);
    document.getElementById('applications-list').innerHTML = '<p style="color: red;">Failed to load applications.</p>';
  }

  // Function to open modal with full info
function showDetails(appId) {
  // Finding app locally (or fetch via GET /api/admin/applications/:id later)
  const app = currentApplications.find(item => item.id === appId);
  if (!app) return;

  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <p><strong>Student Name:</strong> ${app.studentName}</p>
    <p><strong>Requested Room:</strong> ${app.roomRequested}</p>
    <p><strong>Date Submitted:</strong> ${app.date}</p>
    <p><strong>Status:</strong> ${app.status}</p>
    <p><strong>Email:</strong> student@example.com</p>
    <p><strong>Contact:</strong> +1 234 567 890</p>
  `;

  document.getElementById('detailsModal').style.display = 'flex';
}
// Function to close modal
function closeModal() {
  document.getElementById('detailsModal').style.display = 'none';
}

}


// Handle Approve / Reject Actions
async function updateStatus(applicationId, newStatus) {
  try {
    const response = await fetch(`/api/admin/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await response.json();
    if (result.success) {
      alert(`Application ${newStatus} successfully!`);
      fetchApplications(); // Reload UI
    } else {
      alert('Failed to update status');
    }
  } catch (err) {
    console.error('Error updating status:', err);
  }
}

// Automatically load applications when page visits
fetchApplications();